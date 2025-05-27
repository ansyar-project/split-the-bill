import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
// import ExpenseList from "@/components/ExpenseList";
import AddExpenseModalButton from "@/components/AddExpenseModalButton";
import { removeGroupMember, changeGroupMemberRole } from "@/lib/actions";
// import { UserIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import GroupMembersTable from "@/components/GroupMembersTable";
import GroupExpensesTable from "@/components/GroupExpensesTable";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: true } },
      expenses: true,
    },
  });

  if (!group) return notFound();

  const isAdmin = group.memberships.some(
    (m) => m.userId === session.user.id && m.role === "admin"
  );

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-100 mb-1">
            {group.name}
          </h1>
          <p className="text-base text-zinc-400">{group.description}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Link
              href={`/dashboard/groups/${group.id}/invite`}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-white font-semibold shadow text-base"
            >
              Invite
            </Link>
            <AddExpenseModalButton
              groupId={group.id}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 transition rounded-lg text-white font-semibold shadow text-base"
            />
          </div>
        )}
      </div>

      {/* Members Section */}
      <section>
        <h2 className="text-xl font-bold text-zinc-200 mb-3">Members</h2>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
          <GroupMembersTable
            memberships={group.memberships.map(m => ({
              ...m,
              role: m.role as "admin" | "member"
            }))}
            isAdmin={isAdmin}
            sessionUserId={session.user.id}
            groupId={group.id}
            removeGroupMember={removeGroupMember}
            changeGroupMemberRole={changeGroupMemberRole}
          />
        </div>
      </section>

      {/* Expenses Section */}
      <section>
        <h2 className="text-xl font-bold text-zinc-200 mb-3 mt-8">
          Expenses
        </h2>
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
          <GroupExpensesTable expenses={group.expenses} />
        </div>
      </section>
    </div>
  );
}
