'use client';

import { useState } from "react";
import Link from "next/link";
import { deleteGroup } from "@/lib/actions";
import { InviteModal } from "./InviteModal";
import { UsersIcon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/solid";

export function GroupCard({ group, role }: {
  group: { id: string, name: string, description?: string },
  role: string
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteGroup(group.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 border border-zinc-700 bg-zinc-800 rounded-xl shadow-lg flex gap-4 items-center">
      {/* Group Icon */}
      <div className="flex-shrink-0">
        <UsersIcon className="w-10 h-10 text-blue-500 bg-zinc-900 rounded-full p-2 shadow" />
      </div>
      {/* Group Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-zinc-100">{group.name}</h2>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
            ${role === "admin" ? "bg-blue-700 text-blue-100" : "bg-zinc-700 text-zinc-200"}`}>
            {role === "admin" ? (
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
        </div>
        {group.description && (
          <p className="text-sm text-zinc-400">{group.description}</p>
        )}
      </div>
      {/* Actions */}
      <div className="flex flex-col gap-2 items-end">
        <Link
          href={`/dashboard/groups/${group.id}`}
          className="w-20 text-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition rounded-lg text-white text-sm font-semibold shadow cursor-pointer"
        >
          View
        </Link>
        {role === "admin" && (
          <>
            <button
              onClick={() => setShowInvite(true)}
              className="w-20 text-center px-4 py-1.5 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition rounded-lg text-white text-sm font-semibold shadow cursor-pointer"
            >
              Invite
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-20 text-center px-4 py-1.5 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition rounded-lg text-white text-sm font-semibold shadow cursor-pointer disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
            <InviteModal open={showInvite} setOpen={setShowInvite} groupId={group.id} />
          </>
        )}
      </div>
    </div>
  );
}
