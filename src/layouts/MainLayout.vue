<template>
  <div class="flex h-screen bg-slate-100/50 font-sans text-slate-800 overflow-hidden relative">

    <!-- Componentes globais -->
    <BuscaGlobal />
    <PainelNotificacoes :aberto="notifAberto" @fechar="notifAberto = false" />

    <!-- Overlay mobile -->
    <transition name="fade">
      <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" />
    </transition>

    <!-- Sidebar -->
    <aside :class="[
      'w-[280px] flex flex-col bg-slate-900 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden z-50 transition-transform duration-300 ease-out',
      'fixed inset-y-4 left-0',
      isMobileMenuOpen ? 'translate-x-4' : '-translate-x-[120%]',
      'md:relative md:inset-auto md:translate-x-0 md:m-4 md:mr-0 md:flex'
    ]">
      <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <!-- Logo -->
      <div class="h-24 flex items-center justify-between px-8">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mr-3 border border-emerald-400/50">
            <i class="fa-solid fa-industry text-lg"></i>
          </div>
          <div>
            <h1 class="font-bold text-xl tracking-tight text-white">SafeTrack</h1>
            <p class="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mt-0.5">Operação Integrada</p>
          </div>
        </div>
        <button @click="isMobileMenuOpen = false" class="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-full">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Nav -->
      <nav @click="isMobileMenuOpen = false" class="flex-1 overflow-y-auto py-4 px-4 space-y-1">
        <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">Menu Principal</p>

        <router-link v-if="authStore.temPermissao('home')" to="/dashboard"
          class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
          active-class="bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
          <i class="fa-solid fa-border-all w-7 text-lg group-hover:scale-110 transition-transform"></i>
          <span class="text-sm">Painel Operacional</span>
        </router-link>

        <div v-if="mostrarMenuGestao">
          <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">Gestão & Setup</p>

          <router-link v-if="authStore.temPermissao('checklists')" to="/admin"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            <i class="fa-solid fa-sliders w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Configurações</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('unidades')" to="/unidades"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            <i class="fa-solid fa-users-gear w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Estrutura e Liderança</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('funcionarios')" to="/funcionarios"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            <i class="fa-solid fa-address-card w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Efetivo & Operadores</span>
          </router-link>

          <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">DDS</p>

          <router-link v-if="authStore.temPermissao('dds_temas')" to="/biblioteca-dds"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            <i class="fa-solid fa-book-medical w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Biblioteca de DDS</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('dds_aplicar')" to="/aplicacao-dds"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
            <i class="fa-solid fa-bullhorn w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Aplicar DDS</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('dds_historico')" to="/historico-dds"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            <i class="fa-solid fa-clock-rotate-left w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Histórico e Auditoria</span>
          </router-link>

          <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">Apontamentos</p>

          <router-link v-if="authStore.temPermissao('diario_bordo')" to="/acompanhamento"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
            <i class="fa-solid fa-clipboard-user w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Diário de Bordo</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('relatorio_apontos')" to="/relatorio-apontamentos"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
            <i class="fa-solid fa-chart-gantt w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Relatório de Apontamentos</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('relatorio_avancado')" to="/relatorio-avancado"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-violet-500/10 text-violet-400 font-semibold border border-violet-500/20">
            <i class="fa-solid fa-chart-column w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Relatórios Avançados</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('perfil_funcionario')" to="/perfil-funcionario"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
            <i class="fa-solid fa-id-card w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Perfil do Funcionário</span>
          </router-link>

          <router-link v-if="authStore.temPermissao('acoes_corretivas')" to="/acoes-corretivas"
            class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
            active-class="bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
            <i class="fa-solid fa-wrench w-7 text-lg group-hover:scale-110 transition-transform"></i>
            <span class="text-sm">Ações Corretivas</span>
          </router-link>

          <template v-if="authStore.temPermissao('admin')">
            <p class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">Administração</p>
            <router-link to="/adminSuper"
              class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
              active-class="bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20">
              <i class="fa-solid fa-user-shield w-7 text-lg group-hover:scale-110 transition-transform"></i>
              <span class="text-sm">Controle de Acesso</span>
            </router-link>
            <router-link to="/log-auditoria"
              class="flex items-center px-4 py-3 text-slate-300 rounded-2xl hover:bg-white/10 hover:text-white transition-all group"
              active-class="bg-slate-500/20 text-slate-300 font-semibold border border-slate-500/20">
              <i class="fa-solid fa-scroll w-7 text-lg group-hover:scale-110 transition-transform"></i>
              <span class="text-sm">Log de Auditoria</span>
            </router-link>
          </template>
        </div>
      </nav>

      <!-- Rodapé do sidebar -->
      <div class="p-4 m-4 mt-0 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between backdrop-blur-md">
        <div class="flex items-center overflow-hidden">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            {{ authStore.profile?.nome?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="ml-3 truncate">
            <p class="text-sm font-bold text-slate-200 truncate">{{ primeiroNome }}</p>
            <p class="text-[10px] text-slate-400 uppercase tracking-wider truncate">{{ authStore.profile?.cargoNome || 'Sem Cargo' }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-rose-400 transition-all" title="Sair">
          <i class="fa-solid fa-power-off text-sm"></i>
        </button>
      </div>
    </aside>

    <!-- Conteúdo principal -->
    <main class="flex-1 flex flex-col h-screen relative overflow-hidden">

      <!-- Header -->
      <header class="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 z-10 sticky top-0 shrink-0">

        <!-- Mobile logo -->
        <div class="md:hidden flex items-center gap-2">
          <div class="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <i class="fa-solid fa-industry text-xs"></i>
          </div>
          <h1 class="font-bold text-slate-800">SafeTrack</h1>
        </div>

        <!-- Breadcrumb desktop -->
        <div class="hidden md:flex items-center text-sm font-medium text-slate-500">
          <i class="fa-solid fa-house mr-2 text-slate-400"></i>
          <span>Início</span>
          <i class="fa-solid fa-chevron-right mx-2 text-[10px] text-slate-300"></i>
          <span class="text-slate-800 font-bold">{{ tituloRota }}</span>
        </div>

        <!-- Ações do header -->
        <div class="flex items-center gap-1 sm:gap-2">

          <!-- Busca global -->
          <button
            @click="buscaStore.abrir()"
            class="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm transition-colors border border-slate-200">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
            <span class="text-xs">Buscar</span>
            <kbd class="text-[9px] bg-white border border-slate-200 rounded px-1 py-0.5 font-bold">⌘K</kbd>
          </button>

          <button @click="buscaStore.abrir()" class="sm:hidden w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-magnifying-glass text-xs"></i>
          </button>

          <!-- Notificações -->
          <button
            @click="notifAberto = !notifAberto"
            class="relative w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all flex items-center justify-center">
            <i class="fa-regular fa-bell text-sm"></i>
            <span v-if="notifStore.totalNaoLidas > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
              {{ notifStore.totalNaoLidas > 9 ? '9+' : notifStore.totalNaoLidas }}
            </span>
          </button>

          <!-- Hambúrguer mobile -->
          <button @click="isMobileMenuOpen = true" class="md:hidden w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-bars text-sm"></i>
          </button>
        </div>
      </header>

      <!-- Conteúdo das páginas -->
      <div class="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 relative">
        <div class="max-w-7xl mx-auto pb-20 md:pb-0">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificacoesStore } from '../stores/notificacoes'
import { useBuscaStore } from '../stores/busca'
import { useRouter, useRoute } from 'vue-router'
import PainelNotificacoes from '../components/PainelNotificacoes.vue'
import BuscaGlobal from '../components/BuscaGlobal.vue'

const authStore = useAuthStore()
const notifStore = useNotificacoesStore()
const buscaStore = useBuscaStore()
const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)
const notifAberto = ref(false)

const primeiroNome = computed(() => authStore.profile?.nome?.split(' ')[0] || 'Usuário')
const tituloRota = computed(() => route.meta?.title || 'Workspace')

const mostrarMenuGestao = computed(() => {
  if (authStore.profile?.cargoNome === 'SuperAdmin') return true
  const slugs = ['admin', 'funcionarios', 'unidades', 'checklists', 'dds_temas', 'dds_aplicar', 'dds_historico', 'diario_bordo', 'relatorio_apontos', 'relatorio_avancado', 'perfil_funcionario', 'acoes_corretivas', 'tendencias', 'log_auditoria']
  return slugs.some((p) => authStore.temPermissao(p))
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

// Verifica alertas automáticos ao montar o layout (com intervalo de 10 min)
let alertasInterval = null
onMounted(() => {
  notifStore.verificarAlertas()
  alertasInterval = setInterval(() => notifStore.verificarAlertas(), 10 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(alertasInterval)
})
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.page-enter-active, .page-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
