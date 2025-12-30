// Estado da aplicação
const state = {
    currentState: 'loading', // loading, qr, connected, error
    countdown: 10,
    countdownInterval: null,
    pollInterval: null
};

// Elementos DOM
const elements = {
    statusBadge: document.getElementById('statusBadge'),
    stateLoading: document.getElementById('stateLoading'),
    stateQR: document.getElementById('stateQR'),
    stateConnected: document.getElementById('stateConnected'),
    stateError: document.getElementById('stateError'),
    qrImage: document.getElementById('qrImage'),
    countdown: document.getElementById('countdown'),
    errorMessage: document.getElementById('errorMessage'),
    statPerguntas: document.getElementById('statPerguntas'),
    statMensagens: document.getElementById('statMensagens'),
    statConfianca: document.getElementById('statConfianca')
};

// Atualiza o estado visual
function setState(newState) {
    state.currentState = newState;

    // Esconde todos os estados
    elements.stateLoading.classList.add('hidden');
    elements.stateQR.classList.add('hidden');
    elements.stateConnected.classList.add('hidden');
    elements.stateError.classList.add('hidden');

    // Atualiza o badge de status
    elements.statusBadge.className = 'status-badge';

    switch (newState) {
        case 'loading':
            elements.stateLoading.classList.remove('hidden');
            elements.statusBadge.classList.add('loading');
            elements.statusBadge.querySelector('.status-text').textContent = 'Iniciando...';
            break;

        case 'qr':
            elements.stateQR.classList.remove('hidden');
            elements.statusBadge.classList.add('loading');
            elements.statusBadge.querySelector('.status-text').textContent = 'Aguardando scan';
            startCountdown();
            break;

        case 'connected':
            elements.stateConnected.classList.remove('hidden');
            elements.statusBadge.classList.add('online');
            elements.statusBadge.querySelector('.status-text').textContent = 'Conectado';
            stopCountdown();
            break;

        case 'error':
            elements.stateError.classList.remove('hidden');
            elements.statusBadge.classList.add('offline');
            elements.statusBadge.querySelector('.status-text').textContent = 'Offline';
            stopCountdown();
            break;
    }
}

// Inicia o countdown
function startCountdown() {
    stopCountdown();
    state.countdown = 10;
    updateCountdownDisplay();

    state.countdownInterval = setInterval(() => {
        state.countdown--;
        updateCountdownDisplay();

        if (state.countdown <= 0) {
            checkStatus();
            state.countdown = 10;
        }
    }, 1000);
}

// Para o countdown
function stopCountdown() {
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
}

// Atualiza o display do countdown
function updateCountdownDisplay() {
    if (elements.countdown) {
        elements.countdown.textContent = state.countdown;
    }
}

// Verifica o status do bot
async function checkStatus() {
    try {
        const response = await fetch('/api/status');

        if (!response.ok) {
            throw new Error('Falha ao obter status');
        }

        const data = await response.json();

        if (data.botReady) {
            setState('connected');
            updateStats(data.stats);
        } else if (data.qrCode) {
            elements.qrImage.src = data.qrCode;
            if (state.currentState !== 'qr') {
                setState('qr');
            }
        } else {
            if (state.currentState !== 'loading') {
                setState('loading');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        elements.errorMessage.textContent = error.message || 'Não foi possível conectar ao servidor.';
        setState('error');
    }
}

// Atualiza as estatísticas
function updateStats(stats) {
    if (stats) {
        elements.statPerguntas.textContent = stats.totalPerguntas || 0;
        elements.statMensagens.textContent = stats.totalMensagens || 0;
        elements.statConfianca.textContent = stats.mediaConfianca
            ? `${(stats.mediaConfianca * 100).toFixed(1)}%`
            : '0%';
    }
}

// Inicia o polling
function startPolling() {
    checkStatus();

    // Poll a cada 5 segundos
    state.pollInterval = setInterval(() => {
        if (state.currentState !== 'connected') {
            checkStatus();
        }
    }, 5000);
}

// Para o polling
function stopPolling() {
    if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setState('loading');
    startPolling();
});

// Limpeza ao sair da página
window.addEventListener('beforeunload', () => {
    stopPolling();
    stopCountdown();
});
