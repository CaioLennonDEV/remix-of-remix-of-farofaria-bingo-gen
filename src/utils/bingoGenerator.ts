// ==== CONFIGURAÇÕES ====
export const NUM_CARTELAS = 70;
export const LINHAS = 5;
export const TITULO = "NATAL";

// Definição das colunas com suas faixas de números
export const BLOCOS = [
  { letra: "N", inicio: 1, fim: 15 },
  { letra: "A", inicio: 16, fim: 30 },
  { letra: "T", inicio: 31, fim: 45 },
  { letra: "A", inicio: 46, fim: 60 },
  { letra: "L", inicio: 61, fim: 75 },
] as const;

export const COLUNAS = BLOCOS.length;

// Lista de todos os números que podem ser sorteados
export const TODOS_NUMEROS = Array.from({ length: 75 }, (_, i) => i + 1);

export interface Participante {
  nome: string;
  avatar?: string;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==== GERAR UMA CARTELA (respeitando faixas por coluna) ====
export interface Cartela {
  id: number;
  numeros: number[][]; // 5 colunas x 5 linhas
}

export function gerarCartela(numero: number): Cartela {
  const numeros: number[][] = [];
  
  for (const bloco of BLOCOS) {
    const faixa = Array.from(
      { length: bloco.fim - bloco.inicio + 1 },
      (_, i) => bloco.inicio + i
    );
    
    const escolhidos = shuffleArray(faixa).slice(0, LINHAS);
    escolhidos.sort((a, b) => a - b);
    numeros.push(escolhidos);
  }
  
  return {
    id: numero,
    numeros,
  };
}

// Gera uma cor de fundo única para cada número
export function getCorParaNumero(numero: number): string {
  const cores = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#F67280',
    '#C06C84', '#6C5B7B', '#355C7D', '#99B898', '#FECEAB',
    '#FF847C', '#E84A5F', '#2A363B', '#A8E6CE', '#DCEDC2'
  ];
  
  return cores[numero % cores.length];
}

// Obtém a letra do bloco (N, A, T, A, L) para um número
export function getLetraDoNumero(numero: number): string {
  const bloco = BLOCOS.find(bloco => numero >= bloco.inicio && numero <= bloco.fim);
  return bloco?.letra || "";
}

export function gerarTodasCartelas(): Cartela[] {
  return Array.from({ length: NUM_CARTELAS }, (_, i) => gerarCartela(i + 1));
}

// Verifica se uma coluna específica (por índice) está completa
export function verificarColunaCompleta(cartela: Cartela, colunaIndex: number, sorteados: Set<number>): boolean {
  if (colunaIndex < 0 || colunaIndex >= cartela.numeros.length) return false;
  const numerosColuna = cartela.numeros[colunaIndex];
  return numerosColuna.every(num => sorteados.has(num));
}

// Verifica se a cartela completa está completa (bingo completo)
export function verificarBingoCompleto(cartela: Cartela, sorteados: Set<number>): boolean {
  return cartela.numeros.every(coluna => 
    coluna.every(num => sorteados.has(num))
  );
}

// Retorna o índice da coluna para uma letra específica (considerando as duas A's)
export function getColunaIndexPorLetra(letra: string, colunaIndex?: number): number {
  if (letra === 'A') {
    return colunaIndex === 4 ? 4 : 1;
  }
  const blocoIndex = BLOCOS.findIndex(b => b.letra === letra);
  return blocoIndex >= 0 ? blocoIndex : -1;
}

// Retorna o nome da categoria (letra) para uma coluna específica
export function getNomeCategoriaPorColuna(colunaIndex: number): string {
  if (colunaIndex === 1) return 'A (1ª)';
  if (colunaIndex === 4) return 'A (2ª)';
  return BLOCOS[colunaIndex]?.letra || '';
}
