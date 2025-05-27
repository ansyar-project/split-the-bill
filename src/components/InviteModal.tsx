"use client";

import { useState, useTransition } from "react";
import { inviteUserToGroup, createInvite } from "@/lib/actions";
import { toast } from "sonner";

export function InviteModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleInvite = () => {
    startTransition(async () => {
      try {
        await inviteUserToGroup(groupId, email);
        toast.success("User invited!");
        setEmail("");
      } catch (err: unknown) {
        toast.error((err instanceof Error) && err.message || "Failed to invite user");
      }
    });
  };

  const handleGenerateLink = () => {
    startTransition(async () => {
      try {
        const token = await createInvite(groupId);
        setInviteLink(`${window.location.origin}/join/${token}`);
      } catch (err: unknown) {
        toast.error((err instanceof Error) && err.message || "Failed to generate invite link");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Invite to Group</h2>

        <label className="block text-sm text-zinc-400 mb-1">Invite via Email</label>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white"
            placeholder="user@example.com"
          />
          <button
            onClick={handleInvite}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={isPending || !email}
          >
            Send
          </button>
        </div>

        <label className="block text-sm text-zinc-400 mb-1">Or generate invite link</label>
        <button
          onClick={handleGenerateLink}
          className="w-full mb-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={isPending}
        >
          Generate Link
        </button>

        {inviteLink && (
          <div className="text-sm mt-2 text-zinc-300 break-all">
            Invite Link: <br />
            <span className="font-mono">{inviteLink}</span>
          </div>
        )}

        <button onClick={onClose} className="mt-6 text-sm text-zinc-400 hover:underline">
          Close
        </button>
      </div>
    </div>
  );
}
