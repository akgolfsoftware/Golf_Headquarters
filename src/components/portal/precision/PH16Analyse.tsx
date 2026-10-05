"use client";

/**
 * PH16Analyse — Analyse-hub i Precision Athletics (lys).
 * Samme tall og lenker som før: vindu, Broadie, SG-stolper, TrackMan-mini og «gå dypere».
 * Tegningsfilen ui_kits/playerhq/screens/PH-16.jsx ligger ikke i git.
 */

import Link from "next/link";
import type { TmHubData } from "@/lib/portal-analyse/tm-hub-data";
import {
  HOLE_MAP_VIEWBOX_MINI,
  HoleMapTargetLine,
  HoleMapTerrain,
  HoleMapTerrainStyle,
  HOLE_MAP_TARGET_MINI,
} from "@/components/trackman/HoleMap";
import "@/styles/precision-athletics.css";

function SgBar({ verdi }: { verdi: number | null }) {
  const cap = 1.3;
  const hMax = 52;
  if (verdi == null || !Number.isFinite(verdi) || verdi === 0) {
    return <div className="ph16-bar" aria-hidden><span className="ph16-bar-null" /></div>;
  }
  const px = Math.min(hMax, (Math.abs(verdi) / cap) * hMax);
  const positiv = verdi > 0;
  return (
    <div className="ph16-bar" aria-hidden>
      <span className="ph16-bar-null" />
      <span
        className={positiv ? "ph16-stolpe ph16-stolpe--opp" : "ph16-stolpe ph16-stolpe--ned"}
        style={positiv ? { bottom: 52, height: px } : { top: 53, height: px }}
      />
    </div>
  );
}

function VinduKort({ vindu }: { vindu: TmHubData["vindu"] }) {
  return (
    <section className="pa-card ph16-kort">
      <p className="ph16-kicker">I vindu i dag</p>
      {vindu ? (
        <p className="ph16-tall"><strong>{vindu.i}</strong><span>/ {vindu.av}</span></p>
      ) : (
        <p className="ph16-setning">Ingen vindu logget i dag.</p>
      )}
    </section>
  );
}

function CaddieKort({ data }: { data: TmHubData }) {
  return (
    <section className="pa-card ph16-kort">
      <p className="ph16-kicker">Caddie · Broadie</p>
      {data.lekkasje ? (
        <>
          <p className="ph16-setning">{data.lekkasje.setning}</p>
          <p className="ph16-meta">{data.lekkasje.meta}</p>
        </>
      ) : (
        <>
          <p className="ph16-setning">Ingen SG ennå</p>
          <p className="ph16-meta">Når du har runder med slag, viser vi lekkasjen her. TrackMan blandes aldri inn i dette tallet.</p>
        </>
      )}
    </section>
  );
}

function SgKort({ data }: { data: TmHubData }) {
  return (
    <section className="pa-card ph16-kort" aria-label="SG siste 5 runder">
      <p className="ph16-kicker">SG siste 5 runder</p>
      <div className="ph16-akser">
        {data.sgAkser.map((a) => (
          <div key={a.id}>
            <span className={a.verdi != null && a.verdi < 0 ? "ph16-sg ph16-sg--neg" : "ph16-sg"}>{a.tekst}</span>
            <SgBar verdi={a.verdi} />
            <p className="ph16-kicker">{a.etikett}</p>
          </div>
        ))}
      </div>
      {data.lekkasjeLinje && <p className="ph16-meta">{data.lekkasjeLinje}</p>}
    </section>
  );
}

function TrackManKort({ data }: { data: TmHubData }) {
  if (!data.trackman) {
    return (
      <section className="pa-card ph16-kort">
        <p className="ph16-kicker">TrackMan · automatisk</p>
        <p className="ph16-setning">Ingen økt ennå</p>
        <p className="ph16-meta">Last opp CSV eller HTML — spredningen lander her automatisk.</p>
      </section>
    );
  }
  const tm = data.trackman;
  return (
    <section className="pa-card ph16-kort">
      <div className="ph16-rad">
        <p className="ph16-kicker">TrackMan · automatisk · {tm.klubb}</p>
        <p className="ph16-meta">{tm.datoKort}</p>
      </div>
      <p className="ph16-setning">{tm.setning}</p>
      <p className="ph16-meta">{tm.meta}</p>
      <div className="tm-holemap-terrain ph16-kart">
        <HoleMapTerrainStyle />
        <svg viewBox={HOLE_MAP_VIEWBOX_MINI} role="img" aria-label="Hullkart med slag">
          <HoleMapTerrain variant={tm.variant} size="mini" />
          <HoleMapTargetLine variant={tm.variant} target={HOLE_MAP_TARGET_MINI[tm.variant]} size="mini" />
          {tm.ellipse && (
            <ellipse cx={tm.ellipse.cx} cy={tm.ellipse.cy} rx={tm.ellipse.rx} ry={tm.ellipse.ry} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
          )}
          {tm.punkter.map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r="3.5" fill="currentColor" />
              {p.siste && <circle cx={p.cx} cy={p.cy} r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />}
            </g>
          ))}
        </svg>
      </div>
      <div className="ph16-rad">
        <span className="ph16-meta">{tm.kpis}</span>
        <Link href={`/portal/analysere/trackman/${tm.sessionId}`}>Se full spredning</Link>
      </div>
    </section>
  );
}

function Dypere({ rader }: { rader: TmHubData["dypere"] }) {
  return (
    <nav className="ph16-dypere" aria-label="Gå dypere">
      <p className="ph16-kicker">Gå dypere</p>
      <div className="pa-card ph16-liste">
        {rader.map((r) => (
          <Link key={r.href} href={r.href}>
            <span>{r.tittel}</span>
            <small>{r.meta}</small>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function PH16Analyse({ data }: { data: TmHubData }) {
  const helTom =
    data.vindu == null &&
    data.lekkasje == null &&
    data.trackman == null &&
    data.sgAkser.every((a) => a.verdi == null || a.verdi === 0);
  if (helTom) {
    return (
      <div className="ph16">
        <p className="ph16-kicker">{data.dagLabel}</p>
        <h1>Analyse</h1>
        <section className="pa-card ph16-kort">
          <p className="ph16-meta">Ingen data ennå. SG kommer fra runder og tester.</p>
          <Link className="pa-btn pa-btn--primary ph16-full" href="/portal/coach">Be Anders hente SG</Link>
        </section>
      </div>
    );
  }
  return (
    <div className="ph16">
      <header className="ph16-hode">
        <div>
          <p className="ph16-kicker ph16-kun-mobil">{data.dagLabel}</p>
          <h1>Analyse</h1>
        </div>
        <p className="ph16-meta ph16-kun-desktop">{data.dagLabel}</p>
      </header>
      <div className="ph16-brett">
        <div className="ph16-kol">
          <p className="ph16-kicker ph16-kun-desktop">Broadie · SG</p>
          <VinduKort vindu={data.vindu} />
          <CaddieKort data={data} />
          <div className="ph16-kun-mobil"><TrackManKort data={data} /></div>
          <SgKort data={data} />
          <div className="ph16-kun-mobil"><Dypere rader={data.dypere} /></div>
        </div>
        <div className="ph16-kol ph16-kun-desktop">
          <p className="ph16-kicker">TrackMan</p>
          <TrackManKort data={data} />
          <Dypere rader={data.dypere} />
        </div>
      </div>
    </div>
  );
}
