"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Leaderboard — v2 Presis + B-pakke (din plass først, tom = logg runde).
 * Rangering etter snitt-SG siste 30 dager. T.* only.
 */

import Link from "next/link";
import { fmtSg, Caps, Tittel, Kort, AvatarInit, StatusPill, TomTilstand, HjelpTips, CTAPill } from "@/components/v2";
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
  gull: "var(--tl-fill)",
  solv: "var(--tl-mute)",
  bronse: "var(--tl-warn)",
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
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        fontWeight: aktiv ? 600 : 500,
        padding: "7px 14px",
        borderRadius: 9999,
        color: aktiv ? TL.onFill : TL.mute,
        background: aktiv ? TL.fill : TL.dock,
        border: `1px solid ${aktiv ? "transparent" : TL.hair}`,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}

function SgVerdi({ sg }: { sg: number | null }) {
  if (sg == null) return <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute }}>—</span>;
  return (
    <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: sg >= 0 ? TL.ok : TL.danger, fontVariantNumeric: "tabular-nums" }}>
      {fmtSg(sg)}
    </span>
  );
}

export function LeaderboardV2({ data }: { data: LeaderboardV2Data }) {
  const { fornavn, minRank, total, tab, sgTab, rader, meg } = data;

  return (
    <div data-paper-wave-g="leaderboard" data-paper-portal-leaderboard style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
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
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: "10px 0 0" }}>
          Pro · siste 30 dager · neste oppdatering søndag 23:59
        </p>
      </div>

      {/* Gruppe-faner (URL-styrt) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <LenkePille key={t.key} href={`/portal/mal/leaderboard?tab=${t.key}&sg=${sgTab}`} aktiv={t.key === tab}>
            {t.label}
            {t.laast && <Icon name="lock" size={11} style={{ color: t.key === tab ? TL.onFill : TL.mute }} />}
          </LenkePille>
        ))}
      </div>

      {/* Din plassering */}
      {meg && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: TL.font.mono, fontSize: 40, fontWeight: 700, color: TL.fill, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
              #{meg.rank}
              <span style={{ fontSize: 16, fontWeight: 400, color: TL.mute }}> / {total}</span>
            </span>
            <AvatarInit navn={meg.navn} size={44} />
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 15, color: TL.text }}>{meg.navn}</div>
              <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 3 }}>
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
                  <span style={{ fontFamily: TL.font.mono, fontSize: 17, fontWeight: 700, color: meg.sg != null && meg.sg >= 0 ? TL.ok : TL.danger, fontVariantNumeric: "tabular-nums" }}>
                    {meg.sg != null ? fmtSg(meg.sg) : "—"}
                  </span>
                </div>
              </div>
              <div>
                <Caps size={9}>Runder</Caps>
                <div style={{ marginTop: 5 }}>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 17, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
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
            sub="Registrer runder med SG — da dukker plasseringen din opp her."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="flag" full>
                Start live-føring
              </CTAPill>
            </Link>
          </div>
        </Kort>
      ) : (
        <Kort pad="6px 20px">
          {/* Kolonnehode */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0 8px", borderBottom: `1px solid ${TL.hair}` }}>
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
                  borderBottom: i === rader.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  cursor: "pointer",
                  background: r.meg ? `color-mix(in srgb, ${TL.fill} 6%, transparent)` : undefined,
                }}
              >
                <span style={{ width: 40, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 13.5, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
                  {r.rank}
                  {r.medalje && <Icon name="trophy" size={13} style={{ color: MEDALJE_FARGE[r.medalje] }} />}
                </span>
                <AvatarInit navn={r.navn} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.navn}
                    </span>
                    {r.meg && <StatusPill>Deg</StatusPill>}
                  </div>
                  <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.sub}
                  </div>
                </div>
                <span style={{ width: 56, textAlign: "right", fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.hcp}</span>
                <span style={{ width: 64, textAlign: "right" }}><SgVerdi sg={r.sg} /></span>
                <span style={{ width: 52, textAlign: "right", fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.runder}</span>
                <Icon name="chevron-right" size={14} style={{ color: TL.mute, flex: "none" }} />
              </div>
            </Link>
          ))}
        </Kort>
      )}

      {rader.length > 0 && (
        <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
          Viser 1–{rader.length} av {total} medlemmer
        </span>
      )}
    </div>
  );
}
