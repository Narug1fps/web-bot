-- Tabela de perguntas e respostas cadastradas
CREATE TABLE IF NOT EXISTS perguntas_respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pergunta TEXT NOT NULL,
  tokens TEXT[] NOT NULL,
  resposta TEXT NOT NULL,
  categoria TEXT DEFAULT 'geral',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de conversas
CREATE TABLE IF NOT EXISTS historico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_telefone TEXT NOT NULL,
  nome_contato TEXT,
  mensagem_recebida TEXT NOT NULL,
  resposta_enviada TEXT NOT NULL,
  confianca DECIMAL(5, 4),
  pergunta_id UUID REFERENCES perguntas_respostas(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do bot
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descricao TEXT,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contatos bloqueados
CREATE TABLE IF NOT EXISTS contatos_bloqueados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_telefone TEXT UNIQUE NOT NULL,
  motivo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_perguntas_categoria ON perguntas_respostas(categoria);
CREATE INDEX IF NOT EXISTS idx_perguntas_ativo ON perguntas_respostas(ativo);
CREATE INDEX IF NOT EXISTS idx_historico_numero ON historico(numero_telefone);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico(criado_em);
CREATE INDEX IF NOT EXISTS idx_perguntas_tokens ON perguntas_respostas USING GIN(tokens);

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_perguntas_atualizado
  BEFORE UPDATE ON perguntas_respostas
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_configuracoes_atualizado
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_atualizado_em();
