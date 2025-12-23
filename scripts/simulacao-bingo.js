// Script de simulação de bingo - versão standalone
// Baseado no algoritmo de criação de cartelas e sorteio

// ==== CONFIGURAÇÕES ====
const NUM_CARTELAS = 70;
const LINHAS = 5;
const TITULO = "NATAL";

// Definição das colunas com suas faixas de números
const BLOCOS = [
  { letra: "N", inicio: 1, fim: 15 },
  { letra: "A", inicio: 16, fim: 30 },
  { letra: "T", inicio: 31, fim: 45 },
  { letra: "A", inicio: 46, fim: 60 },
  { letra: "L", inicio: 61, fim: 75 },
];

const COLUNAS = BLOCOS.length;

// Lista de todos os números que podem ser sorteados
const TODOS_NUMEROS = Array.from({ length: 75 }, (_, i) => i + 1);

// Função para embaralhar array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==== GERAR UMA CARTELA (respeitando faixas por coluna) ====
function gerarCartela(numero) {
  const numeros = [];
  
  // Para cada coluna (F, A, R, I, A)
  for (const bloco of BLOCOS) {
    const faixa = Array.from(
      { length: bloco.fim - bloco.inicio + 1 },
      (_, i) => bloco.inicio + i
    );
    
    // Escolhe 5 números aleatórios da faixa
    const escolhidos = shuffleArray(faixa).slice(0, LINHAS);
    
    // Ordena para ficar visualmente agradável
    escolhidos.sort((a, b) => a - b);
    
    numeros.push(escolhidos);
  }
  
  return {
    id: numero,
    numeros,
  };
}

// Verifica se uma coluna (letra) está completa
function verificarColunaCompleta(cartela, letra, sorteados) {
  const blocoIndex = BLOCOS.findIndex(b => b.letra === letra);
  if (blocoIndex === -1) return false;
  
  const numerosColuna = cartela.numeros[blocoIndex];
  return numerosColuna.every(num => sorteados.has(num));
}

// Verifica se a cartela completa está completa (bingo completo)
function verificarBingoCompleto(cartela, sorteados) {
  return cartela.numeros.every(coluna => 
    coluna.every(num => sorteados.has(num))
  );
}

// Simula desempate por pedra maior
// Retorna o ID da cartela vencedora após o desempate
function simularDesempate(cartelasEmpatadas) {
  if (cartelasEmpatadas.length <= 1) {
    return cartelasEmpatadas[0];
  }
  
  // Sortear números aleatórios (quantidade = número de empatados)
  const numerosDisponiveis = shuffleArray([...TODOS_NUMEROS]);
  const numerosDesempate = numerosDisponiveis.slice(0, cartelasEmpatadas.length);
  
  // Simular escolha sequencial (cada participante escolhe aleatoriamente entre os números disponíveis)
  const escolhas = new Map();
  const numerosEscolhidos = [];
  
  cartelasEmpatadas.forEach((cartelaId, index) => {
    // Números ainda disponíveis para escolha
    const disponiveis = numerosDesempate.filter(num => !numerosEscolhidos.includes(num));
    // Escolher aleatoriamente um número disponível
    const numeroEscolhido = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    escolhas.set(cartelaId, numeroEscolhido);
    numerosEscolhidos.push(numeroEscolhido);
  });
  
  // Determinar vencedor (maior número escolhido)
  let vencedor = cartelasEmpatadas[0];
  let maiorNumero = escolhas.get(vencedor);
  
  escolhas.forEach((numero, cartelaId) => {
    if (numero > maiorNumero) {
      maiorNumero = numero;
      vencedor = cartelaId;
    }
  });
  
  return vencedor;
}

// Executa uma simulação completa
function executarSimulacao(numSimulacao) {
  // Gerar 70 cartelas (máximo do programa)
  const cartelas = Array.from({ length: 70 }, (_, i) => gerarCartela(i + 1));
  
  // Embaralhar todos os números para simular o sorteio
  const numerosParaSortear = shuffleArray([...TODOS_NUMEROS]);
  
  const sorteados = new Set();
  const ganhadoresPorLetra = {};
  const ganhadoresBingoCompleto = { cartelas: [], numeroSorteio: -1 };
  
  // Inicializar ganhadores por letra (usando índice para diferenciar as duas A's)
  BLOCOS.forEach((bloco, index) => {
    // Usar índice para diferenciar as duas A's: "A (1ª)" e "A (2ª)"
    const chave = bloco.letra === 'A' && index === 4 ? 'A (2ª)' : `${bloco.letra}${index === 1 ? ' (1ª)' : ''}`;
    ganhadoresPorLetra[chave] = { cartelas: [], numeroSorteio: -1, colunaIndex: index };
  });
  
  // Simular sorteio número por número
  for (let i = 0; i < numerosParaSortear.length; i++) {
    const numero = numerosParaSortear[i];
    sorteados.add(numero);
    
    // Verificar cada letra (coluna) - usando índice para diferenciar
    BLOCOS.forEach((bloco, colunaIndex) => {
      // Criar chave única para cada coluna (diferenciando as duas A's)
      const chave = bloco.letra === 'A' && colunaIndex === 4 ? 'A (2ª)' : `${bloco.letra}${colunaIndex === 1 ? ' (1ª)' : ''}`;
      
      // Se ainda não há ganhador para esta coluna
      if (ganhadoresPorLetra[chave].numeroSorteio === -1) {
        const cartelasCompletas = [];
        cartelas.forEach(cartela => {
          // Verificar se a coluna específica está completa
          const numerosColuna = cartela.numeros[colunaIndex];
          if (numerosColuna.every(num => sorteados.has(num))) {
            cartelasCompletas.push(cartela.id);
          }
        });
        
        if (cartelasCompletas.length > 0) {
          // Se há empate, simular desempate
          const cartelaVencedora = cartelasCompletas.length === 1 
            ? cartelasCompletas[0] 
            : simularDesempate(cartelasCompletas);
          
          ganhadoresPorLetra[chave] = {
            cartelas: [cartelaVencedora], // Apenas o vencedor após desempate
            cartelasEmpatadas: cartelasCompletas.length > 1 ? cartelasCompletas : [],
            numeroSorteio: i + 1,
            colunaIndex: colunaIndex,
            teveEmpate: cartelasCompletas.length > 1
          };
        }
      }
    });
    
    // Verificar bingo completo
    if (ganhadoresBingoCompleto.numeroSorteio === -1) {
      const cartelasCompletas = [];
      cartelas.forEach(cartela => {
        if (verificarBingoCompleto(cartela, sorteados)) {
          cartelasCompletas.push(cartela.id);
        }
      });
      
      if (cartelasCompletas.length > 0) {
        // Se há empate, simular desempate
        const cartelaVencedora = cartelasCompletas.length === 1 
          ? cartelasCompletas[0] 
          : simularDesempate(cartelasCompletas);
        
        ganhadoresBingoCompleto.cartelas = [cartelaVencedora]; // Apenas o vencedor após desempate
        ganhadoresBingoCompleto.cartelasEmpatadas = cartelasCompletas.length > 1 ? cartelasCompletas : [];
        ganhadoresBingoCompleto.numeroSorteio = i + 1;
        ganhadoresBingoCompleto.teveEmpate = cartelasCompletas.length > 1;
      }
    }
  }
  
  // Calcular resumo (após desempate)
  const cartelasComPremio = new Set();
  const empatesPorLetra = {};
  let totalEmpatesResolvidos = 0;
  
  Object.keys(ganhadoresPorLetra).forEach(letra => {
    const ganhadores = ganhadoresPorLetra[letra];
    ganhadores.cartelas.forEach(id => cartelasComPremio.add(id));
    if (ganhadores.teveEmpate) {
      empatesPorLetra[letra] = ganhadores.cartelasEmpatadas.length;
      totalEmpatesResolvidos++;
    }
  });
  
  ganhadoresBingoCompleto.cartelas.forEach(id => cartelasComPremio.add(id));
  const empatesBingoCompleto = ganhadoresBingoCompleto.teveEmpate 
    ? ganhadoresBingoCompleto.cartelasEmpatadas.length 
    : 0;
  
  if (ganhadoresBingoCompleto.teveEmpate) {
    totalEmpatesResolvidos++;
  }
  
  const totalPremios = Object.keys(ganhadoresPorLetra).length + 1; // 5 colunas (F, A, R, I, A) + 1 bingo completo
  
  return {
    simulacao: numSimulacao,
    ganhadoresPorLetra,
    ganhadoresBingoCompleto,
    resumo: {
      totalCartelas: cartelas.length,
      cartelasComPremio,
      totalPremios,
      empatesPorLetra,
      empatesBingoCompleto,
      totalEmpatesResolvidos
    }
  };
}

// Executar 10 simulações
function executarTodasSimulacoes() {
  console.log('🎲 INICIANDO SIMULAÇÕES DE BINGO 🎲\n');
  console.log('='.repeat(80));
  
  const resultados = [];
  
  for (let i = 1; i <= 10; i++) {
    console.log(`\n📊 SIMULAÇÃO ${i}/10`);
    console.log('-'.repeat(80));
    
    const resultado = executarSimulacao(i);
    resultados.push(resultado);
    
    // Exibir resultados por letra (ordenando por índice da coluna)
    console.log('\n🏆 GANHADORES POR LETRA (F-A-R-I-A):');
    const chavesOrdenadas = Object.keys(resultado.ganhadoresPorLetra).sort((a, b) => {
      const indexA = resultado.ganhadoresPorLetra[a].colunaIndex;
      const indexB = resultado.ganhadoresPorLetra[b].colunaIndex;
      return indexA - indexB;
    });
    
    chavesOrdenadas.forEach(chave => {
      const ganhadores = resultado.ganhadoresPorLetra[chave];
      if (ganhadores.numeroSorteio !== -1) {
        const empateInfo = ganhadores.teveEmpate 
          ? ` (EMPATE RESOLVIDO: ${ganhadores.cartelasEmpatadas.join(', ')} → Vencedor: ${ganhadores.cartelas[0]})` 
          : '';
        console.log(`  ${chave}: Cartela ${ganhadores.cartelas[0]} - Sorteio #${ganhadores.numeroSorteio}${empateInfo}`);
      } else {
        console.log(`  ${chave}: Nenhum ganhador`);
      }
    });
    
    // Exibir ganhador bingo completo
    console.log('\n🎊 BINGO COMPLETO:');
    if (resultado.ganhadoresBingoCompleto.numeroSorteio !== -1) {
      const empateInfo = resultado.ganhadoresBingoCompleto.teveEmpate 
        ? ` (EMPATE RESOLVIDO: ${resultado.ganhadoresBingoCompleto.cartelasEmpatadas.join(', ')} → Vencedor: ${resultado.ganhadoresBingoCompleto.cartelas[0]})` 
        : '';
      console.log(`  Cartela ${resultado.ganhadoresBingoCompleto.cartelas[0]} - Sorteio #${resultado.ganhadoresBingoCompleto.numeroSorteio}${empateInfo}`);
    } else {
      console.log(`  Nenhum ganhador`);
    }
    
    // Exibir resumo
    console.log('\n📈 RESUMO:');
    console.log(`  Total de cartelas: ${resultado.resumo.totalCartelas}`);
    console.log(`  Cartelas com prêmio: ${resultado.resumo.cartelasComPremio.size}`);
    console.log(`  Total de prêmios: ${resultado.resumo.totalPremios}`);
    console.log(`  Empates detectados e resolvidos: ${resultado.resumo.totalEmpatesResolvidos}`);
    console.log(`  Empates por letra: ${Object.keys(resultado.resumo.empatesPorLetra).length > 0 ? JSON.stringify(resultado.resumo.empatesPorLetra) : 'Nenhum'}`);
    console.log(`  Empate bingo completo: ${resultado.resumo.empatesBingoCompleto > 0 ? `${resultado.resumo.empatesBingoCompleto} cartelas (resolvido)` : 'Nenhum'}`);
  }
  
  // Estatísticas gerais
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 ESTATÍSTICAS GERAIS DAS 10 SIMULAÇÕES');
  console.log('='.repeat(80));
  
  const totalEmpatesPorLetra = {};
  let totalEmpatesBingoCompleto = 0;
  let totalCartelasComPremio = 0;
  let totalEmpatesResolvidos = 0;
  
  resultados.forEach(r => {
    Object.keys(r.resumo.empatesPorLetra).forEach(letra => {
      totalEmpatesPorLetra[letra] = (totalEmpatesPorLetra[letra] || 0) + 1;
    });
    if (r.resumo.empatesBingoCompleto > 0) {
      totalEmpatesBingoCompleto++;
    }
    totalCartelasComPremio += r.resumo.cartelasComPremio.size;
    totalEmpatesResolvidos += r.resumo.totalEmpatesResolvidos || 0;
  });
  
  console.log(`\n📈 MÉDIAS:`);
  console.log(`  Cartelas com prêmio (média): ${(totalCartelasComPremio / 10).toFixed(1)}`);
  console.log(`  Empates resolvidos por simulação (média): ${(totalEmpatesResolvidos / 10).toFixed(1)}`);
  console.log(`  Simulações com empate no bingo completo: ${totalEmpatesBingoCompleto}/10`);
  
  console.log(`\n🔀 EMPATES POR LETRA (quantas vezes houve empate - todos resolvidos):`);
  Object.keys(totalEmpatesPorLetra).forEach(letra => {
    console.log(`  ${letra}: ${totalEmpatesPorLetra[letra]}/10 simulações`);
  });
  
  if (Object.keys(totalEmpatesPorLetra).length === 0) {
    console.log(`  Nenhum empate registrado`);
  }
  
  console.log(`\n✅ SISTEMA DE DESEMPATE:`);
  console.log(`  Todos os empates foram resolvidos automaticamente pelo sistema de Pedra Maior`);
  console.log(`  Total de empates resolvidos nas 10 simulações: ${totalEmpatesResolvidos}`);
  
  console.log('\n✅ SIMULAÇÕES CONCLUÍDAS!\n');
}

// Executar
executarTodasSimulacoes();

