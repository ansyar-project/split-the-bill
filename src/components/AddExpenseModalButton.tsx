"use client";

import { useState, useEffect } from "react";
import ExpenseForm from "./ExpenseForm";
import { getGroupMembers } from "@/lib/actions"; // <-- import the server action

type Member = {
  id: string;
  name: string;
  email: string;
};

export default function AddExpenseModalButton({
  groupId,
  className = "",
}: {
  groupId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function fetchGroupMembers() {
      const members = await getGroupMembers(groupId);
      setGroupMembers(members);
    }
    if (open) {
      fetchGroupMembers();
    }
  }, [groupId, open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-4 py-2 bg-green-600 rounded cursor-pointer text-white ${className}`}
      >
        Add Expense
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <ExpenseForm
              groupId={groupId}
              groupMembers={groupMembers}
              onSuccess={() => {
                setOpen(false);
                window.location.reload();
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2 rounded bg-zinc-700 text-white w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
