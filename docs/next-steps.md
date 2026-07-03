# HPC — Próximos Passos

## Status atual (2026-07-03)

| Item | Status |
|---|---|
| PWA publicado no GitHub Pages | ✅ |
| Service worker + cache offline | ✅ (`hpc-cache-v9`) |
| Dados reais importados (2023–2026) | ✅ (`assets/real-data.js`) |
| Supabase client no front-end | ✅ (`assets/supabase-config.js`) |
| Login email/senha + magic link | ✅ (funcional) |
| `profiles` criado automaticamente no login | ✅ |
| `supabase/schema.sql` aplicado no Dashboard | ✅ |
| Tela de migração localStorage → Supabase (fase 1) | ✅ (hábitos + sono) |
| `window.hpcDiagnostics` utilitário | ✅ |
| Sync automático | ❌ (não implementado — aguarda aprovação) |
| Migração de treinos/sessões/feed | ❌ (fase futura) |

---

## O que já foi feito

1. App publicado como PWA com cache offline completo.
2. Dados reais de 2023–2026 importados via `assets/real-data.js`.
3. Supabase Auth configurado (email/senha e magic link).
4. Schema SQL com 13 tabelas, indexes e RLS aplicado no Supabase Dashboard.
5. `profiles` é criado/atualizado automaticamente ao fazer login.
6. Tela de migração (fase 1) implementada: hábitos e registros de sono.
7. `window.hpcDiagnostics` disponível no console do browser.

---

## Como aplicar `supabase/schema.sql` no SQL Editor (se ainda não foi feito)

1. Acesse **supabase.com** → faça login → abra o projeto HPC
2. Menu lateral → **SQL Editor**
3. Clique em **New query**
4. Abra `supabase/schema.sql`, copie todo o conteúdo (`Ctrl+A`, `Ctrl+C`)
5. Cole no SQL Editor (`Ctrl+V`)
6. Clique em **Run** (ou `Ctrl+Enter`)
7. Resultado esperado: `Success. No rows returned.`

O script é idempotente — pode rodar várias vezes sem erro.

---

## Checklist pós-aplicação do schema

- [ ] No Dashboard → **Table Editor**, confirmar que as 13 tabelas existem:
  - `profiles`, `daily_logs`, `habits`, `daily_habit_entries`
  - `workout_programs`, `workout_exercises`, `workout_sessions`, `workout_sets`
  - `groups`, `group_members`, `feed_posts`, `post_likes`, `post_comments`
- [ ] Fazer login no app → verificar que `profiles` recebe uma linha com `id` e `email`
- [ ] Abrir **Authentication → Users** e confirmar que o usuário aparece
- [ ] Testar `window.hpcDiagnostics.run()` no console do browser

---

## Ordem correta das próximas fases

### Fase 2 — Testar login e profile (prioridade imediata)
1. Criar usuário no Dashboard → **Authentication → Users → Add user**
2. Fazer login no app com as credenciais criadas
3. Confirmar linha em `profiles` no Table Editor
4. Testar `window.hpcDiagnostics.run()` no console

### Fase 3 — Migração manual (hábitos + sono)
1. Estando logado, abrir modal de login → clicar "Migrar dados para a nuvem →"
2. Revisar preview de dados
3. Confirmar migração
4. Verificar no Dashboard → Table Editor → `habits` e `daily_logs`

### Fase 4 — Migração de entradas de hábitos
- Implementar upsert de `daily_habit_entries` na tela de migração (fase 2 da migração)

### Fase 5 — Migração de treinos
- `workout_programs` → `workout_exercises` → `workout_sessions` → `workout_sets`

### Fase 6 — Sync automático (requer aprovação explícita)
- Definir regra de conflito (last-write-wins ou manual)
- Implementar por módulo, um de cada vez
- Testar em dois dispositivos antes de ativar

### Fase 7 — Feed social real
- `feed_posts` com `visibility='group'`
- Grupos e convites
- Likes e comentários multiusuário
- Adicionar policy `profiles_select_group_member` (já planejada)

### Fase 8 — Beta fechado
- Convidar usuários de teste
- Monitorar erros no Dashboard → Logs

---

## Riscos conhecidos

| Risco | Mitigação |
|---|---|
| Conflito de dados entre dispositivos no sync | Não implementar sync sem regra de conflito definida |
| Dados demo em browsers antigos | Campo `source: "demo"` marca dados de exemplo |
| Rate limit de email no Supabase | Usar "Add user" no Dashboard em vez de signup pelo app durante testes |
| localStorage apagado por erro | `salvar()` sempre preserva; nunca chamar `removeItem(DB_KEY)` |
