"use client";
import { useState, useMemo } from "react";

type Expense = {
  id: string | number;
  title: string;
  amount: number;
  createdAt: string | Date;
};

export default function GroupExpensesTable({ expenses }: { expenses: Expense[] }) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = useMemo(() => {
    return expenses.filter((e: Expense) => {
      const matchesTitle = e.title.toLowerCase().includes(search.toLowerCase());
      const dateStr = new Date(e.createdAt).toLocaleDateString("en-CA"); // yyyy-mm-dd
      const matchesDate = dateFilter ? dateStr === dateFilter : true;
      return matchesTitle && matchesDate;
    });
  }, [expenses, search, dateFilter]);

  return (
    <section>
      <div className="flex flex-row gap-2 mb-3">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-zinc-800 text-white w-full outline-none"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded bg-zinc-800 text-white w-48 outline-none"
        />
      </div>
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-zinc-400 px-4 py-6">No expenses found.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-3 text-zinc-400 font-semibold">Title</th>
                <th className="px-4 py-3 text-zinc-400 font-semibold">Amount</th>
                <th className="px-4 py-3 text-zinc-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense: Expense, idx: number) => (
                <tr
                  key={expense.id}
                  className={`border-t border-zinc-800 ${
                    idx % 2 === 1 ? "bg-zinc-950/50" : ""
                  } hover:bg-zinc-800/60 transition`}
                >
                  <td className="px-4 py-3 text-zinc-100 rounded-l-lg">
                    {expense.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {expense.amount.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 rounded-r-lg">
                    {new Date(expense.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}