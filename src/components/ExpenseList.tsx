"use client";

import { useState } from "react";
import { deleteExpense } from "@/lib/actions";
import ExpenseForm from "./ExpenseForm";

export default function ExpenseList({
  expenses,
  group,
}: {
  expenses: { id: string; title: string; amount: number; createdAt?: string }[];
  group: { id: string; memberships: { user: { id: string; name: string; email?: string } }[] };
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<{
    id: string;
    title: string;
    amount: number;
    createdAt?: string;
  } | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    setPendingId(id);
    try {
      await deleteExpense(id);
      setModalId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete");
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-4 py-2 text-zinc-300">Title</th>
              <th className="px-4 py-2 text-zinc-300">Amount</th>
              <th className="px-4 py-2 text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, idx) => (
              <tr
                key={e.id}
                className={idx % 2 === 0 ? "bg-zinc-800" : "bg-zinc-900"}
              >
                <td className="px-4 py-2 font-semibold text-white">
                  {e.title}
                </td>
                <td className="px-4 py-2 text-zinc-400">
                  Rp.{" "}
                  {e.amount.toLocaleString("id-ID", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditExpense(e)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setModalId(e.id)}
                      disabled={pendingId === e.id}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {error && (
              <tr>
                <td colSpan={3} className="text-red-500 px-4 py-2">
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {modalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete Expense
            </h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete this expense?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalId(null)}
                className="px-4 py-2 rounded bg-zinc-700 text-white"
                disabled={pendingId === modalId}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(modalId)}
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                disabled={pendingId === modalId}
              >
                {pendingId === modalId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <ExpenseForm
              groupId={group.id} // You can pass the groupId if needed for your logic
              groupMembers={group.memberships.map(m => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email ?? ""
              }))}
              expense={editExpense}
              onSuccess={() => {
                setEditExpense(null);
                window.location.reload(); // Or use router.refresh() if available
              }}
            />
            <button
              onClick={() => setEditExpense(null)}
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
