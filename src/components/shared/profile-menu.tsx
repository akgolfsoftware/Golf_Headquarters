"use client";

// Profil-meny-dropdown.
// Erstatter UserMenu fra portal-shell — viser avatar, navn, e-post, HCP og
// snarveier til min profil, abonnement, innstillinger, tema-toggle og logg ut.

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  HelpCircle,
  LifeBuoy,
  LogOut,
  Settings,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { logout } from "@/lib/auth/logout";

type Props = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  hcp?: number | null;
};

export function ProfileMenu({ name, email, avatarUrl, hcp }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Dark-mode-toggle deaktivert i første runde — kun light tema.
  // Tokens i globals.css beholdes for senere gjenaktivering.

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Åpne profil-meny"
        className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-1 pr-2 text-sm transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:pr-4"
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
        <span className="hidden text-foreground sm:block">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:w-72"
        >
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-4">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {name}
              </div>
              <div className="truncate text-xs text-muted-foreground">{email}</div>
              {typeof hcp === "number" && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
                  Hcp {hcp.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          <div className="p-2">
            <MenuLink
              href="/portal/meg"
              icon={<UserIcon width={16} height={16} strokeWidth={1.75} aria-hidden />}
              onClick={() => setOpen(false)}
            >
              Min profil
            </MenuLink>
            <MenuLink
              href="/portal/meg/abonnement"
              icon={<Sparkles width={16} height={16} strokeWidth={1.75} aria-hidden />}
              onClick={() => setOpen(false)}
            >
              Mitt abonnement
            </MenuLink>
            <MenuLink
              href="/portal/meg/innstillinger"
              icon={<Settings width={16} height={16} strokeWidth={1.75} aria-hidden />}
              onClick={() => setOpen(false)}
            >
              Innstillinger
            </MenuLink>

            {/* Tema-toggle deaktivert i første runde — kun light tema.
                Beholder logikk + tokens for senere bruk. */}

            <MenuLink
              href="/portal/meg/help"
              icon={
                <LifeBuoy width={16} height={16} strokeWidth={1.75} aria-hidden />
              }
              onClick={() => setOpen(false)}
            >
              Hjelp
            </MenuLink>

            <div className="my-1 h-px bg-border" />

            <form action={logout}>
              <button
                type="submit"
                className="flex min-h-11 w-full items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut width={16} height={16} strokeWidth={1.75} aria-hidden />
                Logg ut
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className="flex min-h-11 w-full items-center gap-2 rounded-md px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Link>
  );
}

// Re-export for å gjøre intent tydelig.
export { HelpCircle };
