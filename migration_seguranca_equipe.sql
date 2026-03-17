-- ============================================================
-- SafeTrack — Segurança por Equipe (Row Level Security)
-- Execute este script no SQL Editor do seu Supabase
-- Garante que cada usuário acesse APENAS dados da sua equipe
-- SuperAdmin tem visão global (sem restrições)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- FUNÇÃO AUXILIAR: retorna o equipe_id do usuário logado
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.meu_equipe_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT equipe_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
$$;

-- Função auxiliar: verifica se o usuário logado é SuperAdmin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    JOIN public.niveis_acesso n ON u.nivel_id = n.id
    WHERE u.id = auth.uid() AND n.nome = 'SuperAdmin'
  );
$$;


-- ─────────────────────────────────────────────────────────────
-- 1. TABELA: funcionarios
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'funcionarios' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.funcionarios', pol.policyname); END LOOP;
END $$;

-- SELECT: SuperAdmin vê todos; demais veem só da própria equipe
CREATE POLICY "func_select"
  ON public.funcionarios FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR equipe_id = public.meu_equipe_id()
    )
  );

-- INSERT: SuperAdmin pode qualquer equipe; outros só na própria
CREATE POLICY "func_insert"
  ON public.funcionarios FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR equipe_id = public.meu_equipe_id()
    )
  );

-- UPDATE: mesma regra
CREATE POLICY "func_update"
  ON public.funcionarios FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR equipe_id = public.meu_equipe_id()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR equipe_id = public.meu_equipe_id()
    )
  );

-- DELETE: SuperAdmin ou gestor da equipe
CREATE POLICY "func_delete"
  ON public.funcionarios FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR equipe_id = public.meu_equipe_id()
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 2. TABELA: diario_listas  (listas salvas de equipe do dia)
-- ─────────────────────────────────────────────────────────────

-- Adiciona coluna equipe_id se ainda não existir
ALTER TABLE public.diario_listas
  ADD COLUMN IF NOT EXISTS equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_diario_listas_equipe ON public.diario_listas(equipe_id);

ALTER TABLE public.diario_listas ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'diario_listas' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.diario_listas', pol.policyname); END LOOP;
END $$;

CREATE POLICY "dlistas_select"
  ON public.diario_listas FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      equipe_id IS NULL OR          -- listas legadas sem equipe ficam visíveis
      equipe_id = public.meu_equipe_id()
    )
  );

CREATE POLICY "dlistas_insert"
  ON public.diario_listas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "dlistas_update"
  ON public.diario_listas FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (public.is_super_admin() OR equipe_id = public.meu_equipe_id()));

CREATE POLICY "dlistas_delete"
  ON public.diario_listas FOR DELETE
  USING (auth.uid() IS NOT NULL AND (public.is_super_admin() OR equipe_id = public.meu_equipe_id()));


-- ─────────────────────────────────────────────────────────────
-- 3. TABELA: dds_listas  (listas salvas de DDS)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.dds_listas
  ADD COLUMN IF NOT EXISTS equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_dds_listas_equipe ON public.dds_listas(equipe_id);

ALTER TABLE public.dds_listas ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'dds_listas' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.dds_listas', pol.policyname); END LOOP;
END $$;

CREATE POLICY "ddslistas_select"
  ON public.dds_listas FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      equipe_id IS NULL OR
      equipe_id = public.meu_equipe_id()
    )
  );

CREATE POLICY "ddslistas_insert"
  ON public.dds_listas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ddslistas_update"
  ON public.dds_listas FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (public.is_super_admin() OR equipe_id = public.meu_equipe_id()));

CREATE POLICY "ddslistas_delete"
  ON public.dds_listas FOR DELETE
  USING (auth.uid() IS NOT NULL AND (public.is_super_admin() OR equipe_id = public.meu_equipe_id()));


-- ─────────────────────────────────────────────────────────────
-- 4. TABELA: diario_avaliacoes  (apontamentos diários)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.diario_avaliacoes ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'diario_avaliacoes' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.diario_avaliacoes', pol.policyname); END LOOP;
END $$;

-- Acesso via equipe do funcionário avaliado
CREATE POLICY "daval_select"
  ON public.diario_avaliacoes FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      EXISTS (
        SELECT 1 FROM public.funcionarios f
        WHERE f.id = diario_avaliacoes.funcionario_id
          AND f.equipe_id = public.meu_equipe_id()
      )
    )
  );

CREATE POLICY "daval_insert"
  ON public.diario_avaliacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "daval_update"
  ON public.diario_avaliacoes FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      EXISTS (
        SELECT 1 FROM public.funcionarios f
        WHERE f.id = diario_avaliacoes.funcionario_id
          AND f.equipe_id = public.meu_equipe_id()
      )
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 5. TABELA: dds_assinaturas  (assinaturas de DDS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.dds_assinaturas ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'dds_assinaturas' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.dds_assinaturas', pol.policyname); END LOOP;
END $$;

CREATE POLICY "ddsassin_select"
  ON public.dds_assinaturas FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      EXISTS (
        SELECT 1 FROM public.funcionarios f
        WHERE f.id = dds_assinaturas.funcionario_id
          AND f.equipe_id = public.meu_equipe_id()
      )
    )
  );

CREATE POLICY "ddsassin_insert"
  ON public.dds_assinaturas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────────────────
-- 6. TABELA: usuarios  (reforço: não-admin vê só da própria equipe)
-- ─────────────────────────────────────────────────────────────

-- Remove e recria políticas de SELECT da tabela usuarios
DO $$ DECLARE pol RECORD; BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'usuarios' AND schemaname = 'public'
  LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.usuarios', pol.policyname); END LOOP;
END $$;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select"
  ON public.usuarios FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR
      id = auth.uid() OR                          -- sempre vê o próprio perfil
      equipe_id = public.meu_equipe_id()          -- vê colegas da mesma equipe
    )
  );

CREATE POLICY "usuarios_insert"
  ON public.usuarios FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "usuarios_update"
  ON public.usuarios FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      public.is_super_admin() OR id = auth.uid()
    )
  );

CREATE POLICY "usuarios_delete"
  ON public.usuarios FOR DELETE
  USING (public.is_super_admin());


-- ─────────────────────────────────────────────────────────────
-- 7. Garante que equipe_id em usuarios seja preenchido
--    Executa uma vez para popular registros legados sem equipe_id
-- ─────────────────────────────────────────────────────────────
UPDATE public.usuarios
SET equipe_id = equipe_vinculada_id
WHERE equipe_id IS NULL AND equipe_vinculada_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- 8. Atualiza a função RPC buscar_funcionario_dds para retornar
--    o equipe_id (necessário para validação no frontend)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.buscar_funcionario_dds(p_matricula text)
RETURNS TABLE (
  id         uuid,
  nome       text,
  matricula  text,
  funcao     text,
  equipe_id  uuid
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id, nome, matricula, funcao, equipe_id
  FROM public.funcionarios
  WHERE matricula = p_matricula AND ativo = true
  LIMIT 1;
$$;


-- ─────────────────────────────────────────────────────────────
-- Verificação final
-- ─────────────────────────────────────────────────────────────
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('funcionarios','usuarios','diario_avaliacoes','dds_assinaturas','diario_listas','dds_listas')
-- ORDER BY tablename, cmd;
