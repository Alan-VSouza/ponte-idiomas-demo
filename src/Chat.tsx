import { Fragment, useEffect, useRef, useState } from 'react'
import { formatarData, lerAgendamentos, salvarAgendamento, salvarTransferencia } from './store'

type Msg = { role: 'user' | 'assistente'; texto: string; aviso?: string }

const SUGESTOES = ['Quero inglês à noite, sou iniciante', 'Vou fazer intercâmbio, tem preparatório de TOEFL?', 'Quanto custa a mensalidade?', 'Não sei meu nível de inglês', 'Falar com a secretaria']

const BOAS_VINDAS: Msg = {
  role: 'assistente',
  texto: 'Oi, eu sou a **Duda**, da Ponte Idiomas. Me conta qual idioma você quer aprender e para quê (trabalho, viagem, intercâmbio) que eu te mostro a turma certa e marco uma aula experimental grátis.',
}

/** Renderiza **negrito** e listas com "- " sem usar HTML vindo da IA. */
function Texto({ t }: { t: string }) {
  const linhas = t.split('\n')
  const bloco: JSX.Element[] = []
  let lista: string[] = []
  const inline = (s: string, k: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={k + i}>{p.slice(2, -2)}</strong> : <Fragment key={k + i}>{p}</Fragment>))
  const fecharLista = (k: string) => {
    if (lista.length) bloco.push(<ul key={'ul' + k}>{lista.map((l, i) => <li key={i}>{inline(l, k + 'l' + i)}</li>)}</ul>)
    lista = []
  }
  linhas.forEach((l, i) => {
    const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/)
    if (m) return void lista.push(m[1])
    fecharLista(String(i))
    if (l.trim()) bloco.push(<p key={i}>{inline(l, String(i))}</p>)
  })
  fecharLista('fim')
  return <>{bloco}</>
}

export function focarChat() {
  document.querySelector<HTMLTextAreaElement>('.chat-entrada textarea')?.focus({ preventScroll: true })
}

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([BOAS_VINDAS])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const listaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = listaRef.current
    // Na abertura (só a boas-vindas) fica no topo; depois acompanha a última mensagem.
    if (el && msgs.length > 1) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, enviando])

  useEffect(() => {
    const ouvir = (e: Event) => enviarRef.current((e as CustomEvent<string>).detail)
    window.addEventListener('chat-enviar', ouvir)
    return () => window.removeEventListener('chat-enviar', ouvir)
  }, [])

  async function enviar(conteudo: string) {
    const t = conteudo.trim().slice(0, 600)
    if (!t || enviando) return
    const novas: Msg[] = [...msgs, { role: 'user', texto: t }]
    setMsgs(novas)
    setTexto('')
    setEnviando(true)
    try {
      const agendados = lerAgendamentos().map((a) => `${a.data} ${a.hora}`)
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mensagens: novas.slice(1).map(({ role, texto }) => ({ role, texto })), agendados }),
      })
      const dados = await r.json().catch(() => ({}))
      let aviso: string | undefined
      for (const a of dados.acoes || []) {
        const criadoEm = new Date().toISOString()
        if (a.tipo === 'agendamento') {
          salvarAgendamento({ ...a, criadoEm })
          aviso = `Aula experimental marcada: ${a.servico}, ${formatarData(a.data)} às ${a.hora} · protocolo ${a.protocolo}`
        }
        if (a.tipo === 'transferencia') {
          salvarTransferencia({ motivo: a.motivo, resumo: a.resumo, criadoEm })
          aviso = 'Conversa enviada para a secretaria'
        }
      }
      setMsgs((m) => [...m, { role: 'assistente', texto: dados.resposta || 'Não consegui responder agora. Tente de novo em instantes.', aviso }])
    } catch {
      setMsgs((m) => [...m, { role: 'assistente', texto: 'Estou sem conexão no momento. Tente de novo em instantes.' }])
    } finally {
      setEnviando(false)
    }
  }

  const enviarRef = useRef(enviar)
  enviarRef.current = enviar
  const mostrarSugestoes = msgs.length <= 2 && !enviando

  return (
    <div className="chat" role="region" aria-label="Conversa com a Duda, assistente da Ponte Idiomas">
      <div className="chat-topo">
        <div className="avatar" aria-hidden="true">D</div>
        <div>
          <strong>Duda</strong>
          <span className="status"><i /> online agora · turmas e aula experimental</span>
        </div>
      </div>

      <div className="chat-msgs" role="log" aria-live="polite" ref={listaRef}>
        {msgs.map((m, i) => (
          <div key={i} className={'msg ' + m.role}>
            <div className="bolha"><Texto t={m.texto} /></div>
            {m.aviso && <div className="aviso">✓ {m.aviso}</div>}
          </div>
        ))}
        {enviando && (
          <div className="msg assistente">
            <div className="bolha digitando" aria-label="Digitando"><span /><span /><span /></div>
          </div>
        )}
        {mostrarSugestoes && (
          <div className="sugestoes">
            {SUGESTOES.map((s) => (
              <button key={s} onClick={() => enviar(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <form
        className="chat-entrada"
        onSubmit={(e) => {
          e.preventDefault()
          enviar(texto)
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={texto}
          maxLength={600}
          placeholder="Escreva sua mensagem..."
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              enviar(texto)
            }
          }}
        />
        <button type="submit" disabled={!texto.trim() || enviando} aria-label="Enviar">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5z" fill="currentColor" /></svg>
        </button>
      </form>
      <p className="chat-rodape">Demonstração com escola fictícia. Não envie dados pessoais.</p>
    </div>
  )
}
