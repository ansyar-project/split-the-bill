"use client";
import { useState, useMemo } from "react";
import { UserIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

type User = {
  id: string;
  name: string;
  email: string;
};

type Membership = {
  userId: string;
  user: User;
  role: "admin" | "member";
};

interface GroupMembersTableProps {
  memberships: Membership[];
  isAdmin: boolean;
  sessionUserId: string;
  groupId: string;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  changeGroupMemberRole: (groupId: string, userId: string, newRole: "admin" | "member") => Promise<void>;
}

export default function GroupMembersTable({
  memberships,
  isAdmin,
  sessionUserId,
  groupId,
  removeGroupMember,
  changeGroupMemberRole,
}: GroupMembersTableProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      memberships.filter((m: Membership) =>
        m.user.name.toLowerCase().includes(search.toLowerCase()) ||
        m.user.email.toLowerCase().includes(search.toLowerCase())
      ),
    [memberships, search]
  );

  return (
    <section>
      {/* <h2 className="text-xl font-bold text-zinc-200 mb-3">Members</h2> */}
      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-3 px-3 py-2 rounded bg-zinc-800 text-white w-full outline-none"
      />
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-800">
              <th className="px-4 py-3 text-zinc-400 font-semibold">Name</th>
              <th className="px-4 py-3 text-zinc-400 font-semibold">Email</th>
              <th className="px-4 py-3 text-zinc-400 font-semibold">Role</th>
              {isAdmin && (
                <th className="px-4 py-3 text-zinc-400 font-semibold text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m: Membership, idx: number) => (
              <tr
                key={m.userId}
                className={`border-t border-zinc-800 ${
                  idx % 2 === 1 ? "bg-zinc-950/50" : ""
                } hover:bg-zinc-800/60 transition`}
              >
                <td className="px-4 py-3 text-zinc-100 rounded-l-lg align-middle">
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-zinc-400" />
                    {m.user.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300 align-middle">
                  {m.user.email}
                </td>
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      m.role === "admin"
                        ? "bg-blue-700 text-blue-100"
                        : "bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {m.role === "admin" ? (
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
                {isAdmin && (
                  <td className="px-4 py-3 rounded-r-lg align-middle">
                    {m.userId !== sessionUserId && (
                      <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                        <button
                          onClick={async () => {
                            await removeGroupMember(groupId, m.userId);
                            // Optionally show a toast or update UI
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 transition text-white rounded font-semibold text-xs shadow cursor-pointer w-24"
                        >
                          Remove
                        </button>
                        <button
                          onClick={async () => {
                            await changeGroupMemberRole(
                              groupId,
                              m.userId,
                              m.role === "admin" ? "member" : "admin"
                            );
                            // Optionally show a toast or update UI
                          }}
                          className={`px-3 py-1 ${
                            m.role === "admin"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          } transition text-white rounded font-semibold text-xs shadow cursor-pointer w-24`}
                        >
                          {m.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}