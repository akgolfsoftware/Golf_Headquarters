"use client";

/**
 * AgencyOS Kalender — v2 (retning C «Presis»). Komponert 1:1 fra mockup-fasit
 * ui_kits/v2/agencyos.jsx → funksjon Kalender (+ OktBlokk, SerieMerke, SerieMeny),
 * men drevet av EKTE data fra hentAgencyKalenderData
 * (../(v2preview)/v2-agency-kalender/data.ts).
 *
 * Coach-uke med alle spillere: 1-til-1-økter og gruppe-økter fra Booking, pluss
 * GJENTAKENDE SERIER fra GroupSchedule (WEEKLY) merket med SerieMerke. Klikk på
 * en serie-merket økt åpner SerieMeny som panel — GroupSchedule har ingen
 * mutasjonsflate ennå (kun opprett/dupliser), så «endre denne/alle fremtidige»
 * er en ærlig «kommer»-tekst, ikke døde knapper. Eneste ekte handling derfra:
 * lenke til gruppens timeplan.
 *
 * Kun v2-komponenter fra "@/components/v2" + skjerm-lokale komposisjoner på
 * T.*-tokens (samme mønster som CockpitV2/KalenderV2). Ingen rå hex.
 * V2Shell (montert i page.tsx) eier chrome-en.
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
  Knapp,
  Kort,
  StatusPill,
  TomTilstand,
  Icon,
  HurtigOpprett,
  foreslaTid,
} from "@/components/v2";
import { type AkseKey } from "@/lib/v2/tokens";
import type { KalenderData, KalOkt } from "@/app/admin/kalender/data";

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
function OktBlokk({ okt, onSerieClick }: { okt: KalOkt; onSerieClick?: (okt: KalOkt) => void }) {
  const erSerie = Boolean(okt.serie);
  const kant = okt.naa ? NAA_KANT : erSerie ? SERIE_KANT : T.border;
  const inner = (
    <div
      style={{
        background: erSerie || okt.naa ? `${T.tint}, ${T.panel2}` : T.panel2,
        border: `1px solid ${kant}`,
        boxShadow: erSerie ? SERIE_GLOW : "none",
        borderRadius: T.rRow,
        padding: "8px 9px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        cursor: okt.href || erSerie ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{okt.kl}</span>
        <span style={{ width: 5, height: 5, borderRadius: 9999, background: okt.akse ? T.ax[okt.akse as AkseKey] : T.mut, flex: "none" }} />
        {okt.naa && <StatusPill tone="down">Live</StatusPill>}
        {okt.gruppe != null && <MikroMeta icon="users">{okt.gruppe}</MikroMeta>}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{okt.navn}</span>
      {okt.erHendelse && <MikroMeta icon="x-circle">Hendelse</MikroMeta>}
      {okt.erOppgave && <MikroMeta icon="list">Oppgave-frist</MikroMeta>}
      {okt.sted && <MikroMeta icon="map-pin">{okt.sted}</MikroMeta>}
      {okt.serie && <SerieMerke tekst={okt.serie} />}
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

/* ── Dag-kolonne (desktop grid-celle) ── */
function DagKolonne({ dag, onSerieClick, onFlytt, flytterId, onTomLuke }: { dag: KalenderData["dager"][number]; onSerieClick: (okt: KalOkt) => void; onFlytt?: (bookingId: string, datoISO: string) => void; flytterId?: string | null; onTomLuke: (datoISO: string, kl: string) => void }) {
  const [over, setOver] = useState(false);
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
      style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 8, borderRadius: 12, padding: 4, margin: -4, background: over ? `color-mix(in srgb, ${T.lime} 6%, transparent)` : "transparent", outline: over ? `1px dashed color-mix(in srgb, ${T.lime} 45%, transparent)` : "none", outlineOffset: -2, transition: "background 80ms" }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "2px 2px 6px", borderBottom: `1px solid ${dag.idag ? T.borderS : T.border}` }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: dag.idag ? T.fg : T.mut }}>{dag.dag}</span>
        <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: dag.idag ? T.fg : T.fg2, fontVariantNumeric: "tabular-nums" }}>{dag.dato}</span>
        {dag.idag && <StatusPill>Nå</StatusPill>}
      </div>
      {dag.okter.length === 0 ? (
        <span style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, padding: "8px 2px" }}>Ingen økter</span>
      ) : (
        dag.okter.map((o) =>
          onFlytt && !o.serie && !o.erOppgave ? (
            <div
              key={o.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData(DND_MIME, o.id); e.dataTransfer.effectAllowed = "move"; }}
              style={{ cursor: "grab", opacity: flytterId === o.id ? 0.45 : 1 }}
            >
              <OktBlokk okt={o} onSerieClick={onSerieClick} />
            </div>
          ) : (
            <OktBlokk key={o.id} okt={o} onSerieClick={onSerieClick} />
          ),
        )
      )}
      {/* I1: trykk på tom luke → hurtigvelger (Ny booking / Ny økt) med tid
          foreslått etter dagens siste økt (09:00 når dagen er tom). */}
      <button
        type="button"
        onClick={() => onTomLuke(dag.datoISO, foreslaTid(dag.okter[dag.okter.length - 1]?.kl))}
        aria-label={`Ny booking eller økt ${dag.dag} ${dag.dato}`}
        className="v2-press v2-focus"
        style={{ appearance: "none", background: "none", flex: 1, minHeight: 44, borderRadius: 10, border: `1px dashed transparent`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "transparent", padding: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderS; e.currentTarget.style.color = T.mut; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "transparent"; }}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
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

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{data.ukeLabel}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="uke.">Stallens</Tittel>
        </div>
      </div>
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
        {!mobile && (
          <>
            <Link href="/admin/bookinger/ny" style={{ textDecoration: "none" }}>
              <Knapp icon="calendar-check" ghost>Ny booking</Knapp>
            </Link>
            {/* Planlegge er ETT trykkpunkt til Workbench (låst beslutning) —
                ikke prototypen /admin/coach-workbench. */}
            <Link href="/admin/planlegge" style={{ textDecoration: "none" }}>
              <CTAPill icon="plus">Ny økt</CTAPill>
            </Link>
          </>
        )}
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
      <Icon name="sparkles" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{data.innsikt}</span>
    </div>
  ) : null;

  // ── Mobil: stablede dag-kort (kun dager med økter) ──
  if (mobile) {
    const dagerMedOkter = data.dager.filter((d) => d.okter.length > 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {dagerMedOkter.length === 0 ? (
          <Kort>
            <TomTilstand icon="calendar" title="Ingen økter denne uka" sub="Uka er åpen — rom for planlegging." />
          </Kort>
        ) : (
          dagerMedOkter.map((d, i) => (
            <Kort key={i} eyebrow={`${d.dag} ${d.dato}${d.idag ? " · i dag" : ""}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.okter.map((o) => (
                  <OktBlokk key={o.id} okt={o} onSerieClick={setValgtSerieOkt} />
                ))}
              </div>
            </Kort>
          ))
        )}
        {serieHint}
        {innsikt}
        {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} mobile />}
      </div>
    );
  }

  // ── Desktop: Dag / Uke / Måned ──
  let kropp: React.ReactNode;
  if (visning === "uke") {
    kropp = (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {data.dager.map((d, i) => (
          <DagKolonne key={i} dag={d} onSerieClick={setValgtSerieOkt} onFlytt={onFlytt} flytterId={flytterId} onTomLuke={onTomLuke} />
        ))}
      </div>
    );
  } else if (visning === "dag") {
    const valgt = data.dager.find((d) => d.idag) ?? data.dager[0];
    kropp = (
      <Kort eyebrow={`${valgt.dag} ${valgt.dato}${valgt.idag ? " · i dag" : ""}`}>
        {valgt.okter.length === 0 ? (
          <TomTilstand icon="calendar" title="Ingen økter denne dagen" sub="Dagen er åpen — rom for planlegging." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {valgt.okter.map((o) => (
              <OktBlokk key={o.id} okt={o} onSerieClick={setValgtSerieOkt} />
            ))}
          </div>
        )}
        {/* I1: tom luke i dag-visningen → samme hurtigvelger med tid etter siste økt. */}
        <button
          type="button"
          onClick={() => onTomLuke(valgt.datoISO, foreslaTid(valgt.okter[valgt.okter.length - 1]?.kl))}
          className="v2-press v2-focus"
          style={{ appearance: "none", cursor: "pointer", marginTop: 10, width: "100%", minHeight: 44, borderRadius: 10, border: `1px dashed ${T.border}`, background: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: T.mut, fontFamily: T.ui, fontSize: 12, fontWeight: 600 }}
        >
          <Icon name="plus" size={13} />
          Ny booking eller økt
        </button>
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
      {kropp}
      {visning === "uke" && serieHint}
      {innsikt}
      {valgtSerieOkt && <SerieMeny okt={valgtSerieOkt} onClose={() => setValgtSerieOkt(null)} />}
      {tomLuke && <HurtigOpprett dato={tomLuke.dato} klokkeslett={tomLuke.kl} onLukk={() => setTomLuke(null)} />}
    </div>
  );
}
