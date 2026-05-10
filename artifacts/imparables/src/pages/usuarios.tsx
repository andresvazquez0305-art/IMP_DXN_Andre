import React, { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/context/auth";
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
import { UserPlus, Trash2, KeyRound, ShieldCheck, Users } from "lucide-react";

interface UsuarioAPI {
  idUsuario: number;
  username: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
}

export default function UsuariosPage() {
  const { getAuthHeaders, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  // Redirect non-admins
  if (!isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };

  const { data: usuarios = [], isLoading } = useQuery<UsuarioAPI[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const res = await fetch("/api/usuarios", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json() as Promise<UsuarioAPI[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error((json as { error: string }).error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Usuario creado correctamente" });
      setNewUsername("");
      setNewPassword("");
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error((json as { error: string }).error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Usuario eliminado correctamente" });
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      const res = await fetch(`/api/usuarios/${id}/password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ password }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error((json as { error: string }).error);
      return json;
    },
    onSuccess: () => {
      toast({ title: "Contraseña actualizada correctamente" });
      setResetId(null);
      setResetPassword("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ username: newUsername, password: newPassword });
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
            <p className="text-muted-foreground text-sm">Solo el administrador puede ver y gestionar estas cuentas</p>
          </div>
        </div>

        {/* Create user form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Crear cuenta de vendedor
          </h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-username">Usuario</Label>
              <Input
                id="new-username"
                data-testid="input-new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="nombre de usuario"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Contraseña</Label>
              <Input
                id="new-password"
                data-testid="input-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="mín. 6 caracteres"
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                data-testid="button-create-user"
                disabled={createMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </div>

        {/* Users list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-lg">Cuentas activas</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay cuentas de vendedor registradas. Crea una arriba.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {usuarios.map((u) => (
                <li key={u.idUsuario} data-testid={`row-usuario-${u.idUsuario}`} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary-foreground">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{u.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.rol} · Creado {new Date(u.creadoEn).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Reset password */}
                    {resetId === u.idUsuario ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          placeholder="nueva contraseña"
                          className="w-40 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => resetMutation.mutate({ id: u.idUsuario, password: resetPassword })}
                          disabled={resetMutation.isPending || resetPassword.length < 6}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                        >
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setResetId(null); setResetPassword(""); }} className="h-8">
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`button-reset-password-${u.idUsuario}`}
                        onClick={() => { setResetId(u.idUsuario); setResetPassword(""); }}
                        className="gap-1.5 h-8"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Cambiar clave
                      </Button>
                    )}

                    {/* Delete user */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-delete-usuario-${u.idUsuario}`}
                          className="gap-1.5 h-8 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar la cuenta de <strong>{u.username}</strong>? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(u.idUsuario)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Admin account info */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Cuenta de administrador</p>
            <p className="text-muted-foreground text-sm mt-1">
              El usuario administrador está protegido por variables de entorno del sistema y no aparece en esta lista. Su contraseña solo puede cambiarse desde el panel de secretos de Replit.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
