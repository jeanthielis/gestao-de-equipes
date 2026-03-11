// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: true,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    temPermissao: (state) => (slug) => {
      if (!state.profile) return false
      if (state.profile.cargoNome === 'SuperAdmin') return true
      return state.profile.permissoes?.includes(slug) ?? false
    }
  },

  actions: {
    async fetchProfile(sessionUser) {
      this.user = sessionUser
      this.error = null

      if (!sessionUser) {
        this.profile = null
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select(`
            *,
            niveis_acesso (
              nome,
              permissoes_acesso (
                modulo_slug
              )
            )
          `)
          .eq('id', sessionUser.id)
          .single()

        if (error) throw error

        const listaPermissoes =
          data.niveis_acesso?.permissoes_acesso?.map((p) => p.modulo_slug) || []

        this.profile = {
          ...data,
          cargoNome: data.niveis_acesso?.nome || 'Sem Acesso',
          permissoes: listaPermissoes
        }
      } catch (err) {
        console.error('[AuthStore] Erro ao buscar perfil:', err)
        this.error = err.message || 'Erro desconhecido ao carregar perfil.'
        this.profile = null
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error('[AuthStore] Erro ao fazer logout:', err)
      } finally {
        this.user = null
        this.profile = null
        this.error = null
      }
    },

    // Limpa o estado sem chamar signOut (para uso no guard após sessão expirada)
    clearSession() {
      this.user = null
      this.profile = null
      this.loading = false
    }
  }
})
