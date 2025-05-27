// app/page.tsx
// import ThemeToggle from "@/components/Theme-toggle";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors">
      
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
          Welcome to <span >SplitTheBill</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg">
          Easily split group expenses and track balances with friends, roommates, and teams.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-2 bg-zinc-900 dark:bg-zinc-300 dark:border-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-black font-semibold rounded-lg shadow"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 border border-zinc-800 dark:border-zinc-300 text-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-semibold rounded-lg dark:text-zinc-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
