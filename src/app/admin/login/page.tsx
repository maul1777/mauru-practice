import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() { if(await readAdminSession())redirect("/admin"); return <main className="container" style={{maxWidth:460,paddingBlock:80}}><div className="card"><div className="eyebrow">Area Admin</div><h1 style={{fontSize:"2.5rem"}}>Selamat datang kembali.</h1><LoginForm /></div></main>; }
