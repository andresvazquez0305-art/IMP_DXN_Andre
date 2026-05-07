import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendedoresTable = pgTable("vendedor", {
  idVendedor: serial("id_vendedor").primaryKey(),
  nombre: text("nombre").notNull(),
  primerApellido: text("primer_apellido").notNull(),
  segundoApellido: text("segundo_apellido"),
});

export const insertVendedorSchema = createInsertSchema(vendedoresTable).omit({ idVendedor: true });
export type InsertVendedor = z.infer<typeof insertVendedorSchema>;
export type Vendedor = typeof vendedoresTable.$inferSelect;
