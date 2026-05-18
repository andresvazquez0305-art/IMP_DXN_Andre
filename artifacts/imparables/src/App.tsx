import React from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Registrar from "@/pages/registrar";
import Listas from "@/pages/listas";
import Editar from "@/pages/editar";
import Usuarios from "@/pages/usuarios";
import Configuracion from "@/pages/configuracion";

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return <Component />;
}

function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
          <Route path="/registrar">{() => <ProtectedRoute component={Registrar} />}</Route>
          <Route path="/listas">{() => <ProtectedRoute component={Listas} />}</Route>
          <Route path="/editar">{() => <ProtectedRoute component={Editar} />}</Route>
          <Route path="/usuarios">{() => <ProtectedRoute component={Usuarios} />}</Route>
          <Route path="/configuracion">{() => <ProtectedRoute component={Configuracion} />}</Route>
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <Router />
    </WouterRouter>
  );
}

export default App;
