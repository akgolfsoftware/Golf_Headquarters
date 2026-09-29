"use client";

/**
 * AG-23 Oppsett i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx, runde 30 — fasit, seks faner).
 *
 * Felles hode for de fem AG-23-adressene: sidetittel og en rad med
 * lenker mellom Oppsett, Profil, Inviter coach, Eksterne lesere og
 * Markedsføring. Oppsett-siden har i tillegg egen fanerad (AG23Faner)
 * for de åtte eksisterende innstillingsfanene.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Sidehode } from "@/components/precision/pa";
import { useErAdmin } from "@/components/v2/rolle";

export type AG23Sted = "oppsett" | "profil" | "inviter" | "ekstern" | "marketing";

const STEDER: ReadonlyArray<{ id: AG23Sted; label: string; href: string; bareAdmin?: true }> = [
  { id: "oppsett", label: "Oppsett", href: "/admin/oppsett" },
  { id: "profil", label: "Profil", href: "/admin/profile" },
  { id: "inviter", label: "Inviter coach", href: "/admin/team/inviter", bareAdmin: true },
  { id: "ekstern", label: "Eksterne lesere", href: "/admin/team/ekstern", bareAdmin: true },
  { id: "marketing", label: "Markedsføring", href: "/admin/marketing", bareAdmin: true },
];

const pille = (aktiv: boolean): React.CSSProperties =>
  aktiv
    ? { textDecoration: "none", background: "var(--primary)", borderColor: "var(--primary)", color: "var(--text-on-primary)" }
    : { textDecoration: "none" };

export function AG23Navigasjon({ aktiv }: { aktiv: AG23Sted }) {
  const erAdmin = useErAdmin();
  return <nav aria-label="Oppsett og team" style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    {STEDER.filter((s) => erAdmin || !s.bareAdmin).map((s) =>
      <Link key={s.id} href={s.href} className="pa-choice" aria-current={s.id === aktiv ? "page" : undefined} style={pille(s.id === aktiv)}>{s.label}</Link>)}
  </nav>;
}

export type AG23Fane = { id: string; label: string; href: string };

export function AG23Faner({ faner, aktiv }: { faner: readonly AG23Fane[]; aktiv: string }) {
  return <nav aria-label="Oppsett-faner" style={{ display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    {faner.map((f) =>
      <Link key={f.id} href={f.href} className="pa-choice" aria-current={f.id === aktiv ? "page" : undefined} style={pille(f.id === aktiv)}>{f.label}</Link>)}
  </nav>;
}

export function AG23Hode({ sted, kicker, tittel, sub, faner, aktivFane, children }: {
  sted: AG23Sted; kicker: string; tittel: string; sub?: string;
  faner?: readonly AG23Fane[]; aktivFane?: string; children?: ReactNode;
}) {
  return <>
    <Sidehode kicker={kicker} title={tittel} sub={sub} />
    <AG23Navigasjon aktiv={sted} />
    {faner && aktivFane && <AG23Faner faner={faner} aktiv={aktivFane} />}
    {children}
  </>;
}

/** Tekstfelt med stor kontroll (52 px): inputen måler minst 44 px inni rammen på mobil. */
export function TekstFeltStor(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <span className="pa-control pa-control--lg"><input {...props} /></span>;
}
