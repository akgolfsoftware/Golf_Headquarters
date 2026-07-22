"use client";

/**
 * PlayerHQ · AI foreslår turneringer — v2 Presis + B-pakke (status + én vei).
 * Tom = full grønn til turneringslista. T.* only.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  StatusPill,
  InnsiktChip,
  TomTilstand,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { StatusTone } from "@/components/v2";

export type TournamentStatusTone = "enrolled" | "recommended" | "stretch";

export type TournamentSuggestion = {
  id: string;
  href: string;
  day: string;
  month: string;
  badge: string;
  statusLabel: string;
  statusTone: TournamentStatusTone;
  name: string;
  venue: string | null;
  meta: string[];
  why: string;
};

export type ForeslaTurneringV2Data = {
  playerFirstName: string;
  hcpLabel: string;
  catalogCount: number;
  suggestions: TournamentSuggestion[];
};

const TONE_MAP: Record<TournamentStatusTone, StatusTone> = {
  enrolled: "up",
  recommended: "lime",
  stretch: "warn",
};

function ForslagKort({ t }: { t: TournamentSuggestion }) {
  return (
    <Link href={t.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <Kort hover>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 46,
              flex: "none",
              borderRadius: 12,
              background: T.panel2,
              border: `1px solid ${T.border}`,
              padding: "7px 0 8px",
              textAlign: "center",
            }}
          >
            <span style={{ display: "block", fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {t.day}
            </span>
            <Caps size={8} style={{ marginTop: 3, textAlign: "center" }}>{t.month}</Caps>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}>
                {t.badge}
              </span>
              <StatusPill tone={TONE_MAP[t.statusTone]}>{t.statusLabel}</StatusPill>
            </div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 7, letterSpacing: "-0.01em" }}>
              {t.name}
            </div>
            {(t.venue || t.meta.length > 0) && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginTop: 5 }}>
                {t.venue && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name="map-pin" size={10} style={{ color: T.mut }} />
                    {t.venue}
                  </span>
                )}
                {t.meta.map((m, i) => (
                  <span key={i}>· {m}</span>
                ))}
              </div>
            )}
          </div>
          <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none", marginTop: 4 }} />
        </div>

        <div style={{ marginTop: 12, borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, padding: "10px 12px" }}>
          <Caps size={9} color={T.lime}>Hvorfor denne</Caps>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "5px 0 0" }}>{t.why}</p>
        </div>
      </Kort>
    </Link>
  );
}

export function ForeslaTurneringV2({ data }: { data: ForeslaTurneringV2Data }) {
  const { playerFirstName, hcpLabel, catalogCount, suggestions } = data;
  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AI · Turnerings-anbefaling</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em={playerFirstName}>Turneringer for</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: "10px 0 0", lineHeight: 1.55 }}>
          Vurdert mot handicapet ditt og turneringene du allerede er påmeldt.
        </p>
      </div>

      <InnsiktChip>
        {catalogCount > 0 ? (
          <>
            Vurdert mot <span style={{ color: T.fg, fontWeight: 600 }}>{catalogCount} kommende turneringer</span>
            {" · "}HCP <span style={{ color: T.fg, fontWeight: 600 }}>{hcpLabel}</span>
          </>
        ) : (
          "Ingen kommende turneringer i katalogen ennå."
        )}
      </InnsiktChip>

      {suggestions.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="trophy"
            title="Ingen forslag ennå"
            sub="Når turneringer passer nivået ditt, dukker de opp her."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/tren/turneringer" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="calendar-plus" full>
                Se turneringer
              </CTAPill>
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          {suggestions.map((t) => (
            <ForslagKort key={t.id} t={t} />
          ))}
          <Link
            href="/portal/tren/turneringer"
            style={{
              textDecoration: "none",
              alignSelf: "center",
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: 600,
              color: T.mut,
            }}
          >
            Se alle turneringene mine →
          </Link>
        </>
      )}
    </div>
  );
}
