# Como Obter a Chave Anon do Supabase

## ⚠️ Problema Atual

Você está recebendo o erro **"Invalid API key"** porque a chave que está sendo usada não é válida.

A chave atual (`IjIBaRiGLFPKiMc4Iui-...`) **não é uma chave anon válida** do Supabase.

## ✅ Solução: Obter a Chave Correta

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **ieynsfsshdceasxgxabi**

### Passo 2: Encontrar a Chave Anon

1. No menu lateral, clique em **Settings** (⚙️)
2. Clique em **API**
3. Na seção **Project API keys**, você verá:
   - **anon public** - Esta é a chave que você precisa!
   - **service_role** - NÃO use esta (é secreta)

### Passo 3: Verificar a Chave

A chave anon correta deve:
- ✅ Começar com `eyJ` (é um JWT)
- ✅ Ter aproximadamente **200+ caracteres**
- ✅ Estar no formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...`

**Exemplo de chave válida:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleW5zZnNzaGRjZWFzeGd4YWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIzNDU2NzgsImV4cCI6MjAyNzk0MTY3OH0.abc123def456...
```

### Passo 4: Configurar no Projeto

1. Crie um arquivo `.env.local` na **raiz do projeto** (mesmo nível do `package.json`)

2. Adicione as seguintes linhas:

```env
VITE_SUPABASE_URL=https://ieynsfsshdceasxgxabi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sua_chave_completa_aqui
```

**⚠️ IMPORTANTE:**
- Substitua `sua_chave_completa_aqui` pela chave anon que você copiou
- A chave deve começar com `eyJ`
- Não adicione aspas ou espaços extras

### Passo 5: Reiniciar o Servidor

Após criar o arquivo `.env.local`:

1. Pare o servidor de desenvolvimento (Ctrl+C)
2. Inicie novamente: `npm run dev` ou `yarn dev`
3. Acesse `/seed` e tente popular os dados novamente

## 🔍 Verificação

Após configurar, você deve ver no console do navegador:

```
🔗 Supabase URL: https://ieynsfsshdceasxgxabi.supabase.co
🔑 Supabase Key (primeiros 30 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6...
✅ Chave válida? Sim
```

Se aparecer "Chave válida? NÃO", verifique novamente os passos acima.

## ❌ Erros Comuns

1. **Usar a chave service_role**: Esta é secreta e não deve ser usada no frontend
2. **Chave incompleta**: Certifique-se de copiar a chave completa (200+ caracteres)
3. **Chave com prefixo**: A chave não deve ter prefixos como `sb_publishable_`
4. **Não reiniciar o servidor**: Sempre reinicie após criar/modificar `.env.local`

## 📝 Nota

O arquivo `.env.local` está no `.gitignore` e não será commitado no Git, mantendo suas credenciais seguras.

