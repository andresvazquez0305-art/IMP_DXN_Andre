import { Router } from "express";
import { db, vendedoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateVendedorBody,
  UpdateVendedorBody,
  GetVendedorParams,
  UpdateVendedorParams,
  DeleteVendedorParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const vendedores = await db.select().from(vendedoresTable).orderBy(vendedoresTable.idVendedor);
    res.json(vendedores.map((v) => ({
      idVendedor: v.idVendedor,
      nombre: v.nombre,
      primerApellido: v.primerApellido,
      segundoApellido: v.segundoApellido ?? null,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener vendedores" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateVendedorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [vendedor] = await db.insert(vendedoresTable).values({
      nombre: parsed.data.nombre,
      primerApellido: parsed.data.primerApellido,
      segundoApellido: parsed.data.segundoApellido ?? null,
    }).returning();
    res.status(201).json({
      idVendedor: vendedor.idVendedor,
      nombre: vendedor.nombre,
      primerApellido: vendedor.primerApellido,
      segundoApellido: vendedor.segundoApellido ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al registrar vendedor" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetVendedorParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const [vendedor] = await db.select().from(vendedoresTable).where(eq(vendedoresTable.idVendedor, parsed.data.id));
    if (!vendedor) {
      res.status(404).json({ error: "Vendedor no encontrado" });
      return;
    }
    res.json({
      idVendedor: vendedor.idVendedor,
      nombre: vendedor.nombre,
      primerApellido: vendedor.primerApellido,
      segundoApellido: vendedor.segundoApellido ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener vendedor" });
  }
});

router.put("/:id", async (req, res) => {
  const paramsParsed = UpdateVendedorParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const bodyParsed = UpdateVendedorBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  try {
    const [vendedor] = await db.update(vendedoresTable)
      .set({
        nombre: bodyParsed.data.nombre,
        primerApellido: bodyParsed.data.primerApellido,
        segundoApellido: bodyParsed.data.segundoApellido ?? null,
      })
      .where(eq(vendedoresTable.idVendedor, paramsParsed.data.id))
      .returning();
    if (!vendedor) {
      res.status(404).json({ error: "Vendedor no encontrado" });
      return;
    }
    res.json({
      idVendedor: vendedor.idVendedor,
      nombre: vendedor.nombre,
      primerApellido: vendedor.primerApellido,
      segundoApellido: vendedor.segundoApellido ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al modificar vendedor" });
  }
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteVendedorParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const [deleted] = await db.delete(vendedoresTable).where(eq(vendedoresTable.idVendedor, parsed.data.id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Vendedor no encontrado" });
      return;
    }
    res.json({ message: "Vendedor eliminado correctamente" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al eliminar vendedor" });
  }
});

export default router;
