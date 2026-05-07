import { pgTable, serial, date, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vendedoresTable } from "./vendedores";
import { clientesTable } from "./clientes";
import { productosTable } from "./productos";

export const ventasTable = pgTable("venta", {
  idVenta: serial("id_venta").primaryKey(),
  fecha: date("fecha").notNull().defaultNow(),
  idVendedor: integer("id_vendedor").notNull().references(() => vendedoresTable.idVendedor),
  idCliente: integer("id_cliente").notNull().references(() => clientesTable.idCliente),
});

export const detalleVentasTable = pgTable("detalle_venta", {
  idDetalle: serial("id_detalle").primaryKey(),
  idVenta: integer("id_venta").notNull().references(() => ventasTable.idVenta, { onDelete: "cascade" }),
  idProducto: integer("id_producto").notNull().references(() => productosTable.idProducto),
  cantidad: integer("cantidad").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertVentaSchema = createInsertSchema(ventasTable).omit({ idVenta: true });
export const insertDetalleVentaSchema = createInsertSchema(detalleVentasTable).omit({ idDetalle: true });
export type InsertVenta = z.infer<typeof insertVentaSchema>;
export type InsertDetalleVenta = z.infer<typeof insertDetalleVentaSchema>;
export type Venta = typeof ventasTable.$inferSelect;
export type DetalleVenta = typeof detalleVentasTable.$inferSelect;
