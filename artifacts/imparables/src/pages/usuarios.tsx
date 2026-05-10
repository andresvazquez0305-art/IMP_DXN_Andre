import React, { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, ShieldCheck, Users, Send } from "lucide-react";

interface InvitationAPI {
  id: string;
  email: string;
  creadoEn: number;
}

export default function UsuariosPage() {
  const { data: me, isLoading: roleLoading } = useRole();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  if (roleLoading) return null;
  if (me?.rol !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const { data: invitations = [], isLoading } = useQuery<InvitationAPI[]>({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await fetch("/api/invitations");
      if (!res.ok) throw new Error("Error al cargar invitaciones");
      return res.json() as Promise<InvitationAPI[]>;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (emailAddr: string) => {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddr }),
      });
      const json = await res.json() as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error ?? "Error al enviar invitación");
      return json;
    },
    onSuccess: (data) => {
      toast({ title: (data as { message: string }).message ?? "Invitación enviada" });
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Error");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Invitación revocada" });
      void queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteMutation.mutate(email);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-sm">Invita negocios y vendedores por correo electrónico</p>
          </div>
        </div>

        {/* Invite form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Enviar invitación
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            El destinatario recibirá un correo con un enlace para crear su cuenta. Puede iniciar sesión con ese correo o con Google.
          </p>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">Correo electrónico</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="negocio@ejemplo.com"
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Mail className="w-4 h-4" />
                {inviteMutation.isPending ? "Enviando..." : "Invitar"}
              </Button>
            </div>
          </form>
        </div>

        {/* Pending invitations */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-lg">Invitaciones pendientes</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando...</div>
          ) : invitations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No hay invitaciones pendientes</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviada {new Date(inv.creadoEn).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revocar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revocar invitación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Revocar la invitación enviada a <strong>{inv.email}</strong>? El enlace dejará de funcionar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeMutation.mutate(inv.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revocar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">Cómo funciona</p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
              <li>El invitado recibe un correo con un enlace de acceso</li>
              <li>Puede crear su cuenta con email/contraseña o con Google</li>
              <li>Si pierde su contraseña, puede recuperarla desde la pantalla de inicio de sesión</li>
              <li>La cuenta del administrador es el correo configurado como <code className="text-xs bg-muted px-1 rounded">ADMIN_EMAIL</code></li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
