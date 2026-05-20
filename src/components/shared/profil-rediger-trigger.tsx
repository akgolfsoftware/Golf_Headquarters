"use client";

/**
 * ProfilRedigerTrigger — knapp som åpner ProfilRedigerModal.
 *
 * Brukes fra flere steder:
 *   - /portal/meg/profil — "Rediger raskt"-knapp i hero
 *   - /portal/page.tsx — pille ved siden av PortalAvatarButton
 *   - /admin/spillere/[id] — coach kan åpne rediger-modal for spilleren
 *
 * Server-siden henter ut spillerens nåværende profil og sender inn som
 * `initial`. Trigger-komponenten holder modal-state lokalt.
 */

import { useState } from "react";
import { Pencil } from "lucide-react";

import {
  ProfilRedigerModal,
  type ProfilRedigerInitial,
} from "./profil-rediger-modal";

type Variant = "primary" | "ghost" | "pill" | "icon";

export function ProfilRedigerTrigger({
  initial,
  label = "Rediger profil",
  variant = "primary",
  title,
  className,
  targetUserId,
}: {
  initial: ProfilRedigerInitial;
  label?: string;
  variant?: Variant;
  title?: string;
  className?: string;
  /** Sett når coach/admin redigerer en annen spiller. */
  targetUserId?: string;
}) {
  const [open, setOpen] = useState(false);

  const baseCss =
    "inline-flex items-center gap-1.5 transition-colors disabled:opacity-50";
  const variantCss: Record<Variant, string> = {
    primary:
      "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90",
    ghost:
      "rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary",
    pill: "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
    icon: "grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
  };

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className={`${baseCss} ${variantCss[variant]} ${className ?? ""}`}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        {variant !== "icon" && <span>{label}</span>}
      </button>
      {open && (
        <ProfilRedigerModal
          initial={initial}
          onClose={() => setOpen(false)}
          title={title}
          targetUserId={targetUserId}
        />
      )}
    </>
  );
}
