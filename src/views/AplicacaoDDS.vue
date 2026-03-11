<template>
  <div class="animate-fade-in max-w-3xl mx-auto space-y-6 pb-20 relative">
    
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
      <h2 class="text-2xl font-bold tracking-tight mb-1">Aplicação de DDS</h2>
      <p class="text-slate-300 text-sm">Monte a lista por matrícula e colete as assinaturas na tela.</p>
    </div>

    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 flex items-center">
          <span class="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
          Lista de Presença
        </h3>
        <select v-if="listasSalvas.length > 0" @change="carregarLista" v-model="listaSelecionada" class="text-xs border-slate-200 rounded-lg p-1.5 outline-none bg-slate-50 text-slate-600">
          <option value="" disabled>Carregar lista salva...</option>
          <option v-for="l in listasSalvas" :key="l.id" :value="l.id">{{ l.nome }}</option>
        </select>
      </div>
      
      <form @submit.prevent="adicionarPorMatricula" class="flex gap-2 mb-6">
        <input v-model="buscaMatricula" type="text" placeholder="Digite a matrícula e aperte Enter..." class="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
        <button type="submit" class="bg-indigo-600 text-white px-5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
          Adicionar
        </button>
      </form>

      <div class="space-y-2 mb-4">
        <div v-if="listaAtual.length === 0" class="text-center p-6 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          Ninguém na lista. Digite uma matrícula acima.
        </div>
        
        <div v-for="func in listaAtual" :key="func.id" class="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
          <div>
            <p class="font-bold text-sm text-slate-800">{{ func.nome }}</p>
            <p class="text-[10px] text-slate-500 font-mono uppercase tracking-widest">MAT: {{ func.matricula || 'S/N' }}</p>
          </div>
          <button @click="removerDaLista(func.id)" class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors" title="Remover da lista">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <button v-if="listaAtual.length > 0" @click="salvarListaAtual" class="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
        <i class="fa-solid fa-floppy-disk mr-2"></i> Salvar esta lista para usar amanhã
      </button>
    </div>

    <div v-if="listaAtual.length > 0" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <h3 class="font-bold text-slate-800 mb-4 flex items-center">
        <span class="bg-amber-100 text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
        Tema do Dia
      </h3>
      <select v-model="form.tema_id" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 mb-4">
        <option value="" disabled>Escolha o tema na biblioteca...</option>
        <option v-for="tema in temas" :key="tema.id" :value="tema.id">{{ tema.titulo }}</option>
      </select>

      <div v-if="temaSelecionado" class="bg-amber-50 p-4 rounded-xl border border-amber-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
        {{ temaSelecionado.conteudo }}
      </div>
    </div>

    <div v-if="form.tema_id && listaAtual.length > 0" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 flex items-center">
          <span class="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
          Assinaturas
        </h3>
        <span class="text-xs font-bold px-2 py-1 rounded-md" :class="assinaturasColetadas === listaAtual.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'">
          {{ assinaturasColetadas }} / {{ listaAtual.length }} Assinaram
        </span>
      </div>

      <div class="space-y-3">
        <div v-for="func in listaAtual" :key="func.id" class="flex items-center justify-between p-4 rounded-xl border transition-all" :class="assinaturas[func.id] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'">
          <div>
            <p class="font-bold text-sm" :class="assinaturas[func.id] ? 'text-emerald-800' : 'text-slate-700'">{{ func.nome }}</p>
            <p v-if="assinaturas[func.id]" class="text-xs text-emerald-600 font-semibold"><i class="fa-solid fa-check-double mr-1"></i> Assinatura coletada</p>
          </div>
          
          <button v-if="!assinaturas[func.id]" @click="abrirLousa(func)" class="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
            Assinar <i class="fa-solid fa-signature ml-1"></i>
          </button>
          
          <img v-else :src="assinaturas[func.id]" class="h-10 w-20 object-contain bg-white rounded border border-emerald-100" />
        </div>
      </div>
    </div>

    <button v-if="listaAtual.length > 0 && form.tema_id" @click="salvarDDS" :disabled="loading || assinaturasColetadas < listaAtual.length" class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center text-lg mt-8">
      <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
      {{ loading ? 'Registrando...' : (assinaturasColetadas < listaAtual.length ? 'Aguardando todas as assinaturas...' : 'Finalizar DDS') }}
    </button>

    <div v-if="modal.aberto" class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Assinatura Digital</p>
            <p class="font-bold text-slate-800 text-lg">{{ modal.funcionario?.nome }}</p>
          </div>
          <button @click="fecharLousa" class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">X</button>
        </div>
        
        <div class="p-4 bg-slate-100">
          <canvas ref="canvasRef" @mousedown="iniciarTraco" @mousemove="desenharTraco" @mouseup="pararTraco" @mouseleave="pararTraco" @touchstart="iniciarTracoMobile" @touchmove="desenharTracoMobile" @touchend="pararTraco" class="w-full h-64 bg-white rounded-xl border border-slate-300 shadow-inner cursor-crosshair touch-none"></canvas>
          <div class="flex justify-between mt-4">
            <button @click="limparLousa" class="text-slate-500 font-bold text-sm px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors">Limpar</button>
            <button @click="confirmarAssinatura" class="bg-emerald-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Confirmar Assinatura</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
// 1. IMPORTAÇÃO DOS ALERTAS MÁGICOS
import { toast, alerta } from '../lib/alerts' 

const temas = ref([])
const listasSalvas = ref([])
const listaAtual = ref([])
const assinaturas = ref({}) 

const buscaMatricula = ref('')
const listaSelecionada = ref('')
const loading = ref(false)

const form = ref({
  tema_id: '',
  equipe_id: null 
})

// === ESTADO DO MODAL DE ASSINATURA ===
const modal = ref({ aberto: false, funcionario: null })
const canvasRef = ref(null)
let ctx = null
let desenhando = false

// === INICIALIZAÇÃO ===
const fetchData = async () => {
  const { data: tm } = await supabase.from('dds_temas').select('*').order('titulo')
  if (tm) temas.value = tm

  const { data: ls } = await supabase.from('dds_listas').select('*').order('created_at', { ascending: false })
  if (ls) listasSalvas.value = ls
}

const temaSelecionado = computed(() => temas.value.find(t => t.id === form.value.tema_id))
const assinaturasColetadas = computed(() => Object.keys(assinaturas.value).length)

// === GESTÃO DA LISTA (MATRÍCULA) ===
const adicionarPorMatricula = async () => {
  if (!buscaMatricula.value) return
  
  const matriculaLimpa = buscaMatricula.value.trim()
  
  if (listaAtual.value.some(f => f.matricula === matriculaLimpa)) {
    // 2. SUBSTITUINDO O ALERT ANTIGO
    toast.fire({ icon: 'info', title: 'Atenção', text: 'Este colaborador já está na lista atual.' })
    buscaMatricula.value = ''
    return
  }

  const { data: func, error } = await supabase
    .from('funcionarios')
    .select('id, nome, matricula, funcao')
    .eq('matricula', matriculaLimpa)
    .single()

  if (func) {
    listaAtual.value.push(func)
    buscaMatricula.value = ''
  } else {
    // 3. ERRO DE MATRÍCULA BONITO
    toast.fire({ icon: 'error', title: 'Não encontrado!', text: `A matrícula ${matriculaLimpa} não existe ou está inativa.` })
  }
}

const removerDaLista = (id) => {
  listaAtual.value = listaAtual.value.filter(f => f.id !== id)
  if(assinaturas.value[id]) delete assinaturas.value[id]
}

const salvarListaAtual = async () => {
  // 4. SUBSTITUINDO O PROMPT FEIO PELO SWEETALERT
  const { value: nome } = await alerta.fire({
    title: 'Salvar Lista de Presença',
    input: 'text',
    inputLabel: 'Dê um nome para esta lista (Ex: Turma A - Manhã)',
    inputPlaceholder: 'Digite o nome...',
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar'
  })

  if (!nome) return

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: novaLista, error: err1 } = await supabase
    .from('dds_listas')
    .insert([{ nome, criado_por: user.id }])
    .select().single()

  if(err1) { 
    toast.fire({ icon: 'error', title: 'Erro ao salvar a lista base.' })
    return 
  }

  const membros = listaAtual.value.map(f => ({ lista_id: novaLista.id, funcionario_id: f.id }))
  await supabase.from('dds_listas_membros').insert(membros)

  // 5. SUCESSO AO SALVAR LISTA
  toast.fire({ icon: 'success', title: 'Lista salva com sucesso!' })
  await fetchData() 
}

const carregarLista = async () => {
  if (!listaSelecionada.value) return
  
  const { data } = await supabase
    .from('dds_listas_membros')
    .select(`
      funcionario_id,
      funcionarios (id, nome, matricula, funcao)
    `)
    .eq('lista_id', listaSelecionada.value)

  if (data) {
    listaAtual.value = data.map(item => item.funcionarios)
    assinaturas.value = {} 
  }
}

// === LÓGICA DO CANVAS (LOUSA DIGITAL) ===
const configurarCanvas = () => {
  if(!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  ctx = canvas.getContext('2d')
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#0f172a' 
}

const abrirLousa = async (func) => {
  modal.value = { aberto: true, funcionario: func }
  await nextTick() 
  configurarCanvas()
}

const fecharLousa = () => { modal.value.aberto = false }
const limparLousa = () => { ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height) }

const iniciarTraco = (e) => { desenhando = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY) }
const desenharTraco = (e) => { if (desenhando) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke() } }
const pararTraco = () => { desenhando = false }

const getTouchPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
}
const iniciarTracoMobile = (e) => { e.preventDefault(); desenhando = true; ctx.beginPath(); const pos = getTouchPos(e); ctx.moveTo(pos.x, pos.y) }
const desenharTracoMobile = (e) => { e.preventDefault(); if (desenhando) { const pos = getTouchPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke() } }

const confirmarAssinatura = () => {
  const imagemBase64 = canvasRef.value.toDataURL("image/png")
  assinaturas.value[modal.value.funcionario.id] = imagemBase64
  fecharLousa()
}

// === SALVAR O DDS FINAL ===
const salvarDDS = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: aplicacao, error: erroApp } = await supabase
      .from('dds_aplicacoes')
      .insert([{
        tema_id: form.value.tema_id,
        aplicado_por: user?.id
      }])
      .select().single()

    if (erroApp) throw erroApp

    const assinaturasParaSalvar = listaAtual.value.map(func => ({
      aplicacao_id: aplicacao.id,
      funcionario_id: func.id,
      imagem_assinatura: assinaturas.value[func.id] 
    }))

    const { error: erroAssin } = await supabase.from('dds_assinaturas').insert(assinaturasParaSalvar)
    if (erroAssin) throw erroAssin

    // 6. SUCESSO FINAL AO ASSINAR O DDS
    toast.fire({ icon: 'success', title: 'DDS Registrado!', text: 'Assinaturas salvas no sistema.' })
    
    form.value.tema_id = ''
    listaAtual.value = []
    assinaturas.value = {}
    listaSelecionada.value = ''

  } catch (error) {
    // 7. ERRO GERAL
    toast.fire({ icon: 'error', title: 'Erro ao salvar', text: error.message })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>