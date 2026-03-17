<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">

    <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Controle de Acesso & Escopo</h2>
          <p class="text-slate-500 text-sm">Gerencie usuários, permissões de módulos e visibilidade de dados.</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="abaAtiva = 'usuarios'" :class="abaAtiva === 'usuarios' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all">Usuários</button>
          <button @click="abaAtiva = 'niveis'" :class="abaAtiva === 'niveis' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'" class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all">Cargos</button>
        </div>
      </div>
    </div>

    <div v-if="abaAtiva === 'usuarios'" class="space-y-4">
      <div class="flex justify-end">
        <button @click="abrirModalCadastro" class="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all"><i class="fa-solid fa-user-plus mr-2"></i>Cadastrar Usuário</button>
      </div>

      <div v-if="modalAberto" class="bg-white rounded-3xl border border-indigo-200 shadow-lg p-6">
        <h3 class="font-black text-slate-800 text-lg mb-5">Novo Usuário</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase mb-1">Nome Completo</label>
              <input v-model="form.nome" @input="gerarLoginAutomatico" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"/>
            </div>
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase mb-1">Login e Senha</label>
              <div class="flex gap-2">
                <input v-model="form.loginGerado" disabled placeholder="Login gerado..." class="w-full px-4 py-3 rounded-xl border bg-slate-50 text-indigo-700 text-sm font-mono"/>
                <input v-model="form.senha" type="password" placeholder="Senha" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"/>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-slate-500 uppercase mb-1">Unidade Físíca</label>
            <select v-model="form.unidadeId" @change="form.setorId = ''; form.equipeId = ''" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white">
              <option value="">Selecione...</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase mb-1">Setor</label>
            <select v-model="form.setorId" @change="form.equipeId = ''" :disabled="!form.unidadeId" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white disabled:opacity-50">
              <option value="">Selecione...</option>
              <option v-for="s in setoresDaUnidade" :key="s.id" :value="s.id">{{ s.nome }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase mb-1">Equipe/Turno (Opcional)</label>
            <select v-model="form.equipeId" :disabled="!form.setorId" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white disabled:opacity-50">
              <option value="">Todas / Selecione...</option>
              <option v-for="e in equipesDoSetor" :key="e.id" :value="e.id">{{ e.nome }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="salvarNovoUsuario" :disabled="salvando || !form.nome || !form.senha" class="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {{ salvando ? 'Criando...' : 'Criar Usuário' }}
          </button>
          <button @click="fecharModal" class="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">Cancelar</button>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[600px]">
          <thead class="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3">Usuário</th>
              <th class="px-4 py-3">Cargo no Sistema</th>
              <th class="px-4 py-3">Escopo de Visão</th>
              <th class="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="usuarios.length === 0">
              <td colspan="4" class="px-5 py-12 text-center text-slate-400">
                <i class="fa-solid fa-users text-3xl block mb-2 text-slate-300"></i>
                <p class="font-bold text-slate-500">Nenhum usuário encontrado.</p>
                <p class="text-xs mt-1">Cadastre um usuário usando o botão acima.</p>
              </td>
            </tr>
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-slate-50/50">
              <td class="px-5 py-4">
                <div class="font-bold text-slate-700">{{ u.nome }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ u.email }}</div>
              </td>
              <td class="px-4 py-4">
                <button @click="alterarNivelUsuario(u)" class="px-3 py-1 rounded-lg font-bold text-[10px] uppercase border hover:bg-indigo-50" :class="u.nivel_id ? 'text-indigo-700 border-indigo-200' : 'text-amber-600 border-amber-200'">
                  {{ u.niveis_acesso?.nome || '⚠️ Sem Cargo' }}
                </button>
              </td>
              <td class="px-4 py-4">
                <button @click="configurarEscopo(u)" class="px-3 py-1 rounded-lg text-xs border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium">
                  <i class="fa-solid fa-eye mr-1"></i> {{ u.nivel_visibilidade || 'Equipe' }}
                  <span v-if="u.nivel_visibilidade === 'Unidade'" class="block text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">{{ u.unidade_vinculada?.nome }}</span>
                  <span v-if="u.nivel_visibilidade === 'Setor'" class="block text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">{{ u.setor_vinculado?.nome }}</span>
                  <span v-if="u.nivel_visibilidade === 'Equipe'" class="block text-[9px] text-slate-400 mt-0.5 truncate max-w-[120px]">{{ u.equipe_vinculada?.nome }}</span>
                </button>
              </td>
              <td class="px-4 py-4 text-right">
                <button @click="excluirUsuario(u)" class="text-slate-300 hover:text-rose-500"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Aba: Cargos (níveis de acesso) -->
    <div v-if="abaAtiva === 'niveis'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Formulário novo cargo -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h3 class="font-bold text-slate-800 mb-5 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            Novo Cargo
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase mb-1">Nome do Cargo</label>
              <input v-model="novoNivel.nome" type="text" placeholder="Ex: Supervisor de Turno"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-black text-slate-500 uppercase mb-2">Permissões de Módulos</label>
              <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <label v-for="mod in todosModulos" :key="mod.slug"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                  :class="novoNivel.permissoes.includes(mod.slug) ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'">
                  <input type="checkbox" :value="mod.slug" v-model="novoNivel.permissoes" class="rounded text-indigo-600" />
                  <div>
                    <p class="text-xs font-bold text-slate-700">{{ mod.label }}</p>
                    <p class="text-[10px] text-slate-400 font-mono">{{ mod.slug }}</p>
                  </div>
                </label>
              </div>
            </div>
            <button @click="salvarNivel" :disabled="salvandoNivel || !novoNivel.nome"
              class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex justify-center items-center shadow-sm">
              <i v-if="salvandoNivel" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              {{ salvandoNivel ? 'Salvando...' : 'Criar Cargo' }}
            </button>
          </div>
        </div>

        <!-- Lista de cargos existentes -->
        <div class="lg:col-span-2 space-y-3">
          <div v-if="niveis.length === 0" class="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            <i class="fa-solid fa-shield-halved text-3xl block mb-2 text-slate-300"></i>
            <p class="font-bold text-slate-500">Nenhum cargo criado ainda.</p>
            <p class="text-xs mt-1">Crie um cargo e atribua permissões de módulos a ele.</p>
          </div>
          <div v-for="nivel in niveis" :key="nivel.id"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <i class="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <div>
                  <p class="font-black text-slate-800">{{ nivel.nome }}</p>
                  <p class="text-[10px] text-slate-400">
                    {{ nivel.permissoes_acesso?.length || 0 }} permissão(ões) •
                    {{ usuarios.filter(u => u.nivel_id === nivel.id).length }} usuário(s)
                  </p>
                </div>
              </div>
              <button @click="excluirNivel(nivel)" class="text-slate-300 hover:text-rose-500 transition-colors p-2">
                <i class="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
            <div class="px-5 py-3 flex flex-wrap gap-1.5">
              <span v-if="!nivel.permissoes_acesso?.length" class="text-xs text-slate-400 italic">Sem permissões atribuídas.</span>
              <span v-for="p in nivel.permissoes_acesso" :key="p.nivel_id + p.modulo_slug"
                class="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold font-mono">
                {{ p.modulo_slug }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase, supabaseCadastro } from '../lib/supabase'
import { useDadosStore } from '../stores/dados'
import { useAuthStore } from '../stores/auth'
import { toast, alerta, traduzirErro } from '../lib/alerts'
import { registrarLog } from '../lib/auditoria'

const abaAtiva = ref('usuarios')
const usuarios = ref([])
const niveis = ref([])
const unidades = ref([])
const setores = ref([])
const equipes = ref([])

const modalAberto = ref(false)
const salvando = ref(false)
const dadosStore = useDadosStore()
const authStore = useAuthStore()
const dominio = import.meta.env.VITE_EMAIL_DOMAIN || '@safetrack.com.br'

const form = ref({ nome: '', loginGerado: '', senha: '', unidadeId: '', setorId: '', equipeId: '' })

// Cascatas
const setoresDaUnidade = computed(() => form.value.unidadeId ? setores.value.filter(s => s.unidade_id === form.value.unidadeId) : [])
const equipesDoSetor = computed(() => form.value.setorId ? equipes.value.filter(e => e.setor_id === form.value.setorId) : [])

const abrirModalCadastro = () => { form.value = { nome: '', loginGerado: '', senha: '', unidadeId: '', setorId: '', equipeId: '' }; modalAberto.value = true }
const fecharModal = () => { modalAberto.value = false }

const gerarLoginAutomatico = () => {
  const nome = form.value.nome.trim()
  if (!nome) { form.value.loginGerado = ''; return }
  const normalizar = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const partes = nome.split(/\s+/).filter(Boolean)
  form.value.loginGerado = partes.length === 1 ? normalizar(partes[0]) : `${normalizar(partes[0])}.${normalizar(partes[partes.length - 1])}`
}

const fetchData = async () => {
  let qUsuarios = supabase.from('usuarios').select(`
      id, nome, email, nivel_id, nivel_visibilidade, equipe_id,
      niveis_acesso ( nome ),
      unidade_vinculada:unidade_vinculada_id ( nome ),
      setor_vinculado:setor_vinculado_id ( nome ),
      equipe_vinculada:equipe_vinculada_id ( nome )
    `).order('nome')

  // Não-SuperAdmin vê apenas usuários da própria equipe
  if (!authStore.isSuperAdmin && authStore.equipeId) {
    qUsuarios = qUsuarios.eq('equipe_id', authStore.equipeId)
  }

  const [resU, resP, u, s, e] = await Promise.all([
    qUsuarios,
    // Permissões sempre frescas (mudam ao criar/excluir cargos)
    supabase.from('permissoes_acesso').select('nivel_id, modulo_slug'),
    // Estrutura vem do cache compartilhado
    dadosStore.getUnidades(),
    dadosStore.getSetores(),
    dadosStore.getEquipesSimples(),
  ])
  // niveis também do cache
  const niveisRaw = await dadosStore.getNiveis()
  const resN = { data: niveisRaw, error: null }

  if (resU.error) {
    console.error('[GestaoAcesso] Erro ao buscar usuários:', resU.error)
    toast.fire({ icon: 'error', title: 'Erro ao carregar usuários', text: traduzirErro(resU.error) })
  }
  if (resN.error) {
    console.error('[GestaoAcesso] Erro cargos (completo):', JSON.stringify(resN.error))
  }
  if (resP.error) {
    console.error('[GestaoAcesso] Erro permissões (completo):', JSON.stringify(resP.error))
  }

  // Mescla permissões dentro de cada nível manualmente
  const permissoes = resP.data || []
  niveis.value = (resN.data || []).map(n => ({
    ...n,
    permissoes_acesso: permissoes.filter(p => p.nivel_id === n.id)
  }))

  usuarios.value = resU.data || []
  unidades.value = u
  setores.value  = s
  equipes.value  = e
}

const salvarNovoUsuario = async () => {
  salvando.value = true
  const emailCompleto = `${form.value.loginGerado}${dominio}`
  try {
    const { data, error } = await supabaseCadastro.auth.signUp({ email: emailCompleto, password: form.value.senha, options: { data: { nome: form.value.nome } } })
    if (error) throw error
    let userId = data?.user?.id
    if (!userId) {
      await new Promise(r => setTimeout(r, 1000))
      const { data: existing } = await supabase.from('usuarios').select('id').eq('email', emailCompleto).maybeSingle()
      userId = existing?.id
    }
    if (userId) {
      // Configura visibilidade padrão baseada no preenchimento
      let visibilidade = 'Global'
      if (form.value.unidadeId) visibilidade = 'Unidade'
      if (form.value.setorId) visibilidade = 'Setor'
      if (form.value.equipeId) visibilidade = 'Equipe'

      // Não-SuperAdmin: força equipe do próprio usuário logado
      const equipeDestino = authStore.isSuperAdmin
        ? (form.value.equipeId || null)
        : authStore.equipeId

      if (!authStore.isSuperAdmin) visibilidade = 'Equipe'

      const insertData = {
        id: userId, nome: form.value.nome, email: emailCompleto,
        unidade_vinculada_id: form.value.unidadeId || null,
        setor_vinculado_id: form.value.setorId || null,
        equipe_vinculada_id: equipeDestino,
        equipe_id: equipeDestino,
        nivel_visibilidade: visibilidade
      }
      
      const { data: jaExiste } = await supabase.from('usuarios').select('id').eq('id', userId).maybeSingle()
      if (!jaExiste) await supabase.from('usuarios').insert([insertData])
      else await supabase.from('usuarios').update(insertData).eq('id', userId)
      
      toast.fire({ icon: 'success', title: 'Usuário criado!' })
      fecharModal()
      await fetchData()
    }
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(err) })
  } finally {
    salvando.value = false
  }
}

const alterarNivelUsuario = async (u) => {
  const opcoes = { '': 'Sem Nível' }; niveis.value.forEach(n => { opcoes[n.id] = n.nome })
  const { value, isConfirmed } = await alerta.fire({ title: 'Cargo no Sistema', input: 'select', inputOptions: opcoes, inputValue: u.nivel_id || '', showCancelButton: true })
  if (isConfirmed) {
    await supabase.from('usuarios').update({ nivel_id: value === '' ? null : value }).eq('id', u.id)
    toast.fire({ icon: 'success', title: 'Cargo atualizado' }); await fetchData()
  }
}

// NOVO: Configurar o Escopo Dinamicamente
const configurarEscopo = async (u) => {
  const { value: formValues } = await alerta.fire({
    title: `Escopo: ${u.nome}`,
    html: `
      <select id="swal-vis" class="w-full px-4 py-3 rounded-xl border border-slate-200 mb-2">
        <option value="Equipe" ${u.nivel_visibilidade==='Equipe'?'selected':''}>Apenas Equipe</option>
        <option value="Setor" ${u.nivel_visibilidade==='Setor'?'selected':''}>Todo o Setor</option>
        <option value="Unidade" ${u.nivel_visibilidade==='Unidade'?'selected':''}>Toda a Unidade</option>
        <option value="Global" ${u.nivel_visibilidade==='Global'?'selected':''}>Acesso Total</option>
      </select>
      <p class="text-xs text-slate-500 text-left">Isso determina quais dados ele verá nos relatórios.</p>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Salvar Visão',
    preConfirm: () => document.getElementById('swal-vis').value
  })

  if (formValues) {
    await supabase.from('usuarios').update({ nivel_visibilidade: formValues }).eq('id', u.id)
    toast.fire({ icon: 'success', title: 'Visibilidade atualizada!' }); await fetchData()
  }
}

const excluirUsuario = async (u) => {
  const { isConfirmed } = await alerta.fire({ title: 'Excluir?', text: 'Remover usuário?', icon: 'warning', showCancelButton: true })
  if (isConfirmed) {
    await supabase.from('usuarios').delete().eq('id', u.id)
    toast.fire({ icon: 'success', title: 'Removido' }); await fetchData()
  }
}

// Lista completa de módulos disponíveis no sistema
const todosModulos = [
  { slug: 'home',               label: 'Painel Operacional' },
  { slug: 'tendencias',         label: 'Tendências' },
  { slug: 'funcionarios',       label: 'Efetivo & Operadores' },
  { slug: 'unidades',           label: 'Estrutura e Liderança' },
  { slug: 'checklists',         label: 'Configurações de Checklist' },
  { slug: 'dds_temas',          label: 'Biblioteca de DDS' },
  { slug: 'dds_aplicar',        label: 'Aplicar DDS' },
  { slug: 'dds_historico',      label: 'Histórico de DDS' },
  { slug: 'diario_bordo',       label: 'Diário de Bordo' },
  { slug: 'relatorio_apontos',  label: 'Relatório de Apontamentos' },
  { slug: 'relatorio_avancado', label: 'Relatórios Avançados' },
  { slug: 'perfil_funcionario', label: 'Perfil do Funcionário' },
  { slug: 'acoes_corretivas',   label: 'Ações Corretivas' },
  { slug: 'admin',              label: 'Controle de Acesso' },
  { slug: 'log_auditoria',      label: 'Log de Auditoria' },
]

const novoNivel = ref({ nome: '', permissoes: [] })
const salvandoNivel = ref(false)

const salvarNivel = async () => {
  if (!novoNivel.value.nome.trim()) return
  salvandoNivel.value = true
  try {
    // Cria o nível
    const { data: nivel, error: errNivel } = await supabase
      .from('niveis_acesso')
      .insert([{ nome: novoNivel.value.nome.trim() }])
      .select()
      .single()
    if (errNivel) throw errNivel

    // Insere as permissões selecionadas
    if (novoNivel.value.permissoes.length > 0) {
      const perms = novoNivel.value.permissoes.map(slug => ({
        nivel_id: nivel.id,
        modulo_slug: slug
      }))
      const { error: errPerms } = await supabase.from('permissoes_acesso').insert(perms)
      if (errPerms) throw errPerms
    }

    toast.fire({ icon: 'success', title: 'Cargo criado com sucesso!' })
    await registrarLog('criou_cargo', 'niveis_acesso', { nome: nivel.nome })
    dadosStore.invalidar('niveis')
    novoNivel.value = { nome: '', permissoes: [] }
    await fetchData()
  } catch (err) {
    toast.fire({ icon: 'error', title: 'Erro ao criar cargo', text: traduzirErro(err) })
  } finally {
    salvandoNivel.value = false
  }
}

const excluirNivel = async (nivel) => {
  const usuariosVinculados = usuarios.value.filter(u => u.nivel_id === nivel.id).length
  if (usuariosVinculados > 0) {
    toast.fire({
      icon: 'warning',
      title: 'Cargo em uso',
      text: `${usuariosVinculados} usuário(s) possuem este cargo. Reassine-os antes de excluir.`
    })
    return
  }
  const { isConfirmed } = await alerta.fire({
    title: 'Excluir Cargo?',
    html: `O cargo <b>${nivel.nome}</b> e todas as suas permissões serão removidos.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  })
  if (!isConfirmed) return
  const { error } = await supabase.from('niveis_acesso').delete().eq('id', nivel.id)
  if (!error) {
    toast.fire({ icon: 'success', title: 'Cargo removido.' })
    await registrarLog('excluiu_cargo', 'niveis_acesso', { id: nivel.id, nome: nivel.nome })
    dadosStore.invalidar('niveis')
    await fetchData()
  } else {
    toast.fire({ icon: 'error', title: 'Erro ao excluir', text: traduzirErro(error) })
  }
}

onMounted(fetchData)
</script>
