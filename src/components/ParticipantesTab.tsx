import { useState, useRef } from "react";
import { useParticipantes, Participante } from "@/hooks/useParticipantes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Upload, Users } from "lucide-react";

export function ParticipantesTab() {
  const {
    participantes,
    loading,
    adicionarParticipante,
    atualizarParticipante,
    removerParticipante,
  } = useParticipantes();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Participante | null>(null);
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNumero("");
    setNome("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditando(null);
  };

  const handleOpenDialog = (participante?: Participante) => {
    if (participante) {
      setEditando(participante);
      setNumero(participante.numero.toString());
      setNome(participante.nome);
      setAvatarPreview(participante.avatar_url);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!numero || !nome) {
      return;
    }

    setSaving(true);

    const num = parseInt(numero);
    if (num < 1 || num > 75) {
      setSaving(false);
      return;
    }

    let success = false;

    if (editando) {
      success = await atualizarParticipante(editando.id, num, nome, avatarFile || undefined);
    } else {
      success = await adicionarParticipante(num, nome, avatarFile || undefined);
    }

    setSaving(false);

    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const handleRemover = async (id: string) => {
    await removerParticipante(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gerenciar Participantes ({participantes.length}/75)
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editando ? "Editar Participante" : "Novo Participante"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-24 h-24 border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt="Preview" />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Clique para adicionar foto
                </p>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número (1-75)</Label>
                  <Input
                    id="numero"
                    type="number"
                    min="1"
                    max="75"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ex: 42"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={saving || !numero || !nome}
                  className="w-full"
                >
                  {saving ? "Salvando..." : editando ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {participantes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum participante cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Adicione participantes para substituir números no bingo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {participantes.map((p) => (
                <Card
                  key={p.id}
                  className="relative group hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      {p.avatar_url ? (
                        <AvatarImage src={p.avatar_url} alt={p.nome} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-festive-pink to-festive-purple text-white text-xl">
                          {p.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="font-bold text-lg text-primary">
                      #{p.numero}
                    </div>
                    <div className="text-sm font-medium truncate">{p.nome}</div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleOpenDialog(p)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover participante?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover "{p.nome}" (#{p.numero})?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemover(p.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
