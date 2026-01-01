const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { tokenizar, encontrarMelhorMatch } = require('./tokenizer');
const db = require('./database');
require('dotenv').config();

console.log('🚀 Iniciando Bot WhatsApp da Viraweb...\n');

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
let currentQR = null;
let currentQRImage = null;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const serveStaticFile = (res, filePath) => {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
};

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost`);
    const pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            botReady,
            timestamp: new Date().toISOString()
        }));
    } else if (pathname === '/api/status') {
        try {
            let stats = null;
            if (botReady) {
                stats = await db.buscarEstatisticas();
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                botReady,
                qrCode: currentQRImage,
                stats,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                botReady,
                qrCode: currentQRImage,
                stats: null,
                timestamp: new Date().toISOString()
            }));
        }
    } else if (pathname === '/' || pathname === '/index.html') {
        const filePath = path.join(__dirname, '..', 'public', 'index.html');
        serveStaticFile(res, filePath);
    } else if (pathname.startsWith('/')) {
        const filePath = path.join(__dirname, '..', 'public', pathname);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            serveStaticFile(res, filePath);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌐 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse http://localhost:${PORT} para conectar o WhatsApp`);
});

client.on('qr', async (qr) => {
    currentQR = qr;
    try {
        currentQRImage = await QRCode.toDataURL(qr, { width: 300 });
    } catch (err) {
        console.error('Erro ao gerar QR Image:', err);
    }
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:');
    console.log('   (WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo)\n');
    qrcodeTerminal.generate(qr, { small: true });
    console.log(`\n🌐 OU ACESSE: http://localhost:${PORT} para ver o QR Code`);
    console.log('⚠️  IMPORTANTE: Após escanear, a sessão será salva.');
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

        // Responder saudações comuns localmente (não depende de DB)
        const textoLower = mensagem.trim().toLowerCase();
        const greetingRegex = /^(oi|ol[aá]|ola|bom dia|boa tarde|boa noite|e ai|e aí)\b/;
        if (greetingRegex.test(textoLower)) {
            const msgBoasVindas = await db.buscarConfig('mensagem_boas_vindas') || 'Olá! 👋 Como posso ajudar?';
            await message.reply(msgBoasVindas);
            console.log('   👋 Resposta de boas-vindas enviada');
            // Tentar registrar histórico, falhas não devem interromper o fluxo
            await db.registrarHistorico(numeroTelefone, nomeContato, mensagem, msgBoasVindas, 1, null);
            return;
        }

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
