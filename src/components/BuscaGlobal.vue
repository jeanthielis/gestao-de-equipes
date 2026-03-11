<template>
  <transition name="fade">
    <div v-if="store.aberta" class="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" @click.self="store.fechar()">
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        <!-- Campo de busca -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <i class="fa-solid fa-magnifying-glass text-slate-400 text-lg shrink-0"></i>
          <input
            ref="inputRef"
            v-model="termo"
            @input="onInput"
            type="text"
            placeholder="Buscar funcionários, DDS, apontamentos..."
            class="flex-1 text-slate-800 text-base outline-none placeholder-slate-400 bg-transparent"
          />
          <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-lg border border-slate-200">ESC</kbd>
          <button @click="store.fechar()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Resultados -->
        <div class="max-h-[400px] overflow-y-auto">

          <!-- Loading -->
          <div v-if="store.loading" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>
          </div>

          <!-- Vazio inicial -->
          <div v-else-if="!termo" class="p-8 text-center text-slate-400">
            <p class="text-sm">Digite ao menos 2 caracteres para buscar.</p>
          </div>

          <!-- Sem resultados -->
          <div v-else-if="semResultados" class="p-8 text-center text-slate-400">
            <i class="fa-solid fa-face-frown-open text-3xl mb-3 block"></i>
            <p class="font-bold text-slate-600">Nenhum resultado para "{{ termo }}"</p>
          </div>

          <!-- Grupos de resultados -->
          <div v-else class="py-2">

            <!-- Funcionários -->
            <template v-if="store.resultados.funcionarios.length > 0">
              <p class="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Funcionários</p>
              <button
                v-for="f in store.resultados.funcionarios"
                :key="f.id"
                @click="irPara('/funcionarios', f)"
                class="w-full flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 transition-colors text-left">
                <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {{ f.nome?.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-sm text-slate-800">{{ f.nome }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ f.funcao || 'Operador' }} • MAT: {{ f.matricula || 'S/N' }}</p>
                </div>
                <i class="fa-solid fa-arrow-right ml-auto text-slate-300 text-xs"></i>
              </button>
            </template>

            <!-- DDS -->
            <template v-if="store.resultados.dds.length > 0">
              <p class="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Temas de DDS</p>
              <button
                v-for="d in store.resultados.dds"
                :key="d.id"
                @click="irPara('/biblioteca-dds')"
                class="w-full flex items-center gap-3 px-5 py-3 hover:bg-amber-50 transition-colors text-left">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs shrink-0">
                  <i class="fa-solid fa-book-medical"></i>
                </div>
                <p class="font-bold text-sm text-slate-800">{{ d.titulo }}</p>
                <i class="fa-solid fa-arrow-right ml-auto text-slate-300 text-xs"></i>
              </button>
            </template>

            <!-- Apontamentos -->
            <template v-if="store.resultados.apontamentos.length > 0">
              <p class="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Apontamentos</p>
              <button
                v-for="a in store.resultados.apontamentos"
                :key="a.id"
                @click="irPara('/relatorio-apontamentos')"
                class="w-full flex items-center gap-3 px-5 py-3 hover:bg-rose-50 transition-colors text-left">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                  :class="a.status === 'NC' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'">
                  <i class="fa-solid" :class="a.status === 'NC' ? 'fa-xmark' : 'fa-minus'"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-sm text-slate-800 truncate">{{ a.funcionarios?.nome }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ a.itens_checklist?.descricao }} — {{ a.justificativa }}</p>
                </div>
                <i class="fa-solid fa-arrow-right ml-auto text-slate-300 text-xs shrink-0"></i>
              </button>
            </template>

          </div>
        </div>

        <!-- Atalhos de teclado -->
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-[10px] text-slate-400 font-bold">
          <span><kbd class="bg-white border border-slate-200 rounded px-1.5 py-0.5">↵</kbd> Abrir</span>
          <span><kbd class="bg-white border border-slate-200 rounded px-1.5 py-0.5">ESC</kbd> Fechar</span>
          <span class="ml-auto">Ctrl + K para abrir</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuscaStore } from '../stores/busca'

const store = useBuscaStore()
const router = useRouter()
const inputRef = ref(null)
const termo = ref('')
let debounce = null

const semResultados = computed(() =>
  !store.loading &&
  termo.value.length >= 2 &&
  store.resultados.funcionarios.length === 0 &&
  store.resultados.dds.length === 0 &&
  store.resultados.apontamentos.length === 0
)

const onInput = () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => store.buscar(termo.value), 350)
}

const irPara = (rota) => {
  store.fechar()
  termo.value = ''
  router.push(rota)
}

// Foco automático ao abrir
watch(() => store.aberta, async (val) => {
  if (val) {
    termo.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

// Atalho Ctrl+K / Cmd+K
const onKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    store.aberta ? store.fechar() : store.abrir()
  }
  if (e.key === 'Escape' && store.aberta) store.fechar()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
