<template>
  <div class="login-root">

    <!-- Painel esquerdo: visual -->
    <div class="login-visual">
      <div class="login-grid-overlay"></div>
      <div class="login-noise"></div>

      <!-- Logo e identidade -->
      <div class="login-brand">
        <div class="login-logo-ring">
          <div class="login-logo-inner">
            <i class="fa-solid fa-industry"></i>
          </div>
        </div>
        <h1 class="login-title">SafeTrack</h1>
        <p class="login-subtitle">Plataforma de Segurança Industrial</p>
      </div>

      <!-- Estatísticas decorativas -->
      <div class="login-stats">
        <div class="login-stat">
          <span class="login-stat-value">99.8%</span>
          <span class="login-stat-label">Uptime</span>
        </div>
        <div class="login-stat-divider"></div>
        <div class="login-stat">
          <span class="login-stat-value">ISO</span>
          <span class="login-stat-label">45001</span>
        </div>
        <div class="login-stat-divider"></div>
        <div class="login-stat">
          <span class="login-stat-value">24/7</span>
          <span class="login-stat-label">Monitoramento</span>
        </div>
      </div>

      <!-- Badges de segurança -->
      <div class="login-badges">
        <span class="login-badge"><i class="fa-solid fa-shield-check mr-1.5"></i>Dados Criptografados</span>
        <span class="login-badge"><i class="fa-solid fa-lock mr-1.5"></i>Acesso Controlado</span>
      </div>
    </div>

    <!-- Painel direito: formulário -->
    <div class="login-form-panel">
      <div class="login-form-container">

        <!-- Mobile logo -->
        <div class="login-mobile-logo">
          <div class="login-logo-ring-sm">
            <i class="fa-solid fa-industry text-emerald-400 text-xl"></i>
          </div>
          <span class="font-black text-2xl text-slate-900 tracking-tight">SafeTrack</span>
        </div>

        <!-- Cabeçalho do form -->
        <div class="mb-8">
          <h2 class="login-form-title">
            {{ etapa === 'login' ? 'Acesso ao Sistema' : 'Defina sua Senha' }}
          </h2>
          <p class="login-form-desc">
            {{ etapa === 'login'
              ? 'Digite suas credenciais para continuar'
              : 'Crie uma senha segura para o seu primeiro acesso' }}
          </p>
        </div>

        <!-- ─── ETAPA LOGIN ───────────────────────────────── -->
        <form v-if="etapa === 'login'" @submit.prevent="handleLogin" class="space-y-5">

          <div v-if="errorMessage" class="login-error">
            <i class="fa-solid fa-triangle-exclamation shrink-0"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Usuário -->
          <div class="login-field">
            <label class="login-label">Usuário</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-user login-input-icon"></i>
              <input
                v-model="login"
                type="text"
                autocomplete="username"
                required
                placeholder="jean.felipe"
                :disabled="loading"
                class="login-input"
              />
            </div>
            <p v-if="login" class="login-hint">
              <i class="fa-solid fa-at mr-1 opacity-50"></i>{{ emailComputado }}
            </p>
          </div>

          <!-- Senha -->
          <div class="login-field">
            <label class="login-label">Senha</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-lock login-input-icon"></i>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="••••••••"
                :disabled="loading"
                class="login-input"
              />
              <button type="button" @click="showPassword = !showPassword" class="login-eye">
                <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Esqueceu -->
          <div class="flex justify-end">
            <button type="button" @click="recuperarSenha" class="login-forgot">
              Esqueceu a senha?
            </button>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="login-btn">
            <span class="login-btn-bg"></span>
            <span class="login-btn-content">
              <i v-if="loading" class="fa-solid fa-circle-notch fa-spin"></i>
              <i v-else class="fa-solid fa-right-to-bracket"></i>
              {{ loading ? 'Autenticando...' : 'Entrar no Sistema' }}
            </span>
          </button>

          <p class="text-center text-sm text-slate-400 pt-1">
            Primeiro acesso?
            <router-link to="/cadastro" class="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">
              Solicite seu cadastro
            </router-link>
          </p>
        </form>

        <!-- ─── ETAPA TROCAR SENHA ────────────────────────── -->
        <form v-else-if="etapa === 'trocar_senha'" @submit.prevent="handleTrocarSenha" class="space-y-5">

          <div class="login-first-access-banner">
            <div class="login-first-access-icon">
              <i class="fa-solid fa-key"></i>
            </div>
            <div>
              <p class="font-bold text-sm">Primeiro acesso detectado</p>
              <p class="text-xs opacity-80 mt-0.5">Defina uma senha pessoal para continuar.</p>
            </div>
          </div>

          <div v-if="errorMessage" class="login-error">
            <i class="fa-solid fa-triangle-exclamation shrink-0"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Nova senha -->
          <div class="login-field">
            <label class="login-label">Nova Senha</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-lock login-input-icon"></i>
              <input v-model="novaSenha" :type="showNovaSenha ? 'text' : 'password'"
                required placeholder="Mínimo 6 caracteres" :disabled="loading" class="login-input" />
              <button type="button" @click="showNovaSenha = !showNovaSenha" class="login-eye">
                <i class="fa-solid" :class="showNovaSenha ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <!-- Barra de força -->
            <div class="flex gap-1 mt-2">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="forcaSenha >= i ? forcaCor : 'bg-slate-200'"></div>
            </div>
            <p v-if="novaSenha" class="text-[11px] mt-1 font-semibold" :class="forcaTexto.cor">
              {{ forcaTexto.label }}
            </p>
          </div>

          <!-- Confirmar -->
          <div class="login-field">
            <label class="login-label">Confirmar Senha</label>
            <div class="login-input-wrap">
              <i class="fa-solid fa-lock-open login-input-icon"></i>
              <input v-model="confirmarSenha" :type="showNovaSenha ? 'text' : 'password'"
                required placeholder="Repita a senha" :disabled="loading"
                class="login-input"
                :class="confirmarSenha && novaSenha !== confirmarSenha ? 'border-rose-400 focus:ring-rose-400' : ''" />
            </div>
            <p v-if="confirmarSenha && novaSenha !== confirmarSenha" class="text-xs text-rose-500 mt-1 font-medium">
              <i class="fa-solid fa-xmark mr-1"></i>As senhas não coincidem
            </p>
            <p v-else-if="confirmarSenha && novaSenha === confirmarSenha" class="text-xs text-emerald-600 mt-1 font-medium">
              <i class="fa-solid fa-check mr-1"></i>Senhas coincidem
            </p>
          </div>

          <button type="submit"
            :disabled="loading || novaSenha !== confirmarSenha || novaSenha.length < 6"
            class="login-btn login-btn-green">
            <span class="login-btn-bg-green"></span>
            <span class="login-btn-content">
              <i v-if="loading" class="fa-solid fa-circle-notch fa-spin"></i>
              <i v-else class="fa-solid fa-shield-check"></i>
              {{ loading ? 'Salvando...' : 'Definir Senha e Entrar' }}
            </span>
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { toast, alerta, traduzirErro } from '../lib/alerts'

const DOMINIO = '@safetrack.com.br'
const router       = useRouter()
const login        = ref('')
const password     = ref('')
const loading      = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const etapa        = ref('login')
const novaSenha      = ref('')
const confirmarSenha = ref('')
const showNovaSenha  = ref(false)

const emailComputado = computed(() => {
  const l = login.value.trim().toLowerCase()
  if (!l) return ''
  if (l.includes('@')) return l
  return l + DOMINIO
})

const forcaSenha = computed(() => {
  const s = novaSenha.value
  if (!s) return 0
  let score = 0
  if (s.length >= 6)  score++
  if (s.length >= 10) score++
  if (/[A-Z]/.test(s) || /[0-9]/.test(s)) score++
  if (/[^A-Za-z0-9]/.test(s)) score++
  return score
})
const forcaCor  = computed(() => ['bg-rose-400','bg-rose-400','bg-amber-400','bg-blue-400','bg-emerald-500'][forcaSenha.value])
const forcaTexto = computed(() => {
  const m = [null,
    { label: 'Senha fraca',    cor: 'text-rose-500'   },
    { label: 'Senha razoável', cor: 'text-amber-500'  },
    { label: 'Senha boa',      cor: 'text-blue-500'   },
    { label: 'Senha forte',    cor: 'text-emerald-600'}
  ]
  return novaSenha.value ? m[forcaSenha.value] || m[1] : { label: '', cor: '' }
})

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailComputado.value,
      password: password.value
    })
    if (error) throw error

    const { data: perfil, error: errPerfil } = await supabase
      .from('usuarios').select('id, nome, nivel_id').eq('id', data.user.id).single()

    if (errPerfil || !perfil) {
      await supabase.auth.signOut()
      throw new Error('Usuário não encontrado. Contate o administrador.')
    }
    if (!perfil.nivel_id) {
      await supabase.auth.signOut()
      throw new Error('Seu acesso ainda não foi liberado. Aguarde a aprovação do administrador.')
    }

    if (data.user?.user_metadata?.primeiro_acesso === true) {
      etapa.value = 'trocar_senha'
      return
    }
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = traduzirErro(err)
  } finally {
    loading.value = false
  }
}

const handleTrocarSenha = async () => {
  if (novaSenha.value !== confirmarSenha.value || novaSenha.value.length < 6) return
  loading.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha.value,
      data: { primeiro_acesso: false }
    })
    if (error) throw error
    toast.fire({ icon: 'success', title: 'Senha definida!', text: 'Bem-vindo ao SafeTrack.' })
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err
  } finally {
    loading.value = false
  }
}

const recuperarSenha = async () => {
  const { value: loginRec } = await alerta.fire({
    title: 'Recuperar Senha',
    input: 'text',
    inputLabel: 'Digite seu usuário ou e-mail',
    inputPlaceholder: 'jean.felipe',
    showCancelButton: true,
    confirmButtonText: 'Enviar Link',
    cancelButtonText: 'Cancelar',
    inputValue: login.value || ''
  })
  if (!loginRec) return
  const emailRec = loginRec.includes('@') ? loginRec.trim().toLowerCase() : loginRec.trim().toLowerCase() + DOMINIO
  const { error } = await supabase.auth.resetPasswordForEmail(emailRec, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) toast.fire({ icon: 'error', title: 'Erro', text: traduzirErro(error) })
  else toast.fire({ icon: 'success', title: 'E-mail enviado!', text: `Link enviado para ${emailRec}` })
}
</script>

<style scoped>
/* ── Layout raiz ─────────────────────────────────────────────── */
.login-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', sans-serif;
}

/* ── Painel visual (esquerdo) ────────────────────────────────── */
.login-visual {
  display: none;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem;
  background-color: #0a0f1a;
  overflow: hidden;
}
@media (min-width: 1024px) {
  .login-visual { display: flex; width: 45%; }
}

/* Grade de fundo */
.login-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Ruído sutil */
.login-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* Gradiente de destaque no canto superior */
.login-visual::before {
  content: '';
  position: absolute;
  top: -120px; right: -120px;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.login-visual::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -80px;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
  pointer-events: none;
}

/* Brand */
.login-brand { position: relative; z-index: 1; }
.login-logo-ring {
  width: 80px; height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #064e3b, #065f46);
  border: 1px solid rgba(16,185,129,0.3);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 40px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
}
.login-logo-inner {
  width: 56px; height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #059669, #10b981);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.75rem;
  box-shadow: 0 4px 16px rgba(16,185,129,0.4);
}
.login-title {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: white;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.login-subtitle {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Stats */
.login-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}
.login-stat { text-align: center; }
.login-stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 900;
  color: #10b981;
  letter-spacing: -0.02em;
  line-height: 1;
}
.login-stat-label {
  display: block;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.25rem;
  font-weight: 600;
}
.login-stat-divider {
  width: 1px; height: 40px;
  background: rgba(255,255,255,0.08);
}

/* Badges */
.login-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}
.login-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  letter-spacing: 0.02em;
}

/* ── Painel do formulário (direito) ──────────────────────────── */
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: #ffffff;
}
.login-form-container { width: 100%; max-width: 400px; }

/* Mobile logo */
.login-mobile-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}
.login-logo-ring-sm {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: #0a0f1a;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
}
@media (min-width: 1024px) {
  .login-mobile-logo { display: none; }
}

/* Títulos do form */
.login-form-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.login-form-desc {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-top: 0.375rem;
  font-weight: 500;
}

/* Erro */
.login-error {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  background: #fff1f2;
  border-left: 3px solid #f43f5e;
  color: #be123c;
  font-size: 0.8125rem;
  font-weight: 600;
}

/* Fields */
.login-field { display: flex; flex-direction: column; }
.login-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}
.login-input-wrap { position: relative; }
.login-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.8125rem;
  pointer-events: none;
}
.login-input {
  width: 100%;
  padding: 0.8125rem 2.75rem 0.8125rem 2.625rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.login-input:focus {
  border-color: #10b981;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
}
.login-input:disabled { opacity: 0.6; cursor: not-allowed; }
.login-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s;
}
.login-eye:hover { color: #4b5563; }
.login-hint {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.375rem;
  font-family: monospace;
  padding-left: 2px;
}

/* Esqueceu */
.login-forgot {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #10b981;
  transition: color 0.15s;
}
.login-forgot:hover { color: #059669; }

/* Botão principal */
.login-btn {
  position: relative;
  width: 100%;
  padding: 0.9375rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.9375rem;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
  cursor: pointer;
  letter-spacing: 0.01em;
}
.login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(15,23,42,0.25); }
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.login-btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}
.login-btn-bg-green {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}
.login-btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
}

/* Banner primeiro acesso */
.login-first-access-banner {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 1px solid #c7d2fe;
  color: #3730a3;
}
.login-first-access-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: #6366f1;
  display: flex; align-items: center; justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(99,102,241,0.35);
}
</style>
