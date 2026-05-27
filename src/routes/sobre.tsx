import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Heart, ShieldCheck, Users, PawPrint } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre — Amigo Fiel" }] }),
  component: Page,
});

function Page() {
  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold">Sobre a Amigo Fiel</h1>
        <p className="text-lg text-muted-foreground mt-4">
          A ONG Amigo Fiel nasceu do desejo de transformar a realidade dos animais abandonados em
          nossa cidade. Resgatamos, tratamos, vacinamos e encaminhamos cães e gatos para lares
          responsáveis.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {[
            { icon: Heart, title: "Missão", text: "Resgatar animais em situação de risco e promover a adoção responsável." },
            { icon: ShieldCheck, title: "Visão", text: "Uma sociedade onde nenhum animal viva em situação de abandono." },
            { icon: Users, title: "Valores", text: "Respeito, transparência, empatia e responsabilidade." },
            { icon: PawPrint, title: "Atuação", text: "Resgate, cuidados veterinários, lares temporários e adoção." },
          ].map((b) => (
            <div key={b.title} className="border rounded-xl p-6 bg-card">
              <b.icon className="h-7 w-7 text-primary mb-3" />
              <h3 className="font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.text}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mt-14">Como ajudar</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground list-disc pl-5">
          <li>Adotando um dos nossos resgatados.</li>
          <li>Sendo lar temporário enquanto buscamos um lar definitivo.</li>
          <li>Doando ração, medicamentos ou contribuição financeira.</li>
          <li>Divulgando nossos animais nas redes sociais.</li>
        </ul>

        <div className="mt-12 border-t pt-8 text-sm text-muted-foreground">
          <p><strong>Contato:</strong> contato@amigofiel.org.br</p>
          <p><strong>Endereço:</strong> Rua dos Animais, 123 — Centro</p>
        </div>
      </section>
    </Layout>
  );
}
