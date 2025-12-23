import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ParticipanteData {
  id: string;
  numero: number;
  nome: string;
  avatar_url: string | null;
}

interface ParticipantesContextType {
  participantes: ParticipanteData[];
  loading: boolean;
  numParaNome: Record<number, { nome: string; avatar?: string }>;
  formatarCelula: (numero: number) => string;
  getAvatar: (numero: number) => string | undefined;
  getInicial: (numero: number) => string;
}

const ParticipantesContext = createContext<ParticipantesContextType | null>(null);

export function ParticipantesProvider({ children }: { children: React.ReactNode }) {
  const [participantes, setParticipantes] = useState<ParticipanteData[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarParticipantes = useCallback(async () => {
    const { data, error } = await supabase
      .from("participantes")
      .select("id, numero, nome, avatar_url")
      .order("numero", { ascending: true });

    if (error) {
      console.error("Erro ao carregar participantes:", error);
      setLoading(false);
      return;
    }

    setParticipantes(data as ParticipanteData[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarParticipantes();

    const channel = supabase
      .channel("participantes-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participantes" },
        () => {
          carregarParticipantes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carregarParticipantes]);

  const numParaNome = useMemo(() => {
    const map: Record<number, { nome: string; avatar?: string }> = {};
    participantes.forEach((p) => {
      map[p.numero] = {
        nome: p.nome,
        avatar: p.avatar_url || undefined,
      };
    });
    return map;
  }, [participantes]);

  const formatarCelula = useCallback((numero: number): string => {
    return numParaNome[numero]?.nome || numero.toString();
  }, [numParaNome]);

  const getAvatar = useCallback((numero: number): string | undefined => {
    return numParaNome[numero]?.avatar;
  }, [numParaNome]);

  const getInicial = useCallback((numero: number): string => {
    return numParaNome[numero]?.nome?.charAt(0).toUpperCase() || numero.toString();
  }, [numParaNome]);

  return (
    <ParticipantesContext.Provider
      value={{
        participantes,
        loading,
        numParaNome,
        formatarCelula,
        getAvatar,
        getInicial,
      }}
    >
      {children}
    </ParticipantesContext.Provider>
  );
}

export function useParticipantesContext() {
  const context = useContext(ParticipantesContext);
  if (!context) {
    throw new Error("useParticipantesContext must be used within a ParticipantesProvider");
  }
  return context;
}
