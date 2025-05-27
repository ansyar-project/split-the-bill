import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GroupsList() {
  const session = await auth();
  if (!session?.user) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { group: true },
  });

  return (
    <div className="space-y-4 mt-6">
      {memberships.map((m) => (
        <div
          key={m.group.id}
          className="p-4 border border-zinc-700 rounded bg-zinc-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{m.group.name}</h2>
              <p className="text-sm text-zinc-400">{m.group.description}</p>
            </div>
            <div className="space-x-2">
              <Link
                href={`/dashboard/groups/${m.group.id}`}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
              >
                View
              </Link>
              {m.role === "admin" && (
                <form
                  action={`/api/groups/delete?id=${m.group.id}`} // Optional API route
                  method="POST"
                  className="inline"
                >
                  <button className="text-sm px-3 py-1 bg-red-600 text-white rounded">
                    Delete
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
