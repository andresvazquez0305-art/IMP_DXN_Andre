import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productosTable = pgTable("producto", {
  idProducto: serial("id_producto").primaryKey(),
  nombreProducto: text("nombre_producto").notNull(),
  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),
});

export const insertProductoSchema = createInsertSchema(productosTable).omit({ idProducto: true });
export type InsertProducto = z.infer<typeof insertProductoSchema>;
export type Producto = typeof productosTable.$inferSelect;
