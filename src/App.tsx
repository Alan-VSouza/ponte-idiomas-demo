import { useEffect, useMemo } from 'react'
import Chat from './Chat'
import { TURMAS, type Turma } from '../shared/clinica'

const KIT = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js']

function usarKit() {
  useEffect(() => {
    if (document.querySelector('script[data-kit]')) return
    for (const src of KIT) {
      const el = document.createElement('script')
      el.type = 'module'
      el.src = src
      el.dataset.kit = ''
      document.head.appendChild(el)
    }
  }, [])
}

function perguntar(texto: string) {
  document.getElementById('atendimento')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.dispatchEvent(new CustomEvent('chat-enviar', { detail: texto }))
}

const vagas = (t: Turma) => (t.vagas === 0 ? 'Lista de espera' : `${t.vagas} ${t.vagas === 1 ? 'vaga' : 'vagas'}`)

function Linhas({ lista }: { lista: Turma[] }) {
  return (
    <ul className="rows">
      {lista.map((t) => (
        <li key={t.id}>
          <span className="rows__name">{t.idioma} {t.nivel.replace(' / TOEFL e IELTS', '')}, {t.dias} {t.horario.split(' às ')[0]}{t.formato === 'Online ao vivo' ? ', online' : ''}</span>
          <span className="rows__value">{vagas(t)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  usarKit()
  const ingles = useMemo(() => TURMAS.filter((t) => t.idioma === 'Inglês'), [])
  const outros = useMemo(() => TURMAS.filter((t) => t.idioma !== 'Inglês'), [])

  return (
    <>
      <header className="nav nav--centre">
        <div className="wrap nav__bar">
          <a className="skip-link" href="#top">Pular para o conteúdo</a>
          <a className="nav__logo" href="#top">Ponte Idiomas</a>
          <nav className="nav__links" aria-label="Principal">
            <div className="nav__item"><a className="nav__link" href="#turmas">Turmas</a></div>
            <div className="nav__item"><a className="nav__link" href="#como-funciona">Matrícula</a></div>
            <div className="nav__item"><a className="nav__link" href="#intercambio">Intercâmbio</a></div>
            <div className="nav__item"><a className="nav__link" href="#para-empresas">Empresas</a></div>
          </nav>
          <div className="nav__actions">
            <a className="btn btn--primary" href="#agendar">Marcar aula grátis</a>
          </div>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--split" data-enter aria-labelledby="hero-h">
          <div className="wrap"><div className="hero-text grid hero__grid">
            <div className="hero__text span-5">
              <p className="hero__kicker"><span className="dot" aria-hidden="true" />Demonstração: a escola é fictícia, a Duda responde de verdade</p>
              <h1 id="hero-h">Escola de idiomas a 5 minutos da USP</h1>
              <p className="hero__lead">Inglês, espanhol, francês e alemão em turmas de até 8 alunos, no Centro de São Carlos. A primeira aula é grátis e já mede o seu nível.</p>
              <div className="btn-row">
                <a className="btn btn--primary" href="#agendar">Marcar aula grátis</a>
                <a className="btn btn--secondary" href="#turmas">Ver turmas com vaga</a>
              </div>
            </div>
            <div className="hero__media span-6 start-7">
              <img src="/img/mesa.jpg" alt="Quatro estudantes conversando em volta de uma mesa com notebooks" style={{ ['--ly-pos' as string]: '40% 50%' }} {...{ fetchpriority: 'high' }} />
              <div className="ly-float">
                <div className="ly-float__row"><span className="ly-live">Matrícula</span><span>sem custo</span></div>
                <div className="ly-float__title">Até 15 de dezembro, nas turmas com vaga</div>
              </div>
            </div>
          </div></div>
        </section>

        <section className="section" id="turmas" aria-labelledby="turmas-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="section-head">
              <h2 id="turmas-h">Turmas e preços</h2>
              <p>R$ 349 por mês em grupo e 15% de desconto para universitários.</p>
            </div>
            <div className="grid grid--top fill">
              <div className="span-6 stack-4">
                <div><p className="t-label">Inglês</p><Linhas lista={ingles} /></div>
                <div><p className="t-label">Espanhol, francês e alemão</p><Linhas lista={outros} /></div>
              </div>
              <div className="frame frame--photo frame--fill span-6 start-7">
                <img className="frame__img" src="/img/conversa.jpg" alt="Estudantes conversando e rindo numa sala de aula" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="agendar" aria-labelledby="agendar-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid fill">
              <div className="span-5 stack-4">
                <h2 id="agendar-h">Aula grátis marcada pelo chat da Duda</h2>
                <p className="t-lead">Diga o idioma e para quê: trabalho, viagem ou intercâmbio. A Duda faz duas perguntas de nível e mostra só turmas com vaga no seu horário.</p>
                <p>Turma cheia vira lista de espera, nunca promessa. Dúvida sobre contrato vai para a secretaria.</p>
              </div>
              <div className="span-6 start-7 chat-frame" id="atendimento" data-visual data-ui="duda">
                <Chat />
              </div>
            </div>
          </div>
        </section>


        <section className="section" id="intercambio" aria-labelledby="intercambio-h">
          <div className="wrap">
            <div className="grid grid--top fill">
              <div className="span-5 stack-4">
                <h2 id="intercambio-h">Preparatório de idiomas para TOEFL e IELTS</h2>
                <p className="t-lead">Para quem vai fazer intercâmbio ou mestrado fora: simulados mensais, a turma avançada de sábado e DELE para o espanhol.</p>
                <button type="button" className="link" onClick={() => perguntar('Vou fazer intercâmbio. Como funciona o preparatório de TOEFL e IELTS?')}>Perguntar à Duda sobre o preparatório</button>
              </div>
              <div className="frame frame--photo frame--fill span-6 start-7">
                <img className="frame__img" src="/img/aeroporto.jpg" alt="Viajante com os pés na mala esperando no aeroporto" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="section ground-inverse" id="como-funciona" style={{ ['--h' as string]: 2 }} data-moment="pinned-chapters" aria-labelledby="como-funciona-h">
          <div className="wrap mo-pc__grid">
            <div className="mo-pc__text">
              <h2 id="como-funciona-h">Da aula grátis à matrícula em 3 passos</h2>
              <ol className="mo-pc__steps">
                <li className="mo-pc__step">
                  <h3>Aula experimental de 15 minutos</h3>
                  <p>Uma conversa com o professor define o seu nível, do básico 1 ao avançado.</p>
                  <figure className="mo-pc__visual"><img src="/img/quadro.jpg" alt="Professora explicando no quadro branco" width="1600" height="1067" /></figure>
                </li>
                <li className="mo-pc__step">
                  <h3>Turma de até 8 alunos</h3>
                  <p>Duas aulas de 1h30 por semana, presencial ou online ao vivo. Até 2 reposições por mês.</p>
                  <figure className="mo-pc__visual"><img src="/img/grupo.jpg" alt="Três estudantes rindo em volta de notebooks" width="1600" height="1067" /></figure>
                </li>
                <li className="mo-pc__step">
                  <h3>Contrato de 1 semestre</h3>
                  <p>Material de R$ 180 por semestre e cancelamento com 30 dias de aviso. Matrícula sem custo até 15 de dezembro.</p>
                  <figure className="mo-pc__visual"><img src="/img/online.jpg" alt="Estudante assistindo a uma aula online no notebook" width="1600" height="2400" /></figure>
                </li>
              </ol>
            </div>
            <div className="mo-pc__visuals frame" />
          </div>
        </section>

        <section className="section" id="para-empresas" aria-labelledby="para-empresas-h" style={{ ['--hm' as string]: 2 }}>
          <div className="wrap">
            <div className="grid grid--top fill">
              <div className="span-5 stack-4">
                <p className="t-label">Para escolas de idiomas, cursos e autoescolas</p>
                <h2 id="para-empresas-h">Uma Duda para a sua escola</h2>
                <p>A Ponte Idiomas é fictícia; a Duda, não. Ela atende no site e no WhatsApp com as suas turmas, vagas e preços.</p>
                <ul className="rows">
                  <li><span className="rows__name">Interessado vira aluno</span><p>Quem pergunta às 22h já sai com aula experimental marcada.</p></li>
                  <li><span className="rows__name">Só turma com vaga</span><p>Horários e vagas vêm do seu cadastro.</p></li>
                  <li><span className="rows__name">Painel para a secretaria</span><p>Aulas marcadas e pedidos de atendimento num só lugar. <a className="link" href="/painel">Abrir o painel desta demo</a></p></li>
                </ul>
                <a className="link" href="https://alansouza.netlify.app" target="_blank" rel="noreferrer">Contratar uma assistente com o Alan</a>
                <p className="t-small muted">Projeto de Alan Souza, desenvolvedor de IA em São Carlos.</p>
              </div>
              <div className="frame frame--photo span-6 start-7" style={{ aspectRatio: '4 / 5', maxHeight: 708, width: '100%' }}>
                <img className="frame__img" src="/img/livro.jpg" alt="Livro de inglês amarelo sobre uma bancada" loading="lazy" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer closing footer--visit" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--type">
            <div className="section-head">
              <h2 id="close-h">Primeira aula grátis, com nivelamento</h2>
              <p>Secretaria de segunda a sexta, 9h às 21h, e sábado, 9h às 12h.</p>
            </div>
            <a className="btn btn--primary btn--xl" href="#agendar">Marcar aula grátis</a>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-6 stack-4">
                <address className="footer__address">Centro, São Carlos</address>
                <p><a className="link" href="https://www.openstreetmap.org/search?query=Centro%20S%C3%A3o%20Carlos">Ver a região no mapa</a></p>
                <p>Escola fictícia, criada para demonstrar uma assistente de IA.</p>
              </div>
              <div className="span-6 start-7 stack-4">
                <h3>Secretaria</h3>
                <dl className="hours" data-tz="America/Sao_Paulo" data-assumed="">
                  <dt data-days="mon-fri">Segunda a sexta</dt><dd>9h às 21h</dd>
                  <dt data-days="sat">Sábado</dt><dd>9h às 12h</dd>
                  <dt data-days="sun">Domingo</dt><dd>Fechado</dd>
                </dl>
              </div>
            </div>
            <div className="footer__legal">
              <span>&copy; 2026 Ponte Idiomas, negócio fictício</span>
              <a href="/painel">Painel</a>
              <span className="credits">Fotos via Unsplash</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="actionbar" aria-label="Ações rápidas">
        <a className="btn btn--primary" href="#agendar">Marcar aula grátis</a>
      </nav>
    </>
  )
}
