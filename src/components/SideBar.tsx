import React from "react";
import LogoutButton from "./LogoutButton";
import {
  Home,
  Users,
  Settings,
  Shield,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
// import ExpensesSidebarSection from "./ExpensesSidebarSection";


interface Session {
  user: {
    role: string;
  };
}

const SideBar = ({ session }: { session: Session }) => {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-8 tracking-tight text-white">
          🌙 Dashboard
        </div>
        <nav className="space-y-2">
          <SidebarLink
            href="/dashboard"
            label="Home"
            icon={<Home size={18} />}
          />
          <SidebarLink
            href="/dashboard/groups"
            label="Groups"
            icon={<Users size={18} />}
          />
          {/* <ExpensesSidebarSection /> */}
          <SidebarLink
            href="/dashboard/settings"
            label="Settings"
            icon={<Settings size={18} />}
          />
          {session.user.role === "admin" && (
            <SidebarLink
              href="/dashboard/admin"
              label="Admin"
              icon={<Shield size={18} />}
            />
          )}
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <LogoutButton />
      </div>
    </aside>
  );
};

export default SideBar;
