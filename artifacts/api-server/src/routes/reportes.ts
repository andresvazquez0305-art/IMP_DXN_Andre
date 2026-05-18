import { Router } from "express";
import { db, ventasTable, detalleVentasTable, clientesTable, vendedoresTable, productosTable } from "@workspace/db";
import { and, between, eq, sql, count, sum } from "drizzle-orm";
import {
  GetVentasPorRangoQueryParams,
  GetVentasPorClienteQueryParams,
  GetVentasPorVendedorQueryParams,
  GetVentasPorProductoQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/ventas-por-rango", async (req, res) => {
  const parsed = GetVentasPorRangoQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }
  try {
    const { fechaInicio, fechaFin } = parsed.data;
    const [result] = await db
      .select({ totalVentas: sql<number>`COALESCE(SUM(${detalleVentasTable.subtotal}), 0)` })
      .from(ventasTable)
      .leftJoin(detalleVentasTable, eq(ventasTable.idVenta, detalleVentasTable.idVenta))
      .where(between(ventasTable.fecha, fechaInicio as string, fechaFin as string));

    res.json({
      fechaInicio,
      fechaFin,
      totalVentas: Number(result?.totalVentas ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener reporte" });
  }
});

router.get("/por-cliente", async (req, res) => {
  const parsed = GetVentasPorClienteQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }
  try {
    const { fechaInicio, fechaFin } = parsed.data;
    const rows = await db
      .select({
        idCliente: clientesTable.idCliente,
        nombre: clientesTable.nombre,
        primerApellido: clientesTable.primerApellido,
        segundoApellido: clientesTable.segundoApellido,
        totalCliente: sql<number>`COALESCE(SUM(${detalleVentasTable.subtotal}), 0)`,
      })
      .from(ventasTable)
      .innerJoin(clientesTable, eq(ventasTable.idCliente, clientesTable.idCliente))
      .leftJoin(detalleVentasTable, eq(ventasTable.idVenta, detalleVentasTable.idVenta))
      .where(between(ventasTable.fecha, fechaInicio as string, fechaFin as string))
      .groupBy(clientesTable.idCliente, clientesTable.nombre, clientesTable.primerApellido, clientesTable.segundoApellido)
      .orderBy(sql`COALESCE(SUM(${detalleVentasTable.subtotal}), 0) DESC`);

    res.json(rows.map((r) => ({
      idCliente: r.idCliente,
      nombre: r.nombre,
      primerApellido: r.primerApellido,
      segundoApellido: r.segundoApellido ?? null,
      totalCliente: Number(r.totalCliente),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener reporte por cliente" });
  }
});

router.get("/por-vendedor", async (req, res) => {
  const parsed = GetVentasPorVendedorQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }
  try {
    const { fechaInicio, fechaFin } = parsed.data;
    const rows = await db
      .select({
        idVendedor: vendedoresTable.idVendedor,
        nombre: vendedoresTable.nombre,
        primerApellido: vendedoresTable.primerApellido,
        segundoApellido: vendedoresTable.segundoApellido,
        totalVendedor: sql<number>`COALESCE(SUM(${detalleVentasTable.subtotal}), 0)`,
      })
      .from(ventasTable)
      .innerJoin(vendedoresTable, eq(ventasTable.idVendedor, vendedoresTable.idVendedor))
      .leftJoin(detalleVentasTable, eq(ventasTable.idVenta, detalleVentasTable.idVenta))
      .where(between(ventasTable.fecha, fechaInicio as string, fechaFin as string))
      .groupBy(vendedoresTable.idVendedor, vendedoresTable.nombre, vendedoresTable.primerApellido, vendedoresTable.segundoApellido)
      .orderBy(sql`COALESCE(SUM(${detalleVentasTable.subtotal}), 0) DESC`);

    res.json(rows.map((r) => ({
      idVendedor: r.idVendedor,
      nombre: r.nombre,
      primerApellido: r.primerApellido,
      segundoApellido: r.segundoApellido ?? null,
      totalVendedor: Number(r.totalVendedor),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener reporte por vendedor" });
  }
});

router.get("/por-producto", async (req, res) => {
  const parsed = GetVentasPorProductoQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Parámetros inválidos" });
    return;
  }
  try {
    const { fechaInicio, fechaFin } = parsed.data;
    const rows = await db
      .select({
        idProducto: productosTable.idProducto,
        nombreProducto: productosTable.nombreProducto,
        totalPiezas: sql<number>`COALESCE(SUM(${detalleVentasTable.cantidad}), 0)`,
        totalVendido: sql<number>`COALESCE(SUM(${detalleVentasTable.subtotal}), 0)`,
      })
      .from(detalleVentasTable)
      .innerJoin(ventasTable, eq(detalleVentasTable.idVenta, ventasTable.idVenta))
      .innerJoin(productosTable, eq(detalleVentasTable.idProducto, productosTable.idProducto))
      .where(between(ventasTable.fecha, fechaInicio as string, fechaFin as string))
      .groupBy(productosTable.idProducto, productosTable.nombreProducto)
      .orderBy(sql`COALESCE(SUM(${detalleVentasTable.subtotal}), 0) DESC`);

    res.json(rows.map((r) => ({
      idProducto: r.idProducto,
      nombreProducto: r.nombreProducto,
      totalPiezas: Number(r.totalPiezas),
      totalVendido: Number(r.totalVendido),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener reporte por producto" });
  }
});

router.get("/resumen", async (req, res) => {
  try {
    const [totalVendedores] = await db.select({ count: count() }).from(vendedoresTable);
    const [totalClientes] = await db.select({ count: count() }).from(clientesTable);
    const [totalProductos] = await db.select({ count: count() }).from(productosTable);
    const [totalVentas] = await db.select({ count: count() }).from(ventasTable);

    const hoy = new Date().toISOString().split("T")[0];
    const primerDiaMes = `${hoy.substring(0, 7)}-01`;

    const [montoMes] = await db
      .select({ total: sql<number>`COALESCE(SUM(${detalleVentasTable.subtotal}), 0)` })
      .from(ventasTable)
      .leftJoin(detalleVentasTable, eq(ventasTable.idVenta, detalleVentasTable.idVenta))
      .where(between(ventasTable.fecha, primerDiaMes, hoy));

    const [ventasHoyRow] = await db
      .select({ count: count() })
      .from(ventasTable)
      .where(eq(ventasTable.fecha, hoy));

    res.json({
      totalVendedores: totalVendedores.count,
      totalClientes: totalClientes.count,
      totalProductos: totalProductos.count,
      totalVentas: totalVentas.count,
      montoTotalMes: Number(montoMes?.total ?? 0),
      ventasHoy: ventasHoyRow.count,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});

export default router;
