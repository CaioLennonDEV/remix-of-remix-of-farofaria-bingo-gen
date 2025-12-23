import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History, Eye, Calendar, Hash, Loader2 } from "lucide-react";
import { useGame, BingoSession } from "@/contexts/GameContext";
import { getLetraDoNumero } from "@/utils/bingoGenerator";
import { useParticipantesContext } from "@/contexts/ParticipantesContext";

export function SessionHistoryTab() {
  const { sessions, loadingSessions } = useGame();
  const { numParaNome } = useParticipantesContext();
  const [selectedSession, setSelectedSession] = useState<BingoSession | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadSessionDetails = async (session: BingoSession) => {
    setLoadingDetails(true);
    setSelectedSession(session);
    setLoadingDetails(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const finishedSessions = sessions.filter(s => s.status === "finalizada");

  if (loadingSessions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5" />
        <h2 className="text-xl font-bold">Histórico de Sessões</h2>
      </div>

      {finishedSessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma sessão finalizada ainda. Inicie e finalize uma sessão para ver o histórico aqui.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {finishedSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{session.nome}</CardTitle>
                  <Badge variant="secondary">Finalizada</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(session.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>{session.numeros_sorteados?.length || 0} números sorteados</span>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => loadSessionDetails(session)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>{selectedSession?.nome}</DialogTitle>
                    </DialogHeader>
                    
                    {loadingDetails ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : selectedSession && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Início:</span>
                            <p className="font-medium">{formatDate(selectedSession.created_at)}</p>
                          </div>
                          {selectedSession.finalizada_at && (
                            <div>
                              <span className="text-muted-foreground">Fim:</span>
                              <p className="font-medium">{formatDate(selectedSession.finalizada_at)}</p>
                            </div>
                          )}
                        </div>

                        {/* Números Sorteados */}
                        <div>
                          <h4 className="font-semibold mb-2">
                            Números Sorteados ({selectedSession.numeros_sorteados?.length || 0})
                          </h4>
                          <ScrollArea className="h-48">
                            <div className="flex flex-wrap gap-2">
                              {selectedSession.numeros_sorteados?.map((num, idx) => {
                                const participante = numParaNome[num];
                                return (
                                  <div
                                    key={num}
                                    className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1 text-sm"
                                    title={participante?.nome || `Número ${num}`}
                                  >
                                    <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                                    <span className="font-medium">{getLetraDoNumero(num)}{num}</span>
                                    {participante && (
                                      <span className="text-xs text-muted-foreground">
                                        ({participante.nome.split(" ")[0]})
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
