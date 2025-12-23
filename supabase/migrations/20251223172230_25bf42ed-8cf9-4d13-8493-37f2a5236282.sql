-- Criar tabela para sessões de bingo
CREATE TABLE public.bingo_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada')),
  numeros_sorteados INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finalizada_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.bingo_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (sem autenticação)
CREATE POLICY "Sessões são públicas para leitura"
  ON public.bingo_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Qualquer um pode criar sessões"
  ON public.bingo_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar sessões"
  ON public.bingo_sessions
  FOR UPDATE
  USING (true);