"use client";

import { useState, useTransition, useEffect } from "react";
import { createExpense, editExpense } from "@/lib/actions";

type Member = {
  id: string;
  name: string;
  email: string;
};

export default function ExpenseForm({
  groupId,
  groupMembers,
  expense,
  onSuccess,
}: {
  groupId: string;
  groupMembers: Member[];
  expense?: {
    id: string;
    title: string;
    amount: number;
    createdAt?: string;
    splits?: { userId: string; amount: number }[];
  };
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState(expense?.title || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [date, setDate] = useState(
    expense?.createdAt ? expense.createdAt.slice(0, 10) : ""
  );
  const [splits, setSplits] = useState<{ userId: string; amount: number }[]>(
    expense?.splits
      ? expense.splits
      : groupMembers.map((m) => ({ userId: m.id, amount: 0 }))
  );
  const [splitType, setSplitType] = useState<"equal" | "custom">(
    expense?.splits && isEqualSplit(expense.splits) ? "equal" : "custom"
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // When amount or members change and splitType is "equal", update splits
  useEffect(() => {
    if (splitType === "equal" && amount && groupMembers.length > 0) {
      const amt = parseFloat(amount);
      if (!isNaN(amt)) {
        const perPerson = Math.floor((amt / groupMembers.length) * 100) / 100;
        const remainder =
          Math.round((amt - perPerson * groupMembers.length) * 100) / 100;
        setSplits(
          groupMembers.map((m, idx) => ({
            userId: m.id,
            amount: idx === 0 ? perPerson + remainder : perPerson,
          }))
        );
      }
    }
  }, [amount, groupMembers, splitType]);

  // When editing, initialize splits for custom if present
  useEffect(() => {
    if (expense?.splits && splitType === "custom") {
      setSplits(expense.splits);
    }
    // If expense is not provided, reset splits to group members
  }, [expense, splitType]);

  // Update splits when group members change
  useEffect(() => {
    setSplits((prev) => {
      // Add missing members
      const withAll = groupMembers.map((m) => {
        const found = prev.find((s) => s.userId === m.id);
        return found ? found : { userId: m.id, amount: 0 };
      });
      // Remove splits for users no longer in group
      return withAll.filter((s) => groupMembers.some((m) => m.id === s.userId));
    });
  }, [groupMembers]);

  // Set split type based on expense splits
  useEffect(() => {
    if (expense?.splits) {
      setSplitType(isEqualSplit(expense.splits) ? "equal" : "custom");
    }
    // If expense is not provided, reset splits to group members
  }, [expense]);

  function handleCustomSplit(userId: string, value: string) {
    const amt = parseFloat(value) || 0;
    setSplits((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, amount: amt } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("amount", amount);
        if (date) formData.set("date", date);
        formData.set("splits", JSON.stringify(splits));

        const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
        if (splitType === "custom" && Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
          setError("Custom splits must sum to the total amount.");
          return;
        }

        if (expense) {
          await editExpense(expense.id, formData);
        } else {
          await createExpense(formData, groupId);
        }
        onSuccess?.();
        setTitle("");
        setAmount("");
        setDate("");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to save expense");
        }
      }
    });
  }

  function isEqualSplit(splits: { userId: string; amount: number }[] = []) {
    if (splits.length === 0) return true;
    const first = splits[0].amount;
    return splits.every((s) => Math.abs(s.amount - first) < 0.01);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 p-4 rounded-lg shadow flex flex-col gap-3 max-w-md mb-4"
    >
      <h3 className="text-lg font-semibold text-white mb-2">
        {expense ? "Edit Expense" : "Add Expense"}
      </h3>
      <input
        className="bg-zinc-800 text-white rounded px-3 py-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="bg-zinc-800 text-white rounded px-3 py-2"
        placeholder="Amount"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        className="bg-zinc-800 text-white rounded px-3 py-2"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div>
        <label className="text-zinc-300 font-semibold">Split Type:</label>
        <div className="flex gap-4 mt-1 mb-2">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={splitType === "equal"}
              onChange={() => setSplitType("equal")}
            />
            <span className="text-zinc-200">Equal</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              checked={splitType === "custom"}
              onChange={() => setSplitType("custom")}
            />
            <span className="text-zinc-200">Custom</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-zinc-300 font-semibold">Split Among:</label>
        <div className="flex flex-col gap-2 mt-1">
          {groupMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <span className="text-zinc-200 w-32 truncate">{member.name}</span>
              <input
                className="bg-zinc-800 text-white rounded px-2 py-1 w-24"
                type="number"
                min="0"
                step="0.01"
                value={
                  splits
                    .find((s) => s.userId === member.id)
                    ?.amount?.toString() || ""
                }
                onChange={(e) =>
                  splitType === "custom"
                    ? handleCustomSplit(member.id, e.target.value)
                    : undefined
                }
                disabled={splitType === "equal"}
                required
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 mt-2 disabled:opacity-50"
      >
        {pending
          ? expense
            ? "Saving..."
            : "Adding..."
          : expense
          ? "Update"
          : "Add"}
      </button>
    </form>
  );
}