import { Router, type IRouter, type Response } from "express";
import { loadUser, requireAuth, type AuthedRequest } from "../middlewares/auth";
import { firebaseAuth } from "../lib/firebaseAdmin";
import { claimFirstAdmin } from "../lib/firestoreData";

const router: IRouter = Router();

router.get("/me", loadUser, async (req: AuthedRequest, res: Response) => {
  if (!req.userId) {
    res.json({ isAdmin: false });
    return;
  }
  try {
    const user = await firebaseAuth.getUser(req.userId);
    res.json({
      id: user.uid,
      email: user.email ?? undefined,
      firstName: user.displayName?.split(" ")[0] ?? undefined,
      lastName: user.displayName?.split(" ").slice(1).join(" ") || undefined,
      imageUrl: user.photoURL ?? undefined,
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
      const claimed = await claimFirstAdmin(req.userId!);
      if (!claimed.ok) {
        res
          .status(409)
          .json({ message: "An admin already exists for this app." });
        return;
      }
      await firebaseAuth.setCustomUserClaims(req.userId!, { admin: true });
      res.json({ ok: true });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to bootstrap admin", error: String(err) });
    }
  },
);

export default router;
