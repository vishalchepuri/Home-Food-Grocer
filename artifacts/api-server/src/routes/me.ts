import { Router, type IRouter, type Response } from "express";
import { clerkClient } from "@clerk/express";
import { loadUser, requireAuth, type AuthedRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/me", loadUser, async (req: AuthedRequest, res: Response) => {
  if (!req.userId) {
    res.json({ isAdmin: false });
    return;
  }
  try {
    const user = await clerkClient.users.getUser(req.userId);
    res.json({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      imageUrl: user.imageUrl,
      isAdmin: !!req.isAdmin,
    });
  } catch {
    res.json({ id: req.userId, isAdmin: !!req.isAdmin });
  }
});

router.post(
  "/me/claim-admin",
  loadUser,
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const list = await clerkClient.users.getUserList({ limit: 500 });
      const allUsers = Array.isArray(list) ? list : list.data;
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const hasAdmin = allUsers.some((u) => {
        const role = (u.publicMetadata as { role?: string })?.role;
        const email = u.primaryEmailAddress?.emailAddress?.toLowerCase();
        return role === "admin" || (email && adminEmails.includes(email));
      });
      if (hasAdmin) {
        res
          .status(409)
          .json({ message: "An admin already exists for this app." });
        return;
      }
      await clerkClient.users.updateUser(req.userId!, {
        publicMetadata: { role: "admin" },
      });
      res.json({ ok: true });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to bootstrap admin", error: String(err) });
    }
  },
);

export default router;
