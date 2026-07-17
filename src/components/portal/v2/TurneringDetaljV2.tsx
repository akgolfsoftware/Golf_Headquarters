"use client";

/**
 * PlayerHQ · Turnering-detalj — v2 (retning C «Presis»).
 * v2-port 16. juli 2026: erstatter hybrid-designet i
 * (legacy)/tren/turneringer/[id]/page.tsx.
 *
 * Kun presentasjonslaget er nytt (v2-primitiver + T-tokens). Datakontrakten
 * speiler loaderens ærlige prinsipp (felter som ofte er null rendres kun når
 * de finnes; historikk-kortet utelates når tomt). Meld på / meld av går via
 * server actions (form action) fra siden — logikken er uendret. Bevisst
 * utelatt fra v10: den tomme «Fremgang 0 %»-plassholder-baren (fabrikkert).
 */

import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  MikroMeta,
  AvatarInit,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import type { StatusTone } from "@/components/v2";

export type TurneringDetaljV2Data = {
  navn: string;
  /** Lang dato-rekkevidde, f.eks. "15. august 2026". */
  datoLang: string;
  sted: string | null;
  format: string | null;
  tour: string | null;
  status: { label: string; tone: "upcoming" | "live" | "done" | "cancelled" } | null;
  offisiellUrl: string | null;
  coachNotat: string | null;
  coachNavn: string;
  entry: {
    statusLabel: string;
    statusTone: "ok" | "neutral" | "warn" | "urgent";
    kategori: string | null;
    notater: string | null;
    paameldtTekst: string;
  } | null;
  historikk: { id: string; aar: number; plassering: number | null; score: number | null }[];
};

const STATUS_TONE: Record<NonNullable<TurneringDetaljV2Data["status"]>["tone"], StatusTone> = {
  upcoming: "info",
  live: "lime",
  done: "up",
  cancelled: "down",
};

const ENTRY_TONE: Record<NonNullable<TurneringDetaljV2Data["entry"]>["statusTone"], StatusTone> = {
  ok: "up",
  neutral: "info",
  warn: "warn",
  urgent: "down",
};

export function TurneringDetaljV2({
  data,
  pameldt,
  pameldAction,
  avmeldAction,
}: {
  data: TurneringDetaljV2Data;
  pameldt: boolean;
  pameldAction: () => Promise<void>;
  avmeldAction: () => Promise<void>;
}) {
  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <Kort tint>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            {data.tour && <Caps>{data.tour}</Caps>}
            <div style={{ marginTop: data.tour ? 10 : 0 }}>
              <Tittel mobile>{data.navn}</Tittel>
            </div>
          </div>
          {data.status && (
            <StatusPill tone={STATUS_TONE[data.status.tone]}>{data.status.label}</StatusPill>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
          <MikroMeta icon="calendar">{data.datoLang}</MikroMeta>
          {data.sted && <MikroMeta icon="map-pin">{data.sted}</MikroMeta>}
          {data.format && <MikroMeta icon="flag">{data.format}</MikroMeta>}
        </div>
      </Kort>

      {/* Coach-notat */}
      <Kort eyebrow="Coach-notat" style={{ borderLeft: `3px solid ${T.lime}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AvatarInit navn={data.coachNavn} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, display: "block" }}>{data.coachNavn}</span>
            <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg, lineHeight: 1.6, margin: "6px 0 0" }}>
              {data.coachNotat ?? "Ingen coach-notat ennå."}
            </p>
          </div>
        </div>
      </Kort>

      {/* Din påmelding */}
      <Kort eyebrow="Din påmelding" action={<Icon name="target" size={14} style={{ color: T.mut }} />}>
        {data.entry ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <StatusPill tone={ENTRY_TONE[data.entry.statusTone]}>{data.entry.statusLabel}</StatusPill>
              {data.entry.kategori && (
                <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}>
                  {data.entry.kategori}
                </span>
              )}
            </div>
            <MikroMeta icon="clock">Påmeldt {data.entry.paameldtTekst}</MikroMeta>
            {data.entry.notater && (
              <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg, lineHeight: 1.6, margin: 0, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                {data.entry.notater}
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0 }}>
            Du er ikke påmeldt denne turneringen.
          </p>
        )}
      </Kort>

      {/* Historikk — utelates når tom (loaderens ærlighetsprinsipp) */}
      {data.historikk.length > 0 && (
        <Kort eyebrow="Resultater · historikk">
          <div>
            {data.historikk.map((h, i) => (
              <div key={h.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i === data.historikk.length - 1 ? "none" : `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{h.aar}</span>
                {h.plassering != null ? (
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    #{h.plassering} <span style={{ fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>plass</span>
                  </span>
                ) : h.score != null ? (
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {h.score} <span style={{ fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>slag</span>
                  </span>
                ) : (
                  <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut }}>—</span>
                )}
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* CTA-er */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {pameldt ? (
          <form action={avmeldAction}>
            <Knapp ghost icon="x" type="submit">Meld av</Knapp>
          </form>
        ) : (
          <form action={pameldAction}>
            <Knapp icon="check" type="submit">Meld på</Knapp>
          </form>
        )}
        {data.offisiellUrl && (
          <a
            href={data.offisiellUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, textDecoration: "none" }}
          >
            Offisiell side
            <Icon name="external-link" size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
