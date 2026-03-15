<template>
  <div class="animate-fade-in">
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Gestão de Checklists</h2>
        <p class="text-slate-500 mt-1 text-sm sm:text-base">Configure os critérios de avaliação para o chão de fábrica.</p>
      </div>
      <div class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-100 flex items-center shadow-sm">
        <i class="fa-solid fa-circle-info mr-2"></i> Alterações refletem em tempo real
      </div>
    </div>

    <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 transition-all hover:shadow-md">
      <h3 class="text-lg font-bold text-slate-800 mb-5 flex items-center">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
          <i class="fa-solid fa-plus"></i>
        </div>
        Novo Critério de Avaliação
      </h3>
      
      <form @submit.prevent="adicionarItem" class="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
        <div class="md:col-span-6">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Descrição do Item</label>
          <input 
            v-model="novoItem.descricao" 
            type="text" 
            required 
            placeholder="Ex: Ausência de defeitos (Luneta, Almofada, etc)" 
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm placeholder:text-slate-400"
          >
        </div>
        <div class="md:col-span-3">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
          <div class="relative">
            <select v-model="novoItem.categoria" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white text-sm cursor-pointer transition-all">
              <option value="Qualidade">Controle de Qualidade</option>
              <option value="Segurança">Segurança do Trabalho</option>
              <option value="Produtividade">Produtividade</option>
              <option value="Organização (5S)">Organização (5S)</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
          </div>
        </div>
        <div class="md:col-span-3">
          <button type="submit" :disabled="loading" class="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm flex justify-center items-center">
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            {{ loading ? 'Salvando...' : 'Adicionar Item' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th class="p-5 font-bold">Critério Avaliado</th>
              <th class="p-5 font-bold">Categoria</th>
              <th class="p-5 font-bold text-center">Status</th>
              <th class="p-5 font-bold text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="itens.length === 0">
              <td colspan="4" class="p-12 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                  <i class="fa-solid fa-inbox text-2xl text-slate-300"></i>
                </div>
                <p class="text-slate-500 font-medium">Nenhum critério cadastrado.</p>
                <p class="text-slate-400 text-xs mt-1">Os itens adicionados aparecerão aqui.</p>
              </td>
            </tr>
            <tr v-for="item in itens" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              <td class="p-5 font-medium text-slate-800">{{ item.descricao }}</td>
              <td class="p-5">
                <span class="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  {{ item.categoria }}
                </span>
              </td>
              <td class="p-5 text-center">
                <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" :class="item.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'">
                  <div class="w-1.5 h-1.5 rounded-full mr-2" :class="item.ativo ? 'bg-emerald-500' : 'bg-slate-400'"></div>
                  {{ item.ativo ? 'Em uso' : 'Inativo' }}
                </div>
              </td>
              <td class="p-5 text-right">
                <button @click="toggleStatus(item)" class="text-sm font-bold transition-colors opacity-0 group-hover:opacity-100" :class="item.ativo ? 'text-rose-500 hover:text-rose-700' : 'text-emerald-500 hover:text-emerald-700'">
                  {{ item.ativo ? 'Desativar' : 'Reativar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useDadosStore } from '../stores/dados'
import { toast, confirmar, traduzirErro } from '../lib/alerts'

const itens = ref([])
const loading = ref(false)
const dadosStore = useDadosStore()
const novoItem = ref({
  descricao: '',
  categoria: 'Qualidade',
  peso: 1
})

const fetchItens = async () => {
  const { data, error } = await supabase
    .from('itens_checklist')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    toast.fire({ icon: 'error', title: 'Erro ao carregar critérios', text: traduzirErro(error) })
    return
  }
  if (data) itens.value = data
}

const adicionarItem = async () => {
  if (!novoItem.value.descricao) return
  loading.value = true

  const { error } = await supabase
    .from('itens_checklist')
    .insert([{ 
      descricao: novoItem.value.descricao, 
      categoria: novoItem.value.categoria,
      peso: novoItem.value.peso
    }])

  if (!error) {
    toast.fire({ icon: 'success', title: 'Critério adicionado com sucesso!' })
    novoItem.value.descricao = ''
    dadosStore.invalidar('itensChecklist')
    await fetchItens()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao adicionar', text: traduzirErro(error) })
  }
  loading.value = false
}

const toggleStatus = async (item) => {
  const acao = item.ativo ? 'desativar' : 'reativar'
  const result = await confirmar('Alterar Status?', `Deseja realmente <b>${acao}</b> o critério <b>"${item.descricao}"</b>?`, `Sim, ${acao}`)
  if (!result.isConfirmed) return

  const { error } = await supabase.from('itens_checklist').update({ ativo: !item.ativo }).eq('id', item.id)
  if (!error) {
    toast.fire({ icon: 'success', title: `Critério ${item.ativo ? 'desativado' : 'reativado'}!` })
    dadosStore.invalidar('itensChecklist')
    await fetchItens()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao atualizar', text: traduzirErro(error) })
  }
}

onMounted(() => {
  fetchItens()
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>