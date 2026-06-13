"use client";

/**
 * LogoutButton — fullbredde utloggingsknapp for /portal/meg.
 *
 * Bruker en form action mot server action for å støtte progressive
 * enhancement; knappen viser samtidig en lokal pending-tilstand.
 */

import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  onLogout: () => Promise<void>;
};

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <form
      action={onLogout}
      className="pt-2"
    >
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border font-mono text-xs font-bold uppercase tracking-[0.1em] text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
        Logg ut
      </button>
    </form>
  );
}
