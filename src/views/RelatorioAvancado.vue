<template>
  <div class="animate-fade-in max-w-7xl mx-auto space-y-6 pb-20">

    <!-- Cabeçalho -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-700 p-6 md:p-8 rounded-3xl shadow-lg text-white">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-black tracking-tight mb-1">Relatórios Avançados</h2>
          <p class="text-slate-300 text-sm">Ranking, evolução individual, comparação entre períodos e filtros personalizados.</p>
        </div>
        <button @click="exportarRelatorio" :disabled="carregando"
          class="flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50 shrink-0">
          <i class="fa-solid fa-file-pdf text-rose-500"></i> Exportar PDF
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Presets rápidos -->
        <div class="flex gap-2 flex-wrap">
          <button v-for="p in presets" :key="p.label" @click="aplicarPreset(p)"
            :class="presetAtivo === p.label ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            class="px-4 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm">
            {{ p.label }}
          </button>
        </div>

        <div class="flex-1 min-w-[280px] flex gap-3 items-end">
          <div class="flex-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">De</label>
            <input v-model="filtros.dataInicio" type="date" @change="presetAtivo = 'Personalizado'; buscar()"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Até</label>
            <input v-model="filtros.dataFim" type="date" @change="presetAtivo = 'Personalizado'; buscar()"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white" />
          </div>
        </div>

        <!-- Toggle comparação -->
        <label class="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <div class="relative w-9 h-5">
            <input type="checkbox" v-model="modoComparacao" class="sr-only" @change="buscar()">
            <div class="w-9 h-5 rounded-full transition-colors" :class="modoComparacao ? 'bg-indigo-600' : 'bg-slate-200'"></div>
            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" :class="modoComparacao ? 'translate-x-4' : ''"></div>
          </div>
          <span class="text-xs font-bold text-slate-600 whitespace-nowrap">Comparar períodos</span>
        </label>

        <!-- Período de comparação -->
        <div v-if="modoComparacao" class="flex gap-3 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Período anterior — De</label>
            <input v-model="filtros.compInicio" type="date" @change="buscar()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400 text-sm bg-slate-50 w-40" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Até</label>
            <input v-model="filtros.compFim" type="date" @change="buscar()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-400 text-sm bg-slate-50 w-40" />
          </div>
        </div>

        <button @click="buscar" :disabled="carregando"
          class="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2 shrink-0">
          <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </button>
      </div>
    </div>

    <!-- KPIs gerais -->
    <div v-if="dados.avaliacoes.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total avaliações</p>
        <p class="text-3xl font-black text-slate-800">{{ kpis.total }}</p>
        <p v-if="modoComparacao" class="text-xs mt-1" :class="kpis.totalDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'">
          {{ kpis.totalDelta >= 0 ? '▲' : '▼' }} {{ Math.abs(kpis.totalDelta) }} vs anterior
        </p>
      </div>
      <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
        <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Conformidade</p>
        <p class="text-3xl font-black text-emerald-700">{{ kpis.conformidade }}%</p>
        <p v-if="modoComparacao" class="text-xs mt-1" :class="kpis.conformidadeDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'">
          {{ kpis.conformidadeDelta >= 0 ? '▲' : '▼' }} {{ Math.abs(kpis.conformidadeDelta) }}% vs anterior
        </p>
      </div>
      <div class="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Conf. Parcial</p>
        <p class="text-3xl font-black text-amber-700">{{ kpis.totalCP }}</p>
      </div>
      <div class="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm">
        <p class="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Não conformes</p>
        <p class="text-3xl font-black text-rose-700">{{ kpis.totalNC }}</p>
        <p v-if="modoComparacao" class="text-xs mt-1" :class="kpis.ncDelta <= 0 ? 'text-emerald-600' : 'text-rose-600'">
          {{ kpis.ncDelta <= 0 ? '▼' : '▲' }} {{ Math.abs(kpis.ncDelta) }} vs anterior
        </p>
      </div>
    </div>

    <!-- Comparação lado a lado -->
    <div v-if="modoComparacao && dados.comparacao.length > 0" class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h3 class="font-black text-slate-800 mb-5 flex items-center gap-2">
        <i class="fa-solid fa-code-compare text-indigo-500"></i>
        Comparação entre períodos
      </h3>
      <apexchart type="bar" height="240" :options="chartComparacao.options" :series="chartComparacao.series" />
    </div>

    <!-- Ranking por equipe/setor -->
    <div v-if="rankingEquipes.length > 0" class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-black text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-trophy text-amber-500"></i>
          Ranking de Conformidade por Equipe
        </h3>
        <div class="flex gap-2">
          <button @click="visaoRanking = 'equipe'" :class="visaoRanking === 'equipe' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Equipe</button>
          <button @click="visaoRanking = 'setor'"  :class="visaoRanking === 'setor'  ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all">Setor</button>
        </div>
      </div>
      <div class="p-6">
        <apexchart type="bar" height="260" :options="chartRanking.options" :series="chartRanking.series" />
      </div>
      <!-- Tabela ranking -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-t border-slate-100">
            <tr>
              <th class="px-6 py-3">#</th>
              <th class="px-4 py-3">{{ visaoRanking === 'equipe' ? 'Equipe' : 'Setor' }}</th>
              <th class="px-4 py-3 text-center">Avaliações</th>
              <th class="px-4 py-3 text-center text-emerald-600">Conformes</th>
              <th class="px-4 py-3 text-center text-rose-600">NCs</th>
              <th class="px-4 py-3 text-center">Conformidade</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rankingAtual" :key="r.nome"
              class="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  :class="i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'">
                  {{ i + 1 }}
                </span>
              </td>
              <td class="px-4 py-3 font-bold text-slate-800">{{ r.nome }}</td>
              <td class="px-4 py-3 text-center font-mono text-slate-600">{{ r.total }}</td>
              <td class="px-4 py-3 text-center font-bold text-emerald-600">{{ r.C }}</td>
              <td class="px-4 py-3 text-center font-bold text-rose-600">{{ r.NC }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="r.conformidade >= 90 ? 'bg-emerald-500' : r.conformidade >= 60 ? 'bg-amber-400' : 'bg-rose-500'"
                      :style="{ width: r.conformidade + '%' }"></div>
                  </div>
                  <span class="text-xs font-black w-10 text-right"
                    :class="r.conformidade >= 90 ? 'text-emerald-600' : r.conformidade >= 60 ? 'text-amber-600' : 'text-rose-600'">
                    {{ r.conformidade }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Evolução por funcionário -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h3 class="font-black text-slate-800 flex items-center gap-2">
          <i class="fa-solid fa-chart-line text-indigo-500"></i>
          Evolução Individual
        </h3>
        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input v-model="buscaFuncionario" type="text" placeholder="Buscar funcionário..."
            class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div v-if="funcionariosFiltrados.length === 0" class="text-center py-10 text-slate-400">
        <i class="fa-solid fa-users text-3xl block mb-2 text-slate-300"></i>
        <p class="font-bold text-slate-500">Nenhum funcionário encontrado.</p>
        <p class="text-xs mt-1">Aplique os filtros de período e clique em Buscar.</p>
      </div>

      <div v-else>
        <!-- Selector de funcionário -->
        <div class="flex flex-wrap gap-2 mb-5">
          <button v-for="f in funcionariosFiltrados.slice(0, 8)" :key="f.id"
            @click="toggleFuncionario(f)"
            :class="funcionariosSelecionados.has(f.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm">
            {{ f.nome.split(' ')[0] }}
          </button>
          <span v-if="funcionariosFiltrados.length > 8" class="px-3 py-1.5 text-xs text-slate-400 font-bold">
            +{{ funcionariosFiltrados.length - 8 }} mais
          </span>
        </div>

        <apexchart v-if="funcionariosSelecionados.size > 0"
          type="line" height="300"
          :options="chartEvolucao.options"
          :series="chartEvolucao.series" />
        <div v-else class="text-center py-8 text-slate-400 text-sm">
          Selecione um ou mais funcionários acima para ver a evolução.
        </div>
      </div>
    </div>

    <!-- Top NCs por critério -->
    <div v-if="topCriterios.length > 0" class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h3 class="font-black text-slate-800 mb-5 flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation text-rose-500"></i>
        Top Critérios com Mais Desvios
      </h3>
      <div class="space-y-3">
        <div v-for="(c, i) in topCriterios" :key="c.descricao" class="flex items-center gap-3">
          <span class="text-xs font-black text-slate-400 w-5 text-right shrink-0">{{ i + 1 }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <p class="text-sm font-bold text-slate-700 truncate mr-2">{{ c.descricao }}</p>
              <span class="text-xs font-black text-rose-600 shrink-0">{{ c.total }}×</span>
            </div>
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-rose-400 transition-all"
                :style="{ width: (c.total / topCriterios[0].total * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { toast, traduzirErro } from '../lib/alerts'
import { gerarRelatorioAvancadoPDF } from '../lib/relatoriosPDF'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const authStore = useAuthStore()

// ── Estado ──────────────────────────────────────────────────
const carregando    = ref(false)
const modoComparacao = ref(false)
const visaoRanking  = ref('equipe')
const buscaFuncionario = ref('')
const funcionariosSelecionados = ref(new Set())
const presetAtivo   = ref('30 dias')

const dados = ref({ avaliacoes: [], comparacao: [], estrutura: [] })

const hoje = new Date()
const diasAtras = (n) => {
  const d = new Date(hoje)
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const filtros = ref({
  dataInicio: diasAtras(30),
  dataFim:    hoje.toISOString().split('T')[0],
  compInicio: diasAtras(60),
  compFim:    diasAtras(31),
})

const presets = [
  { label: '7 dias',    dias: 7 },
  { label: '30 dias',   dias: 30 },
  { label: '90 dias',   dias: 90 },
  { label: 'Este mês',  tipo: 'mes' },
  { label: 'Mês anterior', tipo: 'mes_ant' },
]

const aplicarPreset = (p) => {
  presetAtivo.value = p.label
  if (p.tipo === 'mes') {
    filtros.value.dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
    filtros.value.dataFim    = hoje.toISOString().split('T')[0]
  } else if (p.tipo === 'mes_ant') {
    const ini = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    filtros.value.dataInicio = ini.toISOString().split('T')[0]
    filtros.value.dataFim    = fim.toISOString().split('T')[0]
  } else {
    filtros.value.dataInicio = diasAtras(p.dias)
    filtros.value.dataFim    = hoje.toISOString().split('T')[0]
  }
  buscar()
}

// ── Busca ────────────────────────────────────────────────────
const buscar = async () => {
  carregando.value = true
  funcionariosSelecionados.value = new Set()
  try {
    const ini = filtros.value.dataInicio + 'T00:00:00'
    const fim = filtros.value.dataFim    + 'T23:59:59'
    const eqId = authStore.isSuperAdmin ? null : authStore.equipeId

    let qPrincipal = supabase.from('diario_avaliacoes').select(`
        id, status, funcionario_id, quesito_id, created_at,
        funcionarios ( id, nome, matricula, funcao, equipe_id,
          equipes ( nome, setores ( nome, unidades(nome) ) )
        ),
        itens_checklist ( descricao )
      `).gte('created_at', ini).lte('created_at', fim).order('created_at')

    if (eqId) {
      qPrincipal = qPrincipal.eq('funcionarios.equipe_id', eqId)
    }

    const queries = [qPrincipal]

    if (modoComparacao.value && filtros.value.compInicio && filtros.value.compFim) {
      let qComp = supabase.from('diario_avaliacoes').select('id, status, created_at')
        .gte('created_at', filtros.value.compInicio + 'T00:00:00')
        .lte('created_at', filtros.value.compFim    + 'T23:59:59')
      queries.push(qComp)
    }
    const results = await Promise.all(queries)
    let avaliacoesBruto = results[0].data || []

    // Filtragem extra no cliente para garantir isolamento de equipe
    if (!authStore.isSuperAdmin && authStore.equipeId) {
      avaliacoesBruto = avaliacoesBruto.filter(
        a => a.funcionarios?.equipe_id === authStore.equipeId
      )
    }

    dados.value.avaliacoes = avaliacoesBruto
    dados.value.comparacao = results[1]?.data || []

    if (results[0].error) throw results[0].error
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao carregar dados', text: traduzirErro(err) })
  } finally {
    carregando.value = false
  }
}

// ── KPIs ─────────────────────────────────────────────────────
const calcKpis = (lista) => {
  const C  = lista.filter(a => a.status === 'C').length
  const CP = lista.filter(a => a.status === 'CP').length
  const NC = lista.filter(a => a.status === 'NC').length
  const total = C + CP + NC
  return { total, totalC: C, totalCP: CP, totalNC: NC, conformidade: total ? Math.round(C / total * 100) : 0 }
}

const kpis = computed(() => {
  const atual = calcKpis(dados.value.avaliacoes)
  if (!modoComparacao.value || !dados.value.comparacao.length) return atual
  const ant = calcKpis(dados.value.comparacao)
  return {
    ...atual,
    totalDelta:        atual.total - ant.total,
    conformidadeDelta: atual.conformidade - ant.conformidade,
    ncDelta:           atual.totalNC - ant.totalNC,
  }
})

// ── Ranking ──────────────────────────────────────────────────
const rankingEquipes = computed(() => {
  const mapa = {}
  dados.value.avaliacoes.forEach(a => {
    const equipe = a.funcionarios?.equipes?.nome || 'Sem equipe'
    const setor  = a.funcionarios?.equipes?.setores?.nome || 'Sem setor'
    const chave = visaoRanking.value === 'equipe' ? equipe : setor
    if (!mapa[chave]) mapa[chave] = { nome: chave, total: 0, C: 0, CP: 0, NC: 0 }
    mapa[chave].total++
    mapa[chave][a.status]++
  })
  return Object.values(mapa)
    .map(r => ({ ...r, conformidade: r.total ? Math.round(r.C / r.total * 100) : 0 }))
    .sort((a, b) => b.conformidade - a.conformidade)
})

const rankingSetores = computed(() => {
  const mapa = {}
  dados.value.avaliacoes.forEach(a => {
    const chave = a.funcionarios?.equipes?.setores?.nome || 'Sem setor'
    if (!mapa[chave]) mapa[chave] = { nome: chave, total: 0, C: 0, CP: 0, NC: 0 }
    mapa[chave].total++
    mapa[chave][a.status]++
  })
  return Object.values(mapa)
    .map(r => ({ ...r, conformidade: r.total ? Math.round(r.C / r.total * 100) : 0 }))
    .sort((a, b) => b.conformidade - a.conformidade)
})

const rankingAtual = computed(() =>
  visaoRanking.value === 'equipe' ? rankingEquipes.value : rankingSetores.value
)

// ── Top critérios ────────────────────────────────────────────
const topCriterios = computed(() => {
  const mapa = {}
  dados.value.avaliacoes
    .filter(a => a.status === 'NC' || a.status === 'CP')
    .forEach(a => {
      const desc = a.itens_checklist?.descricao || 'Desconhecido'
      mapa[desc] = (mapa[desc] || 0) + 1
    })
  return Object.entries(mapa)
    .map(([descricao, total]) => ({ descricao, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
})

// ── Funcionários ─────────────────────────────────────────────
const todosFuncionarios = computed(() => {
  const mapa = {}
  dados.value.avaliacoes.forEach(a => {
    if (a.funcionarios && !mapa[a.funcionario_id]) {
      mapa[a.funcionario_id] = { id: a.funcionario_id, nome: a.funcionarios.nome }
    }
  })
  return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome))
})

const funcionariosFiltrados = computed(() => {
  if (!buscaFuncionario.value) return todosFuncionarios.value
  const t = buscaFuncionario.value.toLowerCase()
  return todosFuncionarios.value.filter(f => f.nome.toLowerCase().includes(t))
})

const toggleFuncionario = (f) => {
  const s = new Set(funcionariosSelecionados.value)
  s.has(f.id) ? s.delete(f.id) : s.add(f.id)
  funcionariosSelecionados.value = s
}

// ── Charts ───────────────────────────────────────────────────
const chartRanking = computed(() => {
  const lista = rankingAtual.value.slice(0, 10)
  return {
    options: {
      chart: { toolbar: { show: false } },
      colors: lista.map(r => r.conformidade >= 90 ? '#10b981' : r.conformidade >= 60 ? '#f59e0b' : '#f43f5e'),
      plotOptions: { bar: { borderRadius: 6, horizontal: true, distributed: true } },
      legend: { show: false },
      xaxis: { categories: lista.map(r => r.nome), min: 0, max: 100, labels: { formatter: v => v + '%' } },
      dataLabels: { formatter: v => v + '%' },
      grid: { borderColor: '#f1f5f9' },
    },
    series: [{ name: 'Conformidade', data: lista.map(r => r.conformidade) }]
  }
})

const chartComparacao = computed(() => {
  const atual = calcKpis(dados.value.avaliacoes)
  const ant   = calcKpis(dados.value.comparacao)
  return {
    options: {
      chart: { toolbar: { show: false } },
      colors: ['#6366f1', '#94a3b8'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      xaxis: { categories: ['Conformes', 'Conf. Parcial', 'Não Conformes', 'Conformidade (%)'] },
      dataLabels: { enabled: true },
      grid: { borderColor: '#f1f5f9' },
      legend: { position: 'top' },
    },
    series: [
      { name: 'Período atual',    data: [atual.totalC, atual.totalCP, atual.totalNC, atual.conformidade] },
      { name: 'Período anterior', data: [ant.totalC,   ant.totalCP,   ant.totalNC,   ant.conformidade]  },
    ]
  }
})

const chartEvolucao = computed(() => {
  const selecionados = [...funcionariosSelecionados.value]
  if (!selecionados.length) return { options: {}, series: [] }

  // Agrupa por dia
  const dias = {}
  dados.value.avaliacoes.forEach(a => {
    const dia = a.created_at.split('T')[0]
    if (!dias[dia]) dias[dia] = {}
    selecionados.forEach(id => {
      if (!dias[dia][id]) dias[dia][id] = { C: 0, total: 0 }
    })
    if (selecionados.includes(a.funcionario_id)) {
      dias[a.created_at.split('T')[0]][a.funcionario_id].total++
      if (a.status === 'C') dias[a.created_at.split('T')[0]][a.funcionario_id].C++
    }
  })

  const labels = Object.keys(dias).sort()
  const cores = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

  const series = selecionados.map((id, i) => {
    const func = todosFuncionarios.value.find(f => f.id === id)
    return {
      name: func?.nome.split(' ')[0] || id,
      data: labels.map(dia => {
        const d = dias[dia]?.[id]
        return d?.total ? Math.round(d.C / d.total * 100) : null
      }),
      color: cores[i % cores.length]
    }
  })

  return {
    options: {
      chart: { toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { width: 3, curve: 'smooth' },
      markers: { size: 4 },
      xaxis: { categories: labels.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) },
      yaxis: { min: 0, max: 100, labels: { formatter: v => v + '%' } },
      tooltip: { y: { formatter: v => v + '%' } },
      grid: { borderColor: '#f1f5f9' },
      legend: { position: 'top' },
      noData: { text: 'Sem avaliações no período' },
    },
    series
  }
})

const exportarRelatorio = async () => {
  if (!dados.value.avaliacoes.length) {
    toast.fire({ icon: 'warning', title: 'Busque os dados primeiro.' })
    return
  }
  await gerarRelatorioAvancadoPDF({
    filtros: filtros.value,
    kpis: kpis.value,
    ranking: rankingAtual.value,
    topCriterios: topCriterios.value,
    periodo: presetAtivo.value,
  })
}

onMounted(buscar)
</script>
