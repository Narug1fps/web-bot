-- Configurações iniciais do bot
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('limiar_confianca', '0.3', 'Nível mínimo de confiança (0 a 1) para enviar uma resposta automática'),
  ('mensagem_padrao', 'Olá! Sou o assistente virtual do nutricionista. Não encontrei uma resposta específica para sua pergunta. Por favor, aguarde que um atendente entrará em contato em breve. 🙏', 'Mensagem enviada quando não há match suficiente'),
  ('mensagem_boas_vindas', 'Olá! 👋 Bem-vindo ao consultório de nutrição! Como posso ajudar você hoje?', 'Mensagem de boas-vindas para novos contatos'),
  ('horario_atendimento_inicio', '08:00', 'Horário de início do atendimento'),
  ('horario_atendimento_fim', '18:00', 'Horário de fim do atendimento'),
  ('mensagem_fora_horario', '⏰ Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Deixe sua mensagem que responderemos assim que possível!', 'Mensagem enviada fora do horário de atendimento')
ON CONFLICT (chave) DO NOTHING;

-- Perguntas e respostas comuns para nutricionista
INSERT INTO perguntas_respostas (pergunta, tokens, resposta, categoria) VALUES
-- Categoria: Agendamento
('Como faço para agendar uma consulta?', 
 ARRAY['agend', 'consult', 'marc', 'hor', 'atend'],
 '📅 Para agendar sua consulta, você pode:\n\n1️⃣ Ligar para (XX) XXXXX-XXXX\n2️⃣ Acessar nosso site: www.seusite.com.br\n3️⃣ Responder esta mensagem com data e horário de preferência\n\nNosso horário de atendimento é de segunda a sexta, das 8h às 18h.',
 'agendamento'),

('Qual o horário de funcionamento?',
 ARRAY['horar', 'funciona', 'abert', 'fech', 'atend', 'trabalh'],
 '🕐 Nosso horário de atendimento:\n\n📆 Segunda a Sexta: 8h às 18h\n📆 Sábado: 8h às 12h\n📆 Domingo: Fechado\n\nAgende sua consulta!',
 'agendamento'),

('Preciso remarcar minha consulta',
 ARRAY['remarc', 'cancel', 'adi', 'muda', 'alter', 'consult', 'dat'],
 '🔄 Para remarcar ou cancelar sua consulta, por favor informe:\n\n• Seu nome completo\n• Data da consulta atual\n• Nova data desejada (se for remarcação)\n\nOu ligue para (XX) XXXXX-XXXX. Lembramos que cancelamentos devem ser feitos com 24h de antecedência.',
 'agendamento'),

-- Categoria: Preços
('Qual o valor da consulta?',
 ARRAY['valor', 'preco', 'cust', 'quant', 'pag', 'consult'],
 '💰 Valores das consultas:\n\n• Consulta inicial (avaliação completa): R$ XXX,00\n• Retorno (até 30 dias): R$ XX,00\n• Pacote 4 consultas: R$ XXX,00\n\n✅ Aceitamos: PIX, cartão de crédito/débito e dinheiro.\n\nTemos convênios com alguns planos de saúde. Consulte disponibilidade!',
 'precos'),

('Vocês aceitam plano de saúde?',
 ARRAY['plan', 'saud', 'conven', 'aceit', 'cobr'],
 '🏥 Trabalhamos com os seguintes convênios:\n\n• Unimed\n• Bradesco Saúde\n• SulAmérica\n• Amil\n\n📋 Para atendimento por convênio, traga sua carteirinha e documento com foto. Consulte a disponibilidade ligando para (XX) XXXXX-XXXX.',
 'precos'),

-- Categoria: Primeira Consulta
('O que levar na primeira consulta?',
 ARRAY['lev', 'primeir', 'consult', 'traz', 'prec', 'document', 'exam'],
 '📋 Para sua primeira consulta, traga:\n\n✅ Documento de identidade\n✅ Exames de sangue recentes (se tiver)\n✅ Lista de medicamentos em uso\n✅ Histórico de dietas anteriores\n✅ Carteirinha do convênio (se aplicável)\n\n💡 Dica: Anote suas dúvidas para aproveitar melhor a consulta!',
 'primeira_consulta'),

('Quanto tempo dura a consulta?',
 ARRAY['temp', 'dur', 'demor', 'consult', 'minut', 'hor'],
 '⏱️ Duração das consultas:\n\n• Primeira consulta: aproximadamente 1 hora\n• Retorno: aproximadamente 30-40 minutos\n\nA primeira consulta é mais longa pois inclui:\n📊 Avaliação física completa\n📝 Histórico alimentar detalhado\n🎯 Definição de metas e objetivos',
 'primeira_consulta'),

-- Categoria: Dieta e Alimentação
('Vocês fazem dieta para emagrecer?',
 ARRAY['diet', 'emagr', 'perd', 'pes', 'quilos', 'gord'],
 '🥗 Sim! Trabalhamos com reeducação alimentar para emagrecimento saudável.\n\nNosso método:\n✅ Plano alimentar personalizado\n✅ Sem dietas restritivas\n✅ Acompanhamento contínuo\n✅ Metas realistas\n\n📉 Resultados sustentáveis sem efeito sanfona!\n\nAgende sua avaliação!',
 'dieta'),

('Vocês atendem vegetarianos/veganos?',
 ARRAY['vegetarian', 'vegan', 'carn', 'plant', 'anim'],
 '🌱 Sim, atendemos vegetarianos e veganos!\n\nOferecemos:\n✅ Planos alimentares 100% plant-based\n✅ Orientação sobre suplementação\n✅ Garantia de todos os nutrientes essenciais\n✅ Receitas deliciosas e práticas\n\n🥬 Alimentação consciente sem abrir mão da saúde!',
 'dieta'),

('Fazem dieta para ganho de massa muscular?',
 ARRAY['mass', 'muscul', 'ganh', 'hiperc', 'trein', 'muscula', 'acad'],
 '💪 Sim! Temos planos específicos para ganho de massa muscular:\n\n🎯 O que oferecemos:\n• Cálculo preciso de macronutrientes\n• Timing correto de refeições\n• Sugestão de suplementação (se necessário)\n• Alinhamento com seu treino\n\n🏋️ Maximize seus resultados na academia!',
 'dieta'),

-- Categoria: Localização
('Qual o endereço do consultório?',
 ARRAY['enderec', 'localiza', 'ond', 'fica', 'cheg', 'consult', 'clinic'],
 '📍 Nosso endereço:\n\nRua XXXXX, 123 - Sala 45\nBairro XXXXX\nCidade - Estado\nCEP: XXXXX-XXX\n\n🚗 Estacionamento no local\n🚌 Próximo ao ponto de ônibus XXXXX\n\n📱 Envie "MAPA" para receber a localização!',
 'localizacao'),

-- Categoria: Atendimento Online
('Vocês fazem atendimento online?',
 ARRAY['onlin', 'distanc', 'remot', 'video', 'teleconsult', 'internet'],
 '💻 Sim, fazemos atendimento online!\n\n✅ Consultas por videochamada\n✅ Mesma qualidade do presencial\n✅ Plano alimentar enviado por email\n✅ Suporte via WhatsApp\n\n🌐 Atendemos pacientes de todo o Brasil!\n\nAgende sua teleconsulta!',
 'online'),

-- Categoria: Especialidades
('Vocês atendem gestantes?',
 ARRAY['gestant', 'gravid', 'gravida', 'beb', 'prenatal', 'matern'],
 '🤰 Sim, temos acompanhamento nutricional para gestantes!\n\n👶 Oferecemos:\n• Nutrição adequada para cada trimestre\n• Controle de ganho de peso\n• Prevenção de diabetes gestacional\n• Suplementação necessária\n• Alimentação para amamentação\n\n🍼 Cuide da sua saúde e do seu bebê!',
 'especialidades'),

('Atendem crianças?',
 ARRAY['crianc', 'infantil', 'filh', 'pediatr', 'beb', 'adolesc'],
 '👧 Sim, atendemos crianças e adolescentes!\n\n🍎 Trabalhamos com:\n• Desenvolvimento de hábitos saudáveis\n• Seletividade alimentar\n• Obesidade infantil\n• Alimentação escolar\n• Nutrição esportiva juvenil\n\n🌟 Investir na alimentação das crianças é investir no futuro!',
 'especialidades'),

('Vocês tratam intolerância a lactose?',
 ARRAY['intoler', 'lactos', 'leit', 'latic', 'alergi', 'gluten'],
 '🥛 Sim, tratamos intolerâncias e alergias alimentares!\n\n🔬 Atendemos casos de:\n• Intolerância à lactose\n• Doença celíaca/Sensibilidade ao glúten\n• Alergias alimentares diversas\n• APLV (Alergia à Proteína do Leite de Vaca)\n\n✅ Planos alimentares adaptados e saborosos!',
 'especialidades')

ON CONFLICT DO NOTHING;
