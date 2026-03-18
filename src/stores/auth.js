// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: true,
    error: null,
    fetchingProfile: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,

    // Retorna true se o usuário logado é SuperAdmin (visão global)
    isSuperAdmin: (state) => state.profile?.cargoNome === 'SuperAdmin',

    // Retorna o equipe_id do usuário logado (null para SuperAdmin ou sem equipe)
    equipeId: (state) => state.profile?.equipe_id ?? null,

    temPermissao: (state) => (slug) => {
      if (!state.profile) return false
      if (state.profile.cargoNome === 'SuperAdmin') return true
      return state.profile.permissoes?.includes(slug) ?? false
    }
  },

  actions: {
    async fetchProfile(sessionUser) {
      if (this.fetchingProfile) return
      this.fetchingProfile = true
      this.user = sessionUser
      this.error = null

      if (!sessionUser) {
        this.profile = null
        this.loading = false
        this.fetchingProfile = false
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
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error('Perfil não encontrado.')

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
        this.fetchingProfile = false
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
        this.fetchingProfile = false
      }
    },

    // Limpa o estado sem chamar signOut (para uso no guard após sessão expirada)
    clearSession() {
      this.user = null
      this.profile = null
      this.loading = false
      this.fetchingProfile = false
    }
  }
})
