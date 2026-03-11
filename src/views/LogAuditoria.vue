<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-900">Log de Auditoria</h2>
        <p class="text-slate-500 mt-1 text-sm">Registro de todas as ações realizadas no sistema pelos usuários.</p>
      </div>
      <button @click="carregar" :disabled="carregando" class="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm">
        <i class="fa-solid fa-arrows-rotate text-sm" :class="{ 'fa-spin': carregando }"></i>
      </button>
    </div>

    <!-- Filtros rápidos -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
        <input v-model="filtroTexto" type="text" placeholder="Filtrar por ação ou entidade..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-500 text-sm" />
      </div>
      <select v-model="filtroEntidade" class="px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm bg-white text-slate-600">
        <option value="">Todas as entidades</option>
        <option value="usuarios">Usuários</option>
        <option value="niveis_acesso">Níveis de Acesso</option>
        <option value="diario_avaliacoes">Apontamentos</option>
        <option value="dds">DDS</option>
      </select>
    </div>

    <!-- Tabela -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100 bg-slate-50">
              <th class="px-6 py-3">Data/Hora</th>
              <th class="px-4 py-3">Usuário</th>
              <th class="px-4 py-3">Ação</th>
              <th class="px-4 py-3">Entidade</th>
              <th class="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="carregando">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                <i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              </td>
            </tr>
            <tr v-else-if="logsFiltrados.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                <i class="fa-solid fa-scroll text-3xl mb-3 block text-slate-300"></i>
                <p class="font-bold text-slate-500">Nenhum registro encontrado.</p>
                <p class="text-xs mt-1">As ações serão registradas automaticamente conforme o sistema é utilizado.</p>
              </td>
            </tr>
            <tr v-for="log in logsFiltrados" :key="log.id"
              class="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">{{ formatarData(log.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">
                    {{ log.usuarios?.nome?.charAt(0)?.toUpperCase() || '?' }}
                  </div>
                  <span class="font-bold text-slate-700 text-xs">{{ log.usuarios?.nome || 'Sistema' }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                  :class="corAcao(log.acao)">
                  {{ formatarAcao(log.acao) }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500 text-xs font-mono">{{ log.entidade }}</td>
              <td class="px-4 py-3 text-slate-400 text-xs max-w-xs truncate" :title="log.detalhes">
                {{ resumoDetalhes(log.detalhes) }}
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

const logs = ref([])
const carregando = ref(false)
const filtroTexto = ref('')
const filtroEntidade = ref('')

const logsFiltrados = computed(() => {
  let l = logs.value
  if (filtroEntidade.value) l = l.filter((x) => x.entidade === filtroEntidade.value)
  if (filtroTexto.value.trim()) {
    const t = filtroTexto.value.toLowerCase()
    l = l.filter((x) => x.acao?.toLowerCase().includes(t) || x.entidade?.toLowerCase().includes(t) || x.usuarios?.nome?.toLowerCase().includes(t))
  }
  return l
})

const carregar = async () => {
  carregando.value = true
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, acao, entidade, detalhes, created_at, usuario_id, usuarios(nome)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    logs.value = data || []
  } catch (err) {
    // Tabela pode não existir ainda — exibe instrução SQL ao admin
    if (err.message?.includes('does not exist') || err.code === '42P01') {
      toast.fire({
        icon: 'info',
        title: 'Tabela não criada',
        text: 'Execute o SQL de criação da tabela audit_logs no seu Supabase.'
      })
      logs.value = []
    } else {
      toast.fire({ icon: 'error', title: 'Erro ao carregar log', text: traduzirErro(err) })
    }
  } finally {
    carregando.value = false
  }
}

const formatarData = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

const formatarAcao = (acao) => acao?.replace(/_/g, ' ') || '—'

const corAcao = (acao = '') => {
  if (acao.includes('criou') || acao.includes('cadastrou')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (acao.includes('excluiu') || acao.includes('removeu') || acao.includes('deletou')) return 'bg-rose-50 text-rose-700 border-rose-200'
  if (acao.includes('alterou') || acao.includes('atualizou')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

const resumoDetalhes = (json) => {
  if (!json) return '—'
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json
    return Object.entries(obj).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ')
  } catch { return json?.toString()?.slice(0, 80) || '—' }
}

onMounted(carregar)
</script>
