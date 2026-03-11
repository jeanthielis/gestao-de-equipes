<template>
  <div class="animate-fade-in space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Biblioteca de DDS</h2>
        <p class="text-slate-500 mt-1">Gerencie e cadastre os Diálogos Diários de Segurança para a liderança.</p>
      </div>
      <div class="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100 flex items-center shadow-sm">
        <i class="fa-solid fa-book-open mr-2"></i> {{ temas.length }} Temas Cadastrados
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Formulário novo tema -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h3 class="font-bold text-slate-800 mb-5 flex items-center">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          Escrever Novo DDS
        </h3>

        <form @submit.prevent="salvarTema" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Título do DDS</label>
            <input v-model="novoTema.titulo" type="text" required placeholder="Ex: Importância do uso do EPI" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
            <select v-model="novoTema.categoria_id" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              <option value="" disabled>Selecione a categoria...</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Conteúdo para Leitura</label>
            <textarea v-model="novoTema.conteudo" required rows="6" placeholder="Escreva o texto que o líder vai ler para a equipe..." class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"></textarea>
          </div>

          <button type="submit" :disabled="loading" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all mt-2 flex justify-center items-center">
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            {{ loading ? 'Salvando...' : 'Salvar na Biblioteca' }}
          </button>
        </form>
      </div>

      <!-- Lista de temas -->
      <div class="lg:col-span-2 space-y-6">

        <div class="flex flex-wrap gap-2">
          <button @click="filtroAtual = null" :class="!filtroAtual ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'" class="px-4 py-2 rounded-full text-xs font-bold border transition-colors shadow-sm">
            Todos
          </button>
          <button
            v-for="cat in categorias"
            :key="cat.id"
            @click="filtroAtual = cat.id"
            :class="filtroAtual === cat.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
            class="px-4 py-2 rounded-full text-xs font-bold border transition-colors shadow-sm">
            {{ cat.nome }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="temasFiltrados.length === 0" class="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
            <i class="fa-solid fa-folder-open text-4xl text-slate-300 mb-3 block"></i>
            <p>Nenhum tema encontrado nesta categoria.</p>
          </div>

          <div
            v-for="tema in temasFiltrados"
            :key="tema.id"
            class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
            <div class="flex justify-between items-start mb-3">
              <span :class="getCategoriaCor(tema.categoria_id)" class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border">
                {{ getCategoriaNome(tema.categoria_id) }}
              </span>
              <button @click="deletarTema(tema)" class="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <h4 class="font-bold text-slate-800 text-lg mb-2 leading-tight">{{ tema.titulo }}</h4>
            <p class="text-slate-500 text-sm line-clamp-3">{{ tema.conteudo }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, confirmar, traduzirErro } from '../lib/alerts'

const categorias = ref([])
const temas = ref([])
const filtroAtual = ref(null)
const loading = ref(false)

const novoTema = ref({ titulo: '', conteudo: '', categoria_id: '' })

const fetchData = async () => {
  const [{ data: cats }, { data: tms }] = await Promise.all([
    supabase.from('dds_categorias').select('*').order('nome'),
    supabase.from('dds_temas').select('*').order('created_at', { ascending: false })
  ])
  if (cats) categorias.value = cats
  if (tms) temas.value = tms
}

const temasFiltrados = computed(() => {
  if (!filtroAtual.value) return temas.value
  return temas.value.filter((t) => t.categoria_id === filtroAtual.value)
})

const getCategoriaNome = (id) => categorias.value.find((c) => c.id === id)?.nome || 'Sem Categoria'
const getCategoriaCor = (id) => categorias.value.find((c) => c.id === id)?.cor || 'bg-slate-100 text-slate-600 border-slate-200'

const salvarTema = async () => {
  if (!novoTema.value.titulo || !novoTema.value.categoria_id || !novoTema.value.conteudo) return
  loading.value = true
  const { error } = await supabase.from('dds_temas').insert([novoTema.value])
  if (!error) {
    toast.fire({ icon: 'success', title: 'Tema salvo na biblioteca!' })
    novoTema.value = { titulo: '', conteudo: '', categoria_id: '' }
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao salvar', text: traduzirErro(error) })
  }
  loading.value = false
}

const deletarTema = async (tema) => {
  const result = await confirmar(
    'Excluir Tema?',
    `O tema <b>"${tema.titulo}"</b> será removido permanentemente da biblioteca.`,
    'Sim, excluir'
  )
  if (!result.isConfirmed) return
  const { error } = await supabase.from('dds_temas').delete().eq('id', tema.id)
  if (!error) {
    toast.fire({ icon: 'success', title: 'Tema removido da biblioteca.' })
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao excluir', text: traduzirErro(error) })
  }
}

onMounted(fetchData)
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
