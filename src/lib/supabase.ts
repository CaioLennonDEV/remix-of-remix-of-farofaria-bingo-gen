import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ieynsfsshdceasxgxabi.supabase.co';

// IMPORTANTE: A chave anon do Supabase deve começar com "eyJ" (é um JWT)
// Se você copiou uma chave com prefixo "sb_publishable_", essa NÃO é a chave anon correta
// Acesse: Supabase Dashboard > Settings > API > anon/public key
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'IjIBaRiGLFPKiMc4Iui-Mg_78tI6JHu';

// Remover prefixo se existir (não deveria existir, mas por segurança)
if (supabaseAnonKey.startsWith('sb_publishable_')) {
  console.warn('⚠️ A chave parece ter um prefixo incorreto. Removendo...');
  supabaseAnonKey = supabaseAnonKey.replace('sb_publishable_', '');
}

// Verificar se a chave parece válida (deve começar com "eyJ" para JWT)
if (!supabaseAnonKey.startsWith('eyJ')) {
  const errorMsg = `
❌ ERRO CRÍTICO: Chave API inválida!

A chave anon do Supabase deve:
- Começar com "eyJ" (é um JWT)
- Ter aproximadamente 200+ caracteres
- Estar no formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Chave atual (primeiros 30 chars): ${supabaseAnonKey.substring(0, 30)}...

📋 COMO OBTER A CHAVE CORRETA:
1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a chave "anon public" (não a service_role)
5. A chave deve começar com "eyJ" e ser muito longa

⚠️ A chave que você forneceu parece ser incorreta ou incompleta.

📄 Veja o guia completo em: docs/COMO_OBTER_CHAVE_SUPABASE.md
`;
  console.error(errorMsg);
}

// Debug: verificar se as variáveis estão corretas (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Supabase Key (primeiros 30 chars):', supabaseAnonKey.substring(0, 30) + '...');
  console.log('✅ Chave válida?', supabaseAnonKey.startsWith('eyJ') ? 'Sim' : 'NÃO - VERIFIQUE A CHAVE!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

