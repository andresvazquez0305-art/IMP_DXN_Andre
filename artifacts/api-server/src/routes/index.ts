import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vendedoresRouter from "./vendedores";
import clientesRouter from "./clientes";
import productosRouter from "./productos";
import ventasRouter from "./ventas";
import reportesRouter from "./reportes";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/vendedores", vendedoresRouter);
router.use("/clientes", clientesRouter);
router.use("/productos", productosRouter);
router.use("/ventas", ventasRouter);
router.use("/reportes", reportesRouter);

export default router;
