"use client";

/**
 * PlayerHQ Booking — v2 (retning C «super effektiv og smooth»). Komponert 1:1
 * fra ui_kits/v2/booking.jsx → SpillerBooking (+ StegType/StegCoach/StegTid/
 * StegBekreft/StegIndikator/MiniKalender/TidKolonne/Kvittering), men med EKTE
 * data: tjenester (ServiceType), coacher og ledige tider (availability-engine).
 *
 * Flerstegs-flyt rett fra PlayerHQ: type → coach → dato/tid → bekreft →
 * kvittering. Steg-state klientside. Bytter spilleren tjeneste, re-hentes
 * slot-vinduet via server-action (varighet påvirker hvilke tider som får plass).
 *
 * Kun v2-komponenter fra "@/components/v2"; ingen ad-hoc UI. Ingen rå hex
 * (kun T.*-tokens + rgba/color-mix). V2Shell eier chrome-en; denne rendrer
 * innholds-stacken.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  AvatarInit,
  InnsiktChip,
  Knapp,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { hentSlotVindu, opprettBooking } from "@/app/portal/booking/actions";
import type { SlotVindu } from "@/lib/portal-booking/slot-vindu";

/* ── Datakontrakt (props) ──────────────────────────────────────────── */

export type BookingTjeneste = {
  id: string;
  slug: string;
  navn: string;
  varighetMin: number;
  prisOre: number;
  beskrivelse: string | null;
  stedNavn: string | null;
  /** priceOre === 0 → trekkes fra coaching-pakken (credit), ikke betaling. */
  betalesMedCredit: boolean;
};

export type BookingCoach = {
  id: string;
  navn: string;
  initialer: string;
  antallTjenester: number;
  fraPris: string | null;
};

export type BookingCredits = {
  tier: string;
  monthlyCredits: number;
  creditsRemaining: number;
  canUseCredits: boolean;
};

export type BookingV2Data = {
  tjenester: BookingTjeneste[];
  coacher: BookingCoach[];
  credits: BookingCredits;
  /** Slot-vindu for default-tjenesten (tjenester[0]). */
  vindu: SlotVindu;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NOK = new Intl.NumberFormat("nb-NO");
const UKEDAG_KORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MANED = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

/** «Fre 10. juli» (kort=true) eller «fredag 10. juli». */
function formatDato(iso: string, kort = true): string {
  const d = new Date(iso);
  const uke = UKEDAG_KORT[d.getDay()];
  const dag = kort ? `${uke[0].toUpperCase()}${uke.slice(1)}` : ukedagLang(d.getDay());
  return `${dag} ${d.getDate()}. ${MANED[d.getMonth()]}`;
}
function ukedagLang(dow: number): string {
  const lang = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  return lang[dow];
}

/** Sluttklokke fra start «HH:MM» + varighet i minutter. */
function sluttKl(kl: string, varighetMin: number): string {
  const [h, m] = kl.split(":").map(Number);
  const tot = h * 60 + m + varighetMin;
  const eh = Math.floor((tot % (24 * 60)) / 60);
  const em = tot % 60;
  return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
}

/** Ikon per tjeneste (Lucide via Icon). */
function ikonForTjeneste(t: BookingTjeneste): string {
  if (t.slug.includes("trackman") || t.slug.includes("analyse")) return "crosshair";
  if (t.betalesMedCredit) return "target";
  return "user";
}

/** Pris/credit-tekst for en tjeneste, avhengig av abonnement. */
function prisTekst(t: BookingTjeneste, credits: BookingCredits): string {
  if (t.betalesMedCredit) {
    return credits.canUseCredits
      ? `${credits.creditsRemaining} av ${credits.monthlyCredits} igjen`
      : "Med coaching-pakke";
  }
  return `fra ${NOK.format(Math.round(t.prisOre / 100))} kr`;
}

/** Coacher som faktisk har ledige tider i vinduet (kilde: availability). */
function coacherIVindu(vindu: SlotVindu): { id: string; navn: string }[] {
  const sett = new Map<string, string>();
  for (const d of vindu.dager) for (const t of d.tider) if (!sett.has(t.coachId)) sett.set(t.coachId, t.coachNavn);
  return Array.from(sett, ([id, navn]) => ({ id, navn }));
}

/** true på klient etter mount når viewport < 768px (styrer kun tetthet). */
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

/* ── Steg-indikator ────────────────────────────────────────────────── */

const STEG = [
  { n: 1, l: "Type" },
  { n: 2, l: "Coach" },
  { n: 3, l: "Dato og tid" },
  { n: 4, l: "Bekreft" },
];

function StegIndikator({ steg, onVelg, mobile }: { steg: number; onVelg: (n: number) => void; mobile: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: mobile ? 6 : 10 }}>
      {STEG.map((s, i) => {
        const ferdig = steg > s.n;
        const aktiv = steg === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: mobile ? 6 : 10, flex: i < STEG.length - 1 ? 1 : "none" }}>
            <button
              type="button"
              onClick={() => onVelg(s.n)}
              className="v2-focus"
              style={{ appearance: "none", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", flex: "none" }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", fontFamily: T.mono, fontSize: 10, fontWeight: 700, background: aktiv ? T.lime : ferdig ? "rgba(209,248,67,0.12)" : T.panel2, color: aktiv ? T.onLime : ferdig ? T.lime : T.mut, border: `1px solid ${aktiv ? "transparent" : ferdig ? "rgba(209,248,67,0.25)" : T.border}` }}>
                {ferdig ? <Icon name="check" size={11} /> : s.n}
              </span>
              {(!mobile || aktiv) && <span style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: aktiv ? T.fg : ferdig ? T.fg2 : T.mut, whiteSpace: "nowrap" }}>{s.l}</span>}
            </button>
            {i < STEG.length - 1 && <span style={{ flex: 1, maxWidth: mobile ? 18 : 36, height: 1, background: steg > s.n ? "rgba(209,248,67,0.3)" : T.border }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Steg 1 · Velg type ────────────────────────────────────────────── */

function StegType({ tjenester, credits, valgt, setValgt, mobile }: {
  tjenester: BookingTjeneste[];
  credits: BookingCredits;
  valgt: string;
  setValgt: (id: string) => void;
  mobile: boolean;
}) {
  const [hjelp, setHjelp] = useState(false);
  if (tjenester.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="target" title="Ingen tjenester tilgjengelig" sub="Ingen coaching-tjenester er aktive nå. Ta kontakt med AK Golf Academy." />
      </Kort>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)", gap: T.gap }}>
        {tjenester.map((x) => {
          const er = valgt === x.id;
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => setValgt(x.id)}
              className="v2-focus"
              style={{ appearance: "none", textAlign: "left", background: er ? `${T.tint}, ${T.panel}` : T.panel, border: `1px solid ${er ? "rgba(209,248,67,0.35)" : T.border}`, borderRadius: T.rCard, padding: "18px 20px", cursor: "pointer", position: "relative", display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 36, height: 36, borderRadius: 11, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={ikonForTjeneste(x)} size={16} style={{ color: er ? T.lime : T.fg2 }} />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {x.betalesMedCredit && (
                    <span
                      onClick={(e) => { e.stopPropagation(); setHjelp(!hjelp); }}
                      title="Hva er pakketime?"
                      style={{ width: 20, height: 20, borderRadius: 9999, border: `1px solid ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Icon name="help-circle" size={12} style={{ color: hjelp ? T.lime : T.mut }} />
                    </span>
                  )}
                  {er && <span style={{ width: 20, height: 20, borderRadius: 9999, background: T.lime, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={12} style={{ color: T.onLime }} /></span>}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg }}>{x.navn}</div>
                <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4, lineHeight: 1.5 }}>
                  {[`${x.varighetMin} min`, x.beskrivelse, x.stedNavn].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: er ? T.lime : T.fg }}>{prisTekst(x, credits)}</span>
            </button>
          );
        })}
      </div>
      {hjelp && (
        <InnsiktChip>
          Pakketime vs. enkelttime: en pakketime trekker én time fra coaching-pakken din (Performance eller Performance Pro) — du betaler ingenting nå. Enkelttimer betales per time. Har du pakke, er pakketimen alltid rimeligst.
        </InnsiktChip>
      )}
      {/* Kommer: digital coaching — statisk «kommer»-rad (ikke ekte data) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderRadius: T.rRow, border: `1px dashed ${T.border}`, opacity: 0.55 }}>
        <Icon name="message-circle" size={15} style={{ color: T.mut }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg2 }}>Digital coaching</span>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginLeft: 8 }}>videoanalyse og oppfølging hjemmefra</span>
        </div>
        <Caps size={8.5}>Kommer</Caps>
      </div>
    </div>
  );
}

/* ── Steg 2 · Velg coach ───────────────────────────────────────────── */

function StegCoach({ coacher, fraPris, nesteLedig, valgt, setValgt, mobile }: {
  coacher: { id: string; navn: string }[];
  fraPris: (id: string) => string | null;
  nesteLedig: (id: string) => string | null;
  valgt: string;
  setValgt: (id: string) => void;
  mobile: boolean;
}) {
  if (coacher.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="user" title="Ingen coach tilgjengelig" sub="Ingen coacher har ledige tider i perioden. Prøv en annen tjeneste." />
      </Kort>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {coacher.map((c) => {
        const er = valgt === c.id;
        const neste = nesteLedig(c.id);
        const pris = fraPris(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => setValgt(c.id)}
            className="v2-focus"
            style={{ appearance: "none", textAlign: "left", background: er ? `${T.tint}, ${T.panel}` : T.panel, border: `1px solid ${er ? "rgba(209,248,67,0.35)" : T.border}`, borderRadius: T.rCard, padding: "22px 24px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: 18, flexDirection: mobile ? "column" : "row" }}>
              <AvatarInit navn={c.navn} size={mobile ? 56 : 64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg }}>{c.navn}</span>
                  {neste && <StatusPill tone="up">Ledig snart</StatusPill>}
                </div>
                <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "8px 0 0" }}>
                  AK Golf Academy · coach.
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
                  {neste && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2 }}><Icon name="calendar" size={12} style={{ color: T.mut }} />Neste ledige: {neste}</span>}
                  {pris && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2 }}><Icon name="credit-card" size={12} style={{ color: T.mut }} />{pris}</span>}
                </div>
              </div>
              {er && <span style={{ width: 24, height: 24, borderRadius: 9999, background: T.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", alignSelf: mobile ? "flex-end" : "center" }}><Icon name="check" size={13} style={{ color: T.onLime }} /></span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Steg 3 · Dato + tid ───────────────────────────────────────────── */

function MiniKalender({ ledigeIso, valgtIso, setValgtIso, visMnd, visAar, setVis, mobile }: {
  ledigeIso: Set<string>;
  valgtIso: string | null;
  setValgtIso: (iso: string) => void;
  visMnd: number;
  visAar: number;
  setVis: (mnd: number, aar: number) => void;
  mobile: boolean;
}) {
  const celle = mobile ? 40 : 36;
  const iDag = new Date();
  iDag.setHours(0, 0, 0, 0);
  const forste = new Date(visAar, visMnd, 1);
  const blanke = (forste.getDay() + 6) % 7; // man-start
  const antDager = new Date(visAar, visMnd + 1, 0).getDate();
  const isoForDag = (n: number) => new Date(visAar, visMnd, n).toISOString();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, textTransform: "capitalize" }}>
          {MANED[visMnd]} <span style={{ color: T.mut, fontWeight: 500 }}>{visAar}</span>
        </span>
        <span style={{ display: "flex", gap: 4 }}>
          <button type="button" onClick={() => setVis(visMnd === 0 ? 11 : visMnd - 1, visMnd === 0 ? visAar - 1 : visAar)} className="v2-focus" style={{ appearance: "none", width: 26, height: 26, borderRadius: 8, background: "none", border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="chevron-left" size={13} style={{ color: T.mut }} /></button>
          <button type="button" onClick={() => setVis(visMnd === 11 ? 0 : visMnd + 1, visMnd === 11 ? visAar + 1 : visAar)} className="v2-focus" style={{ appearance: "none", width: 26, height: 26, borderRadius: 8, background: "none", border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Icon name="chevron-right" size={13} style={{ color: T.fg2 }} /></button>
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {["MA", "TI", "ON", "TO", "FR", "LØ", "SØ"].map((d) => (
          <span key={d} style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: T.mut, textAlign: "center", letterSpacing: "0.08em", paddingBottom: 6 }}>{d}</span>
        ))}
        {Array.from({ length: blanke }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: antDager }, (_, i) => {
          const n = i + 1;
          const iso = isoForDag(n);
          const denne = new Date(visAar, visMnd, n);
          denne.setHours(0, 0, 0, 0);
          const ledig = ledigeIso.has(iso);
          const valgt = valgtIso === iso;
          const iDagCelle = denne.getTime() === iDag.getTime();
          const passert = denne.getTime() < iDag.getTime();
          return (
            <button
              key={n}
              type="button"
              onClick={() => ledig && setValgtIso(iso)}
              disabled={!ledig}
              className={ledig ? "v2-focus" : undefined}
              style={{ appearance: "none", height: celle, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontFamily: T.mono, fontSize: 12, fontWeight: valgt ? 700 : 500, cursor: ledig ? "pointer" : "default", background: valgt ? T.fg : ledig ? T.panel3 : "transparent", color: valgt ? T.bg : passert ? "rgba(255,255,255,0.18)" : ledig ? T.fg : T.mut, border: iDagCelle && !valgt ? `1px solid ${T.borderS}` : "1px solid transparent" }}
            >
              {n}
              {ledig && !valgt && <span style={{ width: 3, height: 3, borderRadius: 9999, background: T.lime }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TidKolonne({ dato, tider, valgt, setValgt }: {
  dato: string | null;
  tider: string[];
  valgt: string | null;
  setValgt: (kl: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>
        <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>
          {dato ? formatDato(dato) : "Velg dag"}
        </span>
        <Caps size={8.5}>{tider.length} ledige</Caps>
      </div>
      {tider.length === 0 ? (
        <TomTilstand icon="clock" title="Ingen ledige tider" sub={dato ? "Prøv en annen dag." : "Velg en dag i kalenderen."} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {tider.map((kl) => {
            const er = valgt === kl;
            return (
              <button
                key={kl}
                type="button"
                onClick={() => setValgt(kl)}
                className="v2-focus"
                style={{ appearance: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, padding: "10px 0", borderRadius: 10, cursor: "pointer", background: er ? T.lime : T.panel2, color: er ? T.onLime : T.fg, border: `1px solid ${er ? "transparent" : T.border}` }}
              >
                {kl}{er && <Icon name="check" size={12} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OppsummeringsRader({ tjeneste, coachNavn, kompakt }: { tjeneste: BookingTjeneste; coachNavn: string; kompakt?: boolean }) {
  const rader = [
    { i: "user", l: `${coachNavn} · coach` },
    { i: "clock", l: `${tjeneste.varighetMin} min` },
    { i: "map-pin", l: tjeneste.stedNavn ?? "AK Golf Academy" },
  ];
  return (
    <div>
      {!kompakt && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <AvatarInit navn={coachNavn} size={38} />
          <div>
            <Caps size={8.5}>AK Golf Academy</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 3 }}>{tjeneste.navn}</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rader.map((r, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
            <Icon name={r.i} size={13} style={{ color: T.mut }} />{r.l}
          </span>
        ))}
      </div>
    </div>
  );
}

function StegTid({ tjeneste, coachNavn, laster, ledigeIso, valgtIso, setValgtIso, tider, valgtTid, setValgtTid, visMnd, visAar, setVis, credits, mobile }: {
  tjeneste: BookingTjeneste;
  coachNavn: string;
  laster: boolean;
  ledigeIso: Set<string>;
  valgtIso: string | null;
  setValgtIso: (iso: string) => void;
  tider: string[];
  valgtTid: string | null;
  setValgtTid: (kl: string) => void;
  visMnd: number;
  visAar: number;
  setVis: (mnd: number, aar: number) => void;
  credits: BookingCredits;
  mobile: boolean;
}) {
  const kal = <MiniKalender ledigeIso={ledigeIso} valgtIso={valgtIso} setValgtIso={setValgtIso} visMnd={visMnd} visAar={visAar} setVis={setVis} mobile={mobile} />;
  const kol = <TidKolonne dato={valgtIso} tider={tider} valgt={valgtTid} setValgt={setValgtTid} />;

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Kort pad="14px 16px">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AvatarInit navn={coachNavn} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{tjeneste.navn}</div>
              <div style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, marginTop: 2 }}>{coachNavn} · {tjeneste.varighetMin} min</div>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{prisTekst(tjeneste, credits)}</span>
          </div>
        </Kort>
        {laster ? <Kort><TomTilstand icon="clock" title="Henter ledige tider…" sub="Ett øyeblikk." /></Kort> : <><Kort>{kal}</Kort><Kort>{kol}</Kort></>}
      </div>
    );
  }
  if (laster) {
    return <Kort><TomTilstand icon="clock" title="Henter ledige tider…" sub="Ett øyeblikk." /></Kort>;
  }
  return (
    <Kort pad="0">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 220px" }}>
        <div style={{ padding: "20px 22px", borderRight: `1px solid ${T.border}` }}>
          <OppsummeringsRader tjeneste={tjeneste} coachNavn={coachNavn} />
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg, marginTop: 9 }}>
            <Icon name="credit-card" size={13} style={{ color: T.mut }} />{prisTekst(tjeneste, credits)}
          </span>
        </div>
        <div style={{ padding: "20px 24px", borderRight: `1px solid ${T.border}` }}>{kal}</div>
        <div style={{ padding: "20px 18px" }}>{kol}</div>
      </div>
    </Kort>
  );
}

/* ── Steg 4 · Bekreft ──────────────────────────────────────────────── */

function StegBekreft({ tjeneste, coachNavn, dato, tid, credits, onBook, laster, feil, mobile }: {
  tjeneste: BookingTjeneste;
  coachNavn: string;
  dato: string | null;
  tid: string | null;
  credits: BookingCredits;
  onBook: () => void;
  laster: boolean;
  feil: string | null;
  mobile: boolean;
}) {
  const pakke = tjeneste.betalesMedCredit;
  const klar = !!dato && !!tid;
  const sluttTid = tid ? sluttKl(tid, tjeneste.varighetMin) : null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 2fr", gap: T.gap }}>
      <Kort tint eyebrow="Oppsummering">
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 18 : 21, color: T.fg, lineHeight: 1.25 }}>
          {tjeneste.navn}{dato && <> <em style={{ fontStyle: "italic", color: T.lime }}>{formatDato(dato)}</em></>}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg2, marginTop: 8 }}>
          {klar ? `${tid}–${sluttTid} · ${tjeneste.varighetMin} min` : `${tjeneste.varighetMin} min · velg tid over`}
        </div>
        <div style={{ marginTop: 16 }}><OppsummeringsRader tjeneste={tjeneste} coachNavn={coachNavn} kompakt /></div>
      </Kort>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Kort eyebrow="Betaling">
          <Rad
            leading={<span style={{ width: 34, height: 34, borderRadius: 10, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={pakke ? "target" : "credit-card"} size={15} style={{ color: T.fg2 }} /></span>}
            title={pakke ? "Coaching-pakke" : "Betaling per time"}
            sub={pakke ? (credits.canUseCredits ? `Trekker 1 av ${credits.creditsRemaining} gjenstående timer — 0 kr nå` : "Krever aktiv coaching-pakke") : "Belastes etter timen"}
            trailing={null}
            last
          />
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <Caps size={9}>Å betale</Caps>
            <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg }}>
              {pakke ? "0 kr" : `${NOK.format(Math.round(tjeneste.prisOre / 100))} kr`}
            </span>
          </div>
        </Kort>
        {feil && feil !== "KREVER_BETALING" && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: `color-mix(in srgb,${T.down} 10%,transparent)`, border: `1px solid ${T.down}` }}>
            <Icon name="alert-triangle" size={13} style={{ color: T.down, flex: "none", marginTop: 1 }} />
            <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{feil}</span>
          </div>
        )}
        {feil === "KREVER_BETALING" && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
            <Icon name="credit-card" size={13} style={{ color: T.warn, flex: "none", marginTop: 1 }} />
            <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>
              Booking krever coaching-pakke eller betaling — kontakt coach, eller{" "}
              <Link href="/portal/meg/abonnement" style={{ color: T.lime, fontWeight: 600 }}>se abonnement →</Link>
            </span>
          </div>
        )}
        <Knapp icon="check" full onClick={onBook} disabled={!klar || laster}>{laster ? "Booker …" : "Book time"}</Knapp>
        <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, textAlign: "center", margin: 0, lineHeight: 1.5 }}>
          Gratis avbestilling inntil 24 timer før. Bekreftes umiddelbart når du har coaching-pakke med ledige timer.
        </p>
      </div>
    </div>
  );
}

/* ── Kvittering ────────────────────────────────────────────────────── */

function Kvittering({ tjeneste, coachNavn, dato, tid, bookingId, mobile }: {
  tjeneste: BookingTjeneste;
  coachNavn: string;
  dato: string | null;
  tid: string | null;
  bookingId: string;
  mobile: boolean;
}) {
  const sluttTid = tid ? sluttKl(tid, tjeneste.varighetMin) : null;
  return (
    <Kort tint pad={mobile ? "28px 20px" : "40px 24px"}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
        <span style={{ width: 56, height: 56, borderRadius: 9999, background: T.lime, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 10px rgba(209,248,67,0.10)" }}>
          <Icon name="check" size={26} style={{ color: T.onLime }} />
        </span>
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 22 : 26, color: T.fg, letterSpacing: "-0.02em" }}>Timen er booket</div>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "8px 0 0", lineHeight: 1.6 }}>
            {tjeneste.navn} med {coachNavn}<br />
            {dato && tid && <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>{formatDato(dato)} · {tid}–{sluttTid}</span>}
            {tjeneste.stedNavn && <> · {tjeneste.stedNavn}</>}
          </p>
        </div>
        <StatusPill tone="up">Bekreftet</StatusPill>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>Booking-id {bookingId.slice(0, 8)}</span>
      </div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function BookingV2({ data }: { data: BookingV2Data }) {
  const mobile = useMobile();
  const { tjenester, coacher, credits } = data;

  const [steg, setSteg] = useState(1);
  const [valgtType, setValgtType] = useState(tjenester[0]?.id ?? "");
  const [valgtCoach, setValgtCoach] = useState("");
  const [valgtIso, setValgtIso] = useState<string | null>(null);
  const [valgtTid, setValgtTid] = useState<string | null>(null);

  // Booking-innsending — ekte server-action, ingen simulert bekreftelse.
  const [bookLaster, setBookLaster] = useState(false);
  const [bookFeil, setBookFeil] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Slot-vindu per tjeneste (cache klientside). Init med server-vinduet.
  const [vinduCache, setVinduCache] = useState<Record<string, SlotVindu>>({ [data.vindu.tjenesteId]: data.vindu });

  const aktivtVindu: SlotVindu | undefined = vinduCache[valgtType];

  // Laster = valgt tjeneste mangler i cache (utledet, ingen egen state).
  const laster = !!valgtType && !aktivtVindu;

  // Hent vindu for valgt tjeneste når det mangler i cache.
  useEffect(() => {
    if (!valgtType || vinduCache[valgtType]) return;
    let avbrutt = false;
    hentSlotVindu(valgtType)
      .then((v) => { if (!avbrutt) setVinduCache((c) => ({ ...c, [valgtType]: v })); })
      .catch(() => { if (!avbrutt) setVinduCache((c) => ({ ...c, [valgtType]: { tjenesteId: valgtType, dager: [] } })); });
    return () => { avbrutt = true; };
  }, [valgtType, vinduCache]);

  // Kalender-måned: styrt av første ledige dag i aktivt vindu.
  const [vis, setVisState] = useState<{ mnd: number; aar: number }>(() => {
    const d = new Date();
    return { mnd: d.getMonth(), aar: d.getFullYear() };
  });
  const setVis = (mnd: number, aar: number) => setVisState({ mnd, aar });

  // Coacher som faktisk har tider i aktivt vindu.
  const vinduCoacher = aktivtVindu ? coacherIVindu(aktivtVindu) : [];

  // Nullstill avhengige valg når aktivt vindu endres — utført under render
  // (Reacts anbefalte mønster for å synkronisere state mot en endret verdi).
  const [synketVinduId, setSynketVinduId] = useState<string | null>(null);
  if (aktivtVindu && aktivtVindu.tjenesteId !== synketVinduId) {
    setSynketVinduId(aktivtVindu.tjenesteId);
    const cs = coacherIVindu(aktivtVindu);
    setValgtCoach((cur) => (cur && cs.some((c) => c.id === cur) ? cur : cs[0]?.id ?? ""));
    setValgtIso(null);
    setValgtTid(null);
    if (aktivtVindu.dager[0]) {
      const d = new Date(aktivtVindu.dager[0].datoIso);
      setVisState({ mnd: d.getMonth(), aar: d.getFullYear() });
    }
  }

  const tjeneste = tjenester.find((t) => t.id === valgtType) ?? tjenester[0];

  // Ledige dager/tider for VALGT coach.
  const ledigeIso = new Set<string>();
  let tider: string[] = [];
  if (aktivtVindu) {
    for (const dag of aktivtVindu.dager) {
      const forCoach = dag.tider.filter((t) => t.coachId === valgtCoach);
      if (forCoach.length > 0) ledigeIso.add(dag.datoIso);
      if (dag.datoIso === valgtIso) tider = forCoach.map((t) => t.kl);
    }
  }

  const coachNavn = vinduCoacher.find((c) => c.id === valgtCoach)?.navn ?? "coach";
  const fraPris = (id: string) => coacher.find((c) => c.id === id)?.fraPris ?? null;
  const nesteLedig = (id: string): string | null => {
    if (!aktivtVindu) return null;
    for (const dag of aktivtVindu.dager) {
      const forCoach = dag.tider.filter((t) => t.coachId === id);
      if (forCoach.length > 0) return `${formatDato(dag.datoIso)} · ${forCoach[0].kl}`;
    }
    return null;
  };

  const kvittert = steg === 5 && !!bookingId;
  const nesteSperret = (steg === 3 && (!valgtIso || !valgtTid)) || (steg === 2 && !valgtCoach);

  /** Faktisk booking-innsending — ingen simulert kvittering. */
  async function handleBook() {
    if (!tjeneste || !valgtCoach || !valgtIso || !valgtTid || bookLaster) return;
    setBookLaster(true);
    setBookFeil(null);
    const res = await opprettBooking({
      serviceTypeId: tjeneste.id,
      coachId: valgtCoach,
      datoIso: valgtIso,
      kl: valgtTid,
    });
    setBookLaster(false);
    if (res.ok) {
      setBookingId(res.bookingId);
      setSteg(5);
    } else {
      setBookFeil(res.grunn);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>Booking · AK Golf Academy</Caps>
          <div style={{ marginTop: 10 }}><Tittel mobile={mobile} em="coachtime.">Book</Tittel></div>
        </div>
        {!kvittert && !mobile && <Caps size={9}>Steg {steg} av 4</Caps>}
      </div>

      {!kvittert && <StegIndikator steg={steg} onVelg={setSteg} mobile={mobile} />}

      {!kvittert && !tjeneste && (
        <Kort><TomTilstand icon="target" title="Ingen tjenester tilgjengelig" sub="Ingen coaching-tjenester er aktive nå." /></Kort>
      )}

      {tjeneste && (
        <>
          {steg === 1 && <StegType tjenester={tjenester} credits={credits} valgt={valgtType} setValgt={setValgtType} mobile={mobile} />}
          {steg === 2 && <StegCoach coacher={vinduCoacher} fraPris={fraPris} nesteLedig={nesteLedig} valgt={valgtCoach} setValgt={setValgtCoach} mobile={mobile} />}
          {steg === 3 && <StegTid tjeneste={tjeneste} coachNavn={coachNavn} laster={laster} ledigeIso={ledigeIso} valgtIso={valgtIso} setValgtIso={setValgtIso} tider={tider} valgtTid={valgtTid} setValgtTid={setValgtTid} visMnd={vis.mnd} visAar={vis.aar} setVis={setVis} credits={credits} mobile={mobile} />}
          {steg === 4 && <StegBekreft tjeneste={tjeneste} coachNavn={coachNavn} dato={valgtIso} tid={valgtTid} credits={credits} onBook={handleBook} laster={bookLaster} feil={bookFeil} mobile={mobile} />}
          {kvittert && bookingId && <Kvittering tjeneste={tjeneste} coachNavn={coachNavn} dato={valgtIso} tid={valgtTid} bookingId={bookingId} mobile={mobile} />}
        </>
      )}

      {!kvittert && tjeneste && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <Knapp ghost icon="arrow-left" onClick={() => setSteg(Math.max(1, steg - 1))} disabled={steg === 1}>Tilbake</Knapp>
          {steg < 4 && <Knapp icon="arrow-right" onClick={() => setSteg(steg + 1)} disabled={nesteSperret}>Neste</Knapp>}
        </div>
      )}
    </div>
  );
}
