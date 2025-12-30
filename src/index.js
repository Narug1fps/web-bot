const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');
const { tokenizar, encontrarMelhorMatch } = require('./tokenizer');
const db = require('./database');
require('dotenv').config();

console.log('🥗 Iniciando Bot WhatsApp do Nutricionista...\n');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session'
    }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process'
        ]
    }
});

const contatosNovos = new Set();
let botReady = false;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            botReady,
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌐 Health check rodando na porta ${PORT}`);
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:');
    console.log('   (WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo)\n');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  IMPORTANTE: Após escanear, a sessão será salva.');
    console.log('   Nas próximas vezes não precisará escanear novamente.\n');
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando... ${percent}% - ${message}`);
});

client.on('authenticated', () => {
    console.log('✅ Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('ready', async () => {
    botReady = true;
    console.log('\n🚀 ════════════════════════════════════════');
    console.log('   BOT ESTÁ PRONTO E CONECTADO!');
    console.log('   ════════════════════════════════════════\n');

    try {
        const stats = await db.buscarEstatisticas();
        console.log(`📝 Perguntas cadastradas: ${stats.totalPerguntas}`);
        console.log(`💬 Mensagens no histórico: ${stats.totalMensagens}`);
        console.log(`📈 Confiança média: ${(stats.mediaConfianca * 100).toFixed(1)}%`);
    } catch (error) {
        console.log('⚠️  Não foi possível carregar estatísticas');
    }

    console.log('\n👂 Aguardando mensagens...\n');
});

client.on('message', async (message) => {
    if (message.fromMe) return;

    const numeroTelefone = message.from;
    const mensagem = message.body;

    if (!mensagem || mensagem.trim() === '') return;

    const agora = new Date().toLocaleTimeString('pt-BR');
    console.log(`\n📨 [${agora}] Mensagem de ${numeroTelefone}:`);
    console.log(`   "${mensagem}"`);

    try {
        const estaBloqueado = await db.verificarBloqueado(numeroTelefone);
        if (estaBloqueado) {
            console.log('   🚫 Contato bloqueado, ignorando...');
            return;
        }

        const contact = await message.getContact();
        const nomeContato = contact.pushname || contact.name || 'Desconhecido';

        if (!contatosNovos.has(numeroTelefone)) {
            contatosNovos.add(numeroTelefone);
            const msgBoasVindas = await db.buscarConfig('mensagem_boas_vindas');
            if (msgBoasVindas) {
                await message.reply(msgBoasVindas);
                console.log('   👋 Boas-vindas enviada');
            }
        }

        const perguntas = await db.buscarTodasPerguntas();

        if (perguntas.length === 0) {
            console.log('   ⚠️ Nenhuma pergunta cadastrada no banco!');
            const msgPadrao = await db.buscarConfig('mensagem_padrao');
            if (msgPadrao) {
                await message.reply(msgPadrao);
            }
            return;
        }

        const match = encontrarMelhorMatch(mensagem, perguntas);
        const limiarConfianca = parseFloat(await db.buscarConfig('limiar_confianca') || '0.3');

        let resposta;
        let perguntaId = null;
        let confianca = 0;

        if (match && match.confianca >= limiarConfianca) {
            resposta = match.pergunta.resposta;
            perguntaId = match.pergunta.id;
            confianca = match.confianca;

            console.log(`   ✅ Match: "${match.pergunta.pergunta.substring(0, 50)}..."`);
            console.log(`   📊 Confiança: ${(confianca * 100).toFixed(1)}% | Categoria: ${match.pergunta.categoria}`);
        } else {
            resposta = await db.buscarConfig('mensagem_padrao') ||
                'Desculpe, não consegui entender sua pergunta. Um atendente entrará em contato em breve.';

            console.log(`   ❌ Sem match (melhor: ${match ? (match.confianca * 100).toFixed(1) : 0}%, mínimo: ${(limiarConfianca * 100).toFixed(1)}%)`);
        }

        await message.reply(resposta);
        console.log('   📤 Resposta enviada!');

        await db.registrarHistorico(
            numeroTelefone,
            nomeContato,
            mensagem,
            resposta,
            confianca,
            perguntaId
        );

    } catch (error) {
        console.error('   ❌ Erro:', error.message);
    }
});

client.on('disconnected', (reason) => {
    botReady = false;
    console.log('\n🔌 Bot desconectado:', reason);
    console.log('🔄 Tentando reconectar em 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

process.on('SIGINT', async () => {
    console.log('\n\n👋 Encerrando bot...');
    await client.destroy();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n👋 Recebido SIGTERM, encerrando...');
    await client.destroy();
    server.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});

client.initialize();
