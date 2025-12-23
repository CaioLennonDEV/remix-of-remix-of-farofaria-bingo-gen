import { useState, useEffect } from "react";
import { BingoCard } from "@/components/BingoCard";
import { Button } from "@/components/ui/button";
import { gerarTodasCartelas, NUM_CARTELAS, NUM_PARA_NOME } from "@/utils/bingoGenerator";
import { Download, RefreshCw, FileDown } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function CartelasTab() {
  const [cartelas, setCartelas] = useState(() => gerarTodasCartelas());
  const [gerando, setGerando] = useState(false);
  const [baixandoTodas, setBaixandoTodas] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Pré-carrega todas as imagens uma única vez
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = Object.values(NUM_PARA_NOME)
        .filter(participante => participante.avatar)
        .map(participante => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continua mesmo se uma imagem falhar
            img.src = participante.avatar!;
          });
        });

      await Promise.all(imagePromises);
      setImagesPreloaded(true);
    };

    preloadImages();
  }, []);

  const regenerarCartelas = () => {
    setGerando(true);
    setTimeout(() => {
      setCartelas(gerarTodasCartelas());
      setGerando(false);
      toast.success("Novas cartelas geradas com sucesso! 🎉");
    }, 500);
  };

  const baixarCartela = async (id: number, element: HTMLDivElement) => {
    try {
      if (!imagesPreloaded) {
        toast.info("Aguarde o carregamento das imagens...");
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: false,
        allowTaint: true,
        foreignObjectRendering: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          // Remove elementos que podem causar problemas
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      const link = document.createElement('a');
      link.download = `cartela_${id.toString().padStart(2, '0')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success(`Cartela #${id} baixada! 📥`);
    } catch (error) {
      toast.error(`Erro ao baixar cartela #${id}`);
      console.error(error);
    }
  };

  const baixarTodasCartelas = async () => {
    if (!imagesPreloaded) {
      toast.error("Aguarde o carregamento das imagens antes de baixar");
      return;
    }

    setBaixandoTodas(true);
    toast.info("Iniciando download de todas as cartelas...");

    try {
      // Processa em lotes de 2 cartelas por vez para máxima estabilidade
      const batchSize = 2;
      const totalBatches = Math.ceil(cartelas.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, cartelas.length);
        const batch = cartelas.slice(startIndex, endIndex);

        // Processa o lote atual
        const batchPromises = batch.map(async (cartela) => {
          const element = document.querySelector(`[data-cartela-id="${cartela.id}"]`) as HTMLDivElement;
          
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: false,
              allowTaint: true,
              foreignObjectRendering: false,
              removeContainer: true,
              imageTimeout: 0,
            });
            
            const link = document.createElement('a');
            link.download = `cartela_${cartela.id.toString().padStart(2, '0')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        });

        // Aguarda o lote atual ser processado
        await Promise.all(batchPromises);
        
        // Pausa entre lotes
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      toast.success("Todas as cartelas foram baixadas! 🎊");
    } catch (error) {
      toast.error("Erro ao baixar cartelas");
      console.error(error);
    } finally {
      setBaixandoTodas(false);
    }
  };

  const baixarPDFCompleto = async () => {
    if (!imagesPreloaded) {
      toast.error("Aguarde o carregamento das imagens antes de gerar o PDF");
      return;
    }

    setBaixandoTodas(true);
    toast.info("Gerando PDF com todas as cartelas...");

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Processa em lotes de 3 cartelas por vez
      const batchSize = 3;
      const totalBatches = Math.ceil(cartelas.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, cartelas.length);
        const batch = cartelas.slice(startIndex, endIndex);

        // Processa o lote atual
        const batchPromises = batch.map(async (cartela, index) => {
          const element = document.querySelector(`[data-cartela-id="${cartela.id}"] > div > div:last-child`) as HTMLDivElement;
          
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 1.5,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: false,
              allowTaint: true,
              foreignObjectRendering: false,
              removeContainer: true,
              imageTimeout: 0,
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            return {
              imgData,
              imgWidth,
              imgHeight,
              globalIndex: startIndex + index
            };
          }
          return null;
        });

        // Aguarda o lote atual ser processado
        const batchResults = await Promise.all(batchPromises);
        
        // Adiciona as imagens do lote ao PDF
        batchResults.forEach((result) => {
          if (result) {
            if (result.globalIndex > 0) {
              pdf.addPage();
            }
            
            const xOffset = (210 - result.imgWidth) / 2;
            const yOffset = 10;
            
            pdf.addImage(result.imgData, 'JPEG', xOffset, yOffset, result.imgWidth, result.imgHeight);
          }
        });

        // Pausa entre lotes
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      pdf.save('cartelas_bingo_wandermurem.pdf');
      toast.success("PDF completo gerado com sucesso! 🎊");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    } finally {
      setBaixandoTodas(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {!imagesPreloaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800 text-sm">
            ⏳ Carregando imagens dos participantes... Aguarde antes de baixar as cartelas.
          </p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
        <Button
          onClick={regenerarCartelas}
          disabled={gerando}
          size="lg"
          className="gap-2 sm:gap-3 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 shadow-festive hover:scale-105 transition-bounce w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${gerando ? 'animate-spin' : ''}`} />
          {gerando ? 'Gerando...' : 'Regenerar Todas'}
        </Button>

        <Button
          onClick={baixarPDFCompleto}
          disabled={baixandoTodas}
          size="lg"
          className="gap-2 sm:gap-3 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 shadow-festive hover:scale-105 transition-bounce bg-gradient-to-r from-festive-purple to-festive-pink hover:opacity-90 w-full sm:w-auto"
        >
          <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
          {baixandoTodas ? 'Gerando PDF...' : 'Baixar PDF Completo'}
        </Button>

        <Button
          onClick={baixarTodasCartelas}
          disabled={baixandoTodas}
          variant="secondary"
          size="lg"
          className="gap-2 sm:gap-3 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 shadow-festive hover:scale-105 transition-bounce w-full sm:w-auto"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          {baixandoTodas ? 'Baixando...' : `Baixar PNGs (${NUM_CARTELAS})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {cartelas.map((cartela) => (
          <div key={cartela.id} data-cartela-id={cartela.id}>
            <BingoCard
              id={cartela.id}
              numeros={cartela.numeros}
              onDownload={baixarCartela}
            />
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-card border-2 border-primary/20 text-center">
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4 px-2">
          <strong className="text-primary">Instruções:</strong> Use "Baixar PDF Completo" para gerar um único PDF com todas as {NUM_CARTELAS} cartelas (uma por página), 
          ou baixe individualmente em PNG.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground px-2">
          Cada cartela possui 25 números (5x5) - alguns números têm nomes de participantes associados 🎲
        </p>
      </div>
    </div>
  );
}
