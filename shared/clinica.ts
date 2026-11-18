// Dados da escola de idiomas FICTÍCIA usada na demonstração. Tudo o que a IA pode dizer sai daqui.

export const CLINICA = {
  nome: 'Ponte Idiomas',
  tipo: 'escola de idiomas para jovens e adultos',
  assistente: 'Duda',
  cidade: 'São Carlos - SP',
  endereco: 'Rua Exemplo, 654, Centro, São Carlos - SP (endereço fictício), a 5 minutos a pé da USP',
  horarios: 'Secretaria de segunda a sexta, das 9h às 21h, e sábado das 9h às 12h.',
  precos: 'Turma em grupo (até 8 alunos, 2 aulas de 1h30 por semana): R$ 349 por mês. Aula particular: R$ 120 a hora, ou pacote de 8 horas por R$ 880. Material didático: R$ 180 por semestre. Matrícula sem custo até 15 de dezembro. Desconto de 15% para estudantes da USP, UFSCar e IFSP.',
  nivelamento: 'Teste de nivelamento gratuito: conversa de 15 minutos com um professor na aula experimental. Níveis: Básico 1, Básico 2, Intermediário 1, Intermediário 2, Avançado (alinhados ao Quadro Europeu A1 a C1).',
  certificados: 'Preparatório para TOEFL e IELTS (inglês) e DELE (espanhol), com simulados mensais. Muito procurado por estudantes que vão fazer intercâmbio ou mestrado fora.',
  politica: 'Contrato semestral, cancelamento com 30 dias de aviso. Aulas perdidas podem ser repostas em outra turma do mesmo nível, até 2 por mês.',
}

export type Turma = { id: string; idioma: string; nivel: string; dias: string; horario: string; formato: 'Presencial' | 'Online ao vivo'; vagas: number; professor: string }

export const TURMAS: Turma[] = [
  { id: 'ING-B1-SQ19', idioma: 'Inglês', nivel: 'Básico 1', dias: 'seg e qua', horario: '19h às 20h30', formato: 'Presencial', vagas: 3, professor: 'Mark' },
  { id: 'ING-B2-TQ18', idioma: 'Inglês', nivel: 'Básico 2', dias: 'ter e qui', horario: '18h às 19h30', formato: 'Presencial', vagas: 2, professor: 'Júlia' },
  { id: 'ING-I1-SQ07', idioma: 'Inglês', nivel: 'Intermediário 1', dias: 'seg e qua', horario: '7h às 8h30', formato: 'Online ao vivo', vagas: 5, professor: 'Mark' },
  { id: 'ING-I2-TQ20', idioma: 'Inglês', nivel: 'Intermediário 2', dias: 'ter e qui', horario: '20h às 21h30', formato: 'Presencial', vagas: 1, professor: 'Júlia' },
  { id: 'ING-AV-SAB9', idioma: 'Inglês', nivel: 'Avançado / TOEFL e IELTS', dias: 'sábado', horario: '9h às 12h', formato: 'Presencial', vagas: 4, professor: 'Mark' },
  { id: 'ESP-B1-TQ19', idioma: 'Espanhol', nivel: 'Básico 1', dias: 'ter e qui', horario: '19h às 20h30', formato: 'Presencial', vagas: 6, professor: 'Carmen' },
  { id: 'ESP-I1-SQ18', idioma: 'Espanhol', nivel: 'Intermediário 1', dias: 'seg e qua', horario: '18h às 19h30', formato: 'Online ao vivo', vagas: 4, professor: 'Carmen' },
  { id: 'FRA-B1-SAB10', idioma: 'Francês', nivel: 'Básico 1', dias: 'sábado', horario: '10h às 12h', formato: 'Presencial', vagas: 5, professor: 'Élise' },
  { id: 'ALE-B1-TQ20', idioma: 'Alemão', nivel: 'Básico 1', dias: 'ter e qui', horario: '20h às 21h30', formato: 'Online ao vivo', vagas: 0, professor: 'Lukas' },
]

export type FiltroTurma = { idioma?: string; nivel?: string; periodo?: 'manha' | 'tarde' | 'noite' | 'sabado'; formato?: string }

export function buscarTurmas(f: FiltroTurma = {}) {
  return TURMAS.filter((t) => {
    if (f.idioma && !t.idioma.toLowerCase().startsWith(String(f.idioma).toLowerCase().slice(0, 4))) return false
    if (f.nivel && !t.nivel.toLowerCase().includes(String(f.nivel).toLowerCase())) return false
    if (f.formato && !t.formato.toLowerCase().includes(String(f.formato).toLowerCase().slice(0, 5))) return false
    const h = parseInt(t.horario)
    if (f.periodo === 'manha' && !(h < 12)) return false
    if (f.periodo === 'tarde' && !(h >= 12 && h < 18)) return false
    if (f.periodo === 'noite' && !(h >= 18)) return false
    if (f.periodo === 'sabado' && t.dias !== 'sábado') return false
    return true
  })
}

// Aulas experimentais: datas reais das próximas aulas de cada turma.
const DIAS: Record<string, number[]> = { 'seg e qua': [1, 3], 'ter e qui': [2, 4], sábado: [6] }
export function proximasAulas(turma: Turma, agora = new Date(), quantas = 3): string[] {
  const out: string[] = []
  const dias = DIAS[turma.dias] || []
  for (let i = 1; i <= 21 && out.length < quantas; i++) {
    const d = new Date(agora.getTime() + i * 86400000)
    const sp = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    if (dias.includes(sp.getDay())) out.push(sp.toISOString().slice(0, 10))
  }
  return out
}

// Mantido para o módulo do agente (não usado nesta escola).
export function horariosLivres() {
  return [] as { data: string; diaSemana: string; hora: string }[]
}

export function textoClinica(): string {
  const c = CLINICA
  return [
    `Nome: ${c.nome} (${c.tipo}, fictícia, de demonstração) - ${c.cidade}`,
    `Endereço: ${c.endereco}`,
    `Secretaria: ${c.horarios}`,
    `Preços e descontos: ${c.precos}`,
    `Nivelamento: ${c.nivelamento}`,
    `Certificados internacionais: ${c.certificados}`,
    `Contrato e reposição: ${c.politica}`,
    `Idiomas: Inglês, Espanhol, Francês e Alemão. Para turmas, horários e vagas, use SEMPRE a ferramenta ver_turmas.`,
  ].join('\n')
}
