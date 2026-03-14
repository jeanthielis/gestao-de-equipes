<template>
  <div class="animate-fade-in max-w-7xl mx-auto space-y-6 pb-20">

    <!-- Cabeçalho -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-700 p-6 md:p-8 rounded-3xl shadow-lg text-white">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-black tracking-tight mb-1">Relatório de Apontamentos</h2>
          <p class="text-slate-300 text-sm">Acompanhe as avaliações individuais registradas pelos responsáveis por período, funcionário ou critério.</p>
        </div>
        <div class="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-sm font-bold shrink-0">
          <i class="fa-solid fa-clipboard-list text-emerald-400"></i>
          <span>{{ totalAvaliacoes }} apontamentos</span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Filtros de Pesquisa</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Data inicial -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">De</label>
          <input
            v-model="filtros.dataInicio"
            type="date"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-700"
          />
        </div>

        <!-- Data final -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Até</label>
          <input
            v-model="filtros.dataFim"
            type="date"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-700"
          />
        </div>

        <!-- Funcionário -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Funcionário</label>
          <div class="relative">
            <i class="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="filtros.nomeFuncionario"
              type="text"
              placeholder="Buscar por nome..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
          <select
            v-model="filtros.status"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-700"
          >
            <option value="">Todos</option>
            <option value="C">Conforme (C)</option>
            <option value="CP">Conf. Parcial (CP)</option>
            <option value="NC">Não Conforme (NC)</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          @click="buscar"
          :disabled="loading"
          class="flex-1 sm:flex-none bg-indigo-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <i v-if="loading" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </button>
        <button
          @click="limparFiltros"
          class="flex-1 sm:flex-none bg-slate-100 text-slate-600 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <i class="fa-solid fa-xmark mr-2"></i>Limpar
        </button>
        <button
          v-if="execucoes.length > 0"
          @click="exportarCSV"
          class="flex-1 sm:flex-none bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
          <i class="fa-solid fa-file-csv"></i>CSV
        </button>
      </div>
    </div>

    <!-- KPIs rápidos -->
    <div v-if="execucoes.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Execuções</p>
        <p class="text-3xl font-black text-slate-800">{{ execucoes.length }}</p>
      </div>
      <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
        <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Conformes</p>
        <p class="text-3xl font-black text-emerald-700">{{ kpis.totalC }}</p>
      </div>
      <div class="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Conf. Parcial</p>
        <p class="text-3xl font-black text-amber-700">{{ kpis.totalCP }}</p>
      </div>
      <div class="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-sm">
        <p class="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2">Não Conformes</p>
        <p class="text-3xl font-black text-rose-700">{{ kpis.totalNC }}</p>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-if="!loading && execucoes.length === 0" class="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
      <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl text-slate-300">
        <i class="fa-solid fa-clipboard-list"></i>
      </div>
      <p class="font-bold text-xl text-slate-600 mb-1">Nenhum apontamento encontrado</p>
      <p class="text-slate-400 text-sm">Ajuste os filtros ou registre um novo Diário de Bordo.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse">
        <div class="h-4 bg-slate-100 rounded-full w-1/3 mb-3"></div>
        <div class="h-3 bg-slate-100 rounded-full w-1/4 mb-6"></div>
        <div class="grid grid-cols-3 gap-3">
          <div class="h-12 bg-slate-100 rounded-xl"></div>
          <div class="h-12 bg-slate-100 rounded-xl"></div>
          <div class="h-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Lista de execuções -->
    <div v-if="!loading && execucoes.length > 0" class="space-y-5">
      <div
        v-for="exec in execucoes"
        :key="exec.id"
        class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <!-- Cabeçalho da execução -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0">
              <i class="fa-solid fa-clipboard-check text-sm"></i>
            </div>
            <div>
              <p class="font-black text-slate-800">
                {{ formatarDataCompleta(exec.created_at) }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                Registrado por:
                <span class="font-bold text-indigo-600">{{ exec.usuarios?.nome || 'Desconhecido' }}</span>
              </p>
            </div>
          </div>

          <!-- Badges de resumo da execução -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              <i class="fa-solid fa-check mr-1"></i>{{ contarStatus(exec.diario_avaliacoes, 'C') }} C
            </span>
            <span class="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              <i class="fa-solid fa-minus mr-1"></i>{{ contarStatus(exec.diario_avaliacoes, 'CP') }} CP
            </span>
            <span class="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              <i class="fa-solid fa-xmark mr-1"></i>{{ contarStatus(exec.diario_avaliacoes, 'NC') }} NC
            </span>
            <button
              @click="toggleExecucao(exec.id)"
              class="ml-2 w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              <i class="fa-solid text-xs" :class="execucoesAbertas.has(exec.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </div>
        </div>

        <!-- Detalhe por funcionário (expansível) -->
        <div v-if="execucoesAbertas.has(exec.id)">

          <!-- Agrupamento por funcionário -->
          <div
            v-for="func in getFuncionariosDaExecucao(exec)"
            :key="func.id"
            class="border-b border-slate-100 last:border-b-0"
          >
            <!-- Header do funcionário -->
            <div class="flex items-center justify-between px-6 py-3 bg-white">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {{ func.nome?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ func.nome }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">MAT: {{ func.matricula || 'S/N' }}</p>
                </div>
              </div>
              <!-- Mini barra de conformidade do funcionário -->
              <div class="hidden sm:flex items-center gap-2">
                <div class="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getCorBarra(getConformidadeFuncionario(exec, func.id))"
                    :style="{ width: getConformidadeFuncionario(exec, func.id) + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-black" :class="getCorTexto(getConformidadeFuncionario(exec, func.id))">
                  {{ getConformidadeFuncionario(exec, func.id) }}%
                </span>
              </div>
            </div>

            <!-- Tabela de avaliações do funcionário -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="bg-slate-50/80 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                    <th class="px-6 py-2">Critério Avaliado</th>
                    <th class="px-4 py-2 text-center">Status</th>
                    <th class="px-4 py-2">Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="aval in getAvaliacoesFuncionario(exec, func.id)"
                    :key="aval.id"
                    class="border-t border-slate-50 hover:bg-slate-50/50 transition-colors"
                    :class="{ 'bg-rose-50/30': aval.status === 'NC', 'bg-amber-50/30': aval.status === 'CP' }"
                  >
                    <td class="px-6 py-3 text-slate-700 font-medium">
                      {{ aval.itens_checklist?.descricao || '—' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                        :class="badgeClass(aval.status)"
                      >
                        <i class="fa-solid" :class="iconeStatus(aval.status)"></i>
                        {{ aval.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-500 text-xs italic">
                      {{ aval.justificativa || '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Rodapé: clique para expandir quando fechado -->
        <div
          v-if="!execucoesAbertas.has(exec.id)"
          @click="toggleExecucao(exec.id)"
          class="px-6 py-3 text-center text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border-t border-slate-100"
        >
          <i class="fa-solid fa-chevron-down mr-1"></i>
          Ver {{ getFuncionariosDaExecucao(exec).length }} funcionário(s) avaliado(s)
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, traduzirErro } from '../lib/alerts'
import { badgeClass, iconeStatus, getCorBarra, getCorTexto } from '../lib/utils'

// ── Estado ──────────────────────────────────────────────────────────────────
const execucoes = ref([])
const loading = ref(false)
const execucoesAbertas = ref(new Set())

// Filtros — data padrão: últimos 7 dias
const hoje = new Date()
const seteDiasAtras = new Date(hoje)
seteDiasAtras.setDate(hoje.getDate() - 7)

const filtros = ref({
  dataInicio: seteDiasAtras.toISOString().split('T')[0],
  dataFim: hoje.toISOString().split('T')[0],
  nomeFuncionario: '',
  status: ''
})

// ── KPIs calculados ──────────────────────────────────────────────────────────
const totalAvaliacoes = computed(() =>
  execucoes.value.reduce((acc, ex) => acc + (ex.diario_avaliacoes?.length || 0), 0)
)

const kpis = computed(() => {
  let C = 0, CP = 0, NC = 0
  execucoes.value.forEach((ex) => {
    ex.diario_avaliacoes?.forEach((a) => {
      if (a.status === 'C') C++
      else if (a.status === 'CP') CP++
      else if (a.status === 'NC') NC++
    })
  })
  return { totalC: C, totalCP: CP, totalNC: NC }
})

// ── Busca de dados ───────────────────────────────────────────────────────────
const buscar = async () => {
  loading.value = true
  execucoes.value = []
  execucoesAbertas.value = new Set()

  try {
    // Monta a query base com todos os joins necessários
    let query = supabase
      .from('diario_execucoes')
      .select(`
        id,
        created_at,
        registrado_por,
        usuarios!registrado_por (nome),
        diario_avaliacoes (
          id,
          status,
          justificativa,
          funcionario_id,
          quesito_id,
          funcionarios (id, nome, matricula, funcao),
          itens_checklist (descricao)
        )
      `)
      .order('created_at', { ascending: false })

    // Filtro de período
    if (filtros.value.dataInicio) {
      query = query.gte('created_at', filtros.value.dataInicio + 'T00:00:00')
    }
    if (filtros.value.dataFim) {
      query = query.lte('created_at', filtros.value.dataFim + 'T23:59:59')
    }

    const { data, error } = await query

    if (error) throw error

    let resultado = data || []

    // Filtro client-side por nome do funcionário (mais flexível)
    if (filtros.value.nomeFuncionario.trim()) {
      const busca = filtros.value.nomeFuncionario.trim().toLowerCase()
      resultado = resultado.filter((ex) =>
        ex.diario_avaliacoes?.some((a) =>
          a.funcionarios?.nome?.toLowerCase().includes(busca)
        )
      )
    }

    // Filtro client-side por status
    if (filtros.value.status) {
      resultado = resultado.filter((ex) =>
        ex.diario_avaliacoes?.some((a) => a.status === filtros.value.status)
      )
    }

    // Remove execuções sem avaliações após filtragem
    execucoes.value = resultado.filter((ex) => ex.diario_avaliacoes?.length > 0)

    if (execucoes.value.length === 0 && (filtros.value.nomeFuncionario || filtros.value.status)) {
      toast.fire({ icon: 'info', title: 'Nenhum resultado', text: 'Tente ajustar os filtros.' })
    }
  } catch (err) {
    console.error('[Apontamentos]', err)
    toast.fire({ icon: 'error', title: 'Erro ao carregar apontamentos', text: traduzirErro(err) })
  } finally {
    loading.value = false
  }
}

const limparFiltros = () => {
  filtros.value = {
    dataInicio: seteDiasAtras.toISOString().split('T')[0],
    dataFim: hoje.toISOString().split('T')[0],
    nomeFuncionario: '',
    status: ''
  }
  buscar()
}

// ── Helpers de dados ─────────────────────────────────────────────────────────
const toggleExecucao = (id) => {
  const s = new Set(execucoesAbertas.value)
  s.has(id) ? s.delete(id) : s.add(id)
  execucoesAbertas.value = s
}

const getFuncionariosDaExecucao = (exec) => {
  const map = new Map()
  exec.diario_avaliacoes?.forEach((a) => {
    if (a.funcionarios && !map.has(a.funcionario_id)) {
      map.set(a.funcionario_id, a.funcionarios)
    }
  })
  return Array.from(map.values())
}

const getAvaliacoesFuncionario = (exec, funcId) => {
  let avaliacoes = exec.diario_avaliacoes?.filter((a) => a.funcionario_id === funcId) || []
  // Se houver filtro de status ativo, destaca apenas o filtrado mas mostra todos
  return avaliacoes
}

const contarStatus = (avaliacoes, status) =>
  (avaliacoes || []).filter((a) => a.status === status).length

const getConformidadeFuncionario = (exec, funcId) => {
  const avals = exec.diario_avaliacoes?.filter((a) => a.funcionario_id === funcId) || []
  if (!avals.length) return 0
  const conformes = avals.filter((a) => a.status === 'C').length
  return Math.round((conformes / avals.length) * 100)
}

const formatarDataCompleta = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const exportarCSV = () => {
  const linhas = [['Data Execucao', 'Responsavel', 'Funcionario', 'Matricula', 'Criterio', 'Status', 'Justificativa']]
  execucoes.value.forEach((exec) => {
    exec.diario_avaliacoes?.forEach((a) => {
      linhas.push([
        new Date(exec.created_at).toLocaleString('pt-BR'),
        exec.usuarios?.nome || '',
        a.funcionarios?.nome || '',
        a.funcionarios?.matricula || '',
        a.itens_checklist?.descricao || '',
        a.status,
        (a.justificativa || '').replace(/"/g, '""')
      ])
    })
  })
  const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `apontamentos_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(buscar)
</script>
