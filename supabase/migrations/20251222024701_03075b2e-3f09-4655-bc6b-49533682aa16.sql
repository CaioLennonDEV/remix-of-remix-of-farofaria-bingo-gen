-- Tabela de sessões de bingo
CREATE TABLE public.bingo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL DEFAULT 'Sessão sem nome',
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada')),
  numeros_sorteados INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finalizada_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de ganhadores por sessão
CREATE TABLE public.bingo_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.bingo_sessions(id) ON DELETE CASCADE,
  cartela_id INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  numero_sorteio INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bingo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bingo_winners ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - acesso público para leitura e escrita (sem autenticação)
CREATE POLICY "Sessões são públicas para leitura"
  ON public.bingo_sessions FOR SELECT
  USING (true);

CREATE POLICY "Qualquer um pode criar sessões"
  ON public.bingo_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar sessões"
  ON public.bingo_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Ganhadores são públicos para leitura"
  ON public.bingo_winners FOR SELECT
  USING (true);

CREATE POLICY "Qualquer um pode inserir ganhadores"
  ON public.bingo_winners FOR INSERT
  WITH CHECK (true);

-- Índices
CREATE INDEX idx_bingo_sessions_status ON public.bingo_sessions(status);
CREATE INDEX idx_bingo_winners_session ON public.bingo_winners(session_id);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bingo_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE bingo_winners;