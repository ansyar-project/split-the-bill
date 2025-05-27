"use client";
import { useState } from "react";
import { getMonthlyReport } from "@/lib/actions";
import { CalendarDaysIcon, UserIcon } from "@heroicons/react/24/solid";

type Member = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  amount: number;
  createdAt: string | Date;
  title: string;
  paidBy?: Member;
};

type Report = {
  members: Member[];
  balances: { [memberId: string]: number };
  expenses: Expense[];
};

export default function MonthlyReport({ groupId, groupName }: { groupId: string; groupName: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    const data = await getMonthlyReport(groupId, month, year);
    if (!data) {
      setReport(null);
      setLoading(false);
      return;
    }
    // Convert createdAt from Date to string for each expense
    const normalizedData = {
      ...data,
      expenses: data.expenses.map((expense: Expense) => ({
        ...expense,
        createdAt:
          typeof expense.createdAt === "string"
            ? expense.createdAt
            : expense.createdAt?.toISOString(),
      })),
    };
    setReport(normalizedData);
    setLoading(false);
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto mb-8 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDaysIcon className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">{groupName} <span className="font-normal text-zinc-400">- Monthly Report</span></h2>
      </div>
      <div className="flex gap-2 mb-6 items-center">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="bg-zinc-800 text-white rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="bg-zinc-800 text-white rounded px-3 py-1 w-24 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={fetchReport}
          className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-semibold shadow cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading..." : "View"}
        </button>
        {/* PDF Button */}
        <a
          href={`/api/groups/${groupId}/report?month=${month}&year=${year}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-1.5 bg-purple-600 hover:bg-purple-700 transition text-white rounded-lg font-semibold shadow cursor-pointer"
        >
          Download PDF
        </a>
      </div>
      {report && (
        <>
          <h3 className="text-lg text-zinc-200 mb-2 font-semibold">Balances</h3>
          <ul className="mb-6 space-y-2">
            {report.members.map((m: Member) => (
              <li key={m.id} className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-100">{m.name}:</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${
                    report.balances[m.id] < 0
                      ? "bg-red-900 text-red-400"
                      : "bg-green-900 text-green-400"
                  }`}
                >
                  {report.balances[m.id].toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="text-lg text-zinc-200 mb-2 font-semibold">Expenses</h3>
          {report.expenses.length === 0 ? (
            <div className="text-zinc-400 italic mb-2">No expenses for this month.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-zinc-300 font-semibold bg-zinc-800 rounded-l-lg">Date</th>
                    <th className="px-3 py-2 text-zinc-300 font-semibold bg-zinc-800">Title</th>
                    <th className="px-3 py-2 text-zinc-300 font-semibold bg-zinc-800">Amount</th>
                    <th className="px-3 py-2 text-zinc-300 font-semibold bg-zinc-800 rounded-r-lg">Paid By</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenses.map((e: Expense, idx) => (
                    <tr
                      key={e.id}
                      className={`transition ${
                        idx % 2 === 1 ? "bg-zinc-950/50" : "bg-zinc-900"
                      } hover:bg-zinc-800/60`}
                    >
                      <td className="px-3 py-2 text-zinc-400 rounded-l-lg">{new Date(e.createdAt).toLocaleDateString("id-ID")}</td>
                      <td className="px-3 py-2 text-white">{e.title}</td>
                      <td className="px-3 py-2 text-zinc-400">
                        {e.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                      </td>
                      <td className="px-3 py-2 text-zinc-400 rounded-r-lg">{e.paidBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}