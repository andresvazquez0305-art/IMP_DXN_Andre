import mysql from "mysql2/promise";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

let pool: mysql.Pool | null = null;
let currentConfig: MySQLConfig | null = null;

async function ensureConfigTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function getMySQLConfig(): Promise<MySQLConfig | null> {
  await ensureConfigTable();
  const rows = await db.execute(sql`SELECT key, value FROM app_config WHERE key LIKE 'mysql_%'`);
  const map: Record<string, string> = {};
  for (const row of rows.rows as Array<{ key: string; value: string }>) {
    map[row.key] = row.value;
  }
  if (!map["mysql_host"]) return null;
  return {
    host: map["mysql_host"],
    port: parseInt(map["mysql_port"] ?? "3306", 10),
    user: map["mysql_user"] ?? "",
    password: map["mysql_password"] ?? "",
    database: map["mysql_database"] ?? "",
  };
}

export async function saveMySQLConfig(config: MySQLConfig): Promise<void> {
  await ensureConfigTable();
  const entries: Array<[string, string]> = [
    ["mysql_host", config.host],
    ["mysql_port", String(config.port)],
    ["mysql_user", config.user],
    ["mysql_password", config.password],
    ["mysql_database", config.database],
  ];
  for (const [key, value] of entries) {
    await db.execute(sql`
      INSERT INTO app_config (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `);
  }
  await reconnect(config);
}

async function reconnect(config: MySQLConfig) {
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
  }
  currentConfig = config;
  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000,
  });
}

export async function initMySQLFromDB(): Promise<void> {
  try {
    const config = await getMySQLConfig();
    if (config) await reconnect(config);
  } catch {
    // no config yet, skip
  }
}

export async function getPool(): Promise<mysql.Pool | null> {
  return pool;
}

export async function testConnection(config: MySQLConfig): Promise<void> {
  const testPool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: 1,
    connectTimeout: 8000,
  });
  const conn = await testPool.getConnection();
  conn.release();
  await testPool.end();
}
