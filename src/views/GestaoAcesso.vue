<template>
  <div class="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20">

    <!-- Cabeçalho -->
    <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900">Controle de Acesso</h2>
          <p class="text-slate-500 text-sm">Gerencie usuários e níveis de permissão do sistema.</p>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button @click="abaAtiva = 'usuarios'"
            :class="abaAtiva === 'usuarios' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            <i class="fa-solid fa-users mr-1.5"></i>Usuários
          </button>
          <button @click="abaAtiva = 'niveis'"
            :class="abaAtiva === 'niveis' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            <i class="fa-solid fa-shield-halved mr-1.5"></i>Cargos
          </button>
        </div>
      </div>
    </div>

    <!-- ─── ABA: USUÁRIOS ─────────────────────────────────────── -->
    <div v-if="abaAtiva === 'usuarios'" class="space-y-4">

      <!-- Botão cadastrar -->
      <div class="flex justify-end">
        <button @click="abrirModalCadastro"
          class="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2">
          <i class="fa-solid fa-user-plus"></i>
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      <!-- Modal de cadastro inline -->
      <div v-if="modalAberto" class="bg-white rounded-3xl border border-indigo-200 shadow-lg p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-black text-slate-800 text-lg">Novo Usuário</h3>
          <button @click="fecharModal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Nome completo -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nome Completo</label>
            <input
              v-model="form.nome"
              @input="gerarLoginAutomatico"
              type="text"
              placeholder="Ex: Jean Thielis Braga Felipe"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <!-- Login gerado automaticamente -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Login Gerado
              <span class="ml-2 text-indigo-500 normal-case font-semibold">← automático</span>
            </label>
            <div class="relative">
              <input
                v-model="form.loginGerado"
                type="text"
                placeholder="Gerado pelo nome..."
                class="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                :class="form.loginGerado ? 'border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-400'"
              />
              <i v-if="form.loginGerado" class="fa-solid fa-wand-magic-sparkles absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 text-xs"></i>
            </div>
            <p class="text-[10px] text-slate-400 mt-1 font-mono">
              E-mail: {{ form.loginGerado ? form.loginGerado + dominio : '—' }}
            </p>
          </div>

          <!-- Senha -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Senha Temporária</label>
            <div class="relative">
              <input
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                class="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button @click="mostrarSenha = !mostrarSenha" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <i class="fa-solid text-xs" :class="mostrarSenha ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Unidade -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Unidade</label>
            <select
              v-model="form.unidadeId"
              @change="form.equipeId = ''"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              <option value="">Selecione a unidade...</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
            </select>
          </div>

          <!-- Equipe (filtrada pela unidade) -->
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Equipe</label>
            <select
              v-model="form.equipeId"
              :disabled="!form.unidadeId"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">{{ form.unidadeId ? 'Selecione a equipe...' : 'Primeiro selecione a unidade' }}</option>
              <option v-for="e in equipesDaUnidade" :key="e.id" :value="e.id">{{ e.nome }}</option>
            </select>
          </div>

        </div>

        <!-- Rodapé do modal -->
        <div class="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            @click="salvarNovoUsuario"
            :disabled="salvando || !form.nome || !form.loginGerado || !form.senha"
            class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <i v-if="salvando" class="fa-solid fa-circle-notch fa-spin"></i>
            <i v-else class="fa-solid fa-user-plus"></i>
            {{ salvando ? 'Criando...' : 'Criar Usuário' }}
          </button>
          <button @click="fecharModal"
            class="sm:w-auto px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
        </div>
      </div>

      <!-- Tabela de usuários -->
      <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ usuarios.length }} usuário(s) cadastrado(s)</p>
        </div>

        <!-- Mobile: cards -->
        <div class="sm:hidden divide-y divide-slate-50">
          <div v-if="usuarios.length === 0" class="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</div>
          <div v-for="u in usuarios" :key="u.id" class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                  {{ u.nome?.charAt(0) || 'U' }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ u.nome }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ u.email }}</p>
                </div>
              </div>
              <button @click="excluirUsuario(u)" class="w-8 h-8 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors flex items-center justify-center">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
            <button @click="alterarNivelUsuario(u)"
              class="w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors text-left"
              :class="u.niveis_acesso?.nome ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'">
              <i class="fa-solid mr-1.5" :class="u.niveis_acesso?.nome ? 'fa-shield-halved' : 'fa-lock'"></i>
              {{ u.niveis_acesso?.nome || '⚠️ Aguardando Liberação' }}
              <i class="fa-solid fa-pencil ml-1 opacity-50"></i>
            </button>
          </div>
        </div>

        <!-- Desktop: tabela -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-white text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
              <tr>
                <th class="px-5 py-3">Usuário</th>
                <th class="px-4 py-3">Login / E-mail</th>
                <th class="px-4 py-3">Unidade / Equipe</th>
                <th class="px-4 py-3 text-center">Nível de Acesso</th>
                <th class="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-if="usuarios.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</td>
              </tr>
              <tr v-for="u in usuarios" :key="u.id" class="text-sm hover:bg-slate-50/50 transition-colors">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                      {{ u.nome?.charAt(0) || 'U' }}
                    </div>
                    <span class="font-bold text-slate-700">{{ u.nome }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ u.email }}</td>
                <td class="px-4 py-3 text-slate-500 text-xs">
                  <span v-if="u.equipes?.unidades?.nome" class="font-bold text-slate-700">{{ u.equipes.unidades.nome }}</span>
                  <span v-if="u.equipes?.nome"> / {{ u.equipes.nome }}</span>
                  <span v-else class="text-slate-300">—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button @click="alterarNivelUsuario(u)"
                    class="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-colors border shadow-sm w-full max-w-[160px] truncate"
                    :class="u.niveis_acesso?.nome ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 animate-pulse'">
                    <i class="fa-solid mr-1" :class="u.niveis_acesso?.nome ? 'fa-shield-halved' : 'fa-lock'"></i>
                    {{ u.niveis_acesso?.nome || '⚠️ Aguardando' }}
                  </button>
                </td>
                <td class="px-4 py-3 text-right">
                  <button @click="excluirUsuario(u)" class="w-8 h-8 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors" title="Revogar Acesso">
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ─── ABA: NÍVEIS ───────────────────────────────────────── -->
    <div v-if="abaAtiva === 'niveis'" class="grid grid-cols-1 md:grid-cols-3 gap-5">

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 h-fit">
        <h3 class="font-bold text-slate-700 mb-4 text-xs uppercase tracking-widest">Cargos Criados</h3>
        <div class="space-y-2">
          <button v-for="n in niveis" :key="n.id" @click="selecionarNivel(n)"
            :class="nivelSelecionado?.id === n.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'"
            class="w-full text-left p-3 rounded-xl border font-bold text-sm flex justify-between items-center transition-all">
            {{ n.nome }}
            <i class="fa-solid fa-chevron-right text-[10px] opacity-50"></i>
          </button>
          <button @click="criarNovoNivel"
            class="w-full p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 font-bold text-sm hover:bg-slate-50 hover:text-slate-600 transition-all mt-2">
            <i class="fa-solid fa-plus mr-1"></i> Criar Novo Cargo
          </button>
        </div>
      </div>

      <div v-if="nivelSelecionado" class="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-7">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 class="font-black text-2xl text-slate-800">{{ nivelSelecionado.nome }}</h3>
            <p class="text-sm text-slate-500">Marque os módulos que este cargo pode acessar.</p>
          </div>
          <button @click="salvarPermissoes"
            class="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-floppy-disk"></i> Salvar
          </button>
        </div>
        <div class="space-y-5">
          <template v-for="grupo in gruposModulos" :key="grupo.nome">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span class="h-px flex-1 bg-slate-100"></span>
                {{ grupo.nome }}
                <span class="h-px flex-1 bg-slate-100"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label v-for="modulo in grupo.modulos" :key="modulo.nome"
                  class="flex items-center p-3 rounded-xl border cursor-pointer transition-all"
                  :class="permissoesNivel.includes(modulo.slug) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0"
                    :class="permissoesNivel.includes(modulo.slug) ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'">
                    <i :class="modulo.icone + ' text-xs'"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate leading-tight" :class="permissoesNivel.includes(modulo.slug) ? 'text-indigo-900' : 'text-slate-700'">{{ modulo.nome }}</p>
                    <p class="text-[10px] text-slate-400 font-mono">{{ modulo.slug }}</p>
                  </div>
                  <input type="checkbox" :value="modulo.slug" v-model="permissoesNivel" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 ml-2">
                </label>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="md:col-span-2 bg-white rounded-3xl border border-dashed border-slate-200 p-10 flex items-center justify-center text-slate-400 text-sm">
        <div class="text-center">
          <i class="fa-solid fa-shield-halved text-3xl mb-3 block text-slate-200"></i>
          Selecione um cargo para editar as permissões
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase, supabaseCadastro } from '../lib/supabase'
import { toast, alerta, traduzirErro } from '../lib/alerts'
import { registrarLog } from '../lib/auditoria'

// ── Estado ──────────────────────────────────────────────────────
const abaAtiva     = ref('usuarios')
const usuarios     = ref([])
const niveis       = ref([])
const unidades     = ref([])
const equipes      = ref([])
const nivelSelecionado  = ref(null)
const permissoesNivel   = ref([])
const modalAberto  = ref(false)
const salvando     = ref(false)
const mostrarSenha = ref(false)

const dominio = '@safetrack.com.br'

const form = ref({
  nome: '',
  loginGerado: '',
  senha: '',
  unidadeId: '',
  equipeId: ''
})

// Equipes filtradas pela unidade selecionada
const equipesDaUnidade = computed(() =>
  form.value.unidadeId
    ? equipes.value.filter((e) => e.unidade_id === form.value.unidadeId)
    : []
)

// ── Geração automática de login ──────────────────────────────────
// Regra: primeiro nome + último sobrenome → jean.felipe
const gerarLoginAutomatico = () => {
  const nome = form.value.nome.trim()
  if (!nome) { form.value.loginGerado = ''; return }

  // Remove acentos e caracteres especiais
  const normalizar = (str) =>
    str.normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .toLowerCase()
       .replace(/[^a-z0-9]/g, '')

  const partes = nome.split(/\s+/).filter(Boolean)
  if (partes.length === 1) {
    form.value.loginGerado = normalizar(partes[0])
    return
  }

  const primeiro = normalizar(partes[0])
  const ultimo   = normalizar(partes[partes.length - 1])
  form.value.loginGerado = `${primeiro}.${ultimo}`
}

// ── Modal ────────────────────────────────────────────────────────
const abrirModalCadastro = () => {
  form.value = { nome: '', loginGerado: '', senha: '', unidadeId: '', equipeId: '' }
  mostrarSenha.value = false
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
}

// ── Salvar novo usuário ──────────────────────────────────────────
const salvarNovoUsuario = async () => {
  if (!form.value.nome || !form.value.loginGerado || !form.value.senha) return
  if (form.value.senha.length < 6) {
    toast.fire({ icon: 'warning', title: 'Senha muito curta', text: 'A senha precisa ter pelo menos 6 caracteres.' })
    return
  }

  salvando.value = true

  const emailCompleto = `${form.value.loginGerado}${dominio}`

  try {
    const { data, error } = await supabaseCadastro.auth.signUp({
      email: emailCompleto,
      password: form.value.senha,
      options: { data: { nome: form.value.nome, primeiro_acesso: true } }
    })

    if (error) throw error

    // data.user pode ser null se confirmação de e-mail estiver ativa no Supabase.
    // Nesse caso buscamos o usuário pelo e-mail na tabela auth via listagem.
    let userId = data?.user?.id

    if (!userId) {
      // Aguarda 1s para o Supabase processar e tenta buscar pelo e-mail
      await new Promise((r) => setTimeout(r, 1000))
      const { data: existing } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', emailCompleto)
        .maybeSingle()
      userId = existing?.id
    }

    if (userId) {
      // Verifica se já existe na tabela (trigger pode ter inserido)
      const { data: jaExiste } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!jaExiste) {
        // Insere manualmente
        const insertData = {
          id: userId,
          nome: form.value.nome,
          email: emailCompleto
        }
        if (form.value.equipeId) insertData.equipe_id = form.value.equipeId

        const { error: dbError } = await supabase.from('usuarios').insert([insertData])
        if (dbError) {
          console.error('[GestaoAcesso] Erro ao inserir em usuarios:', dbError)
          throw new Error(`Conta criada no Auth, mas falhou ao salvar na tabela: ${dbError.message}`)
        }
      } else if (form.value.equipeId) {
        // Já existe (trigger inseriu), apenas atualiza equipe se selecionada
        await supabase.from('usuarios').update({ equipe_id: form.value.equipeId }).eq('id', userId)
      }
    } else {
      // Não conseguiu obter o ID — provavelmente confirmação de e-mail está ativa
      toast.fire({
        icon: 'warning',
        title: 'Conta criada com pendência',
        html: `Login <b>${form.value.loginGerado}</b> criado, mas requer confirmação de e-mail no Supabase.<br><small>Desative "Confirm email" em Authentication → Settings para uso interno.</small>`
      })
      fecharModal()
      await fetchData()
      return
    }

    toast.fire({
      icon: 'success',
      title: 'Usuário criado!',
      html: `Login: <b class="font-mono">${form.value.loginGerado}</b><br>E-mail: <span class="text-xs font-mono">${emailCompleto}</span>`
    })

    await registrarLog('criou_usuario', 'usuarios', { nome: form.value.nome, email: emailCompleto })
    fecharModal()
    await fetchData()
  } catch (err) {
    console.error('[GestaoAcesso] Erro ao criar usuário:', err)
    toast.fire({ icon: 'error', title: 'Erro ao cadastrar', text: traduzirErro(err) })
  } finally {
    salvando.value = false
  }
}

// ── Carregar dados ───────────────────────────────────────────────
const fetchData = async () => {
  const [
    { data: users, error: errUsers },
    { data: nvs },
    { data: uns },
    { data: eqs }
  ] = await Promise.all([
    supabase.from('usuarios').select('*, niveis_acesso(nome), equipes!usuarios_equipe_id_fkey(nome, unidades(nome))').order('nome'),
    supabase.from('niveis_acesso').select('*').order('nome'),
    supabase.from('unidades').select('id, nome').order('nome'),
    supabase.from('equipes').select('id, nome, unidade_id').order('nome')
  ])

  if (errUsers) {
    console.error('[GestaoAcesso] Erro ao buscar usuários:', errUsers)
    toast.fire({
      icon: 'error',
      title: 'Erro ao listar usuários',
      text: errUsers.code === '42501'
        ? 'Permissão negada (RLS). Verifique as políticas da tabela "usuarios" no Supabase.'
        : traduzirErro(errUsers)
    })
  }

  usuarios.value  = users  || []
  niveis.value    = nvs    || []
  unidades.value  = uns    || []
  equipes.value   = eqs    || []
}

// ── Alterar nível ────────────────────────────────────────────────
const alterarNivelUsuario = async (usuario) => {
  const opcoesDeNivel = { '': 'Remover Acesso (Sem Nível)' }
  niveis.value.forEach((n) => { opcoesDeNivel[n.id] = n.nome })

  const { value: nivelEscolhido, isConfirmed } = await alerta.fire({
    title: 'Definir Nível de Acesso',
    html: `Qual será o cargo de permissão de <b>${usuario.nome}</b>?`,
    input: 'select',
    inputOptions: opcoesDeNivel,
    inputValue: usuario.nivel_id || '',
    showCancelButton: true,
    confirmButtonText: 'Salvar Acesso',
    cancelButtonText: 'Cancelar'
  })

  if (isConfirmed) {
    const idParaSalvar = nivelEscolhido === '' ? null : nivelEscolhido
    const { error } = await supabase.from('usuarios').update({ nivel_id: idParaSalvar }).eq('id', usuario.id)
    if (!error) {
      toast.fire({ icon: 'success', title: 'Acesso atualizado!' })
      await registrarLog('alterou_permissao', 'usuarios', { usuario: usuario.nome, nivel_id: idParaSalvar })
      await fetchData()
    } else {
      console.error('[GestaoAcesso] Erro ao alterar nível:', error)
      const msg = error.code === '42501'
        ? 'Permissão negada (RLS). Execute o SQL de políticas no Supabase.'
        : traduzirErro(error)
      toast.fire({ icon: 'error', title: 'Erro ao alterar nível', text: msg })
    }
  }
}

// ── Excluir usuário ──────────────────────────────────────────────
const excluirUsuario = async (usuario) => {
  const { isConfirmed } = await alerta.fire({
    title: 'Revogar Acesso?',
    html: `Deseja remover <b>${usuario.nome}</b> do sistema?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: '<i class="fa-solid fa-trash mr-2"></i> Remover',
    cancelButtonText: 'Cancelar'
  })

  if (isConfirmed) {
    const { error } = await supabase.from('usuarios').delete().eq('id', usuario.id)
    if (!error) {
      toast.fire({ icon: 'success', title: 'Usuário removido!' })
      await registrarLog('excluiu_usuario', 'usuarios', { nome: usuario.nome })
      await fetchData()
    } else {
      console.error('[GestaoAcesso] Erro ao excluir usuário:', error)
      const msg = error.code === '42501'
        ? 'Permissão negada (RLS). Execute o SQL de políticas no Supabase.'
        : traduzirErro(error)
      toast.fire({ icon: 'error', title: 'Erro ao remover usuário', text: msg })
    }
  }
}

// ── Níveis e permissões ──────────────────────────────────────────
const selecionarNivel = async (nivel) => {
  nivelSelecionado.value = nivel
  const { data: perms } = await supabase.from('permissoes_acesso').select('modulo_slug').eq('nivel_id', nivel.id)
  permissoesNivel.value = perms?.map((p) => p.modulo_slug) || []
}

const salvarPermissoes = async () => {
  if (!nivelSelecionado.value) return
  await supabase.from('permissoes_acesso').delete().eq('nivel_id', nivelSelecionado.value.id)
  const novasPerms = permissoesNivel.value.map((slug) => ({ nivel_id: nivelSelecionado.value.id, modulo_slug: slug }))
  const { error } = await supabase.from('permissoes_acesso').insert(novasPerms)
  if (!error) {
    toast.fire({ icon: 'success', title: `Permissões salvas para ${nivelSelecionado.value.nome}!` })
  } else {
    toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  }
}

const criarNovoNivel = async () => {
  const { value: nome } = await alerta.fire({
    title: 'Criar Novo Cargo',
    input: 'text',
    inputLabel: 'Nome do Cargo (Ex: Gerente de Produção)',
    showCancelButton: true,
    confirmButtonText: 'Criar Cargo',
    cancelButtonText: 'Cancelar'
  })
  if (nome) {
    const { data, error } = await supabase.from('niveis_acesso').insert([{ nome }]).select().single()
    if (data) {
      niveis.value.push(data)
      selecionarNivel(data)
      toast.fire({ icon: 'success', title: 'Cargo criado!' })
    } else {
      toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
    }
  }
}

const modulosSistema = [
  // ── Painel ──────────────────────────────────────────────
  { grupo: 'Painel',        nome: 'Dashboard Operacional',      slug: 'home',              icone: 'fa-solid fa-border-all' },
  { grupo: 'Painel',        nome: 'Tendências Operacionais',    slug: 'tendencias',        icone: 'fa-solid fa-chart-line' },

  // ── DDS ─────────────────────────────────────────────────
  { grupo: 'DDS',           nome: 'Aplicar DDS',                slug: 'dds_aplicar',       icone: 'fa-solid fa-bullhorn' },
  { grupo: 'DDS',           nome: 'Histórico de DDS',           slug: 'dds_historico',     icone: 'fa-solid fa-clock-rotate-left' },
  { grupo: 'DDS',           nome: 'Biblioteca de Temas',        slug: 'dds_temas',         icone: 'fa-solid fa-book-medical' },

  // ── Apontamentos ────────────────────────────────────────
  { grupo: 'Apontamentos',  nome: 'Diário de Bordo',            slug: 'diario_bordo',      icone: 'fa-solid fa-clipboard-user' },
  { grupo: 'Apontamentos',  nome: 'Relatório de Apontamentos',  slug: 'relatorio_apontos', icone: 'fa-solid fa-chart-gantt' },
  { grupo: 'Apontamentos',  nome: 'Perfil do Funcionário',      slug: 'perfil_funcionario',icone: 'fa-solid fa-id-card' },
  { grupo: 'Apontamentos',  nome: 'Ações Corretivas',           slug: 'acoes_corretivas',  icone: 'fa-solid fa-wrench' },

  // ── Gestão ──────────────────────────────────────────────
  { grupo: 'Gestão',        nome: 'Efetivo & Operadores',       slug: 'funcionarios',      icone: 'fa-solid fa-address-card' },
  { grupo: 'Gestão',        nome: 'Estrutura e Liderança',      slug: 'unidades',          icone: 'fa-solid fa-users-gear' },
  { grupo: 'Gestão',        nome: 'Config. de Checklists',      slug: 'checklists',        icone: 'fa-solid fa-list-check' },

  // ── Administração ────────────────────────────────────────
  { grupo: 'Administração', nome: 'Controle de Acesso',         slug: 'admin',             icone: 'fa-solid fa-user-shield' },
  { grupo: 'Administração', nome: 'Log de Auditoria',           slug: 'log_auditoria',     icone: 'fa-solid fa-scroll' },
]

// Agrupa módulos por categoria para exibição
const gruposModulos = computed(() => {
  const mapa = {}
  modulosSistema.forEach((m) => {
    if (!mapa[m.grupo]) mapa[m.grupo] = { nome: m.grupo, modulos: [] }
    mapa[m.grupo].modulos.push(m)
  })
  return Object.values(mapa)
})

onMounted(fetchData)
</script>
