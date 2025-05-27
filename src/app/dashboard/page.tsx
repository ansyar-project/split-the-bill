// import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import MonthlyReport from "@/components/MonthlyReport";
import Link from "next/link";
import { UsersIcon, ShieldCheckIcon, UserIcon, PlusIcon } from "@heroicons/react/24/solid";

type Membership = {
    group: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdBy: string;
    };
} & {
    id: string;
    role: string;
    updatedAt: Date;
    userId: string;
    groupId: string;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Get user and all memberships with group and members
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          memberships: { include: { user: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
      <div className="max-w-5xl mx-auto mt-10 px-4 pb-24">
        <h1 className="text-3xl font-extrabold mb-6 text-zinc-100">Dashboard</h1>

        {/* User's group summary */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-zinc-200 mb-3 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-blue-500" />
            Your Groups
          </h2>
          {memberships.length === 0 ? (
            <div className="text-zinc-400 mb-8">
              You are not a member of any groups yet.<br />
              <span className="text-blue-400 underline cursor-pointer">Create or join a group to get started!</span>
            </div>
          ) : (
            <ul className="mb-4 space-y-2">
              {memberships.map((m: Membership) => (
                <li
                  key={m.group.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
                >
                  <UsersIcon className="w-5 h-5 text-zinc-400" />
                  <span className="font-semibold text-zinc-100">{m.group.name}</span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                      m.role === "admin"
                        ? "bg-blue-700 text-blue-100"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {m.role === "admin" ? (
                      <>
                        <ShieldCheckIcon className="w-4 h-4 inline-block" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-4 h-4 inline-block" />
                        Member
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 mb-10" />

        {/* Monthly Reports for each group */}
        <div className="space-y-8">
          {memberships.map((m: Membership) => (
            <div
              key={m.group.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6"
            >
              <MonthlyReport
                groupId={m.group.id}
                groupName={m.group.name}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/dashboard/groups"
        className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition cursor-pointer"
        title="Create Group"
      >
        <PlusIcon className="w-6 h-6" />
        <span className="font-semibold hidden sm:inline">Create Group</span>
      </Link>
    </div>
  );
}
