"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import { LogoMark } from "@/components/LogoMark";

type DashboardSidebarProps = {
  userName: string;
  roleLabel: string;
  activeItem?: "Dashboard" | "Projekty";
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 9.75v9a.75.75 0 0 0 .75.75h4.5v-5.25h3v5.25H18a.75.75 0 0 0 .75-.75v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h4.05c.597 0 1.17.237 1.592.658l1.11 1.11a2.25 2.25 0 0 0 1.591.659H18A2.25 2.25 0 0 1 20.25 9.9v6.6A2.25 2.25 0 0 1 18 18.75H6A2.25 2.25 0 0 1 3.75 16.5v-9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.9">
      <path d="M15.75 8.25V5.625A2.625 2.625 0 0 0 13.125 3h-5.25A2.625 2.625 0 0 0 5.25 5.625v12.75A2.625 2.625 0 0 0 7.875 21h5.25a2.625 2.625 0 0 0 2.625-2.625V15.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9m0 0 3.75-3.75M9 12l3.75 3.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardSidebar({ userName, roleLabel, activeItem = "Dashboard" }: DashboardSidebarProps) {
  const router = useRouter();

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
    { label: "Projekty", href: "/dashboard/projekty", icon: <FolderIcon /> },
  ] as const;

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <aside className="panel sticky top-3 z-30 flex w-full items-center justify-between gap-3 px-3 py-3 md:h-[calc(100vh-2rem)] md:w-[88px] md:flex-col md:items-center md:justify-start md:px-2 md:py-4">
      <div className="flex min-w-0 items-center gap-3 md:flex-col md:gap-4">
        <Link
          href="/dashboard"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl p-0 transition hover:scale-[1.03]"
          aria-label="Gotly"
          title="Gotly"
        >
          <LogoMark size="md" />
        </Link>
        <div className="min-w-0 md:hidden">
          <p className="truncate text-sm font-semibold text-textMain">{userName}</p>
          <p className="truncate text-[11px] uppercase tracking-[0.16em] text-textMuted">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex flex-1 items-center justify-center gap-2 overflow-x-auto md:mt-6 md:w-full md:flex-col md:items-center md:gap-3 md:overflow-visible">
        {items.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={`flex h-11 min-w-[44px] items-center justify-center rounded-2xl border px-3 transition md:h-12 md:w-12 md:px-0 ${
                isActive
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-white/10 text-textMuted hover:border-accent hover:text-accent"
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>

      <div className="hidden w-full items-center gap-3 md:mb-3 md:flex md:flex-col md:gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-sm font-bold text-accent" title={`${userName} • ${roleLabel}`}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <p className="max-w-full text-center text-[9px] uppercase leading-4 tracking-[0.15em] text-textMuted">
          {roleLabel}
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Wyloguj się"
        title="Wyloguj się"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-400/20 text-rose-200 transition hover:bg-rose-400/10 md:h-12 md:w-12"
      >
        <LogoutIcon />
      </button>
    </aside>
  );
}
