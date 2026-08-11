"use client";

/**
 * PlayerHQ · Turnering-detalj — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-turnering-detalj.html.
 *
 * Struktur per fasit: header (navn + mono-sub) → «Én ting nå» (fristvarsel +
 * clay «Meld deg på» med DOBBEL bekreftelse — trykk 1 åpner bekreftelsen
 * (claimPaamelding), trykk 2 melder på (confirmPaamelding); aldri ett-trykks
 * påmelding) → påmeldt-status med tag «Bekreftet i GolfBox» → faktakort →
 * eier-note. Feiltilstand sier eksplisitt: ingen penger trukket, du står
 * IKKE på startlisten.
 *
 * Fakta-rader bygges i page.tsx KUN av reelle felter (Startavgift/Reise
 * finnes ikke i schemaet og utelates ærlig). Turneringsrunde (D6c),
 * historikk (brutto) og egne notater er reelle funksjoner uten
 * fasit-motpart og beholdes (Enkelhet: behold funksjoner).
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T, Caps, Kort, Knapp, CTAPill, StatusPill, MikroMeta } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import {
  claimPaamelding,
  confirmPaamelding,
} from "@/app/portal/(legacy)/tren/turneringer/actions";

/** Spillerens egen turneringsrunde (D6c) — uendret datakontrakt. */
export type TurneringsrundeV2 = {
  rundeId: string;
  fort: boolean;
  score: number;
  hullAntall: number;
} | null;

export type TurneringDetaljV2Data = {
  /** Tournament-id — brukes av claim/confirm-actions. */
  id: string;
  navn: string;
  /** Mono-sublinje, f.eks. "Vestfold GK · 15. AUG · plan A". */
  sub: string;
  /** Faktakort-rader — kun reelle felter, bygget i page.tsx. */
  fakta: { k: string; v: string }[];
  /** Påmeldingsfrist (lang dato) — null når den ikke finnes i katalogen. */
  fristLabel: string | null;
  entryStatus: "INGEN" | "PLANNED" | "CLAIMED" | "CONFIRMED" | "ANNEN";
  /** Spillerens egne notater på påmeldingen. */
  notater: string | null;
  historikk: { id: string; aar: number; plassering: number | null; score: number | null }[];
  /** Ekstern side hos arrangør (offisiell/påmelding) — null når ukjent. */
  arrangorUrl: string | null;
};

const CLAY_CTA: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 56,
  width: "100%",
  border: "none",
  borderRadius: 12,
  background: T.handling,
  color: T.onHandling,
  fontFamily: T.ui,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

export function TurneringDetaljV2({
  data,
  avmeldAction,
  turneringsrunde,
  kanStarteRunde,
  startRundeAction,
}: {
  data: TurneringDetaljV2Data;
  avmeldAction: () => Promise<void>;
  turneringsrunde: TurneringsrundeV2;
  kanStarteRunde: boolean;
  startRundeAction: () => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Trykk 1 er allerede tatt (CLAIMED) → bekreftelsen står åpen ved innlasting.
  const [bekreftApen, setBekreftApen] = useState(data.entryStatus === "CLAIMED");
  const [feil, setFeil] = useState(false);

  const paameldt = data.entryStatus === "CONFIRMED";
  const visRundeKort = turneringsrunde != null || kanStarteRunde;

  /** Trykk 1 av 2: åpner bekreftelsen (claim — IKKE endelig påmelding). */
  function meldPaa() {
    setFeil(false);
    startTransition(async () => {
      try {
        const r = await claimPaamelding(data.id);
        if (!r.ok) setFeil(true);
        else setBekreftApen(true);
      } catch {
        setFeil(true);
      }
    });
  }

  /** Trykk 2 av 2: bekrefter påmeldingen (spilleransvar). */
  function bekreft() {
    setFeil(false);
    startTransition(async () => {
      try {
        const r = await confirmPaamelding(data.id);
        if (!r.ok) setFeil(true);
        else {
          setBekreftApen(false);
          router.refresh();
        }
      } catch {
        setFeil(true);
      }
    });
  }

  return (
    <div
      data-paper-slug="playerhq-turnering-detalj"
      data-od-id="playerhq-turnering-detalj"
      style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}
    >
      {/* Topp — fasit: navn + mono-sub */}
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {data.navn}
        </h1>
        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
          {data.sub}
        </span>
      </div>

      {/* Feil — fasit-copy: ingen penger trukket, IKKE på startlisten */}
      {feil && (
        <div
          role="alert"
          style={{ padding: "24px 16px", background: T.panel2, border: `1px dashed ${T.border}`, borderRadius: T.rCard }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            Påmeldingen gikk ikke gjennom
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
            Ingen penger er trukket, og du står IKKE på startlisten — prøv
            igjen, eller meld deg på direkte i GolfBox.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => setFeil(false)}
            data-od-id="turnd-retry"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={CLAY_CTA}
          >
            Prøv igjen
          </button>
        </div>
      )}

      {/* Påmeldt-status — fasit: tag «Bekreftet i GolfBox» */}
      {paameldt && (
        <Kort eyebrow="status">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>Påmeldt</span>
            <StatusPill tone="up">Bekreftet i GolfBox</StatusPill>
          </div>
        </Kort>
      )}

      {/* Én ting nå — fristvarsel + første av to trykk */}
      {!paameldt && !feil && (
        <div style={{ background: T.handlingSoft, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: 16 }}>
          <Caps>Én ting nå</Caps>
          <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            {data.fristLabel
              ? `Fristen går ut ${data.fristLabel}`
              : "Du er ikke påmeldt ennå"}
          </h3>
          <p style={{ margin: bekreftApen ? 0 : "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
            Du er ikke påmeldt. Påmeldingen er din — to trykk, så står du på
            startlisten.
          </p>
          {!bekreftApen && (
            /* Kontrakt §3: skjermens ene aksenthandling. Første av to trykk. */
            <button
              type="button"
              disabled={pending}
              onClick={meldPaa}
              data-od-id="turnd-meld-paa"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={CLAY_CTA}
            >
              Meld deg på
            </button>
          )}
        </div>
      )}

      {/* Bekreftelsen — andre trykk (dobbel bekreftelse er spilleransvarets form) */}
      {!paameldt && !feil && bekreftApen && (
        <Kort eyebrow="bekreft påmeldingen">
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
            Du melder deg på {data.navn}
            {data.sub ? ` (${data.sub})` : ""}. Dette er ditt andre og siste
            trykk — appen sjekker ikke hos arrangør, ansvaret er ditt.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Aksenten flytter hit — fortsatt én på skjermen. */}
            <button
              type="button"
              disabled={pending}
              onClick={bekreft}
              data-od-id="turnd-bekreft"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={{ ...CLAY_CTA, flex: 1, width: "auto" }}
            >
              Bekreft · meld meg på
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setBekreftApen(false)}
              data-od-id="turnd-avbryt"
              className="v2-press v2-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48,
                padding: "0 16px",
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 500,
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                color: T.fg,
                cursor: "pointer",
              }}
            >
              Avbryt
            </button>
          </div>
        </Kort>
      )}

      {/* Faktakort — kun reelle felter (bygget i page.tsx) */}
      {data.fakta.length > 0 && (
        <Kort eyebrow="fakta">
          <div>
            {data.fakta.map((r, i) => (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "8px 0",
                  fontSize: 13,
                  borderBottom: i === data.fakta.length - 1 ? "none" : `1px solid ${T.borderS}`,
                }}
              >
                <span style={{ fontFamily: T.ui, color: T.fg }}>{r.k}</span>
                <span style={{ marginLeft: "auto", fontFamily: T.mono, fontVariantNumeric: "tabular-nums", textAlign: "right", color: T.fg }}>
                  {r.v}
                </span>
              </div>
            ))}
          </div>
          {data.arrangorUrl && (
            <a
              href={data.arrangorUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}
            >
              Turneringen hos arrangør
              <Icon name="external-link" size={13} style={{ color: T.mut }} />
            </a>
          )}
        </Kort>
      )}

      {/* Meld deg av — nøytral (fasit) */}
      {paameldt && (
        <form action={avmeldAction}>
          <button
            type="submit"
            data-od-id="turnd-meld-av"
            className="v2-press v2-focus"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
              width: "100%",
              fontFamily: T.ui,
              fontSize: 14,
              fontWeight: 500,
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              color: T.fg,
              cursor: "pointer",
            }}
          >
            Meld deg av
          </button>
        </form>
      )}

      {/* Din turneringsrunde (D6c) — reell funksjon, beholdt fra forrige port.
          Utelates helt når spilleren verken har en runde eller kan starte. */}
      {visRundeKort && (
        <Kort eyebrow="Din turneringsrunde" action={<Icon name="flag" size={14} style={{ color: T.mut }} />}>
          {turneringsrunde ? (
            turneringsrunde.fort ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <StatusPill tone="up">Ført</StatusPill>
                  <span style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 800, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {turneringsrunde.score}
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em", marginLeft: 6 }}>slag</span>
                  </span>
                </div>
                <MikroMeta icon="check-circle">{turneringsrunde.hullAntall} hull ført · brutto</MikroMeta>
                <div>
                  <Link href={`/portal/mal/runder/${turneringsrunde.rundeId}`} style={{ textDecoration: "none" }}>
                    <CTAPill ghost icon="arrow-right">Se runden</CTAPill>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusPill tone="info">Pågår</StatusPill>
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0, lineHeight: 1.6 }}>
                  Runden er startet, men scorekortet er ikke ført ennå. Før det
                  hull for hull mens du spiller.
                </p>
                <div>
                  <Link
                    href={`/portal/mal/runder/${turneringsrunde.rundeId}/hull`}
                    className="v2-press v2-focus"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 16px",
                      borderRadius: 10, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 13, fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Fortsett runden
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0, lineHeight: 1.6 }}>
                Fører du runden hull for hull mens du spiller, knyttes den til
                turneringen.
              </p>
              <form action={startRundeAction}>
                <Knapp icon="flag" type="submit">Start turneringsrunde</Knapp>
              </form>
            </div>
          )}
        </Kort>
      )}

      {/* Egne notater på påmeldingen — reelle data, utelates når tomt */}
      {data.notater && (
        <Kort eyebrow="Notatene dine">
          <p style={{ fontFamily: T.bodyFont, fontSize: 13.5, color: T.fg, lineHeight: 1.6, margin: 0 }}>
            {data.notater}
          </p>
        </Kort>
      )}

      {/* Historikk (brutto) — utelates når tom */}
      {data.historikk.length > 0 && (
        <Kort eyebrow="Resultater · historikk · brutto">
          <div>
            {data.historikk.map((h, i) => (
              <div key={h.id} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: i === data.historikk.length - 1 ? "none" : `1px solid ${T.border}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.mut, fontVariantNumeric: "tabular-nums" }}>{h.aar}</span>
                {h.plassering != null ? (
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    #{h.plassering}{" "}
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>plass</span>
                  </span>
                ) : h.score != null ? (
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {h.score}{" "}
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.06em" }}>slag</span>
                  </span>
                ) : (
                  <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut }}>—</span>
                )}
              </div>
            ))}
          </div>
        </Kort>
      )}

      {/* Eier-note — fasit-copy */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 16px",
          borderRadius: T.rCard,
          background: T.panel2,
          border: `1px solid ${T.border}`,
          fontFamily: T.bodyFont,
          fontSize: 12.5,
          color: T.mut,
        }}
      >
        <Icon name="pencil" size={16} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
        <span>
          Påmeldingen er din, ikke appens. Anders ser at du er påmeldt og
          legger uka til rette — mandag etter turnering er alltid FYS.
        </span>
      </div>
    </div>
  );
}
