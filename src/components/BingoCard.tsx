import { useRef } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { BLOCOS, LINHAS, formatarCelula, getCorParaNumero, NUM_PARA_NOME, getAvatar, getInicial } from "@/utils/bingoGenerator";

interface BingoCardProps {
  id: number;
  numeros: number[][];
  onDownload?: (id: number, element: HTMLDivElement) => void;
}

const CORES_CELULAS = [
  'bg-festive-orange',
  'bg-festive-pink',
  'bg-festive-yellow',
  'bg-festive-purple',
  'bg-festive-green',
];

export const BingoCard = ({ id, numeros, onDownload }: BingoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (cardRef.current && onDownload) {
      onDownload(id, cardRef.current);
    }
  };

  const getCorCelula = (linha: number, coluna: number) => {
    return CORES_CELULAS[(linha + coluna) % CORES_CELULAS.length];
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-card rounded-lg sm:rounded-xl shadow-card border-2 border-primary/20">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary">Cartela #{id.toString().padStart(2, '0')}</h3>
        <Button onClick={handleDownload} size="sm" className="gap-1 text-xs px-2 py-1">
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">PNG</span>
        </Button>
      </div>

      <div 
        ref={cardRef}
        className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-festive w-full overflow-x-auto"
      >
        {/* Cabeçalho F-A-R-I-A */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
          {BLOCOS.map((bloco, index) => (
            <div
              key={index}
              className={`${getCorCelula(0, index)} rounded-md sm:rounded-lg p-1.5 sm:p-2 md:p-3 flex items-center justify-center shadow-lg`}
            >
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold drop-shadow-lg">
                {bloco.letra}
              </span>
            </div>
          ))}
        </div>

        {/* Grid de Números (5x5) */}
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2">
          {BLOCOS.map((bloco, colunaIndex) => (
            <div key={colunaIndex} className="flex flex-col gap-1 sm:gap-1.5 md:gap-2">
              {numeros[colunaIndex].map((numero, linhaIndex) => {
                const temNome = NUM_PARA_NOME[numero];
                return (
                  <div
                    key={`${colunaIndex}-${linhaIndex}`}
                    className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-br from-white to-gray-50 rounded-md sm:rounded-lg shadow-md border border-gray-200 hover:scale-105 transition-bounce min-h-[50px] sm:min-h-[60px] md:min-h-[70px]"
                  >
                    {/* Número ou Avatar */}
                    <div 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md overflow-hidden border border-white/30 shadow-md flex items-center justify-center relative"
                      style={{
                        backgroundColor: getCorParaNumero(numero),
                      }}
                    >
                      {temNome ? (
                        <>
                          <img 
                            src={getAvatar(numero)} 
                            alt={formatarCelula(numero)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-full h-full text-white text-sm sm:text-base md:text-lg font-bold drop-shadow-lg flex items-center justify-center"
                            style={{display: 'none'}}
                          >
                            {getInicial(numero)}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full text-white text-sm sm:text-base md:text-lg font-bold drop-shadow-lg flex items-center justify-center">
                          {numero}
                        </div>
                      )}
                    </div>
                    {/* Nome ou Número abaixo */}
                    <span 
                      className="text-gray-800 text-[0.6rem] sm:text-xs md:text-sm font-bold leading-tight break-words w-full flex items-center justify-center text-center"
                    >
                      {formatarCelula(numero)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-2 sm:mt-3 flex justify-center items-center w-full">
          <div className="gradient-festa text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">
            <span className="text-[0.6rem] sm:text-xs md:text-sm font-bold drop-shadow-lg whitespace-nowrap">
              W(V)andermurem(n) 2025 🎉
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
