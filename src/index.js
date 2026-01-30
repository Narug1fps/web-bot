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
        headless: 'shell', // Novo modo headless (mais compatível)
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--window-size=1920,1080', // Simula tamanho real de tela
            '--disable-blink-features=AutomationControlled' // Oculta automação
        ],
        timeout: 120000
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
});

const contatosNovos = new Set();
let botReady = false;
let isAuthenticated = false;
let isInitializing = false;
let initRetryCount = 0;
const MAX_INIT_RETRIES = 3;
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
            dbConfigured: !!db.supabase,
            timestamp: new Date().toISOString()
        }));
    } else if (pathname === '/api/status') {
        try {
            let stats = null;
            if (botReady && db.supabase) {
                stats = await db.buscarEstatisticas();
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                botReady,
                isAuthenticated,
                qrCode: currentQRImage,
                stats,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                botReady,
                isAuthenticated,
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
server.listen(PORT, '0.0.0.0', () => {
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

let readyTimeout = null;

client.on('authenticated', () => {
    console.log('✅ Autenticado com sucesso!');
    isAuthenticated = true;
    // Limpa o QR code após autenticação bem-sucedida
    currentQR = null;
    currentQRImage = null;

    // Workaround: Se o evento 'ready' não disparar em 30 segundos após autenticação,
    // tenta verificar se o cliente está funcional e força o estado
    if (readyTimeout) clearTimeout(readyTimeout);
    readyTimeout = setTimeout(async () => {
        if (!botReady && isAuthenticated) {
            console.log('\n⚠️ Evento ready não disparou. Verificando se cliente está funcional...');

            try {
                // Tenta obter informações do cliente para verificar se está funcional
                const info = await client.getState();
                console.log(`📊 Estado do cliente: ${info}`);

                if (info === 'CONNECTED') {
                    botReady = true;
                    isInitializing = false;
                    console.log('\n🚀 ════════════════════════════════════════');
                    console.log('   BOT ESTÁ PRONTO E CONECTADO!');
                    console.log('   ════════════════════════════════════════\n');

                    try {
                        const stats = await db.buscarEstatisticas();
                        console.log(`📝 Perguntas cadastradas: ${stats.totalPerguntas}`);
                        console.log(`💬 Mensagens no histórico: ${stats.totalMensagens}`);
                    } catch (error) {
                        console.log('⚠️  Não foi possível carregar estatísticas');
                    }

                    console.log('\n👂 Aguardando mensagens...\n');
                } else {
                    console.log(`⚠️ Cliente não está conectado (estado: ${info}). Aguardando...`);
                    // Tenta novamente em 10 segundos
                    readyTimeout = setTimeout(arguments.callee, 10000);
                }
            } catch (error) {
                console.error('❌ Erro ao verificar estado do cliente:', error.message);
                // Tenta de qualquer forma marcar como pronto se autenticou
                botReady = true;
                isInitializing = false;
                console.log('\n🚀 BOT marcado como pronto (autenticação confirmada)\n');
            }
        }
    }, 15000); // Reduzido para 15 segundos
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('ready', async () => {
    // Cancela o timeout de workaround se o ready disparar normalmente
    if (readyTimeout) {
        clearTimeout(readyTimeout);
        readyTimeout = null;
    }

    botReady = true;
    isInitializing = false;
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

// Debug: Verificando se qualquer mensagem chega
client.on('message_create', (msg) => {
    // Apenas loga que algo aconteceu, para sabermos se a conexão está viva
    if (msg.fromMe) {
        console.log('📝 [DEBUG] Mensagem enviada detectada');
    } else {
        console.log('📝 [DEBUG] Mensagem recebida detectada (no message_create)');
    }
});

client.on('message', async (message) => {
    if (message.fromMe) return;

    const numeroTelefone = message.from;
    const mensagem = message.body;

    if (!mensagem || mensagem.trim() === '') return;

    const agora = new Date().toLocaleTimeString('pt-BR');
    console.log(`\n📨 [${agora}] Mensagem de ${numeroTelefone}:`);
    console.log(`   "${mensagem}"`);

    // Debug removido

    try {
        const estaBloqueado = await db.verificarBloqueado(numeroTelefone);
        if (estaBloqueado) {
            console.log('   🚫 Contato bloqueado, ignorando...');
            return;
        }

        const contact = await message.getContact();
        const nomeContato = contact.pushname || contact.name || 'Desconhecido';
        let enviouBoasVindas = false;

        if (!contatosNovos.has(numeroTelefone)) {
            contatosNovos.add(numeroTelefone);
            const msgBoasVindas = await db.buscarConfig('mensagem_boas_vindas');
            if (msgBoasVindas) {
                await message.reply(msgBoasVindas);
                console.log('   👋 Boas-vindas enviada');
                enviouBoasVindas = true;
            }
        }

        const perguntas = await db.buscarTodasPerguntas();

        if (perguntas.length === 0) {
            console.log('   ⚠️ Nenhuma pergunta cadastrada no banco!');
            // Se já enviou boas vindas, não envia msg padrão vazia
            if (!enviouBoasVindas) {
                const msgPadrao = await db.buscarConfig('mensagem_padrao');
                if (msgPadrao) await message.reply(msgPadrao);
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

            await message.reply(resposta);
            console.log('   📤 Resposta enviada!');
        } else {
            // Só envia mensagem padrão se NÃO acabou de enviar boas-vindas
            if (!enviouBoasVindas) {
                resposta = await db.buscarConfig('mensagem_padrao') ||
                    'Desculpe, não consegui entender sua pergunta. Um atendente entrará em contato em breve.';

                console.log(`   ❌ Sem match (melhor: ${match ? (match.confianca * 100).toFixed(1) : 0}%, mínimo: ${(limiarConfianca * 100).toFixed(1)}%)`);

                await message.reply(resposta);
                console.log('   📤 Resposta enviada!');
            } else {
                console.log('   ℹ️ Boas-vindas enviadas, ignorando mensagem padrão para input sem match.');
                // Define resposta como null para logar no histórico apenas o que usuário mandou
                resposta = "[Apenas Boas-vindas]";
            }
        }

        if (resposta) {
            await db.registrarHistorico(
                numeroTelefone,
                nomeContato,
                mensagem,
                resposta,
                confianca,
                perguntaId
            );
        }

    } catch (error) {
        console.error('   ❌ Erro:', error.message);
    }
});

client.on('disconnected', (reason) => {
    botReady = false;
    isAuthenticated = false;
    isInitializing = false;
    console.log('\n🔌 Bot desconectado:', reason);
    console.log('🔄 Tentando reconectar em 5 segundos...');
    setTimeout(() => {
        safeInitialize();
    }, 5000);
});

process.on('SIGINT', async () => {
    console.log('👋 Encerrando bot...');
    await client.destroy();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('👋 Recebido SIGTERM, encerrando...');
    await client.destroy();
    server.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error.message);

    // Verifica se é um erro de contexto destruído do Puppeteer
    const isContextError = error.message && (
        error.message.includes('Execution context was destroyed') ||
        error.message.includes('Target closed') ||
        error.message.includes('Protocol error')
    );

    if (isContextError) {
        console.log('🔄 Erro de contexto do navegador detectado. Reiniciando...');
        botReady = false;
        isAuthenticated = false;
        isInitializing = false;

        // Aguarda um pouco e tenta reinicializar
        setTimeout(() => {
            safeInitialize();
        }, 3000);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
});

// Função de inicialização segura com retry
async function safeInitialize() {
    if (isInitializing) {
        console.log('⏳ Inicialização já em andamento...');
        return;
    }

    isInitializing = true;

    try {
        console.log(`🚀 Tentativa de inicialização ${initRetryCount + 1}/${MAX_INIT_RETRIES}...`);
        await client.initialize();
        initRetryCount = 0; // Reset contador em caso de sucesso
    } catch (error) {
        console.error('❌ Erro na inicialização:', error.message);
        isInitializing = false;

        initRetryCount++;

        if (initRetryCount < MAX_INIT_RETRIES) {
            const delay = 5000 * initRetryCount; // Delay progressivo
            console.log(`🔄 Tentando novamente em ${delay / 1000} segundos...`);
            setTimeout(() => {
                safeInitialize();
            }, delay);
        } else {
            console.log('⚠️ Máximo de tentativas atingido. Limpando sessão...');

            // Limpa sessão corrompida
            const sessionPath = path.join(__dirname, '..', 'session');
            if (fs.existsSync(sessionPath)) {
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log('🗑️ Sessão antiga removida.');
                } catch (e) {
                    console.error('⚠️ Não foi possível limpar sessão:', e.message);
                }
            }

            initRetryCount = 0;
            setTimeout(() => {
                safeInitialize();
            }, 3000);
        }
    }
}

safeInitialize();

