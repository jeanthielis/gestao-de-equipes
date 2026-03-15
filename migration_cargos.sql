-- ============================================================
-- SafeTrack — Correção definitiva: Cargos e Permissões
-- Cole tudo isso no SQL Editor do Supabase e clique Run
-- ============================================================

-- PASSO 1: Tabela de cargos
CREATE TABLE IF NOT EXISTS public.niveis_acesso (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- PASSO 2: Tabela de permissões — chave composta (nivel_id, modulo_slug), sem coluna id separada
CREATE TABLE IF NOT EXISTS public.permissoes_acesso (
  nivel_id    uuid NOT NULL REFERENCES public.niveis_acesso(id) ON DELETE CASCADE,
  modulo_slug text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (nivel_id, modulo_slug)
);

CREATE INDEX IF NOT EXISTS idx_permissoes_nivel ON public.permissoes_acesso(nivel_id);

-- PASSO 3: Colunas de vínculo na tabela usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS nivel_id             uuid REFERENCES public.niveis_acesso(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nivel_visibilidade   text DEFAULT 'Equipe',
  ADD COLUMN IF NOT EXISTS unidade_vinculada_id uuid REFERENCES public.unidades(id)  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS setor_vinculado_id   uuid REFERENCES public.setores(id)   ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS equipe_vinculada_id  uuid REFERENCES public.equipes(id)   ON DELETE SET NULL;

-- PASSO 4: Habilita RLS
ALTER TABLE public.niveis_acesso     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_acesso ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Remove todas as policies antigas e recria do zero
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'niveis_acesso'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.niveis_acesso', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'permissoes_acesso'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.permissoes_acesso', pol.policyname);
  END LOOP;
END $$;

-- PASSO 6: Policies abertas para qualquer autenticado
CREATE POLICY "niveis_acesso_all"
  ON public.niveis_acesso FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "permissoes_acesso_all"
  ON public.permissoes_acesso FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- PASSO 7: Cargo SuperAdmin padrão
INSERT INTO public.niveis_acesso (nome)
VALUES ('SuperAdmin')
ON CONFLICT (nome) DO NOTHING;

-- PASSO 8: Verificação
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('niveis_acesso', 'permissoes_acesso')
ORDER BY tablename;
