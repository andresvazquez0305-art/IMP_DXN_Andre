import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const auth = getAuth(req);
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    const user = await clerkClient.users.getUser(auth.userId!);
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    const rol: "admin" | "vendedor" = email === adminEmail ? "admin" : "vendedor";

    res.json({
      userId: user.id,
      email,
      nombre: user.fullName ?? user.username ?? email,
      imageUrl: user.imageUrl,
      rol,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

export default router;
