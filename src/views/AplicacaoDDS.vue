<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">

    <!-- Cabeçalho -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold tracking-tight mb-1">Aplicação de DDS</h2>
          <p class="text-slate-300 text-sm">Monte a equipe, selecione o tema e colete as assinaturas digitais.</p>
        </div>
        <div class="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center border border-white/20">
          <i class="fa-solid fa-signature mr-2 text-emerald-400"></i>
          {{ assinaturasColetadas }} / {{ listaAtual.length }} assinaturas
        </div>
      </div>
    </div>

    <!-- Passo 1: Selecionar Tema -->
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <h3 class="font-bold text-slate-800 flex items-center mb-4">
        <span class="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
        Selecionar Tema do DDS
      </h3>
      <select v-model="form.tema_id" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-700">
        <option value="" disabled>Escolha o tema de hoje...</option>
        <option v-for="t in temas" :key="t.id" :value="t.id">{{ t.titulo }}</option>
      </select>
      <div v-if="temaSelecionado" class="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 animate-fade-in">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conteúdo para leitura</p>
        <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ temaSelecionado.conteudo }}</p>
      </div>
    </div>

    <!-- Passo 2: Montar Equipe -->
    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 flex items-center">
          <span class="bg-amber-100 text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
          Montar Equipe
        </h3>
        <select v-if="listasSalvas.length > 0" @change="carregarLista" v-model="listaSelecionada"
          class="text-xs border-slate-200 rounded-lg p-2 outline-none bg-slate-50 text-slate-600 font-bold focus:ring-2 focus:ring-indigo-500">
          <option value="" disabled>Carregar lista salva...</option>
          <option v-for="l in listasSalvas" :key="l.id" :value="l.id">{{ l.nome }}</option>
        </select>
      </div>

      <form @submit.prevent="adicionarPorMatricula" class="flex gap-2 mb-4">
        <div class="relative flex-1">
          <i class="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="buscaMatricula" type="text" placeholder="Digite a matrícula e pressione Enter..."
            class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
          Adicionar
        </button>
      </form>

      <div v-if="listaAtual.length === 0" class="text-center p-6 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        Nenhum colaborador na lista. Digite a matrícula acima.
      </div>
      <div v-else class="flex flex-wrap gap-2 mb-4">
        <div v-for="func in listaAtual" :key="func.id"
          class="flex items-center border rounded-lg pl-3 pr-1 py-1 shadow-sm transition-colors"
          :class="assinaturas[func.id] ? 'border-emerald-200 bg-emerald-50/40' : 'bg-white border-slate-200'">
          <div class="mr-3">
            <p class="font-bold text-xs text-slate-800">{{ func.nome }}</p>
            <p class="text-[9px] text-slate-500 font-mono">MAT: {{ func.matricula || 'S/N' }}</p>
          </div>
          <div class="flex items-center gap-1">
            <i v-if="assinaturas[func.id]" class="fa-solid fa-circle-check text-emerald-500 text-xs mr-1"></i>
            <button @click="removerDaLista(func.id)"
              class="w-6 h-6 rounded bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
              <i class="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <button v-if="listaAtual.length > 0" @click="salvarListaAtual"
        class="w-full py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase tracking-wider">
        <i class="fa-solid fa-floppy-disk mr-2"></i> Salvar esta equipe para uso futuro
      </button>
    </div>

    <!-- Passo 3: Coletar Assinaturas -->
    <div v-if="listaAtual.length > 0 && form.tema_id" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <h3 class="font-bold text-slate-800 flex items-center mb-4">
        <span class="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
        Coletar Assinaturas
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="func in listaAtual" :key="func.id"
          class="flex items-center justify-between p-4 rounded-2xl border transition-all"
          :class="assinaturas[func.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              :class="assinaturas[func.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
              {{ func.nome.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-sm text-slate-800">{{ func.nome }}</p>
              <p class="text-[10px] font-mono text-slate-400">{{ func.matricula || 'S/N' }}</p>
            </div>
          </div>
          <button v-if="!assinaturas[func.id]" @click="abrirLousa(func)"
            class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-pen-nib"></i> Assinar
          </button>
          <div v-else class="flex items-center gap-2">
            <img :src="assinaturas[func.id]" class="h-8 w-20 object-contain border border-emerald-200 rounded-lg bg-white p-0.5" alt="Assinatura" />
            <button @click="abrirLousa(func)" class="text-slate-400 hover:text-indigo-500 transition-colors" title="Refazer">
              <i class="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão final -->
    <button v-if="listaAtual.length > 0 && form.tema_id" @click="salvarDDS"
      :disabled="loading || assinaturasColetadas === 0"
      class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex justify-center items-center text-lg">
      <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
      <i v-else class="fa-solid fa-clipboard-check mr-2"></i>
      {{ loading ? 'Registrando DDS...' : `Finalizar DDS (${assinaturasColetadas} assinaturas)` }}
    </button>

    <!-- Modal de assinatura -->
    <div v-if="modal.aberto" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <p class="font-black text-slate-800">{{ modal.funcionario?.nome }}</p>
            <p class="text-xs text-slate-500 font-mono mt-0.5">MAT: {{ modal.funcionario?.matricula || 'S/N' }}</p>
          </div>
          <button @click="fecharLousa" class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors font-bold">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
        <div class="p-5">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Assine no espaço abaixo</p>
          <canvas ref="canvasRef"
            class="w-full h-44 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 cursor-crosshair touch-none"
            @mousedown="iniciarTraco" @mousemove="desenharTraco" @mouseup="pararTraco" @mouseleave="pararTraco"
            @touchstart="iniciarTracoMobile" @touchmove="desenharTracoMobile" @touchend="pararTraco">
          </canvas>
        </div>
        <div class="px-5 pb-5 flex gap-3">
          <button @click="limparLousa" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
            <i class="fa-solid fa-eraser mr-2"></i>Limpar
          </button>
          <button @click="confirmarAssinatura" class="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-sm">
            <i class="fa-solid fa-check mr-2"></i>Confirmar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
import { useDadosStore } from '../stores/dados'
import { useAuthStore } from '../stores/auth'
import { toast, alerta } from '../lib/alerts'

const temas = ref([])
const listasSalvas = ref([])
const listaAtual = ref([])
const assinaturas = ref({})
const buscaMatricula = ref('')
const listaSelecionada = ref('')
const loading = ref(false)
const dadosStore = useDadosStore()
const authStore = useAuthStore()
const form = ref({ tema_id: '', equipe_id: null })
const modal = ref({ aberto: false, funcionario: null })
const canvasRef = ref(null)
let ctx = null
let desenhando = false

const fetchData = async () => {
  // temas vêm do cache compartilhado com BibliotecaDDS
  let qListas = supabase.from('dds_listas').select('*').order('created_at', { ascending: false })
  if (!authStore.isSuperAdmin && authStore.equipeId) {
    qListas = qListas.eq('equipe_id', authStore.equipeId)
  }
  const [tm, { data: ls }] = await Promise.all([
    dadosStore.getDdsTemas(),
    qListas
  ])
  temas.value = tm
  if (ls) listasSalvas.value = ls
}

const temaSelecionado = computed(() => temas.value.find(t => t.id === form.value.tema_id))
const assinaturasColetadas = computed(() => Object.keys(assinaturas.value).length)

const adicionarPorMatricula = async () => {
  if (!buscaMatricula.value) return
  const matriculaLimpa = buscaMatricula.value.trim()
  if (listaAtual.value.some(f => f.matricula === matriculaLimpa)) {
    toast.fire({ icon: 'info', title: 'Atenção', text: 'Este colaborador já está na lista atual.' })
    buscaMatricula.value = ''
    return
  }
  // Para não-SuperAdmin, verifica se o funcionário pertence à equipe do usuário
  const { data: func } = await supabase.rpc('buscar_funcionario_dds', { p_matricula: matriculaLimpa })
  if (func && func.length > 0) {
    const f = func[0]
    if (!authStore.isSuperAdmin && authStore.equipeId && f.equipe_id !== authStore.equipeId) {
      toast.fire({ icon: 'warning', title: 'Acesso negado', text: 'Este colaborador não pertence à sua equipe.' })
      buscaMatricula.value = ''
      return
    }
    listaAtual.value.push(f)
    buscaMatricula.value = ''
  } else {
    toast.fire({ icon: 'error', title: 'Não encontrado!', text: `A matrícula ${matriculaLimpa} não existe ou está inativa.` })
  }
}

const removerDaLista = (id) => {
  listaAtual.value = listaAtual.value.filter(f => f.id !== id)
  if (assinaturas.value[id]) delete assinaturas.value[id]
}

const salvarListaAtual = async () => {
  const { value: nome } = await alerta.fire({ title: 'Salvar Lista', input: 'text', inputPlaceholder: 'Nome (Ex: Turma A)', showCancelButton: true, confirmButtonText: 'Salvar', cancelButtonText: 'Cancelar' })
  if (!nome) return
  const { data: { user } } = await supabase.auth.getUser()
  const payload = { nome, criado_por: user.id }
  if (authStore.equipeId) payload.equipe_id = authStore.equipeId
  const { data: novaLista, error: err1 } = await supabase.from('dds_listas').insert([payload]).select().single()
  if (err1) { toast.fire({ icon: 'error', title: 'Erro ao salvar lista.' }); return }
  const membros = listaAtual.value.map(f => ({ lista_id: novaLista.id, funcionario_id: f.id }))
  await supabase.from('dds_listas_membros').insert(membros)
  toast.fire({ icon: 'success', title: 'Lista salva com sucesso!' })
  await fetchData()
}

const carregarLista = async () => {
  if (!listaSelecionada.value) return
  const { data } = await supabase.from('dds_listas_membros').select('funcionario_id, funcionarios (id, nome, matricula, funcao)').eq('lista_id', listaSelecionada.value)
  if (data) { listaAtual.value = data.map(i => i.funcionarios); assinaturas.value = {} }
}

const configurarCanvas = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  ctx = canvas.getContext('2d')
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f172a'
}

const abrirLousa = async (func) => { modal.value = { aberto: true, funcionario: func }; await nextTick(); configurarCanvas() }
const fecharLousa = () => { modal.value.aberto = false }
const limparLousa = () => { if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height) }
const iniciarTraco = (e) => { desenhando = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY) }
const desenharTraco = (e) => { if (desenhando) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke() } }
const pararTraco = () => { desenhando = false }
const getTouchPos = (e) => { const rect = canvasRef.value.getBoundingClientRect(); return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top } }
const iniciarTracoMobile = (e) => { e.preventDefault(); desenhando = true; ctx.beginPath(); const pos = getTouchPos(e); ctx.moveTo(pos.x, pos.y) }
const desenharTracoMobile = (e) => { e.preventDefault(); if (desenhando) { const pos = getTouchPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke() } }
const confirmarAssinatura = () => { assinaturas.value[modal.value.funcionario.id] = canvasRef.value.toDataURL('image/png'); fecharLousa() }

const salvarDDS = async () => {
  if (!form.value.tema_id) { toast.fire({ icon: 'warning', title: 'Selecione um tema antes de finalizar.' }); return }
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: aplicacao, error: erroApp } = await supabase.from('dds_aplicacoes').insert([{ tema_id: form.value.tema_id, aplicado_por: user?.id }]).select().single()
    if (erroApp) throw erroApp
    const assinaturasParaSalvar = listaAtual.value.map(func => ({ aplicacao_id: aplicacao.id, funcionario_id: func.id, imagem_assinatura: assinaturas.value[func.id] || null }))
    const { error: erroAssin } = await supabase.from('dds_assinaturas').insert(assinaturasParaSalvar)
    if (erroAssin) throw erroAssin
    toast.fire({ icon: 'success', title: 'DDS Registrado com sucesso!' })
    form.value.tema_id = ''; listaAtual.value = []; assinaturas.value = {}; listaSelecionada.value = ''
  } catch (error) {
    toast.fire({ icon: 'error', title: 'Erro ao registrar DDS', text: error.message })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
