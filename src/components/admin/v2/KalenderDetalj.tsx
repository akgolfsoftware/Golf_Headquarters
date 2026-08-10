"use client";

/**
 * Detaljkolonnen i AgencyOS-kalenderen (PP-2.4 steg 3).
 *
 * Paper-fasit: `agencyos-kalender.html` §`renderDetalj()` — `.dhead` / `.dbody` /
 * `.dfoot`. Selve skallet er den DELTE `ArtefaktPanel` (fast høyrekolonne over
 * 1180 px, `BunnArk` under) — briefens krav: «Gjenbruk mønsteret — ikke oppfinn
 * et tredje.» Denne fila eier kun innholdet.
 *
 * To tilstander, som i fasiten:
 *   1. Ingenting valgt → ukas regnskap (belegg, booket, sperret, tilgjengelig)
 *      med «Hvorfor dette tallet», og en linje som sier hva du skal gjøre.
 *   2. Én avtale valgt → kollisjonsvarsel (hvis noen), så avtalens fakta, så
 *      ÉN handling i foten.
 *
 * Fasiten er dag-scopet; denne skjermen laster en uke. Tomtilstanden viser
 * derfor ukas tall, ikke dagens — samme avvik som agendaen og målraden, og av
 * samme grunn (ingen valgt-dag-tilstand finnes).
 */

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { Caps, Icon } from "@/components/v2";
import { HvorforDette } from "@/components/v2/hjelp";
import type { Belegg, Kollisjon } from "@/lib/domain/kalender-belegg";
import { formaterTid, klokke } from "@/lib/domain/kalender-belegg";
import type { KalOkt } from "@/app/admin/kalender/data";

/* ── Fasitens `.linje` — etikett venstre, mono-verdi høyre ── */
function Linje({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${T.border}`,
        minWidth: 0,
      }}
    >
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, flex: "none" }}>{k}</span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: T.mono,
          fontSize: 12.5,
          color: T.fg,
          textAlign: "right",
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {v}
      </span>
    </div>
  );
}

/* ── Fasitens `.blokk` med `.flab`-etikett ── */
function Blokk({ etikett, children }: { etikett: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Caps size={9} style={{ display: "block", marginBottom: 4 }}>
        {etikett}
      </Caps>
      {children}
    </div>
  );
}

/** Hva slags rad dette er, i klarspråk. Fasitens `Type`-linje. */
function typeTekst(okt: KalOkt): string {
  if (okt.erOppgave) return "Oppgave-frist";
  if (okt.erHendelse) return "Sperret tid";
  if (okt.erGoogle) return okt.heldag ? "Heldags Google-hendelse" : "Sperret egen tid (Google)";
  if (okt.treningsSessionId) return "Treningsøkt";
  if (okt.serie) return "Gjentakende gruppeøkt";
  if (okt.gruppe != null) return "Gruppeøkt";
  return "Coachingtime";
}

/** «Innhold»-linja: det mest opplysende vi faktisk har. */
function innholdTekst(okt: KalOkt): string | null {
  if (okt.notat?.trim()) return okt.notat.trim();
  if (okt.serie) return okt.serie;
  if (okt.kalenderNavn?.trim()) return okt.kalenderNavn.trim();
  if (okt.gruppe != null) return `${okt.gruppe} deltakere`;
  return null;
}

export type FlyttForslag = {
  /** Bookingen som flyttes. */
  bookingId: string;
  navn: string;
  startMin: number;
  sluttMin: number;
};

export function KalenderDetaljInnhold({
  valgt,
  kollisjon,
  motpartNavn,
  belegg,
  kildeTekst,
  beregningTekst,
  forbeholdTekst,
}: {
  valgt: KalOkt | null;
  kollisjon: Kollisjon | null;
  motpartNavn: string | null;
  belegg: Belegg;
  kildeTekst: string;
  beregningTekst: string;
  forbeholdTekst: string;
}) {
  if (!valgt) {
    return (
      <>
        <Blokk etikett="uka">
          <Linje k="Belegg" v={belegg.prosent == null ? "—" : `${belegg.prosent} %`} />
          <Linje k="Booket coachingtid" v={formaterTid(belegg.booketMin)} />
          <Linje k="Sperret tid" v={formaterTid(belegg.sperretMin)} />
          <Linje k="Tilgjengelig" v={formaterTid(belegg.tilgjengeligMin)} />
        </Blokk>
        <HvorforDette kilde={kildeTekst} beregning={beregningTekst} forbehold={forbeholdTekst} />
        <p
          style={{
            margin: "16px 0 0",
            fontFamily: T.bodyFont,
            fontSize: 12.5,
            color: T.mut,
            lineHeight: 1.55,
          }}
        >
          Velg en avtale i kalenderen for å se den her.
        </p>
      </>
    );
  }

  const varighet =
    valgt.sluttMin != null && valgt.sluttMin > valgt.startMin
      ? formaterTid(valgt.sluttMin - valgt.startMin)
      : null;
  const tid =
    valgt.heldag || valgt.startMin < 0
      ? "Hele dagen"
      : valgt.startMin >= 24 * 60
        ? "Frist"
        : valgt.sluttMin != null
          ? `${valgt.kl}–${klokke(valgt.sluttMin)}`
          : valgt.kl;
  const innhold = innholdTekst(valgt);

  return (
    <>
      {kollisjon && (
        // Fasitens `.varsel` — klarspråk om hva som er galt, over faktalinjene.
        <div
          data-od-id="kal-varsel-kollisjon"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            padding: "12px 14px",
            marginBottom: 16,
            borderRadius: T.rCard,
            background: T.handlingSoft,
            borderLeft: `3px solid ${T.handling}`,
          }}
        >
          <Icon name="alert-triangle" size={14} style={{ color: T.handling, flex: "none", marginTop: 2 }} />
          <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg, lineHeight: 1.55 }}>
            Kollisjon i din kalender — «{valgt.navn}»
            {motpartNavn ? ` og «${motpartNavn}»` : ""} overlapper{" "}
            {klokke(kollisjon.fraMin)}–{klokke(kollisjon.tilMin)}. Du kan ikke ta begge.
          </span>
        </div>
      )}

      <Blokk etikett="avtalen">
        <Linje k="Tid" v={tid} />
        {varighet && <Linje k="Varighet" v={varighet} />}
        <Linje k="Sted" v={valgt.facilityName ?? valgt.sted ?? "—"} />
        <Linje k="Type" v={typeTekst(valgt)} />
        <Linje k="Coach" v={valgt.coachName ?? "—"} />
        {innhold && <Linje k="Innhold" v={innhold} />}
      </Blokk>

      {valgt.erGoogle && (
        <Blokk etikett="merk">
          <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
            Denne ligger i Google-kalenderen din og blokkerer bookbar tid. Endres den her, skrives
            endringen tilbake til Google.
          </p>
        </Blokk>
      )}
    </>
  );
}

/**
 * Foten: ÉN handling. Er det en kollisjon som kan løses, er DEN skjermens
 * clay-flate (fasitens `.btn.now`) — ellers faller foten til en nøytral lenke.
 *
 * Flytteknappen vises kun når den kolliderende parten er en `Booking`. Serier,
 * treningsøkter og Google-hendelser har ingen flytte-handling i appen, og en
 * knapp som ikke kan gjøre noe skal ikke stå der (samme regel som SerieMeny).
 */
export type DetaljHandling =
  | { label: string; onClick: () => void; ikon?: string }
  | { label: string; href: string; ekstern?: boolean; ikon?: string };

export function KalenderDetaljFot({
  handling,
  forslag,
  onFlytt,
}: {
  /**
   * Den nøytrale handlingen for valgt rad — beregnet av forelderen, som eier
   * arkene (Google-redigering, drill-liste, seriemeny). Foten kjenner dem ikke.
   */
  handling: DetaljHandling | null;
  forslag: FlyttForslag | null;
  onFlytt: (forslag: FlyttForslag) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  if (forslag) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        <button
          type="button"
          data-od-id="kal-los-kollisjon"
          data-paper-en-ting="true"
          disabled={venter}
          onClick={() => {
            setFeil(null);
            start(async () => {
              const res = await onFlytt(forslag);
              if (!res.ok) setFeil(res.error ?? "Kunne ikke flytte avtalen.");
            });
          }}
          className="v2-press v2-focus"
          style={{
            appearance: "none",
            width: "100%",
            minHeight: 44,
            borderRadius: T.rCard,
            border: "none",
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: venter ? "progress" : "pointer",
            opacity: venter ? 0.7 : 1,
          }}
        >
          {venter
            ? "Flytter …"
            : `Flytt til ${klokke(forslag.startMin)}–${klokke(forslag.sluttMin)}`}
        </button>
        {feil && (
          <span role="alert" style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down, lineHeight: 1.45 }}>
            {feil}
          </span>
        )}
      </div>
    );
  }

  if (!handling) return null;

  const stil: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
    minHeight: 44,
    borderRadius: T.rCard,
    border: `1px solid ${T.border}`,
    background: T.panel2,
    color: T.fg,
    fontFamily: T.ui,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    appearance: "none",
    cursor: "pointer",
  };
  const innhold = (
    <>
      {handling.ikon && <Icon name={handling.ikon} size={13} />}
      {handling.label}
    </>
  );

  if ("href" in handling) {
    return handling.ekstern ? (
      <a
        href={handling.href}
        target="_blank"
        rel="noopener noreferrer"
        data-od-id="kal-apne-avtale"
        className="v2-press v2-focus"
        style={stil}
      >
        {innhold}
      </a>
    ) : (
      <Link href={handling.href} data-od-id="kal-apne-avtale" className="v2-press v2-focus" style={stil}>
        {innhold}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handling.onClick}
      data-od-id="kal-apne-avtale"
      className="v2-press v2-focus"
      style={stil}
    >
      {innhold}
    </button>
  );
}
