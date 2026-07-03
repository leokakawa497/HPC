# HPC — Agent Instructions

Você é o agente principal do projeto High Performance Club.

## Objetivo do projeto
Transformar o HPC em um PWA local-first com login Supabase, sync seguro, feed social, grupos e insights de performance, sem quebrar a versão publicada.

## Status atual
- App publicado em GitHub Pages: https://leokakawa497.github.io/HPC/
- Repo: https://github.com/leokakawa497/HPC
- App é HTML/CSS/JS puro.
- PWA está funcionando.
- Dados atuais ficam em localStorage.
- Dados reais existem em assets/real-data.js.
- Supabase client está preparado.
- Login Supabase está preparado.
- Schema SQL existe.
- Sync automático ainda não deve ser implementado sem aprovação.
- Cache atual está em hpc-cache-v8 ou superior.

## Regras de segurança
- Nunca colocar no repositório:
  - service_role key
  - senha do Postgres
  - DATABASE_URL real
  - access token do GitHub
  - access token do Supabase
  - qualquer secret privado
- Publishable key do Supabase pode ficar no front-end.
- Antes de qualquer push, procurar por:
  - service_role
  - postgresql://
  - DATABASE_URL
  - sb_secret
  - password
  - access_token
  - SUPABASE_SERVICE_ROLE_KEY

## Regras de produto
- O app deve continuar funcionando sem login.
- localStorage nunca deve ser apagado automaticamente.
- Antes de migrar dados locais para Supabase, criar uma tela de revisão/migração.
- Não implementar sync automático sem confirmação explícita.
- Manter o app barato: GitHub Pages + Supabase Free enquanto possível.
- Priorizar PWA simples antes de app nativo.

## Regras de PWA
- Sempre que alterar index.html, manifest.json, service-worker.js ou assets/, incrementar CACHE_VERSION.
- Service worker deve apagar caches antigos no activate.
- index.html deve ter fallback offline.
- Preservar localStorage.
- Testar no navegador antes do commit quando possível.

## Workflow obrigatório
Para cada tarefa:
1. Explique o plano antes.
2. Faça mudanças pequenas.
3. Teste localmente quando possível.
4. Reporte arquivos alterados.
5. Reporte riscos.
6. Faça commit com mensagem clara.
7. Não faça push se houver risco de segredo ou perda de dados.

## Próximas fases
1. Validar app publicado.
2. Aplicar schema no Supabase.
3. Testar login/profile.
4. Criar tela de migração localStorage -> Supabase.
5. Implementar sync por módulo.
6. Criar feed social real.
7. Criar grupos.
8. Melhorar stats/insights.
9. Beta fechado.
10. Release final.
