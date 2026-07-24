"use client";

/**
 * AgencyOS Kalender — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Mørk AgencyOS. Coach-uke: bookinger + gjentakende serier.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { flyttBookingTilDag } from "@/app/admin/agencyos/uka/actions";

// I5: samme DnD-mønster som uka-kanbanen — dra booking til ny dag.
const DND_MIME = "application/x-akgolf-kalender";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  PillVelger,
  CTAPill,
  Kort,
  StatusPill,
  TomTilstand,
  KpiFlis,
  Icon,
  HurtigOpprett,
  BunnArk,
} from "@/components/v2";
import { type AkseKey } from "@/lib/v2/tokens";
import type { KalenderData, KalDag, KalOkt } from "@/app/admin/kalender/data";
import {
  GRID_BODY_PX,
  GRID_END_HOUR,
  GRID_START_HOUR,
  PIXEL_PER_HOUR,
  foreslaGridTid,
  gridHours,
  minutesToPx,
  durationToPx,
} from "@/lib/calendar/notion-grid";

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

const SERIE_KANT = `color-mix(in srgb,${T.lime} 45%,transparent)`;
const SERIE_GLOW = `0 0 0 3px color-mix(in srgb,${T.lime} 10%,transparent)`;
const NAA_KANT = `color-mix(in srgb,${T.lime} 30%,transparent)`;

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

/* ── OktBlokk — én økt i uke-grid/dag-liste. Serie-økter åpner SerieMeny
   (klikk setter state hos forelder) i stedet for å navigere bort — vanlige
   økter beholder Link-navigasjon til booking/gruppe. ── */
function OktBlokk({ okt, onSerieClick, compact }: { okt: KalOkt; onSerieClick?: (okt: KalOkt) => void; compact?: boolean }) {
  const erSerie = Boolean(okt.serie);
  const kant = okt.naa ? NAA_KANT : erSerie ? SERIE_KANT : T.border;
  const inner = (
    <div
      style={{
        background: erSerie || okt.naa ? `${T.tint}, ${T.panel2}` : T.panel2,
        border: `1px solid ${kant}`,
        boxShadow: erSerie ? SERIE_GLOW : "none",
        borderRadius: T.rRow,
        padding: compact ? "4px 6px" : "8px 9px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 2 : 4,
        cursor: okt.href || erSerie ? "pointer" : "default",
        minWidth: 0,
        height: compact ? "100%" : undefined,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: T.mono, fontSize: compact ? 9 : 10, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{okt.kl}</span>
        <span style={{ width: 5, height: 5, borderRadius: 9999, background: okt.akse ? T.ax[okt.akse as AkseKey] : T.mut, flex: "none" }} />
        {!compact && okt.naa && <StatusPill tone="down">Live</StatusPill>}
        {!compact && okt.gruppe != null && <MikroMeta icon="users">{okt.gruppe}</MikroMeta>}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: compact ? 10.5 : 11.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.navn}</span>
      {!compact && okt.erHendelse && <MikroMeta icon="x-circle">Hendelse</MikroMeta>}
      {!compact && okt.erOppgave && <MikroMeta icon="list">Oppgave-frist</MikroMeta>}
      {!compact && okt.sted && <MikroMeta icon="map-pin">{okt.sted}</MikroMeta>}
      {!compact && okt.serie && <SerieMerke tekst={okt.serie} />}
    </div>
  );
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
   På <md presenteres den som fast bunn-ark (edge-to-edge, r20 kun øverst) —
   samme mønster som AdminHandlingssenterV2s mobilArk; på ≥md forblir den et
   sentrert flytende panel. ── */
function SerieMeny({ okt, onClose, mobile }: { okt: KalOkt; onClose: () => void; mobile?: boolean }) {
  const scheduleId = okt.id.startsWith("serie-") ? okt.id.slice("serie-".length) : null;
  const timeplanHref = okt.href && scheduleId ? `${okt.href}/timeplan?focus=${scheduleId}` : okt.href;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gjentakende økt"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: `color-mix(in srgb, ${T.bg} 62%, transparent)`,
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: mobile ? "flex-start" : "center",
        padding: mobile ? 0 : 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={
          mobile
            ? {
                background: T.panel3,
                borderTop: `1px solid ${T.borderS}`,
                borderRadius: "20px 20px 0 0",
                padding: "14px 16px calc(18px + env(safe-area-inset-bottom))",
                width: "100%",
                boxShadow: "0 -24px 60px rgba(0,0,0,0.5)",
              }
            : { background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 18, padding: "14px 16px 18px", width: "100%", maxWidth: 380, marginBottom: 6 }
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <Caps size={8.5}>Gjentakende økt</Caps>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-focus"
            style={{ appearance: "none", cursor: "pointer", background: T.panel2, border: `1px solid ${T.borderS}`, borderRadius: 9999, width: 26, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2, flex: "none" }}
          >
            <Icon name="x" size={13} />
          </button>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 700, color: T.fg, margin: "6px 0 2px" }}>{okt.navn}</div>
        <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>{okt.serie} {okt.kl}</div>
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
      </div>
    </div>
  );
}

/** Estimert varighet (min) når loader ikke gir slutt-tid — gap til neste, ellers 60. */
function estimertVarighetMin(okter: KalOkt[], idx: number): number {
  const cur = okter[idx];
  // Oppgave-frist (startMin 1440) — kompakt rad nederst
  if (cur.startMin >= 24 * 60) return 30;
  const next = okter[idx + 1];
  if (next && next.startMin > cur.startMin && next.startMin < 24 * 60) {
    return Math.max(30, Math.min(120, next.startMin - cur.startMin));
  }
  return 60;
}

/* ── Dag-kolonne (desktop): Notion-tidslinje 05–23, absolutt posisjonerte økter ── */
function DagKolonne({ dag, onSerieClick, onFlytt, flytterId, onTomLuke }: { dag: KalenderData["dager"][number]; onSerieClick: (okt: KalOkt) => void; onFlytt?: (bookingId: string, datoISO: string) => void; flytterId?: string | null; onTomLuke: (datoISO: string, kl: string) => void }) {
  const [over, setOver] = useState(false);
  const gridOkter = dag.okter.filter((o) => o.startMin < 24 * 60);
  return (
    <div
      onDragOver={onFlytt ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (!over) setOver(true); } : undefined}
      onDragLeave={onFlytt ? () => setOver(false) : undefined}
      onDrop={onFlytt ? (e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData(DND_MIME);
        if (id) onFlytt(id, dag.datoISO);
      } : undefined}
      style={{ minWidth: 0, display: "flex", flexDirection: "column", borderRadius: 12, background: over ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : T.panel, border: `1px solid ${dag.idag ? T.borderS : T.border}`, outline: over ? `1px dashed color-mix(in srgb, ${T.lime} 45%, transparent)` : "none", outlineOffset: -2, transition: "background 80ms", overflow: "hidden" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "8px 8px 6px", borderBottom: `1px solid ${dag.idag ? T.borderS : T.border}`, flex: "none" }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dag.idag ? T.fg : T.mut }}>{dag.dag}</span>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: dag.idag ? T.fg : T.fg2, fontVariantNumeric: "tabular-nums" }}>{dag.dato}</span>
        {dag.idag && <StatusPill>Nå</StatusPill>}
      </div>
      <div
        style={{ position: "relative", height: GRID_BODY_PX, minHeight: GRID_BODY_PX }}
        onClick={(e) => {
          // Klikk på tom luke: map Y → nærmeste 30-min slot
          if ((e.target as HTMLElement).closest("[data-okt-blokk]")) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const hours = GRID_START_HOUR + y / PIXEL_PER_HOUR;
          const totalMin = Math.round((hours * 60) / 30) * 30;
          const clamped = Math.max(GRID_START_HOUR * 60, Math.min(GRID_END_HOUR * 60, totalMin));
          const pad = (n: number) => String(n).padStart(2, "0");
          const kl = `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`;
          onTomLuke(dag.datoISO, kl);
        }}
        role="presentation"
      >
        {gridHours().map((h) => (
          <div
            key={h}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: (h - GRID_START_HOUR) * PIXEL_PER_HOUR,
              height: PIXEL_PER_HOUR,
              borderTop: `1px solid ${T.border}`,
              pointerEvents: "none",
            }}
          />
        ))}
        {gridOkter.map((o, idx) => {
          const top = minutesToPx(o.startMin);
          const h = durationToPx(estimertVarighetMin(gridOkter, idx));
          const body = (
            <div data-okt-blokk style={{ height: "100%", overflow: "hidden" }}>
              <OktBlokk okt={o} onSerieClick={onSerieClick} compact />
            </div>
          );
          return (
            <div
              key={o.id}
              style={{
                position: "absolute",
                left: 3,
                right: 3,
                top,
                height: h,
                zIndex: 1,
                opacity: flytterId === o.id ? 0.45 : 1,
              }}
            >
              {onFlytt && !o.serie && !o.erOppgave ? (
                <div
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData(DND_MIME, o.id); e.dataTransfer.effectAllowed = "move"; }}
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
    </div>
  );
}

/* ── DagOkterListe — én dags økter som OktBlokk-liste + «Ny booking eller økt»-
   inngang. Delt av desktop dag-visning OG mobilens dag-detalj-BunnArk, så
   opprett-inngangen (tom luke → HurtigOpprett) er identisk begge steder. ── */
function DagOkterListe({ dag, onSerieClick, onTomLuke }: { dag: KalDag; onSerieClick: (okt: KalOkt) => void; onTomLuke: (datoISO: string, kl: string) => void }) {
  return (
    <>
      {dag.okter.length === 0 ? (
        <TomTilstand icon="calendar" title="Ingen økter denne dagen" sub="Dagen er åpen — rom for planlegging." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dag.okter.map((o) => (
            <OktBlokk key={o.id} okt={o} onSerieClick={onSerieClick} />
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
  // I1: trykk på tom luke → hurtigvelger (Ny booking / Ny økt) med tid fra luken.
  const [tomLuke, setTomLuke] = useState<{ dato: string; kl: string } | null>(null);
  const onTomLuke = (dato: string, kl: string) => setTomLuke({ dato, kl });
  // Mobil (M3): valgt dag vises som dag-detalj i et BunnArk (tap→detalj).
  const [dagAark, setDagArk] = useState<KalDag | null>(null);
  // Sekundær-overlay åpnet FRA dag-arket må først lukke arket (z-rekkefølge:
  // SerieMeny/HurtigOpprett ligger under BunnArk), ellers havner det bak.
  const serieFraArk = (okt: KalOkt) => { setDagArk(null); setValgtSerieOkt(okt); };
  const tomLukeFraArk = (dato: string, kl: string) => { setDagArk(null); setTomLuke({ dato, kl }); };

  // Nav-piler (ekte uke-navigasjon via ?uke=).
  const pil = (href: string, ikon: string, label: string) => (
    <Link
      href={href}
      aria-label={label}
      style={{ width: 30, height: 30, flex: "none", borderRadius: 9999, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.fg2 }}
    >
      <Icon name={ikon} size={14} />
    </Link>
  );

  const antallOkter = data.antallOkter;
  const liveIDag = data.dager.find((d) => d.idag)?.okter.filter((o) => o.naa).length ?? 0;
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
          <Tittel mobile={mobile} em="uke.">Stallens</Tittel>
        </div>
      </div>
      <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
    </div>
  );

  // B: én primær CTA full · booking er sekundær
  const primaerCta = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Link href="/admin/planlegge" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon="plus" full>
          Ny økt
        </CTAPill>
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

  const navigasjon = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <PillVelger
        options={[
          { v: "dag", l: "Dag" },
          { v: "uke", l: "Uke" },
          { v: "maned", l: "Måned" },
        ]}
        value={visning}
        onChange={setVisning}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {!data.nav.erInnevaerende && (
          <Link
            href={data.nav.idag}
            style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "6px 13px", textDecoration: "none" }}
          >
            I dag
          </Link>
        )}
        {pil(data.nav.forrige, "chevron-left", "Forrige uke")}
        {pil(data.nav.neste, "chevron-right", "Neste uke")}
      </div>
    </div>
  );

  // B: uke-status (5s)
  const kpi = (
    <div className="grid grid-cols-3" style={{ gap: T.gap }}>
      <KpiFlis label="Økter uke" value={antallOkter} tint={antallOkter > 0} />
      <KpiFlis label="Serier" value={data.serieOkterAntall} />
      <KpiFlis label="Live nå" value={liveIDag} varsle={liveIDag > 0} />
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
      <Icon name="sparkles" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{data.innsikt}</span>
    </div>
  ) : null;

  // ── Mobil (M3, bølge 4): LISTE-først, ikke rutenett. Uke = én seksjon per
  //    ukedag (stablet vertikalt); tap på en dag → dag-detalj i BunnArk. Dag =
  //    én dag ekspandert. All interaksjon er TAP — ingen dra-og-slipp (desktop-
  //    only). PillVelger, serie-merker og opprett-inngang er tap-baserte. ──
  if (mobile) {
    let mobilKropp: React.ReactNode;
    if (visning === "maned") {
      mobilKropp = (
        <Kort>
          <TomTilstand icon="calendar" title="Månedsvisning kommer" sub="Denne forhåndsvisningen laster uke-data. Måned kobles i en senere bølge." />
        </Kort>
      );
    } else if (visning === "dag") {
      const valgt = data.dager.find((d) => d.idag) ?? data.dager[0];
      mobilKropp = (
        <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
          <DagOkterListe dag={valgt} onSerieClick={setValgtSerieOkt} onTomLuke={onTomLuke} />
        </Kort>
      );
    } else {
      // Uke: alle 7 ukedager som stablede liste-seksjoner, tap → dag-detalj.
      mobilKropp = (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.dager.map((d, i) => (
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
        {mobilKropp}
        {visning === "uke" && serieHint}
        {innsikt}
        <BunnArk
          open={dagAark !== null}
          onClose={() => setDagArk(null)}
          tittel={dagAark ? `${dagAark.dag} ${dagAark.dato}${dagAark.idag ? " · i dag" : ""}` : undefined}
        >
          {dagAark && <DagOkterListe dag={dagAark} onSerieClick={serieFraArk} onTomLuke={tomLukeFraArk} />}
        </BunnArk>
        {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} mobile />}
        {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}
      </div>
    );
  }

  // ── Desktop: Dag / Uke / Måned ──
  let kropp: React.ReactNode;
  if (visning === "uke") {
    // Notion-uke: tidskolonne 05–23 + 7 dager (absolutt-posisjonerte økter)
    kropp = (
      <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", gap: 6, alignItems: "start", overflowX: "auto" }}>
        <div style={{ paddingTop: 34 }}>
          {gridHours().map((h) => (
            <div
              key={h}
              style={{
                height: PIXEL_PER_HOUR,
                fontFamily: T.mono,
                fontSize: 9,
                fontWeight: 700,
                color: T.mut,
                textAlign: "right",
                paddingRight: 6,
                lineHeight: 1,
                transform: "translateY(-4px)",
              }}
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>
        {data.dager.map((d, i) => (
          <DagKolonne key={i} dag={d} onSerieClick={setValgtSerieOkt} onFlytt={onFlytt} flytterId={flytterId} onTomLuke={onTomLuke} />
        ))}
      </div>
    );
  } else if (visning === "dag") {
    const valgt = data.dager.find((d) => d.idag) ?? data.dager[0];
    kropp = (
      <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
        <DagOkterListe dag={valgt} onSerieClick={setValgtSerieOkt} onTomLuke={onTomLuke} />
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {primaerCta}
      {kpi}
      {navigasjon}
      {kropp}
      {visning === "uke" && serieHint}
      {innsikt}
      {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} />}
      {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}
    </div>
  );
}
