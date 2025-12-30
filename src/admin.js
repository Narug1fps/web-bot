const readline = require('readline');
const { tokenizar } = require('./tokenizer');
const db = require('./database');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pergunta = (texto) => new Promise((resolve) => rl.question(texto, resolve));

async function menu() {
    console.log('\n🥗 ═══════════════════════════════════════');
    console.log('   ADMINISTRAÇÃO DO BOT NUTRICIONISTA');
    console.log('   ═══════════════════════════════════════\n');
    console.log('   1. Listar perguntas cadastradas');
    console.log('   2. Adicionar nova pergunta');
    console.log('   3. Ver estatísticas');
    console.log('   4. Alterar limiar de confiança');
    console.log('   5. Testar matching');
    console.log('   6. Ver histórico recente');
    console.log('   0. Sair\n');

    const opcao = await pergunta('   Escolha uma opção: ');

    switch (opcao) {
        case '1':
            await listarPerguntas();
            break;
        case '2':
            await adicionarPergunta();
            break;
        case '3':
            await verEstatisticas();
            break;
        case '4':
            await alterarLimiar();
            break;
        case '5':
            await testarMatching();
            break;
        case '6':
            await verHistorico();
            break;
        case '0':
            console.log('\n👋 Até mais!\n');
            rl.close();
            process.exit(0);
        default:
            console.log('\n⚠️  Opção inválida!');
    }

    await menu();
}

async function listarPerguntas() {
    console.log('\n📋 PERGUNTAS CADASTRADAS:\n');

    const perguntas = await db.buscarTodasPerguntas();

    if (perguntas.length === 0) {
        console.log('   Nenhuma pergunta cadastrada.');
        return;
    }

    perguntas.forEach((p, i) => {
        console.log(`   ${i + 1}. [${p.categoria}] ${p.pergunta}`);
        console.log(`      Tokens: ${p.tokens.join(', ')}`);
        console.log(`      Resposta: ${p.resposta.substring(0, 80)}...`);
        console.log('');
    });
}

async function adicionarPergunta() {
    console.log('\n➕ ADICIONAR NOVA PERGUNTA:\n');

    const perguntaTexto = await pergunta('   Pergunta: ');
    const resposta = await pergunta('   Resposta: ');
    const categoria = await pergunta('   Categoria (ex: agendamento, precos, dieta): ') || 'geral';

    const tokens = tokenizar(perguntaTexto);
    console.log(`\n   📌 Tokens gerados: ${tokens.join(', ')}`);

    const confirmar = await pergunta('\n   Confirmar adição? (s/n): ');

    if (confirmar.toLowerCase() === 's') {
        await db.adicionarPergunta(perguntaTexto, tokens, resposta, categoria);
        console.log('\n   ✅ Pergunta adicionada com sucesso!');
    } else {
        console.log('\n   ❌ Operação cancelada.');
    }
}

async function verEstatisticas() {
    console.log('\n📊 ESTATÍSTICAS:\n');

    const stats = await db.buscarEstatisticas();

    console.log(`   📝 Perguntas cadastradas: ${stats.totalPerguntas}`);
    console.log(`   💬 Mensagens respondidas: ${stats.totalMensagens}`);
    console.log(`   📈 Confiança média: ${(stats.mediaConfianca * 100).toFixed(1)}%`);
}

async function alterarLimiar() {
    const limiarAtual = await db.buscarConfig('limiar_confianca');
    console.log(`\n⚙️  Limiar atual: ${(parseFloat(limiarAtual) * 100).toFixed(0)}%`);
    console.log('   (Mensagens abaixo desse limiar receberão resposta padrão)\n');

    const novoLimiar = await pergunta('   Novo limiar (0-100): ');
    const valor = parseFloat(novoLimiar) / 100;

    if (valor >= 0 && valor <= 1) {
        await db.atualizarConfig('limiar_confianca', valor.toString());
        console.log(`\n   ✅ Limiar atualizado para ${(valor * 100).toFixed(0)}%`);
    } else {
        console.log('\n   ❌ Valor inválido!');
    }
}

async function testarMatching() {
    console.log('\n🧪 TESTAR MATCHING:\n');

    const mensagem = await pergunta('   Digite uma mensagem de teste: ');
    const tokens = tokenizar(mensagem);
    console.log(`\n   📌 Tokens da mensagem: ${tokens.join(', ')}`);

    const { encontrarMelhorMatch } = require('./tokenizer');
    const perguntas = await db.buscarTodasPerguntas();
    const match = encontrarMelhorMatch(mensagem, perguntas);
    const limiar = parseFloat(await db.buscarConfig('limiar_confianca') || '0.3');

    if (match) {
        console.log(`\n   🎯 Melhor match: "${match.pergunta.pergunta}"`);
        console.log(`   📊 Confiança: ${(match.confianca * 100).toFixed(1)}%`);
        console.log(`   📌 Tokens match: ${match.tokensPergunta.join(', ')}`);

        if (match.confianca >= limiar) {
            console.log(`\n   ✅ RESPONDERIA COM:`);
            console.log(`   "${match.pergunta.resposta}"`);
        } else {
            console.log(`\n   ❌ Abaixo do limiar (${(limiar * 100).toFixed(0)}%) - resposta padrão`);
        }
    } else {
        console.log('\n   ❌ Nenhum match encontrado');
    }
}

async function verHistorico() {
    console.log('\n📜 HISTÓRICO RECENTE (últimas 10):\n');

    const historico = await db.buscarHistorico(10);

    if (historico.length === 0) {
        console.log('   Nenhum histórico ainda.');
        return;
    }

    historico.forEach((h) => {
        const data = new Date(h.criado_em).toLocaleString('pt-BR');
        console.log(`   📱 ${h.numero_telefone} (${h.nome_contato || 'Desconhecido'})`);
        console.log(`   📅 ${data}`);
        console.log(`   💬 "${h.mensagem_recebida}"`);
        console.log(`   📤 Confiança: ${((h.confianca || 0) * 100).toFixed(1)}%`);
        console.log('   ───────────────────────────────────────');
    });
}

console.log('\n🔄 Conectando ao Supabase...');
menu().catch(console.error);
