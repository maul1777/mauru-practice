import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "mauru_admin";
const secret = () => {
  if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET wajib diatur di production.");
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "development-only-change-me");
};

export interface AdminSession { id: string; email: string; name: string }

export async function createAdminToken(admin: AdminSession): Promise<string> {
  return new SignJWT({ id: admin.id, email: admin.email, name: admin.name }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { id: payload.id, email: payload.email, name: payload.name };
  } catch { return null; }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export const adminCookie = { name: COOKIE_NAME, options: { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 } };
