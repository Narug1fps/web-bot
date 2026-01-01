// Script simples para inserir configurações e perguntas básicas no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('🔧 Iniciando seed...');

    const configs = [
        { chave: 'limiar_confianca', valor: '0.3', descricao: 'Nível mínimo de confiança (0 a 1) para enviar uma resposta automática' },
        { chave: 'mensagem_padrao', valor: 'Olá! 👋 Sou o assistente virtual. Não encontrei uma resposta exata, mas um especialista entrará em contato em breve.' },
        { chave: 'mensagem_boas_vindas', valor: 'Olá! 👋 Seja bem-vindo(a). Como posso ajudar seu negócio hoje?' }
    ];

    try {
        const { error } = await supabase.from('configuracoes').upsert(configs, { onConflict: 'chave' });
        if (error) {
            if (error.code === '42501') {
                console.error('Erro de permissão (RLS). Use a SERVICE_ROLE key ou ajuste as policies no Supabase:', error.message);
                process.exit(1);
            }
            console.error('Erro ao inserir configs:', error);
        } else {
            console.log('✅ Configurações seed aplicadas');
        }
    } catch (err) {
        console.error('Erro inesperado:', err.message || err);
    }

    // Inserir algumas perguntas de exemplo
    const perguntas = [
        {
            pergunta: 'O que é o GDC Gestor de Clientes?',
            tokens: ['gdc', 'gestor', 'clientes', 'crm', 'sistema'],
            resposta: '📊 O GDC é um sistema SaaS para organização e gestão de clientes: https://gdc.viraweb.online',
            categoria: 'institucional'
        },
        {
            pergunta: 'Vocês fazem tráfego pago?',
            tokens: ['trafego', 'ads', 'anuncio', 'google', 'facebook', 'instagram'],
            resposta: '📢 Sim! Gerenciamos campanhas de tráfego pago em Google Ads e redes sociais.',
            categoria: 'trafego_pago'
        }
    ];

    for (const p of perguntas) {
        try {
            const { error } = await supabase.from('perguntas_respostas').upsert({ pergunta: p.pergunta, tokens: p.tokens, resposta: p.resposta, categoria: p.categoria }, { onConflict: 'pergunta' });
            if (error) {
                console.error('Erro ao inserir pergunta:', p.pergunta, error.message || error);
            }
        } catch (err) {
            console.error('Erro inesperado ao inserir pergunta:', err.message || err);
        }
    }

    console.log('✅ Seed finalizada. Se houver problemas de permissão, verifique a Service Role Key ou as policies do Supabase.');
}

seed();
