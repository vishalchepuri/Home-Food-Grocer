import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";

export interface AuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function loadUser(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    next();
    return;
  }
  req.userId = userId;
  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
    req.userEmail = email;
    const role = (user.publicMetadata as { role?: string })?.role;
    const adminEmails = getAdminEmails();
    req.isAdmin = role === "admin" || (!!email && adminEmails.includes(email));
  } catch (err) {
    // continue unauthenticated if Clerk lookup fails
  }
  next();
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  next();
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (!req.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}
