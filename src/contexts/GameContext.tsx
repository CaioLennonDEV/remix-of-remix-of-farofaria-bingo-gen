import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { TODOS_NUMEROS, Cartela, gerarTodasCartelas } from "@/utils/bingoGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BingoSession {
  id: string;
  nome: string;
  status: "ativa" | "finalizada";
  numeros_sorteados: number[];
  created_at: string;
  finalizada_at: string | null;
}

interface GameContextType {
  jogoIniciado: boolean;
  sorteados: number[];
  numerosRestantes: number[];
  cartelas: Cartela[];
  currentSession: BingoSession | null;
  sessions: BingoSession[];
  loadingSessions: boolean;
  iniciarJogo: (nome?: string) => Promise<void>;
  sortearNumero: () => number | null;
  resetarJogo: () => void;
  finalizarSessao: () => Promise<void>;
  carregarSessoes: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [sorteados, setSorteados] = useState<number[]>([]);
  const [numerosRestantes, setNumerosRestantes] = useState<number[]>([...TODOS_NUMEROS]);
  const [cartelas] = useState<Cartela[]>(() => gerarTodasCartelas());
  const [currentSession, setCurrentSession] = useState<BingoSession | null>(null);
  const [sessions, setSessions] = useState<BingoSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Carregar sessões do banco
  const carregarSessoes = useCallback(async () => {
    setLoadingSessions(true);
    const { data, error } = await supabase
      .from("bingo_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar sessões:", error);
      setLoadingSessions(false);
      return;
    }

    setSessions(data as BingoSession[]);
    
    // Se houver uma sessão ativa, restaurar o estado
    const activeSession = data?.find((s: { status: string }) => s.status === "ativa");
    if (activeSession) {
      setCurrentSession(activeSession as BingoSession);
      setSorteados(activeSession.numeros_sorteados || []);
      setNumerosRestantes(TODOS_NUMEROS.filter(n => !(activeSession.numeros_sorteados || []).includes(n)));
      setJogoIniciado(true);
    }
    
    setLoadingSessions(false);
  }, []);

  useEffect(() => {
    carregarSessoes();
  }, [carregarSessoes]);

  const iniciarJogo = async (nome?: string) => {
    // Verificar se já existe sessão ativa
    if (currentSession?.status === "ativa") {
      toast.error("Já existe uma sessão ativa. Finalize-a primeiro.");
      return;
    }

    const sessionName = nome || `Sessão ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    const { data, error } = await supabase
      .from("bingo_sessions")
      .insert({
        nome: sessionName,
        status: "ativa",
        numeros_sorteados: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar sessão:", error);
      toast.error("Erro ao criar sessão");
      return;
    }

    const newSession = data as BingoSession;
    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setJogoIniciado(true);
    setSorteados([]);
    setNumerosRestantes([...TODOS_NUMEROS]);
  };

  const sortearNumero = (): number | null => {
    if (numerosRestantes.length === 0) return null;
    
    const i = Math.floor(Math.random() * numerosRestantes.length);
    const numero = numerosRestantes[i];
    
    setNumerosRestantes(prev => prev.filter((_, index) => index !== i));
    const novosSorteados = [...sorteados, numero];
    setSorteados(novosSorteados);
    
    // Atualizar números no banco
    if (currentSession) {
      supabase
        .from("bingo_sessions")
        .update({ numeros_sorteados: novosSorteados })
        .eq("id", currentSession.id)
        .then(({ error }) => {
          if (error) console.error("Erro ao salvar números:", error);
        });
    }
    
    return numero;
  };

  const finalizarSessao = async () => {
    if (!currentSession) return;

    const { error } = await supabase
      .from("bingo_sessions")
      .update({
        status: "finalizada",
        finalizada_at: new Date().toISOString(),
      })
      .eq("id", currentSession.id);

    if (error) {
      console.error("Erro ao finalizar sessão:", error);
      toast.error("Erro ao finalizar sessão");
      return;
    }

    setCurrentSession(null);
    setJogoIniciado(false);
    setSorteados([]);
    setNumerosRestantes([...TODOS_NUMEROS]);
    await carregarSessoes();
    toast.success("Sessão finalizada e salva!");
  };

  const resetarJogo = () => {
    setJogoIniciado(false);
    setSorteados([]);
    setNumerosRestantes([...TODOS_NUMEROS]);
    setCurrentSession(null);
  };

  return (
    <GameContext.Provider
      value={{
        jogoIniciado,
        sorteados,
        numerosRestantes,
        cartelas,
        currentSession,
        sessions,
        loadingSessions,
        iniciarJogo,
        sortearNumero,
        resetarJogo,
        finalizarSessao,
        carregarSessoes,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
