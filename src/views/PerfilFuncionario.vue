<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">

    <!-- Busca -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 class="text-2xl font-black text-slate-900 mb-1">Perfil do Funcionário</h2>
      <p class="text-slate-500 text-sm mb-5">Busque por <strong>matrícula</strong> ou <strong>nome</strong> para visualizar o histórico completo.</p>
      <form @submit.prevent="buscarFuncionario" class="flex gap-3">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            v-model="termoBusca"
            type="text"
            placeholder="Matrícula ou nome do colaborador..."
            class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <button type="submit" :disabled="carregando || !termoBusca.trim()"
          class="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2">
          <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
          <i v-else class="fa-solid fa-magnifying-glass"></i>
          Buscar
        </button>
      </form>

      <!-- Múltiplos resultados -->
      <div v-if="multiplosResultados.length > 1" class="mt-4 space-y-2">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ multiplosResultados.length }} colaboradores encontrados — selecione um:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            v-for="f in multiplosResultados" :key="f.id"
            @click="selecionarFuncionario(f)"
            class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left">
            <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-black flex items-center justify-center text-sm shrink-0">
              {{ f.nome?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-slate-800 text-sm">{{ f.nome }}</p>
              <p class="text-xs text-slate-400 font-mono">MAT: {{ f.matricula || 'S/N' }} · {{ f.funcao || 'Operador' }}</p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Não encontrado -->
    <div v-if="buscaFeita && !funcionario && multiplosResultados.length === 0"
      class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-600">
      <i class="fa-solid fa-user-xmark text-3xl mb-2 block"></i>
      <p class="font-bold">Nenhum colaborador encontrado com este termo.</p>
      <p class="text-sm mt-1 text-rose-400">Tente a matrícula completa ou parte do nome.</p>
    </div>

    <!-- Perfil completo -->
    <template v-if="funcionario">

      <!-- Header identidade -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl font-black shadow-lg shrink-0">
            {{ funcionario.nome?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-black tracking-tight">{{ funcionario.nome }}</h3>
            <p class="text-slate-300 text-sm mt-1">{{ funcionario.funcao || 'Operador' }}</p>
            <div class="flex flex-wrap gap-3 mt-3">
              <span class="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-xs font-bold font-mono">
                MAT: {{ funcionario.matricula || 'S/N' }}
              </span>
              <span v-if="funcionario.equipes?.nome" class="bg-white/10 border border-white/20 px-3 py-1 rounded-lg text-xs font-bold">
                <i class="fa-solid fa-users mr-1 opacity-60"></i>{{ funcionario.equipes.nome }}
              </span>
              <span class="px-3 py-1 rounded-lg text-xs font-bold border"
                :class="funcionario.ativo ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-rose-500/20 border-rose-400/30 text-rose-300'">
                {{ funcionario.ativo ? '● Ativo' : '○ Inativo' }}
              </span>
            </div>
          </div>
          <div class="flex flex-col gap-2 shrink-0">
            <div class="text-center bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conformidade Geral</p>
              <p class="text-4xl font-black" :class="getCorTexto(indiceGeral)">{{ indiceGeral }}%</p>
              <div class="w-24 h-1.5 bg-slate-700 rounded-full mt-2 mx-auto overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="getCorBarra(indiceGeral)" :style="{ width: indiceGeral + '%' }"></div>
              </div>
            </div>
            <button @click="exportarFicha"
              class="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
              <i class="fa-solid fa-file-pdf text-rose-400"></i> Exportar Ficha
            </button>
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

      <!-- Análise por IA -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <i class="fa-solid fa-wand-magic-sparkles text-white text-xs"></i>
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">Análise de Perfil por IA</h4>
              <p class="text-xs text-slate-500">Diagnóstico baseado nos apontamentos e participações em DDS</p>
            </div>
          </div>
          <button @click="gerarAnaliseIA" :disabled="gerandoIA"
            class="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2">
            <i v-if="gerandoIA" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-arrows-rotate"></i>
            {{ analiseIA ? 'Regenerar' : 'Gerar Análise' }}
          </button>
        </div>
        <div class="p-6">
          <div v-if="gerandoIA" class="flex items-center gap-3 text-indigo-600 py-4">
            <i class="fa-solid fa-circle-notch fa-spin text-xl"></i>
            <span class="text-sm font-bold">Analisando dados do colaborador...</span>
          </div>
          <div v-else-if="analiseIA" class="space-y-4">
            <!-- Nível de risco -->
            <div class="flex items-center gap-3 p-4 rounded-xl border"
              :class="{
                'bg-emerald-50 border-emerald-200': analiseIA.nivel === 'Baixo',
                'bg-amber-50 border-amber-200': analiseIA.nivel === 'Médio',
                'bg-rose-50 border-rose-200': analiseIA.nivel === 'Alto'
              }">
              <i class="fa-solid fa-shield-halved text-2xl"
                :class="{
                  'text-emerald-500': analiseIA.nivel === 'Baixo',
                  'text-amber-500': analiseIA.nivel === 'Médio',
                  'text-rose-500': analiseIA.nivel === 'Alto'
                }"></i>
              <div>
                <p class="text-xs font-black uppercase tracking-widest"
                  :class="{
                    'text-emerald-600': analiseIA.nivel === 'Baixo',
                    'text-amber-600': analiseIA.nivel === 'Médio',
                    'text-rose-600': analiseIA.nivel === 'Alto'
                  }">Nível de Atenção: {{ analiseIA.nivel }}</p>
                <p class="text-sm font-medium text-slate-700 mt-0.5">{{ analiseIA.resumo }}</p>
              </div>
            </div>
            <!-- Pontos fortes -->
            <div v-if="analiseIA.pontosFortes?.length">
              <p class="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">
                <i class="fa-solid fa-circle-check mr-1"></i>Pontos Fortes
              </p>
              <ul class="space-y-1">
                <li v-for="p in analiseIA.pontosFortes" :key="p" class="text-sm text-slate-700 flex items-start gap-2">
                  <span class="text-emerald-500 mt-0.5 shrink-0">●</span>{{ p }}
                </li>
              </ul>
            </div>
            <!-- Pontos de atenção -->
            <div v-if="analiseIA.pontosAtencao?.length">
              <p class="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">
                <i class="fa-solid fa-triangle-exclamation mr-1"></i>Pontos de Atenção
              </p>
              <ul class="space-y-1">
                <li v-for="p in analiseIA.pontosAtencao" :key="p" class="text-sm text-slate-700 flex items-start gap-2">
                  <span class="text-amber-500 mt-0.5 shrink-0">●</span>{{ p }}
                </li>
              </ul>
            </div>
            <!-- Recomendações -->
            <div v-if="analiseIA.recomendacoes?.length">
              <p class="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">
                <i class="fa-solid fa-lightbulb mr-1"></i>Recomendações
              </p>
              <ul class="space-y-1">
                <li v-for="r in analiseIA.recomendacoes" :key="r" class="text-sm text-slate-700 flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5 shrink-0">→</span>{{ r }}
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="text-center py-8 text-slate-400">
            <i class="fa-solid fa-wand-magic-sparkles text-4xl mb-3 block text-slate-200"></i>
            <p class="text-sm">Clique em <strong class="text-slate-600">Gerar Análise</strong> para obter um diagnóstico baseado nos dados do colaborador.</p>
          </div>
        </div>
      </div>

      <!-- Top problemas -->
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
                <div class="h-full rounded-full bg-rose-400 transition-all"
                  :style="{ width: (p.total / Math.max(kpis.totalNC + kpis.totalCP, 1) * 100) + '%' }"></div>
              </div>
            </div>
            <span class="text-sm font-black text-rose-600 shrink-0">{{ p.total }}x</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex border-b border-slate-100">
          <button @click="abaAtiva = 'apontamentos'"
            class="flex-1 py-4 text-sm font-black transition-colors flex items-center justify-center gap-2"
            :class="abaAtiva === 'apontamentos' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'">
            <i class="fa-solid fa-clipboard-list"></i>
            Apontamentos
            <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{{ avaliacoes.length }}</span>
          </button>
          <button @click="abaAtiva = 'dds'"
            class="flex-1 py-4 text-sm font-black transition-colors flex items-center justify-center gap-2"
            :class="abaAtiva === 'dds' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700'">
            <i class="fa-solid fa-chalkboard-user"></i>
            DDS Participados
            <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{{ participacoesDDS.length }}</span>
          </button>
        </div>

        <!-- Aba Apontamentos -->
        <div v-if="abaAtiva === 'apontamentos'" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100 bg-slate-50">
                <th class="px-6 py-3">Data</th>
                <th class="px-4 py-3">Critério</th>
                <th class="px-4 py-3 text-center">Status</th>
                <th class="px-4 py-3">Justificativa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="avaliacoes.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-slate-400">Nenhum apontamento registrado.</td>
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

        <!-- Aba DDS -->
        <div v-if="abaAtiva === 'dds'">
          <div v-if="participacoesDDS.length === 0" class="p-10 text-center text-slate-400 text-sm">
            <i class="fa-solid fa-chalkboard-user text-4xl block mb-3 text-slate-200"></i>
            Nenhuma participação em DDS registrada.
          </div>
          <div v-else class="divide-y divide-slate-50">
            <div v-for="(p, i) in participacoesDDS" :key="p.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0">
                  {{ participacoesDDS.length - i }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ p.dds_aplicacoes?.dds_temas?.titulo || 'Tema removido' }}</p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ formatarData(p.dds_aplicacoes?.data_aplicacao) }}</p>
                </div>
              </div>
              <span v-if="p.imagem_assinatura"
                class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <i class="fa-solid fa-signature"></i>Assinou
              </span>
              <span v-else class="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Sem assinatura
              </span>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { toast, traduzirErro } from '../lib/alerts'
import { badgeClass, iconeStatus, getCorBarra, getCorTexto, formatarData } from '../lib/utils'
import { gerarFichaFuncionarioPDF } from '../lib/relatoriosPDF'

const authStore = useAuthStore()

const termoBusca = ref('')
const funcionario = ref(null)
const multiplosResultados = ref([])
const avaliacoes = ref([])
const participacoesDDS = ref([])
const carregando = ref(false)
const buscaFeita = ref(false)
const abaAtiva = ref('apontamentos')
const analiseIA = ref(null)
const gerandoIA = ref(false)

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

// ── Busca ──────────────────────────────────────────────────────
const buscarFuncionario = async () => {
  const termo = termoBusca.value.trim()
  if (!termo) return

  carregando.value = true
  buscaFeita.value = false
  funcionario.value = null
  multiplosResultados.value = []
  avaliacoes.value = []
  participacoesDDS.value = []
  analiseIA.value = null

  try {
    let query = supabase
      .from('funcionarios')
      .select('*, equipes(nome, setores(nome, unidades(nome)))')

    // Restringe à equipe do usuário logado (exceto SuperAdmin)
    if (!authStore.isSuperAdmin && authStore.equipeId) {
      query = query.eq('equipe_id', authStore.equipeId)
    }

    // Detecta se é matrícula (curta, sem espaços) ou nome
    const ehMatricula = !termo.includes(' ') && termo.length <= 15
    if (ehMatricula) {
      query = query.eq('matricula', termo)
    } else {
      query = query.ilike('nome', `%${termo}%`)
    }

    const { data: resultados, error } = await query.limit(10)
    if (error) throw error

    buscaFeita.value = true

    if (!resultados || resultados.length === 0) {
      toast.fire({ icon: 'warning', title: 'Não encontrado', text: 'Nenhum colaborador encontrado com este termo.' })
      return
    }

    if (resultados.length === 1) {
      await carregarDadosFuncionario(resultados[0])
    } else {
      multiplosResultados.value = resultados
    }
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao buscar', text: traduzirErro(err) })
  } finally {
    carregando.value = false
  }
}

const selecionarFuncionario = async (f) => {
  multiplosResultados.value = []
  await carregarDadosFuncionario(f)
}

const carregarDadosFuncionario = async (func) => {
  funcionario.value = func
  analiseIA.value = null
  abaAtiva.value = 'apontamentos'

  const [{ data: avals }, { data: dds }] = await Promise.all([
    supabase
      .from('diario_avaliacoes')
      .select('id, status, justificativa, created_at, itens_checklist(descricao), diario_execucoes(created_at)')
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
}

// ── Análise IA ─────────────────────────────────────────────────
const gerarAnaliseIA = async () => {
  if (!funcionario.value) return
  gerandoIA.value = true
  analiseIA.value = null

  try {
    const totalAvals = kpis.value.totalC + kpis.value.totalCP + kpis.value.totalNC
    const problemasList = topProblemas.value.map(p => `"${p.descricao}" (${p.total}x)`).join(', ')
    const ultimosDDS = participacoesDDS.value.slice(0, 5)
      .map(p => p.dds_aplicacoes?.dds_temas?.titulo || 'Tema desconhecido')
      .join(', ')

    const prompt = `Você é um analista de segurança operacional. Analise o perfil do colaborador abaixo e responda APENAS com um JSON válido, sem markdown, sem texto antes ou depois.

Colaborador: ${funcionario.value.nome}
Função: ${funcionario.value.funcao || 'Operador'}
Equipe: ${funcionario.value.equipes?.nome || 'Não informada'}
Total de avaliações: ${totalAvals}
Conformes (C): ${kpis.value.totalC}
Conformidade Parcial (CP): ${kpis.value.totalCP}
Não Conformes (NC): ${kpis.value.totalNC}
Índice de conformidade: ${indiceGeral.value}%
DDS participados: ${kpis.value.totalDDS}
Últimos temas DDS: ${ultimosDDS || 'Nenhum'}
Critérios mais problemáticos: ${problemasList || 'Nenhum desvio registrado'}

Responda SOMENTE com este JSON (sem markdown):
{
  "nivel": "Baixo",
  "resumo": "Uma frase objetiva sobre o perfil",
  "pontosFortes": ["ponto 1", "ponto 2"],
  "pontosAtencao": ["ponto 1"],
  "recomendacoes": ["ação 1", "ação 2"]
}
O campo nivel deve ser exatamente "Baixo", "Médio" ou "Alto".`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    const texto = data.content?.[0]?.text || ''
    const match = texto.match(/\{[\s\S]*\}/)
    if (match) {
      analiseIA.value = JSON.parse(match[0])
    } else {
      throw new Error('Resposta inesperada da IA')
    }
  } catch (err) {
    console.error('[PerfilFuncionario] Erro IA:', err)
    toast.fire({ icon: 'error', title: 'Erro na análise', text: 'Não foi possível gerar a análise. Tente novamente.' })
  } finally {
    gerandoIA.value = false
  }
}

const exportarFicha = async () => {
  await gerarFichaFuncionarioPDF({
    funcionario: funcionario.value,
    avaliacoes: avaliacoes.value,
    participacoesDDS: participacoesDDS.value,
    kpis: kpis.value,
    indiceGeral: indiceGeral.value,
    topProblemas: topProblemas.value
  })
}
</script>
