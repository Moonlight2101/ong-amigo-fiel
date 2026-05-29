import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, CheckCircle2, Clock, XCircle, PawPrint, Inbox } from "lucide-react";
import type { Animal } from "@/components/AnimalCard";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Painel — Amigo Fiel" }] }),
  component: Page,
});

type Request = {
  id: string; animal_id: string | null; full_name: string; email: string; phone: string;
  address: string; age: number; profession: string | null; housing_type: string;
  has_yard: boolean; has_other_pets: boolean; has_children: boolean; reason: string;
  status: string; created_at: string;
};

function Page() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-20 text-center">Carregando...</div></Layout>;
  if (!user) return null;
  if (!isAdmin) return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Acesso negado</h1>
        <p className="text-muted-foreground mt-2">Sua conta não tem permissão de administrador.</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-soft">
            <PawPrint className="h-4 w-4 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl tracking-tight">Painel administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerencie animais e acompanhe pedidos de adoção em tempo real.</p>
          </div>
        </div>

        <Tabs defaultValue="requests" className="mt-8">
          <TabsList className="bg-secondary">
            <TabsTrigger value="requests" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Inbox className="h-4 w-4 mr-2" />Pedidos de adoção
            </TabsTrigger>
            <TabsTrigger value="animals" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <PawPrint className="h-4 w-4 mr-2" />Animais
            </TabsTrigger>
          </TabsList>
          <TabsContent value="requests" className="mt-6"><RequestsAdmin /></TabsContent>
          <TabsContent value="animals" className="mt-6"><AnimalsAdmin /></TabsContent>
        </Tabs>
      </section>
    </Layout>
  );
}

const emptyAnimal = {
  name: "", species: "cachorro", breed: "", age_years: 0,
  size: "medio", sex: "macho", description: "", image_url: "", status: "disponivel",
};

function AnimalsAdmin() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [form, setForm] = useState<any>(emptyAnimal);

  async function load() {
    const { data } = await supabase.from("animals").select("*").order("created_at", { ascending: false });
    setAnimals((data as Animal[]) || []);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(emptyAnimal); setOpen(true); }
  function openEdit(a: Animal) {
    setEditing(a);
    setForm({ ...a, breed: a.breed || "", image_url: a.image_url || "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      age_years: Number(form.age_years) || 0,
      breed: form.breed || null,
      image_url: form.image_url || null,
    };
    const { error } = editing
      ? await supabase.from("animals").update(payload).eq("id", editing.id)
      : await supabase.from("animals").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Animal atualizado" : "Animal cadastrado");
    setOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Tem certeza que deseja remover este animal?")) return;
    const { error } = await supabase.from("animals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    load();
  }

  async function quickStatus(a: Animal, status: string) {
    const { error } = await supabase.from("animals").update({ status }).eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success(`${a.name} marcado como ${status.replace("_", " ")}`);
    load();
  }

  const counts = {
    total: animals.length,
    disponivel: animals.filter(a => a.status === "disponivel").length,
    processo: animals.filter(a => a.status === "em_processo").length,
    adotado: animals.filter(a => a.status === "adotado").length,
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Total", v: counts.total, c: "text-foreground" },
          { l: "Disponíveis", v: counts.disponivel, c: "text-gold" },
          { l: "Em processo", v: counts.processo, c: "text-foreground/70" },
          { l: "Adotados", v: counts.adotado, c: "text-muted-foreground" },
        ].map(s => (
          <div key={s.l} className="border rounded-xl p-4 bg-card">
            <div className={`font-display text-3xl ${s.c}`}>{s.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Animais cadastrados</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gradient-primary text-primary-foreground rounded-full"><Plus className="h-4 w-4 mr-1" />Novo animal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editing ? "Editar" : "Novo"} animal</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Espécie</Label>
                  <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cachorro">Cachorro</SelectItem>
                      <SelectItem value="gato">Gato</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Raça</Label><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></div>
                <div><Label>Idade (anos)</Label><Input type="number" min={0} value={form.age_years} onChange={(e) => setForm({ ...form, age_years: e.target.value })} /></div>
                <div>
                  <Label>Porte</Label>
                  <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="femea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_processo">Em processo</SelectItem>
                      <SelectItem value="adotado">Adotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>URL da foto</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Descrição</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {animals.map((a) => {
          const statusLabel: Record<string, string> = { disponivel: "Disponível", em_processo: "Em processo", adotado: "Adotado" };
          const statusIcon: Record<string, any> = { disponivel: CheckCircle2, em_processo: Clock, adotado: XCircle };
          const StatusIcon = statusIcon[a.status] || CheckCircle2;
          const nextStatus = a.status === "disponivel" ? "adotado" : "disponivel";
          return (
            <div key={a.id} className="group border rounded-xl p-4 flex items-center gap-4 bg-card hover:shadow-elegant transition-all">
              <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 border">
                {a.image_url && <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg">{a.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{a.species} · {a.size} · {a.sex} · {a.age_years} {a.age_years === 1 ? "ano" : "anos"}</div>
              </div>
              <Badge
                className={
                  a.status === "disponivel" ? "bg-gold text-foreground border-0" :
                  a.status === "em_processo" ? "bg-secondary text-foreground border" :
                  "bg-muted text-muted-foreground border"
                }
              >
                <StatusIcon className="h-3 w-3 mr-1" />{statusLabel[a.status] || a.status}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => quickStatus(a, nextStatus)} title="Alternar disponibilidade">
                {a.status === "disponivel" ? "Marcar adotado" : "Marcar disponível"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openEdit(a)} title="Editar"><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)} title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          );
        })}
        {animals.length === 0 && <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">Nenhum animal cadastrado ainda.</div>}
      </div>
    </div>
  );
}

function RequestsAdmin() {
  const [reqs, setReqs] = useState<Request[]>([]);
  const [selected, setSelected] = useState<Request | null>(null);

  async function load() {
    const { data } = await supabase.from("adoption_requests").select("*").order("created_at", { ascending: false });
    setReqs((data as Request[]) || []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("adoption_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
    load();
    setSelected(null);
  }

  async function remove(id: string) {
    if (!confirm("Remover este pedido?")) return;
    await supabase.from("adoption_requests").delete().eq("id", id);
    load();
    setSelected(null);
  }

  return (
    <div>
      <h2 className="font-semibold mb-4">{reqs.length} pedido(s) recebido(s)</h2>
      <div className="grid gap-3">
        {reqs.map((r) => (
          <button key={r.id} onClick={() => setSelected(r)} className="border rounded-lg p-4 flex items-center gap-4 bg-card text-left hover:bg-accent/30">
            <div className="flex-1 min-w-0">
              <div className="font-medium">{r.full_name}</div>
              <div className="text-xs text-muted-foreground truncate">{r.email} · {r.phone}</div>
            </div>
            <div className="text-xs text-muted-foreground hidden md:block">
              {new Date(r.created_at).toLocaleDateString("pt-BR")}
            </div>
            <Badge variant={r.status === "pendente" ? "default" : r.status === "aprovado" ? "secondary" : "destructive"}>
              {r.status}
            </Badge>
          </button>
        ))}
        {reqs.length === 0 && <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">Nenhum pedido ainda.</div>}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.full_name}</DialogTitle></DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">E-mail</dt><dd>{selected.email}</dd></div>
                <div><dt className="text-muted-foreground">Telefone</dt><dd>{selected.phone}</dd></div>
                <div><dt className="text-muted-foreground">Idade</dt><dd>{selected.age}</dd></div>
                <div><dt className="text-muted-foreground">Profissão</dt><dd>{selected.profession || "—"}</dd></div>
                <div className="col-span-2"><dt className="text-muted-foreground">Endereço</dt><dd>{selected.address}</dd></div>
                <div><dt className="text-muted-foreground">Moradia</dt><dd className="capitalize">{selected.housing_type}</dd></div>
                <div><dt className="text-muted-foreground">Quintal</dt><dd>{selected.has_yard ? "Sim" : "Não"}</dd></div>
                <div><dt className="text-muted-foreground">Outros pets</dt><dd>{selected.has_other_pets ? "Sim" : "Não"}</dd></div>
                <div><dt className="text-muted-foreground">Crianças</dt><dd>{selected.has_children ? "Sim" : "Não"}</dd></div>
                <div className="col-span-2"><dt className="text-muted-foreground">Motivo</dt><dd className="whitespace-pre-line">{selected.reason}</dd></div>
              </dl>
              <div className="flex gap-2 pt-4 border-t">
                <Button size="sm" onClick={() => updateStatus(selected.id, "aprovado")}>Aprovar</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "recusado")}>Recusar</Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, "pendente")}>Pendente</Button>
                <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => remove(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
