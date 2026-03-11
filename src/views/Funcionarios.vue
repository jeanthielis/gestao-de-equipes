<template>
  <div class="animate-fade-in space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Efetivo & Operadores</h2>
        <p class="text-slate-500 mt-1">Gerencie os colaboradores e vincule-os às equipes operacionais.</p>
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

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Equipe / Turno</label>
            <select v-model="novo.equipe_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              <option value="" disabled>Selecione a equipe...</option>
              <option v-for="eq in equipesComUnidade" :key="eq.id" :value="eq.id">
                {{ eq.nome }} ({{ eq.unidades?.nome || 'Sem unidade' }})
              </option>
            </select>
          </div>

          <button type="submit" :disabled="loading" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all mt-2 flex justify-center items-center">
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            {{ loading ? 'Salvando...' : 'Cadastrar Operador' }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div class="relative w-full max-w-sm">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" placeholder="Buscar por nome ou matrícula..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th class="p-4 font-bold">Colaborador</th>
                <th class="p-4 font-bold">Equipe</th>
                <th class="p-4 font-bold text-center">Status</th>
                <th class="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-if="funcionarios.length === 0">
                <td colspan="4" class="p-8 text-center text-slate-500">Nenhum colaborador cadastrado ainda.</td>
              </tr>
              <tr v-for="func in funcionarios" :key="func.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                <td class="p-4">
                  <div class="font-bold text-slate-800">{{ func.nome }}</div>
                  <div class="text-xs text-slate-500">{{ func.cargo }} {{ func.matricula ? `• Mat: ${func.matricula}` : '' }}</div>
                </td>
                <td class="p-4 text-slate-600">
                  <span class="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200">
                    {{ getNomeEquipe(func.equipe_id) }}
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
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
// 1. IMPORTAÇÃO DOS ALERTAS AQUI
import { toast, alerta, traduzirErro } from '../lib/alerts'

const funcionarios = ref([])
const equipesComUnidade = ref([])
const loading = ref(false)

const novo = ref({
  nome: '',
  matricula: '',
  cargo: 'Operador',
  equipe_id: ''
})

const fetchData = async () => {
  const { data: f } = await supabase.from('funcionarios').select('*').order('nome')
  if (f) funcionarios.value = f

  const { data: eq } = await supabase.from('equipes').select(`
    id, nome, unidade_id,
    unidades (nome)
  `).order('nome')
  
  if (eq) equipesComUnidade.value = eq
}

const getNomeEquipe = (id) => {
  const equipe = equipesComUnidade.value.find(e => e.id === id)
  return equipe ? equipe.nome : 'Sem equipe'
}

const salvarFuncionario = async () => {
  if (!novo.value.nome || !novo.value.equipe_id) return
  loading.value = true

  const dadosParaSalvar = {
    nome: novo.value.nome,
    equipe_id: novo.value.equipe_id,
    matricula: novo.value.matricula ? novo.value.matricula : null,
    funcao: novo.value.cargo ? novo.value.cargo : 'Operador',
    cargo: novo.value.cargo ? novo.value.cargo : 'Operador'
  }

  const { error } = await supabase.from('funcionarios').insert([dadosParaSalvar])
  
  if (!error) {
    // 2. TOAST DE SUCESSO AQUI
    toast.fire({ icon: 'success', title: 'Operador cadastrado com sucesso!' })
    novo.value = { nome: '', matricula: '', cargo: 'Operador', equipe_id: '' }
    await fetchData()
  } else {
    
    console.error("Erro original:", error)
    // Usando o nosso tradutor mágico!
    toast.fire({ icon: 'error', title: 'Erro ao cadastrar', text: traduzirErro(error) })
  
  }
  
  loading.value = false
}

const toggleStatus = async (func) => {
  // 4. ALERTA CENTRAL PARA CONFIRMAR AÇÃO (EVITA CLIQUES ACIDENTAIS)
  const acao = func.ativo ? 'Desativar' : 'Reativar'
  
  const confirmacao = await alerta.fire({
    title: `${acao} colaborador?`,
    html: `Deseja realmente ${acao.toLowerCase()} <b>${func.nome}</b>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: func.ativo ? '#e11d48' : '#10b981', // Vermelho para desativar, verde para reativar
    cancelButtonColor: '#94a3b8',
    confirmButtonText: `Sim, ${acao.toLowerCase()}`,
    cancelButtonText: 'Cancelar'
  })

  // Se o usuário clicou em 'Sim'
  if (confirmacao.isConfirmed) {
    const { error } = await supabase.from('funcionarios').update({ ativo: !func.ativo }).eq('id', func.id)
    
    if (!error) {
      toast.fire({ icon: 'success', title: `Status atualizado com sucesso!` })
      await fetchData()
    } else {
      toast.fire({ icon: 'error', title: 'Erro ao atualizar', text: error.message })
    }
  }
}

onMounted(fetchData)
</script>