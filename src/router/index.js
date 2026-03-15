// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  // ── Rotas públicas ──────────────────────────────────────────
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: 'Login' }
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: () => import('../views/Cadastro.vue'),
    meta: { requiresAuth: false, title: 'Cadastro' }
  },

  // ── Área autenticada ─────────────────────────────────────────
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      // Painel
      { path: 'dashboard',       name: 'Dashboard',           component: () => import('../views/Dashboard.vue'),              meta: { title: 'Painel Operacional',        permissao: 'home' } },
      { path: 'tendencias',      name: 'Tendencias',          component: () => import('../views/TendenciasDashboard.vue'),    meta: { title: 'Tendências Operacionais',   permissao: 'tendencias' } },

      // Gestão
      { path: 'funcionarios',    name: 'Funcionarios',        component: () => import('../views/Funcionarios.vue'),           meta: { title: 'Efetivo & Operadores',      permissao: 'funcionarios' } },
      { path: 'unidades',        name: 'Unidades',            component: () => import('../views/Unidades.vue'),               meta: { title: 'Estrutura e Liderança',     permissao: 'unidades' } },
      { path: 'admin',           name: 'Admin',               component: () => import('../views/Admin.vue'),                  meta: { title: 'Configurações de Checklist',permissao: 'checklists' } },

      // DDS
      { path: 'aplicacao-dds',   name: 'AplicacaoDDS',        component: () => import('../views/AplicacaoDDS.vue'),           meta: { title: 'Aplicação de DDS',          permissao: 'dds_aplicar' } },
      { path: 'historico-dds',   name: 'HistoricoDDS',        component: () => import('../views/HistoricoDDS.vue'),           meta: { title: 'Histórico e Auditoria',     permissao: 'dds_historico' } },
      { path: 'biblioteca-dds',  name: 'BibliotecaDDS',       component: () => import('../views/BibliotecaDDS.vue'),          meta: { title: 'Biblioteca de DDS',         permissao: 'dds_temas' } },

      // Apontamentos
      { path: 'acompanhamento',          name: 'Acompanhamento',         component: () => import('../views/AcompanhamentoDiario.vue'),   meta: { title: 'Diário de Bordo',               permissao: 'diario_bordo' } },
      { path: 'relatorio-apontamentos',  name: 'RelatorioApontamentos',  component: () => import('../views/RelatorioApontamentos.vue'),  meta: { title: 'Relatório de Apontamentos',     permissao: 'relatorio_apontos' } },
      { path: 'relatorio-avancado',       name: 'RelatorioAvancado',      component: () => import('../views/RelatorioAvancado.vue'),      meta: { title: 'Relatórios Avançados',          permissao: 'relatorio_avancado' } },
      { path: 'perfil-funcionario',      name: 'PerfilFuncionario',      component: () => import('../views/PerfilFuncionario.vue'),      meta: { title: 'Perfil do Funcionário',         permissao: 'perfil_funcionario' } },
      { path: 'acoes-corretivas',        name: 'AcoesCorretivas',        component: () => import('../views/AcoesCorretivas.vue'),        meta: { title: 'Ações Corretivas',              permissao: 'acoes_corretivas' } },

      // Administração
      { path: 'adminSuper',      name: 'GestaoAcesso',        component: () => import('../views/GestaoAcesso.vue'),           meta: { title: 'Controle de Acesso',        permissao: 'admin' } },
      { path: 'log-auditoria',   name: 'LogAuditoria',        component: () => import('../views/LogAuditoria.vue'),           meta: { title: 'Log de Auditoria',          permissao: 'log_auditoria' } }
    ]
  },

  // ── Fallback ─────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

// ── Guard global ──────────────────────────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    authStore.clearSession()
    if (requiresAuth) return { name: 'Login' }
  }

  if (requiresAuth && !session) return { name: 'Login' }

  if (!requiresAuth && session && (to.name === 'Login' || to.name === 'Cadastro')) {
    return { name: 'Dashboard' }
  }

  if (requiresAuth && session) {
    if (!authStore.profile) {
      await authStore.fetchProfile(session.user)
      
      // Se o perfil continuou nulo após tentar buscar no banco (erro ou cache ruim),
      // a sessão está inválida. Limpa e manda pro Login.
      if (!authStore.profile) {
        await authStore.logout()
        return { name: 'Login' }
      }
    }

    const permissaoNecessaria = to.meta?.permissao
    if (permissaoNecessaria && !authStore.temPermissao(permissaoNecessaria)) {
      // Evita loop infinito: se já está indo para Dashboard, deixa passar
      if (to.name === 'Dashboard') return true
      return { name: 'Dashboard' }
    }
  }

  return true
})

export default router
