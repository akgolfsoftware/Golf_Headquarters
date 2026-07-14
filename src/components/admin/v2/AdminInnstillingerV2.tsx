"use client";

/**
 * AgencyOS v2 — Innstillinger-hub (`/admin/settings`, AgencyOS Bølge 3.32,
 * 2026-07-14). Port fra `(legacy)/settings/page.tsx` — samme tre faner
 * (Organisasjon/Team & roller/Tilgang, `?tab=`) og samme datakontrakt (ekte
 * klubb-/coach-tall, «—» der org-innstillinger ikke er modellert ennå).
 * Undersidene (`api`, `calendar`, `security`, `tilgang`) portes i egne
 * commits (Bølge 3.33+).
 */

import Link from "next/link";
import { Caps, Tittel, Kort, AvatarInit, StatusPill, T } from "@/components/v2";

const TABS = [
  { key: "org", label: "Organisasjon" },
  { key: "team", label: "Team & roller" },
  { key: "tilgang", label: "Tilgang" },
] as const;

const TILGANGSRADER = [
  "Spillere ser egen data",
  "Foreldre-tilgang (junior)",
  "Coacher ser hele stallen",
  "WAGR-synk automatisk",
  "Faktura synlig for spiller",
];

export interface KlubbRadV2 {
  id: string;
  navn: string;
  antallFasiliteter: number;
}

export interface TeamRadV2 {
  id: string;
  navn: string;
  rolleLabel: string;
  antallSpillere: number;
  erEier: boolean;
}

export function AdminInnstillingerV2({ tab, klubber, teamRader }: { tab: "org" | "team" | "tilgang"; klubber: KlubbRadV2[]; teamRader: TeamRadV2[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps size={9}>System · Admin</Caps>
        <Tittel em="& tilgang.">Organisasjon</Tittel>
        <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Klubber, coacher og rolletilgang. Eierrollen styrer hvem som ser hva.</p>
      </div>

      <div style={{ display: "inline-flex", gap: 2, borderRadius: 12, background: T.panel2, padding: 3, width: "fit-content" }}>
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings?tab=${t.key}`}
            style={{ display: "inline-flex", alignItems: "center", height: 28, borderRadius: 9, padding: "0 12px", textDecoration: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: tab === t.key ? T.panel : "transparent", color: tab === t.key ? T.lime : T.mut }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "org" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {klubber.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", borderRadius: 12, border: `1px dashed ${T.border}`, padding: "40px 18px", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>
              Ingen klubber/anlegg registrert ennå — legg til under Anlegg.
            </div>
          ) : (
            klubber.map((k) => (
              <Kort key={k.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <AvatarInit navn={k.navn} size={40} />
                  <div>
                    <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{k.navn}</div>
                    <div style={{ marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{k.antallFasiliteter} {k.antallFasiliteter === 1 ? "fasilitet" : "fasiliteter"} · aktiv</div>
                  </div>
                </div>
              </Kort>
            ))
          )}
        </div>
      )}

      {tab === "team" && (
        <Kort pad="0">
          {teamRader.length === 0 ? (
            <div style={{ padding: "40px 18px", textAlign: "center", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen coacher registrert ennå.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.ui, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  {["Coach", "Rolle", "Spillere", "Status"].map((h, i) => (
                    <th key={h} style={{ padding: "14px 14px 10px", textAlign: i === 2 ? "right" : "left" }}><Caps size={9}>{h}</Caps></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamRader.map((c) => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <AvatarInit navn={c.navn} size={28} />
                        <span style={{ fontWeight: 600, color: T.fg }}>{c.navn}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: T.mut }}>{c.rolleLabel}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: T.mono, fontVariantNumeric: "tabular-nums", color: T.fg }}>{c.antallSpillere}</td>
                    <td style={{ padding: "10px 14px" }}><StatusPill tone={c.erEier ? "lime" : "info"}>{c.erEier ? "Eier" : "Coach"}</StatusPill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Kort>
      )}

      {tab === "tilgang" && (
        <div style={{ maxWidth: 640 }}>
          <Kort pad="4px 18px">
            {TILGANGSRADER.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 500, color: T.fg }}>{label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>—</span>
              </div>
            ))}
          </Kort>
          <Link href="/admin/settings/tilgang" style={{ marginTop: 10, display: "inline-block", fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: T.lime, textDecoration: "none" }}>
            Full tilgangsmatrise per rolle →
          </Link>
        </div>
      )}
    </div>
  );
}
