import { auth } from "@/lib/auth";
import { getUserById, updateUserProfile } from "@/lib/actions";
import { redirect } from "next/navigation";
import { UpdateProfileForm } from "@/components/UpdateProfileForm";
// import { get } from "http";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return redirect("/login");
  const user = await getUserById(session.user.id);
  const userEmail = user?.email ?? '';
  const userName = user?.name ?? '';

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-semibold mb-6 text-zinc-100">Settings</h1>

      <UpdateProfileForm action={updateUserProfile} email={userEmail} defaultName={userName} />
    </div>
  );
}
