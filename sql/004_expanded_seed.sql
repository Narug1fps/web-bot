-- Expansão massiva de perguntas para garantir matching em diversas variações
-- Baseado nas respostas existentes

INSERT INTO perguntas_respostas (pergunta, tokens, resposta, categoria) VALUES

-- =================================================================================
-- CATEGORIA: INSTITUCIONAL (Viraweb)
-- =================================================================================
('Quem é a Viraweb?', 
 ARRAY['quem', 'viraweb', 'empresa', 'agencia'], 
 '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 
 'institucional'),

('Fale sobre a empresa', 
 ARRAY['fale', 'sobre', 'empresa', 'historia', 'conhecer'], 
 '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 
 'institucional'),

('O que vocês fazem?', 
 ARRAY['que', 'voce', 'fazem', 'servico', 'trabalho'], 
 '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 
 'institucional'),

('Vocês são uma agência?', 
 ARRAY['agencia', 'marketing', 'publicidade', 'digital'], 
 '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 
 'institucional'),

-- Variações curtas / gírias
('quem sao vcs', ARRAY['quem', 'sao', 'vcs'], '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 'institucional'),
('q empresa eh essa', ARRAY['que', 'empresa', 'essa'], '🚀 A Viraweb é uma empresa de tecnologia especializada em criação de sites, tráfego pago e soluções digitais.💻 Também somos criadores do **GDC – Gestor de Clientes**, um SaaS completo para gerenciar leads, clientes e vendas.🌐 Saiba mais em: https://viraweb.online', 'institucional'),

-- =================================================================================
-- CATEGORIA: GDC (Gestor de Clientes)
-- =================================================================================
('Como funciona o GDC?', 
 ARRAY['como', 'funciona', 'gdc', 'gestor', 'sistema'], 
 '📊 O **GDC – Gestor de Clientes** é um sistema SaaS da Viraweb para organizar, gerenciar seus clientes, agendamentos, profissionais, financeiro e muito mais. 🌐 Acesse: https://gdc.viraweb.online', 
 'institucional'),

('Vocês tem sistema de gestão?', 
 ARRAY['sistema', 'gestao', 'software', 'admin'], 
 '📊 O **GDC – Gestor de Clientes** é um sistema SaaS da Viraweb para organizar, gerenciar seus clientes, agendamentos, profissionais, financeiro e muito mais. 🌐 Acesse: https://gdc.viraweb.online', 
 'institucional'),

('O que é esse gestor de clientes?', 
 ARRAY['que', 'gestor', 'clientes', 'ferramenta'], 
 '📊 O **GDC – Gestor de Clientes** é um sistema SaaS da Viraweb para organizar, gerenciar seus clientes, agendamentos, profissionais, financeiro e muito mais. 🌐 Acesse: https://gdc.viraweb.online', 
 'institucional'),

-- =================================================================================
-- CATEGORIA: CRIAÇÃO DE SITES
-- =================================================================================
('Quero criar um site', 
 ARRAY['quero', 'criar', 'site', 'pagina', 'web'], 
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!', 
 'sites'),

('Quanto custa um site?', 
 ARRAY['quanto', 'custa', 'site', 'valor', 'preco'], 
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!', 
 'sites'),

('Vcs fazem e-commerce?', 
 ARRAY['ecommerce', 'loja', 'virtual', 'venda', 'online'], 
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!', 
 'sites'),

('Preciso de uma landing page', 
 ARRAY['preciso', 'landing', 'page', 'pagina', 'vendas'], 
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!', 
 'sites'),

('Site rapido', 
 ARRAY['site', 'rapido', 'velocidade', 'performance'], 
 '🌐 Sim! Criamos sites modernos, rápidos e focados em conversão.✔️ Tipos de sites:\n• Institucional\n• Landing pages\n• E-commerce\n• Sites personalizados⚡ Design responsivo, SEO otimizado e alta performance.📩 Solicite um orçamento!', 
 'sites'),

-- SEO / Google
('Como aparecer no google?', 
 ARRAY['como', 'aparecer', 'google', 'busca', 'primeira', 'pagina'], 
 '🔎 Sim! Todos os sites da Viraweb já são desenvolvidos com **SEO otimizado**.📈 Isso ajuda seu site a:\n• Aparecer no Google\n• Carregar mais rápido\n• Converter mais visitantes🚀 Mais visibilidade para seu negócio!', 
 'sites'),

('Vocês fazem SEO?', 
 ARRAY['fazem', 'seo', 'otimizacao', 'busca'], 
 '🔎 Sim! Todos os sites da Viraweb já são desenvolvidos com **SEO otimizado**.📈 Isso ajuda seu site a:\n• Aparecer no Google\n• Carregar mais rápido\n• Converter mais visitantes🚀 Mais visibilidade para seu negócio!', 
 'sites'),

-- =================================================================================
-- CATEGORIA: TRÁFEGO PAGO
-- =================================================================================
('Quero anunciar no google', 
 ARRAY['quero', 'anunciar', 'google', 'ads', 'patrocinado'], 
 '📢 Sim! Gerenciamos campanhas de tráfego pago focadas em resultado.🎯 Plataformas:\n• Google Ads\n• Instagram Ads\n• Facebook Ads📊 Com otimização contínua e relatórios detalhados para maximizar seu ROI.', 
 'trafego_pago'),

('Vocês trabalham com facebook ads?', 
 ARRAY['facebook', 'ads', 'meta', 'anuncio'], 
 '📢 Sim! Gerenciamos campanhas de tráfego pago focadas em resultado.🎯 Plataformas:\n• Google Ads\n• Instagram Ads\n• Facebook Ads📊 Com otimização contínua e relatórios detalhados para maximizar seu ROI.', 
 'trafego_pago'),

('Como vender mais na internet?', 
 ARRAY['vender', 'mais', 'internet', 'aumentar', 'vendas'], 
 '📢 Sim! Gerenciamos campanhas de tráfego pago focadas em resultado.🎯 Plataformas:\n• Google Ads\n• Instagram Ads\n• Facebook Ads📊 Com otimização contínua e relatórios detalhados para maximizar seu ROI.', 
 'trafego_pago'),

('Gestão de trafego', 
 ARRAY['gestao', 'trafego', 'gestor', 'campanha'], 
 '📢 Sim! Gerenciamos campanhas de tráfego pago focadas em resultado.🎯 Plataformas:\n• Google Ads\n• Instagram Ads\n• Facebook Ads📊 Com otimização contínua e relatórios detalhados para maximizar seu ROI.', 
 'trafego_pago'),

('Quanto investir em anuncios?', 
 ARRAY['quanto', 'investir', 'anuncio', 'verba', 'dinheiro'], 
 '💰 O investimento em anúncios varia conforme seu objetivo.📌 Trabalhamos com:\n• Orçamento personalizado\n• Estratégia sob medida\n• Controle total de gastos📞 Fale conosco para uma análise gratuita!', 
 'trafego_pago'),

('Qual o valor minimo para anunciar?', 
 ARRAY['valor', 'minimo', 'anunciar', 'custo'], 
 '💰 O investimento em anúncios varia conforme seu objetivo.📌 Trabalhamos com:\n• Orçamento personalizado\n• Estratégia sob medida\n• Controle total de gastos📞 Fale conosco para uma análise gratuita!', 
 'trafego_pago'),

-- =================================================================================
-- CATEGORIA: CONTACTO
-- =================================================================================
('Qual o whatsapp de vcs?', 
 ARRAY['qual', 'whatsapp', 'zap', 'numero', 'contato'], 
 '📝 Para solicitar um orçamento:1️⃣ Acesse: https://viraweb.online\n2️⃣ Envie sua necessidade por aqui\n3️⃣ Nosso time entrará em contato🚀 Vamos crescer seu negócio juntos!', 
 'contato'),

('Quero falar com um atendente', 
 ARRAY['falar', 'atendente', 'humano', 'pessoa'], 
 '📝 Para solicitar um orçamento:1️⃣ Acesse: https://viraweb.online\n2️⃣ Envie sua necessidade por aqui\n3️⃣ Nosso time entrará em contato🚀 Vamos crescer seu negócio juntos!', 
 'contato'),

('Vocês tem escritorio fisico?', 
 ARRAY['escritorio', 'fisico', 'local', 'onde', 'fica'], 
 '💻 Sim! Atendemos clientes de todo o Brasil de forma 100% online.📞 Reuniões por videochamada\n📊 Suporte digital\n📈 Projetos escaláveis🌍 Onde você estiver, a Viraweb atende!', 
 'contato'),

('Atendem em qual cidade?', 
 ARRAY['atendem', 'qual', 'cidade', 'regiao', 'brasil'], 
 '💻 Sim! Atendemos clientes de todo o Brasil de forma 100% online.📞 Reuniões por videochamada\n📊 Suporte digital\n📈 Projetos escaláveis🌍 Onde você estiver, a Viraweb atende!', 
 'contato'),

-- =================================================================================
-- CATEGORIA: GOOGLE MEU NEGOCIO
-- =================================================================================
('Minha empresa no mapa', 
 ARRAY['minha', 'empresa', 'mapa', 'gps', 'localizacao'], 
 '📍 Sim! Fazemos a gestão completa do **Google Meu Negócio**.📈 Benefícios:\n• Mais visibilidade local\n• Mais chamadas e mensagens\n• Melhor posição no Google Maps⭐ Inclui otimização, posts e gestão de avaliações.', 
 'google_meu_negocio'),

('Avaliações no google', 
 ARRAY['avaliacao', 'review', 'estrelas', 'comentario'], 
 '📍 Sim! Fazemos a gestão completa do **Google Meu Negócio**.📈 Benefícios:\n• Mais visibilidade local\n• Mais chamadas e mensagens\n• Melhor posição no Google Maps⭐ Inclui otimização, posts e gestão de avaliações.', 
 'google_meu_negocio'),

-- =================================================================================
-- CATEGORIA: DESIGN
-- =================================================================================
('Preciso de um logo', 
 ARRAY['preciso', 'logo', 'marca', 'logotipo'], 
 '🎨 Sim! Criamos identidade visual profissional para sua marca.✨ Serviços:\n• Logotipo\n• Paleta de cores\n• Material gráfico\n• Design para redes sociais🚀 Sua marca com visual forte e profissional!', 
 'design'),

('Artes para instagram', 
 ARRAY['artes', 'instagram', 'post', 'social', 'media'], 
 '🎨 Sim! Criamos identidade visual profissional para sua marca.✨ Serviços:\n• Logotipo\n• Paleta de cores\n• Material gráfico\n• Design para redes sociais🚀 Sua marca com visual forte e profissional!', 
 'design')

ON CONFLICT DO NOTHING;
