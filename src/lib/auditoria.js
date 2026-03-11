// src/lib/auditoria.js
// Registra ações do sistema na tabela audit_logs do Supabase
import { supabase } from './supabase'

/**
 * @param {string} acao       - Descrição da ação: 'criou_usuario', 'alterou_permissao', etc.
 * @param {string} entidade   - Tabela/módulo afetado: 'usuarios', 'niveis_acesso', 'dds', etc.
 * @param {object} detalhes   - Dados relevantes (antes/depois, IDs, nomes)
 */
export const registrarLog = async (acao, entidade, detalhes = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('audit_logs').insert([{
      usuario_id: user.id,
      acao,
      entidade,
      detalhes: JSON.stringify(detalhes),
      ip: null // Não disponível no frontend sem backend dedicado
    }])
  } catch (err) {
    // Falha silenciosa — log não deve interromper a operação principal
    console.warn('[Auditoria] Falha ao registrar log:', err?.message)
  }
}
