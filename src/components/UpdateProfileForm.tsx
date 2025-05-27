"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";

export function UpdateProfileForm({ action, email, defaultName }: {
  action: (formData: FormData) => void;
  email: string;
  defaultName: string;
}) {
  const [success, setSuccess] = useState(false);
  const { pending } = useFormStatus();

  return (
    <form
      action={async (formData) => {
        setSuccess(false);
        await action(formData);
        setSuccess(true);
      }}
      className="space-y-4 text-zinc-300"
    >
      <input type="hidden" name="email" value={email} />

      <div className="space-y-1">
        <label className="block text-sm">Name</label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm">New Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-white"
        />
      </div>

      {success && <p className="text-green-500 text-sm">✅ Updated successfully</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded disabled:opacity-50 hover:cursor-pointer"
      >
        {pending ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}