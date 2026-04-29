import type { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../lib/firebaseAdmin";

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
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    next();
    return;
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    const email =
      typeof decoded.email === "string" ? decoded.email.toLowerCase() : undefined;
    req.userId = decoded.uid;
    req.userEmail = email;

    const adminEmails = getAdminEmails();
    req.isAdmin =
      decoded.admin === true || (!!email && adminEmails.includes(email));
  } catch {
    // continue unauthenticated if token verification fails
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
