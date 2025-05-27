"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Redirect immediately after sign out
    window.location.href = "/";
  };
  return (
    <Button
      onClick={handleLogout}
      className=""
    >
      <LogOut size={18}/> Log out
    </Button>
  );
}