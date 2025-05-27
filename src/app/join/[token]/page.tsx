import { joinGroupWithLink } from "@/lib/actions";
// import { redirect } from "next/navigation";

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  try {
    await joinGroupWithLink((await params).token);

    // Optional: delay and redirect
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold text-green-500">🎉 You are in!</h1>
        <p className="mt-2 text-zinc-400">You have successfully joined the group.</p>
        <meta httpEquiv="refresh" content="2;url=/dashboard/groups" />
      </div>
    );
  } catch (error: unknown) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold text-red-500">⛔ Invite Failed</h1>
        <p className="mt-2 text-zinc-400">{(error instanceof Error) && error.message || "Invalid or expired invite."}</p>
        <a href="/dashboard" className="mt-4 inline-block underline text-sm text-zinc-300">
          Go back to dashboard
        </a>
      </div>
    );
  }
}
