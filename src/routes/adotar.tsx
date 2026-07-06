import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Animal } from "@/components/AnimalCard";

type Search = { animal?: string };

export const Route = createFileRoute("/adotar")({
  head: () => ({ meta: [{ title: "Formulário de Adoção — Amigo Fiel" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    animal: typeof s.animal === "string" ? s.animal : undefined,
  }),
  component: Page,
});

type Errors = Partial<Record<
  "full_name" | "age" | "email" | "phone" | "address" | "housing_type" | "reason" | "agree_responsibility",
  string
>>;

function validate(form: {
  full_name: string; age: string; email: string; phone: string; address: string;
  housing_type: string; reason: string; agree_responsibility: boolean;
}): Errors {
  const errors: Errors = {};
  if (!form.full_name.trim()) errors.full_name = "Informe seu nome completo.";
  const ageNum = Number(form.age);
  if (!form.age.trim() || !Number.isFinite(ageNum) || ageNum <= 0) errors.age = "Informe sua idade.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) errors.email = "Digite um e-mail válido.";
  const phoneDigits = form.phone.replace(/\D/g, "");
  if (phoneDigits.length < 8) errors.phone = "Informe um telefone válido.";
  if (!form.address.trim()) errors.address = "Preencha o endereço completo.";
  if (!form.housing_type) errors.housing_type = "Selecione o tipo de moradia.";
  if (!form.reason.trim()) errors.reason = "Explique por que deseja adotar.";
  if (!form.agree_responsibility) errors.agree_responsibility = "É necessário aceitar a declaração de responsabilidade.";
  return errors;
}

function Page() {
  const { animal: animalParam } = Route.useSearch();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
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
    if (k in errors) setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  const errorBorder = "border-destructive focus-visible:ring-destructive";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowSummary(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setShowSummary(false);
    setSubmitting(true);
    const { error } = await supabase.from("adoption_requests").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      age: Number(form.age),
      profession: form.profession.trim() || null,
      housing_type: form.housing_type,
      has_yard: form.has_yard,
      has_other_pets: form.has_other_pets,
      has_children: form.has_children,
      reason: form.reason.trim(),
      agree_responsibility: form.agree_responsibility,
      animal_id: form.animal_id || null,
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

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5 bg-card border rounded-xl p-6">
          {showSummary && Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium"
            >
              Existem campos obrigatórios que precisam ser preenchidos antes do envio da solicitação.
            </div>
          )}

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
            <div>
              <Label>Nome completo *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className={cn(errors.full_name && errorBorder)} />
              {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <Label>Idade *</Label>
              <Input type="number" value={form.age} onChange={(e) => update("age", e.target.value)} className={cn(errors.age && errorBorder)} />
              {errors.age && <p className="text-sm text-destructive mt-1">{errors.age}</p>}
            </div>
            <div>
              <Label>E-mail *</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={cn(errors.email && errorBorder)} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={cn(errors.phone && errorBorder)} />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label>Endereço completo *</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} className={cn(errors.address && errorBorder)} />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
          </div>
          <div><Label>Profissão</Label><Input value={form.profession} onChange={(e) => update("profession", e.target.value)} /></div>

          <div>
            <Label>Tipo de moradia *</Label>
            <Select value={form.housing_type} onValueChange={(v) => update("housing_type", v)}>
              <SelectTrigger className={cn(errors.housing_type && errorBorder)}><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="chacara">Chácara/Sítio</SelectItem>
              </SelectContent>
            </Select>
            {errors.housing_type && <p className="text-sm text-destructive mt-1">{errors.housing_type}</p>}
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
            <Textarea value={form.reason} onChange={(e) => update("reason", e.target.value)} rows={4} className={cn(errors.reason && errorBorder)} />
            {errors.reason && <p className="text-sm text-destructive mt-1">{errors.reason}</p>}
          </div>

          <div className={cn("border-t pt-4", errors.agree_responsibility && "border-destructive")}>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={form.agree_responsibility} onCheckedChange={(v) => update("agree_responsibility", !!v)} />
              <span>Declaro que tenho condições financeiras e estruturais para cuidar do animal e me comprometo com sua saúde e bem-estar por toda a vida.</span>
            </label>
            {errors.agree_responsibility && <p className="text-sm text-destructive mt-1">{errors.agree_responsibility}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar pedido de adoção"}
          </Button>
        </form>
      </section>
    </Layout>
  );
}
