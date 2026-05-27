import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import type { Animal } from "@/components/AnimalCard";

export const Route = createFileRoute("/animais/$id")({
  component: Page,
});

const statusLabel: Record<string, string> = {
  disponivel: "Disponível para adoção",
  em_processo: "Em processo de adoção",
  adotado: "Já adotado",
};

function Page() {
  const { id } = useParams({ from: "/animais/$id" });
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("animals").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { setAnimal(data as Animal | null); setLoading(false); });
  }, [id]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando...</div></Layout>;
  if (!animal) return <Layout><div className="container mx-auto px-4 py-20 text-center"><p>Animal não encontrado.</p><Link to="/animais" className="text-primary underline mt-4 inline-block">Voltar</Link></div></Layout>;

  return (
    <Layout>
      <section className="container mx-auto px-4 py-12">
        <Link to="/animais" className="text-sm text-muted-foreground hover:text-foreground">← Voltar para animais</Link>
        <div className="grid md:grid-cols-2 gap-10 mt-6">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
            {animal.image_url ? (
              <img src={animal.image_url} alt={animal.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <PawPrint className="h-24 w-24" />
              </div>
            )}
          </div>
          <div>
            <Badge variant={animal.status === "disponivel" ? "default" : "secondary"}>{statusLabel[animal.status]}</Badge>
            <h1 className="text-4xl font-bold mt-3">{animal.name}</h1>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Espécie</dt><dd className="font-medium capitalize">{animal.species}</dd></div>
              <div><dt className="text-muted-foreground">Raça</dt><dd className="font-medium">{animal.breed || "SRD"}</dd></div>
              <div><dt className="text-muted-foreground">Idade</dt><dd className="font-medium">{animal.age_years === 0 ? "Filhote" : `${animal.age_years} ano(s)`}</dd></div>
              <div><dt className="text-muted-foreground">Porte</dt><dd className="font-medium capitalize">{animal.size}</dd></div>
              <div><dt className="text-muted-foreground">Sexo</dt><dd className="font-medium">{animal.sex === "macho" ? "Macho" : "Fêmea"}</dd></div>
            </dl>
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Sobre {animal.name}</h2>
              <p className="text-muted-foreground whitespace-pre-line">{animal.description || "Sem descrição adicional."}</p>
            </div>
            {animal.status === "disponivel" && (
              <Link to="/adotar" search={{ animal: animal.id }} className="mt-8 inline-block">
                <Button size="lg">Quero adotar {animal.name}</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
