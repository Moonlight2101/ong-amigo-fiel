import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint, ArrowUpRight } from "lucide-react";

export type Animal = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number;
  size: string;
  sex: string;
  description: string;
  image_url: string | null;
  status: string;
};

const sizeLabel: Record<string, string> = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };
const statusLabel: Record<string, string> = {
  disponivel: "Disponível",
  em_processo: "Em processo",
  adotado: "Adotado",
};
const speciesLabel: Record<string, string> = {
  cachorro: "Cão",
  gato: "Gato",
  outro: "Outro",
};

export function AnimalCard({ animal }: { animal: Animal }) {
  const isAdopted = animal.status === "adotado";
  const isProcess = animal.status === "em_processo";
  const statusClass = isAdopted
    ? "bg-foreground text-background"
    : isProcess
      ? "bg-secondary text-secondary-foreground"
      : "bg-gold/90 text-primary-foreground";

  return (
    <Link to="/animais/$id" params={{ id: animal.id }} className="group block">
      <Card className="overflow-hidden h-full flex flex-col border-border/70 bg-card hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 rounded-2xl p-0">
        <div className="aspect-[4/5] bg-muted relative overflow-hidden">
          {animal.image_url ? (
            <img
              src={animal.image_url}
              alt={animal.name}
              loading="lazy"
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-out`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <PawPrint className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          {isAdopted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rotate-[-8deg] px-6 py-2 border-2 border-white/90 text-white font-display text-3xl tracking-widest uppercase bg-black/30 backdrop-blur-sm rounded">
                Adotado
              </span>
            </div>
          )}
          <Badge
            className="absolute top-4 left-4 bg-background/90 text-foreground border-0 backdrop-blur"
          >
            {speciesLabel[animal.species] ?? animal.species}
          </Badge>
          <span className={`absolute top-4 right-4 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full font-medium ${statusClass}`}>
            {statusLabel[animal.status]}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl leading-tight">{animal.name}</h3>
                <p className="text-xs opacity-85 mt-0.5">
                  {animal.breed || "SRD"} · {animal.age_years === 0 ? "Filhote" : `${animal.age_years} ${animal.age_years > 1 ? "anos" : "ano"}`}
                </p>
              </div>
              <span className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-gold group-hover:text-primary-foreground transition-colors">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
        <div className="px-5 py-3.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Porte {sizeLabel[animal.size]}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{animal.sex === "macho" ? "Macho" : "Fêmea"}</span>
        </div>
      </Card>
    </Link>
  );
}

