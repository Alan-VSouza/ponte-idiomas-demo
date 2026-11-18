import { CLINICA, TURMAS, buscarTurmas, proximasAulas, textoClinica } from './clinica.js'

// Assistente virtual do negócio fictício. A IA (Google Gemini) só interpreta e redige;
// horários e agendamentos são consultados e validados aqui no servidor.

type Msg = { role: 'user' | 'assistente'; texto: string }
type Acao =
  | { tipo: 'agendamento'; protocolo: string; servico: string; data: string; hora: string; nome: string }
  | { tipo: 'transferencia'; motivo: string; resumo: string }

// Usa a API do Google direto. No Netlify, o AI Gateway também pode injetar GOOGLE_GEMINI_BASE_URL.
const BASE = (process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '')
// Modelos tentados em ordem; o primeiro aceito fica guardado enquanto a função estiver quente.
// O "lite" vem primeiro: no plano grátis do Google é o que responde rápido e sem limite apertado.
const CANDIDATOS = [process.env.GEMINI_MODEL, 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3-flash-preview'].filter(Boolean) as string[]
let modeloOk: string | null = null
const MAX_MSGS = 30
const MAX_CHARS = 600

// Limite simples por IP (por instância da função) para a demo pública não ser abusada.
const uso = new Map<string, number[]>()
function limitado(ip: string) {
  const agora = Date.now()
  const janela = (uso.get(ip) || []).filter((t) => agora - t < 10 * 60_000)
  janela.push(agora)
  uso.set(ip, janela)
  return janela.length > 40
}

function hojeSP() {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function instrucoes() {
  return `Você é a ${CLINICA.assistente}, assistente virtual da ${CLINICA.nome}, uma ${CLINICA.tipo} em São Carlos. Atenda pelo chat do site, em português do Brasil, com energia, simpatia e objetividade. Se a pessoa escrever em inglês ou espanhol, responda no mesmo idioma.

Agora é ${hojeSP()} (horário de Brasília).

INFORMAÇÕES DA ESCOLA (a única fonte que você pode usar):
${textoClinica()}

REGRAS:
- Responda de forma curta: no máximo 3 frases ou uma lista curta.
- Descubra o objetivo (trabalho, viagem, intercâmbio, mestrado, prova como TOEFL) e o nível. Se a pessoa não souber o nível, faça um mini nivelamento com no máximo 2 perguntas simples no idioma (por exemplo, "How long have you been studying English?") e sugira o nível provável, lembrando que o teste oficial é na aula experimental.
- Para turmas, horários e vagas, SEMPRE chame ver_turmas. Mostre no máximo 3 turmas, com dias, horário, formato e vagas. Turma com 0 vagas: ofereça lista de espera (transferir_para_secretaria) ou aula particular.
- Para marcar a aula experimental gratuita: confirme a turma, uma das datas que a ferramenta devolver e o primeiro nome, e chame agendar_aula_experimental.
- Não peça CPF, telefone, e-mail nem outros dados pessoais (é uma demonstração).
- Use SOMENTE as informações acima. Nunca invente preço, desconto, turma, professor, data ou garantia de aprovação em prova.
- Se a pessoa pedir atendente humano, quiser negociar valor, cancelar contrato, reclamar, ou o assunto fugir do que você sabe, chame transferir_para_secretaria.
- Se perguntarem se você é uma IA ou se a escola é real: diga que é uma assistente de IA de demonstração e que a escola é fictícia, criada por Alan Souza para mostrar como funciona um atendimento com IA.
- Pode usar **negrito** para valores, dias e horários. Não use títulos.`
}

const FERRAMENTAS = [
  {
    functionDeclarations: [
      {
        name: 'ver_turmas',
        description: 'Lista turmas com dias, horários, formato, vagas e as próximas datas de aula. Use sempre antes de citar turma ou horário.',
        parameters: {
          type: 'OBJECT',
          properties: {
            idioma: { type: 'STRING', description: 'Inglês, Espanhol, Francês ou Alemão.' },
            nivel: { type: 'STRING', description: 'Básico 1, Básico 2, Intermediário 1, Intermediário 2 ou Avançado.' },
            periodo: { type: 'STRING', enum: ['manha', 'tarde', 'noite', 'sabado'] },
            formato: { type: 'STRING', enum: ['Presencial', 'Online'] },
          },
        },
      },
      {
        name: 'agendar_aula_experimental',
        description: 'Marca a aula experimental gratuita numa turma e data que a pessoa confirmou.',
        parameters: {
          type: 'OBJECT',
          properties: {
            turma_id: { type: 'STRING', enum: TURMAS.map((t) => t.id) },
            data: { type: 'STRING', description: 'AAAA-MM-DD, uma das próximas datas da turma' },
            nome: { type: 'STRING', description: 'Primeiro nome' },
          },
          required: ['turma_id', 'data', 'nome'],
        },
      },
      {
        name: 'transferir_para_secretaria',
        description: 'Encaminha a conversa para a secretaria (pessoa de verdade).',
        parameters: {
          type: 'OBJECT',
          properties: {
            motivo: { type: 'STRING' },
            resumo: { type: 'STRING', description: 'Resumo curto do que a pessoa quer' },
          },
          required: ['motivo', 'resumo'],
        },
      },
    ],
  },
]

function executar(nome: string, args: any, ocupados: string[], acoes: Acao[]) {
  if (nome === 'ver_turmas') {
    const lista = buscarTurmas(args || {}).map((t) => ({ ...t, proximas_aulas: proximasAulas(t) }))
    return { encontradas: lista.length, turmas: lista.slice(0, 5), observacao: lista.length ? undefined : 'Nenhuma turma com esses filtros.' }
  }
  if (nome === 'agendar_aula_experimental') {
    const turma = TURMAS.find((t) => t.id === args?.turma_id)
    if (!turma) return { ok: false, erro: 'Turma inválida.' }
    if (turma.vagas <= 0) return { ok: false, erro: 'Turma sem vagas. Ofereça lista de espera ou aula particular.' }
    const datas = proximasAulas(turma)
    if (!datas.includes(args?.data)) return { ok: false, erro: 'Essa data não é dia de aula dessa turma.', datas_validas: datas }
    const chave = `${args.data} ${turma.id}`
    if (ocupados.includes(chave)) return { ok: false, erro: 'Já existe uma aula experimental marcada para essa turma nesse dia.' }
    const aluno = String(args?.nome || '').trim().split(/\s+/)[0]?.slice(0, 30) || 'Aluno'
    const protocolo = 'PI' + Math.random().toString(36).slice(2, 7).toUpperCase()
    const hora = turma.horario.split(' ')[0].replace('h', ':').padEnd(5, '0').replace(/^(\d):/, '0$1:')
    ocupados.push(chave)
    acoes.push({ tipo: 'agendamento', protocolo, servico: `Aula experimental · ${turma.idioma} ${turma.nivel} (${turma.formato})`, data: args.data, hora, nome: aluno })
    return { ok: true, protocolo, turma: turma.id, data: args.data, horario: turma.horario, formato: turma.formato, nome: aluno, lembrete: 'Chegar 15 minutos antes para o teste de nivelamento.' }
  }
  if (nome === 'transferir_para_secretaria') {
    acoes.push({ tipo: 'transferencia', motivo: String(args?.motivo || '').slice(0, 200), resumo: String(args?.resumo || '').slice(0, 300) })
    return { ok: true, mensagem: 'Conversa enviada para a secretaria. Em horário comercial, alguém responde em poucos minutos.' }
  }
  return { ok: false, erro: 'Ferramenta desconhecida.' }
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json; charset=utf-8' } })
}

export async function atender(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ erro: 'Use POST.' }, 405)
  const chave = process.env.GEMINI_API_KEY
  if (!chave) return json({ resposta: 'A assistente está em manutenção no momento. Tente de novo mais tarde.', acoes: [] })

  const ip = req.headers.get('x-real-ip') || req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim()
  if (limitado(ip)) return json({ resposta: 'Muitas mensagens em pouco tempo. Aguarde alguns minutos e tente de novo.', acoes: [] }, 429)

  let corpo: { mensagens?: Msg[]; agendados?: string[] }
  try {
    corpo = await req.json()
  } catch {
    return json({ erro: 'JSON inválido.' }, 400)
  }
  const mensagens = (corpo.mensagens || []).slice(-MAX_MSGS).filter((m) => m && typeof m.texto === 'string' && (m.role === 'user' || m.role === 'assistente'))
  if (!mensagens.length || mensagens[mensagens.length - 1].role !== 'user') return json({ erro: 'Envie a mensagem do usuário.' }, 400)
  const ocupados = (corpo.agendados || []).filter((s) => typeof s === 'string').slice(0, 50)

  const contents: any[] = mensagens.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.texto.slice(0, MAX_CHARS) }] }))
  const acoes: Acao[] = []

  for (let passo = 0; passo < 5; passo++) {
    const corpoReq = JSON.stringify({
      systemInstruction: { parts: [{ text: instrucoes() }] },
      contents,
      tools: FERRAMENTAS,
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    })
    const fila = modeloOk ? [modeloOk, ...CANDIDATOS.filter((m) => m !== modeloOk)] : CANDIDATOS
    const chamar = async (modelo: string, ms: number, cancelar?: AbortSignal): Promise<Response> => {
      try {
        const sinais = [AbortSignal.timeout(ms), ...(cancelar ? [cancelar] : [])]
        const resp = await fetch(`${BASE}/v1beta/models/${modelo}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
          body: corpoReq,
          signal: AbortSignal.any(sinais),
        })
        if (!resp.ok) console.log('MODELO_FALHOU ' + modelo + ' ' + resp.status + ' ' + (await resp.clone().text()).slice(0, 160).replace(/\s+/g, ' '))
        return resp
      } catch {
        return new Response('{}', { status: 504 })
      }
    }

    // Um modelo por vez (chamadas em paralelo gastam o dobro da cota grátis do Google).
    // Se um estiver sobrecarregado, sem cota ou travado, passa para o próximo.
    let r: Response = new Response('{}', { status: 504 })
    for (const modelo of fila) {
      r = await chamar(modelo, 8000)
      if (r.ok) {
        modeloOk = modelo
        break
      }
      if (r.status >= 500 || r.status === 429) continue
      const txt = await r.clone().text()
      if (!/unknown_model|not found|suitable provider|not supported|no longer available/i.test(txt)) break
    }
    if (!r.ok) {
      console.log('ERRO_GEMINI status=' + r.status + ' corpo=' + (await r.text()).slice(0, 300).replace(/\s+/g, ' '))
      const msg = r.status === 429 ? 'A demonstração atingiu o limite de uso por agora. Tente de novo em alguns minutos.' : 'Tive um problema para responder agora. Pode tentar de novo?'
      return json({ resposta: msg, acoes })
    }
    const dados: any = await r.json()
    const partes: any[] = dados?.candidates?.[0]?.content?.parts || []
    const chamadas = partes.filter((p) => p.functionCall)
    if (!chamadas.length) {
      const texto = partes.map((p) => p.text || '').join('').trim()
      return json({ resposta: texto || 'Desculpe, não entendi. Pode reformular?', acoes })
    }
    contents.push({ role: 'model', parts: partes })
    contents.push({
      role: 'user',
      parts: chamadas.map((p) => ({
        functionResponse: { name: p.functionCall.name, response: executar(p.functionCall.name, p.functionCall.args, ocupados, acoes) },
      })),
    })
  }
  return json({ resposta: 'Desculpe, me enrolei aqui. Pode repetir o que precisa?', acoes })
}

