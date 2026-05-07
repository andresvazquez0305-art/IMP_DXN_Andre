import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListVendedores, useUpdateVendedor, useDeleteVendedor, getListVendedoresQueryKey,
  useListClientes, useUpdateCliente, useDeleteCliente, getListClientesQueryKey,
  useListProductos, useUpdateProducto, useDeleteProducto, getListProductosQueryKey,
  useListVentas, useUpdateVenta, useDeleteVenta, getListVentasQueryKey,
  getGetResumenDashboardQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2 } from "lucide-react";

export default function Editar() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Editar & Eliminar</h1>
          <p className="text-muted-foreground mt-1">Gestiona los registros existentes en el sistema.</p>
        </div>

        <Tabs defaultValue="vendedor" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
            <TabsTrigger value="vendedor">Vendedores</TabsTrigger>
            <TabsTrigger value="cliente">Clientes</TabsTrigger>
            <TabsTrigger value="producto">Productos</TabsTrigger>
            <TabsTrigger value="venta">Ventas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendedor">
            <GestionarVendedores />
          </TabsContent>
          <TabsContent value="cliente">
            <GestionarClientes />
          </TabsContent>
          <TabsContent value="producto">
            <GestionarProductos />
          </TabsContent>
          <TabsContent value="venta">
            <GestionarVentas />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function GestionarVendedores() {
  const { data: vendedores } = useListVendedores();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedVendedor = vendedores?.find(v => v.idVendedor === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-semibold text-lg">Selecciona un Vendedor</h3>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {vendedores?.map(v => (
            <button 
              key={v.idVendedor} 
              onClick={() => setSelectedId(v.idVendedor)}
              className={`p-3 text-left rounded-lg border transition-colors ${selectedId === v.idVendedor ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
            >
              <div className="font-medium text-foreground">{v.nombre} {v.primerApellido}</div>
              <div className="text-xs text-muted-foreground">ID: {v.idVendedor}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selectedVendedor ? (
          <FormEditarVendedor vendedor={selectedVendedor} onComplete={() => setSelectedId(null)} />
        ) : (
          <Card className="h-full flex items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            Selecciona un vendedor de la lista para editar o eliminar.
          </Card>
        )}
      </div>
    </div>
  );
}

function FormEditarVendedor({ vendedor, onComplete }: { vendedor: any, onComplete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateVendedor = useUpdateVendedor();
  const deleteVendedor = useDeleteVendedor();

  const formSchema = z.object({
    nombre: z.string().min(2, "Requerido"),
    primerApellido: z.string().min(2, "Requerido"),
    segundoApellido: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: vendedor.nombre,
      primerApellido: vendedor.primerApellido,
      segundoApellido: vendedor.segundoApellido || "",
    },
  });

  // Effect to reset form when selected vendedor changes
  React.useEffect(() => {
    form.reset({
      nombre: vendedor.nombre,
      primerApellido: vendedor.primerApellido,
      segundoApellido: vendedor.segundoApellido || "",
    });
  }, [vendedor, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateVendedor.mutate({ id: vendedor.idVendedor, data: values }, {
      onSuccess: () => {
        toast({ title: "Actualizado", description: "Vendedor actualizado correctamente." });
        queryClient.invalidateQueries({ queryKey: getListVendedoresQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  function handleDelete() {
    deleteVendedor.mutate({ id: vendedor.idVendedor }, {
      onSuccess: () => {
        toast({ title: "Eliminado", description: "Vendedor eliminado correctamente." });
        queryClient.invalidateQueries({ queryKey: getListVendedoresQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Editar Vendedor #{vendedor.idVendedor}</CardTitle>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer. Eliminará permanentemente el registro.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            <Button type="submit" disabled={updateVendedor.isPending} className="bg-primary hover:bg-primary/90 text-white">
              {updateVendedor.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function GestionarClientes() {
  const { data: clientes } = useListClientes();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedCliente = clientes?.find(c => c.idCliente === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-semibold text-lg">Selecciona un Cliente</h3>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {clientes?.map(c => (
            <button 
              key={c.idCliente} 
              onClick={() => setSelectedId(c.idCliente)}
              className={`p-3 text-left rounded-lg border transition-colors ${selectedId === c.idCliente ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
            >
              <div className="font-medium text-foreground">{c.nombre} {c.primerApellido}</div>
              <div className="text-xs text-muted-foreground">Ciudad: {c.direccion?.ciudad}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selectedCliente ? (
          <FormEditarCliente cliente={selectedCliente} onComplete={() => setSelectedId(null)} />
        ) : (
          <Card className="h-full flex items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            Selecciona un cliente de la lista para editar o eliminar.
          </Card>
        )}
      </div>
    </div>
  );
}

function FormEditarCliente({ cliente, onComplete }: { cliente: any, onComplete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();

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
      nombre: cliente.nombre,
      primerApellido: cliente.primerApellido,
      segundoApellido: cliente.segundoApellido || "",
      registrado: cliente.registrado,
      calle: cliente.direccion?.calle || "",
      numero: cliente.direccion?.numero || "",
      colonia: cliente.direccion?.colonia || "",
      ciudad: cliente.direccion?.ciudad || "",
    },
  });

  React.useEffect(() => {
    form.reset({
      nombre: cliente.nombre,
      primerApellido: cliente.primerApellido,
      segundoApellido: cliente.segundoApellido || "",
      registrado: cliente.registrado,
      calle: cliente.direccion?.calle || "",
      numero: cliente.direccion?.numero || "",
      colonia: cliente.direccion?.colonia || "",
      ciudad: cliente.direccion?.ciudad || "",
    });
  }, [cliente, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateCliente.mutate({ id: cliente.idCliente, data: values }, {
      onSuccess: () => {
        toast({ title: "Actualizado", description: "Cliente actualizado correctamente." });
        queryClient.invalidateQueries({ queryKey: getListClientesQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  function handleDelete() {
    deleteCliente.mutate({ id: cliente.idCliente }, {
      onSuccess: () => {
        toast({ title: "Eliminado", description: "Cliente eliminado correctamente." });
        queryClient.invalidateQueries({ queryKey: getListClientesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Editar Cliente #{cliente.idCliente}</CardTitle>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="primerApellido" render={({ field }) => (
                <FormItem><FormLabel>Primer Apellido</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="segundoApellido" render={({ field }) => (
                <FormItem><FormLabel>Segundo Apellido</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="registrado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Registrado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Si">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="ciudad" render={({ field }) => (
                <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="colonia" render={({ field }) => (
                <FormItem><FormLabel>Colonia</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="calle" render={({ field }) => (
                <FormItem><FormLabel>Calle</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="numero" render={({ field }) => (
                <FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <Button type="submit" disabled={updateCliente.isPending} className="bg-primary text-white">Guardar Cambios</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function GestionarProductos() {
  const { data: productos } = useListProductos();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedProducto = productos?.find(p => p.idProducto === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-semibold text-lg">Selecciona un Producto</h3>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {productos?.map(p => (
            <button 
              key={p.idProducto} 
              onClick={() => setSelectedId(p.idProducto)}
              className={`p-3 text-left rounded-lg border transition-colors ${selectedId === p.idProducto ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
            >
              <div className="font-medium text-foreground">{p.nombreProducto}</div>
              <div className="text-xs text-primary font-bold">${p.precio.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selectedProducto ? (
          <FormEditarProducto producto={selectedProducto} onComplete={() => setSelectedId(null)} />
        ) : (
          <Card className="h-full flex items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            Selecciona un producto para editar.
          </Card>
        )}
      </div>
    </div>
  );
}

function FormEditarProducto({ producto, onComplete }: { producto: any, onComplete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProducto = useUpdateProducto();
  const deleteProducto = useDeleteProducto();

  const formSchema = z.object({
    nombreProducto: z.string().min(2, "Requerido"),
    precio: z.coerce.number().positive("Mayor a 0"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreProducto: producto.nombreProducto,
      precio: producto.precio,
    },
  });

  React.useEffect(() => {
    form.reset({
      nombreProducto: producto.nombreProducto,
      precio: producto.precio,
    });
  }, [producto, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateProducto.mutate({ id: producto.idProducto, data: values }, {
      onSuccess: () => {
        toast({ title: "Actualizado", description: "Producto actualizado." });
        queryClient.invalidateQueries({ queryKey: getListProductosQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  function handleDelete() {
    deleteProducto.mutate({ id: producto.idProducto }, {
      onSuccess: () => {
        toast({ title: "Eliminado", description: "Producto eliminado." });
        queryClient.invalidateQueries({ queryKey: getListProductosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Editar Producto #{producto.idProducto}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Se eliminará el producto permanentemente.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Sí, eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nombreProducto" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="precio" render={({ field }) => (
                <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <Button type="submit" disabled={updateProducto.isPending} className="bg-primary text-white">Guardar Cambios</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function GestionarVentas() {
  const { data: ventas } = useListVentas();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedVenta = ventas?.find(v => v.idVenta === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="font-semibold text-lg">Selecciona una Venta</h3>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {ventas?.map(v => (
            <button 
              key={v.idVenta} 
              onClick={() => setSelectedId(v.idVenta)}
              className={`p-3 text-left rounded-lg border transition-colors ${selectedId === v.idVenta ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/50'}`}
            >
              <div className="font-medium text-foreground">Venta #{v.idVenta}</div>
              <div className="text-xs text-muted-foreground">{new Date(v.fecha).toLocaleDateString()}</div>
              <div className="text-sm text-primary font-bold">${v.total.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        {selectedVenta ? (
          <EliminarVentaCard venta={selectedVenta} onComplete={() => setSelectedId(null)} />
        ) : (
          <Card className="h-full flex items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            Selecciona una venta para ver detalles o eliminar.
          </Card>
        )}
      </div>
    </div>
  );
}

function EliminarVentaCard({ venta, onComplete }: { venta: any, onComplete: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteVenta = useDeleteVenta();

  function handleDelete() {
    deleteVenta.mutate({ id: venta.idVenta }, {
      onSuccess: () => {
        toast({ title: "Eliminada", description: "Venta eliminada." });
        queryClient.invalidateQueries({ queryKey: getListVentasQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResumenDashboardQueryKey() });
        onComplete();
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venta #{venta.idVenta}</CardTitle>
        <CardDescription>{new Date(venta.fecha).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block">Cliente</span>
            <span className="font-medium">{venta.nombreCliente}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Vendedor</span>
            <span className="font-medium">{venta.nombreVendedor}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 border-b pb-2">Detalles</h4>
          <div className="space-y-2">
            {venta.detalles?.map((d: any) => (
              <div key={d.idDetalle} className="flex justify-between text-sm">
                <span>{d.cantidad}x {d.nombreProducto}</span>
                <span className="font-medium">${d.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 border-t flex justify-between font-bold text-lg text-primary">
            <span>Total</span>
            <span>${venta.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto"><Trash2 className="w-4 h-4 mr-2" /> Eliminar Venta</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Sí, eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
