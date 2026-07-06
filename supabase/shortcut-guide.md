# HPC Sync — Atalho iPhone

Lê peso, passos e FC do Apple Health e manda pro HPC automaticamente.
Roda uma vez por dia sem precisar abrir o app.

---

## Antes de começar

1. Abre o **HPC** no celular ou navegador → **Profile** → **Apple Health**
2. Toca em **Gerar token**
3. Copia a **URL** e o **Token** — você vai precisar dos dois aqui

---

## Criar o Atalho

Abre o app **Atalhos** no iPhone (já vem instalado, ícone colorido).

Toca em **+** no canto superior direito.
Toca em **"Novo Atalho"** no topo e digita o nome: **HPC Sync**

---

### Ação 1 — Data de hoje

Busca por: **Formatar Data**

- Data: `Data Atual`
- Formato: Personalizado → digita: `yyyy-MM-dd`
- Toca em **"Adicionar à variável"** → nome: **HOJE**

---

### Ação 2 — Peso

Busca por: **Encontrar Amostras de Saúde**

- Tipo: **Massa Corporal**
- Ordenar por: Data de Início, Decrescente
- Limite: **1**

---

### Ação 3 — Salvar peso

Busca por: **Obter Detalhes da Amostra de Saúde**

- Detalhe: **Valor** (em kg)
- Toca em **"Adicionar à variável"** → nome: **PESO**

---

### Ação 4 — Passos

Busca por: **Encontrar Amostras de Saúde**

- Tipo: **Contagem de Passos**
- Filtro: Data de Início **é hoje**
- Agregar: **Soma**
- Toca em **"Adicionar à variável"** → nome: **PASSOS**

---

### Ação 5 — Frequência cardíaca

Busca por: **Encontrar Amostras de Saúde**

- Tipo: **Frequência Cardíaca em Repouso**
- Ordenar por: Data de Início, Decrescente
- Limite: **1**

---

### Ação 6 — Salvar FC

Busca por: **Obter Detalhes da Amostra de Saúde**

- Detalhe: **Valor** (em bpm)
- Toca em **"Adicionar à variável"** → nome: **FC**

---

### Ação 7 — Enviar para o HPC

Busca por: **Obter Conteúdo da URL**

Preenche assim:

- **URL:** cole aqui a URL que você copiou do HPC
- **Método:** POST
- **Cabeçalhos:**
  - Chave: `Authorization` → Valor: `Bearer SEU_TOKEN` *(troca SEU_TOKEN pelo token copiado do HPC)*
  - Chave: `Content-Type` → Valor: `application/json`
- **Corpo:** JSON
  - `data` → Dicionário com chave `metrics` → Lista com 3 itens:

**Item 1 (peso):**
```
name    → body_mass
units   → kg
data    → Lista com 1 item:
    date  → [variável HOJE]
    qty   → [variável PESO]
```

**Item 2 (passos):**
```
name    → step_count
units   → count
data    → Lista com 1 item:
    date  → [variável HOJE]
    qty   → [variável PASSOS]
```

**Item 3 (FC):**
```
name    → resting_heart_rate
units   → count/min
data    → Lista com 1 item:
    date  → [variável HOJE]
    qty   → [variável FC]
```

---

### Ação 8 — Notificação

Busca por: **Mostrar Notificação**

- Título: `HPC Sync`
- Corpo: `Dados enviados para [variável HOJE]`

---

## Testar

Toca em **▶** (play) no canto inferior direito.
Na primeira vez o iPhone pede permissão para acessar o Apple Health — aceita tudo.

Se aparecer a notificação **"Dados enviados"**, funcionou.

Para confirmar: abre o HPC → Profile → Apple Health → o status muda para **Conectado** com a hora do último sync.

---

## Automatizar — rodar todo dia às 08:00

1. Na tela principal do app **Atalhos**, toca em **Automação**
2. Toca em **+** → **Hora do Dia**
3. Coloca **08:00**, todos os dias
4. Ação: **Executar Atalho** → HPC Sync
5. Desativa **"Perguntar antes de executar"**

Pronto. A partir daí o HPC vai mostrar peso, passos e FC reais todo dia.

---

## Sono — Fase 2

O sono no Apple Health vem fragmentado em várias amostras (Huawei + iPhone às vezes duplicam).
Para não mostrar dado errado, sono vai ser adicionado em uma próxima versão do Atalho.
