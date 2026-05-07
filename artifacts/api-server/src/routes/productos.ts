import { Router } from "express";
import { db, productosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductoBody,
  UpdateProductoBody,
  GetProductoParams,
  UpdateProductoParams,
  DeleteProductoParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const productos = await db.select().from(productosTable).orderBy(productosTable.idProducto);
    res.json(productos.map((p) => ({
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      precio: Number(p.precio),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateProductoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [producto] = await db.insert(productosTable).values({
      nombreProducto: parsed.data.nombreProducto,
      precio: String(parsed.data.precio),
    }).returning();
    res.status(201).json({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precio: Number(producto.precio),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al registrar producto" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetProductoParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const [producto] = await db.select().from(productosTable).where(eq(productosTable.idProducto, parsed.data.id));
    if (!producto) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precio: Number(producto.precio),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

router.put("/:id", async (req, res) => {
  const paramsParsed = UpdateProductoParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const bodyParsed = UpdateProductoBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  try {
    const [producto] = await db.update(productosTable)
      .set({
        nombreProducto: bodyParsed.data.nombreProducto,
        precio: String(bodyParsed.data.precio),
      })
      .where(eq(productosTable.idProducto, paramsParsed.data.id))
      .returning();
    if (!producto) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      precio: Number(producto.precio),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al modificar producto" });
  }
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteProductoParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const [deleted] = await db.delete(productosTable).where(eq(productosTable.idProducto, parsed.data.id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
