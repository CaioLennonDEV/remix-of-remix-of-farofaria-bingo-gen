const SESSION_KEY = 'votacao_sessao_id';

export function obterSessaoId(): string {
  let sessaoId = localStorage.getItem(SESSION_KEY);
  
  if (!sessaoId) {
    sessaoId = `sessao_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sessaoId);
  }
  
  return sessaoId;
}

export function limparSessao(): void {
  localStorage.removeItem(SESSION_KEY);
}

