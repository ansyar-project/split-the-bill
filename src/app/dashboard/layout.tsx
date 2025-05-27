// app/dashboard/layout.tsx
import type { ReactNode } from "react";
// import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SideBar from "@/components/SideBar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-zinc-900 text-zinc-100">
      <SideBar session={session} />

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
