"use client";

/**
 * PlayerHQ · Mål · Leaderboard — v2 (retning C «Presis»).
 * v2-port 16. juli 2026: erstatter wireframe-designet i
 * (legacy)/mal/leaderboard/page.tsx.
 *
 * Kun presentasjonslaget er nytt (v2-primitiver + T-tokens). Datakontrakten
 * (rangering etter snitt-SG siste 30 dager, tab/sg-kategori via URL) er
 * uendret — navigasjon skjer med Link mot searchParams som før. Bevisst
 * utelatt fra det gamle designet: den statiske badge-kolonnen (streak/test/
 * momentum) som var identisk plassholder for alle rader (TODO i original),
 * og de døde «Sesong»-/paginerings-knappene.
 */

import Link from "next/link";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  AvatarInit,
  StatusPill,
  TomTilstand,
  HjelpTips,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type LeaderboardTab = "venner" | "klubb" | "globalt";
export type LeaderboardSgTab = "totalt" | "approach" | "short-game" | "putting";

export type LeaderboardRad = {
  id: string;
  rank: number;
  navn: string;
  sub: string;
  hcp: string;
  sg: number | null;
  runder: number;
  meg: boolean;
  medalje?: "gull" | "solv" | "bronse";
};

export type LeaderboardV2Data = {
  fornavn: string;
  minRank: number | null;
  total: number;
  tab: LeaderboardTab;
  sgTab: LeaderboardSgTab;
  rader: LeaderboardRad[];
  meg: LeaderboardRad | null;
};

const TABS: { key: LeaderboardTab; label: string; laast?: boolean }[] = [
  { key: "venner", label: "Venner" },
  { key: "klubb", label: "Klubb" },
  { key: "globalt", label: "Globalt", laast: true },
];

const SG_TABS: { key: LeaderboardSgTab; label: string }[] = [
  { key: "totalt", label: "Totalt" },
  { key: "approach", label: "Innspill" },
  { key: "short-game", label: "Nærspill" },
  { key: "putting", label: "Putting" },
];

const SG_LABEL: Record<LeaderboardSgTab, string> = {
  totalt: "Snitt SG",
  approach: "SG APP",
  "short-game": "SG ARG",
  putting: "SG PUTT",
};

const MEDALJE_FARGE: Record<NonNullable<LeaderboardRad["medalje"]>, string> = {
  gull: "var(--v2-lime)",
  solv: "var(--v2-fg2)",
  bronse: "var(--v2-warn)",
};

function LenkePille({ href, aktiv, children }: { href: string; aktiv: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: aktiv ? 600 : 500,
        padding: "7px 14px",
        borderRadius: 9999,
        color: aktiv ? T.onLime : T.fg2,
        background: aktiv ? T.lime : T.panel2,
        border: `1px solid ${aktiv ? "transparent" : T.border}`,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

function SgVerdi({ sg }: { sg: number | null }) {
  if (sg == null) return <span style={{ fontFamily: T.mono, fontSize: 12.5, color: T.mut }}>—</span>;
  return (
    <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: sg >= 0 ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
      {fmtSg(sg)}
    </span>
  );
}

export function LeaderboardV2({ data }: { data: LeaderboardV2Data }) {
  const { fornavn, minRank, total, tab, sgTab, rader, meg } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <div>
        <Caps>Mål · Leaderboard · siste 30 dager</Caps>
        <div style={{ marginTop: 10 }}>
          {minRank != null ? (
            <Tittel em={`#${minRank} av ${total}`}>Din plassering, {fornavn}:</Tittel>
          ) : (
            <Tittel em={fornavn}>Hvordan står du,</Tittel>
          )}
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
          Pro · siste 30 dager · neste oppdatering søndag 23:59
        </p>
      </div>

      {/* Gruppe-faner (URL-styrt) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <LenkePille key={t.key} href={`/portal/mal/leaderboard?tab=${t.key}&sg=${sgTab}`} aktiv={t.key === tab}>
            {t.label}
            {t.laast && <Icon name="lock" size={11} style={{ color: t.key === tab ? T.onLime : T.mut }} />}
          </LenkePille>
        ))}
      </div>

      {/* Din plassering */}
      {meg && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: T.mono, fontSize: 40, fontWeight: 700, color: T.lime, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
              #{meg.rank}
              <span style={{ fontSize: 16, fontWeight: 400, color: T.mut }}> / {total}</span>
            </span>
            <AvatarInit navn={meg.navn} size={44} />
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{meg.navn}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 3 }}>
                HCP {meg.hcp} · {meg.sub}
              </div>
            </div>
            <div style={{ display: "flex", gap: 22 }}>
              <div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Caps size={9}>{SG_LABEL[sgTab]}</Caps>
                  <HjelpTips k={sgTab === "totalt" ? "sgTotal" : "sgOmrade"} size={11} align="right" />
                </span>
                <div style={{ marginTop: 5 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: meg.sg != null && meg.sg >= 0 ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
                    {meg.sg != null ? fmtSg(meg.sg) : "—"}
                  </span>
                </div>
              </div>
              <div>
                <Caps size={9}>Runder</Caps>
                <div style={{ marginTop: 5 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {meg.runder}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Kort>
      )}

      {/* SG-kategori-faner (URL-styrt) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Caps size={9}>Kategori</Caps>
          <HjelpTips k="sgOmrade" size={11} />
        </span>
        {SG_TABS.map((t) => (
          <LenkePille key={t.key} href={`/portal/mal/leaderboard?tab=${tab}&sg=${t.key}`} aktiv={t.key === sgTab}>
            {t.label}
          </LenkePille>
        ))}
      </div>

      {/* Rangering */}
      {rader.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="trophy"
            title="Ingen rangering ennå"
            sub="Når flere Pro-brukere har registrert SG-data dukker rangeringen opp her."
          />
        </Kort>
      ) : (
        <Kort pad="6px 20px">
          {/* Kolonnehode */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0 8px", borderBottom: `1px solid ${T.border}` }}>
            <Caps size={9} style={{ width: 40 }}>Rang</Caps>
            <Caps size={9} style={{ flex: 1 }}>Spiller</Caps>
            <span style={{ width: 56, display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
              <Caps size={9}>HCP</Caps>
              <HjelpTips k="hcp" size={10} align="right" />
            </span>
            <Caps size={9} style={{ width: 64, textAlign: "right" }}>{SG_LABEL[sgTab]}</Caps>
            <Caps size={9} style={{ width: 52, textAlign: "right" }}>Runder</Caps>
            <span style={{ width: 14 }} />
          </div>
          {rader.map((r, i) => (
            <Link key={r.id} href={`/portal/spiller/${r.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <div
                className="v2-row-h"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 10px",
                  margin: "0 -10px",
                  borderRadius: 10,
                  borderBottom: i === rader.length - 1 ? "none" : `1px solid ${T.border}`,
                  cursor: "pointer",
                  background: r.meg ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : undefined,
                }}
              >
                <span style={{ width: 40, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 13.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                  {r.rank}
                  {r.medalje && <Icon name="trophy" size={13} style={{ color: MEDALJE_FARGE[r.medalje] }} />}
                </span>
                <AvatarInit navn={r.navn} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.navn}
                    </span>
                    {r.meg && <StatusPill>Deg</StatusPill>}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.sub}
                  </div>
                </div>
                <span style={{ width: 56, textAlign: "right", fontFamily: T.mono, fontSize: 12.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{r.hcp}</span>
                <span style={{ width: 64, textAlign: "right" }}><SgVerdi sg={r.sg} /></span>
                <span style={{ width: 52, textAlign: "right", fontFamily: T.mono, fontSize: 12.5, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{r.runder}</span>
                <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none" }} />
              </div>
            </Link>
          ))}
        </Kort>
      )}

      {rader.length > 0 && (
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
          Viser 1–{rader.length} av {total} medlemmer
        </span>
      )}
    </div>
  );
}
