import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/contexts/GameContext";
import { Play, RefreshCw, Sparkles, Search, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCorParaNumero, formatarCelula, getAvatar, getInicial, getLetraDoNumero, NUM_PARA_NOME } from "@/utils/bingoGenerator";

// Componente wrapper para aplicar cor de fundo dinâmica sem estilos inline
function DynamicBgDiv({ 
  color, 
  className, 
  children 
}: { 
  color: string; 
  className?: string; 
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.backgroundColor = color;
    }
  }, [color]);
  
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function BingoGameTab() {
  const { 
    jogoIniciado, 
    sorteados, 
    numerosRestantes, 
    currentSession,
    iniciarJogo, 
    sortearNumero, 
    finalizarSessao,
    loadingSessions
  } = useGame();
  const [numeroSorteadoAtual, setNumeroSorteadoAtual] = useState<number | null>(null);
  const [sorteando, setSorteando] = useState(false);
  const [buscaSorteados, setBuscaSorteados] = useState("");
  const [buscaRestantes, setBuscaRestantes] = useState("");
  const [modalSorteadosAberto, setModalSorteadosAberto] = useState(false);
  const [modalRestantesAberto, setModalRestantesAberto] = useState(false);
  const [nomeNovaSessao, setNomeNovaSessao] = useState("");
  const [modalNovaSessionAberto, setModalNovaSessionAberto] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const handleIniciarJogo = async () => {
    await iniciarJogo(nomeNovaSessao || undefined);
    setNomeNovaSessao("");
    setModalNovaSessionAberto(false);
    toast.success("Sessão iniciada! Boa sorte! 🎉");
  };

  const handleSortear = () => {
    if (!jogoIniciado) {
      toast.error("O jogo precisa ser iniciado primeiro!");
      return;
    }

    if (numerosRestantes.length === 0) {
      toast.info("Todos os números já foram sorteados!");
      return;
    }

    setSorteando(true);
    
    setTimeout(() => {
      const numero = sortearNumero();
      if (numero !== null) {
        setNumeroSorteadoAtual(numero);
        const letra = getLetraDoNumero(numero);
        const display = formatarCelula(numero);
        toast.success(`🎊 Sorteado: ${letra} - ${display}`);
      }
      setSorteando(false);
    }, 1500);
  };

  const handleFinalizarSessao = async () => {
    setFinalizando(true);
    await finalizarSessao();
    setNumeroSorteadoAtual(null);
    setFinalizando(false);
  };

  const sorteadosFiltrados = sorteados.filter(numero =>
    formatarCelula(numero).toLowerCase().includes(buscaSorteados.toLowerCase())
  );

  const restantesFiltrados = numerosRestantes.filter(numero =>
    formatarCelula(numero).toLowerCase().includes(buscaRestantes.toLowerCase())
  );

  if (loadingSessions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
      {/* Info da sessão atual */}
      {currentSession && (
        <div className="bg-card rounded-xl p-4 border-2 border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Sessão ativa:</p>
              <p className="font-semibold text-lg">{currentSession.nome}</p>
            </div>
            <Badge variant="default" className="text-sm">
              {sorteados.length} números sorteados
            </Badge>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
        {!jogoIniciado && (
          <Dialog open={modalNovaSessionAberto} onOpenChange={setModalNovaSessionAberto}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 sm:gap-3 text-base sm:text-lg md:text-xl px-6 sm:px-8 py-4 sm:py-6 shadow-festive hover:scale-105 transition-bounce w-full sm:w-auto"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                ▶️ Nova Sessão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar Nova Sessão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Nome da sessão (opcional)
                  </label>
                  <Input
                    placeholder={`Sessão ${new Date().toLocaleDateString("pt-BR")}`}
                    value={nomeNovaSessao}
                    onChange={(e) => setNomeNovaSessao(e.target.value)}
                  />
                </div>
                <Button onClick={handleIniciarJogo} className="w-full">
                  Iniciar Sessão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {jogoIniciado && (
          <>
            <Button
              onClick={handleSortear}
              disabled={sorteando || numerosRestantes.length === 0}
              size="lg"
              className="gap-2 sm:gap-3 text-base sm:text-lg md:text-xl px-6 sm:px-8 py-4 sm:py-6 shadow-festive hover:scale-105 transition-bounce"
            >
              <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${sorteando ? 'animate-spin' : ''}`} />
              <span>{sorteando ? 'Sorteando...' : '🔁 Sortear Número'}</span>
            </Button>
            
            <Button
              onClick={handleFinalizarSessao}
              disabled={finalizando}
              variant="outline"
              size="lg"
              className="gap-2 text-base sm:text-lg px-4 sm:px-6 py-4 sm:py-6 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {finalizando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span>{finalizando ? 'Finalizando...' : 'Finalizar Sessão'}</span>
            </Button>
          </>
        )}
      </div>

      {sorteando && (
        <div className="relative bg-gradient-to-br from-festive-yellow/40 via-festive-pink/40 to-festive-purple/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-festive border-2 sm:border-4 border-primary text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <Sparkles className="absolute top-4 left-4 w-6 h-6 text-festive-yellow animate-pulse" />
            <Sparkles className="absolute top-8 right-8 w-8 h-8 text-festive-pink animate-bounce" />
            <Sparkles className="absolute bottom-6 left-1/4 w-5 h-5 text-festive-purple animate-pulse delay-100" />
            <Sparkles className="absolute bottom-10 right-1/3 w-7 h-7 text-festive-yellow animate-bounce delay-200" />
          </div>

          <div className="relative z-10">
            <p className="text-base sm:text-lg md:text-xl text-foreground font-semibold mb-4 sm:mb-6 animate-pulse">
              ✨ Sorteando número... ✨
            </p>
            
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-festive-yellow via-festive-pink to-festive-purple animate-spin" />
              
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-festive-yellow via-festive-pink to-festive-purple bg-clip-text text-transparent animate-pulse">
                    ?
                  </span>
                </div>
              </div>
              
              <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 text-festive-yellow animate-bounce" />
              <Sparkles className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 text-festive-pink animate-bounce delay-100" />
            </div>
            
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-bounce">🎲</span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-bounce delay-100">🎊</span>
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-bounce delay-200">🎲</span>
            </div>
          </div>
        </div>
      )}

      {!sorteando && numeroSorteadoAtual !== null && (
        <div className="bg-gradient-to-br from-festive-yellow/30 via-festive-pink/30 to-festive-purple/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-festive border-2 sm:border-4 border-primary text-center animate-scale-in">
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4">Sorteado:</p>
          <div className="flex flex-row items-center justify-center gap-6 mb-4 sm:mb-6">
            <div className="inline-block bg-primary text-primary-foreground rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 flex items-center justify-center shadow-festive border-4 border-white">
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                {getLetraDoNumero(numeroSorteadoAtual)}
              </span>
            </div>
            <div>
              <DynamicBgDiv
                color={getCorParaNumero(numeroSorteadoAtual)}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 border-4 border-white shadow-festive rounded-lg overflow-hidden"
              >
                {NUM_PARA_NOME[numeroSorteadoAtual] ? (
                  <>
                    <img 
                      src={getAvatar(numeroSorteadoAtual)} 
                      alt={formatarCelula(numeroSorteadoAtual)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.classList.add('hidden');
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="w-full h-full hidden items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                      {getInicial(numeroSorteadoAtual)}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                    {numeroSorteadoAtual}
                  </div>
                )}
              </DynamicBgDiv>
            </div>
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary drop-shadow-lg break-words px-2">
            {formatarCelula(numeroSorteadoAtual)}
          </h3>
        </div>
      )}

      {jogoIniciado && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
          <Dialog open={modalSorteadosAberto} onOpenChange={setModalSorteadosAberto}>
            <DialogTrigger asChild>
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card border-2 border-green-500/30 cursor-pointer hover:border-green-500/50 transition-colors">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 flex items-center gap-2">
                  ✅ Já Sorteados ({sorteados.length}/75)
                </h4>
                <p className="text-sm text-muted-foreground mt-2">Clique para ver detalhes</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-green-600">✅ Já Sorteados ({sorteados.length}/75)</DialogTitle>
              </DialogHeader>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sorteados..."
                  value={buscaSorteados}
                  onChange={(e) => setBuscaSorteados(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2">
                {sorteadosFiltrados.map((numero, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <span className="text-sm font-bold text-muted-foreground min-w-[30px]">{i + 1}.</span>
                    <DynamicBgDiv
                      color={getCorParaNumero(numero)}
                      className="w-12 h-12 flex-shrink-0 border-2 border-green-500/30 rounded-lg overflow-hidden"
                    >
                      {NUM_PARA_NOME[numero] ? (
                        <>
                          <img 
                            src={getAvatar(numero)} 
                            alt={formatarCelula(numero)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.classList.add('hidden');
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center text-xl font-bold text-white shadow">
                            {getInicial(numero)}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white shadow">
                          {numero}
                        </div>
                      )}
                    </DynamicBgDiv>
                    <span className="font-semibold text-foreground text-base">
                      <span className="text-primary font-bold">{getLetraDoNumero(numero)}</span> - {formatarCelula(numero)}
                    </span>
                  </div>
                ))}
                {sorteadosFiltrados.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum resultado encontrado</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={modalRestantesAberto} onOpenChange={setModalRestantesAberto}>
            <DialogTrigger asChild>
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card border-2 border-blue-500/30 cursor-pointer hover:border-blue-500/50 transition-colors">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 flex items-center gap-2">
                  ⏳ Restantes ({numerosRestantes.length}/75)
                </h4>
                <p className="text-sm text-muted-foreground mt-2">Clique para ver detalhes</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-600">⏳ Restantes ({numerosRestantes.length}/75)</DialogTitle>
              </DialogHeader>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar restantes..."
                  value={buscaRestantes}
                  onChange={(e) => setBuscaRestantes(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-2">
                {restantesFiltrados.map((numero, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                  >
                    <DynamicBgDiv
                      color={getCorParaNumero(numero)}
                      className="w-12 h-12 flex-shrink-0 border-2 border-blue-500/30 rounded-lg overflow-hidden"
                    >
                      {NUM_PARA_NOME[numero] ? (
                        <>
                          <img 
                            src={getAvatar(numero)} 
                            alt={formatarCelula(numero)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.classList.add('hidden');
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center text-xl font-bold text-white shadow">
                            {getInicial(numero)}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white shadow">
                          {numero}
                        </div>
                      )}
                    </DynamicBgDiv>
                    <span className="font-semibold text-foreground text-base">{formatarCelula(numero)}</span>
                  </div>
                ))}
                {restantesFiltrados.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum resultado encontrado</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
