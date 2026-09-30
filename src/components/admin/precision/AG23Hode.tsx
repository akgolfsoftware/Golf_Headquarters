"use client";

/**
 * AG-23 Oppsett i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx, runde 30 - fasit).
 *
 * Tegningen har ÉN fanerad med seks faner: Profil, Team og invitasjoner, GDPR,
 * Logger, Markedsføring, Hjelp. Alle AG-23-flater bruker samme rad.
 * Fanene GDPR, Logger og Hjelp peker på eksisterende adresser. Bare ADMIN
 * ser GDPR, Logger og Markedsføring (samme porter som målsidene).
 * Team-fanen er synlig for alle: Inviter coach vises inne i fanen for den
 * som har INVITE_USERS, ikke i menyen (finnes tilgangen, finnes veien).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Sidehode } from "@/components/precision/pa";
import { useErAdmin } from "@/components/v2/rolle";

export type AG23Sted = "profil" | "team" | "gdpr" | "logg" | "marketing" | "hjelp" | "oppsett";

const FANER: ReadonlyArray<{ id: Exclude<AG23Sted, "oppsett">; label: string; href: string; bareAdmin?: true }> = [
  { id: "profil", label: "Profil", href: "/admin/profile" },
  { id: "team", label: "Team og invitasjoner", href: "/admin/oppsett?fane=team" },
  { id: "gdpr", label: "GDPR", href: "/admin/gdpr", bareAdmin: true },
  { id: "logg", label: "Logger", href: "/admin/audit-log", bareAdmin: true },
  { id: "marketing", label: "Markedsføring", href: "/admin/marketing", bareAdmin: true },
  { id: "hjelp", label: "Hjelp", href: "/admin/hjelp" },
];

const pille = (aktiv: boolean): React.CSSProperties =>
  aktiv
    ? { textDecoration: "none", background: "var(--primary)", borderColor: "var(--primary)", color: "var(--text-on-primary)" }
    : { textDecoration: "none" };

export function AG23Navigasjon({ aktiv }: { aktiv: AG23Sted }) {
  const erAdmin = useErAdmin();
  return <nav aria-label="Oppsett" style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    {FANER.filter((s) => erAdmin || !s.bareAdmin).map((s) =>
      <Link key={s.id} href={s.href} className="pa-choice" aria-current={s.id === aktiv ? "page" : undefined} style={pille(s.id === aktiv)}>{s.label}</Link>)}
  </nav>;
}

export type AG23Fane = { id: string; label: string; href: string };

/** Sekundær rad for de åtte eldre innstillingsfanene (venter på Anders' avgjørelse). Vises kun på /admin/oppsett uten fane=team. */
export function AG23Innstillinger({ faner, aktiv }: { faner: readonly AG23Fane[]; aktiv: string }) {
  return <nav aria-label="Innstillinger" style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    {faner.map((f) =>
      <Link key={f.id} href={f.href} className="pa-choice" aria-current={f.id === aktiv ? "page" : undefined} style={pille(f.id === aktiv)}>{f.label}</Link>)}
  </nav>;
}

export function AG23Hode({ sted, kicker, tittel, sub, innstillinger, aktivInnstilling, children }: {
  sted: AG23Sted; kicker: string; tittel: string; sub?: string;
  innstillinger?: readonly AG23Fane[]; aktivInnstilling?: string; children?: ReactNode;
}) {
  return <>
    <Sidehode kicker={kicker} title={tittel} sub={sub} />
    <AG23Navigasjon aktiv={sted} />
    {innstillinger && aktivInnstilling && <AG23Innstillinger faner={innstillinger} aktiv={aktivInnstilling} />}
    {children}
  </>;
}

/** Tekstfelt med stor kontroll (52 px): inputen måler minst 44 px inni rammen på mobil. */
export function TekstFeltStor(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <span className="pa-control pa-control--lg"><input {...props} /></span>;
}
