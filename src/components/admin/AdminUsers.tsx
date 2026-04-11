import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Trash2, Search, Loader2 } from "lucide-react";

interface AdminUser {
  role_id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

interface FoundUser {
  user_id: string;
  email: string;
}

export const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchError, setSearchError] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    email: string;
    isSelf: boolean;
  }>({ open: false, userId: "", email: "", isSelf: false });
  const { toast } = useToast();

  const currentUserId = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id;
  }, []);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_admins");

    if (error) {
      toast({
        title: "Erro ao carregar admins",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setAdmins((data as AdminUser[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleSearch = async () => {
    const trimmed = searchEmail.trim();
    if (!trimmed) return;

    setSearching(true);
    setFoundUser(null);
    setSearchError("");

    const { data, error } = await supabase.rpc("find_user_by_email", {
      _email: trimmed,
    });

    if (error) {
      setSearchError(error.message);
      setSearching(false);
      return;
    }

    const results = data as FoundUser[];
    if (!results || results.length === 0) {
      setSearchError("Nenhum usuário encontrado com este e-mail.");
      setSearching(false);
      return;
    }

    // Check if already admin
    const isAlreadyAdmin = admins.some((a) => a.user_id === results[0].user_id);
    if (isAlreadyAdmin) {
      setSearchError("Este usuário já é administrador.");
      setSearching(false);
      return;
    }

    setFoundUser(results[0]);
    setSearching(false);
  };

  const handlePromote = async () => {
    if (!foundUser) return;

    setPromoting(true);
    const { error } = await supabase.rpc("promote_to_admin", {
      _user_id: foundUser.user_id,
    });

    if (error) {
      toast({
        title: "Erro ao promover",
        description: error.message,
        variant: "destructive",
      });
      setPromoting(false);
      return;
    }

    toast({
      title: "Admin adicionado",
      description: `${foundUser.email} agora é administrador.`,
    });

    setFoundUser(null);
    setSearchEmail("");
    setPromoting(false);
    loadAdmins();
  };

  const openRemoveDialog = async (userId: string, email: string) => {
    const currentId = await currentUserId();
    setConfirmDialog({
      open: true,
      userId,
      email,
      isSelf: userId === currentId,
    });
  };

  const handleRemove = async () => {
    const { userId, isSelf } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    setRemovingId(userId);

    const { error } = await supabase.rpc("remove_admin", {
      _user_id: userId,
      _confirm_self_removal: isSelf,
    });

    if (error) {
      const msg = error.message.includes("último administrador")
        ? "Não é possível remover o último administrador."
        : error.message;

      toast({
        title: "Erro ao remover",
        description: msg,
        variant: "destructive",
      });
      setRemovingId(null);
      return;
    }

    toast({
      title: "Admin removido",
      description: `Acesso de administrador removido com sucesso.`,
    });

    setRemovingId(null);

    // If self-removal, sign out
    if (isSelf) {
      await supabase.auth.signOut();
      window.location.href = "/admin/login";
      return;
    }

    loadAdmins();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Admin list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Administradores Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Nenhum administrador encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="hidden sm:table-cell">User ID</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="w-[80px]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.role_id}>
                    <TableCell className="font-medium text-sm">
                      {admin.email}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {admin.user_id.substring(0, 8)}…
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(admin.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          openRemoveDialog(admin.user_id, admin.email)
                        }
                        disabled={removingId === admin.user_id}
                      >
                        {removingId === admin.user_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Search and promote */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            Adicionar Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-email">Buscar usuário por e-mail</Label>
            <div className="flex gap-2">
              <Input
                id="search-email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setFoundUser(null);
                  setSearchError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={255}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchEmail.trim()}
                variant="secondary"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {searchError && (
            <p className="text-sm text-destructive">{searchError}</p>
          )}

          {foundUser && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">{foundUser.email}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {foundUser.user_id}
                </p>
              </div>
              <Button
                onClick={handlePromote}
                disabled={promoting}
                size="sm"
              >
                {promoting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Promover
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            O usuário precisa existir no Supabase Auth antes de ser promovido.
            Crie o usuário no Dashboard do Supabase se necessário.
          </p>
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.isSelf
                ? "Remover seu próprio acesso?"
                : "Remover administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.isSelf ? (
                <>
                  Você está prestes a remover <strong>seu próprio</strong> acesso
                  de administrador. Após confirmar, você será desconectado e não
                  poderá mais acessar o painel.
                </>
              ) : (
                <>
                  Tem certeza que deseja remover o acesso de administrador de{" "}
                  <strong>{confirmDialog.email}</strong>? Esta ação pode ser
                  revertida promovendo o usuário novamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {confirmDialog.isSelf ? "Sim, remover meu acesso" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
