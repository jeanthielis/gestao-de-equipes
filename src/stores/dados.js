// src/stores/dados.js
// Cache centralizado para dados de referência com TTL de 5 minutos.
// Evita que Funcionarios, GestaoAcesso e Unidades busquem os mesmos
// dados independentemente a cada navegação.
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

const TTL_MS = 5 * 60 * 1000 // 5 minutos

const expirou = (ts) => !ts || Date.now() - ts > TTL_MS

export const useDadosStore = defineStore('dados', {
  state: () => ({
    unidades:       { data: [], ts: null },
    setores:        { data: [], ts: null },
    equipes:        { data: [], ts: null },
    itensChecklist: { data: [], ts: null },
    niveis:         { data: [], ts: null },
    ddsTemas:       { data: [], ts: null },
    ddsCategorias:  { data: [], ts: null },
  }),

  actions: {
    // Força expiração de uma ou todas as chaves (use após mutações)
    invalidar(chave = null) {
      if (chave) {
        if (this[chave]) this[chave].ts = null
      } else {
        Object.keys(this.$state).forEach(k => { this[k].ts = null })
      }
    },

    async getUnidades() {
      if (!expirou(this.unidades.ts)) return this.unidades.data
      const { data } = await supabase.from('unidades').select('*').order('nome')
      if (data) { this.unidades.data = data; this.unidades.ts = Date.now() }
      return this.unidades.data
    },

    async getSetores() {
      if (!expirou(this.setores.ts)) return this.setores.data
      const { data } = await supabase
        .from('setores').select('id, nome, unidade_id, unidades(nome)').order('nome')
      if (data) { this.setores.data = data; this.setores.ts = Date.now() }
      return this.setores.data
    },

    async getEquipes() {
      if (!expirou(this.equipes.ts)) return this.equipes.data
      const { data } = await supabase
        .from('equipes').select('id, nome, setor_id, setores(nome, unidades(nome))').order('nome')
      if (data) { this.equipes.data = data; this.equipes.ts = Date.now() }
      return this.equipes.data
    },

    // Versão simplificada (só id+nome+setor_id) para selects em formulários
    async getEquipesSimples() {
      if (!expirou(this.equipes.ts)) return this.equipes.data
      const { data } = await supabase.from('equipes').select('id, nome, setor_id').order('nome')
      if (data) { this.equipes.data = data; this.equipes.ts = Date.now() }
      return this.equipes.data
    },

    async getItensChecklist() {
      if (!expirou(this.itensChecklist.ts)) return this.itensChecklist.data
      const { data } = await supabase
        .from('itens_checklist').select('id, descricao, categoria, ativo').order('descricao')
      if (data) { this.itensChecklist.data = data; this.itensChecklist.ts = Date.now() }
      return this.itensChecklist.data
    },

    async getNiveis() {
      if (!expirou(this.niveis.ts)) return this.niveis.data
      const { data } = await supabase.from('niveis_acesso').select('id, nome').order('nome')
      if (data) { this.niveis.data = data; this.niveis.ts = Date.now() }
      return this.niveis.data
    },

    async getDdsTemas() {
      if (!expirou(this.ddsTemas.ts)) return this.ddsTemas.data
      const { data } = await supabase.from('dds_temas').select('*').order('titulo')
      if (data) { this.ddsTemas.data = data; this.ddsTemas.ts = Date.now() }
      return this.ddsTemas.data
    },

    async getDdsCategorias() {
      if (!expirou(this.ddsCategorias.ts)) return this.ddsCategorias.data
      const { data } = await supabase.from('dds_categorias').select('*').order('nome')
      if (data) { this.ddsCategorias.data = data; this.ddsCategorias.ts = Date.now() }
      return this.ddsCategorias.data
    },

    // Carrega tudo de uma vez (uso em views que precisam de vários conjuntos)
    async precarregarEstrutura() {
      await Promise.all([
        this.getUnidades(),
        this.getSetores(),
        this.getEquipes(),
      ])
    },
  },
})
