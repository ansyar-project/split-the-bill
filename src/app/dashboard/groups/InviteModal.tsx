'use client';

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { createInvite, inviteUserToGroup } from "@/lib/actions";

export function InviteModal({
  open, setOpen, groupId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: string;
}) {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");

  async function handleEmailInvite() {
    await inviteUserToGroup(groupId, email);
    setEmail("");
    alert("User invited!");
  }

  async function handleLinkInvite() {
    const token = await createInvite(groupId);
    const url = `${window.location.origin}/join/${token}`;
    setLink(url);
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-zinc-900 p-6 rounded shadow max-w-md w-full space-y-4 text-white">
          <Dialog.Title className="text-xl font-bold">Invite to Group</Dialog.Title>

          <div>
            <label>Email:</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-zinc-800"
              placeholder="user@example.com"
            />
            <button
              onClick={handleEmailInvite}
              className="mt-2 px-4 py-2 bg-green-600 rounded"
            >
              Invite via Email
            </button>
          </div>

          <div className="border-t border-zinc-700 pt-4">
            <button
              onClick={handleLinkInvite}
              className="px-4 py-2 bg-blue-600 rounded"
            >
              Generate Invite Link
            </button>
            {link && (
              <p className="mt-2 text-sm break-all text-zinc-300">
                {link}
              </p>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
