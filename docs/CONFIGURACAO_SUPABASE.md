# Configuração do Supabase

## Erro: Invalid API key (401 Unauthorized)

Se você está recebendo o erro "Invalid API key", siga estes passos:

### 1. Verificar a Chave Anon no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a chave **anon/public** (não a service_role)
5. A chave deve começar com `eyJ...` (não deve ter prefixo `sb_publishable_`)

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://ieynsfsshdceasxgxabi.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Importante:** 
- A chave anon do Supabase NÃO deve ter o prefixo `sb_publishable_`
- Se você copiou uma chave com esse prefixo, remova-o antes de usar
- A chave deve começar com `eyJ...`

### 3. Executar o Schema SQL

Antes de usar o sistema, você precisa criar as tabelas no Supabase:

1. Acesse o SQL Editor no Supabase
2. Execute o conteúdo do arquivo `docs/schema-votacao.sql`
3. Isso criará as tabelas e políticas RLS necessárias

### 4. Verificar Políticas RLS

Após executar o schema, verifique se as políticas RLS estão ativas:

- `categorias_votacao`: SELECT público, INSERT/UPDATE apenas com service_role
- `participantes_votacao`: SELECT público, INSERT/UPDATE apenas com service_role  
- `votos`: SELECT e INSERT públicos

### 5. Testar a Conexão

Após configurar, acesse `/seed` e tente popular os dados iniciais.

Se ainda houver erro, verifique:
- Se as tabelas foram criadas corretamente
- Se as políticas RLS permitem as operações necessárias
- Se a chave anon está correta (sem prefixos)

