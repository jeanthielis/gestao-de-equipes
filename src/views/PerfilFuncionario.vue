<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">

    <!-- Busca de funcionário -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 class="text-2xl font-black text-slate-900 mb-1">Perfil do Funcionário</h2>
      <p class="text-slate-500 text-sm mb-5">Visualize o histórico individual de conformidade, DDS e apontamentos.</p>
      <form @submit.prevent="buscarFuncionario" class="flex gap-3">
        <div class="relative flex-1">
          <i class="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="matriculaBusca" type="text" placeholder="Digite a matrícula do funcionário..." class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" />
        </div>
        <button type="submit" :disabled="carregando" class="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2">
          <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </button>
      </form>
    </div>

    <!-- Resultado: não encontrado -->
    <div v-if="buscaFeita && !funcionario" class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-600">
      <i class="fa-solid fa-user-xmark text-3xl mb-2 block"></i>
      <p class="font-bold">Funcionário não encontrado com esta matrícula.</p>
    </div>

    <!-- Perfil encontrado -->
    <template v-if="funcionario">

      <!-- Card de identidade -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl font-black shadow-lg shrink-0">
            {{ funcionario.nome?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-black tracking-tight">{{ funcionario.nome }}</h3>
            <p class="text-slate-300 text-sm mt-1">{{ funcionario.funcao || 'Operador' }}</p>
            <div class="flex flex-wrap gap-3 mt-3">
              <span class="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-xs font-bold font-mono">MAT: {{ funcionario.matricula || 'S/N' }}</span>
              <span class="px-3 py-1 rounded-lg text-xs font-bold border"
                :class="funcionario.ativo ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-rose-500/20 border-rose-400/30 text-rose-300'">
                {{ funcionario.ativo ? '● Ativo' : '○ Inativo' }}
              </span>
            </div>
          <button v-if="funcionario" @click="exportarFicha"
            class="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors flex items-center gap-2">
            <i class="fa-solid fa-file-pdf text-rose-400"></i> Exportar Ficha
          </button>
        </div>
          <!-- Índice geral de conformidade -->
          <div class="text-center bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shrink-0">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conformidade Geral</p>
            <p class="text-4xl font-black" :class="getCorTexto(indiceGeral)">{{ indiceGeral }}%</p>
            <div class="w-24 h-1.5 bg-slate-700 rounded-full mt-2 mx-auto overflow-hidden">
              <div class="h-full rounded-full transition-all" :class="getCorBarra(indiceGeral)" :style="{ width: indiceGeral + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">DDS Participados</p>
          <p class="text-3xl font-black text-slate-800">{{ kpis.totalDDS }}</p>
        </div>
        <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm text-center">
          <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Conformes</p>
          <p class="text-3xl font-black text-emerald-700">{{ kpis.totalC }}</p>
        </div>
        <div class="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm text-center">
          <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Conf. Parcial</p>
          <p class="text-3xl font-black text-amber-700">{{ kpis.totalCP }}</p>
        </div>
        <div class="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm text-center">
          <p class="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Não Conformes</p>
          <p class="text-3xl font-black text-rose-700">{{ kpis.totalNC }}</p>
        </div>
      </div>

      <!-- Critérios mais problemáticos -->
      <div v-if="topProblemas.length > 0" class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h4 class="font-black text-slate-800 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation text-amber-500"></i>
          Critérios com Mais Desvios
        </h4>
        <div class="space-y-3">
          <div v-for="p in topProblemas" :key="p.descricao" class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-700 truncate">{{ p.descricao }}</p>
              <div class="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div class="h-full rounded-full bg-rose-400 transition-all" :style="{ width: (p.total / kpis.totalNC * 100) + '%' }"></div>
              </div>
            </div>
            <span class="text-sm font-black text-rose-600 shrink-0">{{ p.total }}x</span>
          </div>
        </div>
      </div>

      <!-- Histórico de avaliações -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h4 class="font-black text-slate-800">Histórico de Apontamentos</h4>
          <span class="text-xs font-bold text-slate-400">{{ avaliacoes.length }} registros</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100 bg-white">
                <th class="px-6 py-3">Data</th>
                <th class="px-4 py-3">Critério</th>
                <th class="px-4 py-3 text-center">Status</th>
                <th class="px-4 py-3">Justificativa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="avaliacoes.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-400">Nenhum apontamento registrado.</td>
              </tr>
              <tr v-for="a in avaliacoes" :key="a.id"
                class="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                :class="{ 'bg-rose-50/30': a.status === 'NC', 'bg-amber-50/30': a.status === 'CP' }">
                <td class="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {{ formatarData(a.diario_execucoes?.created_at) }}
                </td>
                <td class="px-4 py-3 font-medium text-slate-700">{{ a.itens_checklist?.descricao || '—' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border"
                    :class="badgeClass(a.status)">
                    <i class="fa-solid" :class="iconeStatus(a.status)"></i>{{ a.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500 text-xs italic">{{ a.justificativa || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DDS participados -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h4 class="font-black text-slate-800">DDS Participados</h4>
        </div>
        <div v-if="participacoesDDS.length === 0" class="p-8 text-center text-slate-400 text-sm">
          Nenhuma participação em DDS registrada.
        </div>
        <div v-else class="divide-y divide-slate-50">
          <div v-for="p in participacoesDDS" :key="p.id" class="px-6 py-4 flex items-center justify-between">
            <div>
              <p class="font-bold text-slate-800 text-sm">{{ p.dds_aplicacoes?.dds_temas?.titulo || 'Tema removido' }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ formatarData(p.dds_aplicacoes?.data_aplicacao) }}</p>
            </div>
            <span v-if="p.imagem_assinatura" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <i class="fa-solid fa-signature mr-1"></i>Assinou
            </span>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, traduzirErro } from '../lib/alerts'
import { badgeClass, iconeStatus, getCorBarra, getCorTexto, formatarData } from '../lib/utils'
import { gerarFichaFuncionarioPDF } from '../lib/relatoriosPDF'

const matriculaBusca = ref('')
const funcionario = ref(null)
const avaliacoes = ref([])
const participacoesDDS = ref([])
const carregando = ref(false)
const buscaFeita = ref(false)

const kpis = computed(() => {
  let C = 0, CP = 0, NC = 0
  avaliacoes.value.forEach((a) => {
    if (a.status === 'C') C++
    else if (a.status === 'CP') CP++
    else if (a.status === 'NC') NC++
  })
  return { totalC: C, totalCP: CP, totalNC: NC, totalDDS: participacoesDDS.value.length }
})

const indiceGeral = computed(() => {
  const total = kpis.value.totalC + kpis.value.totalCP + kpis.value.totalNC
  if (!total) return 100
  return Math.round((kpis.value.totalC / total) * 100)
})

const topProblemas = computed(() => {
  const mapa = {}
  avaliacoes.value
    .filter((a) => a.status === 'NC' || a.status === 'CP')
    .forEach((a) => {
      const desc = a.itens_checklist?.descricao || 'Desconhecido'
      mapa[desc] = (mapa[desc] || 0) + 1
    })
  return Object.entries(mapa)
    .map(([descricao, total]) => ({ descricao, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
})

const buscarFuncionario = async () => {
  if (!matriculaBusca.value.trim()) return
  carregando.value = true
  buscaFeita.value = false
  funcionario.value = null
  avaliacoes.value = []
  participacoesDDS.value = []

  try {
    const { data: func, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('matricula', matriculaBusca.value.trim())
      .single()

    if (error || !func) {
      buscaFeita.value = true
      return
    }

    funcionario.value = func

    const [{ data: avals }, { data: dds }] = await Promise.all([
      supabase
        .from('diario_avaliacoes')
        .select('id, status, justificativa, itens_checklist(descricao), diario_execucoes(created_at)')
        .eq('funcionario_id', func.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('dds_assinaturas')
        .select('id, imagem_assinatura, dds_aplicacoes(data_aplicacao, dds_temas(titulo))')
        .eq('funcionario_id', func.id)
        .order('created_at', { ascending: false })
    ])

    avaliacoes.value = avals || []
    participacoesDDS.value = dds || []
    buscaFeita.value = true
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao buscar', text: traduzirErro(err) })
  } finally {
    carregando.value = false
  }
}

</script>
