"use client";

import { promoteUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";

export default function PromoteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handlePromote() {
    setError(null);
    try {
      await promoteUser(userId);
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error(e);
      setError("Failed to promote user");
    }
  }

  return (
    <>
      <button
        onClick={handlePromote}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-1.5 w-44 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition disabled:opacity-50 cursor-pointer"
      >
        <ArrowUpCircleIcon className="w-5 h-5" />
        {isPending ? "Promoting..." : "Promote to Admin"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}
