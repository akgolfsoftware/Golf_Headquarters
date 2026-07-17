"use client";

/**
 * PlayerHQ · Ønskelig økt · Bekreftet — v2 (retning C «Presis»).
 * v2-port 17. juli 2026 (Team D2): erstatter legacy-bekreftelsessiden.
 * Ren presentasjon av EKTE request-data (siste SessionRequest) — ingen
 * oppdiktede navn/tider/referanser. Tidslinjens tilstander beregnes i
 * page.tsx fra faktisk status (uendret logikk).
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type BekreftetStegState = "done" | "active" | "pending";

export type BekreftetSteg = {
  state: BekreftetStegState;
  /** Ikon-navn i v2-kartet (check/clock/circle/calendar). */
  icon: string;
  title: string;
  meta: string;
  when?: string;
};

export type OnskeligOktBekreftetV2Data = {
  sentLabel: string;
  coachName: string | null;
  /** Klarspråk-label for preferredArea (Fysisk/Teknisk/…), null hvis ikke satt. */
  omraade: string | null;
  /** Formatert ønsket tid, null hvis ikke satt. */
  onsketTid: string | null;
  oktType: string | null;
  notat: string | null;
  shortId: string;
  steg: BekreftetSteg[];
};

function SumRad({ label, verdi, last }: { label: string; verdi: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "baseline", gap: 12, padding: "10px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <Caps size={9}>{label}</Caps>
      <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{verdi}</span>
    </div>
  );
}

export function OnskeligOktBekreftetV2({ data }: { data: OnskeligOktBekreftetV2Data }) {
  return (
    <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <span
          style={{
            width: 68,
            height: 68,
            borderRadius: 9999,
            background: `color-mix(in srgb, ${T.lime} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.lime} 35%, transparent)`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="send" size={28} style={{ color: T.lime }} />
        </span>
        <Caps>PlayerHQ · Ønske sendt · {data.sentLabel}</Caps>
        <Tittel em="til coach">Sendt</Tittel>
        <p style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.fg2, maxWidth: 380, margin: 0 }}>
          {data.coachName ? (
            <>
              <strong style={{ color: T.fg }}>{data.coachName}</strong> har fått ønsket ditt og svarer
              normalt innen <strong style={{ color: T.fg }}>24 timer på hverdager</strong>.
            </>
          ) : (
            <>
              Ønsket ditt er mottatt. En coach svarer normalt innen{" "}
              <strong style={{ color: T.fg }}>24 timer på hverdager</strong>.
            </>
          )}{" "}
          Du får varsel i appen når en tid er foreslått.
        </p>
      </div>

      {/* Sammendrag — kun ekte felter */}
      <Kort eyebrow="Ditt ønske">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.oktType && <SumRad label="Type" verdi={data.oktType} />}
          {data.coachName && <SumRad label="Coach" verdi={data.coachName} />}
          {data.omraade && (
            <SumRad
              label="Område"
              verdi={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "3px 9px" }}>
                  {data.omraade}
                </span>
              }
            />
          )}
          {data.onsketTid && (
            <SumRad
              label="Ønsket tid"
              verdi={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontVariantNumeric: "tabular-nums", color: T.lime, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, borderRadius: 9999, padding: "3px 9px" }}>
                  {data.onsketTid}
                </span>
              }
            />
          )}
          {data.notat && (
            <SumRad
              label="Notat"
              verdi={
                <span style={{ display: "block", borderLeft: `2px solid ${T.lime}`, padding: "2px 0 2px 12px", fontFamily: T.disp, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.5, color: T.fg }}>
                  {data.notat}
                </span>
              }
              last
            />
          )}
        </div>
      </Kort>

      {/* Tidslinje */}
      <Kort eyebrow="Hva skjer nå">
        <ol style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
          {data.steg.map((s, i) => {
            const isLast = i === data.steg.length - 1;
            const dotFarge =
              s.state === "done" ? T.lime : s.state === "active" ? T.lime : T.mut;
            return (
              <li key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "36px 1fr", gap: 14, padding: "10px 0" }}>
                {!isLast && (
                  <span
                    aria-hidden
                    style={{ position: "absolute", left: 17, top: 46, bottom: -10, width: 1.5, background: s.state === "done" ? `color-mix(in srgb, ${T.lime} 55%, transparent)` : T.border }}
                  />
                )}
                <span
                  style={{
                    width: 36,
                    height: 36,
                    flex: "none",
                    borderRadius: 9999,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      s.state === "done" ? `color-mix(in srgb, ${T.lime} 16%, transparent)` : T.panel2,
                    border: `1px solid ${s.state === "pending" ? T.border : `color-mix(in srgb, ${T.lime} 45%, transparent)`}`,
                  }}
                >
                  <Icon name={s.icon} size={15} style={{ color: dotFarge }} strokeWidth={s.state === "done" ? 2.25 : 1.75} />
                </span>
                <div style={{ paddingTop: 2, minWidth: 0 }}>
                  <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, lineHeight: 1.25, color: s.state === "pending" ? T.mut : T.fg }}>
                    {s.title}
                  </div>
                  <div style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.5, color: T.mut, marginTop: 2 }}>{s.meta}</div>
                  {s.when && (
                    <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut, marginTop: 5 }}>
                      {s.when}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Kort>

      {/* Handlinger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/portal" style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="home" full>Tilbake til hjem</CTAPill>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/portal/coach" style={{ textDecoration: "none", flex: 1 }}>
            <CTAPill ghost icon="message-square" full>Melding</CTAPill>
          </Link>
          <Link href="/portal/coach" style={{ textDecoration: "none", flex: 1 }}>
            <CTAPill ghost icon="users" full>Coacher</CTAPill>
          </Link>
        </div>
      </div>

      <p style={{ textAlign: "center", fontFamily: T.mono, fontSize: 10, letterSpacing: "0.04em", color: T.mut, margin: 0 }}>
        Ombestemt deg?{" "}
        <Link href="/portal/onskeligokt" style={{ color: T.lime, textDecoration: "none", fontWeight: 600 }}>
          Send et nytt ønske
        </Link>{" "}
        · Ref. <span style={{ fontWeight: 700, color: T.fg }}>REQ-{data.shortId}</span>
      </p>
    </div>
  );
}
