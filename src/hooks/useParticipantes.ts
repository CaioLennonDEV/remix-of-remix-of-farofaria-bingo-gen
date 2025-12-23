import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Participante {
  id: string;
  numero: number;
  nome: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useParticipantes() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarParticipantes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("participantes")
      .select("*")
      .order("numero", { ascending: true });

    if (error) {
      console.error("Erro ao carregar participantes:", error);
      toast.error("Erro ao carregar participantes");
      setLoading(false);
      return;
    }

    setParticipantes(data as Participante[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregarParticipantes();

    // Realtime subscription
    const channel = supabase
      .channel("participantes-changes")
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

  const adicionarParticipante = async (
    numero: number,
    nome: string,
    avatarFile?: File
  ) => {
    let avatar_url: string | null = null;

    // Upload do avatar se houver
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${numero}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, avatarFile);

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError);
        toast.error("Erro ao fazer upload da foto");
        return false;
      }

      const { data: urlData } = supabase.storage
        .from("avatares")
        .getPublicUrl(fileName);
      
      avatar_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("participantes").insert({
      numero,
      nome,
      avatar_url,
    });

    if (error) {
      console.error("Erro ao adicionar participante:", error);
      if (error.code === "23505") {
        toast.error("Este número já está em uso");
      } else {
        toast.error("Erro ao adicionar participante");
      }
      return false;
    }

    toast.success("Participante adicionado!");
    return true;
  };

  const atualizarParticipante = async (
    id: string,
    numero: number,
    nome: string,
    avatarFile?: File
  ) => {
    let avatar_url: string | undefined;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${numero}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(fileName, avatarFile);

      if (uploadError) {
        console.error("Erro ao fazer upload:", uploadError);
        toast.error("Erro ao fazer upload da foto");
        return false;
      }

      const { data: urlData } = supabase.storage
        .from("avatares")
        .getPublicUrl(fileName);
      
      avatar_url = urlData.publicUrl;
    }

    const updateData: { numero: number; nome: string; avatar_url?: string } = {
      numero,
      nome,
    };

    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    const { error } = await supabase
      .from("participantes")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar participante:", error);
      if (error.code === "23505") {
        toast.error("Este número já está em uso");
      } else {
        toast.error("Erro ao atualizar participante");
      }
      return false;
    }

    toast.success("Participante atualizado!");
    return true;
  };

  const removerParticipante = async (id: string) => {
    const { error } = await supabase.from("participantes").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover participante:", error);
      toast.error("Erro ao remover participante");
      return false;
    }

    toast.success("Participante removido!");
    return true;
  };

  // Função para obter mapeamento número -> participante
  const getNumeroParaNome = (): Record<number, { nome: string; avatar?: string }> => {
    const map: Record<number, { nome: string; avatar?: string }> = {};
    participantes.forEach((p) => {
      map[p.numero] = {
        nome: p.nome,
        avatar: p.avatar_url || undefined,
      };
    });
    return map;
  };

  return {
    participantes,
    loading,
    adicionarParticipante,
    atualizarParticipante,
    removerParticipante,
    carregarParticipantes,
    getNumeroParaNome,
  };
}
