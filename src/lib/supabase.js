// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SafeTrack] Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram definidas. ' +
    'Verifique o arquivo .env na raiz do projeto.'
  )
}

// Cliente principal
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente auxiliar para o Super Admin criar contas sem deslogar a si mesmo
export const supabaseCadastro = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'safetrack-cadastro-token'
  }
})
