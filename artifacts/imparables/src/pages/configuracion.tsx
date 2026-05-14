import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, CheckCircle2, AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";

interface MySQLConfigStatus {
  configured: boolean;
  host?: string;
  port?: number;
  user?: string;
  database?: string;
}

async function fetchConfig(): Promise<MySQLConfigStatus> {
  const res = await fetch("/api/mysql-config");
  if (!res.ok) throw new Error("Error al obtener configuración");
  return res.json() as Promise<MySQLConfigStatus>;
}

async function testConfig(data: Record<string, string | number>): Promise<{ ok: boolean; message: string }> {
  const res = await fetch("/api/mysql-config/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Error de conexión");
  return json as { ok: boolean; message: string };
}

async function saveConfig(data: Record<string, string | number>): Promise<{ ok: boolean; message: string }> {
  const res = await fetch("/api/mysql-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
  if (!res.ok) throw new Error(json.error ?? "Error al guardar");
  return json as { ok: boolean; message: string };
}

export default function Configuracion() {
  const { data: me, isLoading: roleLoading } = useRole();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    host: "",
    port: "3306",
    user: "",
    password: "",
    database: "DXN",
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["mysql-config"],
    queryFn: fetchConfig,
    enabled: me?.rol === "admin",
  });

  const testMutation = useMutation({
    mutationFn: () =>
      testConfig({ ...form, port: parseInt(form.port, 10) || 3306 }),
    onSuccess: (data) => {
      toast({ title: "Conexión exitosa", description: data.message });
    },
    onError: (err: Error) => {
      toast({ title: "Error de conexión", description: err.message, variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      saveConfig({ ...form, port: parseInt(form.port, 10) || 3306 }),
    onSuccess: (data) => {
      toast({ title: "Configuración guardada", description: data.message });
      void qc.invalidateQueries({ queryKey: ["mysql-config"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    },
  });

  if (roleLoading) return null;
  if (me?.rol !== "admin") return <Redirect to="/dashboard" />;

  const isConfigured = config?.configured;
  const isBusy = testMutation.isPending || saveMutation.isPending;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración MySQL</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Conecta la aplicación a tu servidor de base de datos MySQL (phpMyAdmin).
          </p>
        </div>

        {/* Estado actual */}
        {!configLoading && (
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              isConfigured
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {isConfigured ? (
              <>
                <Wifi className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Servidor conectado</p>
                  <p className="opacity-75">
                    {config?.user}@{config?.host}:{config?.port} → base de datos <strong>{config?.database}</strong>
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 ml-auto flex-shrink-0" />
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Sin configurar</p>
                  <p className="opacity-75">Ingresa los datos del servidor MySQL para continuar.</p>
                </div>
                <AlertCircle className="h-5 w-5 ml-auto flex-shrink-0" />
              </>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-primary" />
              Datos del servidor MySQL
            </CardTitle>
            <CardDescription>
              El servidor debe ser accesible públicamente (no puede ser <code>localhost</code> de tu PC).
              Puedes usar servicios como <strong>PlanetScale</strong>, <strong>Railway</strong> o <strong>Aiven</strong> con plan gratuito.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="host">Host / IP</Label>
                <Input
                  id="host"
                  placeholder="db.ejemplo.com"
                  value={form.host}
                  onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="port">Puerto</Label>
                <Input
                  id="port"
                  placeholder="3306"
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="user">Usuario</Label>
                <Input
                  id="user"
                  placeholder="root"
                  value={form.user}
                  onChange={(e) => setForm((f) => ({ ...f, user: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="database">Base de datos</Label>
              <Input
                id="database"
                placeholder="DXN"
                value={form.database}
                onChange={(e) => setForm((f) => ({ ...f, database: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => testMutation.mutate()}
                disabled={isBusy || !form.host || !form.user}
              >
                {testMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                Probar conexión
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={isBusy || !form.host || !form.user}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Guardar y conectar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">¿Cómo crear un servidor MySQL gratuito?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <div>
              <p className="font-medium text-foreground">Opción 1 — Railway (recomendado)</p>
              <p>1. Entra a <strong>railway.app</strong> y crea una cuenta.</p>
              <p>2. Nuevo proyecto → "Provision MySQL".</p>
              <p>3. En Variables verás <code>MYSQL_HOST</code>, <code>MYSQL_PORT</code>, <code>MYSQL_USER</code>, <code>MYSQLPASSWORD</code>, <code>MYSQL_DATABASE</code>.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Opción 2 — Aiven</p>
              <p>1. Entra a <strong>aiven.io</strong> → plan gratuito de MySQL.</p>
              <p>2. Copia host, puerto, usuario y contraseña del panel.</p>
            </div>
            <p className="text-xs mt-2">
              Una vez tengas el servidor en la nube, importa el archivo <code>imparables_dxn.sql</code> desde phpMyAdmin de ese servicio.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
