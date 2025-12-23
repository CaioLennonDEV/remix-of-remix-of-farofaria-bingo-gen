-- Schema para Sistema de Votação da Zueira

-- Tabela de categorias de votação
CREATE TABLE IF NOT EXISTS categorias_votacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  emoji TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de participantes disponíveis para votação
CREATE TABLE IF NOT EXISTS participantes_votacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  avatar TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de votos
CREATE TABLE IF NOT EXISTS votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_votante TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES categorias_votacao(id) ON DELETE CASCADE,
  participante_votado TEXT NOT NULL,
  sessao_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_votos_categoria ON votos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_votos_sessao ON votos(sessao_id);
CREATE INDEX IF NOT EXISTS idx_categorias_ordem ON categorias_votacao(ordem);
CREATE INDEX IF NOT EXISTS idx_categorias_ativa ON categorias_votacao(ativa);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categorias_votacao_updated_at
  BEFORE UPDATE ON categorias_votacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participantes_votacao_updated_at
  BEFORE UPDATE ON participantes_votacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE categorias_votacao;
ALTER PUBLICATION supabase_realtime ADD TABLE participantes_votacao;
ALTER PUBLICATION supabase_realtime ADD TABLE votos;

-- Row Level Security (RLS)
ALTER TABLE categorias_votacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes_votacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias_votacao
-- Todos podem ler categorias ativas
CREATE POLICY "Categorias são públicas para leitura"
  ON categorias_votacao FOR SELECT
  USING (true);

-- Políticas RLS para participantes_votacao
-- Todos podem ler participantes ativos
CREATE POLICY "Participantes são públicos para leitura"
  ON participantes_votacao FOR SELECT
  USING (true);

-- Políticas RLS para votos
-- Todos podem inserir votos
CREATE POLICY "Qualquer um pode inserir votos"
  ON votos FOR INSERT
  WITH CHECK (true);

-- Todos podem ler votos
CREATE POLICY "Votos são públicos para leitura"
  ON votos FOR SELECT
  USING (true);

