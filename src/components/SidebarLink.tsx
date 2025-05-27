"use client";
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react'


interface SidebarLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
}

const Sidebarlink = ({ href, label, icon }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-zinc-800 text-white font-medium"
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Sidebarlink