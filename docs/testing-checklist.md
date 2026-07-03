# HPC — Checklist de Testes Manuais

Execute este checklist após qualquer deploy ou mudança significativa.
App publicado: https://leokakawa497.github.io/HPC/

---

## 1. PWA publicado

- [ ] Acessar https://leokakawa497.github.io/HPC/ no Chrome/Safari
- [ ] Página carrega sem erro (F12 → Console sem erros vermelhos)
- [ ] Logo HPC aparece no header
- [ ] Navegação entre abas (Hoje / Treino / Grupo / Stats) funciona
- [ ] HPC Score aparece no anel da tela principal

## 2. Instalação no celular

- [ ] Chrome Android: banner "Adicionar à tela inicial" aparece (ou Menu → Instalar app)
- [ ] Safari iOS: Compartilhar → Adicionar à Tela de Início
- [ ] App abre em fullscreen sem barra do browser
- [ ] Ícone HPC aparece na tela inicial do celular
- [ ] Splash screen carrega antes do app

## 3. Cache / Offline

- [ ] Com o app aberto, desativar Wi-Fi/dados
- [ ] Recarregar a página — app continua funcionando offline
- [ ] Dados do dia continuam visíveis offline
- [ ] Após reconectar, app volta ao normal sem recarregar
- [ ] No DevTools → Application → Cache Storage: confirmar `hpc-cache-v9`

## 4. localStorage

- [ ] DevTools → Application → Local Storage → `hpc_v3` existe
- [ ] Registrar sono → recarregar página → dado persiste
- [ ] Marcar hábito → recarregar → dado persiste
- [ ] `window.hpcDiagnostics.run()` no console retorna contagens corretas
- [ ] `window.hpcDiagnostics.checkLocalStorage()` retorna `true`

## 5. Dados reais

- [ ] Na aba Hoje, navegar para datas de 2023/2024 → dados de sono/hábitos aparecem
- [ ] Stats → gráficos mostram histórico real
- [ ] Sem banner "Modo demonstração" visível (dados reais carregados)
- [ ] `window.hpcDiagnostics.counts().dias` > 300 (dados reais têm +900 dias)

## 6. Login / Logout

- [ ] Clicar em "Entrar" no header → modal abre
- [ ] Inserir email e senha → clicar "Entrar" → toast "Login realizado ✓"
- [ ] Header mostra email do usuário com borda teal
- [ ] Modal de auth mostra "Login ativo..." e botão "Migrar dados para a nuvem →"
- [ ] Clicar "Sair" → header volta para "Entrar"
- [ ] Após logout, app continua funcionando normalmente com dados locais
- [ ] `window.hpcDiagnostics.authActive()` retorna `true` quando logado

## 7. Tela de migração

- [ ] Fazer login → abrir modal de auth → clicar "Migrar dados para a nuvem →"
- [ ] Modal de migração abre com preview de contagens
- [ ] Contagens de dias/hábitos/treinos/sessões/feed aparecem corretamente
- [ ] Clicar "Cancelar" → modal fecha, nenhum dado alterado
- [ ] (Com schema aplicado) Clicar "Confirmar migração" → status atualiza progressivamente
- [ ] Após migração: localStorage **não** foi apagado
- [ ] Após migração: verificar no Supabase Dashboard → Table Editor → `habits` e `daily_logs`

## 8. Treinos

- [ ] Aba Treino carrega lista de programas
- [ ] Clicar em programa → exercícios aparecem com sets
- [ ] Iniciar sessão → registrar peso/reps → marcar set como feito
- [ ] Encerrar sessão → aparece na aba Treino como histórico
- [ ] Timer de descanso funciona ao marcar set
- [ ] PR é detectado e exibido com badge âmbar

## 9. Sono / Hábitos

- [ ] Campos "Dormiu" e "Acordou" aceitam horário
- [ ] Após salvar horário, badge de sono mostra duração calculada
- [ ] Cor do badge muda conforme qualidade (verde/amarelo/vermelho)
- [ ] Marcar hábito tipo "check" → chip fica com borda teal
- [ ] Hábito tipo "text" → campo de detalhe aparece
- [ ] Streak de hábito incrementa ao marcar dias consecutivos
- [ ] Navegar para dia passado → editar sono → dado salvo corretamente

## 10. Feed local

- [ ] Aba Grupo carrega posts do feed local
- [ ] Posts mostram título, stats e data
- [ ] Curtir post → ícone ativo
- [ ] Comentar → comentário aparece

## 11. Stats

- [ ] Aba Stats carrega sem erro
- [ ] Grid de métricas (sono médio, XP, streak, treinos) com valores corretos
- [ ] Gráfico de barras de treinos renderiza
- [ ] Badges mostram conquistados vs bloqueados
- [ ] Histórico mensal: navegar meses anterior/próximo funciona
- [ ] Tabela de histórico mostra dados corretos por linha

---

## Diagnóstico rápido no console

```javascript
// Rodar no DevTools → Console do app publicado
window.hpcDiagnostics.run()
```

Resultado esperado:
```
HPC Diagnostics
  Cache version: hpc-cache-v9
  localStorage hpc_v3: ✓ presente
  Supabase client: ✓ pronto
  Auth user: ✓ logado  (ou ✗ não logado se não logado)
  Contagens locais: { dias: 900+, diasComSono: ..., habitos: 7, ... }
```

---

## O que NÃO deve acontecer

- ❌ Console com erros vermelhos não relacionados a rede
- ❌ `hpc_v3` ausente do localStorage após uso normal
- ❌ Dados somem ao recarregar
- ❌ App não carrega offline depois de ter sido visitado online
- ❌ Login apaga dados locais
- ❌ Migração apaga localStorage
- ❌ `service_role`, senha Postgres ou token privado visível em qualquer arquivo
