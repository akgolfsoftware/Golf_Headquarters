"use client";

/**
 * AgencyOS v2 — Turneringer-hub (`/admin/tournaments`).
 *
 * Port fra `src/app/admin/(legacy)/tournaments/page.tsx` (2026-07-13) — samme
 * datakontrakt/-logikk (kun turneringer stallen er påmeldt i, kommende fra
 * inneværende uke), ny presentasjon: én `Rad`-liste i stedet for separate
 * mobil-kort/desktop-tabell-grener — `Rad` er allerede responsiv, så samme
 * markup dekker mobil, iPad og desktop uten egne breakpoint-grener.
 * Detalj-siden (`/admin/tournaments/[id]`) er allerede v2 — urørt her.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, Rad, StatusPill, Knapp, Icon, T, type StatusTone } from "@/components/v2";
import { FellesmeldingKnapp } from "@/app/admin/(legacy)/tournaments/_fellesmelding-knapp";

export interface AdminTurneringV2Row {
  key: string;
  href: string | null;
  name: string;
  /** Ferdigformatert dato-spenn, f.eks. «9.–10. jun» — formateres server-side. */
  datoSpenn: string;
  venue: string | null;
  paameldte: number;
  status: { label: string; tone: StatusTone } | null;
}

export interface AdminTurneringerV2Data {
  ar: number;
  nyHref: string;
  rader: AdminTurneringV2Row[];
}

export function AdminTurneringerV2({ ar, nyHref, rader }: AdminTurneringerV2Data) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Planlegge · Turneringer</Caps>
          <Tittel em={`${ar}.`}>Sesong</Tittel>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 460 }}>
            Turneringene stallen din spiller. Send fellesmelding til alle påmeldte med ett klikk.
          </div>
        </div>
        <Link href={nyHref} style={{ textDecoration: "none", flex: "none" }}>
          <Knapp icon="plus">Ny turnering</Knapp>
        </Link>
      </div>

      <Kort pad="6px 14px">
        {rader.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen kommende turneringer med påmeldte fra stallen.
          </div>
        ) : (
          rader.map((r, i) => (
            <Rad
              key={r.key}
              last={i === rader.length - 1}
              leading={
                <span style={{ width: 32, height: 32, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name="trophy" size={15} style={{ color: T.lime }} />
                </span>
              }
              title={r.href ? <Link href={r.href} style={{ color: "inherit", textDecoration: "none" }}>{r.name}</Link> : r.name}
              sub={[r.datoSpenn, r.venue, `${r.paameldte} påmeldt`].filter(Boolean).join(" · ")}
              meta={r.status && <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>}
              trailing={<FellesmeldingKnapp navn={r.name} mottakere={r.paameldte} />}
            />
          ))
        )}
      </Kort>
    </div>
  );
}
