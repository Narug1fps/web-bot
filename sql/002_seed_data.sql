-- Configurações iniciais do bot - Viraweb
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('limiar_confianca', '0.3', 'Nível mínimo de confiança (0 a 1) para enviar uma resposta automática'),
  ('mensagem_padrao', 'Olá! 👋 Sou o assistente virtual da Viraweb. Não encontrei uma resposta exata para sua pergunta, mas um especialista entrará em contato em breve. 🚀', 'Mensagem enviada quando não há match suficiente'),
  ('mensagem_boas_vindas', 'Olá! 👋 Seja bem-vindo(a) à Viraweb. Como podemos ajudar seu negócio a crescer hoje?', 'Mensagem de boas-vindas'),
  ('horario_atendimento_inicio', '08:00', 'Horário de início do atendimento'),
  ('horario_atendimento_fim', '18:00', 'Horário de fim do atendimento'),
  ('mensagem_fora_horario', '⏰ Nosso atendimento funciona de segunda a sexta, das 8h às 18h. Deixe sua mensagem que retornaremos o mais rápido possível!', 'Mensagem fora do horário')
ON CONFLICT (chave) DO NOTHING;
-- Perguntas e respostas comuns para nutricionista
INSERT INTO perguntas_respostas (pergunta, tokens, resposta, categoria) VALUES

-- Categoria: Institucional
('O que é a Viraweb?',
 ARRAY['viraweb', 'empresa', 'sobre', 'quem', 'servico'],
 '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online',
 'institucional'),

('O que é o GDC Gestor de Clientes?',
 ARRAY['gdc', 'gestor', 'clientes', 'sistema'],
 '📊 O **GDC – Gestor de Clientes** é um sistema SaaS da Viraweb para organizar, gerenciar seus clientes, agendamentos, profissionais, financeiro e muito mais. 🌐 Acesse: https://gdc.viraweb.online',
 'institucional'),

-- Categoria: Criação de Sites
('Vocês criam sites?',
 ARRAY['site', 'criacao', 'criar', 'website', 'pagina'],
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!',
 'sites'),

('Meu site aparece no Google?',
 ARRAY['google', 'seo', 'busca', 'aparecer', 'posicao'],
 '🔎 Sim! Todos os sites da Viraweb já são desenvolvidos com **SEO otimizado**.📈 Isso ajuda seu site a:\n• Aparecer no Google\n• Carregar mais rápido\n• Converter mais visitantes🚀 Mais visibilidade para seu negócio!',
 'sites'),

-- Categoria: Tráfego Pago
('Vocês fazem tráfego pago?',
 ARRAY['trafego', 'ads', 'anuncio', 'google', 'facebook', 'instagram'],
 '📢 Sim! Gerenciamos campanhas de tráfego pago focadas em resultado.🎯 Plataformas:\n• Google Ads\n• Instagram Ads\n• Facebook Ads📊 Com otimização contínua e relatórios detalhados para maximizar seu ROI.',
 'trafego_pago'),

('Quanto custa anunciar?',
 ARRAY['valor', 'preco', 'anuncio', 'investimento', 'ads'],
 '💰 O investimento em anúncios varia conforme seu objetivo.📌 Trabalhamos com:\n• Orçamento personalizado\n• Estratégia sob medida\n• Controle total de gastos📞 Fale conosco para uma análise gratuita!',
 'trafego_pago'),

-- Categoria: Design Profissional
('Vocês fazem identidade visual?',
 ARRAY['design', 'logo', 'identidade', 'branding', 'visual'],
 '🎨 Sim! Criamos identidade visual profissional para sua marca.✨ Serviços:\n• Logotipo\n• Paleta de cores\n• Material gráfico\n• Design para redes sociais🚀 Sua marca com visual forte e profissional!',
 'design'),

-- Categoria: Google Meu Negócio
('Vocês cuidam do Google Meu Negócio?',
 ARRAY['google', 'meu', 'negocio', 'maps', 'local'],
 '📍 Sim! Fazemos a gestão completa do **Google Meu Negócio**.📈 Benefícios:\n• Mais visibilidade local\n• Mais chamadas e mensagens\n• Melhor posição no Google Maps⭐ Inclui otimização, posts e gestão de avaliações.',
 'google_meu_negocio'),

-- Categoria: Contato / Orçamento
('Como solicitar um orçamento?',
 ARRAY['orcamento', 'contato', 'preco', 'contratar'],
 '📝 Para solicitar um orçamento:1️⃣ Acesse: https://viraweb.online\n2️⃣ Envie sua necessidade por aqui\n3️⃣ Nosso time entrará em contato🚀 Vamos crescer seu negócio juntos!',
 'contato'),

('Vocês atendem online?',
 ARRAY['online', 'remoto', 'distancia', 'internet'],
 '💻 Sim! Atendemos clientes de todo o Brasil de forma 100% online.📞 Reuniões por videochamada\n📊 Suporte digital\n📈 Projetos escaláveis🌍 Onde você estiver, a Viraweb atende!',
 'contato')

ON CONFLICT DO NOTHING;
