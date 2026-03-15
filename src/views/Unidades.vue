<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">

    <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Estrutura Operacional</h2>
          <p class="text-slate-500 text-sm mt-1">Gerencie as unidades, setores da fábrica e os turnos (equipes).</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <button @click="abaAtiva = 'unidades'" 
            :class="abaAtiva === 'unidades' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" 
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center">
            <i class="fa-solid fa-industry mr-2"></i>Unidades
          </button>
          <button @click="abaAtiva = 'setores'" 
            :class="abaAtiva === 'setores' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" 
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center">
            <i class="fa-solid fa-layer-group mr-2"></i>Setores
          </button>
          <button @click="abaAtiva = 'equipes'" 
            :class="abaAtiva === 'equipes' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" 
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-center">
            <i class="fa-solid fa-people-group mr-2"></i>Equipes
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <template v-if="abaAtiva === 'unidades'">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 class="font-bold text-slate-800 mb-5 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-industry"></i>
            </div>
            Nova Unidade
          </h3>
          <form @submit.prevent="salvarUnidade" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome da Unidade</label>
              <input v-model="novaUnidade.nome" type="text" required placeholder="Ex: Fábrica Matriz" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <button type="submit" :disabled="loadingUnidade" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2 flex justify-center items-center shadow-sm">
              <i v-if="loadingUnidade" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              {{ loadingUnidade ? 'Salvando...' : 'Criar Unidade' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-4 border-b border-slate-200 font-bold text-slate-600 text-sm flex justify-between items-center">
            <span>Unidades Cadastradas</span>
            <span class="bg-indigo-100 text-indigo-700 py-1 px-2.5 rounded-lg text-xs">{{ unidades.length }} registro(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr v-if="unidades.length === 0">
                  <td class="p-8 text-center text-slate-400">Nenhuma unidade cadastrada.</td>
                </tr>
                <tr v-for="u in unidades" :key="u.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="p-5 font-semibold text-slate-700">{{ u.nome }}</td>
                  <td class="p-5 text-right">
                    <button @click="deletarUnidade(u)" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors sm:opacity-0 group-hover:opacity-100" title="Excluir">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <template v-if="abaAtiva === 'setores'">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 class="font-bold text-slate-800 mb-5 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            Novo Setor
          </h3>
          <form @submit.prevent="salvarSetor" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Unidade Física</label>
              <select v-model="novoSetor.unidade_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                <option value="" disabled>Selecione a unidade...</option>
                <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Setor</label>
              <input v-model="novoSetor.nome" type="text" required placeholder="Ex: Preparação de Massa" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
            </div>
            <button type="submit" :disabled="loadingSetor || !novoSetor.unidade_id" class="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 mt-2 flex justify-center items-center shadow-sm">
              <i v-if="loadingSetor" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              {{ loadingSetor ? 'Salvando...' : 'Criar Setor' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-4 border-b border-slate-200 font-bold text-slate-600 text-sm flex justify-between items-center">
            <span>Setores Cadastrados</span>
            <span class="bg-amber-100 text-amber-700 py-1 px-2.5 rounded-lg text-xs">{{ setores.length }} registro(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-white text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
                <tr>
                  <th class="px-5 py-3">Setor</th>
                  <th class="px-4 py-3">Unidade Vinculada</th>
                  <th class="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr v-if="setores.length === 0">
                  <td colspan="3" class="p-8 text-center text-slate-400">Nenhum setor cadastrado.</td>
                </tr>
                <tr v-for="s in setores" :key="s.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-5 py-4 font-semibold text-slate-700">{{ s.nome }}</td>
                  <td class="px-4 py-4 text-slate-500 text-xs">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 font-medium">
                      <i class="fa-solid fa-industry opacity-50"></i> {{ s.unidades?.nome }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button @click="deletarSetor(s)" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors sm:opacity-0 group-hover:opacity-100" title="Excluir">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <template v-if="abaAtiva === 'equipes'">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 class="font-bold text-slate-800 mb-5 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-people-group"></i>
            </div>
            Nova Equipe / Turno
          </h3>
          <form @submit.prevent="salvarEquipe" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Setor</label>
              <select v-model="novaEquipe.setor_id" required class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="" disabled>Selecione o setor...</option>
                <option v-for="s in setores" :key="s.id" :value="s.id">{{ s.nome }} ({{ s.unidades?.nome }})</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome da Equipe</label>
              <input v-model="novaEquipe.nome" type="text" required placeholder="Ex: Turma A - Manhã" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            </div>
            <button type="submit" :disabled="loadingEquipe || !novaEquipe.setor_id" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 mt-2 flex justify-center items-center shadow-sm">
              <i v-if="loadingEquipe" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              {{ loadingEquipe ? 'Salvando...' : 'Vincular Equipe' }}
            </button>
          </form>
        </div>

        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-4 border-b border-slate-200 font-bold text-slate-600 text-sm flex justify-between items-center">
            <span>Equipes Cadastradas</span>
            <span class="bg-emerald-100 text-emerald-700 py-1 px-2.5 rounded-lg text-xs">{{ equipes.length }} registro(s)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-white text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
                <tr>
                  <th class="px-5 py-3">Equipe / Turno</th>
                  <th class="px-4 py-3">Setor Vinculado</th>
                  <th class="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-sm">
                <tr v-if="equipes.length === 0">
                  <td colspan="3" class="p-8 text-center text-slate-400">Nenhuma equipe cadastrada.</td>
                </tr>
                <tr v-for="eq in equipes" :key="eq.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-5 py-4 font-semibold text-slate-700">{{ eq.nome }}</td>
                  <td class="px-4 py-4 text-slate-500 text-xs">
                    <span class="block text-slate-700 font-medium">{{ eq.setores?.nome }}</span>
                    <span class="block text-[10px] uppercase mt-0.5 opacity-60"><i class="fa-solid fa-industry mr-1"></i> {{ eq.setores?.unidades?.nome }}</span>
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button @click="deletarEquipe(eq)" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors sm:opacity-0 group-hover:opacity-100" title="Excluir">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useDadosStore } from '../stores/dados'
import { toast, confirmar, traduzirErro } from '../lib/alerts'

// Controle das Abas
const abaAtiva = ref('unidades')

const unidades = ref([])
const setores = ref([])
const equipes = ref([])

const novaUnidade = ref({ nome: '' })
const novoSetor = ref({ nome: '', unidade_id: '' })
const novaEquipe = ref({ nome: '', setor_id: '' })

const loadingUnidade = ref(false)
const loadingSetor = ref(false)
const loadingEquipe = ref(false)
const dadosStore = useDadosStore()

const fetchData = async () => {
  // Força revalidação após mutação (insert/delete), senão usa cache
  const [u, s, e] = await Promise.all([
    dadosStore.getUnidades(),
    dadosStore.getSetores(),
    dadosStore.getEquipes(),
  ])
  unidades.value = u
  setores.value  = s
  equipes.value  = e
}

// Invalida cache e rebusca após qualquer mutação na estrutura
const recarregar = async () => {
  dadosStore.invalidar('unidades')
  dadosStore.invalidar('setores')
  dadosStore.invalidar('equipes')
  await fetchData()
}

const salvarUnidade = async () => {
  loadingUnidade.value = true
  const { error } = await supabase.from('unidades').insert([{ nome: novaUnidade.value.nome.trim() }])
  if (!error) { toast.fire({ icon: 'success', title: 'Unidade criada!' }); novaUnidade.value.nome = ''; await recarregar() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingUnidade.value = false
}

const salvarSetor = async () => {
  loadingSetor.value = true
  const { error } = await supabase.from('setores').insert([{ nome: novoSetor.value.nome.trim(), unidade_id: novoSetor.value.unidade_id }])
  if (!error) { toast.fire({ icon: 'success', title: 'Setor criado!' }); novoSetor.value.nome = ''; await recarregar() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingSetor.value = false
}

const salvarEquipe = async () => {
  loadingEquipe.value = true
  const { error } = await supabase.from('equipes').insert([{ nome: novaEquipe.value.nome.trim(), setor_id: novaEquipe.value.setor_id }])
  if (!error) { toast.fire({ icon: 'success', title: 'Equipe criada!' }); novaEquipe.value.nome = ''; await recarregar() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingEquipe.value = false
}

const deletarUnidade = async (u) => {
  const result = await confirmar('Excluir Unidade?', `Isso removerá setores e equipes de <b>${u.nome}</b>.`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('unidades').delete().eq('id', u.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removida!' }); await recarregar() }
  }
}

const deletarSetor = async (s) => {
  const result = await confirmar('Excluir Setor?', `Isso removerá as equipes de <b>${s.nome}</b>.`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('setores').delete().eq('id', s.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removido!' }); await recarregar() }
  }
}

const deletarEquipe = async (eq) => {
  const result = await confirmar('Excluir Equipe?', `Deseja excluir a equipe <b>${eq.nome}</b>?`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('equipes').delete().eq('id', eq.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removida!' }); await recarregar() }
  }
}

onMounted(fetchData)
</script>
