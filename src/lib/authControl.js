// src/lib/authControl.js
// Verifica permissões diretamente do store (sem chamadas extras ao banco)
import { useAuthStore } from '../stores/auth'

export const checkPermission = (moduloSlug) => {
  const authStore = useAuthStore()

  if (!authStore.profile) return false

  // SuperAdmin tem acesso total
  if (authStore.profile.cargoNome === 'SuperAdmin') return true

  return authStore.profile.permissoes?.includes(moduloSlug) ?? false
}
