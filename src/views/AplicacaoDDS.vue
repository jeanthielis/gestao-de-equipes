<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, alerta } from '../lib/alerts' 

const temas = ref([])
const listasSalvas = ref([])
const listaAtual = ref([])
const assinaturas = ref({}) 

const buscaMatricula = ref('')
const listaSelecionada = ref('')
const loading = ref(false)

const form = ref({ tema_id: '', equipe_id: null })

const modal = ref({ aberto: false, funcionario: null })
const canvasRef = ref(null)
let ctx = null; let desenhando = false

const fetchData = async () => {
  const { data: tm } = await supabase.from('dds_temas').select('*').order('titulo')
  if (tm) temas.value = tm
  const { data: ls } = await supabase.from('dds_listas').select('*').order('created_at', { ascending: false })
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

  // RPC: "buscar_funcionario_dds" ignora restrições e acha qualquer um ativo
  const { data: func, error } = await supabase
    .rpc('buscar_funcionario_dds', { p_matricula: matriculaLimpa })

  if (func && func.length > 0) {
    // Retorna um array, pegamos o primeiro
    listaAtual.value.push(func[0]) 
    buscaMatricula.value = ''
  } else {
    toast.fire({ icon: 'error', title: 'Não encontrado!', text: `A matrícula ${matriculaLimpa} não existe ou está inativa.` })
  }
}

const removerDaLista = (id) => {
  listaAtual.value = listaAtual.value.filter(f => f.id !== id)
  if(assinaturas.value[id]) delete assinaturas.value[id]
}

const salvarListaAtual = async () => {
  const { value: nome } = await alerta.fire({ title: 'Salvar Lista', input: 'text', inputPlaceholder: 'Nome (Ex: Turma A)', showCancelButton: true })
  if (!nome) return
  const { data: { user } } = await supabase.auth.getUser()
  const { data: novaLista, error: err1 } = await supabase.from('dds_listas').insert([{ nome, criado_por: user.id }]).select().single()
  if(err1) { toast.fire({ icon: 'error', title: 'Erro.' }); return }
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
  if(!canvasRef.value) return
  const canvas = canvasRef.value; const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width; canvas.height = rect.height
  ctx = canvas.getContext('2d'); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a' 
}

const abrirLousa = async (func) => { modal.value = { aberto: true, funcionario: func }; await nextTick(); configurarCanvas() }
const fecharLousa = () => { modal.value.aberto = false }
const limparLousa = () => { ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height) }
const iniciarTraco = (e) => { desenhando = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY) }
const desenharTraco = (e) => { if (desenhando) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke() } }
const pararTraco = () => { desenhando = false }
const getTouchPos = (e) => { const rect = canvasRef.value.getBoundingClientRect(); return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top } }
const iniciarTracoMobile = (e) => { e.preventDefault(); desenhando = true; ctx.beginPath(); const pos = getTouchPos(e); ctx.moveTo(pos.x, pos.y) }
const desenharTracoMobile = (e) => { e.preventDefault(); if (desenhando) { const pos = getTouchPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke() } }
const confirmarAssinatura = () => { assinaturas.value[modal.value.funcionario.id] = canvasRef.value.toDataURL("image/png"); fecharLousa() }

const salvarDDS = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: aplicacao, error: erroApp } = await supabase.from('dds_aplicacoes').insert([{ tema_id: form.value.tema_id, aplicado_por: user?.id }]).select().single()
    if (erroApp) throw erroApp
    const assinaturasParaSalvar = listaAtual.value.map(func => ({ aplicacao_id: aplicacao.id, funcionario_id: func.id, imagem_assinatura: assinaturas.value[func.id] }))
    const { error: erroAssin } = await supabase.from('dds_assinaturas').insert(assinaturasParaSalvar)
    if (erroAssin) throw erroAssin
    toast.fire({ icon: 'success', title: 'DDS Registrado!' })
    form.value.tema_id = ''; listaAtual.value = []; assinaturas.value = {}; listaSelecionada.value = ''
  } catch (error) { toast.fire({ icon: 'error', text: error.message }) } finally { loading.value = false }
}

onMounted(fetchData)
</script>
