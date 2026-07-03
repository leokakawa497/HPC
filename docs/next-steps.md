# HPC — Próximos Passos

## Status atual (2026-07-03)

| Item | Status |
|---|---|
| PWA publicado no GitHub Pages | ✅ |
| Service worker + cache offline | ✅ (`hpc-cache-v17`) |
| Dados reais importados (2023–2026) | ✅ (`assets/real-data.js`) |
| Supabase client no front-end | ✅ (`assets/supabase-config.js`) |
| Login email/senha + magic link | ✅ |
| `profiles` criado automaticamente no login | ✅ |
| `supabase/schema.sql` aplicado no Dashboard | ✅ |
| Tela de migração completa (6 fases) | ✅ |
| Sync badge (dot no botão Entrar) | ✅ |
| Onboarding modal | ✅ |
| Sync automático (sono + hábitos + treinos) | ✅ (incremental, offline queue, 4 estados) |
| Feed social (grupos, posts, likes, comentários) | ✅ (tab Grupo) |
| Carregar dados da nuvem | ✅ (botão no modal de auth, com backup + preview) |
| Feed social migration SQL | ⚠️ Pendente rodar no Dashboard (`supabase/feed-social-migration.sql`) |
| Beta fechado | ❌ (próxima fase) |

---

## Pendências obrigatórias antes de convidar usuários

### 1. Reativar projeto Supabase (free tier pausa após inatividade)
- Acesse supabase.com → projeto HPC → ele reativa ao abrir

### 2. Rodar migration do feed social
- SQL Editor → New query → colar conteúdo de `supabase/feed-social-migration.sql` → Run
- Isso atualiza a policy de `profiles` para que nomes de membros apareçam nos posts

---

## Como o "Carregar dados da nuvem" funciona

No modal de auth (botão "Entrar"), quando logado aparece:
- **Migrar dados para a nuvem →** — envia dados locais para Supabase
- **Carregar dados da nuvem ↓** — baixa dados do Supabase para localStorage (novo dispositivo)

O botão de carregar:
1. Consulta todas as tabelas do usuário
2. Mostra preview de contagens antes de qualquer escrita
3. Cria backup `hpc_v3_backup_before_cloud_load_<timestamp>`
4. Reconstrói o `hpc_v3` localmente (hábitos, dias, treinos + exercícios, sessões + sets)
5. Define `demo: false` e re-renderiza o app

---

## Próximas fases

### Fase 8 — Beta fechado
1. Criar grupo no app (tab Grupo → "criar →")
2. Compartilhar o invite_code com testadores
3. Testadores: baixar o app, criar conta, entrar com código
4. Monitorar erros no Supabase Dashboard → Logs

### Fase 9 — Melhorias de UX pós-beta
- Notificações push (PWA)
- Streak compartilhado no grupo
- Gráficos de progresso no feed
- Foto em posts (photo_url já existe no schema)

---

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Supabase free tier pausa | Acessar o projeto periodicamente ou upgrade para Pro |
| Conflito de dados entre dispositivos | Cloud load cria backup antes de sobrescrever |
| Dados demo em browsers antigos | Campo `demo: true` marca dados de exemplo; cloud load limpa |
| Rate limit de email no Supabase | Usar "Add user" no Dashboard durante testes |
| localStorage apagado por erro | `salvar()` preserva sempre; backup criado antes de cloud load |
