<template>
  <div class="animate-fade-in space-y-8">
    <div>
      <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Estrutura Operacional</h2>
      <p class="text-slate-500 mt-1">Gerencie os setores da fábrica e os turnos (equipes) de cada área.</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">

      <!-- Unidades -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-industry"></i>
            </div>
            Nova Unidade / Setor
          </h3>
          <form @submit.prevent="salvarUnidade" class="flex gap-3">
            <input
              v-model="novaUnidade.nome"
              type="text"
              required
              placeholder="Ex: Preparação de Massa"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button type="submit" :disabled="loadingUnidade" class="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 whitespace-nowrap">
              <i v-if="loadingUnidade" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
              Criar
            </button>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-600 text-sm">
            Unidades Cadastradas ({{ unidades.length }})
          </div>
          <ul class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            <li v-if="unidades.length === 0" class="p-6 text-center text-slate-400 text-sm">Nenhuma unidade cadastrada.</li>
            <li v-for="u in unidades" :key="u.id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <span class="font-semibold text-slate-700">{{ u.nome }}</span>
              <button @click="deletarUnidade(u)" class="text-slate-300 hover:text-rose-500 transition-colors" title="Excluir Unidade">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Equipes -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-people-group"></i>
            </div>
            Nova Equipe / Turno
          </h3>
          <form @submit.prevent="salvarEquipe" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vincular à Unidade</label>
              <select
                v-model="novaEquipe.unidade_id"
                required
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                <option value="" disabled>Selecione de qual unidade é esta equipe...</option>
                <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
              </select>
            </div>
            <div class="flex gap-3">
              <input
                v-model="novaEquipe.nome"
                type="text"
                required
                placeholder="Ex: Turma A - Manhã"
                class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                type="submit"
                :disabled="loadingEquipe || !novaEquipe.unidade_id"
                class="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 whitespace-nowrap">
                <i v-if="loadingEquipe" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
                Vincular
              </button>
            </div>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-600 text-sm">
            Equipes Cadastradas ({{ equipes.length }})
          </div>
          <ul class="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            <li v-if="equipes.length === 0" class="p-6 text-center text-slate-400 text-sm">Nenhuma equipe cadastrada.</li>
            <li v-for="eq in equipes" :key="eq.id" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors group">
              <div>
                <p class="font-bold text-slate-800">{{ eq.nome }}</p>
                <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i> {{ eq.unidades?.nome || 'Unidade desconhecida' }}</p>
              </div>
              <button @click="deletarEquipe(eq)" class="text-slate-300 hover:text-rose-500 transition-colors mt-2 sm:mt-0 opacity-0 group-hover:opacity-100" title="Excluir Equipe">
                <i class="fa-solid fa-trash-can"></i>
              </button>
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
const equipes = ref([])
const novaUnidade = ref({ nome: '' })
const novaEquipe = ref({ nome: '', unidade_id: '' })
const loadingUnidade = ref(false)
const loadingEquipe = ref(false)

const fetchData = async () => {
  const [{ data: u }, { data: e }] = await Promise.all([
    supabase.from('unidades').select('*').order('nome'),
    supabase.from('equipes').select('id, nome, unidade_id, unidades(nome)').order('nome')
  ])
  if (u) unidades.value = u
  if (e) equipes.value = e
}

const salvarUnidade = async () => {
  if (!novaUnidade.value.nome.trim()) return
  loadingUnidade.value = true
  const { error } = await supabase.from('unidades').insert([{ nome: novaUnidade.value.nome.trim() }])
  if (!error) {
    toast.fire({ icon: 'success', title: 'Unidade criada com sucesso!' })
    novaUnidade.value.nome = ''
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao criar unidade', text: traduzirErro(error) })
  }
  loadingUnidade.value = false
}

const salvarEquipe = async () => {
  if (!novaEquipe.value.nome.trim() || !novaEquipe.value.unidade_id) return
  loadingEquipe.value = true
  const { error } = await supabase.from('equipes').insert([{ nome: novaEquipe.value.nome.trim(), unidade_id: novaEquipe.value.unidade_id }])
  if (!error) {
    toast.fire({ icon: 'success', title: 'Equipe criada com sucesso!' })
    novaEquipe.value.nome = ''
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao criar equipe', text: traduzirErro(error) })
  }
  loadingEquipe.value = false
}

const deletarUnidade = async (u) => {
  const result = await confirmar(
    'Excluir Unidade?',
    `Isso também removerá as equipes vinculadas a <b>${u.nome}</b>. Esta ação não pode ser desfeita.`,
    'Sim, excluir'
  )
  if (!result.isConfirmed) return
  const { error } = await supabase.from('unidades').delete().eq('id', u.id)
  if (!error) {
    toast.fire({ icon: 'success', title: 'Unidade removida!' })
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao excluir', text: traduzirErro(error) })
  }
}

const deletarEquipe = async (eq) => {
  const result = await confirmar(
    'Excluir Equipe?',
    `Deseja realmente excluir a equipe <b>${eq.nome}</b>?`,
    'Sim, excluir'
  )
  if (!result.isConfirmed) return
  const { error } = await supabase.from('equipes').delete().eq('id', eq.id)
  if (!error) {
    toast.fire({ icon: 'success', title: 'Equipe removida!' })
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao excluir', text: traduzirErro(error) })
  }
}

onMounted(fetchData)
</script>
