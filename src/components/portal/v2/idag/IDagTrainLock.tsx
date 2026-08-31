"use client";

/**
 * PlayerHQ «I dag» — Train-lock-porten av hele skjermfamilien.
 * Fasit: designsystem/train-lock/PH-01 I dag.dc.html
 * Fasit: designsystem/train-lock/PH-01b I dag FYS-mandag.dc.html (FYS-stripe + pyramide-indikator)
 * Fasit: designsystem/train-lock/PH-01c I dag TrackMan-kort.dc.html (dempet TrackMan-kort)
 * Fasit: designsystem/train-lock/PH-01e I dag tilstander laast.dc.html (tilstandene)
 * Fasit: designsystem/train-lock/PH-02 I dag hvile.dc.html
 * Fasit: designsystem/train-lock/PH-03 I dag tom uke.dc.html
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
import { GodkjenningKort } from "./GodkjenningKort";

export type NaaKort = {
  tittel: string;
  tid: string;
  meta: string;
  ctaTekst: string;
  ctaHref: string;
  fremdriftPst: number | null;
  fremdriftTekst: string | null;
  live: boolean;
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

/** PH-01b: rekkefølgen i pyramide-indikatoren. */
const PYRAMIDE_NIVAER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export type IDagTrainLockProps = {
  datoLinje: string;
  maanedNavn: string;
  prikker: IDagPrikk[];
  tilstand: IDagTilstand;
  naa: NaaKort | null;
  neste: { tittel: string; meta: string } | null;
  sgInnspill: string;
  okterUke: number;
  ukeNummer: number;
  trackman: TrackManTeaser | null;
  testerLive: TesterLiveKortData | null;
  godkjenninger: PlayerDaySession[];
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

/** PH-01b: 5-segments pyramide-indikator — aktivt nivå hvitt, resten dim. */
function PyramideStripe({ aktiv }: { aktiv: string }) {
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 3 }}>
      {PYRAMIDE_NIVAER.map((nivaa) => {
        const er = nivaa === aktiv;
        return (
          <div key={nivaa} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 2, background: er ? TL.text : TL.dim }} />
            <div
              style={{
                marginTop: 3,
                fontSize: 7,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: er ? TL.text : TL.mute,
                textAlign: "center",
              }}
            >
              {nivaa}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NaaFlate({ naa }: { naa: NaaKort }) {
  const fys = naa.pyramide === "FYS";
  // Hero-feltet er en bilde-plassholder i fasiten — uten bilde blir det bare et hull.
  const hero = fys && Boolean(naa.heroBilde);
  return (
    <div
      className={hero ? undefined : "ph01-naa"}
      style={{ background: TL.elev, borderRadius: TL.radius.card, overflow: hero ? "hidden" : undefined }}
    >
      {hero && (
        <div
          style={{
            height: 120,
            borderRadius: 12,
            background: `${TL.elev} center/cover no-repeat url(${JSON.stringify(naa.heroBilde)})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 10,
              bottom: 8,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            FYS · {naa.tittel}
          </span>
        </div>
      )}
      <div className={hero ? "ph01-naa" : undefined} style={hero ? undefined : { display: "contents" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...caps, color: naa.live ? TL.text : TL.mute, display: "inline-flex", alignItems: "center", gap: 7 }}>
          {naa.live && (
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: TL.text }} />
          )}
          {naa.live ? IDAG_UI.live : IDAG_UI.naa}
        </span>
        <span style={{ ...caps, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{naa.tid}</span>
      </div>
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
        {naa.tittel}
      </div>
      <div style={{ marginTop: 5, fontSize: 13, fontWeight: 400, color: TL.mute }}>{naa.meta}</div>
      {naa.fremdriftPst != null && (
        <>
          <div style={{ marginTop: 18, height: 3, borderRadius: 2, background: TL.dim, overflow: "hidden" }}>
            <div style={{ width: `${naa.fremdriftPst}%`, height: "100%", background: TL.text, borderRadius: 2 }} />
          </div>
          {naa.fremdriftTekst && (
            <div style={{ marginTop: 9, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              {naa.fremdriftTekst}
            </div>
          )}
        </>
      )}
      {fys && naa.pyramide && (
        /* PH-01b (telefon) har pyramide-stripen; PH-01 Mac har den ikke — der
           står bare fremdriftsstreken. `.ph01-kun-telefon` skjuler den ≥1101px. */
        <div className="ph01-kun-telefon">
          <PyramideStripe aktiv={naa.pyramide} />
        </div>
      )}
      <Cta href={naa.ctaHref} barn={naa.ctaTekst} />
      {naa.sekundarTekst && naa.sekundarHref && <TekstLenke href={naa.sekundarHref} barn={naa.sekundarTekst} />}
      </div>
    </div>
  );
}

function NesteKort({ neste }: { neste: { tittel: string; meta: string } }) {
  return (
    <div style={{ ...kort, padding: "18px 20px" }}>
      <div style={caps}>{IDAG_UI.neste}</div>
      <div style={{ marginTop: 7, fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: TL.text }}>{neste.tittel}</div>
      <div style={{ marginTop: 3, fontSize: 13, fontWeight: 400, lineHeight: 1.2, color: TL.mute }}>{neste.meta}</div>
    </div>
  );
}

function Bento({ sg, okter }: { sg: string; okter: number }) {
  return (
    <div className="ph01-bento">
      <div style={kort}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: TL.text }}>
          {sg}
        </div>
        <div style={{ ...caps, marginTop: 7 }}>{IDAG_UI.sgInnspill}</div>
      </div>
      <div style={kort}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: TL.text }}>
          {okter}
        </div>
        <div style={{ ...caps, marginTop: 7 }}>{IDAG_UI.okterUken}</div>
      </div>
    </div>
  );
}

function PrikkMaaned({ navn, prikker }: { navn: string; prikker: IDagPrikk[] }) {
  return (
    <div style={kort}>
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
  const godkjenninger = p.godkjenninger.filter((g) => !besvart.has(g.id));

  let hero: ReactNode = null;
  if (p.tilstand === "feil") {
    hero = (
      <div style={kort}>
        <div style={{ ...caps, color: TL.danger }}>{IDAG_UI.feilCaps}</div>
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
          Uke {p.ukeNummer} · {p.okterUke} økter er gjennomført
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
    hero = <NaaFlate naa={p.naa} />;
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
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <style>{`
        /* Bunnklaring for den faste Caddie-linjen + bunn-navet. Fasiten løser det
           samme med en 150px avstandsholder nederst (PH-01b). Uten den stakk
           siste kalenderrad opp bak doken (målt 30.08 på 390px). */
        .ph01-scroll { padding-bottom: 150px; }
        .ph01-bento { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ph01-grid { display: flex; flex-direction: column; gap: 12px; }
        .ph01-kun-mac { display: none; }
        .ph01-kun-telefon { display: contents; }
        .ph01-naa { padding: 20px; }
        input.ph01-caddie::placeholder { color: var(--tl-mute); }
        @media (min-width: 1101px) {
          .ph01-grid { display: grid; grid-template-columns: 1.25fr 1fr; gap: 14px; align-items: start; }
          .ph01-kun-mac { display: flex; flex-direction: column; gap: 12px; }
          .ph01-kun-telefon { display: none; }
          .ph01-cta-prim { width: 260px; }
          .ph01-naa { padding: 24px; }
        }
      `}</style>
      <div
        className="ph01-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ ...caps }}>{p.datoLinje}</div>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: TL.text,
          }}
        >
          {IDAG_UI.tittel}
        </h1>
        <div className="ph01-grid" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {godkjenninger.map((okt) => (
              <GodkjenningKort key={okt.id} okt={okt} onFerdig={(id) => setBesvart((prev) => new Set(prev).add(id))} />
            ))}
            {hero}
            <div className="ph01-kun-telefon">
              {visTm && p.trackman && <TrackManKort trackman={p.trackman} />}
            </div>
            {p.testerLive && p.tilstand !== "feil" && <TesterKort testerLive={p.testerLive} />}
            <div className="ph01-kun-telefon">{nesteNode}</div>
            {visBento && <Bento sg={p.sgInnspill} okter={p.okterUke} />}
            <div className="ph01-kun-telefon">{prikkNode}</div>
          </div>
          <div className="ph01-kun-mac">
            {nesteNode}
            {prikkNode}
          </div>
        </div>
      </div>
    </div>
  );
}
