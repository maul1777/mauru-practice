import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookie, createAdminToken } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ email: z.email(), password: z.string().min(8).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email atau password tidak valid." }, { status: 400 });
  const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin?.active || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, await createAdminToken({ id: admin.id, email: admin.email, name: admin.name }), adminCookie.options);
  return response;
}
