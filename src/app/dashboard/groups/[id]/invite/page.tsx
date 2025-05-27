import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createInvite, inviteUserToGroup } from "@/lib/actions";
import prisma from "@/lib/db";
import InviteForm from "./InviteForm";
import CopyButton from "./CopyButton";

interface InvitePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return redirect("/login");

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      memberships: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!group || group.memberships.length === 0) {
    return redirect("/dashboard/groups");
  }

  const isAdmin = group.memberships[0].role === "admin";
  if (!isAdmin) {
    return redirect(`/dashboard/groups/${id}`);
  }

  const token = await createInvite(id);
  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/join/${token}`;

  return (
    <div className="p-6 max-w-xl mx-auto text-white">
      <h1 className="text-3xl font-semibold mb-6">Invite to {group.name}</h1>

      <InviteForm groupId={id} inviteUserToGroup={inviteUserToGroup} />

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-2">Invite via Link</h2>
        <div className="flex items-center space-x-2">
          <input
            readOnly
            value={inviteUrl}
            className="w-full px-3 py-2 rounded bg-zinc-800 text-sm"
          />
          <CopyButton inviteUrl={inviteUrl} />
        </div>
      </div>
    </div>
  );
}
