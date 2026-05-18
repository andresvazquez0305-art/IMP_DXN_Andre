function ReportesVentas() {
  const [dates, setDates] = useState({
    fechaInicio: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString().split("T")[0],

    fechaFin: new Date().toISOString().split("T")[0],
  });

  const [activeDates, setActiveDates] = useState(dates);

  const {
    data: totalRango,
    isLoading: isLoadingRango,
  } = useGetVentasPorRango(activeDates);

  const {
    data: porCliente,
    isLoading: isLoadingCliente,
  } = useGetVentasPorCliente(activeDates);

  const {
    data: porVendedor,
    isLoading: isLoadingVendedor,
  } = useGetVentasPorVendedor(activeDates);

  const {
    data: porProducto,
    isLoading: isLoadingProducto,
  } = useGetVentasPorProducto(activeDates);

  const handleSearch = () => {
    setActiveDates(dates);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="bg-accent/10">
          <CardTitle>Filtro de Reportes</CardTitle>
          <CardDescription>
            Selecciona un rango de fechas para actualizar todos los reportes.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-end gap-4">

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">
                Fecha Inicio
              </label>

              <Input
                type="date"
                value={dates.fechaInicio}
                onChange={(e) =>
                  setDates({
                    ...dates,
                    fechaInicio: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">
                Fecha Fin
              </label>

              <Input
                type="date"
                value={dates.fechaFin}
                onChange={(e) =>
                  setDates({
                    ...dates,
                    fechaFin: e.target.value,
                  })
                }
              />
            </div>

            <Button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <Card>
          <CardHeader>
            <CardTitle>Total en Rango</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center py-8">
            {isLoadingRango ? (
              <Skeleton className="w-32 h-12" />
            ) : (
              <>
                <div className="text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {totalRango?.fechaInicio} - {totalRango?.fechaFin}
                </div>

                <div className="text-5xl font-bold text-secondary-foreground">
                  $
                  {totalRango?.totalVentas?.toFixed(2) || "0.00"}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total por Cliente</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingCliente ? (
              <Skeleton className="w-full h-40" />
            ) : (
              <div className="overflow-x-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {porCliente?.map((c) => (
                      <TableRow key={c.idCliente}>
                        <TableCell>
                          {c.nombre} {c.primerApellido}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          ${c.totalCliente.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total por Vendedor</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingVendedor ? (
              <Skeleton className="w-full h-40" />
            ) : (
              <div className="overflow-x-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {porVendedor?.map((v) => (
                      <TableRow key={v.idVendedor}>
                        <TableCell>
                          {v.nombre} {v.primerApellido}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          ${v.totalVendedor.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total por Producto</CardTitle>
          </CardHeader>

          <CardContent>
            {isLoadingProducto ? (
              <Skeleton className="w-full h-40" />
            ) : (
              <div className="overflow-x-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">
                        Piezas
                      </TableHead>
                      <TableHead className="text-right">
                        Ingresos
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {porProducto?.map((p) => (
                      <TableRow key={p.idProducto}>
                        <TableCell>
                          {p.nombreProducto}
                        </TableCell>

                        <TableCell className="text-center">
                          {p.totalPiezas}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          ${p.totalVendido.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}