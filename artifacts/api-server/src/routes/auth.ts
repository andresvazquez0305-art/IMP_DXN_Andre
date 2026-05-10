import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usuariosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "Usuario y contraseña requeridos" });
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    req.log.error("ADMIN_USERNAME o ADMIN_PASSWORD no están configurados");
    res.status(500).json({ error: "Credenciales del sistema no configuradas" });
    return;
  }

  // Check admin credentials first (stored in env vars)
  if (username === adminUsername && password === adminPassword) {
    res.json({ ok: true, username, rol: "admin" });
    return;
  }

  // Check DB users (vendedores)
  try {
    const [usuario] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.username, username));

    if (usuario && usuario.activo) {
      const valid = await bcrypt.compare(password, usuario.passwordHash);
      if (valid) {
        res.json({ ok: true, username: usuario.username, rol: usuario.rol });
        return;
      }
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al verificar credenciales" });
    return;
  }

  res.status(401).json({ error: "Usuario o contraseña incorrectos" });
});

export default router;
