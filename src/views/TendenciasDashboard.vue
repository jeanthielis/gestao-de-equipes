<template>
  <div class="animate-fade-in max-w-7xl mx-auto space-y-6 pb-20">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-900">Tendências Operacionais</h2>
        <p class="text-slate-500 mt-1 text-sm">Evolução da conformidade, DDS e NCs ao longo do tempo.</p>
      </div>
      <div class="flex gap-2">
        <button v-for="p in periodos" :key="p.value" @click="periodoSelecionado = p.value; carregar()"
          :class="periodoSelecionado === p.value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Gráfico de conformidade ao longo do tempo -->
    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <i class="fa-solid fa-chart-line text-indigo-500"></i>
        Evolução da Conformidade (%)
      </h3>
      <div v-if="carregando" class="h-64 flex items-center justify-center text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
      </div>
      <apexchart v-else type="area" height="280" :options="chartConformidade.options" :series="chartConformidade.series" />
    </div>

    <!-- Linha do tempo: DDS vs NCs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i class="fa-solid fa-bullhorn text-amber-500"></i>
          DDS Aplicados por Período
        </h3>
        <apexchart v-if="!carregando" type="bar" height="220" :options="chartDDS.options" :series="chartDDS.series" />
      </div>

      <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i class="fa-solid fa-circle-xmark text-rose-500"></i>
          Não Conformidades por Período
        </h3>
        <apexchart v-if="!carregando" type="bar" height="220" :options="chartNCs.options" :series="chartNCs.series" />
      </div>
    </div>

    <!-- Tabela resumo por período -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 class="font-black text-slate-800">Resumo por Período</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
              <th class="px-6 py-3">Período</th>
              <th class="px-4 py-3 text-center">DDS</th>
              <th class="px-4 py-3 text-center">Avaliações</th>
              <th class="px-4 py-3 text-center text-emerald-600">Conformes</th>
              <th class="px-4 py-3 text-center text-amber-600">Parciais</th>
              <th class="px-4 py-3 text-center text-rose-600">NCs</th>
              <th class="px-4 py-3 text-center">Conformidade</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="resumoPeriodo.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-400">Sem dados para o período selecionado.</td>
            </tr>
            <tr v-for="r in resumoPeriodo" :key="r.periodo"
              class="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3 font-bold text-slate-700">{{ r.periodo }}</td>
              <td class="px-4 py-3 text-center font-mono text-slate-600">{{ r.dds }}</td>
              <td class="px-4 py-3 text-center font-mono text-slate-600">{{ r.total }}</td>
              <td class="px-4 py-3 text-center font-mono font-bold text-emerald-600">{{ r.C }}</td>
              <td class="px-4 py-3 text-center font-mono font-bold text-amber-600">{{ r.CP }}</td>
              <td class="px-4 py-3 text-center font-mono font-bold text-rose-600">{{ r.NC }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                      :class="r.conformidade >= 90 ? 'bg-emerald-500' : r.conformidade >= 60 ? 'bg-amber-400' : 'bg-rose-500'"
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, traduzirErro } from '../lib/alerts'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts
const carregando = ref(false)
const periodoSelecionado = ref('30d')
const periodos = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '3 meses' }
]

const resumoPeriodo = ref([])

const chartConformidade = ref({
  options: {
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#10b981'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { categories: [], labels: { style: { fontSize: '11px' } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => v + '%' } },
    tooltip: { y: { formatter: (v) => v + '%' } },
    grid: { borderColor: '#f1f5f9' }
  },
  series: [{ name: 'Conformidade', data: [] }]
})

const chartDDS = ref({
  options: {
    chart: { toolbar: { show: false } },
    colors: ['#f59e0b'],
    plotOptions: { bar: { borderRadius: 6 } },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9' }
  },
  series: [{ name: 'DDS', data: [] }]
})

const chartNCs = ref({
  options: {
    chart: { toolbar: { show: false } },
    colors: ['#f43f5e'],
    plotOptions: { bar: { borderRadius: 6 } },
    xaxis: { categories: [] },
    dataLabels: { enabled: false },
    grid: { borderColor: '#f1f5f9' }
  },
  series: [{ name: 'NCs', data: [] }]
})

const carregar = async () => {
  carregando.value = true

  try {
    const dias = periodoSelecionado.value === '7d' ? 7 : periodoSelecionado.value === '30d' ? 30 : 90
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - dias)

    const [{ data: avaliacoes }, { data: ddsAplicados }] = await Promise.all([
      supabase
        .from('diario_avaliacoes')
        .select('status, created_at')
        .gte('created_at', inicio.toISOString()),
      supabase
        .from('dds_aplicacoes')
        .select('data_aplicacao')
        .gte('data_aplicacao', inicio.toISOString().split('T')[0])
    ])

    // Agrupa por dia/semana dependendo do período
    const agruparPor = dias <= 14 ? 'dia' : 'semana'
    const grupos = {}

    // Gera os buckets
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const chave = agruparPor === 'dia'
        ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : `Sem ${Math.ceil((dias - i) / 7)}`
      if (!grupos[chave]) grupos[chave] = { C: 0, CP: 0, NC: 0, dds: 0 }
    }

    // Distribui avaliações
    ;(avaliacoes || []).forEach((a) => {
      const d = new Date(a.created_at)
      const chave = agruparPor === 'dia'
        ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : `Sem ${Math.ceil((dias - Math.floor((Date.now() - d.getTime()) / 86400000)) / 7)}`
      if (grupos[chave]) grupos[chave][a.status]++
    })

    // Distribui DDS
    ;(ddsAplicados || []).forEach((d) => {
      const dt = new Date(d.data_aplicacao)
      const chave = agruparPor === 'dia'
        ? dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : `Sem ${Math.ceil((dias - Math.floor((Date.now() - dt.getTime()) / 86400000)) / 7)}`
      if (grupos[chave]) grupos[chave].dds++
    })

    const labels = Object.keys(grupos)
    const gVals = Object.values(grupos)

    // Conformidade
    const conformidades = gVals.map((g) => {
      const total = g.C + g.CP + g.NC
      return total > 0 ? Math.round((g.C / total) * 100) : null
    })

    chartConformidade.value = {
      ...chartConformidade.value,
      options: { ...chartConformidade.value.options, xaxis: { categories: labels } },
      series: [{ name: 'Conformidade', data: conformidades }]
    }

    chartDDS.value = {
      ...chartDDS.value,
      options: { ...chartDDS.value.options, xaxis: { categories: labels } },
      series: [{ name: 'DDS', data: gVals.map((g) => g.dds) }]
    }

    chartNCs.value = {
      ...chartNCs.value,
      options: { ...chartNCs.value.options, xaxis: { categories: labels } },
      series: [{ name: 'NCs', data: gVals.map((g) => g.NC) }]
    }

    resumoPeriodo.value = labels.map((l, i) => {
      const g = gVals[i]
      const total = g.C + g.CP + g.NC
      return {
        periodo: l,
        dds: g.dds,
        total,
        C: g.C,
        CP: g.CP,
        NC: g.NC,
        conformidade: total > 0 ? Math.round((g.C / total) * 100) : 100
      }
    }).reverse()

  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao carregar tendências', text: traduzirErro(err) })
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>
