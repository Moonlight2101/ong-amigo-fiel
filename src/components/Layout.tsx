import { Link } from "@tanstack/react-router";
import { PawPrint, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Início" },
    { to: "/animais", label: "Animais" },
    { to: "/sobre", label: "Sobre" },
    { to: "/adotar", label: "Adotar" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/60 bg-background/75 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl tracking-tight">
            <span className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center shadow-soft">
              <PawPrint className="h-4 w-4 text-primary-foreground" />
            </span>
            <span>Amigo Fiel</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-sm text-gold font-medium">
                Painel
              </Link>
            )}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
                Sair
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-full px-5 gradient-primary text-primary-foreground">Entrar</Button>
              </Link>
            )}
          </nav>


          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm">
                  {l.label}
                </Link>
              ))}
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-primary">Painel Admin</Link>}
              {user ? (
                <button onClick={() => supabase.auth.signOut()} className="text-sm text-left">Sair</button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="text-sm">Entrar</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border/60 bg-secondary/30">
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center">
              <PawPrint className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
            <span className="font-display text-foreground">Amigo Fiel</span>
            <span className="text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-7 text-xs uppercase tracking-wider">
            <Link to="/sobre" className="hover:text-gold transition-colors">Sobre</Link>
            <Link to="/animais" className="hover:text-gold transition-colors">Animais</Link>
            <Link to="/adotar" className="hover:text-gold transition-colors">Adotar</Link>

      </footer>
    </div>
  );
}
