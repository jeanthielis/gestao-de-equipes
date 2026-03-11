// src/lib/alerts.js
import Swal from 'sweetalert2'

// Toast flutuante (canto superior direito) para avisos rápidos
export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-2xl shadow-xl border border-slate-200 font-sans'
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

// Alerta central — confirmações, inputs, mensagens importantes
export const alerta = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl shadow-2xl border border-slate-100 font-sans',
    confirmButton: 'bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors mx-2',
    cancelButton: 'bg-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors mx-2',
    input: 'rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 px-4 py-3'
  },
  buttonsStyling: false
})

// Atalho para diálogos de confirmação destrutiva (excluir, desativar, etc.)
export const confirmar = (titulo, html, confirmText = 'Confirmar') =>
  alerta.fire({
    title: titulo,
    html,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'rounded-3xl shadow-2xl border border-slate-100 font-sans',
      confirmButton: 'bg-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors mx-2',
      cancelButton: 'bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-300 transition-colors mx-2'
    },
    buttonsStyling: false
  })

// Tradutor de erros do Supabase/banco para português
export const traduzirErro = (error) => {
  if (!error) return 'Ocorreu um erro inesperado.'

  const msg = error.message || ''
  const code = error.code || ''

  // Erros de banco (PostgreSQL)
  if (code === '23505') return 'Este cadastro já existe no sistema (ex: matrícula ou nome duplicado).'
  if (code === '23503') return 'Não é possível excluir: este item está vinculado a outros registros (ex: DDS ou Diário).'
  if (code === '23514') return 'Um dos valores informados não é permitido pelo sistema.'
  if (code === 'PGRST116') return 'Registro não encontrado.'

  // Erros de autenticação
  if (msg.includes('duplicate key')) return 'Este registro já está cadastrado.'
  if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('User already registered')) return 'Este email já possui cadastro.'
  if (msg.includes('Password should be at least')) return 'Senha fraca — mínimo de 6 caracteres.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de fazer login.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Falha na conexão. Verifique sua internet.'
  if (msg.includes('JWT') || msg.includes('token')) return 'Sessão expirada. Atualize a página e faça login novamente.'
  if (msg.includes('permission denied')) return 'Você não tem permissão para executar esta ação.'

  // Genérico
  return 'Falha na comunicação com o servidor. Tente novamente.'
}
