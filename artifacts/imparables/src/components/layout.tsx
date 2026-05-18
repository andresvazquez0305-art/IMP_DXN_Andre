import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PlusCircle, List, Edit, LogOut, Users, Settings } from "lucide-react";
//import { useClerk } from "@clerk/react";
import { useRole } from "@/hooks/useRole";

export function Layout({ children }: { children: React.ReactNode }) {
  return <Sidebar>{children}</Sidebar>;
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  //Clerk desactivado temporalmente
  const { data: me } = useRole();

  const isAdmin = me?.rol === "admin";

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/registrar", label: "Registrar", icon: PlusCircle },
    { href: "/listas", label: "Listas & Reportes", icon: List },
    { href: "/editar", label: "Editar & Eliminar", icon: Edit },
  ];

  const handleLogout = () => {
     setLocation("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col flex-shrink-0 relative z-10">
        <div className="p-5 border-b border-sidebar-border flex items-center justify-center">
          <Link href="/">
            <img src="/logo.png" alt="Imparables SA" className="h-14 w-auto cursor-pointer" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {links.map((link) => {
            const isActive = location.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Administración</p>
              </div>
              <Link
                href="/usuarios"
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.startsWith("/usuarios") ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}`}
              >
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </Link>
              <Link
                href="/configuracion"
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.startsWith("/configuracion") ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-primary"}`}
              >
                <Settings className="h-5 w-5" />
                Configuración MySQL
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          {me && (
            <div className="flex items-center gap-2 px-2 py-1">
              {me.imageUrl ? (
                <img src={me.imageUrl} alt={me.nombre ?? ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {(me.nombre ?? me.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{me.nombre ?? me.email}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Vendedor"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-background">
          <Link href="/">
            <img src="/logo.png" alt="Imparables SA" className="h-10 w-auto cursor-pointer" />
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
