import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dice6, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { shuffleArray, TODOS_NUMEROS } from "@/utils/bingoGenerator";

export function PedraMaiorTab() {
  const [numeroParticipantes, setNumeroParticipantes] = useState<number>(2);
  const [numerosSorteados, setNumerosSorteados] = useState<number[]>([]);
  const [sorteando, setSorteando] = useState(false);

  const handleSortear = () => {
    if (numeroParticipantes < 2 || numeroParticipantes > 75) {
      toast.error("Número de participantes deve ser entre 2 e 75");
      return;
    }

    setSorteando(true);
    
    setTimeout(() => {
      // Sortear números aleatórios únicos
      const numerosDisponiveis = shuffleArray([...TODOS_NUMEROS]);
      const sorteados = numerosDisponiveis.slice(0, numeroParticipantes);
      
      setNumerosSorteados(sorteados);
      setSorteando(false);
      toast.success(`${numeroParticipantes} número(s) sorteados! 🎲`);
    }, 1000);
  };

  const handleLimpar = () => {
    setNumerosSorteados([]);
    toast.info("Números limpos");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Dice6 className="w-6 h-6" />
            Calculadora de Pedra Maior
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Quantos participantes empataram?
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input
                  type="number"
                  min="2"
                  max="75"
                  value={numeroParticipantes}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value);
                    if (!isNaN(valor) && valor >= 2 && valor <= 75) {
                      setNumeroParticipantes(valor);
                    }
                  }}
                  className="text-lg font-semibold w-full sm:w-32 text-center"
                />
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <Button
                      key={num}
                      variant={numeroParticipantes === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNumeroParticipantes(num)}
                      className="min-w-[50px]"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSortear}
                disabled={sorteando}
                size="lg"
                className="flex-1 gap-2 text-lg font-bold"
              >
                {sorteando ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Sorteados...
                  </>
                ) : (
                  <>
                    <Dice6 className="w-5 h-5" />
                    Sortear Números
                  </>
                )}
              </Button>
              
              {numerosSorteados.length > 0 && (
                <Button
                  onClick={handleLimpar}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {numerosSorteados.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">
                Números Sorteados ({numerosSorteados.length}):
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {numerosSorteados.map((numero, index) => (
                  <Card
                    key={index}
                    className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5"
                  >
                    <CardContent className="p-6 text-center">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {index + 1}º
                      </Badge>
                      <div className="text-4xl font-bold text-primary mt-2">
                        {numero}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-green-500/10 border-2 border-green-500">
                <CardContent className="p-4">
                  <p className="text-center font-semibold text-green-700 dark:text-green-400">
                    🏆 Vencedor: Quem escolher o maior número!
                  </p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Maior número: <strong className="text-lg">{Math.max(...numerosSorteados)}</strong>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {numerosSorteados.length === 0 && !sorteando && (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-8 text-center">
                <Dice6 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Selecione o número de participantes e clique em "Sortear Números" para começar
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


