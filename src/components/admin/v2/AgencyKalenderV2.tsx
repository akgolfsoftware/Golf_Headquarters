"use client";

/**
 * AgencyOS Kalender — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys default, mørk via bryter. Coach-uke: bookinger + serier.
 *
 * Bølge 12 (Open Design-port): toolbaren følger Notion-fasiten i
 * `familie-calendar.html` .cal-toolbar — «I dag» · piler · periode-tittel ·
 * segmentert visningsvelger. Segmentet er ikke lime; lime-jobben er «Ny økt».
 */

import { useEffect, useState, useTransition } from "react";
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
  Tittel,
  CTAPill,
  SegmentertFaner,
  Kort,
  StatusPill,
  TomTilstand,
  KpiFlis,
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
      aria-label="Coach-farger"
    >
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
  const dotColor = erGoogle
    ? (okt.kalenderFarge ?? T.mut)
    : coachAccent
      ? coachAccent
      : okt.akse
        ? T.ax[okt.akse as AkseKey]
        : T.mut;
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
  if (erGoogle) {
    // Klikk åpner redigeringsarket (steg 4) — endre tid, tittel og sted uten
    // å forlate AgencyOS. Arket har lenke videre til Google.
    return (
      <button
        type="button"
        onClick={() => onGoogleClick?.(okt)}
        className="v2-focus"
        style={{ appearance: "none", background: "none", border: "none", padding: 0, textAlign: "left", width: "100%", cursor: "pointer" }}
      >
        {inner}
      </button>
    );
  }
  if (erTrening) {
    return (
      <button
        type="button"
        onClick={() => onTreningClick?.(okt)}
        className="v2-focus"
        style={{ appearance: "none", background: "none", border: "none", padding: 0, textAlign: "left", width: "100%", cursor: "pointer" }}
      >
        {inner}
      </button>
    );
  }
  if (erSerie) {
    return (
      <button
        type="button"
        onClick={() => onSerieClick?.(okt)}
        className="v2-focus"
        style={{ appearance: "none", background: "none", border: "none", padding: 0, textAlign: "left", width: "100%", cursor: "pointer" }}
      >
        {inner}
      </button>
    );
  }
  return okt.href ? (
    <Link href={okt.href} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  ) : (
    inner
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

/** Estimert varighet (min) når loader ikke gir slutt-tid — gap til neste, ellers 60. */
function estimertVarighetMin(okter: KalOkt[], idx: number): number {
  const cur = okter[idx];
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
  const [visning, setVisning] = useState("uke");
  const [flytterId, setFlytterId] = useState<string | null>(null);
  // Multi-coach + fasilitet: null = alle
  const [coachFilter, setCoachFilter] = useState<string | null>(
    // COACH default: se egne bookinger først; ADMIN: alle
    data.viewerErAdmin ? null : data.viewerCoachId,
  );
  const [facilityFilter, setFacilityFilter] = useState<string | null>(null);

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
  const statusTone = liveIDag > 0 ? "down" : antallOkter > 0 ? "lime" : "info";
  const statusTekst =
    liveIDag > 0
      ? `Live · ${liveIDag}`
      : antallOkter > 0
        ? `${antallOkter} økter`
        : "Tom uke";

  // B: hode = tittel + status (primær CTA ligger under)
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.ukeLabel}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="uke.">{data.viewerErAdmin ? "Teamets" : "Din"}</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // B: én primær CTA full · booking er sekundær
  const primaerCta = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Link
        href="/admin/planlegge"
        data-od-id="kalender-ny-okt" data-paper-en-ting="true"
        className="v2-press v2-focus"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 56,
          width: "100%",
          borderRadius: 12,
          background: T.handling,
          color: T.onHandling,
          fontFamily: T.ui,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Ny økt
      </Link>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link href="/admin/bookinger/ny" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="calendar-check">
            Ny booking
          </CTAPill>
        </Link>
      </div>
    </div>
  );

  // Bølge 12: Notion-toolbar i fasit-rekkefølge (familie-calendar.html
  // .cal-toolbar) — «I dag» · piler · periode-tittel · spacer · segmentert
  // visningsvelger. Segmentet er bevisst IKKE lime; lime-jobben er «Ny økt».

  const teamFilter = (data.coacher.length > 0 || data.fasiliteter.length > 0) ? (
    <div
      data-od-id="kalender-team-filter"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
      aria-label="Filtrer coach og fasilitet"
    >
      {data.coacher.length > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Coach
          <select
            value={coachFilter ?? ""}
            onChange={(e) => setCoachFilter(e.target.value || null)}
            className="v2-focus"
            style={{
              minHeight: 40,
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: T.panel,
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 13,
              padding: "0 10px",
            }}
          >
            <option value="">Alle coacher</option>
            {data.coacher.map((c) => (
              <option key={c.id} value={c.id}>{c.navn}</option>
            ))}
          </select>
        </label>
      )}
      {data.fasiliteter.length > 0 && (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Fasilitet
          <select
            value={facilityFilter ?? ""}
            onChange={(e) => setFacilityFilter(e.target.value || null)}
            className="v2-focus"
            style={{
              minHeight: 40,
              borderRadius: T.rTag,
              border: `1px solid ${T.border}`,
              background: T.panel,
              color: T.fg,
              fontFamily: T.ui,
              fontSize: 13,
              padding: "0 10px",
            }}
          >
            <option value="">Alle fasiliteter</option>
            {data.fasiliteter.map((f) => (
              <option key={f.id} value={f.id}>{f.navn}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  ) : null;

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
        ]}
        value={visning}
        onChange={setVisning}
      />
    </div>
  );

  // B: uke-status (5s)
  const kpi = (
    // `instant`: rene opptellinger — 0 er en ekte verdi her, så en tell-opp-fra-0
    // kan ikke skilles fra «ingen økter denne uka» (og står fast på 0 hvis fanen
    // lastes i bakgrunnen, der animasjonsframene er suspendert).
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Økter uke" value={antallOkter} tint={antallOkter > 0} instant />
      <KpiFlis label="Serier" value={data.serieOkterAntall} instant />
      <KpiFlis label="Live nå" value={liveIDag} varsle={liveIDag > 0} instant />
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
    if (visning === "maned") {
      mobilKropp = (
        <Kort>
          <TomTilstand icon="calendar" title="Månedsvisning kommer" sub="Denne forhåndsvisningen laster uke-data. Måned kobles i en senere bølge." />
        </Kort>
      );
    } else if (visning === "dag") {
      const valgt = filtrerteDager.find((d) => d.idag) ?? filtrerteDager[0];
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
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {primaerCta}
        {kpi}
        {navigasjon}
      {teamFilter}
        <CoachLegend coacher={data.coacher} />
        {mobilKropp}

        {visning === "uke" && serieHint}
        {innsikt}
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
        timeColWidth={48}
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
    const valgt = filtrerteDager.find((d) => d.idag) ?? filtrerteDager[0];
    kropp = (
      <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
        <DagOkterListe dag={valgt} onSerieClick={setValgtSerieOkt} onTreningClick={(o) => void apneTrening(o)} onGoogleClick={setValgtGoogleOkt} onTomLuke={onTomLuke} />
      </Kort>
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
    <PaperPage odId="agencyos-kalender"><div data-paper-agencyos-kalender data-paper-wave-b="kalender" data-od-id="agency-kalender" style={{ display: "contents" }}><PaperTopp tittel="Kalender" sub="AgencyOS · uke, bookinger og anlegg" /><PaperKropp maxWidth={1200}>
      {hode}
      {primaerCta}
      {kpi}
      {navigasjon}
      {teamFilter}
      <CoachLegend coacher={data.coacher} />
      {kropp}

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
  );
}
