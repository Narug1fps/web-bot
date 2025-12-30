const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmerPt;

const stopWords = new Set([
    'a', 'o', 'e', 'é', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'um', 'uma', 'uns', 'umas', 'para', 'com', 'sem', 'por', 'pelo', 'pela', 'pelos', 'pelas',
    'que', 'qual', 'quais', 'como', 'quando', 'onde', 'porque', 'porquê', 'pois',
    'se', 'não', 'sim', 'ou', 'mas', 'mais', 'menos', 'muito', 'muita', 'muitos', 'muitas',
    'pouco', 'pouca', 'poucos', 'poucas', 'todo', 'toda', 'todos', 'todas',
    'esse', 'essa', 'esses', 'essas', 'este', 'esta', 'estes', 'estas',
    'aquele', 'aquela', 'aqueles', 'aquelas', 'isso', 'isto', 'aquilo',
    'meu', 'minha', 'meus', 'minhas', 'seu', 'sua', 'seus', 'suas',
    'nosso', 'nossa', 'nossos', 'nossas', 'dele', 'dela', 'deles', 'delas',
    'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês',
    'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 'me', 'mim', 'comigo',
    'ao', 'aos', 'à', 'às', 'pelo', 'pelos', 'pela', 'pelas',
    'oi', 'olá', 'bom', 'boa', 'dia', 'tarde', 'noite'
]);

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizar(texto) {
    const textoNormalizado = normalizarTexto(texto);
    const tokens = tokenizer.tokenize(textoNormalizado);

    const tokensProcessados = tokens
        .filter(token => token.length > 2)
        .filter(token => !stopWords.has(token))
        .map(token => stemmer.stem(token));

    return [...new Set(tokensProcessados)];
}

function calcularSimilaridade(tokens1, tokens2) {
    if (tokens1.length === 0 || tokens2.length === 0) {
        return 0;
    }

    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    let intersecao = 0;
    for (const token of set1) {
        if (set2.has(token)) {
            intersecao++;
        }
    }

    const uniao = new Set([...set1, ...set2]).size;
    const jaccard = intersecao / uniao;

    const matchPercentage1 = intersecao / set1.size;
    const matchPercentage2 = intersecao / set2.size;

    const combinedScore = (jaccard * 0.4) + (matchPercentage1 * 0.3) + (matchPercentage2 * 0.3);

    return combinedScore;
}

function encontrarMelhorMatch(mensagem, perguntas) {
    const tokensMensagem = tokenizar(mensagem);

    if (tokensMensagem.length === 0) {
        return null;
    }

    let melhorMatch = null;
    let maiorSimilaridade = 0;

    for (const pergunta of perguntas) {
        const tokensPergunta = JSON.parse(pergunta.tokens);
        const similaridade = calcularSimilaridade(tokensMensagem, tokensPergunta);

        if (similaridade > maiorSimilaridade) {
            maiorSimilaridade = similaridade;
            melhorMatch = {
                pergunta: pergunta,
                confianca: similaridade,
                tokensMensagem: tokensMensagem,
                tokensPergunta: tokensPergunta
            };
        }
    }

    return melhorMatch;
}

module.exports = {
    tokenizar,
    normalizarTexto,
    calcularSimilaridade,
    encontrarMelhorMatch
};
