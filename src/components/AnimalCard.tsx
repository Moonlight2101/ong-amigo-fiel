import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PawPrint } from "lucide-react";

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

export function AnimalCard({ animal }: { animal: Animal }) {
  return (
    <Link to="/animais/$id" params={{ id: animal.id }} className="group">
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow border-border/60">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {animal.image_url ? (
            <img
              src={animal.image_url}
              alt={animal.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <PawPrint className="h-12 w-12" />
            </div>
          )}
          <Badge
            variant={animal.status === "disponivel" ? "default" : "secondary"}
            className="absolute top-3 right-3"
          >
            {statusLabel[animal.status]}
          </Badge>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <h3 className="font-semibold text-lg">{animal.name}</h3>
          <p className="text-sm text-muted-foreground">
            {animal.breed || (animal.species === "cachorro" ? "SRD" : "Sem raça definida")} ·{" "}
            {animal.age_years === 0 ? "Filhote" : `${animal.age_years} ano${animal.age_years > 1 ? "s" : ""}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Porte {sizeLabel[animal.size]} · {animal.sex === "macho" ? "Macho" : "Fêmea"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
