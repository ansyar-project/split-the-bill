"use client";

import { useState } from "react";
// import { inviteUserToGroup } from "@/lib/actions";


export default function InviteForm({
  groupId,
  inviteUserToGroup,
}: {
  groupId: string;
  inviteUserToGroup: (groupId: string, email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      await inviteUserToGroup(groupId, email);
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error && err.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium mb-2">Invite by Email</h2>

      <div className="flex space-x-2">
        <input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 rounded bg-zinc-800 text-sm"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
        >
          Invite
        </button>
      </div>

      {success && <p className="text-green-500 mt-2">✅ Invite sent!</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
