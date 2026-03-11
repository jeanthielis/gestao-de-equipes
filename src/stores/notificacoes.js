// src/stores/notificacoes.js
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useNotificacoesStore = defineStore('notificacoes', {
  state: () => ({
    itens: [],        // lista de notificações
    loading: false,
    ultimaVerificacao: null
  }),

  getters: {
    naoLidas: (state) => state.itens.filter((n) => !n.lida),
    totalNaoLidas: (state) => state.itens.filter((n) => !n.lida).length
  },

  actions: {
    // Adiciona notificação local (sem persistir no banco)
    adicionar({ tipo, titulo, mensagem, link = null }) {
      this.itens.unshift({
        id: Date.now(),
        tipo,        // 'alerta' | 'info' | 'sucesso' | 'perigo'
        titulo,
        mensagem,
        link,
        lida: false,
        criadaEm: new Date().toISOString()
      })
    },

    marcarLida(id) {
      const n = this.itens.find((i) => i.id === id)
      if (n) n.lida = true
    },

    marcarTodasLidas() {
      this.itens.forEach((n) => { n.lida = true })
    },

    remover(id) {
      this.itens = this.itens.filter((i) => i.id !== id)
    },

    // Verifica condições que devem gerar alertas automáticos
    async verificarAlertas() {
      if (this.loading) return
      this.loading = true

      try {
        const hoje = new Date().toISOString().split('T')[0]

        // 1. Verifica se houve DDS aplicado hoje
        const { data: ddsHoje } = await supabase
          .from('dds_aplicacoes')
          .select('id')
          .gte('data_aplicacao', hoje + 'T00:00:00')
          .limit(1)

        if (!ddsHoje || ddsHoje.length === 0) {
          const jaExiste = this.itens.some(
            (n) => n.tipo === 'alerta' && n.titulo === 'DDS não aplicado hoje'
          )
          if (!jaExiste) {
            this.adicionar({
              tipo: 'alerta',
              titulo: 'DDS não aplicado hoje',
              mensagem: 'Nenhum Diálogo Diário de Segurança foi registrado até o momento.',
              link: '/aplicacao-dds'
            })
          }
        }

        // 2. Funcionários com NCs repetidas (3+ NCs nos últimos 7 dias)
        const seteDiasAtras = new Date()
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

        const { data: ncsRecentes } = await supabase
          .from('diario_avaliacoes')
          .select('funcionario_id, funcionarios(nome)')
          .eq('status', 'NC')
          .gte('created_at', seteDiasAtras.toISOString())

        if (ncsRecentes && ncsRecentes.length > 0) {
          const contagem = {}
          ncsRecentes.forEach((a) => {
            const id = a.funcionario_id
            const nome = a.funcionarios?.nome || 'Desconhecido'
            contagem[id] = contagem[id] || { nome, total: 0 }
            contagem[id].total++
          })

          Object.values(contagem).forEach((func) => {
            if (func.total >= 3) {
              const jaExiste = this.itens.some(
                (n) => n.mensagem?.includes(func.nome) && n.tipo === 'perigo'
              )
              if (!jaExiste) {
                this.adicionar({
                  tipo: 'perigo',
                  titulo: 'Não Conformidades recorrentes',
                  mensagem: `${func.nome} acumula ${func.total} NCs nos últimos 7 dias.`,
                  link: '/relatorio-apontamentos'
                })
              }
            }
          })
        }

        // 3. Usuários aguardando liberação de acesso
        const { data: usuariosSemNivel } = await supabase
          .from('usuarios')
          .select('id, nome')
          .is('nivel_id', null)
          .limit(5)

        if (usuariosSemNivel && usuariosSemNivel.length > 0) {
          const jaExiste = this.itens.some(
            (n) => n.titulo === 'Usuários aguardando acesso'
          )
          if (!jaExiste) {
            this.adicionar({
              tipo: 'info',
              titulo: 'Usuários aguardando acesso',
              mensagem: `${usuariosSemNivel.length} usuário(s) sem nível de permissão definido.`,
              link: '/adminSuper'
            })
          }
        }

        this.ultimaVerificacao = new Date().toISOString()
      } catch (err) {
        console.error('[Notificações] Erro ao verificar alertas:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
