// app/admin/page.tsx
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { UserIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import PromoteUserButton from "./PromoteUserButton";
import DemoteUserButton from "./DemoteUserButton";
import { auth } from "@/lib/auth";
import { getAllUsers } from "@/lib/actions";
import DeleteUserButton from "./DeleteUserButton";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return <p className="text-center mt-20 text-red-600">Unauthorized. You must be an admin.</p>;
  }

  const users = await getAllUsers();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-8 text-zinc-100 text-center drop-shadow">Admin Panel</h1>
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-x-auto p-6">
          <table className="min-w-full">
            <thead>
              <tr className="bg-zinc-800 text-zinc-300">
                <th className="px-6 py-4 text-left rounded-tl-xl">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-center rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`transition ${
                    idx % 2 === 0
                      ? "bg-zinc-950/50"
                      : "bg-zinc-900"
                  } hover:bg-zinc-800/60 border-b border-zinc-800 last:border-0`}
                >
                  <td className="px-6 py-4 text-zinc-100 align-middle">
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-zinc-400" />
                      {user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{user.email}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                      ${user.role === "admin"
                        ? "bg-blue-700 text-blue-100"
                        : "bg-zinc-700 text-zinc-200"}`}>
                      {user.role === "admin" ? (
                        <>
                          <ShieldCheckIcon className="w-4 h-4" />
                          Admin
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-4 h-4" />
                          Member
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-3">
                      {user.role === "member" ? (
                        <PromoteUserButton userId={user.id} />
                      ) : (
                        <DemoteUserButton userId={user.id} />
                      )}
                      {user.role !== "admin" && <DeleteUserButton userId={user.id} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
