import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateVendedor, 
  useCreateCliente, 
  useCreateProducto, 
  useCreateVenta,
  useListClientes,
  useListVendedores,
  useListProductos,
  getListVendedoresQueryKey,
  getListClientesQueryKey,
  getListProductosQueryKey,
  getListVentasQueryKey,
  getGetResumenDashboardQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

export default function Registrar() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Registrar</h1>
          <p className="text-muted-foreground mt-1">Ingresa nueva información al sistema de Imparables SA.</p>
        </div>

        <Tabs defaultValue="vendedor" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
            <TabsTrigger value="vendedor">Vendedor</TabsTrigger>
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
            <TabsTrigger value="producto">Producto</TabsTrigger>
            <TabsTrigger value="venta">Venta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendedor">
            <FormRegistrarVendedor />
          </TabsContent>
          <TabsContent value="cliente">
            <FormRegistrarCliente />
          </TabsContent>
          <TabsContent value="producto">
            <FormRegistrarProducto />
          </TabsContent>
          <TabsContent value="venta">
            <FormRegistrarVenta />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function FormRegistrarVendedor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createVendedor = useCreateVendedor();

  const formSchema = z.object({
    nombre: z.string().min(2, "Requerido"),
    primerApellido: z.string().min(2, "Requerido"),
    segundoApellido: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createVendedor.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Vendedor registrado", description: "Se ha registrado correctamente." });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListVendedoresQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Hubo un problema.", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Vendedor</CardTitle>
        <CardDescription>Agrega un nuevo vendedor al equipo de Imparables.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="primerApellido" render={({ field }) => (
                <FormItem><FormLabel>Primer Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="segundoApellido" render={({ field }) => (
                <FormItem><FormLabel>Segundo Apellido (Opcional)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit" disabled={createVendedor.isPending} className="bg-primary hover:bg-primary/90 text-white">
              {createVendedor.isPending ? "Guardando..." : "Registrar Vendedor"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function FormRegistrarCliente() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCliente = useCreateCliente();

  const formSchema = z.object({
    nombre: z.string().min(2, "Requerido"),
    primerApellido: z.string().min(2, "Requerido"),
    segundoApellido: z.string().optional(),
    registrado: z.enum(["Si", "No"]),
    calle: z.string().min(2, "Requerido"),
    numero: z.string().min(1, "Requerido"),
    colonia: z.string().min(2, "Requerido"),
    ciudad: z.string().min(2, "Requerido"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "", primerApellido: "", segundoApellido: "", registrado: "Si", calle: "", numero: "", colonia: "", ciudad: ""
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCliente.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Cliente registrado", description: "Se ha registrado correctamente." });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListClientesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Hubo un problema.", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Cliente y Dirección</CardTitle>
        <CardDescription>Añade un nuevo cliente a la red.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="primerApellido" render={({ field }) => (
                  <FormItem><FormLabel>Primer Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="segundoApellido" render={({ field }) => (
                  <FormItem><FormLabel>Segundo Apellido (Opcional)</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="registrado" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registrado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="calle" render={({ field }) => (
                  <FormItem><FormLabel>Calle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="numero" render={({ field }) => (
                  <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="colonia" render={({ field }) => (
                  <FormItem><FormLabel>Colonia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ciudad" render={({ field }) => (
                  <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
            <Button type="submit" disabled={createCliente.isPending} className="bg-primary hover:bg-primary/90 text-white">
              {createCliente.isPending ? "Guardando..." : "Registrar Cliente"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function FormRegistrarProducto() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProducto = useCreateProducto();

  const formSchema = z.object({
    nombreProducto: z.string().min(2, "Requerido"),
    precio: z.coerce.number().positive("Debe ser mayor a 0"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreProducto: "", precio: 0
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createProducto.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Producto registrado", description: "Se ha registrado correctamente." });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListProductosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Hubo un problema.", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Producto</CardTitle>
        <CardDescription>Añade un nuevo producto al catálogo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombreProducto" render={({ field }) => (
                <FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="precio" render={({ field }) => (
                <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <Button type="submit" disabled={createProducto.isPending} className="bg-primary hover:bg-primary/90 text-white">
              {createProducto.isPending ? "Guardando..." : "Registrar Producto"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function FormRegistrarVenta() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createVenta = useCreateVenta();
  
  const { data: clientes } = useListClientes();
  const { data: vendedores } = useListVendedores();
  const { data: productos } = useListProductos();

  const formSchema = z.object({
    idCliente: z.coerce.number().min(1, "Seleccione un cliente"),
    idVendedor: z.coerce.number().min(1, "Seleccione un vendedor"),
    detalles: z.array(z.object({
      idProducto: z.coerce.number().min(1, "Requerido"),
      cantidad: z.coerce.number().min(1, "Mínimo 1")
    })).min(1, "Añade al menos un producto")
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idCliente: 0,
      idVendedor: 0,
      detalles: [{ idProducto: 0, cantidad: 1 }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detalles"
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createVenta.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Venta registrada", description: "Se ha registrado la venta con éxito." });
        form.reset({ idCliente: 0, idVendedor: 0, detalles: [{ idProducto: 0, cantidad: 1 }] });
        queryClient.invalidateQueries({ queryKey: getListVentasQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Hubo un problema.", variant: "destructive" });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Venta</CardTitle>
        <CardDescription>Genera un nuevo ticket de venta.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="idCliente" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Cliente" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {clientes?.map(c => <SelectItem key={c.idCliente} value={c.idCliente.toString()}>{c.nombre} {c.primerApellido}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="idVendedor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Vendedor" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {vendedores?.map(v => <SelectItem key={v.idVendedor} value={v.idVendedor.toString()}>{v.nombre} {v.primerApellido}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Productos</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ idProducto: 0, cantidad: 1 })}>
                  <Plus className="w-4 h-4 mr-2" /> Añadir Producto
                </Button>
              </div>
              
              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-end bg-muted/20 p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <FormField control={form.control} name={`detalles.${index}.idProducto`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Producto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : undefined}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Producto" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {productos?.map(p => <SelectItem key={p.idProducto} value={p.idProducto.toString()}>{p.nombreProducto} (${p.precio})</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="w-32">
                    <FormField control={form.control} name={`detalles.${index}.cantidad`} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.detalles?.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.detalles.root.message}</p>}
            </div>

            <Button type="submit" disabled={createVenta.isPending} className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto">
              {createVenta.isPending ? "Registrando..." : "Registrar Venta"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
