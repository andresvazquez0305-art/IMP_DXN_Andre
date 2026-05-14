import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vendedoresRouter from "./vendedores";
import clientesRouter from "./clientes";
import productosRouter from "./productos";
import ventasRouter from "./ventas";
import reportesRouter from "./reportes";
import meRouter from "./me";
import invitationsRouter from "./invitations";
import mysqlConfigRouter from "./mysql-config";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/me", meRouter);
router.use("/invitations", invitationsRouter);
router.use("/mysql-config", mysqlConfigRouter);
router.use("/vendedores", vendedoresRouter);
router.use("/clientes", clientesRouter);
router.use("/productos", productosRouter);
router.use("/ventas", ventasRouter);
router.use("/reportes", reportesRouter);

export default router;
