import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/checkIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128),
});

const bootstrapKeySchema = z.object({
  key: z.string().min(1, "Chave de bootstrap é obrigatória").max(256),
});

type LoginState = "login" | "bootstrap";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<LoginState>("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({
        title: "Erro de validação",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: "E-mail ou senha incorretos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check admin role after successful authentication
    const isAdmin = await checkIsAdmin();
    if (isAdmin) {
      navigate("/admin");
      return;
    }

    // Not admin — check if ANY admin exists via secure RPC
    const { data: hasAdmin, error: rpcError } = await supabase.rpc("admin_exists");

    if (rpcError || hasAdmin === null) {
      // On error, assume admins exist for safety
      await supabase.auth.signOut();
      toast({
        title: "Acesso negado",
        description: "Você não possui permissão de administrador.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!hasAdmin) {
      // No admins in the system — show bootstrap UI
      setState("bootstrap");
      setLoading(false);
      return;
    }

    // Admin exists but this user isn't one
    await supabase.auth.signOut();
    toast({
      title: "Acesso negado",
      description: "Você não possui permissão de administrador.",
      variant: "destructive",
    });
    setLoading(false);
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = bootstrapKeySchema.safeParse({ key: bootstrapKey });
    if (!parsed.success) {
      toast({
        title: "Erro de validação",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc("bootstrap_first_admin", {
      _bootstrap_key: parsed.data.key,
    });

    if (error) {
      toast({
        title: "Erro no bootstrap",
        description: error.message.includes("já existe")
          ? "Já existe um administrador no sistema."
          : error.message.includes("inválida")
          ? "Chave de bootstrap inválida."
          : "Erro ao configurar administrador.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Sucesso!",
      description: "Você foi configurado como o primeiro administrador.",
    });
    navigate("/admin");
  };

  const handleCancelBootstrap = async () => {
    await supabase.auth.signOut();
    setState("login");
    setBootstrapKey("");
  };

  if (state === "bootstrap") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Key className="h-6 w-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl">Bootstrap do Administrador</CardTitle>
            <CardDescription>
              Nenhum administrador encontrado. Insira a chave de bootstrap para configurar o primeiro administrador do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bootstrap-key">Chave de Bootstrap</Label>
                <Input
                  id="bootstrap-key"
                  type="password"
                  value={bootstrapKey}
                  onChange={(e) => setBootstrapKey(e.target.value)}
                  placeholder="Cole a chave de bootstrap aqui"
                  required
                  maxLength={256}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Configurando..." : "Ativar Administrador"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleCancelBootstrap}
                disabled={loading}
              >
                Cancelar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                maxLength={128}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
