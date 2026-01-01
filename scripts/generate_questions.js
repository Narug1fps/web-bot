const fs = require('fs');

// Gerador simples e determinístico (seeded) para criar variações de perguntas
function randomSeeded(seed) {
  let x = Math.sin(seed) * 10000;
  return function() { x = Math.sin(x) * 10000; return x - Math.floor(x); }
}

const templates = [
  { category: 'institucional', templates: [
    'O que é a Viraweb?',
    'Quem é a Viraweb?',
    'Me fala sobre a Viraweb',
    'O que faz a Viraweb?'
  ], tokens: ['viraweb', 'empresa', 'sobre'] },
  { category: 'institucional', templates: [
    'O que é o GDC Gestor de Clientes?',
    'Me explica o GDC',
    'GDC é um CRM?',
    'O que faz o Gestor de Clientes GDC?'
  ], tokens: ['gdc', 'gestor', 'clientes', 'crm'] },
  { category: 'sites', templates: [
    'Vocês criam sites?',
    'Fazem site?',
    'Podem desenvolver um website para minha empresa?',
    'Vocês fazem lojas virtuais?'
  ], tokens: ['site', 'criacao', 'website', 'e-commerce'] },
  { category: 'trafego_pago', templates: [
    'Vocês fazem tráfego pago?',
    'Gerenciam anúncios no Google?',
    'Fazem campanhas pagas no Facebook/Instagram?',
    'O que vocês fazem em Ads?'
  ], tokens: ['trafego', 'ads', 'facebook', 'instagram', 'google'] },
  { category: 'contato', templates: [
    'Como solicitar um orçamento?',
    'Quero um orçamento',
    'Como faço para contratar vocês?',
    'Como falar com o atendimento?'
  ], tokens: ['orcamento', 'contato', 'preco', 'contratar'] }
];

// cria variações substituindo palavras por sinônimos e juntando palavras-chave
const synonyms = {
  'criam': ['fazem', 'desenvolvem'],
  'site': ['site', 'website', 'pagina', 'site institucional'],
  'anúncios': ['ads', 'anuncios', 'campanhas'],
  'como': ['como', 'de que forma', 'de que jeito']
};

function expandTemplate(tpl, rng) {
  // pequenas variações: remover interrogação, adicionar "por favor", abreviações
  let out = tpl;
  if (rng() > 0.85) out = out.replace('?', '');
  if (rng() > 0.8) out = out + ' por favor';
  if (rng() > 0.9) out = out.replace('Vocês', 'Vocês da Viraweb');
  if (rng() > 0.92) out = out.replace('Vocês', 'Viraweb');
  return out;
}

function buildTokenArray(baseTokens, extraTokens) {
  const set = new Set(baseTokens.concat(extraTokens || []));
  return Array.from(set);
}

function generate(n = 1000) {
  const rng = randomSeeded(12345);
  const results = [];

  let idx = 0;
  while (results.length < n) {
    const group = templates[Math.floor(rng() * templates.length)];
    const tpl = group.templates[Math.floor(rng() * group.templates.length)];

    const pergunta = expandTemplate(tpl, rng);

    // gerar tokens adicionais baseadas em palavras da pergunta
    const words = pergunta.toLowerCase().replace(/[?!.]/g, '').split(/\s+/).filter(w => w.length > 2);
    const extraTokens = words.slice(0, 3).map(w => w.replace(/[^a-z0-9]/g, ''));

    const tokens = buildTokenArray(group.tokens, extraTokens);

    const resposta = `Olá! Obrigado pela pergunta. Sobre ${group.category.replace('_', ' ')}: podemos ajudar — visite https://viraweb.online ou solicite um orçamento.`;

    const perguntaObj = {
      id: ++idx,
      pergunta: pergunta,
      tokens,
      resposta,
      categoria: group.category
    };

    // evitar duplicatas (mesmo texto)
    if (!results.find(r => r.pergunta === perguntaObj.pergunta)) {
      results.push(perguntaObj);
    }

    // variar seed para mais diversidade
    if (rng() > 0.998 && results.length < n) {
      // adicionar uma transformação extra
      results.push({
        id: ++idx,
        pergunta: pergunta + ' (mais detalhes)',
        tokens: buildTokenArray(group.tokens, ['detalhes']),
        resposta,
        categoria: group.category
      });
    }
  }

  return results.slice(0, n);
}

const out = generate(1000);

// Escrever JSON para uso pelo seed
if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/questions.json', JSON.stringify(out, null, 2));

// Gerar SQL
let sqlLines = [];
sqlLines.push("-- Arquivo gerado por scripts/generate_questions.js - gera ~1000 entradas\n");
sqlLines.push('INSERT INTO perguntas_respostas (pergunta, tokens, resposta, categoria) VALUES');

const values = out.map(q => {
  const pergunta = q.pergunta.replace(/'/g, "''");
  const tokensArray = "ARRAY[" + q.tokens.map(t => `'${t.replace(/'/g, "''")}'`).join(', ') + "]";
  const resposta = q.resposta.replace(/'/g, "''");
  const categoria = q.categoria.replace(/'/g, "''");
  return `('${pergunta}', ${tokensArray}, '${resposta}', '${categoria}')`;
});

// dividir em blocos de 200 para evitar query enormes
for (let i = 0; i < values.length; i += 200) {
  const block = values.slice(i, i + 200).join(',\n');
  sqlLines.push(block + ' ON CONFLICT DO NOTHING;\n');
}

fs.writeFileSync('sql/004_expand_questions.sql', sqlLines.join('\n'));

console.log('✅ Gerado data/questions.json e sql/004_expand_questions.sql com', out.length, 'entradas');
