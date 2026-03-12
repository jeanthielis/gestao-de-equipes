<template>
  <div class="animate-fade-in space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Estrutura Operacional</h2>
      <p class="text-slate-500 mt-1">Gerencie as unidades, setores da fábrica e os turnos (equipes).</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-industry"></i>
            </div>
            Nova Unidade
          </h3>
          <form @submit.prevent="salvarUnidade" class="flex flex-col gap-3">
            <input v-model="novaUnidade.nome" type="text" required placeholder="Ex: Fábrica Matriz" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            <button type="submit" :disabled="loadingUnidade" class="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">
              <i v-if="loadingUnidade" class="fa-solid fa-circle-notch fa-spin mr-1"></i> Criar Unidade
            </button>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-600 text-sm">
            Unidades ({{ unidades.length }})
          </div>
          <ul class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            <li v-if="unidades.length === 0" class="p-6 text-center text-slate-400 text-sm">Nenhuma unidade.</li>
            <li v-for="u in unidades" :key="u.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <span class="font-semibold text-slate-700">{{ u.nome }}</span>
              <button @click="deletarUnidade(u)" class="text-slate-300 hover:text-rose-500 transition-colors" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            Novo Setor
          </h3>
          <form @submit.prevent="salvarSetor" class="space-y-4">
            <select v-model="novoSetor.unidade_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-amber-500">
              <option value="" disabled>Selecione a unidade...</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
            </select>
            <input v-model="novoSetor.nome" type="text" required placeholder="Ex: Preparação de Massa" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 text-sm" />
            <button type="submit" :disabled="loadingSetor || !novoSetor.unidade_id" class="w-full bg-amber-500 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50">
              <i v-if="loadingSetor" class="fa-solid fa-circle-notch fa-spin mr-1"></i> Criar Setor
            </button>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-600 text-sm">
            Setores ({{ setores.length }})
          </div>
          <ul class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            <li v-if="setores.length === 0" class="p-6 text-center text-slate-400 text-sm">Nenhum setor.</li>
            <li v-for="s in setores" :key="s.id" class="p-4 flex flex-col hover:bg-slate-50 transition-colors group">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-slate-800">{{ s.nome }}</p>
                  <p class="text-[10px] text-slate-500 uppercase mt-0.5">{{ s.unidades?.nome }}</p>
                </div>
                <button @click="deletarSetor(s)" class="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-people-group"></i>
            </div>
            Nova Equipe / Turno
          </h3>
          <form @submit.prevent="salvarEquipe" class="space-y-4">
            <select v-model="novaEquipe.setor_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="" disabled>Selecione o setor...</option>
              <option v-for="s in setores" :key="s.id" :value="s.id">{{ s.nome }} ({{ s.unidades?.nome }})</option>
            </select>
            <input v-model="novaEquipe.nome" type="text" required placeholder="Ex: Turma A - Manhã" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
            <button type="submit" :disabled="loadingEquipe || !novaEquipe.setor_id" class="w-full bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
              <i v-if="loadingEquipe" class="fa-solid fa-circle-notch fa-spin mr-1"></i> Vincular Equipe
            </button>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-600 text-sm">
            Equipes ({{ equipes.length }})
          </div>
          <ul class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            <li v-if="equipes.length === 0" class="p-6 text-center text-slate-400 text-sm">Nenhuma equipe.</li>
            <li v-for="eq in equipes" :key="eq.id" class="p-4 flex flex-col hover:bg-slate-50 transition-colors group">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-slate-800">{{ eq.nome }}</p>
                  <p class="text-[10px] text-slate-500 uppercase mt-0.5">{{ eq.setores?.nome }}</p>
                </div>
                <button @click="deletarEquipe(eq)" class="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" title="Excluir"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, confirmar, traduzirErro } from '../lib/alerts'

const unidades = ref([])
const setores = ref([])
const equipes = ref([])

const novaUnidade = ref({ nome: '' })
const novoSetor = ref({ nome: '', unidade_id: '' })
const novaEquipe = ref({ nome: '', setor_id: '' })

const loadingUnidade = ref(false)
const loadingSetor = ref(false)
const loadingEquipe = ref(false)

const fetchData = async () => {
  const [resU, resS, resE] = await Promise.all([
    supabase.from('unidades').select('*').order('nome'),
    supabase.from('setores').select('id, nome, unidade_id, unidades(nome)').order('nome'),
    supabase.from('equipes').select('id, nome, setor_id, setores(nome, unidades(nome))').order('nome')
  ])
  if (resU.data) unidades.value = resU.data
  if (resS.data) setores.value = resS.data
  if (resE.data) equipes.value = resE.data
}

const salvarUnidade = async () => {
  loadingUnidade.value = true
  const { error } = await supabase.from('unidades').insert([{ nome: novaUnidade.value.nome.trim() }])
  if (!error) { toast.fire({ icon: 'success', title: 'Unidade criada!' }); novaUnidade.value.nome = ''; await fetchData() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingUnidade.value = false
}

const salvarSetor = async () => {
  loadingSetor.value = true
  const { error } = await supabase.from('setores').insert([{ nome: novoSetor.value.nome.trim(), unidade_id: novoSetor.value.unidade_id }])
  if (!error) { toast.fire({ icon: 'success', title: 'Setor criado!' }); novoSetor.value.nome = ''; await fetchData() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingSetor.value = false
}

const salvarEquipe = async () => {
  loadingEquipe.value = true
  const { error } = await supabase.from('equipes').insert([{ nome: novaEquipe.value.nome.trim(), setor_id: novaEquipe.value.setor_id }])
  if (!error) { toast.fire({ icon: 'success', title: 'Equipe criada!' }); novaEquipe.value.nome = ''; await fetchData() } 
  else toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  loadingEquipe.value = false
}

const deletarUnidade = async (u) => {
  const result = await confirmar('Excluir Unidade?', `Isso removerá setores e equipes de <b>${u.nome}</b>.`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('unidades').delete().eq('id', u.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removida!' }); await fetchData() }
  }
}

const deletarSetor = async (s) => {
  const result = await confirmar('Excluir Setor?', `Isso removerá as equipes de <b>${s.nome}</b>.`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('setores').delete().eq('id', s.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removido!' }); await fetchData() }
  }
}

const deletarEquipe = async (eq) => {
  const result = await confirmar('Excluir Equipe?', `Deseja excluir a equipe <b>${eq.nome}</b>?`, 'Sim, excluir')
  if (result.isConfirmed) {
    const { error } = await supabase.from('equipes').delete().eq('id', eq.id)
    if (!error) { toast.fire({ icon: 'success', title: 'Removida!' }); await fetchData() }
  }
}

onMounted(fetchData)
</script>
