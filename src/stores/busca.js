// src/stores/busca.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useBuscaStore = defineStore('busca', {
  state: () => ({
    termo: '',
    resultados: { funcionarios: [], dds: [], apontamentos: [] },
    loading: false,
    aberta: false
  }),

  actions: {
    abrir() { this.aberta = true },
    fechar() { this.aberta = false; this.termo = ''; this.resultados = { funcionarios: [], dds: [], apontamentos: [] } },

    async buscar(termo) {
      if (!termo || termo.trim().length < 2) {
        this.resultados = { funcionarios: [], dds: [], apontamentos: [] }
        return
      }
      this.loading = true
      this.termo = termo.trim()

      try {
        const q = `%${this.termo}%`

        const [{ data: funcs }, { data: dds }, { data: apts }] = await Promise.all([
          supabase.from('funcionarios').select('id, nome, matricula, funcao').ilike('nome', q).limit(5),
          supabase.from('dds_temas').select('id, titulo').ilike('titulo', q).limit(5),
          supabase.from('diario_avaliacoes')
            .select('id, status, justificativa, funcionarios(nome), itens_checklist(descricao)')
            .not('justificativa', 'is', null)
            .ilike('justificativa', q)
            .limit(5)
        ])

        this.resultados = {
          funcionarios: funcs || [],
          dds: dds || [],
          apontamentos: apts || []
        }
      } catch (err) {
        console.error('[Busca] Erro:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
