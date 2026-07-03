# High Performance Club

PWA local-first do High Performance Club.

## Estrutura

- `index.html`: app atual, mantido em arquivo unico para preservar o comportamento.
- `manifest.json`: configuracao de instalacao da PWA.
- `service-worker.js`: cache offline e controle de atualizacoes.
- `assets/`: logo, icones, bundle Supabase e dados reais importados.
- `supabase/schema.sql`: schema preparado para a fase online.
- `docs/supabase-plan.md`: plano de migracao do localStorage para Supabase.
- `.nojekyll`: evita processamento do GitHub Pages.

## Deploy no GitHub Pages

1. Publique estes arquivos na raiz do repositorio.
2. No GitHub, abra `Settings > Pages`.
3. Em `Build and deployment`, selecione `Deploy from a branch`.
4. Escolha a branch principal e a pasta `/root`.
5. Aguarde o GitHub gerar a URL.

## Publicar uma nova versao

Ao alterar `index.html`, `manifest.json`, `service-worker.js` ou arquivos em `assets/`:

1. Atualize o app normalmente.
2. Abra `service-worker.js`.
3. Troque `CACHE_VERSION` para o proximo numero:
   - atual: `hpc-cache-v8`
   - proxima: `hpc-cache-v9`
4. Publique no GitHub Pages.

O service worker apaga caches antigos no evento `activate`, entao os usuarios nao devem ficar presos em arquivos antigos.

## Dados dos usuarios

Os dados atuais ficam em `localStorage`. O service worker nao limpa nem altera esses dados.

Antes de mudancas maiores, recomende que usuarios usem o backup/export do app.

Os dados reais importados da planilha ficam marcados com `source: "real"` e `meta.realDataVersion`. Dados de demonstracao ficam marcados com `source: "demo"`, para permitir limpeza futura sem apagar registros reais.

## Supabase

Projeto Supabase:

- Project ref: `xlctlkayvthgdwsnkwej`
- URL: `https://xlctlkayvthgdwsnkwej.supabase.co`

Use `.env.example` como referencia. Nao salve senha do banco, service role key ou token pessoal no repositorio.

O app atual e estatico, entao a conexao do navegador fica em `assets/supabase-config.js` e e inicializada em `index.html`.

Login com Supabase Auth ja esta preparado, mas dados de treino, sono, habitos e feed continuam em `localStorage`. Sync entre dispositivos e feed social real entram nas proximas etapas.
