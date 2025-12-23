import { useEffect, useMemo, useState } from "react";
import { Eye, Hash, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BingoSession } from "@/contexts/GameContext";
import { BLOCOS, getNomeCategoriaPorColuna, NUM_PARA_NOME } from "@/utils/bingoGenerator";

interface ViewerData {
  session: BingoSession | null;
  numerosSorteados: number[];
}

const Viewer = () => {
  const [data, setData] = useState<ViewerData>({
    session: null,
    numerosSorteados: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [previousDataHash, setPreviousDataHash] = useState<string>('');

  // Função para carregar dados da sessão ativa
  const loadActiveSession = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Buscar sessão ativa
      const { data: sessionData, error: sessionError } = await supabase
        .from("bingo_sessions")
        .select("*")
        .eq("status", "ativa")
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error("Erro ao carregar sessão:", sessionError);
        setConnectionStatus('disconnected');
        return;
      }

      if (!sessionData) {
        setData({ session: null, numerosSorteados: [] });
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        return;
      }

      const newData = {
        session: sessionData as BingoSession,
        numerosSorteados: sessionData.numeros_sorteados || []
      };

      // Criar hash dos dados para detectar mudanças
      const dataHash = JSON.stringify({
        sessionId: sessionData.id,
        numerosCount: newData.numerosSorteados.length,
        lastNumber: newData.numerosSorteados[newData.numerosSorteados.length - 1]
      });

      // Só atualizar se os dados realmente mudaram
      if (dataHash !== previousDataHash) {
        setData(newData);
        setPreviousDataHash(dataHash);
        setLastUpdate(new Date());
        console.log('Dados atualizados:', {
          numeros: newData.numerosSorteados.length
        });
      }
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Configurar real-time subscriptions
  useEffect(() => {
    loadActiveSession();

    // Configurar polling mais agressivo para garantir atualizações
    const pollingInterval = setInterval(() => {
      loadActiveSession();
    }, 1000); // Atualiza a cada 1 segundo

    // Tentar configurar real-time subscriptions como backup
    let sessionSubscription: any = null;

    try {
      // Subscription para mudanças nas sessões
      sessionSubscription = supabase
        .channel(`viewer_sessions_${Date.now()}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'bingo_sessions'
          },
          (payload) => {
            console.log('Session updated via realtime:', payload);
            loadActiveSession();
          }
        )
        .subscribe((status) => {
          console.log('Session subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Real-time subscription ativa para sessões');
          }
        });
    } catch (error) {
      console.error('Erro ao configurar real-time subscriptions:', error);
    }

    return () => {
      clearInterval(pollingInterval);
      if (sessionSubscription) {
        sessionSubscription.unsubscribe();
      }
    };
  }, []);

  // Função para obter a cor do número baseado na coluna
  const getNumberColor = (numero: number) => {
    for (let i = 0; i < BLOCOS.length; i++) {
      const bloco = BLOCOS[i];
      if (numero >= bloco.inicio && numero <= bloco.fim) {
        const colors = [
          "bg-red-500 text-white",
          "bg-blue-500 text-white", 
          "bg-green-500 text-white",
          "bg-yellow-500 text-black",
          "bg-purple-500 text-white"
        ];
        return colors[i];
      }
    }
    return "bg-gray-500 text-white";
  };

  // Função para formatar timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Flocos de neve (gerados uma vez para manter movimento fluido)
  const snowflakes = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: 8 + Math.random() * 6,
        delay: Math.random() * 6,
      })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-festive-yellow/10 to-festive-pink/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-festive-pink mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando visualização...</p>
        </div>
      </div>
    );
  }

  if (!data.session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-festive-yellow/10 to-festive-pink/10 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Nenhuma Partida Ativa</h2>
            <p className="text-muted-foreground">
              Não há nenhuma partida de bingo em andamento no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-xmas py-6 px-4 overflow-hidden">
      {/* Neve de fundo */}
      <div className="snow-layer">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: flake.left,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative max-w-6xl mx-auto mb-8 text-center z-10">
        <div className="inline-block gradient-festa text-white px-8 py-4 rounded-2xl shadow-festive mb-4">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
            <Eye className="w-8 h-8" />
            BINGO W(V)andermurem(n)
          </h1>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto grid gap-6 z-10">
        {/* Número Sorteado */}
        <Card className="lg:col-span-2 bg-white/40 border-white/40 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Número Sorteado!
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.numerosSorteados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum número foi sorteado ainda
              </p>
            ) : (
              <div className="flex justify-center">
                {(() => {
                  const ultimoNumero = data.numerosSorteados[data.numerosSorteados.length - 1];
                  const participante = NUM_PARA_NOME[ultimoNumero];
                  
                  return (
                    <div
                      className="rounded-lg p-6 font-bold text-white
                        transform transition-all duration-300 min-h-[200px] min-w-[260px] flex items-center justify-center
                        scale-105 ring-4 ring-yellow-400 shadow-2xl bg-transparent"
                    >
                      {participante ? (
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full">
                          <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-white/50 rounded-2xl overflow-hidden shadow-xl">
                            <img 
                              src={participante.avatar} 
                              alt={participante.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full text-3xl md:text-4xl font-bold flex items-center justify-center text-white/90 bg-black/40" style={{display: 'none'}}>
                              {participante.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          </div>
                          <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="text-2xl md:text-3xl leading-tight text-center md:text-left drop-shadow-lg">
                              {participante.nome}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-6xl font-bold">{ultimoNumero}</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 w-full bg-white/40 border-white/40 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {data.numerosSorteados.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                A partida ainda não começou
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...data.numerosSorteados].reverse().map((numero, reverseIndex) => {
                  const originalIndex = data.numerosSorteados.length - 1 - reverseIndex;
                  
                  return (
                    <div
                      key={`history-${numero}-${originalIndex}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{originalIndex + 1}</Badge>
                        <div
                          className={`
                            ${getNumberColor(numero)}
                            rounded px-3 py-2 font-bold text-sm min-w-[60px] text-center
                          `}
                        >
                          {numero}
                        </div>
                        
                        {NUM_PARA_NOME[numero] ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                              <img 
                                src={NUM_PARA_NOME[numero].avatar} 
                                alt={NUM_PARA_NOME[numero].nome}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gray-300 text-sm font-bold flex items-center justify-center" style={{display: 'none'}}>
                                {NUM_PARA_NOME[numero].nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {NUM_PARA_NOME[numero].nome}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getNomeCategoriaPorColuna(
                                  BLOCOS.findIndex(bloco => 
                                    numero >= bloco.inicio && numero <= bloco.fim
                                  )
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold">Número {numero}</span>
                            <span className="text-xs text-muted-foreground">
                              {getNomeCategoriaPorColuna(
                                BLOCOS.findIndex(bloco => 
                                  numero >= bloco.inicio && numero <= bloco.fim
                                )
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Viewer;