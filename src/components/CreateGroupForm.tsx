'use client'

import { useState } from "react";
import { createGroup } from "@/lib/actions"; // Adjust path
import { useRouter } from "next/navigation";

export function CreateGroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await createGroup(formData);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Group Name</label>
        <input
          name="name"
          required
          className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          className="w-full px-3 py-2 border rounded-md bg-zinc-800 text-white"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}
