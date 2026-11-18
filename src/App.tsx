import { useEffect } from 'react'
import Chat, { focarChat } from './Chat'
import { CLINICA, TURMAS } from '../shared/clinica'

function irParaChat(e?: React.MouseEvent) {
  e?.preventDefault()
  document.getElementById('atendimento')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(focarChat, 450)
}

function perguntar(texto: string) {
  document.getElementById('atendimento')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.dispatchEvent(new CustomEvent('chat-enviar', { detail: texto }))
}

const IDIOMAS = [
  { nome: 'Inglês', ola: 'Hello', cor: 'tomate' },
  { nome: 'Espanhol', ola: 'Hola', cor: 'ceu' },
  { nome: 'Francês', ola: 'Bonjour', cor: 'tinta' },
  { nome: 'Alemão', ola: 'Hallo', cor: 'creme' },
]

export default function App() {
  useEffect(() => {
    const alvo = document.getElementById('atendimento')
    if (!alvo || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(([e]) => document.body.classList.toggle('chat-visivel', e.isIntersecting), { threshold: 0.15 })
    obs.observe(alvo)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <p className="aviso-demo">
        Site de demonstração: a Ponte Idiomas não existe. A assistente de IA é real. <a href="#para-empresas">Entenda</a>
      </p>

      <header className="topo">
        <a className="marca" href="/" aria-label="Ponte Idiomas, início">
          <span className="marca-arco" aria-hidden="true" />
          <span className="marca-nome">ponte<b>idiomas</b></span>
        </a>
        <nav aria-label="Seções">
          <a href="#turmas">Turmas</a>
          <a href="#precos">Preços</a>
          <a href="#intercambio">Intercâmbio</a>
        </nav>
        <a className="btn" href="#atendimento" onClick={irParaChat}>Aula grátis</a>
      </header>

      <section className="hero">
        <div className="hero-texto">
          <ul className="olas" aria-hidden="true">
            {IDIOMAS.map((i) => <li key={i.nome} className={i.cor}>{i.ola}</li>)}
          </ul>
          <h1>Fale outro idioma<br />de verdade. <span>Comece esta semana.</span></h1>
          <p className="lead">A Duda descobre seu nível em duas perguntas, mostra as turmas com vaga no seu horário e marca sua aula experimental grátis. A 5 minutos da USP.</p>
          <div className="hero-acoes">
            {IDIOMAS.map((i) => (
              <button key={i.nome} onClick={() => perguntar(`Quero aprender ${i.nome.toLowerCase()}. Quais turmas vocês têm?`)}>{i.nome}</button>
            ))}
          </div>
          <img className="hero-foto" src="/img/conversa.jpg" alt="Estudantes conversando e rindo numa sala de aula" />
        </div>
        <div className="hero-chat" id="atendimento">
          <Chat />
        </div>
      </section>

      <section id="turmas" className="quadro">
        <div className="quadro-dentro">
          <div className="quadro-cabeca">
            <h2>Quadro de turmas</h2>
            <p>Até 8 alunos por turma · 2 aulas de 1h30 por semana · vagas atualizadas</p>
          </div>
          <div className="tabela-rolagem">
            <table className="tabela-turmas">
              <thead>
                <tr><th scope="col">Idioma e nível</th><th scope="col">Dias</th><th scope="col">Horário</th><th scope="col">Formato</th><th scope="col">Vagas</th><th scope="col"><span className="so-leitor">Ação</span></th></tr>
              </thead>
              <tbody>
                {TURMAS.map((t) => (
                  <tr key={t.id}>
                    <th scope="row"><strong>{t.idioma}</strong> {t.nivel}</th>
                    <td data-horario={t.horario}>{t.dias}</td>
                    <td>{t.horario}</td>
                    <td>{t.formato}</td>
                    <td><span className={'vagas' + (t.vagas === 0 ? ' esgotada' : t.vagas <= 2 ? ' poucas' : '')}>{t.vagas === 0 ? 'lista de espera' : `${t.vagas} ${t.vagas === 1 ? 'vaga' : 'vagas'}`}</span></td>
                    <td><button onClick={() => perguntar(t.vagas === 0 ? `Quero entrar na lista de espera da turma ${t.id}` : `Quero uma aula experimental na turma ${t.id}`)}>{t.vagas === 0 ? 'Avisar vaga' : 'Aula grátis'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <main>
        <section id="precos" className="bloco precos">
          <div>
            <h2>Preço claro,<br />sem pegadinha.</h2>
            <p className="lead escuro">{CLINICA.precos}</p>
            <p className="nota">{CLINICA.politica}</p>
          </div>
          <div className="cartoes">
            <div className="cartao tomate"><span>Turma em grupo</span><strong>R$ 349<small>/mês</small></strong><p>Até 8 alunos, 3h por semana</p></div>
            <div className="cartao ceu"><span>Estudante USP, UFSCar e IFSP</span><strong>15%<small> off</small></strong><p>Na mensalidade, com comprovante</p></div>
            <div className="cartao tinta"><span>Aula particular</span><strong>R$ 120<small>/hora</small></strong><p>Pacote de 8 horas por R$ 880</p></div>
          </div>
        </section>

        <section id="intercambio" className="bloco intercambio">
          <img src="/img/aluna.jpg" alt="Estudante sorrindo com um livro na mão em sala de aula" loading="lazy" />
          <div>
            <h2>Vai para fora?<br />A gente prepara.</h2>
            <p className="lead escuro">{CLINICA.certificados}</p>
            <p className="nota">{CLINICA.nivelamento}</p>
            <button className="btn" onClick={() => perguntar('Vou fazer intercâmbio. Como funciona o preparatório de TOEFL e IELTS?')}>Perguntar sobre o preparatório</button>
            <p className="endereco">{CLINICA.endereco}</p>
            <p className="nota">{CLINICA.horarios}</p>
          </div>
        </section>
      </main>

      <section id="para-empresas" className="empresas">
        <div className="empresas-dentro">
          <p className="etiqueta">Para escolas de idiomas, cursos e autoescolas</p>
          <h2>Esta escola não existe.<br /><span>A Duda, sim.</span></h2>
          <p className="lead">Uma assistente de IA feita para a sua escola. Atende no site e no WhatsApp a qualquer hora, descobre o nível e o objetivo do aluno, mostra as turmas com vaga e marca a aula experimental, que é onde a matrícula acontece.</p>
          <ul className="empresas-lista">
            <li><strong>Interessado vira aluno.</strong>Quem pergunta às 22h já sai com aula experimental marcada, antes de procurar outra escola.</li>
            <li><strong>Só turma com vaga.</strong>Horários, vagas e preços vêm do seu cadastro. Turma cheia vira lista de espera, não promessa.</li>
            <li><strong>Secretaria no controle.</strong>Aulas experimentais e pedidos de atendimento chegam num painel. <a href="/painel">Veja o painel desta demo</a>.</li>
          </ul>
          <a className="btn claro" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">Quero uma assistente assim</a>
          <p className="assinatura">Projeto de Alan Souza, desenvolvedor de IA em São Carlos.</p>
        </div>
      </section>

      <footer className="rodape">Ponte Idiomas é um negócio fictício criado para demonstração. Fotos: Unsplash.</footer>

      <a className="flutuante" href="#atendimento" onClick={irParaChat}>Falar com a Duda</a>
    </>
  )
}
