-- Habilitar Row Level Security nas tabelas
ALTER TABLE perguntas_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_bloqueados ENABLE ROW LEVEL SECURITY;

-- Políticas para a service_role (backend do bot) - acesso total
CREATE POLICY "Service role full access perguntas" ON perguntas_respostas
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access historico" ON historico
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access configuracoes" ON configuracoes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access bloqueados" ON contatos_bloqueados
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Políticas para usuários anônimos (leitura de perguntas ativas apenas)
CREATE POLICY "Anon read active perguntas" ON perguntas_respostas
  FOR SELECT
  USING (ativo = true);

-- Políticas para usuários autenticados (admin panel)
CREATE POLICY "Authenticated full access perguntas" ON perguntas_respostas
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read historico" ON historico
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access configuracoes" ON configuracoes
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access bloqueados" ON contatos_bloqueados
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
