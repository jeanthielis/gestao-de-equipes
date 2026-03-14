// src/lib/utils.js
// Funções utilitárias compartilhadas entre views

// Classes CSS para badge de status (C / CP / NC)
export const badgeClass = (s) => ({
  C:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  CP: 'bg-amber-100 text-amber-700 border-amber-200',
  NC: 'bg-rose-100 text-rose-700 border-rose-200',
}[s] ?? 'bg-slate-100 text-slate-500 border-slate-200')

// Ícone FontAwesome para cada status
export const iconeStatus = (s) => ({
  C:  'fa-check',
  CP: 'fa-minus',
  NC: 'fa-xmark',
}[s] ?? 'fa-circle')

// Cor da barra de progresso de conformidade
export const getCorBarra = (p) => {
  if (p >= 90) return 'bg-emerald-500'
  if (p >= 60) return 'bg-amber-400'
  return 'bg-rose-500'
}

// Cor do texto de conformidade
export const getCorTexto = (p) => {
  if (p >= 90) return 'text-emerald-600'
  if (p >= 60) return 'text-amber-500'
  return 'text-rose-600'
}

// Formata data ISO para pt-BR curto (dd/mm/aaaa)
export const formatarData = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// Formata data ISO para pt-BR longo (com hora)
export const formatarDataCompleta = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
