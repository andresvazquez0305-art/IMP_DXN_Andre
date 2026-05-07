import React from "react";
import { useGetResumenDashboard } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCircle, Box, TrendingUp, DollarSign, CalendarCheck } from "lucide-react";

export default function Dashboard() {
  const { data: resumen, isLoading } = useGetResumenDashboard();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen general de Imparables SA.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard 
              title="Vendedores" 
              value={resumen?.totalVendedores || 0} 
              icon={UserCircle} 
              color="text-primary" 
              bgColor="bg-primary/10" 
            />
            <MetricCard 
              title="Clientes" 
              value={resumen?.totalClientes || 0} 
              icon={Users} 
              color="text-secondary" 
              bgColor="bg-secondary/10" 
            />
            <MetricCard 
              title="Productos" 
              value={resumen?.totalProductos || 0} 
              icon={Box} 
              color="text-accent" 
              bgColor="bg-accent/10" 
            />
            <MetricCard 
              title="Total Ventas" 
              value={resumen?.totalVentas || 0} 
              icon={TrendingUp} 
              color="text-primary" 
              bgColor="bg-primary/10" 
            />
            <MetricCard 
              title="Ventas Hoy" 
              value={resumen?.ventasHoy || 0} 
              icon={CalendarCheck} 
              color="text-secondary" 
              bgColor="bg-secondary/10" 
            />
            <MetricCard 
              title="Monto del Mes" 
              value={`$${resumen?.montoTotalMes?.toFixed(2) || '0.00'}`} 
              icon={DollarSign} 
              color="text-destructive" 
              bgColor="bg-destructive/10" 
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, icon: Icon, color, bgColor }: { title: string, value: string | number, icon: any, color: string, bgColor: string }) {
  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
