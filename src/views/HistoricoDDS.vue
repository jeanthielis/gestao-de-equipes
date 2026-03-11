<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20 overflow-x-hidden">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div>
        <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Histórico e Auditoria</h2>
        <p class="text-slate-500 mt-1">Acompanhe os DDS aplicados e gere os relatórios oficiais em PDF.</p>
      </div>
      <div class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 flex items-center shadow-sm">
        <i class="fa-solid fa-folder-open mr-2"></i> {{ aplicacoes.length }} Registros Encontrados
      </div>
    </div>

    <div class="bg-slate-900 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1 w-full">
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Auditoria Rápida (Por Matrícula)</label>
        <div class="relative">
          <i class="fa-solid fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input @keyup.enter="buscarDDS" v-model="filtroMatricula" type="text" placeholder="Digite a matrícula do colaborador..." class="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white/10 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-lg">
        </div>
      </div>
      <div class="flex gap-2 w-full md:w-auto">
        <button @click="buscarDDS" :disabled="loading" class="flex-1 md:flex-none bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center">
          <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
          <i v-else class="fa-solid fa-magnifying-glass mr-2"></i> Buscar
        </button>
        <button v-if="filtroMatricula" @click="limparBusca" class="bg-slate-700 text-white font-bold px-4 py-3 rounded-xl hover:bg-slate-600 transition-colors" title="Limpar Filtro">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <div v-if="!loading && aplicacoes.length === 0" class="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-slate-400">
        <i class="fa-solid fa-inbox"></i>
      </div>
      <p class="font-bold text-lg text-slate-700">Nenhum registro encontrado.</p>
      <p class="text-sm mt-1">Verifique a matrícula digitada ou se já existem DDS aplicados.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="app in aplicacoes" :key="app.id" class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        
        <div class="p-5 border-b border-slate-100 bg-slate-50/50">
          <div class="flex justify-between items-start mb-3">
            <span :class="app.dds_temas?.dds_categorias?.cor || 'bg-slate-100 text-slate-600 border-slate-200'" class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border">
              {{ app.dds_temas?.dds_categorias?.nome || 'Sem Categoria' }}
            </span>
            <span class="text-xs font-bold text-slate-400 flex items-center">
              <i class="fa-regular fa-calendar mr-1"></i> {{ formatarDataCurta(app.data_aplicacao) }}
            </span>
          </div>
          <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ app.dds_temas?.titulo || 'Tema Excluído' }}</h3>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-center">
          <div class="flex items-center text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-3 text-lg">
              <i class="fa-solid fa-signature"></i>
            </div>
            <div>
              <p class="font-bold text-slate-800">{{ app.dds_assinaturas?.length || 0 }} Assinaturas</p>
              <p class="text-xs">coletadas neste dia</p>
            </div>
          </div>
        </div>

        <button @click="abrirDetalhes(app)" class="w-full py-4 text-sm font-bold text-indigo-600 bg-indigo-50 border-t border-indigo-100 hover:bg-indigo-100 transition-colors flex justify-center items-center">
          Ver Documento <i class="fa-solid fa-file-contract ml-2"></i>
        </button>
      </div>
    </div>

    <div v-if="modalAberto && appSelecionada" class="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        <div class="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{{ formatarDataCompleta(appSelecionada.data_aplicacao) }}</p>
            <h3 class="font-bold text-slate-800 text-xl">{{ appSelecionada.dds_temas?.titulo }}</h3>
          </div>
          <button @click="fecharDetalhes" class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold hover:bg-slate-300 transition-colors">X</button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          <div class="space-y-3">
            <div v-for="assinatura in appSelecionada.dds_assinaturas" :key="assinatura.id" class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm" :class="{'ring-2 ring-emerald-400': filtroMatricula && assinatura.funcionarios?.matricula === filtroMatricula}">
              <div>
                <p class="font-bold text-slate-800 text-sm">{{ assinatura.funcionarios?.nome || 'Operador Desconhecido' }}</p>
                <p class="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">MAT: {{ assinatura.funcionarios?.matricula || 'S/N' }}</p>
              </div>
              <div v-if="assinatura.imagem_assinatura" class="bg-slate-50 border border-slate-200 rounded-lg p-1">
                <img :src="assinatura.imagem_assinatura" class="h-10 w-24 object-contain" alt="Assinatura" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-slate-200">
          <button @click="gerarPDF" :disabled="gerandoPDF" class="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex justify-center items-center">
            <i v-if="gerandoPDF" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            <i v-else class="fa-solid fa-file-pdf text-rose-500 mr-2 text-lg"></i>
            {{ gerandoPDF ? 'Gerando Documento Oficial...' : 'Baixar Relatório em PDF' }}
          </button>
        </div>
      </div>
    </div>
<div v-if="appSelecionada" class="absolute -left-[9999px] top-0">
      <div id="documento-pdf" class="w-[720px] bg-white p-8 text-black font-sans">
        
        <div class="border-b-4 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-black tracking-tight uppercase text-slate-900">SafeTrack</h1>
            <h2 class="text-lg font-bold text-slate-600 mt-1">Registro Oficial de Treinamento (DDS)</h2>
          </div>
          <div class="text-right text-sm font-semibold text-slate-700">
            <p>Data: {{ formatarDataCurta(appSelecionada.data_aplicacao) }}</p>
            <p>ID: {{ appSelecionada.id.substring(0,8).toUpperCase() }}</p>
          </div>
        </div>

        <div class="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="mb-3">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tema Abordado</span>
            <p class="text-lg font-bold text-slate-900 leading-tight mt-1">{{ appSelecionada.dds_temas?.titulo }}</p>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Categoria</span>
            <p class="text-sm font-semibold text-slate-700 mt-0.5">{{ appSelecionada.dds_temas?.dds_categorias?.nome }}</p>
          </div>
        </div>

        <h3 class="text-base font-bold text-slate-900 mb-3 border-b-2 border-slate-200 pb-1">Lista de Presença e Conformidade</h3>
        <table class="w-full border-collapse border border-slate-300 text-sm mb-8 table-fixed">
          <thead>
            <tr class="bg-slate-100">
              <th class="border border-slate-300 p-2 text-left font-bold text-slate-700 w-[20%]">Matrícula</th>
              <th class="border border-slate-300 p-2 text-left font-bold text-slate-700 w-[50%]">Nome do Colaborador</th>
              <th class="border border-slate-300 p-2 text-center font-bold text-slate-700 w-[30%]">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ass in appSelecionada.dds_assinaturas" :key="ass.id" class="hover:bg-slate-50">
              <td class="border border-slate-300 p-2 font-mono text-xs font-semibold truncate">{{ ass.funcionarios?.matricula || 'N/A' }}</td>
              <td class="border border-slate-300 p-2 font-semibold text-slate-800 text-xs truncate">{{ ass.funcionarios?.nome }}</td>
              <td class="border border-slate-300 p-1 text-center align-middle">
                <img v-if="ass.imagem_assinatura" :src="ass.imagem_assinatura" class="h-8 mx-auto object-contain" />
                <span v-else class="text-[10px] text-slate-400 italic">Ausente</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-300 pt-4 leading-relaxed">
          <p>As assinaturas digitais acima confirmam que os colaboradores receberam a instrução e compreenderam as normas de segurança abordadas.</p>
          <p class="mt-1 font-semibold">Documento gerado eletronicamente pelo sistema SafeTrack Industrial sob os padrões da LGPD.</p>
        </div>

      </div>
    </div>  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toast, traduzirErro } from '../lib/alerts'
import html2pdf from 'html2pdf.js'

const aplicacoes = ref([])
const loading = ref(false)
const gerandoPDF = ref(false)
const filtroMatricula = ref('')

const modalAberto = ref(false)
const appSelecionada = ref(null)

const formatarDataCurta = (dataStr) => {
  if (!dataStr) return ''
  const data = new Date(dataStr)
  return data.toLocaleDateString('pt-BR')
}

const formatarDataCompleta = (dataStr) => {
  if (!dataStr) return ''
  const data = new Date(dataStr)
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const buscarDDS = async () => {
  loading.value = true
  try {
    const matricula = filtroMatricula.value.trim()

    if (matricula) {
      const { data: func } = await supabase.from('funcionarios').select('id').eq('matricula', matricula).single()
      if (!func) {
        toast.fire({ icon: 'warning', title: 'Matrícula não encontrada', text: 'Nenhum colaborador com esta matrícula.' })
        aplicacoes.value = []
        loading.value = false
        return
      }

      const { data: assinaturas } = await supabase.from('dds_assinaturas').select('aplicacao_id').eq('funcionario_id', func.id)
      const appIds = assinaturas.map(a => a.aplicacao_id)

      if (appIds.length === 0) {
        aplicacoes.value = []
        loading.value = false
        return
      }
      await buscarAplicacoes(appIds)
    } else {
      await buscarAplicacoes()
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const buscarAplicacoes = async (idsFiltro = null) => {
  let query = supabase.from('dds_aplicacoes').select(`
    id, data_aplicacao,
    dds_temas (titulo, dds_categorias(nome, cor)),
    dds_assinaturas (
      id, imagem_assinatura,
      funcionarios (nome, matricula)
    )
  `).order('data_aplicacao', { ascending: false }).limit(50)

  if (idsFiltro) query = query.in('id', idsFiltro)

  const { data } = await query
  if (data) aplicacoes.value = data
}

const limparBusca = () => {
  filtroMatricula.value = ''
  buscarDDS()
}

const abrirDetalhes = (app) => {
  appSelecionada.value = app
  modalAberto.value = true
}

const fecharDetalhes = () => {
  modalAberto.value = false
  appSelecionada.value = null
}

// A Mágica do PDF Acontece Aqui!
// A Mágica do PDF Acontece Aqui!
const gerarPDF = () => {
  gerandoPDF.value = true
  
  const elementoDiv = document.getElementById('documento-pdf')
  
  const opt = {
    margin:       10, // Margem de 10mm
    filename:     `Relatorio_DDS_${appSelecionada.value.dds_temas?.titulo.replace(/\s+/g, '_')}_${formatarDataCurta(appSelecionada.value.data_aplicacao).replace(/\//g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true,
      windowWidth: 814 // ISSO AQUI RESOLVE O CORTE! Força a captura numa janela larga.
    }, 
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(elementoDiv).save().then(() => {
    gerandoPDF.value = false
  }).catch(err => {
    console.error(err)
    toast.fire({ icon: 'error', title: 'Erro ao gerar PDF', text: traduzirErro(err) })
    gerandoPDF.value = false
  })
}

onMounted(() => {
  buscarDDS()
})
</script>