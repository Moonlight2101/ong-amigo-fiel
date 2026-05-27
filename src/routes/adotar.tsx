import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { Animal } from "@/components/AnimalCard";

type Search = { animal?: string };

export const Route = createFileRoute("/adotar")({
  head: () => ({ meta: [{ title: "Formulário de Adoção — Amigo Fiel" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    animal: typeof s.animal === "string" ? s.animal : undefined,
  }),
  component: Page,
});

const schema = z.object({
  full_name: z.string().trim().min(3, "Nome muito curto").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().min(8, "Telefone inválido").max(20),
  address: z.string().trim().min(5, "Endereço obrigatório").max(255),
  age: z.coerce.number().int().min(18, "É necessário ser maior de 18 anos").max(120),
  profession: z.string().trim().max(100).optional().or(z.literal("")),
  housing_type: z.string().min(1, "Selecione"),
  has_yard: z.boolean(),
  has_other_pets: z.boolean(),
  has_children: z.boolean(),
  reason: z.string().trim().min(20, "Conte um pouco mais (mín. 20 caracteres)").max(1000),
  agree_responsibility: z.literal(true, { errorMap: () => ({ message: "É necessário concordar" }) }),
  animal_id: z.string().uuid().optional().nullable(),
});

function Page() {
  const { animal: animalParam } = Route.useSearch();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", address: "", age: "",
    profession: "", housing_type: "", has_yard: false, has_other_pets: false,
    has_children: false, reason: "", agree_responsibility: false,
    animal_id: animalParam || "",
  });

  useEffect(() => {
    supabase.from("animals").select("*").eq("status", "disponivel").order("name")
      .then(({ data }) => setAnimals((data as Animal[]) || []));
  }, []);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      animal_id: form.animal_id || null,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("adoption_requests").insert({
      ...parsed.data,
      profession: parsed.data.profession || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao enviar: " + error.message);
      return;
    }
    toast.success("Pedido enviado! Entraremos em contato em breve.");
    navigate({ to: "/" });
  }

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold">Formulário de adoção responsável</h1>
        <p className="text-muted-foreground mt-2">
          Adotar é um compromisso para a vida toda. Preencha com sinceridade — nossa equipe irá avaliar.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 bg-card border rounded-xl p-6">
          <div>
            <Label>Animal de interesse</Label>
            <Select value={form.animal_id || "nenhum"} onValueChange={(v) => update("animal_id", v === "nenhum" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Sem preferência</SelectItem>
                {animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Nome completo *</Label><Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required /></div>
            <div><Label>Idade *</Label><Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} required /></div>
            <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></div>
            <div><Label>Telefone *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required /></div>
          </div>

          <div><Label>Endereço completo *</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} required /></div>
          <div><Label>Profissão</Label><Input value={form.profession} onChange={(e) => update("profession", e.target.value)} /></div>

          <div>
            <Label>Tipo de moradia *</Label>
            <Select value={form.housing_type} onValueChange={(v) => update("housing_type", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="chacara">Chácara/Sítio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {[
              ["has_yard", "Possui quintal ou área externa segura"],
              ["has_other_pets", "Já possui outros animais"],
              ["has_children", "Possui crianças em casa"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm">
                <Checkbox checked={form[key as keyof typeof form] as boolean} onCheckedChange={(v) => update(key as any, !!v)} />
                {label}
              </label>
            ))}
          </div>

          <div>
            <Label>Por que deseja adotar? *</Label>
            <Textarea value={form.reason} onChange={(e) => update("reason", e.target.value)} rows={4} required />
          </div>

          <label className="flex items-start gap-3 text-sm border-t pt-4">
            <Checkbox checked={form.agree_responsibility} onCheckedChange={(v) => update("agree_responsibility", !!v)} />
            <span>Declaro que tenho condições financeiras e estruturais para cuidar do animal e me comprometo com sua saúde e bem-estar por toda a vida.</span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar pedido de adoção"}
          </Button>
        </form>
      </section>
    </Layout>
  );
}
