<template>
  <div class="animate-fade-in max-w-5xl mx-auto space-y-6 pb-20">
    
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold tracking-tight mb-1">Diário de Bordo & Auditoria</h2>
          <p class="text-slate-300 text-sm">Monte sua equipe e avalie os checklists diários operacionais.</p>
        </div>
        <div class="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center border border-white/20">
          <i class="fa-regular fa-calendar mr-2"></i> {{ dataDeHoje }}
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 flex items-center">
          <span class="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
          Montar Equipe do Dia
        </h3>
        
        <select v-if="listasSalvas.length > 0" @change="carregarLista" v-model="listaSelecionada" class="text-xs border-slate-200 rounded-lg p-2 outline-none bg-slate-50 text-slate-600 font-bold focus:ring-2 focus:ring-indigo-500">
          <option value="" disabled>Carregar lista salva...</option>
          <option v-for="l in listasSalvas" :key="l.id" :value="l.id">{{ l.nome }}</option>
        </select>
      </div>
      
      <form @submit.prevent="adicionarPorMatricula" class="flex gap-2 mb-6">
        <div class="relative flex-1">
          <i class="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input v-model="buscaMatricula" type="text" placeholder="Digite a matrícula e aperte Enter..." class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
        </div>
        <button type="submit" class="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
          Adicionar
        </button>
      </form>

      <div class="flex flex-wrap gap-2 mb-4">
        <div v-if="listaAtual.length === 0" class="w-full text-center p-6 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          Nenhum colaborador na lista. Digite a matrícula acima.
        </div>
        
        <div v-for="func in listaAtual" :key="func.id" class="flex items-center bg-white border border-slate-200 rounded-lg pl-3 pr-1 py-1 shadow-sm">
          <div class="mr-3">
            <p class="font-bold text-xs text-slate-800">{{ func.nome }}</p>
            <p class="text-[9px] text-slate-500 font-mono">MAT: {{ func.matricula || 'S/N' }}</p>
          </div>
          <button @click="removerDaLista(func.id)" class="w-6 h-6 rounded bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </div>

      <button v-if="listaAtual.length > 0" @click="salvarListaAtual" class="w-full py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase tracking-wider">
        <i class="fa-solid fa-floppy-disk mr-2"></i> Salvar esta equipe para amanhã
      </button>
    </div>

    <div v-if="listaAtual.length > 0" class="space-y-4">
      <h3 class="font-bold text-slate-800 flex items-center px-2">
        <span class="bg-amber-100 text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
        Avaliação Individual
      </h3>

      <div v-for="func in listaAtual" :key="func.id" class="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200">
        <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
              {{ func.nome.charAt(0) }}
            </div>
            <div>
              <p class="font-bold text-slate-800 text-lg leading-none">{{ func.nome }}</p>
              <p class="text-xs text-slate-500 font-mono mt-1">Matrícula: {{ func.matricula || 'S/N' }}</p>
            </div>
          </div>
          <!-- Campo de presença -->
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs font-bold text-slate-500 hidden sm:block">Presença:</span>
            <button @click="togglePresenca(func.id)"
              :class="presencas[func.id] !== false ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-rose-50 text-rose-600 border-rose-300'"
              class="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid" :class="presencas[func.id] !== false ? 'fa-user-check' : 'fa-user-slash'"></i>
              {{ presencas[func.id] !== false ? 'Presente' : 'Ausente' }}
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <div v-for="quesito in quesitos" :key="quesito.id" class="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p class="text-sm font-bold text-slate-700 mb-3">{{ quesito.titulo }}</p>
            
            <div class="flex gap-2 mb-3">
              <button @click="definirStatus(func.id, quesito.id, 'C')" :class="avaliacoes[func.id][quesito.id].status === 'C' ? 'bg-emerald-500 text-white ring-2 ring-emerald-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                <i class="fa-solid fa-check mr-1"></i> Conforme (C)
              </button>
              
              <button @click="definirStatus(func.id, quesito.id, 'CP')" :class="avaliacoes[func.id][quesito.id].status === 'CP' ? 'bg-amber-500 text-white ring-2 ring-amber-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                <i class="fa-solid fa-minus mr-1"></i> Parcial (CP)
              </button>
              
              <button @click="definirStatus(func.id, quesito.id, 'NC')" :class="avaliacoes[func.id][quesito.id].status === 'NC' ? 'bg-rose-500 text-white ring-2 ring-rose-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                <i class="fa-solid fa-xmark mr-1"></i> Não Conforme (NC)
              </button>
            </div>

            <div v-if="avaliacoes[func.id][quesito.id].status === 'CP' || avaliacoes[func.id][quesito.id].status === 'NC'" class="animate-fade-in mt-2">
              <textarea v-model="avaliacoes[func.id][quesito.id].justificativa" rows="2" placeholder="Obrigatório: Digite o motivo desta avaliação..." required class="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors resize-none" :class="avaliacoes[func.id][quesito.id].status === 'CP' ? 'bg-amber-50/50 border-amber-200 focus:ring-2 focus:ring-amber-500 placeholder-amber-300' : 'bg-rose-50/50 border-rose-200 focus:ring-2 focus:ring-rose-500 placeholder-rose-300'"></textarea>
            </div>
          </div>
        </div>
      </div>

      <button @click="salvarAvaliacoes" :disabled="salvando" class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center text-lg mt-8">
        <i v-if="salvando" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
        <i v-else class="fa-solid fa-clipboard-check mr-2"></i>
        {{ salvando ? 'Registrando Auditoria...' : 'Finalizar Diário de Bordo' }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
// IMPORTAÇÃO DOS ALERTAS MÁGICOS AQUI:
import { toast, alerta } from '../lib/alerts' 

const listasSalvas = ref([])
const listaAtual = ref([])
const quesitos = ref([])
const avaliacoes = ref({}) 

const buscaMatricula = ref('')
const listaSelecionada = ref('')
const salvando = ref(false)
const presencas = ref({}) // true = presente, false = ausente

const dataDeHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

const fetchData = async () => {
  const { data: q } = await supabase.from('itens_checklist').select('id, descricao').order('descricao')
  if (q) quesitos.value = q.map(item => ({ id: item.id, titulo: item.descricao }))

  const { data: ls } = await supabase.from('diario_listas').select('*').order('created_at', { ascending: false })
  if (ls) listasSalvas.value = ls
}

const inicializarAvaliacao = (funcId) => {
  if (!avaliacoes.value[funcId]) {
    avaliacoes.value[funcId] = {}
    quesitos.value.forEach(q => {
      avaliacoes.value[funcId][q.id] = { status: 'C', justificativa: '' }
    })
  }
}

const adicionarPorMatricula = async () => {
  if (!buscaMatricula.value) return
  const matriculaLimpa = buscaMatricula.value.trim()
  
  if (listaAtual.value.some(f => f.matricula === matriculaLimpa)) {
    // AVISO BONITO DE MATRÍCULA DUPLICADA
    toast.fire({ icon: 'info', title: 'Colaborador já está na lista atual.' })
    buscaMatricula.value = ''
    return
  }

  const { data: func } = await supabase.from('funcionarios').select('id, nome, matricula, funcao').eq('matricula', matriculaLimpa).single()

  if (func) {
    listaAtual.value.push(func)
    inicializarAvaliacao(func.id)
    presencas.value[func.id] = true
    buscaMatricula.value = ''
  } else {
    // ERRO BONITO DE MATRÍCULA
    toast.fire({ icon: 'error', title: 'Matrícula não encontrada!' })
  }
}

const removerDaLista = (id) => {
  listaAtual.value = listaAtual.value.filter(f => f.id !== id)
  delete avaliacoes.value[id]
}

const definirStatus = (funcId, quesitoId, status) => {
  avaliacoes.value[funcId][quesitoId].status = status
  if (status === 'C') avaliacoes.value[funcId][quesitoId].justificativa = ''
}

const salvarListaAtual = async () => {
  // SUBSTITUIÇÃO DO PROMPT FEIO PELO SWEETALERT
  const { value: nomeDaLista } = await alerta.fire({
    title: 'Salvar Equipe',
    input: 'text',
    inputLabel: 'Dê um nome para esta lista (Ex: Turma C - Forno)',
    inputPlaceholder: 'Digite o nome aqui...',
    showCancelButton: true,
    confirmButtonText: 'Salvar Lista',
    cancelButtonText: 'Cancelar'
  })

  if (!nomeDaLista) return

  const { data: { user } } = await supabase.auth.getUser()
  const { data: novaLista, error: err1 } = await supabase.from('diario_listas').insert([{ nome: nomeDaLista, criado_por: user.id }]).select().single()

  if (err1) { 
    toast.fire({ icon: 'error', title: 'Erro ao salvar a lista.' })
    return 
  }

  const membros = listaAtual.value.map(f => ({ lista_id: novaLista.id, funcionario_id: f.id }))
  await supabase.from('diario_membros').insert(membros)

  toast.fire({ icon: 'success', title: 'Lista salva para uso futuro!' })
  await fetchData()
}

const carregarLista = async () => {
  if (!listaSelecionada.value) return
  const { data } = await supabase.from('diario_membros').select('funcionarios(id, nome, matricula, funcao)').eq('lista_id', listaSelecionada.value)

  if (data) {
    listaAtual.value = data.map(item => item.funcionarios)
    listaAtual.value.forEach(f => inicializarAvaliacao(f.id))
  }
}

const salvarAvaliacoes = async () => {
  // Validação: Exigir justificativa para CP e NC
  for (const func of listaAtual.value) {
    for (const q of quesitos.value) {
      const resp = avaliacoes.value[func.id][q.id]
      if ((resp.status === 'CP' || resp.status === 'NC') && !resp.justificativa.trim()) {
        // ALERTA DE VALIDAÇÃO
        alerta.fire({
          icon: 'warning',
          title: 'Justificativa Obrigatória',
          html: `Você marcou <b>${resp.status}</b> para o colaborador <b>${func.nome}</b> no quesito:<br><i>"${q.titulo}"</i>.<br><br>Por favor, escreva a justificativa.`
        })
        return
      }
    }
  }

  salvando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: execucao, error: errExec } = await supabase.from('diario_execucoes').insert([{ registrado_por: user.id }]).select().single()
    if (errExec) throw errExec

    const payload = []
    listaAtual.value.forEach(func => {
      quesitos.value.forEach(q => {
        const resp = avaliacoes.value[func.id][q.id]
        // Só avalia quem está presente
        if (presencas.value[func.id] === false) return
        payload.push({
          execucao_id: execucao.id,
          funcionario_id: func.id,
          quesito_id: q.id,
          status: resp.status,
          justificativa: resp.justificativa || null
        })
      })
    })

    const { error: errAva } = await supabase.from('diario_avaliacoes').insert(payload)
    if (errAva) throw errAva

    // SUCESSO!
    toast.fire({ icon: 'success', title: 'Auditoria registrada com sucesso!' })
    
    listaAtual.value = []
    avaliacoes.value = {}
    presencas.value = {}
    listaSelecionada.value = ''

  } catch (error) {
    toast.fire({ icon: 'error', title: 'Erro ao salvar', text: error.message })
    console.error(error)
  } finally {
    salvando.value = false
  }
}

onMounted(fetchData)
</script>