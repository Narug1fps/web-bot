# 🥗 Bot WhatsApp para Nutricionista

Bot de WhatsApp com IA por tokens de palavras para responder automaticamente perguntas sobre nutrição.

## 📋 Como Funciona

1. O bot recebe uma mensagem do WhatsApp
2. Tokeniza a mensagem (remove stop words, aplica stemming)
3. Compara com perguntas cadastradas no banco
4. Se encontrar match acima do limiar de confiança, envia a resposta
5. Caso contrário, envia mensagem padrão

## 🚀 Como Rodar

### 1. Configurar Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute os scripts na pasta `sql/`:
   - `001_create_tables.sql` (cria as tabelas)
   - `002_seed_data.sql` (dados iniciais com perguntas de exemplo)
   - `003_rls_policies.sql` (políticas de segurança - opcional)

4. Pegue suas credenciais em **Settings > API**:
   - `Project URL` → SUPABASE_URL
   - `service_role key` → SUPABASE_SERVICE_KEY

### 2. Configurar o Bot

```bash
# Clone ou baixe o projeto
cd zap-bot

# Instale as dependências
npm install

# Crie o arquivo .env
copy .env.example .env

# Edite o .env com suas credenciais do Supabase
notepad .env
```

### 3. Rodar o Bot

```bash
# Inicia o bot
npm start

# Ou em modo dev (reinicia ao salvar)
npm run dev
```

4. **Escaneie o QR Code** que aparecerá no terminal com seu WhatsApp
5. Pronto! O bot está funcionando 🎉

## 🛠️ Administração

Para gerenciar perguntas e configurações via terminal:

```bash
node src/admin.js
```

Opções disponíveis:
- Listar perguntas cadastradas
- Adicionar novas perguntas
- Ver estatísticas
- Alterar limiar de confiança
- Testar matching
- Ver histórico

## 📁 Estrutura

```
zap-bot/
├── src/
│   ├── index.js      # Bot principal
│   ├── admin.js      # CLI de administração
│   ├── database.js   # Conexão com Supabase
│   └── tokenizer.js  # Motor de IA (tokenização e matching)
├── sql/
│   ├── 001_create_tables.sql
│   ├── 002_seed_data.sql
│   └── 003_rls_policies.sql
├── session/          # Dados de sessão do WhatsApp (auto-gerado)
├── .env              # Suas credenciais (NÃO COMMITAR)
└── package.json
```

## ☁️ Hospedagem

**⚠️ NÃO FUNCIONA NA VERCEL** (é serverless)

### Opções recomendadas:

#### Railway (Recomendado)
1. Crie conta em [railway.app](https://railway.app)
2. New Project > Deploy from GitHub
3. Adicione as variáveis de ambiente
4. Deploy!

#### Render
1. Crie conta em [render.com](https://render.com)
2. New > Web Service
3. Conecte seu repositório
4. Configure as variáveis de ambiente

#### VPS (DigitalOcean, Vultr, etc)
```bash
# No servidor
git clone seu-repo
cd zap-bot
npm install
npm start
```

Use `pm2` para manter rodando:
```bash
npm install -g pm2
pm2 start src/index.js --name nutri-bot
pm2 save
pm2 startup
```

## 📝 Adicionando Novas Perguntas

### Via Terminal (admin.js)
```bash
node src/admin.js
# Escolha opção 2 - Adicionar pergunta
```

### Via Supabase Dashboard
1. Abra seu projeto no Supabase
2. Vá em Table Editor > perguntas_respostas
3. Clique em "Insert row"
4. Preencha:
   - `pergunta`: texto da pergunta
   - `tokens`: array de tokens (ex: `{"diet","emagr","pes"}`)
   - `resposta`: resposta completa
   - `categoria`: categoria (agendamento, precos, dieta, etc)

### Gerar tokens automaticamente
Use a CLI ou o tokenizer:
```javascript
const { tokenizar } = require('./src/tokenizer');
console.log(tokenizar("Como faço para agendar consulta?"));
// ['agend', 'consult']
```

## ⚙️ Configurações

| Chave | Descrição | Padrão |
|-------|-----------|--------|
| `limiar_confianca` | Mínimo para enviar resposta (0-1) | 0.3 |
| `mensagem_padrao` | Quando não encontra match | "Desculpe..." |
| `mensagem_boas_vindas` | Primeira mensagem de um contato | "Olá! 👋..." |

## 🤖 Como o Matching Funciona

1. **Tokenização**: "Qual o valor da consulta?" → `["valor", "consult"]`
2. **Stemming**: Reduz palavras à raiz (consulta → consult)
3. **Stop words**: Remove palavras comuns (o, da, qual)
4. **Similaridade**: Calcula Jaccard + % de match
5. **Decisão**: Se >= limiar, envia resposta específica

## 📞 Suporte

Problemas? Verifique:
1. Credenciais do Supabase estão corretas no `.env`
2. Tabelas foram criadas no Supabase
3. Node.js versão >= 18
4. Dependências instaladas (`npm install`)
