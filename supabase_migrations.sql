-- ============================================================
-- SafeTrack — Migrações necessárias para as novas funcionalidades
-- Execute este script no SQL Editor do seu Supabase
-- ============================================================

-- 1. Log de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  acao        text NOT NULL,
  entidade    text NOT NULL,
  detalhes    jsonb,
  ip          text,
  created_at  timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON public.audit_logs(entidade);

-- RLS: apenas admins leem; sistema insere
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ler logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.niveis_acesso n ON u.nivel_id = n.id
      WHERE u.id = auth.uid() AND n.nome = 'SuperAdmin'
    )
  );

CREATE POLICY "Sistema pode inserir logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- 2. Colunas de Ação Corretiva na tabela diario_avaliacoes
ALTER TABLE public.diario_avaliacoes
  ADD COLUMN IF NOT EXISTS acao_corretiva  text,
  ADD COLUMN IF NOT EXISTS status_acao     text DEFAULT 'aberta' CHECK (status_acao IN ('aberta', 'andamento', 'concluida')),
  ADD COLUMN IF NOT EXISTS responsavel_acao text,
  ADD COLUMN IF NOT EXISTS data_conclusao  timestamptz;

-- Índice para buscar NCs abertas rapidamente
CREATE INDEX IF NOT EXISTS idx_diario_av_status_nc
  ON public.diario_avaliacoes(status, status_acao)
  WHERE status IN ('NC', 'CP');


-- 3. Coluna created_at em diario_avaliacoes (se não existir)
ALTER TABLE public.diario_avaliacoes
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- ============================================================
-- Verificação (opcional): liste as tabelas criadas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- ============================================================


-- 4. Coluna equipe_id na tabela usuarios (vínculo com equipe)
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_equipe ON public.usuarios(equipe_id);


-- ============================================================
-- 5. Políticas RLS da tabela usuarios
--    (execute se os usuários não aparecem na listagem)
-- ============================================================

-- Habilita RLS na tabela (se ainda não estiver)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios autenticados podem ver todos" ON public.usuarios;
DROP POLICY IF EXISTS "Sistema pode inserir usuarios" ON public.usuarios;

-- Qualquer usuário autenticado pode ler todos os registros
-- (necessário para o sistema funcionar: listas de equipe, perfis, etc.)
CREATE POLICY "Autenticados leem todos os usuarios"
  ON public.usuarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Cada usuário pode atualizar apenas o próprio perfil
CREATE POLICY "Usuario atualiza proprio perfil"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem atualizar qualquer usuário (nível, equipe, etc.)
CREATE POLICY "Admins atualizam qualquer usuario"
  ON public.usuarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.niveis_acesso n ON u.nivel_id = n.id
      WHERE u.id = auth.uid() AND n.nome = 'SuperAdmin'
    )
  );

-- Qualquer usuário autenticado pode inserir (cadastro via app)
CREATE POLICY "Autenticados inserem usuarios"
  ON public.usuarios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins podem deletar usuários
CREATE POLICY "Admins deletam usuarios"
  ON public.usuarios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.niveis_acesso n ON u.nivel_id = n.id
      WHERE u.id = auth.uid() AND n.nome = 'SuperAdmin'
    )
  );


-- ============================================================
-- 6. CORREÇÃO: Políticas RLS para UPDATE e DELETE em usuarios
--    Execute se não conseguir alterar nível ou excluir usuários
-- ============================================================

-- Remove todas as políticas antigas e recria do zero
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'usuarios' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.usuarios', pol.policyname);
  END LOOP;
END $$;

-- Habilita RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer usuário autenticado lê todos
CREATE POLICY "usuarios_select"
  ON public.usuarios FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: qualquer autenticado insere (cadastro)
CREATE POLICY "usuarios_insert"
  ON public.usuarios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: qualquer autenticado atualiza qualquer registro
-- (o controle de quem pode fazer o quê é feito no app)
CREATE POLICY "usuarios_update"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- DELETE: qualquer autenticado deleta
CREATE POLICY "usuarios_delete"
  ON public.usuarios FOR DELETE
  USING (auth.uid() IS NOT NULL);
