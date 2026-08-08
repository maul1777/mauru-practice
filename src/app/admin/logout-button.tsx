"use client";
import { useRouter } from "next/navigation";
export function LogoutButton(){const router=useRouter();return <button className="button secondary" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});router.replace("/admin/login");router.refresh();}}>Keluar</button>}
