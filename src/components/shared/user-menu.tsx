"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { logout } from "@/lib/auth/logout";

type Props = {
  name: string;
  email: string;
  avatarUrl: string | null;
};

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
        className="flex items-center gap-4 rounded-full border border-border bg-card px-1 py-1 pr-4 text-sm transition-colors hover:border-ring active:border-ring/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          className="absolute right-0 z-50 mt-2 w-60 rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <div className="px-4 py-2">
            <div className="text-sm font-semibold text-foreground">{name}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
          <div className="my-1 h-px bg-border" />
          <form action={logout}>
            <button
              type="submit"
              className="block w-full rounded-md px-4 py-2 text-left text-sm text-foreground hover:bg-secondary active:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Logg ut
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
