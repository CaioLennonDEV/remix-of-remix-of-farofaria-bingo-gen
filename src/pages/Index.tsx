import { Sparkles, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BingoGameTab } from "@/components/BingoGameTab";
import { CartelasTab } from "@/components/CartelasTab";
import { PedraMaiorTab } from "@/components/PedraMaiorTab";
import { SessionHistoryTab } from "@/components/SessionHistoryTab";
import { ParticipantesTab } from "@/components/ParticipantesTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { GameProvider } from "@/contexts/GameContext";
import { ParticipantesProvider } from "@/contexts/ParticipantesContext";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <ParticipantesProvider>
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-festive-yellow/10 to-festive-pink/10 py-6 sm:py-12 px-2 sm:px-4">
        {/* Header */}
        <header className="max-w-7xl mx-auto mb-6 sm:mb-12 text-center">
          <div className="inline-block gradient-festa text-white px-4 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-2xl sm:rounded-3xl shadow-festive mb-4 sm:mb-6 transform hover:scale-105 transition-bounce">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              <span className="whitespace-nowrap">BINGO W(V)andermurem(n)</span>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" />
            </h1>
          </div>
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground font-semibold px-2 mb-4">
            Sistema de Bingo Personalizado 🎉
          </p>
          
          {/* Botão para Visualização */}
          <div className="flex justify-center">
            <Button
              onClick={() => window.open('/viewer', '_blank')}
              variant="outline"
              className="flex items-center gap-2 hover:bg-festive-yellow/20"
            >
              <Eye className="w-4 h-4" />
              Abrir Visualização da Partida
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="bingo" className="w-full">
            <TabsList className={`grid w-full max-w-5xl mx-auto h-auto p-1 sm:p-2 mb-4 sm:mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
              <TabsTrigger value="bingo" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 data-[state=active]:bg-festive-pink data-[state=active]:text-foreground">
                🎊 Bingo!
              </TabsTrigger>
              <TabsTrigger value="historico" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 data-[state=active]:bg-festive-yellow data-[state=active]:text-foreground">
                📜 Histórico
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="pedra-maior" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 data-[state=active]:bg-festive-purple data-[state=active]:text-foreground">
                    🎯 Pedra Maior
                  </TabsTrigger>
                  <TabsTrigger value="cartelas" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 data-[state=active]:bg-festive-purple data-[state=active]:text-foreground">
                    📋 Cartelas
                  </TabsTrigger>
                  <TabsTrigger value="participantes" className="text-xs sm:text-sm md:text-base lg:text-lg py-2 sm:py-3 md:py-4 data-[state=active]:bg-festive-green data-[state=active]:text-foreground">
                    👥 Participantes
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="bingo" className="mt-8">
              <BingoGameTab />
            </TabsContent>

            <TabsContent value="historico" className="mt-8">
              <SessionHistoryTab />
            </TabsContent>

            {!isMobile && (
              <>
                <TabsContent value="pedra-maior" className="mt-8">
                  <PedraMaiorTab />
                </TabsContent>

                <TabsContent value="cartelas" className="mt-8">
                  <CartelasTab />
                </TabsContent>

                <TabsContent value="participantes" className="mt-8">
                  <ParticipantesTab />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </GameProvider>
    </ParticipantesProvider>
  );
};

export default Index;
