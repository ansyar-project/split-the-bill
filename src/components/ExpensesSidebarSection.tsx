"use client";
import React, { useState } from "react";
import { Receipt, ChevronDown, ChevronRight, User, Group } from "lucide-react";
import SidebarLink from "./SidebarLink";

const ExpensesSidebarSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex items-center w-full px-3 py-2 rounded text-zinc-200 hover:bg-zinc-800 transition group"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Receipt size={18} className="mr-2" />
        <span className="flex-1 text-left">Expenses</span>
        {open ? (
          <ChevronDown size={16} className="ml-1" />
        ) : (
          <ChevronRight size={16} className="ml-1" />
        )}
      </button>
      {open && (
        <div className="ml-7 flex flex-col gap-1">
          <SidebarLink
            href="/dashboard/expenses/user"
            label="User Expense"
            icon={<User size={16} />}
          />
          <SidebarLink
            href="/dashboard/expenses/group"
            label="Group Expense"
            icon={<Group size={16} />}
          />
        </div>
      )}
    </>
  );
};

export default ExpensesSidebarSection;