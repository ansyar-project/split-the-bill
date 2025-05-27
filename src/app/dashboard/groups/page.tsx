import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { GroupCard } from "./GroupCard";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export default async function GroupsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { group: true },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight text-center mb-10">
          Your Groups
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Groups List */}
          <div className="md:col-span-2 space-y-6">
            {memberships.length === 0 ? (
              <div className="text-zinc-400 text-center py-12 rounded-xl bg-zinc-900 border border-zinc-800">
                You are not a member of any groups yet.
                <br />
                <span className="text-blue-400 underline cursor-pointer">
                  Create or join a group to get started!
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {memberships.map((m) => (
                  <div
                    key={m.group.id}
                    className="rounded-xl shadow-lg bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition"
                  >
                    <GroupCard
                      group={{
                        ...m.group,
                        description: m.group.description ?? undefined,
                      }}
                      role={m.role}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Create Group Form */}
          <div className="w-full max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">
              Create a New Group
            </h2>
            <CreateGroupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
