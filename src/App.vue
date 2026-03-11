<template>
  <div id="safetrack-app-root" class="min-h-screen w-full relative bg-slate-100/50">

    <router-view />

    <!-- Splash de carregamento inicial -->
    <div
      v-if="renderScreen"
      :class="[
        'fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out',
        isAppLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      ]"
    >
      <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 mb-6 border border-emerald-400/50 animate-pulse">
        <i class="fa-solid fa-industry text-4xl"></i>
      </div>

      <div class="w-8 h-8 border-4 border-slate-600 border-t-emerald-400 rounded-full animate-spin mb-4"></div>

      <h1 class="font-black text-2xl text-white tracking-tight mb-1">SafeTrack</h1>
      <p class="text-emerald-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Sincronizando Operação...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth'
import { toast } from './lib/alerts'

const isAppLoading = ref(true)
const renderScreen = ref(true)
const router = useRouter()
const authStore = useAuthStore()

// Ouve mudanças de autenticação em tempo real (sessão expirada, logout em outra aba, etc.)
let authListener = null

onMounted(() => {
  // Remove o splash após o carregamento
  const removeLoading = () => {
    isAppLoading.value = false
    setTimeout(() => { renderScreen.value = false }, 700)
  }

  if (document.readyState === 'complete') {
    setTimeout(removeLoading, 400)
  } else {
    window.addEventListener('load', removeLoading)
  }

  // Trava de segurança
  setTimeout(() => { if (isAppLoading.value) removeLoading() }, 3000)

  // Listener de eventos de autenticação do Supabase
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      authStore.clearSession()
      router.push('/')
    }

    if (event === 'TOKEN_REFRESHED' && session) {
      // Sessão renovada — recarrega perfil silenciosamente se necessário
      if (!authStore.profile) {
        await authStore.fetchProfile(session.user)
      }
    }

    if (event === 'SIGNED_IN' && session && !authStore.profile) {
      await authStore.fetchProfile(session.user)
    }
  })

  authListener = data.subscription
})

onUnmounted(() => {
  authListener?.unsubscribe()
})
</script>
