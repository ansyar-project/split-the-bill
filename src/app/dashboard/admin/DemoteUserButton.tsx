"use client";

import { demoteUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";

export default function DemoteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDemote() {
    setError(null);
    try {
      await demoteUser(userId);
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error(e);
      setError("Failed to demote user");
    }
  }

  return (
    <>
      <button
        onClick={handleDemote}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-1.5 w-44 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition disabled:opacity-50 cursor-pointer"
      >
        <ArrowDownCircleIcon className="w-5 h-5" />
        {isPending ? "Demoting..." : "Demote to Member"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}
