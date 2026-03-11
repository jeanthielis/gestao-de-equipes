<template>
  <!-- Overlay -->
  <transition name="fade">
    <div v-if="aberto" @click.self="$emit('fechar')" class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" />
  </transition>

  <!-- Painel deslizante -->
  <transition name="slide-right">
    <div v-if="aberto" class="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-bell text-indigo-500"></i>
          <h3 class="font-black text-slate-800">Notificações</h3>
          <span v-if="store.totalNaoLidas > 0"
            class="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            {{ store.totalNaoLidas }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="store.totalNaoLidas > 0"
            @click="store.marcarTodasLidas()"
            class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            Marcar todas lidas
          </button>
          <button @click="$emit('fechar')" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Lista -->
      <div class="flex-1 overflow-y-auto">
        <!-- Vazio -->
        <div v-if="store.itens.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl text-slate-300">
            <i class="fa-solid fa-bell-slash"></i>
          </div>
          <p class="font-bold text-slate-500">Tudo certo por aqui</p>
          <p class="text-xs text-slate-400 mt-1">Nenhuma notificação no momento.</p>
        </div>

        <!-- Itens -->
        <div v-else class="divide-y divide-slate-50">
          <div
            v-for="n in store.itens"
            :key="n.id"
            class="px-5 py-4 flex gap-3 transition-colors"
            :class="n.lida ? 'bg-white' : 'bg-slate-50'"
          >
            <!-- Ícone por tipo -->
            <div class="shrink-0 mt-0.5">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                :class="{
                  'bg-amber-100 text-amber-600': n.tipo === 'alerta',
                  'bg-indigo-100 text-indigo-600': n.tipo === 'info',
                  'bg-emerald-100 text-emerald-600': n.tipo === 'sucesso',
                  'bg-rose-100 text-rose-600': n.tipo === 'perigo'
                }">
                <i class="fa-solid"
                  :class="{
                    'fa-triangle-exclamation': n.tipo === 'alerta',
                    'fa-circle-info': n.tipo === 'info',
                    'fa-circle-check': n.tipo === 'sucesso',
                    'fa-circle-xmark': n.tipo === 'perigo'
                  }"></i>
              </div>
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="font-bold text-sm text-slate-800 leading-tight">{{ n.titulo }}</p>
                <div class="flex items-center gap-1 shrink-0">
                  <span v-if="!n.lida" class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                  <button @click="store.remover(n.id)" class="text-slate-300 hover:text-rose-400 transition-colors">
                    <i class="fa-solid fa-xmark text-xs"></i>
                  </button>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ n.mensagem }}</p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[10px] text-slate-400">{{ formatarTempo(n.criadaEm) }}</span>
                <router-link
                  v-if="n.link"
                  :to="n.link"
                  @click="store.marcarLida(n.id); $emit('fechar')"
                  class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Ver detalhes →
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="px-6 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
        <p class="text-[10px] text-slate-400 text-center">
          Última verificação: {{ store.ultimaVerificacao ? formatarTempo(store.ultimaVerificacao) : 'nunca' }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useNotificacoesStore } from '../stores/notificacoes'
defineEmits(['fechar'])
defineProps({ aberto: Boolean })

const store = useNotificacoesStore()

const formatarTempo = (iso) => {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return 'agora mesmo'
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`
  return new Date(iso).toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
