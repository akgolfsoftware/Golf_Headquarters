"use client";

/**
 * Train-lock — delt kit for AgencyOS Workspace (T13-restside, 27.08.2026).
 *
 * Samme rolle som `oppsett/tl-kit.tsx`: et lite sett TL-primitiver som
 * gjenbrukes på tvers av de tre Workspace-skjermene (hub, Notion,
 * Prosjekter) som deler samme fane-navigasjon (`WorkspaceTabs`, Paper).
 * `/admin/workspace/oppgaver` er IKKE en av fanene — den er en ren
 * redirect til `/admin/handlingssenter` (uendret), som «Oppgaver»-fanen
 * her fortsatt peker til.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TL_PRESS } from "../oppsett/tl-kit";

export type WorkspaceFaneId = "uke" | "oppgaver" | "prosjekter" | "tildelt" | "notion";

const FANER: { id: WorkspaceFaneId; label: string; href: string }[] = [
  { id: "uke", label: "Min uke", href: "/admin/workspace" },
  { id: "oppgaver", label: "Oppgaver", href: "/admin/handlingssenter" },
  { id: "prosjekter", label: "Prosjekter", href: "/admin/workspace/prosjekter" },
  { id: "tildelt", label: "Tildelt meg", href: "/admin/godkjenninger" },
  { id: "notion", label: "Notion", href: "/admin/workspace/notion" },
];

/** Fane-navigasjon på tvers av Workspace — TL-variant av `WorkspaceTabs`. */
export function TlWorkspaceTabs({ active }: { active: WorkspaceFaneId }) {
  return (
    <nav
      role="tablist"
      aria-label="Workspace seksjoner"
      style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: `1px solid ${TL.hair}`, overflowX: "auto" }}
    >
      {FANER.map((f) => {
        const isActive = active === f.id;
        return (
          <Link
            key={f.id}
            href={f.href}
            role="tab"
            aria-selected={isActive}
            className={TL_PRESS}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 14px",
              marginBottom: -1,
              borderBottom: `2px solid ${isActive ? TL.text : "transparent"}`,
              fontSize: 13,
              fontWeight: 600,
              color: isActive ? TL.text : TL.mute,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Statisk filter-chip (link- eller knappevariant) — TL-variant av `FilterChip`. */
export function TlFilterChip({
  label,
  count,
  active = false,
  href,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    padding: "0 12px",
    borderRadius: 999,
    background: active ? TL.dim : "transparent",
    color: active ? TL.text : TL.mute,
    boxShadow: `inset 0 0 0 1px ${active ? "transparent" : TL.hair}`,
    fontSize: 12.5,
    fontWeight: 600,
    border: "none",
    cursor: href || onClick ? "pointer" : "default",
    textDecoration: "none",
  } as const;
  const inner = (
    <>
      {label}
      {typeof count === "number" && (
        <span style={{ borderRadius: 999, padding: "1px 6px", background: TL.dock, fontVariantNumeric: "tabular-nums" }}>{count}</span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={TL_PRESS} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={TL_PRESS} onClick={onClick} style={style}>
      {inner}
    </button>
  );
}
