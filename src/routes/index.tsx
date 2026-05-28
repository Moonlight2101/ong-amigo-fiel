import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { AnimalCard, type Animal } from "@/components/AnimalCard";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Home, ArrowRight, PawPrint, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amigo Fiel — ONG de Resgate e Adoção Animal" },
      { name: "description", content: "Conheça os animais resgatados pela ONG Amigo Fiel — cães, gatos, cavalos e mais. Adoção responsável com acompanhamento." },
    ],
  }),
  component: Index,
});

function Index() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [stats, setStats] = useState({ total: 0, disponivel: 0, adotado: 0 });

  useEffect(() => {
    supabase
      .from("animals")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data as Animal[]) || [];
        setAnimals(list.filter((a) => a.status === "disponivel").slice(0, 8));
        setStats({
          total: list.length,
          disponivel: list.filter((a) => a.status === "disponivel").length,
          adotado: list.filter((a) => a.status === "adotado").length,
        });
      });
  }, []);

  return (
    <Layout>
      {/* HERO */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div className="container mx-auto px-6 py-20 md:py-32 grid md:grid-cols-12 gap-10 items-center relative">
          <div className="md:col-span-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary mb-6">
              <span className="h-px w-8 bg-gold" /> ONG de Resgate Animal · Desde 2018
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight text-balance">
              Cada resgate é o início de uma <em className="text-gold not-italic font-display">nova história</em>.
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Somos a <strong className="text-foreground">Amigo Fiel</strong>, uma ONG dedicada ao resgate,
              cuidado e adoção responsável de cães, gatos, cavalos e outros animais. Encontre o seu próximo melhor amigo.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/animais">
                <Button size="lg" className="rounded-full px-7 h-12 gradient-primary text-primary-foreground shadow-soft hover:shadow-elegant">
                  Conhecer animais <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sobre">
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 border-foreground/15">
                  Nossa história
                </Button>
              </Link>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 max-w-md">
              {[
                { k: stats.total || "—", l: "Resgatados" },
                { k: stats.disponivel || "—", l: "Para adoção" },
                { k: "100%", l: "Acompanhados" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-3xl text-primary">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-5 relative animate-fade-up">
            <div className="absolute -inset-4 gradient-gold opacity-20 blur-3xl rounded-full" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant border border-gold/20">
              <img src={hero} alt="Animais resgatados pela ONG Amigo Fiel" className="w-full h-full object-cover" />
            </div>

            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: "Resgate com amor", text: "Acolhemos animais em situação de abandono, maus-tratos ou risco." },
            { icon: ShieldCheck, title: "Adoção responsável", text: "Avaliamos cada candidato para garantir lares verdadeiramente seguros." },
            { icon: Home, title: "Lar para sempre", text: "Acompanhamos a adaptação para que ninguém volte para a rua." },
          ].map((v, i) => (
            <div key={v.title} className="group relative bg-card border border-border/70 rounded-3xl p-8 hover:shadow-elegant transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-6 right-6 text-xs font-display text-gold/70">0{i + 1}</div>
              <span className="inline-flex h-12 w-12 rounded-2xl gradient-primary text-primary-foreground items-center justify-center mb-5 shadow-soft">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-2xl mb-2">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ANIMALS */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Em destaque
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">Conheça quem está esperando você</h2>
            <p className="text-muted-foreground mt-3">
              Cães, gatos, cavalos e outros companheiros prontos para um novo capítulo.
            </p>
          </div>
          <Link to="/animais" className="text-sm text-primary hover:text-gold transition-colors inline-flex items-center gap-2 group">
            Ver todos os animais
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {animals.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl text-muted-foreground">
            <PawPrint className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Ainda não há animais cadastrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {animals.map((a) => <AnimalCard key={a.id} animal={a} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] gradient-primary text-primary-foreground p-12 md:p-20 shadow-elegant">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold mb-5">
              <span className="h-px w-8 bg-gold" /> Adote, não compre
            </span>
            <h2 className="font-display text-4xl md:text-5xl leading-tight mb-5 text-balance">
              Pronto para mudar duas vidas ao mesmo tempo?
            </h2>
            <p className="opacity-85 mb-8 text-lg leading-relaxed">
              Preencha nosso formulário de adoção responsável. Nossa equipe entrará em contato para combinar uma visita.
            </p>
            <Link to="/adotar">
              <Button size="lg" className="rounded-full px-8 h-12 bg-gold text-primary-foreground hover:bg-gold/90 border-0 shadow-elegant">
                Quero adotar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
