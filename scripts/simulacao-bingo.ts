import { gerarCartela, BLOCOS, LINHAS, getLetraDoNumero, TODOS_NUMEROS } from '../src/utils/bingoGenerator';

// Função para embaralhar array (mesma do bingoGenerator)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Interface para resultados da simulação
interface ResultadoSimulacao {
  simulacao: number;
  ganhadoresPorLetra: {
    [letra: string]: {
      cartelas: number[];
      numeroSorteio: number;
    };
  };
  ganhadoresBingoCompleto: {
    cartelas: number[];
    numeroSorteio: number;
  };
  resumo: {
    totalCartelas: number;
    cartelasComPremio: Set<number>;
    totalPremios: number;
    empatesPorLetra: { [letra: string]: number };
    empatesBingoCompleto: number;
  };
}

// Verifica se uma coluna (letra) está completa
function verificarColunaCompleta(cartela: ReturnType<typeof gerarCartela>, letra: string, sorteados: Set<number>): boolean {
  const blocoIndex = BLOCOS.findIndex(b => b.letra === letra);
  if (blocoIndex === -1) return false;
  
  const numerosColuna = cartela.numeros[blocoIndex];
  return numerosColuna.every(num => sorteados.has(num));
}

// Verifica se a cartela completa está completa (bingo completo)
function verificarBingoCompleto(cartela: ReturnType<typeof gerarCartela>, sorteados: Set<number>): boolean {
  return cartela.numeros.every(coluna => 
    coluna.every(num => sorteados.has(num))
  );
}

// Executa uma simulação completa
function executarSimulacao(numSimulacao: number): ResultadoSimulacao {
  // Gerar 10 cartelas
  const cartelas = Array.from({ length: 10 }, (_, i) => gerarCartela(i + 1));
  
  // Embaralhar todos os números para simular o sorteio
  const numerosParaSortear = shuffleArray([...TODOS_NUMEROS]);
  
  const sorteados = new Set<number>();
  const ganhadoresPorLetra: { [letra: string]: { cartelas: number[]; numeroSorteio: number } } = {};
  const ganhadoresBingoCompleto: { cartelas: number[]; numeroSorteio: number } = { cartelas: [], numeroSorteio: -1 };
  
  // Inicializar ganhadores por letra
  BLOCOS.forEach(bloco => {
    if (!ganhadoresPorLetra[bloco.letra]) {
      ganhadoresPorLetra[bloco.letra] = { cartelas: [], numeroSorteio: -1 };
    }
  });
  
  // Simular sorteio número por número
  for (let i = 0; i < numerosParaSortear.length; i++) {
    const numero = numerosParaSortear[i];
    sorteados.add(numero);
    
    // Verificar cada letra (coluna)
    BLOCOS.forEach(bloco => {
      const letra = bloco.letra;
      // Se ainda não há ganhador para esta letra
      if (ganhadoresPorLetra[letra].numeroSorteio === -1) {
        const cartelasCompletas: number[] = [];
        cartelas.forEach(cartela => {
          if (verificarColunaCompleta(cartela, letra, sorteados)) {
            cartelasCompletas.push(cartela.id);
          }
        });
        
        if (cartelasCompletas.length > 0) {
          ganhadoresPorLetra[letra] = {
            cartelas: cartelasCompletas,
            numeroSorteio: i + 1
          };
        }
      }
    });
    
    // Verificar bingo completo
    if (ganhadoresBingoCompleto.numeroSorteio === -1) {
      const cartelasCompletas: number[] = [];
      cartelas.forEach(cartela => {
        if (verificarBingoCompleto(cartela, sorteados)) {
          cartelasCompletas.push(cartela.id);
        }
      });
      
      if (cartelasCompletas.length > 0) {
        ganhadoresBingoCompleto.cartelas = cartelasCompletas;
        ganhadoresBingoCompleto.numeroSorteio = i + 1;
      }
    }
  }
  
  // Calcular resumo
  const cartelasComPremio = new Set<number>();
  const empatesPorLetra: { [letra: string]: number } = {};
  
  Object.keys(ganhadoresPorLetra).forEach(letra => {
    const ganhadores = ganhadoresPorLetra[letra];
    ganhadores.cartelas.forEach(id => cartelasComPremio.add(id));
    if (ganhadores.cartelas.length > 1) {
      empatesPorLetra[letra] = ganhadores.cartelas.length;
    }
  });
  
  ganhadoresBingoCompleto.cartelas.forEach(id => cartelasComPremio.add(id));
  const empatesBingoCompleto = ganhadoresBingoCompleto.cartelas.length > 1 
    ? ganhadoresBingoCompleto.cartelas.length 
    : 0;
  
  const totalPremios = Object.keys(ganhadoresPorLetra).length + 1; // 5 letras + 1 bingo completo
  
  return {
    simulacao: numSimulacao,
    ganhadoresPorLetra,
    ganhadoresBingoCompleto,
    resumo: {
      totalCartelas: cartelas.length,
      cartelasComPremio,
      totalPremios,
      empatesPorLetra,
      empatesBingoCompleto
    }
  };
}

// Executar 10 simulações
function executarTodasSimulacoes() {
  console.log('🎲 INICIANDO SIMULAÇÕES DE BINGO 🎲\n');
  console.log('='.repeat(80));
  
  const resultados: ResultadoSimulacao[] = [];
  
  for (let i = 1; i <= 10; i++) {
    console.log(`\n📊 SIMULAÇÃO ${i}/10`);
    console.log('-'.repeat(80));
    
    const resultado = executarSimulacao(i);
    resultados.push(resultado);
    
    // Exibir resultados por letra
    console.log('\n🏆 GANHADORES POR LETRA:');
    Object.keys(resultado.ganhadoresPorLetra).forEach(letra => {
      const ganhadores = resultado.ganhadoresPorLetra[letra];
      if (ganhadores.numeroSorteio !== -1) {
        const empate = ganhadores.cartelas.length > 1 ? ' (EMPATE!)' : '';
        console.log(`  ${letra}: Cartela(s) ${ganhadores.cartelas.join(', ')} - Sorteio #${ganhadores.numeroSorteio}${empate}`);
      } else {
        console.log(`  ${letra}: Nenhum ganhador`);
      }
    });
    
    // Exibir ganhador bingo completo
    console.log('\n🎊 BINGO COMPLETO:');
    if (resultado.ganhadoresBingoCompleto.numeroSorteio !== -1) {
      const empate = resultado.ganhadoresBingoCompleto.cartelas.length > 1 ? ' (EMPATE!)' : '';
      console.log(`  Cartela(s) ${resultado.ganhadoresBingoCompleto.cartelas.join(', ')} - Sorteio #${resultado.ganhadoresBingoCompleto.numeroSorteio}${empate}`);
    } else {
      console.log(`  Nenhum ganhador`);
    }
    
    // Exibir resumo
    console.log('\n📈 RESUMO:');
    console.log(`  Total de cartelas: ${resultado.resumo.totalCartelas}`);
    console.log(`  Cartelas com prêmio: ${resultado.resumo.cartelasComPremio.size}`);
    console.log(`  Total de prêmios: ${resultado.resumo.totalPremios}`);
    console.log(`  Empates por letra: ${Object.keys(resultado.resumo.empatesPorLetra).length > 0 ? JSON.stringify(resultado.resumo.empatesPorLetra) : 'Nenhum'}`);
    console.log(`  Empate bingo completo: ${resultado.resumo.empatesBingoCompleto > 0 ? `${resultado.resumo.empatesBingoCompleto} cartelas` : 'Nenhum'}`);
  }
  
  // Estatísticas gerais
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 ESTATÍSTICAS GERAIS DAS 10 SIMULAÇÕES');
  console.log('='.repeat(80));
  
  const totalEmpatesPorLetra: { [letra: string]: number } = {};
  let totalEmpatesBingoCompleto = 0;
  let totalCartelasComPremio = 0;
  
  resultados.forEach(r => {
    Object.keys(r.resumo.empatesPorLetra).forEach(letra => {
      totalEmpatesPorLetra[letra] = (totalEmpatesPorLetra[letra] || 0) + 1;
    });
    if (r.resumo.empatesBingoCompleto > 0) {
      totalEmpatesBingoCompleto++;
    }
    totalCartelasComPremio += r.resumo.cartelasComPremio.size;
  });
  
  console.log(`\n📈 MÉDIAS:`);
  console.log(`  Cartelas com prêmio (média): ${(totalCartelasComPremio / 10).toFixed(1)}`);
  console.log(`  Simulações com empate no bingo completo: ${totalEmpatesBingoCompleto}/10`);
  
  console.log(`\n🔀 EMPATES POR LETRA (quantas vezes houve empate):`);
  Object.keys(totalEmpatesPorLetra).forEach(letra => {
    console.log(`  ${letra}: ${totalEmpatesPorLetra[letra]}/10 simulações`);
  });
  
  if (Object.keys(totalEmpatesPorLetra).length === 0) {
    console.log(`  Nenhum empate registrado`);
  }
  
  console.log('\n✅ SIMULAÇÕES CONCLUÍDAS!\n');
}

// Executar
executarTodasSimulacoes();


