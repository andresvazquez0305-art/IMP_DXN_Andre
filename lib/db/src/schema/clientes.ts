import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientesTable = pgTable("cliente", {
  idCliente: serial("id_cliente").primaryKey(),
  nombre: text("nombre").notNull(),
  primerApellido: text("primer_apellido").notNull(),
  segundoApellido: text("segundo_apellido"),
  registrado: text("registrado").notNull().default("No"),
});

export const direccionesTable = pgTable("direccion", {
  idDireccion: serial("id_direccion").primaryKey(),
  calle: text("calle").notNull(),
  numero: text("numero").notNull(),
  colonia: text("colonia").notNull(),
  ciudad: text("ciudad").notNull(),
  latitud: numeric("latitud", { precision: 10, scale: 7 }),
  longitud: numeric("longitud", { precision: 10, scale: 7 }),
  idCliente: serial("id_cliente").references(() => clientesTable.idCliente, { onDelete: "cascade" }),
});

export const insertClienteSchema = createInsertSchema(clientesTable).omit({ idCliente: true });
export const insertDireccionSchema = createInsertSchema(direccionesTable).omit({ idDireccion: true });
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type InsertDireccion = z.infer<typeof insertDireccionSchema>;
export type Cliente = typeof clientesTable.$inferSelect;
export type Direccion = typeof direccionesTable.$inferSelect;
