"use client";

/**
 * AgencyOS Kalender — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys default, mørk via bryter. Coach-uke: bookinger + serier.
 *
 * Bølge 12 (Open Design-port): toolbaren følger Notion-fasiten i
 * `familie-calendar.html` .cal-toolbar — «I dag» · piler · periode-tittel ·
 * segmentert visningsvelger. Segmentet er ikke lime; lime-jobben er «Ny økt».
 */

import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import type { GroupBucket } from "@/lib/domain/program-bucket";
import { useRouter } from "next/navigation";
import { flyttBookingTilDag } from "@/app/admin/agencyos/uka/actions";
import { hentKalenderDrills } from "@/app/admin/kalender/drill-actions";
import {
  oppdaterGoogleHendelse,
  slettGoogleHendelse,
} from "@/app/admin/kalender/google-actions";

// I5: samme DnD-mønster som uka-kanbanen — dra booking til ny dag.
const DND_MIME = "application/x-akgolf-kalender";
import Link from "next/link";
import {
  T,
  Caps,
  CTAPill,
  SegmentertFaner,
  Kort,
  StatusPill,
  TomTilstand,
  Icon,
  HurtigOpprett,
  BunnArk,
  TimeGrid,
  timeGridBlockStyle,
  snapYToSlot,
} from "@/components/v2";
import { PaperPage, PaperTopp, PaperKropp } from "@/components/portal/v2/PaperChrome";
import { type AkseKey } from "@/lib/v2/tokens";
import type { KalenderData, KalDag, KalOkt } from "@/app/admin/kalender/data";
import {
  beleggForDager,
  foreslaFlytting,
  formaterTid,
  klokke,
  kollisjoner,
  utenEier,
  type BeleggOkt,
} from "@/lib/domain/kalender-belegg";
import { GRID_END_MIN } from "@/lib/calendar/notion-grid";
import { ArtefaktPanel, useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import {
  KalenderDetaljFot,
  KalenderDetaljInnhold,
  type DetaljHandling,
  type FlyttForslag,
} from "./KalenderDetalj";
import { flyttBookingTilTid } from "@/app/admin/agencyos/uka/actions";
import { foreslaGridTid } from "@/lib/calendar/notion-grid";
import { coachColorFor } from "@/lib/booking/coach-colors";


/** true på klient etter mount når viewport < 768px (styrer kun layout-tetthet). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

const SERIE_KANT = `color-mix(in srgb,${T.handling} 45%,transparent)`;
const SERIE_GLOW = `0 0 0 3px color-mix(in srgb,${T.handling} 10%,transparent)`;
const NAA_KANT = `color-mix(in srgb,${T.handling} 30%,transparent)`;

/* ── MikroMeta — liten mono-etikett m/ ikon (mockup-lokal) ── */
function MikroMeta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>
      <Icon name={icon} size={10} style={{ color: T.mut }} />
      {children}
    </span>
  );
}

/* ── SerieMerke — Apple Kalender-idiom: repeat-ikon + «Gjentas hver …» ── */
function SerieMerke({ tekst }: { tekst: string }) {
  return <MikroMeta icon="repeat">{tekst}</MikroMeta>;
}

/** Multi-coach legend — only when 2+ coacher in week. */
function CoachLegend({
  coacher,
}: {
  coacher: Array<{ id: string; navn: string }>;
}) {
  if (coacher.length < 2) return null;
  return (
    <div
      data-od-id="agency-kalender-coach-legend"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px 12px",
        alignItems: "center",
        padding: "2px 0 4px",
      }}
      aria-label="Coach-farger">
      <Caps size={9} style={{ marginRight: 2 }}>
        Coacher
      </Caps>
      {coacher.map((c) => {
        const col = coachColorFor(c.id);
        return (
          <span
            key={c.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: T.ui,
              fontSize: 12,
              color: T.fg2,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: col.accent,
                flex: "none",
              }}
            />
            {c.navn.split(" ")[0]}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Valgt økt (PP-2.4 steg 3) — kontekst i stedet for prop-drilling.
 *
 * OktBlokk ligger fem nivåer under skjermkomponenten (TimeGrid → AgencyDagInnhold
 * → OktBlokk, og DagOkterListe/MobilDagSeksjon/AgendaRad ved siden av). Å tre
 * `valgtId` og `velg` gjennom alle ville rørt seks signaturer for én ting alle
 * bladnodene trenger.
 */
const ValgKontekst = createContext<{
  valgtId: string | null;
  velg: (okt: KalOkt) => void;
} | null>(null);

/** Nullstilt knappeflate — brukt der en økt-rad selv er trykkflaten. */
const NAKEN_KNAPP: React.CSSProperties = {
  appearance: "none",
  background: "none",
  border: "none",
  padding: 0,
  textAlign: "left",
  width: "100%",
  cursor: "pointer",
};

/** Fargemerket for en økt — Google-kalenderfarge, ellers coach, ellers akse. */
function oktAksentFarge(okt: KalOkt): string {
  if (okt.erGoogle) return okt.kalenderFarge ?? T.mut;
  if (okt.coachId) return coachColorFor(okt.coachId).accent;
  if (okt.akse) return T.ax[okt.akse as AkseKey] ?? T.mut;
  return T.mut;
}

/* ── OktTrykkflate — felles trykk-dispatch for én økt: Google-hendelse åpner
   redigeringsarket, treningsøkt åpner drill-lesevisningen, serie åpner SerieMeny,
   og alt annet navigerer via href. Delt av OktBlokk (grid/dag-liste) og AgendaRad
   slik at de to visningene ikke kan komme i utakt. ── */
function OktTrykkflate({
  okt,
  onSerieClick,
  onTreningClick,
  onGoogleClick,
  children,
}: {
  okt: KalOkt;
  onSerieClick?: (okt: KalOkt) => void;
  onTreningClick?: (okt: KalOkt) => void;
  onGoogleClick?: (okt: KalOkt) => void;
  children: React.ReactNode;
}) {
  const valg = useContext(ValgKontekst);
  const knapp = (fn?: (okt: KalOkt) => void) => (
    <button
      type="button"
      onClick={() => fn?.(okt)}
      className="v2-focus"
      aria-current={valg?.valgtId === okt.id ? "true" : undefined}
      style={NAKEN_KNAPP}
    >
      {children}
    </button>
  );
  // PP-2.4 steg 3: finnes detaljkolonnen, VELGER et trykk økta i stedet for å
  // navigere bort — fasitens modell. Den dypere handlingen (åpne avtalen,
  // redigere Google-hendelsen, se drills) flytter til panelets fot, så ingenting
  // går tapt; det koster ett trykk, som er fasitens egen avveining.
  if (valg) return knapp(valg.velg);
  if (okt.erGoogle) return knapp(onGoogleClick);
  if (okt.treningsSessionId) return knapp(onTreningClick);
  if (okt.serie) return knapp(onSerieClick);
  return okt.href ? (
    <Link href={okt.href} style={{ textDecoration: "none" }}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

/* ── OktBlokk — én økt i uke-grid/dag-liste. Serie-økter åpner SerieMeny
   (klikk setter state hos forelder) i stedet for å navigere bort — vanlige
   økter beholder Link-navigasjon til booking/gruppe. Treningsøkter med
   treningsSessionId åpner drill-lesevisning (Bølge 5). ── */
function OktBlokk({
  okt,
  onSerieClick,
  onTreningClick,
  onGoogleClick,
  compact,
}: {
  okt: KalOkt;
  onSerieClick?: (okt: KalOkt) => void;
  onTreningClick?: (okt: KalOkt) => void;
  onGoogleClick?: (okt: KalOkt) => void;
  compact?: boolean;
}) {
  const erSerie = Boolean(okt.serie);
  const erTrening = Boolean(okt.treningsSessionId);
  const erGoogle = Boolean(okt.erGoogle);
  const coachAccent =
    !erGoogle && okt.coachId ? coachColorFor(okt.coachId).accent : null;
  const kant = okt.naa ? NAA_KANT : erSerie ? SERIE_KANT : T.border;
  const leftBorder = erGoogle
    ? `3px solid ${okt.kalenderFarge ?? T.mut}`
    : coachAccent
      ? `3px solid ${coachAccent}`
      : `1px solid ${kant}`;
  const dotColor = oktAksentFarge(okt);
  const inner = (
    <div
      style={{
        background: erSerie || okt.naa || erTrening ? `${T.tint}, ${T.panel2}` : T.panel2,
        border: `1px solid ${kant}`,
        // Google-hendelser: kalenderfarge. Bookinger: coach-farge (multi-coach).
        borderLeft: leftBorder,
        boxShadow: erSerie ? SERIE_GLOW : "none",
        borderRadius: T.rRow,
        padding: compact ? "4px 6px" : "8px 9px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 2 : 4,
        cursor: okt.href || erSerie || erTrening || okt.googleLenke ? "pointer" : "default",
        minWidth: 0,
        height: compact ? "100%" : undefined,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: T.mono, fontSize: compact ? 9 : 10, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{okt.kl}</span>
        <span style={{ width: 5, height: 5, borderRadius: 9999, background: dotColor, flex: "none" }} />
        {!compact && okt.naa && <StatusPill tone="down">Live</StatusPill>}
        {!compact && erTrening && <MikroMeta icon="list">Drills</MikroMeta>}
        {!compact && okt.gruppe != null && <MikroMeta icon="users">{okt.gruppe}</MikroMeta>}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: compact ? 10.5 : 11.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.navn}</span>
      {!compact && okt.erHendelse && <MikroMeta icon="x-circle">Hendelse</MikroMeta>}
      {!compact && okt.erOppgave && <MikroMeta icon="list">Oppgave-frist</MikroMeta>}
      {!compact && erGoogle && okt.kalenderNavn && (
        <MikroMeta icon="calendar">{okt.kalenderNavn.trim()}</MikroMeta>
      )}
      {!compact && okt.coachName && <MikroMeta icon="user">{okt.coachName}</MikroMeta>}
      {!compact && okt.sted && <MikroMeta icon="map-pin">{okt.facilityName ? `${okt.facilityName}` : okt.sted}</MikroMeta>}
      {!compact && okt.serie && <SerieMerke tekst={okt.serie} />}
    </div>
  );
  // Klikk på Google-hendelse åpner redigeringsarket (steg 4) — endre tid, tittel
  // og sted uten å forlate AgencyOS. Arket har lenke videre til Google.
  return (
    <OktTrykkflate
      okt={okt}
      onSerieClick={onSerieClick}
      onTreningClick={onTreningClick}
      onGoogleClick={onGoogleClick}
    >
      {inner}
    </OktTrykkflate>
  );
}

/* ── SerieMeny — panel/ark for én valgt serie-økt. Ærlig tilstand: appen har
   ingen mutasjonsflate for GroupSchedule ennå (kun opprett/dupliser, se
   src/app/admin/(legacy)/grupper/[id]/actions.ts) — «Endre denne»/«Endre alle
   fremtidige»/«Avslutt serien» er derfor FJERNET (aldri døde knapper). Eneste
   ekte handling: lenke til gruppens timeplan (view + dupliser, finnes).
   GO V3: kjører nå på BunnArk-kontrakten (fokus-felle, fokus-gjenoppretting,
   scroll-lås, Escape, sheet-in) i stedet for et eget ad-hoc overlay — samme
   ark på mobil og desktop. ── */
function SerieMeny({ okt, onClose }: { okt: KalOkt; onClose: () => void }) {
  const scheduleId = okt.id.startsWith("serie-") ? okt.id.slice("serie-".length) : null;
  const timeplanHref = okt.href && scheduleId ? `${okt.href}/timeplan?focus=${scheduleId}` : okt.href;
  return (
    <BunnArk open onClose={onClose} tittel={okt.navn}>
      <Caps size={8.5}>Gjentakende økt</Caps>
      <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, marginTop: 6 }}>
        {okt.serie} {okt.kl}
      </div>
      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>
        Å endre bare denne økta eller alle fremtidige er ikke støttet ennå — kommer.
      </p>
      {timeplanHref && (
        <Link href={timeplanHref} style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "9px 0", borderTop: `1px solid ${T.border}` }}>
            <Icon name="calendar" size={13} style={{ color: T.fg }} />
            <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>Se i gruppens timeplan</span>
          </div>
        </Link>
      )}
    </BunnArk>
  );
}

/* ── GoogleHendelseArk (steg 4) — endre eller slett en hendelse som ligger i
   Google, uten å forlate AgencyOS. Skriver til Google og oppdaterer speilet;
   kalenderen viser endringen med en gang. ── */
function GoogleHendelseArk({
  okt,
  onClose,
  onLagret,
}: {
  okt: KalOkt;
  onClose: () => void;
  onLagret: () => void;
}) {
  const [tittel, setTittel] = useState(okt.navn);
  const [start, setStart] = useState(okt.startLokal ?? "");
  const [slutt, setSlutt] = useState(okt.sluttLokal ?? "");
  const [sted, setSted] = useState(okt.sted ?? "");
  const [notat, setNotat] = useState(okt.notat ?? "");
  const [lagrer, startLagre] = useTransition();
  const [sletter, startSlett] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const mirrorId = okt.googleMirrorId;
  const laast = !mirrorId || okt.heldag;

  function lagre() {
    if (!mirrorId) return;
    setFeil(null);
    startLagre(async () => {
      const res = await oppdaterGoogleHendelse(mirrorId, {
        tittel,
        startAt: start,
        endAt: slutt,
        sted: sted || null,
        notat: notat || null,
      });
      if (res.ok) {
        onLagret();
        onClose();
      } else {
        setFeil(res.feil);
      }
    });
  }

  function slett() {
    if (!mirrorId) return;
    setFeil(null);
    startSlett(async () => {
      const res = await slettGoogleHendelse(mirrorId);
      if (res.ok) {
        onLagret();
        onClose();
      } else {
        setFeil(res.feil);
      }
    });
  }

  const feltStil: React.CSSProperties = {
    width: "100%",
    background: T.panel2,
    border: `1px solid ${T.border}`,
    borderRadius: T.rRow,
    padding: "8px 10px",
    fontFamily: T.ui,
    fontSize: 12.5,
    color: T.fg,
    marginTop: 4,
    boxSizing: "border-box",
  };
  const merkeStil: React.CSSProperties = {
    fontFamily: T.mono,
    fontSize: 9,
    fontWeight: 700,
    color: T.mut,
  };

  return (
    <BunnArk open onClose={onClose} tittel={okt.navn}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: okt.kalenderFarge ?? T.mut,
            flex: "none",
          }}
        />
        <Caps size={8.5}>{okt.kalenderNavn ?? "Google Calendar"}</Caps>
      </div>

      {laast ? (
        <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.55, margin: "12px 0 0" }}>
          {okt.heldag
            ? "Heldagshendelser redigeres foreløpig i Google."
            : "Denne hendelsen kan ikke redigeres herfra."}
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={merkeStil}>
            Tittel
            <input style={feltStil} value={tittel} onChange={(e) => setTittel(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ ...merkeStil, flex: 1 }}>
              Fra
              <input
                type="datetime-local"
                style={feltStil}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label style={{ ...merkeStil, flex: 1 }}>
              Til
              <input
                type="datetime-local"
                style={feltStil}
                value={slutt}
                onChange={(e) => setSlutt(e.target.value)}
              />
            </label>
          </div>
          <label style={merkeStil}>
            Sted
            <input style={feltStil} value={sted} onChange={(e) => setSted(e.target.value)} />
          </label>
          <label style={merkeStil}>
            Notat
            <textarea
              style={{ ...feltStil, minHeight: 60, resize: "vertical" }}
              value={notat}
              onChange={(e) => setNotat(e.target.value)}
            />
          </label>

          {feil && (
            <div style={{ fontFamily: T.ui, fontSize: 12, color: NAA_KANT }}>{feil}</div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 2 }}>
            <button
              type="button"
              onClick={slett}
              disabled={sletter || lagrer}
              className="v2-focus"
              style={{ appearance: "none", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <CTAPill ghost icon="trash">{sletter ? "Sletter …" : "Slett"}</CTAPill>
            </button>
            <button
              type="button"
              onClick={lagre}
              disabled={lagrer || sletter}
              className="v2-focus"
              style={{ appearance: "none", background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              <CTAPill icon="check">{lagrer ? "Lagrer …" : "Lagre"}</CTAPill>
            </button>
          </div>
        </div>
      )}

      {okt.googleLenke && (
        <a href={okt.googleLenke} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "9px 0", borderTop: `1px solid ${T.border}` }}>
            <Icon name="external-link" size={13} style={{ color: T.fg }} />
            <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>Åpne i Google Calendar</span>
          </div>
        </a>
      )}
    </BunnArk>
  );
}

/**
 * Varighet i minutter. Bruker EKTE sluttid når kilden har en (alle bookinger,
 * serier, hendelser, treningsøkter og tidfestede Google-avtaler har det siden
 * PP-2.4 steg 2) og estimerer bare når den mangler — gap til neste, ellers 60.
 */
function estimertVarighetMin(okter: KalOkt[], idx: number): number {
  const cur = okter[idx];
  if (cur.sluttMin != null && cur.sluttMin > cur.startMin) {
    return cur.sluttMin - cur.startMin;
  }
  // Oppgave-frist (startMin 1440) — kompakt rad nederst
  if (cur.startMin >= 24 * 60) return 30;
  // Heldags Google-hendelse (startMin -1) — kompakt rad øverst, ikke en
  // blokk som strekker seg ned til første avtale.
  if (cur.heldag) return 30;
  const next = okter[idx + 1];
  if (next && next.startMin > cur.startMin && next.startMin < 24 * 60) {
    return Math.max(30, Math.min(120, next.startMin - cur.startMin));
  }
  return 60;
}

/** Innhold i TimeGrid-dag (N1) — booking-blokker + HTML5 DnD mellom dager. */
function AgencyDagInnhold({
  dag,
  onSerieClick,
  onTreningClick,
  onGoogleClick,
  onFlytt,
  flytterId,
  onTomLuke,
}: {
  dag: KalenderData["dager"][number];
  onSerieClick: (okt: KalOkt) => void;
  onTreningClick: (okt: KalOkt) => void;
  onGoogleClick: (okt: KalOkt) => void;
  onFlytt?: (bookingId: string, datoISO: string) => void;
  flytterId?: string | null;
  onTomLuke: (datoISO: string, kl: string) => void;
}) {
  const [over, setOver] = useState(false);
  const gridOkter = dag.okter.filter((o) => o.startMin < 24 * 60);
  return (
    <div
      data-agency-dag={dag.datoISO}
      onDragOver={
        onFlytt
          ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (!over) setOver(true);
            }
          : undefined
      }
      onDragLeave={onFlytt ? () => setOver(false) : undefined}
      onDrop={
        onFlytt
          ? (e) => {
              e.preventDefault();
              setOver(false);
              const id = e.dataTransfer.getData(DND_MIME);
              if (id) onFlytt(id, dag.datoISO);
            }
          : undefined
      }
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
        const slot = snapYToSlot(y);
        const pad = (n: number) => String(n).padStart(2, "0");
        onTomLuke(dag.datoISO, `${pad(slot.hour)}:${pad(slot.minute)}`);
      }}
      style={{
        position: "absolute",
        inset: 0,
        background: over ? `color-mix(in srgb, ${T.handling} 8%, transparent)` : "transparent",
        outline: over ? `1px dashed color-mix(in srgb, ${T.handling} 45%, transparent)` : "none",
        outlineOffset: -2,
        transition: "background 80ms",
      }}
    >
      {gridOkter.map((o, idx) => {
        const body = (
          <div data-okt-blokk style={{ height: "100%", overflow: "hidden" }}>
            <OktBlokk okt={o} onSerieClick={onSerieClick} onTreningClick={onTreningClick} onGoogleClick={onGoogleClick} compact />
          </div>
        );
        return (
          <div
            key={o.id}
            style={timeGridBlockStyle(o.startMin, estimertVarighetMin(gridOkter, idx), {
              opacity: flytterId === o.id ? 0.45 : 1,
            })}
          >
            {onFlytt && !o.serie && !o.erOppgave && !o.erGoogle ? (
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DND_MIME, o.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                style={{ cursor: "grab", height: "100%" }}
              >
                {body}
              </div>
            ) : (
              body
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── DagOkterListe — én dags økter som OktBlokk-liste + «Ny booking eller økt»-
   inngang. Delt av desktop dag-visning OG mobilens dag-detalj-BunnArk, så
   opprett-inngangen (tom luke → HurtigOpprett) er identisk begge steder. ── */
function DagOkterListe({ dag, onSerieClick, onTreningClick, onGoogleClick, onTomLuke }: { dag: KalDag; onSerieClick: (okt: KalOkt) => void; onTreningClick: (okt: KalOkt) => void; onGoogleClick: (okt: KalOkt) => void; onTomLuke: (datoISO: string, kl: string) => void }) {
  return (
    <>
      {dag.okter.length === 0 ? (
        <TomTilstand icon="calendar" title="Ingen økter denne dagen" sub="Dagen er åpen — rom for planlegging." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dag.okter.map((o) => (
            <OktBlokk key={o.id} okt={o} onSerieClick={onSerieClick} onTreningClick={onTreningClick} onGoogleClick={onGoogleClick} />
          ))}
        </div>
      )}
      {/* I1: tom luke → samme hurtigvelger med tid etter siste økt. */}
      <button
        type="button"
        onClick={() => onTomLuke(dag.datoISO, foreslaGridTid(dag.okter[dag.okter.length - 1]?.kl))}
        className="v2-press v2-focus"
        style={{ appearance: "none", cursor: "pointer", marginTop: 10, width: "100%", minHeight: 44, borderRadius: 10, border: `1px dashed ${T.border}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: T.mut, fontFamily: T.ui, fontSize: 12, fontWeight: 600 }}
      >
        <Icon name="plus" size={13} />
        Ny booking eller økt
      </button>
    </>
  );
}

/* ── FilterChip (Paper `.chip` i kalenderens filterrad) — erstattet to
   nedtrekksmenyer 10.08.2026. Fasiten filtrerer med synlige knapper, ikke
   skjulte lister: du ser hvilke coacher som finnes uten å åpne noe.

   Egen komponent framfor den delte `FilterChips` i `components/v2/core.tsx`,
   av to grunner: den matcher på visningstekst (her trengs id, siden to coacher
   kan hete det samme), og den markerer valgt tilstand med clay — som er
   reservert til «Én ting nå», og på denne skjermen er det kollisjonsknappen i
   detaljkolonnen. Valgt filter er derfor blekk-fylt, som i fasiten. ── */
/** Fasitens fire programvalg + «Alle». `null` = økter uten registrert program. */
type ProgramFilterKey = "alle" | GroupBucket;
const PROGRAM_FILTRE: { k: ProgramFilterKey; n: string }[] = [
  { k: "alle", n: "Alle" },
  { k: "AKA", n: "Akademi" },
  { k: "WANG", n: "WANG" },
  { k: "GFGK", n: "GFGK" },
];

function FilterChip({
  aktiv,
  onClick,
  odId,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  odId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      data-od-id={odId}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        minHeight: 32,
        padding: "0 12px",
        borderRadius: T.rPill,
        background: aktiv ? T.cta : T.panel,
        border: `1px solid ${aktiv ? T.cta : T.border}`,
        color: aktiv ? T.onCta : T.fg,
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

/* ── MaalFlis (Paper `.m` i `.maalrad`) — nøkkeltall i tre linjer: etikett,
   regnet verdi, og en kort kvalifisering som sier hva tallet gjelder. Den
   tredje linja er ikke pynt: «6 t» alene svarer ikke på «6 t av hva?». ── */
function MaalFlis({
  etikett,
  verdi,
  kvalifisering,
  varsle,
  odId,
}: {
  etikett: string;
  verdi: string;
  kvalifisering: string;
  varsle?: boolean;
  odId?: string;
}) {
  return (
    <div
      data-od-id={odId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0,
        padding: "12px 16px",
        borderRadius: T.rCard,
        background: varsle ? `${T.tint}, ${T.panel2}` : T.panel2,
        border: `1px solid ${varsle ? NAA_KANT : T.border}`,
      }}
    >
      <Caps size={9}>{etikett}</Caps>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: T.fg,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {verdi}
      </span>
      <span
        style={{
          fontFamily: T.ui,
          fontSize: 10.5,
          color: T.mut,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {kvalifisering}
      </span>
    </div>
  );
}

/* ── Agenda (Paper `.agenda` / `.agrad`) — flat, kronologisk liste. Tredje
   visning ved siden av Dag og Uke, og den eneste som er lesbar på 390 px uten
   å bli et rutenett.

   Avvik fra fasit, bevisst: Paper viser agendaen for ÉN valgt dag, fordi hele
   fasit-toolbaren er dag-scopet i Dag/Agenda-modus. Denne skjermen laster en
   UKE (`data.dager`, ukeLabel, uke-piler) og har ingen valgt-dag-tilstand, så
   agendaen spenner uka og skiller dagene med et dato-hode. Radformatet er
   fasitens: klokkeslett · tittel + undertekst · sted. ── */

/** «09:00–10:00» for en økt. Heldag og oppgavefrist har ingen ekte spenn. */
function agendaTidsspenn(okter: KalOkt[], idx: number): string {
  const okt = okter[idx];
  if (okt.heldag) return "Hele dagen";
  if (okt.startMin >= 24 * 60) return "Frist";
  const slutt = okt.startMin + estimertVarighetMin(okter, idx);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${okt.kl}–${pad(Math.floor(slutt / 60) % 24)}:${pad(slutt % 60)}`;
}

/** Undertekst: den mest opplysende metaen vi faktisk har for økta. */
function agendaUndertekst(okt: KalOkt): string | null {
  if (okt.erOppgave) return "Oppgave-frist";
  if (okt.erHendelse) return "Hendelse";
  if (okt.erGoogle) return okt.kalenderNavn?.trim() || "Google-kalender";
  if (okt.serie) return okt.serie;
  if (okt.coachName) return okt.coachName;
  if (okt.gruppe != null) return `${okt.gruppe} spillere`;
  return null;
}

function AgendaRad({
  okter,
  idx,
  onSerieClick,
  onTreningClick,
  onGoogleClick,
}: {
  okter: KalOkt[];
  idx: number;
  onSerieClick: (okt: KalOkt) => void;
  onTreningClick: (okt: KalOkt) => void;
  onGoogleClick: (okt: KalOkt) => void;
}) {
  const okt = okter[idx];
  const sub = agendaUndertekst(okt);
  const sted = okt.facilityName ?? okt.sted;
  // Fasit `.agrad.ledig` er stiplet. Vi har ingen «ledig luke»-rad ennå (det
  // kommer med nøkkeltallene i neste PR), men hendelser og frister er samme
  // slag: ikke en avtale med en spiller. De arver derfor den stiplede kanten.
  const stiplet = Boolean(okt.erHendelse || okt.erOppgave);
  return (
    <OktTrykkflate
      okt={okt}
      onSerieClick={onSerieClick}
      onTreningClick={onTreningClick}
      onGoogleClick={onGoogleClick}
    >
      <div
        style={{
          display: "grid",
          // minmax(0,1fr) på midtkolonnen: uten den sprenger lange titler raden
          // ut av vinduet i stedet for å ellipse (gotchas.md, 10.08.2026).
          gridTemplateColumns: "104px minmax(0,1fr) auto",
          gap: 12,
          alignItems: "center",
          width: "100%",
          minHeight: 56,
          padding: 12,
          borderRadius: T.rRow,
          background: okt.naa ? `${T.tint}, ${T.panel2}` : T.panel2,
          border: `1px ${stiplet ? "dashed" : "solid"} ${okt.naa ? NAA_KANT : T.border}`,
          borderLeft: `3px ${stiplet ? "dashed" : "solid"} ${oktAksentFarge(okt)}`,
        }}
      >
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            fontWeight: 600,
            color: T.fg2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {agendaTidsspenn(okter, idx)}
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              color: T.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {okt.navn}
          </span>
          {sub && (
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10.5,
                color: T.mut,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sub}
            </span>
          )}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
          {okt.naa && <StatusPill tone="down">Live</StatusPill>}
          {sted && <MikroMeta icon="map-pin">{sted}</MikroMeta>}
        </span>
      </div>
    </OktTrykkflate>
  );
}

function AgendaListe({
  dager,
  onSerieClick,
  onTreningClick,
  onGoogleClick,
}: {
  dager: KalDag[];
  onSerieClick: (okt: KalOkt) => void;
  onTreningClick: (okt: KalOkt) => void;
  onGoogleClick: (okt: KalOkt) => void;
}) {
  const medOkter = dager.filter((d) => d.okter.length > 0);
  if (medOkter.length === 0) {
    return (
      <Kort>
        <TomTilstand
          icon="calendar"
          title="Ingen avtaler denne uka"
          sub="Prøv et annet filter, eller legg ut ledige coachingtimer."
        />
      </Kort>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {medOkter.map((d) => (
        <div key={d.datoISO || d.dato} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Caps size={9}>
              {d.dag} {d.dato}
              {d.idag ? " · i dag" : ""}
            </Caps>
            <span style={{ flex: 1, height: 1, background: T.border }} />
          </div>
          {d.okter.map((o, i) => (
            <AgendaRad
              key={o.id}
              okter={d.okter}
              idx={i}
              onSerieClick={onSerieClick}
              onTreningClick={onTreningClick}
              onGoogleClick={onGoogleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── MobilDagSeksjon — én ukedag som liste-rad på mobil (M3). Hele dagen er ETT
   tap-mål (ingen dra-og-slipp på mobil) → åpner dag-detalj i BunnArk. Viser
   dato-merke, økt-antall og et kompakt sammendrag av dagens økter (tid · navn ·
   akse). Rene visnings-spans inni knappen — ingen nøstede tap-mål. ── */
function MobilDagSeksjon({ dag, onApne }: { dag: KalDag; onApne: () => void }) {
  const antall = dag.okter.length;
  const antallTekst = antall === 0 ? "Ingen økter" : `${antall} ${antall === 1 ? "økt" : "økter"}`;
  return (
    <button
      type="button"
      onClick={onApne}
      className="v2-press v2-focus"
      aria-label={`Vis ${dag.dag} ${dag.dato} — ${antallTekst.toLowerCase()}`}
      style={{
        appearance: "none",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        background: dag.idag ? `${T.tint}, ${T.panel}` : T.panel,
        border: `1px solid ${dag.idag ? T.borderS : T.border}`,
        borderRadius: T.rCard,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: antall > 0 ? 10 : 0,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 44, flex: "none", borderRadius: T.rRow, background: T.panel2, border: `1px solid ${dag.idag ? T.borderS : T.border}`, padding: "6px 0" }}>
          <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dag.idag ? T.fg : T.mut }}>{dag.dag}</span>
          <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: dag.idag ? T.fg : T.fg2, fontVariantNumeric: "tabular-nums" }}>{dag.dato}</span>
        </span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: antall > 0 ? T.fg : T.mut }}>{antallTekst}</span>
        {dag.idag && <StatusPill>Nå</StatusPill>}
        <Icon name="chevron-right" size={16} style={{ color: T.mut, flex: "none" }} />
      </span>
      {antall > 0 && (
        <span style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 54 }}>
          {dag.okter.map((o) => (
            <span key={o.id} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums", flex: "none" }}>{o.kl}</span>
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: o.akse ? T.ax[o.akse as AkseKey] : T.mut, flex: "none" }} />
              <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>{o.navn}</span>
              {o.serie && <Icon name="repeat" size={11} style={{ color: T.mut, flex: "none" }} />}
              {o.naa && <StatusPill tone="down">Live</StatusPill>}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

export function AgencyKalenderV2({ data }: { data: KalenderData }) {
  const mobile = useMobile();
  const router = useRouter();
  // Fasiten åpner i DAG (`agencyos-kalender.html`: `var visning = 'dag'`).
  // Uka er oversikt; dagen er der coachen faktisk handler.
  const [visning, setVisning] = useState("dag");
  // Detaljkolonnen: fast høyrekolonne over 1180 px (fasitens brytepunkt), ark
  // under. Samme hook som PlayerHQ-chatens artefaktpanel, med kalenderens tall.
  const detaljSomArk = useErMobil(1180);
  const [valgtId, setValgtId] = useState<string | null>(null);
  /** Coachen har lukket detaljpanelet selv — da skal kollisjonen ikke åpne det igjen. */
  const [harLukketDetalj, setHarLukketDetalj] = useState(false);
  const [flytterId, setFlytterId] = useState<string | null>(null);
  // Multi-coach + fasilitet: null = alle
  const [coachFilter, setCoachFilter] = useState<string | null>(
    // COACH default: se egne bookinger først; ADMIN: alle
    data.viewerErAdmin ? null : data.viewerCoachId,
  );
  const [facilityFilter, setFacilityFilter] = useState<string | null>(null);
  // Paper `agencyos-kalender.html` §FILTRE: Alle · Akademi · WANG · GFGK ·
  // Ledige timer. Enkeltvalg, som i fasiten.
  const [programFilter, setProgramFilter] = useState<ProgramFilterKey>("alle");

  // I5: dra en booking-blokk til en annen dag-kolonne.
  const onFlytt = async (bookingId: string, datoISO: string) => {
    if (flytterId) return;
    setFlytterId(bookingId);
    const res = await flyttBookingTilDag(bookingId, datoISO);
    setFlytterId(null);
    if (res.ok) router.refresh();
  };
  // Hvilken serie-økt (om noen) er valgt — styrer SerieMeny-panelet (kun ekte
  // klikk på en merket serie-blokk åpner det, aldri statisk synlig).
  const [valgtSerieOkt, setValgtSerieOkt] = useState<KalOkt | null>(null);
  const [valgtGoogleOkt, setValgtGoogleOkt] = useState<KalOkt | null>(null);
  const [valgtTreningOkt, setValgtTreningOkt] = useState<KalOkt | null>(null);
  const [treningsDrills, setTreningsDrills] = useState<{
    title: string;
    drills: Array<{
      id: string;
      name: string;
      pyramide: string;
      durationMinutes: number;
      repType: string | null;
      plannedReps: number;
      faktiskeReps: number | null;
    }>;
  } | null>(null);
  // I1: trykk på tom luke → hurtigvelger (Ny booking / Ny økt) med tid fra luken.
  const [tomLuke, setTomLuke] = useState<{ dato: string; kl: string } | null>(null);
  const onTomLuke = (dato: string, kl: string) => setTomLuke({ dato, kl });
  // Mobil (M3): valgt dag vises som dag-detalj i et BunnArk (tap→detalj).
  const [dagAark, setDagArk] = useState<KalDag | null>(null);
  // Sekundær-overlay åpnet FRA dag-arket må først lukke arket (z-rekkefølge:
  // SerieMeny/HurtigOpprett ligger under BunnArk), ellers havner det bak.
  const serieFraArk = (okt: KalOkt) => { setDagArk(null); setValgtSerieOkt(okt); };
  const treningFraArk = (okt: KalOkt) => { setDagArk(null); void apneTrening(okt); };
  const tomLukeFraArk = (dato: string, kl: string) => { setDagArk(null); setTomLuke({ dato, kl }); };
  const googleFraArk = (okt: KalOkt) => { setDagArk(null); setValgtGoogleOkt(okt); };
  // Velg økt → detaljpanelet. Dag-arket lukkes først: på mobil er panelet også
  // et BunnArk, og to ark oppå hverandre gir feil z-rekkefølge (samme grunn som
  // *FraArk-hjelperne over).
  const velgOkt = (okt: KalOkt) => { setDagArk(null); setValgtId(okt.id); };

  async function apneTrening(okt: KalOkt) {
    if (!okt.treningsSessionId) return;
    setValgtTreningOkt(okt);
    setTreningsDrills(null);
    const res = await hentKalenderDrills(okt.treningsSessionId);
    if (res.ok) setTreningsDrills({ title: res.title, drills: res.drills });
  }

  // Nav-piler (ekte uke-navigasjon via ?uke=). Notion-fasit: 32px firkant m/
  // radius 8 — 44px på mobil for touch-målet.
  const navFlate = mobile ? 44 : 32;
  const pil = (href: string, ikon: string, label: string) => (
    <Link
      href={href}
      aria-label={label}
      className="v2-focus"
      style={{ width: navFlate, height: navFlate, flex: "none", borderRadius: T.rTag, background: T.panel, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2 }}
    >
      <Icon name={ikon} size={16} />
    </Link>
  );

  const filtrerteDager = data.dager.map((d) => ({
    ...d,
    okter: d.okter.filter((o) => {
      // Google/hendelse/serie uten coach — vis alltid med mindre facility filter
      if (coachFilter && o.coachId && o.coachId !== coachFilter) return false;
      // When filtering by coach, hide other coaches' bookinger; keep google/personal
      if (coachFilter && o.coachId == null && !o.erGoogle && !o.erHendelse && !o.erOppgave && !o.serie && !o.treningsSessionId) {
        // Booking without coachId (group) — keep
      }
      if (programFilter !== "alle") {
        // «Vet ikke hvilket program» skjules framfor å telles inn i et
        // program den kanskje ikke hører til.
        if (o.program !== programFilter) return false;
      }
      if (facilityFilter) {
        if (o.facilityId && o.facilityId !== facilityFilter) return false;
        // Non-booking blocks without facility: hide when facility filter is on
        if (!o.facilityId && !o.erGoogle && !o.erHendelse && !o.erOppgave && o.href?.includes("/admin/bookinger")) {
          return false;
        }
      }
      return true;
    }),
  }));
  const antallOkter = filtrerteDager.reduce((n, d) => n + d.okter.length, 0);
  const liveIDag = filtrerteDager.find((d) => d.idag)?.okter.filter((o) => o.naa).length ?? 0;

  // ── Nøkkeltall (PP-2.4 steg 2) ────────────────────────────────────────────
  // Fasitens regel: «Belegg og kollisjon REGNES, aldri skrives for hånd.»
  // Regnestykket bor i src/lib/domain/kalender-belegg.ts; her velges bare
  // hvilket utvalg og hvilken nevner som gjelder for det brukeren ser på.
  //
  // Nevneren følger coach-filteret: ser du på én coach, måles belegget mot DEN
  // coachens vindu. Ser du på alle, mot lagets samlede kapasitet. Uten det ville
  // et filter til én coach gitt et kunstig lavt belegg mot lagets nevner.
  const { tilgjengelighet } = data;
  const basisFor = (dagIndex: number): number => {
    if (coachFilter && tilgjengelighet.grunnlag === "tilgjengelighet") {
      return tilgjengelighet.basisPerCoach[coachFilter]?.[dagIndex] ?? 0;
    }
    return tilgjengelighet.basisPerDag[dagIndex] ?? 0;
  };
  const beleggOkter = (dag: KalDag): BeleggOkt[] =>
    dag.okter
      .filter((o) => o.sluttMin != null && o.startMin >= 0 && o.startMin < 24 * 60)
      .map((o) => ({
        id: o.id,
        startMin: o.startMin,
        sluttMin: o.sluttMin as number,
        slag: o.slag,
        coachId: o.coachId ?? null,
      }));
  const belegg = beleggForDager(
    filtrerteDager.map((d, i) => ({ okter: beleggOkter(d), basisMin: basisFor(i) })),
    tilgjengelighet.grunnlag,
  );
  // Kollisjoner regnes per dag: to avtaler på ulike dager kan aldri overlappe,
  // og å slå sammen uka først ville gitt falske treff på like klokkeslett.
  const alleKollisjoner = filtrerteDager.flatMap((d) => kollisjoner(beleggOkter(d)));
  const antallUtenEier = filtrerteDager.reduce((n, d) => n + utenEier(beleggOkter(d)), 0);

  // ── Detaljkolonne (PP-2.4 steg 3) ─────────────────────────────────────────
  const alleOkter = useMemo(
    () => filtrerteDager.flatMap((d) => d.okter),
    [filtrerteDager],
  );
  // Fasitens `forsteHandling()`: finnes en kollisjon, ER den dagens ene
  // handling — og da skal den kolliderende avtalen være valgt ved ankomst.
  // Uten dette åpner kalenderen med tom detaljkolonne og en uløst kollisjon
  // liggende i lerretet. Avledet, ikke satt i en effekt: har coachen lukket
  // panelet selv, skal det bli værende lukket.
  // Hvilken dag dagsvisningen står på. Fasiten åpner på dagen der kollisjonen
  // ligger — «Løs kollisjonen» skal være synlig ved ankomst, og da må lerretet
  // vise den samme dagen. Har uka ingen kollisjon, er i dag riktig dag.
  const dagMedKollisjon = filtrerteDager.find((d) => kollisjoner(beleggOkter(d)).length > 0);
  const visteDagen = dagMedKollisjon ?? filtrerteDager.find((d) => d.idag) ?? filtrerteDager[0];
  // Kun der detaljen er en fast kolonne. Under 1180 px er den et modalt ark,
  // og å åpne det av seg selv ville møtt coachen med en dialog før de har
  // sett kalenderen. På mobil er kollisjonen merket i lerretet i stedet.
  const forvalgtId = harLukketDetalj || detaljSomArk
    ? null
    : ((visning === "dag" && visteDagen
        ? kollisjoner(beleggOkter(visteDagen))[0]
        : alleKollisjoner[0]
      )?.b ?? null);
  const effektivValgtId = valgtId ?? forvalgtId;

  const valgtOkt = alleOkter.find((o) => o.id === effektivValgtId) ?? null;
  const valgtKollisjon = valgtOkt
    ? (alleKollisjoner.find((k) => k.a === valgtOkt.id || k.b === valgtOkt.id) ?? null)
    : null;
  const motpartId = valgtKollisjon
    ? valgtKollisjon.a === valgtOkt?.id
      ? valgtKollisjon.b
      : valgtKollisjon.a
    : null;
  const motpart = motpartId ? (alleOkter.find((o) => o.id === motpartId) ?? null) : null;

  // Forslaget flytter den av de to som FAKTISK kan flyttes — en Booking. Er
  // ingen av dem en booking (to Google-avtaler, en serie), står varselet alene
  // uten knapp: å tilby en flytting appen ikke kan utføre er verre enn å la
  // coachen løse det selv.
  const flyttForslag: FlyttForslag | null = (() => {
    if (!valgtKollisjon || !valgtOkt || !motpart) return null;
    const somBelegg = (o: KalOkt): BeleggOkt => ({
      id: o.id,
      startMin: o.startMin,
      sluttMin: o.sluttMin as number,
      slag: o.slag,
      coachId: o.coachId ?? null,
    });
    // Foretrekk å flytte den valgte, hvis den kan flyttes — det er den coachen
    // ser på. Ellers motparten.
    const kandidater: Array<[KalOkt, KalOkt]> = [
      [valgtOkt, motpart],
      [motpart, valgtOkt],
    ];
    for (const [flyttes, mot] of kandidater) {
      if (!flyttes.bookingId || flyttes.sluttMin == null || mot.sluttMin == null) continue;
      const forslag = foreslaFlytting(somBelegg(flyttes), somBelegg(mot), GRID_END_MIN);
      if (forslag) {
        return {
          bookingId: flyttes.bookingId,
          navn: flyttes.navn,
          startMin: forslag.startMin,
          sluttMin: forslag.sluttMin,
        };
      }
    }
    return null;
  })();

  const detaljHandling: DetaljHandling | null = !valgtOkt
    ? null
    : valgtOkt.erGoogle
      ? { label: "Rediger hendelsen", onClick: () => setValgtGoogleOkt(valgtOkt), ikon: "pencil" }
      : valgtOkt.treningsSessionId
        ? { label: "Se drills", onClick: () => void apneTrening(valgtOkt), ikon: "list" }
        : valgtOkt.serie
          ? { label: "Om serien", onClick: () => setValgtSerieOkt(valgtOkt), ikon: "repeat" }
          : valgtOkt.href
            ? { label: "Åpne avtalen", href: valgtOkt.href }
            : null;

  // Treningsøkter får en andrehandling: coachens live-flate for økta
  // (opptak/analyse/transkript). Kalenderen er inngangen dit — det er her
  // coachen står når økta skal begynne.
  const detaljSekundaer: DetaljHandling | null =
    valgtOkt?.treningsSessionId && !valgtOkt.erGoogle
      ? { label: "Åpne live-økt", href: `/admin/agencyos/live/${valgtOkt.treningsSessionId}`, ikon: "mic" }
      : null;

  const flyttTilTid = async (forslag: FlyttForslag) => {
    const res = await flyttBookingTilTid(forslag.bookingId, klokke(forslag.startMin));
    if (res.ok) router.refresh();
    return res;
  };

  // «Hvorfor dette tallet» bor i detaljkolonnens tomtilstand, som i fasiten —
  // ikke under målraden.
  const hvorforKilde = `Alle avtaler i ${data.periode}${
    coachFilter
      ? ` for ${data.coacher.find((c) => c.id === coachFilter)?.navn ?? "valgt coach"}`
      : ", alle coacher"
  }${facilityFilter ? ", filtrert på anlegg" : ""}.`;
  const hvorforBeregning =
    tilgjengelighet.grunnlag === "tilgjengelighet"
      ? "Booket coachingtid delt på tilgjengelig tid. Tilgjengelig = coachens registrerte vinduer, minus sperret tid (ferie, møte, stengt anlegg)."
      : `Booket coachingtid delt på tilgjengelig tid. Ingen coach har registrert tilgjengelighet denne uka, så nevneren er hele tidsaksen (${formaterTid(
          tilgjengelighet.basisPerDag[0] ?? 0,
        )} per dag) minus sperret tid — samme grunnlag som fasiten bruker.`;
  const hvorforForbehold = `Overlappende avtaler for samme coach telles én gang i «Booket» — to timer som deler en halvtime opptar halvannen, ikke to. Ledige timer er kapasitet som ikke er booket, ikke publiserte luker.${
    antallUtenEier > 0
      ? ` ${antallUtenEier} ${antallUtenEier === 1 ? "økt mangler" : "økter mangler"} registrert coach (gruppeserier har ingen coach-kolonne): de er verken kollisjonssjekket eller slått sammen med andre avtaler.`
      : ""
  }`;

  const detaljPanel = (
    <ArtefaktPanel
      mobil={detaljSomArk}
      open={effektivValgtId !== null}
      onClose={() => { setValgtId(null); setHarLukketDetalj(true); }}
      tittel={valgtOkt ? valgtOkt.navn : data.periode}
      foot={
        <KalenderDetaljFot
          handling={detaljHandling}
          sekundaer={detaljSekundaer}
          forslag={flyttForslag}
          onFlytt={flyttTilTid}
        />
      }
    >
      <KalenderDetaljInnhold
        valgt={valgtOkt}
        kollisjon={valgtKollisjon}
        motpartNavn={motpart?.navn ?? null}
        belegg={belegg}
        kildeTekst={hvorforKilde}
        beregningTekst={hvorforBeregning}
        forbeholdTekst={hvorforForbehold}
      />
    </ArtefaktPanel>
  );
  const statusTekst =
    liveIDag > 0
      ? `Live · ${liveIDag}`
      : antallOkter > 0
        ? `${antallOkter} økter`
        : "Tom uke";

  // Krom-opprydding 10.08.2026 (PP-2.4): fasiten har ÉN kompakt topplinje —
  // tittel og undertittel til venstre, visningsvelger til høyre — og deretter
  // nøkkeltall og filter. Appen hadde fem stablede bånd: eyebrow + «Teamets
  // uke.»-hero + statuspille, egen knapperad, nøkkeltall, egen navigasjonsrad
  // og egen filterrad. Innholdet er beholdt i sin helhet, men brettet sammen:
  // ukelabel og økt-telling er blitt undertittel, og knappene har flyttet opp
  // på tittelraden.
  //
  // Signering 12.08: toppen skal være HELT uten handlinger (fasitens `.top`
  // har kun tittel, undertittel og visningsvelgeren). «Ny økt» og «Ny booking»
  // er derfor fjernet herfra — begge finnes fortsatt der de hører hjemme:
  // trykk på en tom luke i lerretet, og «Ny booking eller økt» i dagslista.
  // Skjermens eneste clay-flate er kollisjonsløsningen i detaljkolonnen.
  const topplinje = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Ingen egen tittel her — `PaperTopp` under eier «Kalender», og to like
          overskrifter over hverandre er akkurat den støyen denne oppryddingen
          skulle fjerne. Denne linja bærer konteksten tittelen ikke har. */}
      <Caps style={{ minWidth: 0 }}>
        {data.ukeLabel} · {data.viewerErAdmin ? "teamet" : "din kalender"} · {statusTekst}
      </Caps>
    </div>
  );

  // Bølge 12: Notion-toolbar i fasit-rekkefølge (familie-calendar.html
  // .cal-toolbar) — «I dag» · piler · periode-tittel · spacer · segmentert
  // visningsvelger. Segmentet er bevisst IKKE lime; lime-jobben er «Ny økt».

  // Alle ukas økter FØR filtrering — tellerne skal vise hvor mye som finnes,
  // ikke hvor mye som er igjen etter ditt eget filter.
  const alleUkeOkter = data.dager.flatMap((d) => d.okter);
  const teamFilter = (
    <div
      data-od-id="kalender-team-filter"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
      aria-label="Filtrer program, coach og fasilitet"
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Filtrer program">
        {PROGRAM_FILTRE.filter(
          (f) => f.k === "alle" || alleUkeOkter.some((o) => o.program === f.k),
        ).map((f) => (
          <FilterChip
            key={f.k}
            aktiv={programFilter === f.k}
            onClick={() => setProgramFilter(f.k)}
            odId={`kal-filter-${f.k.toLowerCase()}`}
          >
            {f.n}
            <span style={{ fontFamily: T.mono, fontSize: 11, opacity: 0.7, marginLeft: 6 }}>
              {f.k === "alle"
                ? alleUkeOkter.length
                : alleUkeOkter.filter((o) => o.program === f.k).length}
            </span>
          </FilterChip>
        ))}
      </div>
      {data.coacher.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Filtrer coach">
          <FilterChip aktiv={coachFilter === null} onClick={() => setCoachFilter(null)} odId="kal-coach-alle">
            Alle coacher
          </FilterChip>
          {data.coacher.map((c) => (
            <FilterChip
              key={c.id}
              aktiv={coachFilter === c.id}
              onClick={() => setCoachFilter(coachFilter === c.id ? null : c.id)}
              odId={`kal-coach-${c.id}`}
            >
              {c.navn}
            </FilterChip>
          ))}
        </div>
      )}
      {data.fasiliteter.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }} role="group" aria-label="Filtrer fasilitet">
          {data.fasiliteter.map((f) => (
            <FilterChip
              key={f.id}
              aktiv={facilityFilter === f.id}
              onClick={() => setFacilityFilter(facilityFilter === f.id ? null : f.id)}
              odId={`kal-fasilitet-${f.id}`}
            >
              {f.navn}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  );

  const navigasjon = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px 14px", flexWrap: "wrap" }}>
      <Link
        href={data.nav.idag}
        aria-current={data.nav.erInnevaerende ? "page" : undefined}
        className="v2-focus"
        style={{
          height: navFlate,
          display: "inline-flex",
          alignItems: "center",
          padding: "0 12px",
          borderRadius: T.rTag,
          background: T.panel,
          border: `1px solid ${data.nav.erInnevaerende ? T.borderS : T.border}`,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 500,
          color: T.fg,
          textDecoration: "none",
          flex: "none",
        }}
      >
        I dag
      </Link>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }} aria-label="Bytt uke">
        {pil(data.nav.forrige, "chevron-left", "Forrige uke")}
        {pil(data.nav.neste, "chevron-right", "Neste uke")}
      </div>
      <span style={{ fontFamily: T.disp, fontWeight: 600, fontSize: 18, letterSpacing: "-0.01em", color: T.fg, minWidth: 0 }}>
        {data.periode}
      </span>
      <span style={{ flex: 1 }} />
      <SegmentertFaner
        ariaLabel="Kalendervisning"
        options={[
          { id: "dag", label: "Dag", odId: "kam-vis-dag" },
          { id: "uke", label: "Uke", odId: "kam-vis-uke" },
          { id: "maned", label: "Måned", odId: "kam-vis-maaned" },
          { id: "agenda", label: "Agenda", odId: "kal-vis-agenda" },
        ]}
        value={visning}
        onChange={setVisning}
      />
    </div>
  );

  // Nøkkeltall (fasit `.maalrad`): Belegg · Booket · Ledige timer · Kollisjoner.
  // Erstatter Økter/Serier/Live nå, som svarte på «hva finnes» i stedet for
  // «har du for lite eller for mye å gjøre».
  const beleggBasisTekst =
    tilgjengelighet.grunnlag === "tilgjengelighet"
      ? coachFilter
        ? "av coachens vindu"
        : "av registrert kapasitet"
      : "av hele tidsaksen";
  const kpi = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: 8 }}
        data-od-id="kalender-maalrad"
      >
        <MaalFlis
          etikett="Belegg"
          // Null nevner ⇒ tallet finnes ikke. «0 %» ville lest som en tom uke.
          verdi={belegg.prosent == null ? "—" : `${belegg.prosent} %`}
          kvalifisering={belegg.prosent == null ? "ingen kapasitet registrert" : beleggBasisTekst}
          odId="kal-maal-belegg"
        />
        <MaalFlis
          etikett="Booket"
          verdi={formaterTid(belegg.booketMin)}
          kvalifisering="coachingtid"
          odId="kal-maal-booket"
        />
        <MaalFlis
          etikett="Ledige timer"
          verdi={belegg.tilgjengeligMin > 0 ? formaterTid(belegg.ledigMin) : "—"}
          kvalifisering={belegg.tilgjengeligMin > 0 ? "kan bookes" : "ingen kapasitet registrert"}
          odId="kal-maal-ledige"
        />
        <MaalFlis
          etikett="Kollisjoner"
          verdi={String(alleKollisjoner.length)}
          kvalifisering={alleKollisjoner.length ? "overlapper i tid" : "ingen"}
          varsle={alleKollisjoner.length > 0}
          odId="kal-maal-kollisjoner"
        />
      </div>
    </div>
  );

  // Serie-hint: kun når det faktisk finnes en klikkbar serie-økt denne uka —
  // uker uten forekomster dekkes allerede av innsikt-teksten under (data.ts).
  const serieHint =
    data.serieOkterAntall > 0 ? (
      <Caps size={9} style={{ margin: "0 2px" }}>Trykk på en merket, gjentakende økt for detaljer</Caps>
    ) : null;

  const innsikt = data.innsikt ? (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="sparkles" size={13} style={{ color: T.handling, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{data.innsikt}</span>
    </div>
  ) : null;

  // ── Mobil (M3, bølge 4): LISTE-først, ikke rutenett. Uke = én seksjon per
  //    ukedag (stablet vertikalt); tap på en dag → dag-detalj i BunnArk. Dag =
  //    én dag ekspandert. All interaksjon er TAP — ingen dra-og-slipp (desktop-
  //    only). Segmentvelger, serie-merker og opprett-inngang er tap-baserte. ──
  if (mobile) {
    let mobilKropp: React.ReactNode;
    if (visning === "agenda") {
      mobilKropp = (
        <AgendaListe
          dager={filtrerteDager}
          onSerieClick={setValgtSerieOkt}
          onTreningClick={(o) => void apneTrening(o)}
          onGoogleClick={setValgtGoogleOkt}
        />
      );
    } else if (visning === "maned") {
      mobilKropp = (
        <Kort>
          <TomTilstand icon="calendar" title="Månedsvisning kommer" sub="Denne forhåndsvisningen laster uke-data. Måned kobles i en senere bølge." />
        </Kort>
      );
    } else if (visning === "dag") {
      const valgt = visteDagen;
      mobilKropp = (
        <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
          <DagOkterListe dag={valgt} onSerieClick={setValgtSerieOkt} onTreningClick={(o) => void apneTrening(o)} onGoogleClick={setValgtGoogleOkt} onTomLuke={onTomLuke} />
        </Kort>
      );
    } else {
      // Uke: alle 7 ukedager som stablede liste-seksjoner, tap → dag-detalj.
      mobilKropp = (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtrerteDager.map((d, i) => (
            <MobilDagSeksjon key={i} dag={d} onApne={() => setDagArk(d)} />
          ))}
        </div>
      );
    }
    return (
      <ValgKontekst.Provider value={{ valgtId: effektivValgtId, velg: velgOkt }}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {topplinje}
        {navigasjon}
        {kpi}
        {teamFilter}
        <CoachLegend coacher={data.coacher} />
        {mobilKropp}

        {visning === "uke" && serieHint}
        {innsikt}
        {detaljPanel}
        <BunnArk
          open={dagAark !== null}
          onClose={() => setDagArk(null)}
          tittel={dagAark ? `${dagAark.dag} ${dagAark.dato}${dagAark.idag ? " · i dag" : ""}` : undefined}
        >
          {dagAark && <DagOkterListe dag={dagAark} onSerieClick={serieFraArk} onTreningClick={treningFraArk} onGoogleClick={googleFraArk} onTomLuke={tomLukeFraArk} />}
        </BunnArk>
        {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} />}
        {valgtGoogleOkt && (
          <GoogleHendelseArk
            okt={valgtGoogleOkt}
            onClose={() => setValgtGoogleOkt(null)}
            onLagret={() => router.refresh()}
          />
        )}
        <BunnArk
          open={valgtTreningOkt !== null}
          onClose={() => { setValgtTreningOkt(null); setTreningsDrills(null); }}
          tittel={treningsDrills?.title ?? valgtTreningOkt?.navn ?? "Økt"}
        >
          {!treningsDrills ? (
            <TomTilstand icon="loader" title="Laster drills…" sub="Henter planlagt og gjennomført volum." />
          ) : treningsDrills.drills.length === 0 ? (
            <TomTilstand icon="list" title="Ingen drills" sub="Åpne Workbench for å legge til øvelser." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {treningsDrills.drills.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: T.rRow,
                    border: `1px solid ${T.border}`,
                    background: T.panel2,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[d.pyramide as AkseKey] ?? T.mut }} />
                    <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, flex: 1 }}>{d.name}</span>
                    <Caps size={9}>{d.pyramide}</Caps>
                  </div>
                  <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                    {d.durationMinutes} min
                    {d.repType ? ` · ${d.repType}` : ""}
                    {d.plannedReps > 0 ? ` · plan ${d.plannedReps}` : ""}
                    {d.faktiskeReps != null ? ` · gjort ${d.faktiskeReps}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BunnArk>
        {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}
      </div>
      </ValgKontekst.Provider>
    );
  }

  // ── Desktop: Dag / Uke / Måned ──
  let kropp: React.ReactNode;
  if (visning === "uke") {
    // N1: felles Notion TimeGrid (samme motor som Workbench-uke)
    kropp = (
      <TimeGrid
        days={filtrerteDager.map((d, i) => ({
          id: d.datoISO || `dag-${i}`,
          dow: d.dag,
          date: d.dato,
          today: d.idag,
        }))}
        showNowLine
        bordered
        renderDay={(i) => (
          <AgencyDagInnhold
            dag={filtrerteDager[i]}
            onSerieClick={setValgtSerieOkt}
            onTreningClick={(o) => void apneTrening(o)}
            onGoogleClick={setValgtGoogleOkt}
            onFlytt={onFlytt}
            flytterId={flytterId}
            onTomLuke={onTomLuke}
          />
        )}
      />
    );
  } else if (visning === "dag") {
    const valgt = visteDagen;
    kropp = (
      <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
        <DagOkterListe dag={valgt} onSerieClick={setValgtSerieOkt} onTreningClick={(o) => void apneTrening(o)} onGoogleClick={setValgtGoogleOkt} onTomLuke={onTomLuke} />
      </Kort>
    );
  } else if (visning === "agenda") {
    kropp = (
      <AgendaListe
        dager={filtrerteDager}
        onSerieClick={setValgtSerieOkt}
        onTreningClick={(o) => void apneTrening(o)}
        onGoogleClick={setValgtGoogleOkt}
      />
    );
  } else {
    // Måned: ikke koblet til denne forhåndsvisnings-loaderen ennå (ærlig tom-tilstand).
    kropp = (
      <Kort>
        <TomTilstand icon="calendar" title="Månedsvisning kommer" sub="Denne forhåndsvisningen laster uke-data. Måned kobles i en senere bølge." />
      </Kort>
    );
  }

  return (
    <ValgKontekst.Provider value={{ valgtId: effektivValgtId, velg: velgOkt }}>
    <PaperPage odId="agencyos-kalender"><div data-paper-agencyos-kalender data-paper-slug="agencyos-kalender" data-paper-wave-b="kalender" data-od-id="agency-kalender" style={{ display: "contents" }}><PaperTopp tittel="Kalender" sub="AgencyOS · uke, bookinger og anlegg" /><PaperKropp maxWidth={1200}>
      {topplinje}
      {navigasjon}
      {kpi}
      {teamFilter}
      <CoachLegend coacher={data.coacher} />

      {/* Fasitens todelte lerret: kalender + detaljkolonne. Over 1180 px står
          panelet fast ved siden av; under bytter det form til ark (samme
          kontrakt som PlayerHQ-artefaktet: «forsvinner ikke — bytter form»).
          `minWidth: 0` på BEGGE kolonnene: uten det sprenger lange titler i
          agendaen og økt-blokkene rutenettet ut av vinduet i stedet for å
          ellipse (gotchas.md, 10.08.2026). */}
      {detaljSomArk ? (
        <>
          {kropp}
          {detaljPanel}
        </>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 340px",
            gap: T.gap,
            alignItems: "start",
            minWidth: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>{kropp}</div>
          <div
            style={{
              minWidth: 0,
              maxHeight: "calc(100vh - 160px)",
              position: "sticky",
              top: 16,
              borderRadius: T.rCard,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              display: "flex",
            }}
          >
            {detaljPanel}
          </div>
        </div>
      )}

      {visning === "uke" && serieHint}
      {innsikt}
      {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} />}
      {valgtGoogleOkt && (
        <GoogleHendelseArk
          okt={valgtGoogleOkt}
          onClose={() => setValgtGoogleOkt(null)}
          onLagret={() => router.refresh()}
        />
      )}
      <BunnArk
        open={valgtTreningOkt !== null}
        onClose={() => { setValgtTreningOkt(null); setTreningsDrills(null); }}
        tittel={treningsDrills?.title ?? valgtTreningOkt?.navn ?? "Økt"}
      >
        {!treningsDrills ? (
          <TomTilstand icon="loader" title="Laster drills…" sub="Henter planlagt og gjennomført volum." />
        ) : treningsDrills.drills.length === 0 ? (
          <TomTilstand icon="list" title="Ingen drills" sub="Åpne Workbench for å legge til øvelser." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {treningsDrills.drills.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: T.rRow,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[d.pyramide as AkseKey] ?? T.mut }} />
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, flex: 1 }}>{d.name}</span>
                  <Caps size={9}>{d.pyramide}</Caps>
                </div>
                <div style={{ marginTop: 6, fontFamily: T.mono, fontSize: 11, color: T.mut }}>
                  {d.durationMinutes} min
                  {d.repType ? ` · ${d.repType}` : ""}
                  {d.plannedReps > 0 ? ` · plan ${d.plannedReps}` : ""}
                  {d.faktiskeReps != null ? ` · gjort ${d.faktiskeReps}` : ""}
                </div>
              </div>
            ))}
            <Link href="/admin/agencyos" style={{ textDecoration: "none", marginTop: 8 }}>
              <CTAPill ghost full>Til Workbench for redigering</CTAPill>
            </Link>
          </div>
        )}
      </BunnArk>
      {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}
      </PaperKropp>
      </div>
    </PaperPage>
    </ValgKontekst.Provider>
  );
}
