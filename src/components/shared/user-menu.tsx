"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/lib/auth/logout";

type Props = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

/**
 * UserMenu — profil-dropdown (master-plan Q4)
 * 5 menyvalg: Min profil / Innstillinger / Abonnement / Hjelp / Logg ut
 */
export function UserMenu({ name, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-2 text-sm transition hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:pr-4"
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <span className="hidden text-foreground sm:block">{name.split(" ")[0]}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-xs rounded-2xl border border-border bg-card p-1.5 shadow-[0_8px_30px_rgba(10,31,24,0.12)] sm:w-64"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display truncate text-sm font-semibold text-foreground">
                {name}
              </div>
              <div className="truncate text-xs text-muted-foreground">{email}</div>
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          {/* Menyvalg */}
          <MenuLink href="/portal/meg" icon={User} label="Min profil" />
          <MenuLink
            href="/portal/meg/innstillinger"
            icon={Settings}
            label="Innstillinger"
          />
          <MenuLink
            href="/portal/meg/abonnement"
            icon={CreditCard}
            label="Abonnement"
          />
          <MenuLink href="/portal/meg/help" icon={HelpCircle} label="Hjelp" />

          <div className="my-1 h-px bg-border" />

          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Logg ut
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      {label}
    </Link>
  );
}
