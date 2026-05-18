import { Router } from "express";
import { db, ventasTable, detalleVentasTable, clientesTable, vendedoresTable, productosTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateVentaBody,
  UpdateVentaBody,
  GetVentaParams,
  UpdateVentaParams,
  DeleteVentaParams,
} from "@workspace/api-zod";

const router = Router();

async function getVentaConDetalle(idVenta: number) {
  const [venta] = await db
    .select({
      idVenta: ventasTable.idVenta,
      fecha: ventasTable.fecha,
      idCliente: ventasTable.idCliente,
      nombreCliente: sql<string>`${clientesTable.nombre} || ' ' || ${clientesTable.primerApellido}`,
      idVendedor: ventasTable.idVendedor,
      nombreVendedor: sql<string>`${vendedoresTable.nombre} || ' ' || ${vendedoresTable.primerApellido}`,
    })
    .from(ventasTable)
    .innerJoin(clientesTable, eq(ventasTable.idCliente, clientesTable.idCliente))
    .innerJoin(vendedoresTable, eq(ventasTable.idVendedor, vendedoresTable.idVendedor))
    .where(eq(ventasTable.idVenta, idVenta));

  if (!venta) return null;

  const detalles = await db
    .select({
      idDetalle: detalleVentasTable.idDetalle,
      idProducto: detalleVentasTable.idProducto,
      nombreProducto: productosTable.nombreProducto,
      cantidad: detalleVentasTable.cantidad,
      subtotal: detalleVentasTable.subtotal,
    })
    .from(detalleVentasTable)
    .innerJoin(productosTable, eq(detalleVentasTable.idProducto, productosTable.idProducto))
    .where(eq(detalleVentasTable.idVenta, idVenta));

  const total = detalles.reduce((acc, d) => acc + Number(d.subtotal), 0);

  return {
    ...venta,
    total,
    detalles: detalles.map((d) => ({
      idDetalle: d.idDetalle,
      idProducto: d.idProducto,
      nombreProducto: d.nombreProducto,
      cantidad: d.cantidad,
      subtotal: Number(d.subtotal),
    })),
  };
}

router.get("/", async (req, res) => {
  try {
    const ventas = await db
      .select({ idVenta: ventasTable.idVenta })
      .from(ventasTable)
      .orderBy(ventasTable.idVenta);

    const results = await Promise.all(ventas.map((v) => getVentaConDetalle(v.idVenta)));
    res.json(results.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateVentaBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const hoy = new Date();

    const fechaLocal =
      `${hoy.getFullYear()}-` +
      `${String(hoy.getMonth() + 1).padStart(2, "0")}-` +
      `${String(hoy.getDate()).padStart(2, "0")}`;

    const [venta] = await db.insert(ventasTable).values({
      idCliente: parsed.data.idCliente,
      idVendedor: parsed.data.idVendedor,
      fecha: fechaLocal,
    }).returning();

    for (const detalle of parsed.data.detalles) {
      const [producto] = await db
        .select()
        .from(productosTable)
        .where(eq(productosTable.idProducto, detalle.idProducto));

      if (!producto) continue;

      const subtotal = Number(producto.precio) * detalle.cantidad;

      await db.insert(detalleVentasTable).values({
        idVenta: venta.idVenta,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad,
        subtotal: String(subtotal),
      });
    }

    const result = await getVentaConDetalle(venta.idVenta);

    res.status(201).json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetVentaParams.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  try {
    const result = await getVentaConDetalle(parsed.data.id);

    if (!result) {
      res.status(404).json({ error: "Venta no encontrada" });
      return;
    }

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener venta" });
  }
});

router.put("/:id", async (req, res) => {
  const paramsParsed = UpdateVentaParams.safeParse(req.params);

  if (!paramsParsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const bodyParsed = UpdateVentaBody.safeParse(req.body);

  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  try {
    const [venta] = await db.update(ventasTable)
      .set({
        idCliente: bodyParsed.data.idCliente,
        idVendedor: bodyParsed.data.idVendedor,
      })
      .where(eq(ventasTable.idVenta, paramsParsed.data.id))
      .returning();

    if (!venta) {
      res.status(404).json({ error: "Venta no encontrada" });
      return;
    }

    await db
      .delete(detalleVentasTable)
      .where(eq(detalleVentasTable.idVenta, paramsParsed.data.id));

    for (const detalle of bodyParsed.data.detalles) {
      const [producto] = await db
        .select()
        .from(productosTable)
        .where(eq(productosTable.idProducto, detalle.idProducto));

      if (!producto) continue;

      const subtotal = Number(producto.precio) * detalle.cantidad;

      await db.insert(detalleVentasTable).values({
        idVenta: paramsParsed.data.id,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad,
        subtotal: String(subtotal),
      });
    }

    const result = await getVentaConDetalle(paramsParsed.data.id);

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al modificar venta" });
  }
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteVentaParams.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(ventasTable)
      .where(eq(ventasTable.idVenta, parsed.data.id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Venta no encontrada" });
      return;
    }

    res.json({ message: "Venta eliminada correctamente" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al eliminar venta" });
  }
});

export default router;
