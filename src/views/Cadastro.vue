<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
    
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="flex justify-center mb-4">
        <div class="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/30">
          S
        </div>
      </div>
      <h2 class="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">SafeTrack</h2>
      <p class="mt-2 text-center text-sm text-slate-500 font-medium">Crie sua conta para acessar a operação.</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
        <form class="space-y-6" @submit.prevent="registrarUsuario">
          
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nome Completo</label>
            <input v-model="form.nome" type="text" required class="block w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" placeholder="Ex: João da Silva">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Corporativo</label>
            <input v-model="form.email" type="email" required class="block w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" placeholder="joao@empresa.com.br">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Senha (Mín. 6 caracteres)</label>
            <input v-model="form.senha" type="password" required class="block w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" placeholder="••••••••">
          </div>

          <button type="submit" :disabled="loading" class="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50">
            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-2"></i>
            {{ loading ? 'Criando conta...' : 'Solicitar Acesso' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-500">
            Já tem uma conta? 
            <router-link to="/login" class="font-bold text-indigo-600 hover:text-indigo-500">Faça login aqui</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { toast, alerta, traduzirErro } from '../lib/alerts'

const router = useRouter()
const loading = ref(false)

const form = ref({
  nome: '',
  email: '',
  senha: ''
})

const registrarUsuario = async () => {
  loading.value = true
  
  try {
    // 1. Cria a conta no sistema de Autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.senha
    })

    if (authError) throw authError

    // 2. Salva o NOME na nossa tabela pública de usuários (sem nível definido ainda)
    if (authData.user) {
      const { error: dbError } = await supabase.from('usuarios').insert([{
        id: authData.user.id,
        nome: form.value.nome,
        email: form.value.email
      }])
      
      if (dbError) throw dbError
    }

    // 3. Sucesso! Mostra um alerta amigável explicando o fluxo
    await alerta.fire({
      icon: 'success',
      title: 'Conta criada com sucesso!',
      text: 'Seu usuário foi registrado. Por favor, aguarde um administrador liberar o seu nível de acesso.',
      confirmButtonText: 'Ir para Login'
    })

    router.push('/login')

  } catch (error) {
    toast.fire({ icon: 'error', title: 'Erro ao criar conta', text: traduzirErro(error) })
  } finally {
    loading.value = false
  }
}
</script>