<template>
  <div class="animate-fade-in space-y-8 pb-20">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Efetivo & Operadores</h2>
        <p class="text-slate-500 mt-1">Gerencie os colaboradores e vincule-os à estrutura operacional correta.</p>
      </div>
      <div class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-100 flex items-center shadow-sm">
        <i class="fa-solid fa-users mr-2"></i> {{ funcionarios.length }} Cadastrados
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h3 class="font-bold text-slate-800 mb-5 flex items-center">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          Novo Colaborador
        </h3>
        
        <form @submit.prevent="salvarFuncionario" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <input v-model="novo.nome" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matrícula</label>
              <input v-model="novo.matricula" type="text" placeholder="Opcional" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cargo</label>
              <input v-model="novo.cargo" type="text" placeholder="Ex: Operador I" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            </div>
          </div>

          <hr class="border-slate-100 my-4">

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade</label>
            <select v-model="novo.unidade_id" @change="novo.setor_id = ''; novo.equipe_id = ''" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              <option value="" disabled>Selecione a unidade...</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Setor</label>
            <select v-model="novo.setor_id" @change="novo.equipe_id = ''" :disabled="!novo.unidade_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white disabled:opacity-50">
              <option value="" disabled>Selecione o setor...</option>
              <option v-for="s in setoresDaUnidade" :key="s.id" :value="s.id">{{ s.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Equipe / Turno</label>
            <select v-model="novo.equipe_id" :disabled="!novo.setor_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white disabled:opacity-50">
              <option value="" disabled>Selecione a equipe...</option>
              <option v-for="e in equipesDoSetor" :key="e.id" :value="e.id">{{ e.nome }}</option>
            </select>
          </div>

          <button type="submit" :disabled="loading || !novo.equipe_id" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all mt-4 flex justify-center items-center disabled:opacity-50">
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            {{ loading ? 'Salvando...' : 'Cadastrar Operador' }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div class="relative w-full max-w-sm">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input v-model="termoBusca" type="text" placeholder="Buscar por nome ou matrícula..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th class="p-4 font-bold">Colaborador</th>
                <th class="p-4 font-bold">Localização</th>
                <th class="p-4 font-bold text-center">Status</th>
                <th class="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-if="funcionariosFiltrados.length === 0">
                <td colspan="4" class="p-8 text-center text-slate-500">Nenhum colaborador encontrado.</td>
              </tr>
              <tr v-for="func in funcionariosFiltrados" :key="func.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <td class="p-4">
                  <div class="font-bold text-slate-800">{{ func.nome }}</div>
                  <div class="text-xs text-slate-500">{{ func.cargo }} {{ func.matricula ? `• Mat: ${func.matricula}` : '' }}</div>
                </td>
                <td class="p-4">
                  <span class="block text-slate-700 font-bold text-xs">{{ func.equipes?.nome || 'Sem equipe' }}</span>
                  <span class="block text-[10px] text-slate-400 uppercase mt-0.5">
                    {{ func.equipes?.setores?.unidades?.nome }} <i class="fa-solid fa-angle-right mx-0.5"></i> {{ func.equipes?.setores?.nome }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border" 
                        :class="func.ativo ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'">
                    {{ func.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button @click="toggleStatus(func)" class="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                    {{ func.ativo ? 'Desativar' : 'Reativar' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, alerta, traduzirErro } from '../lib/alerts'

const funcionarios = ref([])
const unidades = ref([])
const setores = ref([])
const equipes = ref([])

const loading = ref(false)
const termoBusca = ref('')

const novo = ref({
  nome: '',
  matricula: '',
  cargo: 'Operador',
  unidade_id: '',
  setor_id: '',
  equipe_id: ''
})

// === CASCATAS DE FILTROS ===
const setoresDaUnidade = computed(() => 
  novo.value.unidade_id ? setores.value.filter(s => s.unidade_id === novo.value.unidade_id) : []
)

const equipesDoSetor = computed(() => 
  novo.value.setor_id ? equipes.value.filter(e => e.setor_id === novo.value.setor_id) : []
)

const funcionariosFiltrados = computed(() => {
  if (!termoBusca.value) return funcionarios.value
  const termo = termoBusca.value.toLowerCase()
  return funcionarios.value.filter(f => 
    f.nome.toLowerCase().includes(termo) || 
    (f.matricula && f.matricula.toLowerCase().includes(termo))
  )
})

// === CARREGAMENTO DE DADOS ===
const fetchData = async () => {
  const [resF, resU, resS, resE] = await Promise.all([
    // Traz o funcionário + o caminho completo da hierarquia dele
    supabase.from('funcionarios').select(`
      *,
      equipes (
        nome,
        setores (
          nome,
          unidades (nome)
        )
      )
    `).order('nome'),
    supabase.from('unidades').select('*').order('nome'),
    supabase.from('setores').select('*').order('nome'),
    supabase.from('equipes').select('*').order('nome')
  ])

  if (resF.data) funcionarios.value = resF.data
  if (resU.data) unidades.value = resU.data
  if (resS.data) setores.value = resS.data
  if (resE.data) equipes.value = resE.data
}

// === SALVAR ===
const salvarFuncionario = async () => {
  if (!novo.value.nome || !novo.value.equipe_id) return
  loading.value = true

  // Captura o ID do gestor que está realizando o cadastro
  const { data: authData } = await supabase.auth.getUser()
  const usuarioLogadoId = authData?.user?.id

  const dadosParaSalvar = {
    nome: novo.value.nome,
    equipe_id: novo.value.equipe_id, // O banco já sabe que equipe pertence a qual setor/unidade
    matricula: novo.value.matricula ? novo.value.matricula : null,
    funcao: novo.value.cargo ? novo.value.cargo : 'Operador',
    cargo: novo.value.cargo ? novo.value.cargo : 'Operador',
    gestor_id: usuarioLogadoId 
  }

  const { error } = await supabase.from('funcionarios').insert([dadosParaSalvar])
  
  if (!error) {
    toast.fire({ icon: 'success', title: 'Operador cadastrado com sucesso!' })
    // Reseta o formulário
    novo.value = { nome: '', matricula: '', cargo: 'Operador', unidade_id: '', setor_id: '', equipe_id: '' }
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao cadastrar', text: traduzirErro(error) })
  }
  
  loading.value = false
}

// === STATUS ===
const toggleStatus = async (func) => {
  const acao = func.ativo ? 'Desativar' : 'Reativar'
  
  const confirmacao = await alerta.fire({
    title: `${acao} colaborador?`,
    html: `Deseja realmente ${acao.toLowerCase()} <b>${func.nome}</b>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: func.ativo ? '#e11d48' : '#10b981', 
    cancelButtonColor: '#94a3b8',
    confirmButtonText: `Sim, ${acao.toLowerCase()}`,
    cancelButtonText: 'Cancelar'
  })

  if (confirmacao.isConfirmed) {
    const { error } = await supabase.from('funcionarios').update({ ativo: !func.ativo }).eq('id', func.id)
    
    if (!error) {
      toast.fire({ icon: 'success', title: `Status atualizado!` })
      await fetchData()
    } else {
      toast.fire({ icon: 'error', title: 'Erro ao atualizar', text: traduzirErro(error) })
    }
  }
}

onMounted(fetchData)
</script>
