"use client";

/**
 * PlayerHQ «I dag» — Train-lock-porten av hele skjermfamilien.
 * Valgt kilde 10.09.2026: ZIP (4), PH-01 I dag v3.dc.html.
 * Fasit: designsystem/train-lock/PH-01 I dag.dc.html
 * Fasit: designsystem/train-lock/PH-01b I dag FYS-mandag.dc.html (FYS-stripe + pyramide-indikator)
 * Fasit: designsystem/train-lock/PH-01c I dag TrackMan-kort.dc.html (dempet TrackMan-kort)
 * Fasit: designsystem/train-lock/PH-01e I dag tilstander laast.dc.html (tilstandene)
 * Fasit: designsystem/train-lock/PH-02 I dag hvile.dc.html
 * Fasit: designsystem/train-lock/PH-03 I dag tom uke.dc.html
 * Rigg: PH-01 I dag
 * Avvik:
 *   - «Hele dagen» beholder KA-04-inngangen. Ukens tall viser dokumenterte
 *     øktminutter; SG er siste ti runder, ikke en oppdiktet ukesverdi.
 *   - Tredje iPad-flis (antall slag) mangler et avstemt datagrunnlag.
 *     Full kilde-/appkontroll og visuell godkjenning gjenstår.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Clock, TrendingUp, CalendarDays, Check } from "lucide-react";
import { TL } from "@/lib/v2/train-lock";
import {
  IDAG_UI,
  IDAG_UKE_BOKSTAVER,
  type IDagPrikk,
  type IDagTilstand,
} from "@/lib/portal/idag-visning";
import type { PlayerDaySession } from "@/lib/workbench/wb-actions";
import type { TrackManTeaser } from "@/lib/trackman/teaser";
import type { TesterLiveKort as TesterLiveKortData } from "@/lib/portal-tester/tester-live-kort";
import { klokkeslett } from "@/lib/domain/kalender-lag";
import type { IDagAgendaHendelse } from "@/lib/portal/idag-agenda";
import { AvatarFoto } from "@/components/v2/core";
import styles from "./idag-train-lock.module.css";
import { IDagITidenArk } from "@/components/portal/v2/kalender/IDagITidenArk";
import { GodkjenningKort } from "./GodkjenningKort";
import { IDagNaaKort } from "./idag-naa-kort";
import { TrainLockCaddieKnapp } from "@/components/train-lock/player-chrome";
import { TrainLockFremdrift, TrainLockStatus } from "@/components/train-lock/v3-elementer";

export type NaaKort = {
  tittel: string;
  tid: string;
  meta: string;
  ctaTekst: string;
  ctaHref: string;
  fremdriftPst: number | null;
  fremdriftTekst: string | null;
  live: boolean;
  /** Ferdig økt — visningsmerke Fullført (warm + hake), CTA Se recap. */
  fullfort?: boolean;
  sekundarTekst?: string;
  sekundarHref?: string;
  /** Øktens pyramide-nivå (FYS/TEK/SLAG/SPILL/TURN) — styrer PH-01b-stripen. */
  pyramide?: string | null;
  /**
   * Illustrasjon øverst i «Nå»-kortet (PH-01b hero-felt).
   * Fasitens hero er en BILDE-plassholder. Uten bilde tegnes feltet ikke —
   * ellers står det igjen et 120px tomrom i kortfarge (målt 30.08 mot PH-01 Mac).
   */
  heroBilde?: string | null;
};

export type IDagTrainLockProps = {
  datoLinje: string;
  navn?: string;
  avatarUrl?: string | null;
  hilsen?: string;
  valgtOktId?: string;
  fullfortMinutter?: number;
  maanedNavn: string;
  prikker: IDagPrikk[];
  tilstand: IDagTilstand;
  naa: NaaKort | null;
  neste: { tittel: string; meta: string; href?: string } | null;
  sgInnspill: string;
  okterUke: number;
  fullfortUke?: number;
  ukeNummer: number;
  /** Andel fullførte planlagte minutter, når datagrunnlag finnes. */
  ukeFremdrift?: number;
  trackman: TrackManTeaser | null;
  testerLive: TesterLiveKortData | null;
  godkjenninger: PlayerDaySession[];
  /** KA-04: norsk ukedag + dato, f.eks. «Lørdag 22.» (ingen måned). */
  dagLabel: string;
  hendelser: IDagAgendaHendelse[];
};

const caps: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  // Fasiten setter ingen line-height og treffer SF Pros normal (~1.19). Poppins
  // har ~1.5, som gjorde hvert kort 12–15px høyere enn PH-01 Mac (målt 30.08).
  lineHeight: 1.2,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TL.mute,
};

const kort: CSSProperties = {
  background: TL.elev,
  borderRadius: TL.radius.card,
  padding: 20,
  boxShadow: TL.shadowCard,
};

function Cta({ href, barn, dim }: { href: string; barn: string; dim?: boolean }) {
  return (
    <Link
      href={href}
      className={dim ? "v2-press v2-focus" : "v2-press v2-focus ph01-cta-prim"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        borderRadius: 999,
        background: dim ? TL.dim : TL.fill,
        color: dim ? TL.text : TL.onFill,
        fontFamily: TL.font.sans,
        fontSize: 16,
        fontWeight: dim ? 600 : 700,
        textDecoration: "none",
        marginTop: 18,
      }}
    >
      {barn}
    </Link>
  );
}

function TekstLenke({ href, barn }: { href: string; barn: string }) {
  return (
    <Link
      href={href}
      className="v2-press"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        fontSize: 15,
        fontWeight: 600,
        color: TL.mute,
        textDecoration: "none",
      }}
    >
      {barn}
    </Link>
  );
}


function NesteKort({ neste }: { neste: { tittel: string; meta: string; href?: string } }) {
  const innhold = <><div style={caps}>{IDAG_UI.neste}</div><div className={styles.nesteTittel}>{neste.tittel}</div><div className={styles.meta}>{neste.meta}</div></>;
  return neste.href
    ? <Link className={`${styles.neste} v2-focus v2-press`} href={neste.href}>{innhold}</Link>
    : <div className={styles.neste}>{innhold}</div>;
}

function Bento({ sg, okter }: { sg: string; okter: number }) {
  return <div className={styles.bento}>
    <div className={styles.flis}><CalendarDays size={20} aria-hidden /><div className={styles.tall}>{okter}</div><div style={caps}>{IDAG_UI.okterUken}</div></div>
    <div className={styles.flis}><TrendingUp size={20} aria-hidden /><div className={styles.tall}>{sg}</div><div style={caps}>{IDAG_UI.sgInnspill}</div></div>
  </div>;
}

function RestenAvDagen({ hendelser, onHeleDagen }: { hendelser: IDagAgendaHendelse[]; onHeleDagen: () => void }) {
  return <section className={styles.agenda} aria-label="Resten av dagen">
    <div className={styles.agendaHode}>
      <h2 style={caps}>Resten av dagen</h2>
      <button type="button" className="v2-focus v2-press" onClick={onHeleDagen} aria-label="I dag i tiden"><Clock size={16} aria-hidden />Hele dagen</button>
    </div>
    {hendelser.length === 0 ? <p className={styles.meta}>Ingen andre avtaler i dag.</p> : <ul className={styles.agendaListe}>{hendelser.map((h) => {
      const innhold = <>
        <span className={styles.agendaTid}>{h.startMin == null ? h.lag === "TESTER" ? "Frist" : "Hele dagen" : klokkeslett(h.startMin)}</span>
        <span className={styles.agendaTekst}><span className={styles.agendaTittel}>{h.tittel}</span>{h.undertekst && <span className={styles.meta}>{h.undertekst}</span>}</span>
        {h.fullfort ? <span className={styles.agendaStatus}><TrainLockStatus variant="ok"><Check size={12} aria-hidden />Fullført</TrainLockStatus></span> : h.lesevisning ? <span className={styles.agendaStatus}><TrainLockStatus>Låst</TrainLockStatus></span> : null}
      </>;
      return <li key={h.id}>{h.href ? <Link href={h.href} className={`${styles.agendaRad} v2-focus v2-press`}>{innhold}</Link> : <div className={styles.agendaRad}>{innhold}</div>}</li>;
    })}</ul>}
  </section>;
}

function PrikkMaaned({ navn, prikker }: { navn: string; prikker: IDagPrikk[] }) {
  const dager = prikker.filter((p) => !p.tom);
  const fylte = dager.flatMap((p, i) => p.fylt ? [i + 1] : []);
  const idag = dager.findIndex((p) => p.idag) + 1;
  return (
    <div style={kort} role="img" aria-label={`${navn}. I dag: ${idag}. Dager med fullførte økter markert: ${fylte.length ? fylte.join(", ") : "ingen"}.`}>
      <div style={caps}>{navn}</div>
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: 6,
        }}
      >
        {IDAG_UKE_BOKSTAVER.map((b, i) => (
          <div key={`${b}-${i}`} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: TL.mute }}>
            {b}
          </div>
        ))}
        {prikker.map((p, i) => (
          <div key={i} style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: p.tom ? "transparent" : p.idag ? "transparent" : p.fylt ? TL.text : TL.dim,
                boxShadow: p.idag ? `inset 0 0 0 2.5px ${TL.text}` : "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackManKort({ trackman }: { trackman: TrackManTeaser }) {
  return (
    <Link
      href={`/portal/analysere/trackman/${trackman.sessionId}`}
      data-od-id="ph-01c-trackman-kort"
      style={{
        display: "block",
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: "16px 18px",
        textDecoration: "none",
        color: "inherit",
        background: "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, ...caps }}>
          Siste TrackMan · {trackman.club} · {trackman.dateText}
        </div>
        <span style={{ fontSize: 13, color: TL.mute }}>{IDAG_UI.seSpredning}</span>
        <ChevronRight size={14} color="currentColor" strokeWidth={2} style={{ color: TL.mute, flex: "none" }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TL.mute }}>{trackman.sentence}</div>
    </Link>
  );
}

function TesterKort({ testerLive }: { testerLive: TesterLiveKortData }) {
  return (
    <Link
      href={`/portal/tren/tester/${testerLive.testId}/gjennomfor`}
      style={{
        display: "block",
        ...kort,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={caps}>Pågår · {testerLive.testNavn} · {testerLive.fremdrift}</span>
      <div style={{ marginTop: 7, fontSize: 15, fontWeight: 600, color: TL.text }}>Fortsett testen</div>
    </Link>
  );
}

export function IDagTrainLock(p: IDagTrainLockProps) {
  const [besvart, setBesvart] = useState<Set<string>>(() => new Set());
  const [idagItidenApen, setIdagItidenApen] = useState(false);
  const godkjenninger = p.godkjenninger.filter((g) => !besvart.has(g.id));

  let hero: ReactNode = null;
  if (p.tilstand === "feil") {
    hero = (
      <div style={kort}>
        <div style={{ ...caps, color: TL.text }}>{IDAG_UI.feilCaps}</div>
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TL.text }}>{IDAG_UI.feilTittel}</div>
        <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>{IDAG_UI.feilBrød}</div>
        <button
          type="button"
          className="v2-press v2-focus"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            width: "100%",
            height: 48,
            borderRadius: 999,
            border: 0,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: TL.font.sans,
          }}
        >
          {IDAG_UI.provIgjen}
        </button>
      </div>
    );
  } else if (p.tilstand === "tom-uke") {
    hero = (
      <div style={kort}>
        <div style={caps}>{IDAG_UI.caddieCaps}</div>
        <div style={{ marginTop: 10, fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: TL.text }}>
          {IDAG_UI.tomUkeCaddie}
        </div>
      </div>
    );
  } else if (p.tilstand === "tom-dag") {
    hero = (
      <div style={{ ...kort, padding: 24 }}>
        <div style={caps}>{IDAG_UI.ingenOktCaps}</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.25,
            color: TL.text,
          }}
        >
          {IDAG_UI.ingenOktTittel}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: TL.mute }}>
          Uke {p.ukeNummer} · {p.fullfortUke ?? 0} økter er gjennomført
        </div>
        <Cta href="/portal/tren/wb" barn={IDAG_UI.startEgen} dim />
        <TekstLenke href="/portal/planlegge" barn={IDAG_UI.apnePlan} />
      </div>
    );
  } else if (p.tilstand === "hvile") {
    hero = (
      <div style={kort}>
        <div style={caps}>{IDAG_UI.tittel}</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            color: TL.text,
          }}
        >
          {IDAG_UI.hvile}
        </div>
        <div style={{ marginTop: 5, fontSize: 13, color: TL.mute }}>{IDAG_UI.programmertAvAnders}</div>
      </div>
    );
  } else if (p.naa) {
    hero = <IDagNaaKort naa={p.naa} />;
  }

  const visBento = p.tilstand === "okt" || p.tilstand === "hvile" || p.tilstand === "pagar";
  const visPrikker =
    p.tilstand === "okt" || p.tilstand === "hvile" || p.tilstand === "pagar" || p.tilstand === "tom-uke";
  const visNeste = Boolean(p.neste && p.tilstand !== "feil");
  const visTm = Boolean(p.trackman && (p.tilstand === "okt" || p.tilstand === "pagar"));

  const nesteNode = visNeste && p.neste ? <NesteKort neste={p.neste} /> : null;
  const prikkNode = visPrikker ? <PrikkMaaned navn={p.maanedNavn} prikker={p.prikker} /> : null;

  return (
    <div
      data-od-id="ph-01-idag"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        fontFamily: TL.font.sans,
        color: TL.text,
        backgroundImage: TL.glow,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 320px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <div
        className={`${styles.scroll} ph01-scroll`}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <header className={styles.hode}>
          <div className={styles.hilsen}>
            <div style={caps}>{p.datoLinje} · uke {p.ukeNummer}</div>
            <h1><span className={styles.mobilTittel}>{IDAG_UI.tittel}</span><span className={styles.macTittel}>{p.hilsen ?? IDAG_UI.tittel}</span></h1>
          </div>
          <div className={styles.hodeHandlinger}>
            {p.ukeFremdrift != null && <div className={styles.macFremdrift}><TrainLockFremdrift verdi={p.ukeFremdrift} label={`Uke ${p.ukeNummer} · planlagte minutter`} /></div>}
            <TrainLockCaddieKnapp bareDesktop />
            <Link href="/portal/meg" aria-label="Åpne profilen min" className={`${styles.profil} v2-focus v2-press`}><AvatarFoto navn={p.navn ?? "Spiller"} src={p.avatarUrl ?? null} size={44} /></Link>
          </div>
        </header>
        <div className={styles.grid}>
          <div className={styles.hovedkolonne}>
            {godkjenninger.map((okt) => <GodkjenningKort key={okt.id} okt={okt} onFerdig={(id) => setBesvart((prev) => new Set(prev).add(id))} />)}
            {hero}
            {visBento && <div className={styles.mobilTall}>
              {p.ukeFremdrift != null && <TrainLockFremdrift verdi={p.ukeFremdrift} label={`Uke ${p.ukeNummer} · planlagte minutter`} />}
              <Bento sg={p.sgInnspill} okter={p.okterUke} />
            </div>}
            <RestenAvDagen hendelser={p.hendelser.filter((h) => h.id !== `okt-${p.valgtOktId}` && (!p.valgtOktId || h.planSessionId !== p.valgtOktId)).sort((a, b) => Number(Boolean(a.fullfort)) - Number(Boolean(b.fullfort)))} onHeleDagen={() => setIdagItidenApen(true)} />
            {p.testerLive && p.tilstand !== "feil" && <TesterKort testerLive={p.testerLive} />}
            {visTm && p.trackman && <TrackManKort trackman={p.trackman} />}
            {nesteNode}
          </div>
          <aside className={styles.sidekolonne} aria-label="Ukeoversikt">
            {visBento && <Bento sg={p.sgInnspill} okter={p.okterUke} />}
            {p.fullfortMinutter != null && <div className={styles.moment}>
              <div style={caps}>Ukens tall</div>
              <div className={styles.momentTall}>{p.fullfortMinutter}</div>
              <div className={styles.momentMeta}>Planlagte minutter i fullførte økter · uke {p.ukeNummer}</div>
            </div>}
            {prikkNode}
          </aside>
        </div>
      </div>
      <IDagITidenArk
        open={idagItidenApen}
        onClose={() => setIdagItidenApen(false)}
        dagLabel={p.dagLabel}
        hendelser={p.hendelser}
      />
    </div>
  );
}
