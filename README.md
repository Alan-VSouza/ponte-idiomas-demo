# Duda · assistente de IA para escolas de idiomas (demo)

Site de uma escola de idiomas **fictícia** (Ponte Idiomas, São Carlos-SP) com uma assistente de IA que descobre o objetivo e o nível do aluno, mostra turmas com vaga e marca a aula experimental grátis.

**Teste ao vivo:** https://ponte-idiomas-demo-alan.vercel.app

- Mini nivelamento em até 2 perguntas, no próprio idioma.
- Quadro de turmas com dias, horários, formato e vagas; os botões da página mandam a pergunta direto para o chat.
- Marca a aula experimental só em datas reais de aula da turma; turma cheia vira lista de espera.
- Painel da secretaria em `/painel`.

React 18 + TypeScript + Vite, função serverless na Vercel e Google Gemini com *function calling*. Dados em `shared/clinica.ts`.

Feito por **Alan Souza**, desenvolvedor full-stack e de IA em São Carlos-SP. A Ponte Idiomas não existe. Fotos: Unsplash.
