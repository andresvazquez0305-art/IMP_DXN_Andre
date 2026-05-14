import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { requireAdmin } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAdmin);

// POST /api/invitations — send email invite via Clerk
router.post("/", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: "Email requerido" });
    return;
  }

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.FRONTEND_URL ?? ""}/sign-up`,
      notify: true,
    });
    res.status(201).json({ message: `Invitación enviada a ${email}`, id: invitation.id });
  } catch (err: unknown) {
    req.log.error(err);
    const msg =
      err && typeof err === "object" && "errors" in err
        ? (err as { errors: Array<{ message: string }> }).errors?.[0]?.message
        : "Error al enviar invitación";
    res.status(400).json({ error: msg });
  }
});

// GET /api/invitations — list pending invitations
router.get("/", async (req, res) => {
  try {
    const { data } = await clerkClient.invitations.getInvitationList({ status: "pending" });
    res.json(data.map((inv) => ({ id: inv.id, email: inv.emailAddress, creadoEn: inv.createdAt })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al obtener invitaciones" });
  }
});

// DELETE /api/invitations/:id — revoke invitation
router.delete("/:id", async (req, res) => {
  try {
    await clerkClient.invitations.revokeInvitation(req.params.id);
    res.json({ message: "Invitación revocada" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Error al revocar invitación" });
  }
});

export default router;
