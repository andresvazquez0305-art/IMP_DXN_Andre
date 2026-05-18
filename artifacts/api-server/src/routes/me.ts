import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({
    userId: "local-admin",
    email: process.env.ADMIN_EMAIL ?? "admin@local.test",
    nombre: "Administrador",
    imageUrl: "",
    rol: "admin",
  });
});

export default router;