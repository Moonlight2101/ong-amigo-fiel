import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir Senha — Amigo Fiel" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Link inválido ou expirado.");
        setReady(false);
      } else {
        setReady(true);
      }
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("As senhas não coincidem.");
    }
    if (password.length < 6) {
      return toast.error("A senha deve ter pelo menos 6 caracteres.");
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada com sucesso!");
    navigate({ to: "/auth" });
  }

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <h1 className="text-3xl font-bold text-center">Redefinir senha</h1>
        <p className="text-muted-foreground text-center mt-2 text-sm">
          Digite sua nova senha abaixo.
        </p>

        <form onSubmit={handleReset} className="space-y-4 mt-6 bg-card border rounded-xl p-6">
          <div>
            <Label>Nova senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <Label>Confirmar nova senha</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !ready}>
            {ready ? "Atualizar senha" : "Verificando link..."}
          </Button>
        </form>
      </section>
    </Layout>
  );
}
