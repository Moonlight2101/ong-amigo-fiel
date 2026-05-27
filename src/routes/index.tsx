import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AnimalCard, type Animal } from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Home } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amigo Fiel — ONG de Resgate e Adoção Animal" },
      { name: "description", content: "Conheça os animais resgatados pela ONG Amigo Fiel e dê um novo lar a um amigo de quatro patas." },
    ],
  }),
  component: Index,
});

function Index() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    supabase
      .from("animals")
      .select("*")
      .eq("status", "disponivel")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setAnimals((data as Animal[]) || []));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-wider text-primary mb-4">
              ONG de Resgate Animal
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Cada resgate é o começo de uma nova história.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Somos a <strong>Amigo Fiel</strong>, uma ONG dedicada ao resgate, cuidado e
              adoção responsável de cães e gatos. Conheça nossos animais e mude uma vida.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/animais">
                <Button size="lg">Conhecer animais</Button>
              </Link>
              <Link to="/sobre">
                <Button size="lg" variant="outline">Sobre o projeto</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Cão e gato resgatados pela ONG Amigo Fiel"
              width={1024}
              height={1024}
              className="rounded-2xl shadow-xl object-cover aspect-square w-full"
            />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-secondary/40 py-14">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Resgate com amor", text: "Acolhemos animais em situação de abandono e maus-tratos." },
            { icon: ShieldCheck, title: "Adoção responsável", text: "Aplicamos um questionário rigoroso para garantir lares seguros." },
            { icon: Home, title: "Um lar para sempre", text: "Acompanhamos cada adoção para que ninguém volte para a rua." },
          ].map((v) => (
            <div key={v.title} className="bg-background rounded-xl p-6 border">
              <v.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destaques */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Animais em destaque</h2>
            <p className="text-muted-foreground mt-1">Esses peludos estão prontos para encontrar um novo lar.</p>
          </div>
          <Link to="/animais" className="text-sm text-primary hover:underline hidden md:block">
            Ver todos →
          </Link>
        </div>
        {animals.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
            <p>Ainda não há animais cadastrados.</p>
            <p className="text-sm mt-2">Os administradores podem cadastrar no painel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((a) => <AnimalCard key={a.id} animal={a} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Pronto para adotar?</h2>
          <p className="opacity-90 mb-6 max-w-xl mx-auto">
            Preencha nosso formulário de adoção responsável. Nossa equipe entrará em contato.
          </p>
          <Link to="/adotar">
            <Button size="lg" variant="secondary">Quero adotar</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
