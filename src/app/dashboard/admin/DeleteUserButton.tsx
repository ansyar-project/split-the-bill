"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { deleteUser } from "@/lib/actions";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setError(null);
    try {
      await deleteUser(userId);
      setShowModal(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error(e);
      setError("Failed to delete user");
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-1.5 w-44 rounded-lg bg-red-700 text-white font-semibold shadow hover:bg-red-800 focus:ring-2 focus:ring-red-400 transition disabled:opacity-50 cursor-pointer"
      >
        <TrashIcon className="w-5 h-5" />
        {isPending ? "Deleting..." : "Delete User"}
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-bold text-zinc-100 mb-2">
              Delete User
            </h2>
            <p className="text-zinc-300 mb-4">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            {error && (
              <p className="text-red-500 text-xs mb-2">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg bg-red-700 text-white font-semibold shadow hover:bg-red-800 transition disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
