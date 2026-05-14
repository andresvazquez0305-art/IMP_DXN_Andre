import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    res.status(500).json({ error: "ADMIN_EMAIL no configurado" });
    return;
  }
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;
    if (email !== adminEmail) {
      res.status(403).json({ error: "Solo el administrador puede hacer esto" });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Error al verificar permisos" });
  }
}
