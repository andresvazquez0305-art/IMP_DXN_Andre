import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAuth";
import { getMySQLConfig, saveMySQLConfig, testConnection, type MySQLConfig } from "../lib/mysql";

const router = Router();

router.use(requireAdmin);

// GET /api/mysql-config — returns stored config (password masked)
router.get("/", async (req, res) => {
  try {
    const config = await getMySQLConfig();
    if (!config) {
      res.json({ configured: false });
      return;
    }
    res.json({
      configured: true,
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener configuración" });
  }
});

// POST /api/mysql-config/test — test a connection without saving
router.post("/test", async (req, res) => {
  const { host, port, user, password, database } = req.body as Partial<MySQLConfig>;
  if (!host || !user || !database) {
    res.status(400).json({ error: "host, user y database son requeridos" });
    return;
  }
  try {
    await testConnection({ host, port: port ?? 3306, user, password: password ?? "", database });
    res.json({ ok: true, message: "Conexión exitosa" });
  } catch (err: unknown) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Error de conexión";
    res.status(400).json({ error: msg });
  }
});

// POST /api/mysql-config — save config and reconnect
router.post("/", async (req, res) => {
  const { host, port, user, password, database } = req.body as Partial<MySQLConfig>;
  if (!host || !user || !database) {
    res.status(400).json({ error: "host, user y database son requeridos" });
    return;
  }
  try {
    await testConnection({ host, port: port ?? 3306, user, password: password ?? "", database });
    await saveMySQLConfig({ host, port: port ?? 3306, user, password: password ?? "", database });
    res.json({ ok: true, message: "Configuración guardada y conexión establecida" });
  } catch (err: unknown) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Error al guardar configuración";
    res.status(400).json({ error: msg });
  }
});

export default router;
