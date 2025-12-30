const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios!');
    console.error('📝 Crie um arquivo .env baseado no .env.example');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarTodasPerguntas() {
    const { data, error } = await supabase
        .from('perguntas_respostas')
        .select('*')
        .eq('ativo', true);

    if (error) {
        console.error('Erro ao buscar perguntas:', error);
        return [];
    }
    return data;
}

async function buscarPerguntaPorId(id) {
    const { data, error } = await supabase
        .from('perguntas_respostas')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Erro ao buscar pergunta:', error);
        return null;
    }
    return data;
}

async function adicionarPergunta(pergunta, tokens, resposta, categoria = 'geral') {
    const { data, error } = await supabase
        .from('perguntas_respostas')
        .insert({
            pergunta,
            tokens,
            resposta,
            categoria
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao adicionar pergunta:', error);
        return null;
    }
    return data;
}

async function atualizarPergunta(id, pergunta, tokens, resposta, categoria) {
    const { data, error } = await supabase
        .from('perguntas_respostas')
        .update({
            pergunta,
            tokens,
            resposta,
            categoria
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar pergunta:', error);
        return null;
    }
    return data;
}

async function deletarPergunta(id) {
    const { error } = await supabase
        .from('perguntas_respostas')
        .update({ ativo: false })
        .eq('id', id);

    if (error) {
        console.error('Erro ao deletar pergunta:', error);
        return false;
    }
    return true;
}

async function registrarHistorico(numeroTelefone, nomeContato, mensagemRecebida, respostaEnviada, confianca, perguntaId) {
    const { data, error } = await supabase
        .from('historico')
        .insert({
            numero_telefone: numeroTelefone,
            nome_contato: nomeContato,
            mensagem_recebida: mensagemRecebida,
            resposta_enviada: respostaEnviada,
            confianca,
            pergunta_id: perguntaId
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao registrar histórico:', error);
        return null;
    }
    return data;
}

async function buscarHistorico(limite = 100) {
    const { data, error } = await supabase
        .from('historico')
        .select(`
      *,
      perguntas_respostas (
        pergunta,
        categoria
      )
    `)
        .order('criado_em', { ascending: false })
        .limit(limite);

    if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
    }
    return data;
}

async function buscarHistoricoPorNumero(numeroTelefone, limite = 50) {
    const { data, error } = await supabase
        .from('historico')
        .select('*')
        .eq('numero_telefone', numeroTelefone)
        .order('criado_em', { ascending: false })
        .limit(limite);

    if (error) {
        console.error('Erro ao buscar histórico por número:', error);
        return [];
    }
    return data;
}

async function buscarConfig(chave) {
    const { data, error } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', chave)
        .single();

    if (error) {
        console.error('Erro ao buscar configuração:', error);
        return null;
    }
    return data?.valor;
}

async function atualizarConfig(chave, valor) {
    const { error } = await supabase
        .from('configuracoes')
        .update({ valor })
        .eq('chave', chave);

    if (error) {
        console.error('Erro ao atualizar configuração:', error);
        return false;
    }
    return true;
}

async function buscarTodasConfigs() {
    const { data, error } = await supabase
        .from('configuracoes')
        .select('*');

    if (error) {
        console.error('Erro ao buscar configurações:', error);
        return [];
    }
    return data;
}

async function verificarBloqueado(numeroTelefone) {
    const { data, error } = await supabase
        .from('contatos_bloqueados')
        .select('id')
        .eq('numero_telefone', numeroTelefone)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio:', error);
    }
    return !!data;
}

async function bloquearContato(numeroTelefone, motivo = null) {
    const { error } = await supabase
        .from('contatos_bloqueados')
        .insert({
            numero_telefone: numeroTelefone,
            motivo
        });

    if (error) {
        console.error('Erro ao bloquear contato:', error);
        return false;
    }
    return true;
}

async function desbloquearContato(numeroTelefone) {
    const { error } = await supabase
        .from('contatos_bloqueados')
        .delete()
        .eq('numero_telefone', numeroTelefone);

    if (error) {
        console.error('Erro ao desbloquear contato:', error);
        return false;
    }
    return true;
}

async function buscarEstatisticas() {
    const [perguntasResult, historicoResult, confiancaResult] = await Promise.all([
        supabase
            .from('perguntas_respostas')
            .select('id', { count: 'exact' })
            .eq('ativo', true),
        supabase
            .from('historico')
            .select('id', { count: 'exact' }),
        supabase
            .from('historico')
            .select('confianca')
    ]);

    const totalPerguntas = perguntasResult.count || 0;
    const totalMensagens = historicoResult.count || 0;

    let mediaConfianca = 0;
    if (confiancaResult.data && confiancaResult.data.length > 0) {
        const soma = confiancaResult.data.reduce((acc, item) => acc + (item.confianca || 0), 0);
        mediaConfianca = soma / confiancaResult.data.length;
    }

    return {
        totalPerguntas,
        totalMensagens,
        mediaConfianca: mediaConfianca.toFixed(4)
    };
}

module.exports = {
    supabase,
    buscarTodasPerguntas,
    buscarPerguntaPorId,
    adicionarPergunta,
    atualizarPergunta,
    deletarPergunta,
    registrarHistorico,
    buscarHistorico,
    buscarHistoricoPorNumero,
    buscarConfig,
    atualizarConfig,
    buscarTodasConfigs,
    verificarBloqueado,
    bloquearContato,
    desbloquearContato,
    buscarEstatisticas
};
