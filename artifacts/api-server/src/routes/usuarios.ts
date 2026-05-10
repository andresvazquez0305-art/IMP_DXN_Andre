import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usuariosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Middleware: only admin can access user management
function requireAdmin(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1], next: Parameters<Parameters<typeof router.use>[0]>[2]) {
  const authHeader = req.headers["x-user-rol"];
  if (authHeader !== "admin") {
    res.status(403).json({ error: "Solo el administrador puede gestionar usuarios" });
    return;
  }
  next();
}

router.use(requireAdmin);

// GET /api/usuarios - List all vendor accounts
router.get("/", async (req, res) => {
  try {
    const usuarios = await db
      .select({
        idUsuario: usuariosTable.idUsuario,
        username: usuariosTable.username,
        rol: usuariosTable.rol,
        activo: usuariosTable.activo,
        creadoEn: usuariosTable.creadoEn,
      })
      .from(usuariosTable)
      .orderBy(usuariosTable.creadoEn);

    res.json(usuarios);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// POST /api/usuarios - Create vendor account
router.post("/", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "Usuario y contraseña requeridos" });
    return;
  }

  if (username === process.env.ADMIN_USERNAME) {
    res.status(400).json({ error: "Ese nombre de usuario no está disponible" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [usuario] = await db
      .insert(usuariosTable)
      .values({ username, passwordHash, rol: "vendedor" })
      .returning({
        idUsuario: usuariosTable.idUsuario,
        username: usuariosTable.username,
        rol: usuariosTable.rol,
        activo: usuariosTable.activo,
        creadoEn: usuariosTable.creadoEn,
      });

    res.status(201).json(usuario);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
      res.status(400).json({ error: "Ya existe un usuario con ese nombre" });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT /api/usuarios/:id/password - Reset password
router.put("/:id/password", async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body as { password?: string };

  if (!password || password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [usuario] = await db
      .update(usuariosTable)
      .set({ passwordHash })
      .where(eq(usuariosTable.idUsuario, id))
      .returning({ idUsuario: usuariosTable.idUsuario, username: usuariosTable.username });

    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json({ message: `Contraseña actualizada para ${usuario.username}` });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
});

// DELETE /api/usuarios/:id - Delete vendor account
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [deleted] = await db
      .delete(usuariosTable)
      .where(eq(usuariosTable.idUsuario, id))
      .returning({ username: usuariosTable.username });

    if (!deleted) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    res.json({ message: `Usuario "${deleted.username}" eliminado correctamente` });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;
