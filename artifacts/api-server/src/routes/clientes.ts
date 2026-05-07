import { Router } from "express";
import { db, clientesTable, direccionesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateClienteBody,
  UpdateClienteBody,
  GetClienteParams,
  UpdateClienteParams,
  DeleteClienteParams,
} from "@workspace/api-zod";

const router = Router();

function formatCliente(c: typeof clientesTable.$inferSelect, d?: typeof direccionesTable.$inferSelect | null) {
  return {
    idCliente: c.idCliente,
    nombre: c.nombre,
    primerApellido: c.primerApellido,
    segundoApellido: c.segundoApellido ?? null,
    registrado: c.registrado,
    direccion: d ? {
      idDireccion: d.idDireccion,
      calle: d.calle,
      numero: d.numero,
      colonia: d.colonia,
      ciudad: d.ciudad,
      latitud: d.latitud ? Number(d.latitud) : null,
      longitud: d.longitud ? Number(d.longitud) : null,
    } : null,
  };
}

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(clientesTable)
      .leftJoin(direccionesTable, eq(clientesTable.idCliente, direccionesTable.idCliente))
      .orderBy(clientesTable.idCliente);
    res.json(rows.map((r) => formatCliente(r.cliente, r.direccion)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateClienteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [cliente] = await db.insert(clientesTable).values({
      nombre: parsed.data.nombre,
      primerApellido: parsed.data.primerApellido,
      segundoApellido: parsed.data.segundoApellido ?? null,
      registrado: parsed.data.registrado,
    }).returning();

    const [direccion] = await db.insert(direccionesTable).values({
      calle: parsed.data.calle,
      numero: parsed.data.numero,
      colonia: parsed.data.colonia,
      ciudad: parsed.data.ciudad,
      latitud: parsed.data.latitud != null ? String(parsed.data.latitud) : null,
      longitud: parsed.data.longitud != null ? String(parsed.data.longitud) : null,
      idCliente: cliente.idCliente,
    }).returning();

    res.status(201).json(formatCliente(cliente, direccion));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al registrar cliente" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetClienteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(clientesTable)
      .leftJoin(direccionesTable, eq(clientesTable.idCliente, direccionesTable.idCliente))
      .where(eq(clientesTable.idCliente, parsed.data.id));
    if (!rows[0]) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.json(formatCliente(rows[0].cliente, rows[0].direccion));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
});

router.put("/:id", async (req, res) => {
  const paramsParsed = UpdateClienteParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const bodyParsed = UpdateClienteBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }
  try {
    const [cliente] = await db.update(clientesTable)
      .set({
        nombre: bodyParsed.data.nombre,
        primerApellido: bodyParsed.data.primerApellido,
        segundoApellido: bodyParsed.data.segundoApellido ?? null,
        registrado: bodyParsed.data.registrado,
      })
      .where(eq(clientesTable.idCliente, paramsParsed.data.id))
      .returning();
    if (!cliente) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    const [direccion] = await db.update(direccionesTable)
      .set({
        calle: bodyParsed.data.calle,
        numero: bodyParsed.data.numero,
        colonia: bodyParsed.data.colonia,
        ciudad: bodyParsed.data.ciudad,
        latitud: bodyParsed.data.latitud != null ? String(bodyParsed.data.latitud) : null,
        longitud: bodyParsed.data.longitud != null ? String(bodyParsed.data.longitud) : null,
      })
      .where(eq(direccionesTable.idCliente, paramsParsed.data.id))
      .returning();
    res.json(formatCliente(cliente, direccion));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al modificar cliente" });
  }
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteClienteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  try {
    const [deleted] = await db.delete(clientesTable).where(eq(clientesTable.idCliente, parsed.data.id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

export default router;
