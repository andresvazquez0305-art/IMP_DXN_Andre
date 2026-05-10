import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    req.log.error("ADMIN_USERNAME o ADMIN_PASSWORD no están configurados");
    res.status(500).json({ error: "Credenciales del sistema no configuradas" });
    return;
  }

  if (username === validUsername && password === validPassword) {
    res.json({ ok: true, username });
  } else {
    res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }
});

export default router;
