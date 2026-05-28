import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AnimalCard, type Animal } from "@/components/AnimalCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/animais/")({
  head: () => ({ meta: [{ title: "Animais para Adoção — Amigo Fiel" }] }),
  component: Page,
});

function Page() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState("todos");
  const [size, setSize] = useState("todos");

  useEffect(() => {
    supabase.from("animals").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setAnimals((data as Animal[]) || []));
  }, []);

  const filtered = useMemo(() => animals.filter(a => {
    if (species !== "todos" && a.species !== species) return false;
    if (size !== "todos" && a.size !== size) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [animals, q, species, size]);

  return (
    <Layout>
      <section className="container mx-auto px-6 py-16">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold mb-4">
          <span className="h-px w-8 bg-gold" /> Adoção responsável
        </span>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight text-balance max-w-3xl">Encontre seu novo melhor amigo</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Conheça os animais resgatados disponíveis para adoção. Use os filtros para encontrar quem combina com você.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-secondary/40 rounded-xl">
          <Input placeholder="Buscar por nome..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger><SelectValue placeholder="Espécie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas espécies</SelectItem>
              <SelectItem value="cachorro">Cachorro</SelectItem>
              <SelectItem value="gato">Gato</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger><SelectValue placeholder="Porte" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos portes</SelectItem>
              <SelectItem value="pequeno">Pequeno</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="grande">Grande</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center text-sm text-muted-foreground px-2">
            {filtered.length} {filtered.length === 1 ? "animal" : "animais"}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl mt-8">
            Nenhum animal encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filtered.map((a) => <AnimalCard key={a.id} animal={a} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
