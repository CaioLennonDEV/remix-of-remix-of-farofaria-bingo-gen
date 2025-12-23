-- Tabela de participantes do bingo
CREATE TABLE public.participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE CHECK (numero >= 1 AND numero <= 75),
  nome TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;

-- Políticas - todos podem ler
CREATE POLICY "Participantes são públicos para leitura"
  ON public.participantes FOR SELECT
  USING (true);

-- Todos podem inserir/atualizar/deletar (app interno sem auth)
CREATE POLICY "Qualquer um pode inserir participantes"
  ON public.participantes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar participantes"
  ON public.participantes FOR UPDATE
  USING (true);

CREATE POLICY "Qualquer um pode deletar participantes"
  ON public.participantes FOR DELETE
  USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participantes_updated_at
  BEFORE UPDATE ON public.participantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE participantes;

-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatares', 'avatares', true);

-- Políticas de storage
CREATE POLICY "Avatares são públicos para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares');

CREATE POLICY "Qualquer um pode fazer upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatares');

CREATE POLICY "Qualquer um pode atualizar avatares"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatares');

CREATE POLICY "Qualquer um pode deletar avatares"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatares');