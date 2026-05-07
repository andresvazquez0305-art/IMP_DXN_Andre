import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, List, Edit } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/registrar", label: "Registrar", icon: PlusCircle },
    { href: "/listas", label: "Listas & Reportes", icon: List },
    { href: "/editar", label: "Editar & Eliminar", icon: Edit },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col flex-shrink-0 relative z-10">
        <div className="p-6 border-b border-sidebar-border flex items-center justify-center">
          <Link href="/">
            <div className="font-serif text-2xl font-bold text-sidebar-primary tracking-tight cursor-pointer">
              Imparables<span className="text-sidebar-accent">SA</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const isActive = location.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}`}>
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Link href="/" className="flex justify-center items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Volver a la web
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-background">
          <Link href="/">
            <div className="font-serif text-xl font-bold text-primary cursor-pointer">
              Imparables<span className="text-secondary">SA</span>
            </div>
          </Link>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
