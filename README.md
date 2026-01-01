# Web Bot

Bot de WhatsApp com perguntas/respostas por tokens e integração com Supabase.

## Comandos úteis

- `npm run start` — iniciar o bot
- `npm run dev` — iniciar em modo desenvolvimento (nodemon)
- `npm run generate:questions` — gerar dataset sintético (~1000 perguntas) em `data/questions.json` e `sql/004_expand_questions.sql`
- `npm run seed:many` — aplicar o seed em massa no Supabase (usa `SUPABASE_SERVICE_KEY` do `.env`)

---

## Seeds e expansão do repertório (⚠️ atenção: RLS)

1. Garanta que seu `.env` contenha `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (preferencialmente a *Service Role Key* para operações em massa).
2. Para gerar as perguntas sintéticas:
   - `npm run generate:questions` (gera `data/questions.json` e `sql/004_expand_questions.sql`)
3. Para inserir no banco:
   - `npm run seed:many` (insere apenas novas perguntas, evitando duplicatas)

Se houver erro `42501` (permission denied), providencie a Service Role Key ou ajuste as policies RLS nas tabelas `perguntas_respostas` e `historico`.

---

## Notas técnicas

- O bot responde localmente a saudações básicas (ex.: "oi", "olá") mesmo se as configs estiverem ausentes.
- Adicionei fallbacks para contornar mudanças internas do WhatsApp Web que causavam `TypeError` em `getIsMyContact`.

