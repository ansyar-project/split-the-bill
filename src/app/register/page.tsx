"use client";

import { registerUser } from "@/lib/actions";
import Link from "next/link";
import { useState, FormEvent } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      await registerUser({ name, email, password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-900 dark:text-zinc-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-50 mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600"
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600"
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={6}
            className="w-full p-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-600"
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-700 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-700 dark:text-zinc-300 underline hover:text-zinc-900">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
