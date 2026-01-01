const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são necessários no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMany() {
  if (!fs.existsSync('data/questions.json')) {
    console.error('Arquivo data/questions.json não encontrado. Rode `npm run generate:questions` primeiro.');
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync('data/questions.json', 'utf-8'));

  // Buscar perguntas existentes para evitar duplicatas (evita necessidade de unique constraint)
  const allPerguntas = questions.map(q => q.pergunta);

  // dividir em blocos para consultar e inserir
  const batchSize = 200;

  // Função auxiliar para buscar existentes em lotes
  async function fetchExistentes(perguntasBlock) {
    const { data, error } = await supabase
      .from('perguntas_respostas')
      .select('pergunta')
      .in('pergunta', perguntasBlock);

    if (error) {
      console.error('Erro ao buscar perguntas existentes:', error.message || error);
      return [];
    }
    return (data || []).map(d => d.pergunta);
  }

  // Construir set de existentes
  const existentesSet = new Set();
  for (let i = 0; i < allPerguntas.length; i += batchSize) {
    const block = allPerguntas.slice(i, i + batchSize);
    const encontrados = await fetchExistentes(block);
    encontrados.forEach(p => existentesSet.add(p));
  }

  // Inserir apenas novos (em batches)
  let insertedCount = 0;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)
      .filter(q => !existentesSet.has(q.pergunta))
      .map(q => ({ pergunta: q.pergunta, tokens: q.tokens, resposta: q.resposta, categoria: q.categoria }));

    if (batch.length === 0) {
      console.log(`⚠️ Batch ${i}..${i + batchSize} não contém itens novos, pulando.`);
      continue;
    }

    const { error } = await supabase.from('perguntas_respostas').insert(batch);
    if (error) {
      if (error.code === '42501') {
        console.error('Erro de permissão (RLS). Use a SERVICE_ROLE key ou ajuste as policies no Supabase:', error.message);
        process.exit(1);
      }
      console.error('Erro ao inserir batch:', error.message || error);
    } else {
      insertedCount += batch.length;
      console.log(`✅ Batch ${i}..${i + batch.length} insert OK (${batch.length} novos)`);
      // Atualizar set para evitar re-inserção dentro do mesmo run
      batch.forEach(b => existentesSet.add(b.pergunta));
    }
  }

  console.log('✅ Seed em massa finalizada. Total inseridos:', insertedCount);

  console.log('✅ Seed em massa finalizada');
}

seedMany();
