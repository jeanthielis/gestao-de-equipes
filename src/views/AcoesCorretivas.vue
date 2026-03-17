<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">

    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-900">Ações Corretivas</h2>
        <p class="text-slate-500 mt-1 text-sm">Registre e acompanhe o tratamento de Não Conformidades e Conformidades Parciais.</p>
      </div>
      <div class="flex gap-2">
        <button @click="filtroPendentes = !filtroPendentes"
          :class="filtroPendentes ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="filtroPendentes ? 'bg-white' : 'bg-rose-500'"></span>
          {{ filtroPendentes ? 'Mostrando: Pendentes' : 'Mostrar Pendentes' }}
        </button>
        <button @click="carregarNCs" :disabled="carregando" class="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <i class="fa-solid fa-arrows-rotate text-sm" :class="{ 'fa-spin': carregando }"></i>
        </button>
        <button @click="exportarPDF" :disabled="carregando || ncs.length === 0"
          class="px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-sm text-sm flex items-center gap-2 disabled:opacity-50">
          <i class="fa-solid fa-file-pdf"></i> PDF
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-center">
        <p class="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Abertas</p>
        <p class="text-3xl font-black text-rose-700">{{ kpis.abertas }}</p>
      </div>
      <div class="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-center">
        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Em Andamento</p>
        <p class="text-3xl font-black text-amber-700">{{ kpis.andamento }}</p>
      </div>
      <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 text-center">
        <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Concluídas</p>
        <p class="text-3xl font-black text-emerald-700">{{ kpis.concluidas }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
        <div class="h-3 bg-slate-100 rounded-full w-1/2 mb-3"></div>
        <div class="h-2 bg-slate-100 rounded-full w-1/3"></div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else-if="ncsExibidas.length === 0" class="bg-white rounded-3xl border border-dashed border-slate-300 p-14 text-center">
      <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-emerald-500">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <p class="font-bold text-lg text-slate-600">{{ filtroPendentes ? 'Nenhuma NC pendente!' : 'Nenhuma NC encontrada.' }}</p>
      <p class="text-slate-400 text-sm mt-1">{{ filtroPendentes ? 'Todas as não conformidades foram tratadas.' : 'Registre apontamentos no Diário de Bordo para que as NCs apareçam aqui.' }}</p>
    </div>

    <!-- Lista de NCs -->
    <div v-else class="space-y-4">
      <div v-for="nc in ncsExibidas" :key="nc.id"
        class="bg-white rounded-3xl border shadow-sm overflow-hidden transition-all"
        :class="{
          'border-rose-200': nc.status_acao === 'aberta',
          'border-amber-200': nc.status_acao === 'andamento',
          'border-emerald-200': nc.status_acao === 'concluida',
          'border-slate-200': !nc.status_acao
        }">

        <!-- Header do card -->
        <div class="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          :class="{
            'bg-rose-50/50': nc.status_acao === 'aberta' || !nc.status_acao,
            'bg-amber-50/50': nc.status_acao === 'andamento',
            'bg-emerald-50/50': nc.status_acao === 'concluida'
          }">
          <div class="flex items-start gap-3">
            <!-- Badge de tipo -->
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shrink-0 mt-0.5"
              :class="nc.status === 'NC' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'">
              {{ nc.status }}
            </span>
            <div>
              <p class="font-black text-slate-800">{{ nc.funcionarios?.nome || 'Desconhecido' }}</p>
              <p class="text-xs text-slate-500 mt-0.5">
                <span class="font-mono">MAT: {{ nc.funcionarios?.matricula || 'S/N' }}</span>
                &nbsp;•&nbsp;{{ formatarData(nc.diario_execucoes?.created_at) }}
              </p>
            </div>
          </div>
          <!-- Status da ação corretiva -->
          <div class="flex items-center gap-2">
            <select
              v-model="nc.status_acao"
              @change="salvarStatusAcao(nc)"
              class="text-xs font-bold py-2 pl-3 pr-8 rounded-xl border outline-none appearance-none cursor-pointer transition-all"
              :class="{
                'bg-rose-50 border-rose-200 text-rose-700': nc.status_acao === 'aberta' || !nc.status_acao,
                'bg-amber-50 border-amber-200 text-amber-700': nc.status_acao === 'andamento',
                'bg-emerald-50 border-emerald-200 text-emerald-700': nc.status_acao === 'concluida'
              }">
              <option value="aberta">🔴 Aberta</option>
              <option value="andamento">🟡 Em Andamento</option>
              <option value="concluida">🟢 Concluída</option>
            </select>
          </div>
        </div>

        <!-- Corpo -->
        <div class="px-6 py-4 space-y-4">
          <!-- Critério e justificativa -->
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critério</p>
            <p class="font-bold text-slate-800 text-sm">{{ nc.itens_checklist?.descricao || '—' }}</p>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 mb-1">Ocorrência registrada</p>
            <p class="text-sm text-slate-600 italic">{{ nc.justificativa || 'Nenhuma justificativa informada.' }}</p>
          </div>

          <!-- Campo de ação corretiva -->
          <div>
            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ação Corretiva Tomada</label>
            <textarea
              v-model="nc.acao_corretiva"
              @blur="salvarAcaoCorretiva(nc)"
              rows="2"
              placeholder="Descreva a ação tomada para corrigir esta não conformidade..."
              class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors placeholder-slate-300"
            ></textarea>
          </div>

          <!-- Responsável pela ação -->
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span v-if="nc.responsavel_acao">
              <i class="fa-solid fa-user-check mr-1 text-emerald-500"></i>
              Responsável: <span class="font-bold text-slate-600">{{ nc.responsavel_acao }}</span>
            </span>
            <span v-if="nc.data_conclusao" class="ml-auto">
              <i class="fa-solid fa-calendar-check mr-1 text-emerald-500"></i>
              Concluída em: <span class="font-bold text-slate-600">{{ formatarData(nc.data_conclusao) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { toast, traduzirErro } from '../lib/alerts'
import { gerarAcoesCorretivasPDF } from '../lib/relatoriosPDF'
import { registrarLog } from '../lib/auditoria'

const authStore = useAuthStore()
const ncs = ref([])
const carregando = ref(false)
const filtroPendentes = ref(false)

const kpis = computed(() => ({
  abertas: ncs.value.filter((n) => !n.status_acao || n.status_acao === 'aberta').length,
  andamento: ncs.value.filter((n) => n.status_acao === 'andamento').length,
  concluidas: ncs.value.filter((n) => n.status_acao === 'concluida').length
}))

const ncsExibidas = computed(() => {
  if (filtroPendentes.value) {
    return ncs.value.filter((n) => !n.status_acao || n.status_acao !== 'concluida')
  }
  return ncs.value
})

const carregarNCs = async () => {
  carregando.value = true
  try {
    let query = supabase
      .from('diario_avaliacoes')
      .select(`
        id, status, justificativa, funcionario_id,
        acao_corretiva, status_acao, responsavel_acao, data_conclusao,
        funcionarios(id, nome, matricula, equipe_id),
        itens_checklist(descricao),
        diario_execucoes(created_at)
      `)
      .in('status', ['NC', 'CP'])
      .order('created_at', { ascending: false })

    // Restringe visibilidade para não-SuperAdmin
    if (!authStore.isSuperAdmin && authStore.equipeId) {
      query = query.eq('funcionarios.equipe_id', authStore.equipeId)
    }

    const { data, error } = await query

    if (error) throw error
    let lista = (data || []).map((n) => ({ ...n, status_acao: n.status_acao || 'aberta' }))
    // Filtragem extra no cliente para garantir isolamento
    if (!authStore.isSuperAdmin && authStore.equipeId) {
      lista = lista.filter(n => n.funcionarios?.equipe_id === authStore.equipeId)
    }
    ncs.value = lista
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao carregar', text: traduzirErro(err) })
  } finally {
    carregando.value = false
  }
}

const salvarAcaoCorretiva = async (nc) => {
  if (nc._salvandoAcao) return
  nc._salvandoAcao = true
  try {
    const { error } = await supabase
      .from('diario_avaliacoes')
      .update({ acao_corretiva: nc.acao_corretiva })
      .eq('id', nc.id)
    if (error) throw error
    await registrarLog('atualizou_acao_corretiva', 'diario_avaliacoes', { id: nc.id, acao: nc.acao_corretiva })
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao salvar ação', text: traduzirErro(err) })
  } finally {
    nc._salvandoAcao = false
  }
}

const salvarStatusAcao = async (nc) => {
  try {
    const updates = { status_acao: nc.status_acao }
    if (nc.status_acao === 'concluida') {
      updates.data_conclusao = new Date().toISOString()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase.from('usuarios').select('nome').eq('id', user.id).single()
        if (perfil) updates.responsavel_acao = perfil.nome
      }
    }
    const { error } = await supabase.from('diario_avaliacoes').update(updates).eq('id', nc.id)
    if (error) throw error
    if (nc.status_acao === 'concluida') {
      nc.data_conclusao = updates.data_conclusao
      nc.responsavel_acao = updates.responsavel_acao
      toast.fire({ icon: 'success', title: 'NC concluída!', text: 'Ação corretiva registrada com sucesso.' })
    }
    await registrarLog('alterou_status_nc', 'diario_avaliacoes', { id: nc.id, status: nc.status_acao })
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao atualizar status', text: traduzirErro(err) })
  }
}

const formatarData = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

const exportarPDF = async () => {
  await gerarAcoesCorretivasPDF({ ncs: ncs.value })
}

onMounted(carregarNCs)
</script>
