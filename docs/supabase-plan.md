# HPC Supabase Plan

Este plano prepara o banco para a fase online sem mudar o comportamento atual do app. O HPC continua local-first: os dados seguem no `localStorage` até a migração/sync ser implementada.

## Mapeamento do localStorage

O app salva tudo na chave `hpc_v3`.

| localStorage | Supabase | Observação |
| --- | --- | --- |
| `dias[iso].sono.dormiu` / `acordou` | `daily_logs.slept_at` / `woke_at` | Datas continuam ISO internamente. |
| `dias[iso].nota` | `daily_logs.note` | Notes antigas podem migrar depois; a importação real da planilha ignorou notes. |
| `dias[iso].habitos[habitId]` | `daily_habit_entries` | `feito` vira `done`; `detalhe` vira `detail`. |
| `habitos[]` | `habits` | `id` local vira `local_id`; nome/tipo/ícone ficam preservados. |
| `treinos[]` | `workout_programs` e `workout_exercises` | Cada treino vira programa; exercícios preservam ordem e séries alvo. |
| `sessoes[]` | `workout_sessions` e `workout_sets` | PRs ficam em `prs` JSON e sets ficam linha a linha. |
| `feed[]` | `feed_posts`, `post_likes`, `post_comments` | Feed real/social depende de login e grupos. |
| `badges`, `xp` | Futuro: `profiles` ou tabela própria | Não foi criada tabela separada ainda para evitar overbuild. |
| `meta.realDataVersion` | Controle local | Serve para distinguir dados reais importados dos dados demo. |

## Ordem recomendada de migração

1. Aplicar `supabase/schema.sql` no SQL Editor do Supabase.
2. Confirmar que login cria/atualiza `profiles`.
3. Implementar export localStorage -> Supabase em modo manual, com preview.
4. Migrar primeiro `habits` e `daily_logs`.
5. Migrar `daily_habit_entries`.
6. Migrar `workout_programs`, `workout_exercises`, `workout_sessions` e `workout_sets`.
7. Só depois ligar sync automático com resolução de conflitos.
8. Por último, transformar feed local em feed social real com grupos.

## Riscos

- O `localStorage` não tem controle de conflito entre dispositivos; sync automático precisa de regra clara para empates.
- Dados demo antigos podem existir em browsers já usados. O app agora marca demo com `source: "demo"` e real com `source: "real"` para permitir limpeza futura.
- A planilha real foi importada apenas nos campos compatíveis: sono, BJJ, academia, corrida/cardio, fisio, pilates, sauna e SUP. Notes e campos ambíguos ficaram fora.
- Antes de ativar sync, é importante ter uma tela de revisão para o usuário confirmar a primeira migração.
- Grupos e feed social precisam de testes fortes de RLS para não expor posts de outro grupo.

## Features que dependem de login

- Sync entre dispositivos.
- Backup na nuvem.
- Feed social real.
- Likes e comentários multiusuário.
- Grupos, convites e membros.
- Perfil público/privado.
- Migração controlada do `localStorage` para Supabase.

## Estado atual

- Supabase Auth está preparado no app com email/senha e magic link.
- O usuário logado aparece no topo.
- `profiles` é criado/atualizado automaticamente quando o schema já existe.
- Nenhum dado de treino, hábito, sono ou feed é sincronizado ainda.
- `localStorage` não é apagado nem convertido.
