"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import {
  FASE_FARGER,
  FASE_TEKST,
  GRUPPER,
  HENDELSER_FELLES,
  HENDELSER_GRUPPE,
  KONTAKT,
  MANED_FASE,
  MANED_NAVN,
  OKTPLANER,
  TYPE_FARGER,
  type GruppeKey,
  type Hendelse,
  type OktPlan,
  type UkeOkt,
} from "../../_data/gfgk-junior-data";

const DAG_NAVN = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

// «Nå» som Oslo-veggklokke, uavhengig av klientens/serverens tidssone
// (gotchas: Vercel kjører UTC — all dato-logikk må være Oslo-korrekt).
function osloNaa(): Date {
  const deler = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const f = (t: string) => Number(deler.find((p) => p.type === t)?.value ?? 0);
  return new Date(f("year"), f("month") - 1, f("day"), f("hour") === 24 ? 0 : f("hour"), f("minute"));
}

// Hydreringstrygt «nå»: server-snapshot er null (SSR/UTC), klienten leser
// Oslo-klokka én gang etter hydrering (cache — getSnapshot må være stabil).
const tomAbonnement = () => () => {};
let naaCache: Date | null = null;
function klientNaa(): Date {
  naaCache ??= osloNaa();
  return naaCache;
}

function iso(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function fmt(dt: Date): string {
  return `${dt.getDate()}. ${MND_KORT[dt.getMonth()]}`;
}

// Slutt-tidspunkt for en ukentlig økt på en gitt dato ("17:00–18:00" → Date)
function oktSlutt(okt: UkeOkt, dt: Date): Date {
  const slutt = okt.tid.slice(6, 11);
  const [h, m] = slutt.split(":").map(Number);
  const end = new Date(dt);
  end.setHours(Number.isFinite(h) ? h : 23, Number.isFinite(m) ? m : 59, 0, 0);
  return end;
}

export function GruppeplanInnhold({
  gKey,
  ukeplan,
  ekstraHendelser,
  autoSynk,
}: {
  gKey: GruppeKey;
  ukeplan: UkeOkt[];
  ekstraHendelser: Hendelse[]; // samlinger fra AgencyOS (DB), tomt ved fallback
  autoSynk: boolean;
}) {
  const g = GRUPPER[gKey];
  const naa = useSyncExternalStore(tomAbonnement, klientNaa, () => null);
  const [ym, setYm] = useState<[number, number] | null>(null);
  const [valgtDag, setValgtDag] = useState<string | null>(null);
  const [aapne, setAapne] = useState<Record<number, boolean>>({});
  const [visHistorikk, setVisHistorikk] = useState(false);

  const sessionByWd = new Map<number, OktPlan>(OKTPLANER[gKey].map((s) => [s.wd, s]));
  const hendelser = [...HENDELSER_FELLES, ...HENDELSER_GRUPPE[gKey], ...ekstraHendelser];
  const evByIso = new Map<string, { tittel: string; tekst: string }[]>();
  for (const [dato, tittel, tekst] of hendelser) {
    const liste = evByIso.get(dato) ?? [];
    liste.push({ tittel, tekst });
    evByIso.set(dato, liste);
  }

  // Fase nå + neste økt + kommende 7 dager (kun når klokka er kjent)
  const faseNaa = naa ? MANED_FASE[naa.getMonth()] : null;
  let neste: (UkeOkt & { dt: Date }) | null = null;
  const kommende: (UkeOkt & { dt: Date; okt: OktPlan | undefined })[] = [];
  if (naa) {
    for (let i = 0; i < 28 && !neste; i++) {
      const dt = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate() + i);
      const hit = ukeplan.find((w) => w.wd === dt.getDay());
      if (hit && oktSlutt(hit, dt) > naa) neste = { ...hit, dt };
    }
    for (let i = 0; i < 7; i++) {
      const dt = new Date(naa.getFullYear(), naa.getMonth(), naa.getDate() + i);
      const hit = ukeplan.find((w) => w.wd === dt.getDay());
      if (hit && oktSlutt(hit, dt) > naa) {
        kommende.push({ ...hit, dt, okt: sessionByWd.get(hit.wd) });
      }
    }
  }

  // Kalender
  const [cy, cm] = ym ?? (naa ? [naa.getFullYear(), naa.getMonth()] : [2026, 6]);
  const forste = new Date(cy, cm, 1);
  const startOffset = (forste.getDay() + 6) % 7;
  const dagerIMnd = new Date(cy, cm + 1, 0).getDate();
  const idagIso = naa ? iso(naa) : "";

  // Valgt dag-panel
  let selLabel = "Velg en dag";
  let selTittel = "Kalenderen er levende";
  let selTekst =
    "Trykk på en dag med prikk for å se hva som skjer – faste økter og arrangementer for gruppa.";
  let selItems: { tittel: string; meta: string; farge: string }[] = [];
  if (valgtDag) {
    const [y, m, d] = valgtDag.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    selLabel = `${DAG_NAVN[dt.getDay()]} ${d}. ${MANED_NAVN[m - 1].toLowerCase()}`;
    const w = ukeplan.find((x) => x.wd === dt.getDay());
    const evs = evByIso.get(valgtDag) ?? [];
    if (evs.length) {
      selTittel = evs[0].tittel;
      selTekst = evs[0].tekst;
      selItems = evs.slice(1).map((e) => ({ tittel: e.tittel, meta: e.tekst, farge: "var(--gfgk-gold)" }));
      if (w) selItems.push({ tittel: `Fast økt: ${w.beskrivelse}`, meta: `${w.tid} · ${w.sted}`, farge: TYPE_FARGER[w.type].dot });
    } else if (w) {
      const s = sessionByWd.get(w.wd);
      selTittel = s ? s.tittel : w.beskrivelse;
      selTekst = `${w.beskrivelse} – oppmøte ${w.sted} ti minutter før start.`;
      selItems = [{ tittel: w.tid, meta: `${w.sted} · ${w.type}`, farge: TYPE_FARGER[w.type].dot }];
    } else {
      selTittel = "Ingen fast trening";
      selTekst = "Fri dag – perfekt for egentrening på rangen eller korthullsbanen.";
      selItems = [];
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden text-white" style={{ background: "var(--ink)" }}>
        <div className="mx-auto grid max-w-[1100px] items-center gap-8 px-5 pb-12 pt-12 sm:px-7 sm:pt-14 md:grid-cols-[1.4fr_1fr] md:gap-10">
          <div className="jr-fade-up">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--gfgk-gold)" }}>
              Gruppeside · {gKey} · {g.kat}
            </span>
            <h1 className="mt-3 font-black uppercase leading-[0.98] text-white" style={{ fontSize: "clamp(36px, 6vw, 54px)" }}>
              {g.navn}
            </h1>
            <p className="mt-3.5 max-w-[460px] text-[16px] leading-relaxed sm:text-[17.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              {g.motto}. Her finner du gruppas faktiske treningsplan – økter, kalender og hva vi
              jobber med akkurat nå.
            </p>
            {faseNaa ? (
              <div
                className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full px-4 py-2"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <span className="h-[9px] w-[9px] rounded-full" style={{ background: FASE_FARGER[faseNaa] }} />
                <span className="text-sm font-bold">Nå: {faseNaa}</span>
                <span className="text-[13.5px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                  · {FASE_TEKST[faseNaa]}
                </span>
              </div>
            ) : null}
            <div
              className="mt-3 flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: autoSynk ? "var(--green-300)" : "var(--gfgk-gold)" }}
              />
              {autoSynk
                ? "Auto-synkronisert fra trenerteamets plan i AgencyOS"
                : "Foreløpig plan – datoer bekreftes før sesongstart"}
            </div>
          </div>
          <div
            className="rounded-[var(--r-lg)] p-6 sm:p-7"
            style={{ background: "var(--gfgk-gold)", color: "var(--ink)", boxShadow: "var(--shadow-gold)" }}
          >
            <div className="text-[12.5px] font-bold uppercase tracking-[0.12em]" style={{ opacity: 0.75 }}>
              Neste trening
            </div>
            {naa && neste ? (
              <>
                <div className="mt-2 text-[26px] font-black leading-tight sm:text-[30px]">
                  {DAG_NAVN[neste.dt.getDay()]} {fmt(neste.dt)}
                </div>
                <div className="mt-1.5 text-[15px] tabular-nums" style={{ fontFamily: "var(--font-jr-mono)" }}>
                  {neste.tid}
                </div>
                <div className="mt-2.5 text-[14.5px] font-semibold">
                  {neste.sted} · {neste.type}
                </div>
                <div className="mt-1 text-[13.5px]" style={{ opacity: 0.8 }}>
                  {neste.beskrivelse}
                </div>
              </>
            ) : (
              <div className="mt-2 text-[22px] font-black">Se kalenderen</div>
            )}
          </div>
        </div>
      </section>

      {/* 01 Kommende økter */}
      <section id="uken" className="mx-auto max-w-[1100px] scroll-mt-20 px-5 pt-16 sm:px-7 sm:pt-18">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>01</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Kommende økter</span>
        </div>
        <h2 className="mt-3 text-[26px] font-bold leading-[1.06] sm:text-[34px]" style={{ color: "var(--ink)" }}>
          {naa ? `Neste 7 dager – ${kommende.length} økter` : "Neste 7 dager"}
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Trykk på en økt for å se hele øktplanen minutt for minutt.
        </p>
        <div className="mt-6 flex flex-col gap-3.5">
          {naa && kommende.length === 0 ? (
            <div className="rounded-[var(--r-md)] bg-white px-6 py-5 text-[14.5px]" style={{ boxShadow: "var(--shadow-sm)", color: "var(--fg-2)" }}>
              Ingen faste økter de neste 7 dagene – se kalenderen for arrangementer.
            </div>
          ) : null}
          {kommende.map((o, idx) => {
            const apen = !!aapne[idx];
            return (
              <div
                key={iso(o.dt) + o.tid}
                className="jr-fade-up overflow-hidden rounded-[var(--r-md)] bg-white transition-shadow duration-200"
                style={{ boxShadow: apen ? "var(--shadow-lg)" : "var(--shadow-sm)" }}
              >
                <button
                  onClick={() => setAapne((a) => ({ ...a, [idx]: !a[idx] }))}
                  aria-expanded={apen}
                  className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-3 border-none bg-transparent px-5 py-4 text-left sm:grid-cols-[120px_120px_1fr_auto] sm:gap-4 sm:px-6"
                  style={{ fontFamily: "var(--font-jr-sans)" }}
                >
                  <span className="sm:contents">
                    <span className="block">
                      <span className="block text-[15.5px] font-bold" style={{ color: "var(--ink)" }}>
                        {DAG_NAVN[o.dt.getDay()]}
                      </span>
                      <span className="mt-0.5 block text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>
                        {fmt(o.dt)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm tabular-nums sm:mt-0" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}>
                      {o.tid}
                    </span>
                    <span className="mt-1.5 block sm:mt-0">
                      <span
                        className="mr-2.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.04em]"
                        style={{ color: TYPE_FARGER[o.type].fg, background: TYPE_FARGER[o.type].bg }}
                      >
                        {o.type}
                      </span>
                      <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>
                        {o.beskrivelse} · {o.sted}
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className="h-[18px] w-[18px] transition-transform duration-200"
                    style={{ color: "var(--teal-600)", transform: apen ? "rotate(180deg)" : undefined }}
                    strokeWidth={2.25}
                  />
                </button>
                {apen && o.okt ? (
                  <div className="jr-fade-up border-t px-5 pb-4 pt-2 sm:px-6" style={{ borderColor: "var(--n-100)" }}>
                    {o.okt.blokker.map((b) => (
                      <div
                        key={b.min}
                        className="grid grid-cols-[70px_1fr] items-baseline gap-3.5 border-b py-2.5 sm:grid-cols-[70px_180px_1fr]"
                        style={{ borderColor: "var(--n-50)" }}
                      >
                        <span className="text-[13px] tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}>
                          {b.min}
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                          {b.del}
                        </span>
                        <span className="col-span-2 text-[13.5px] leading-normal sm:col-span-1" style={{ color: "var(--fg-2)" }}>
                          {b.innhold}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 text-[13px] font-semibold" style={{ color: "var(--gold-700)" }}>
                      Fokus: <span className="font-medium" style={{ color: "var(--ink)" }}>{o.okt.fokus}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 Kalender */}
      <section id="kalender" className="mx-auto max-w-[1100px] scroll-mt-20 px-5 pt-16 sm:px-7 sm:pt-18">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>02</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Kalender</span>
        </div>
        <h2 className="mt-3 text-[26px] font-bold leading-[1.06] sm:text-[34px]" style={{ color: "var(--ink)" }}>
          Treningskalender – {g.navn}
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Trykk på en dag for detaljer. Prikker = faste økter, gull = arrangement.
        </p>
        {!autoSynk ? (
          <div
            className="mt-3.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold"
            style={{ background: "var(--gold-100)", border: "1px solid var(--gold-300)", color: "var(--gold-700)" }}
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-gold)" }} />
            Foreløpig plan – datoer for turneringer og arrangementer bekreftes før sesongstart
          </div>
        ) : null}
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[var(--r-lg)] bg-white p-5 sm:p-6" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setYm(cm === 0 ? [cy - 1, 11] : [cy, cm - 1]);
                  setValgtDag(null);
                }}
                aria-label="Forrige måned"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white transition-colors hover:bg-[var(--n-50)]"
                style={{ border: "1px solid var(--n-200)", color: "var(--ink)" }}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span key={`${cy}-${cm}`} className="jr-fade-up text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                {MANED_NAVN[cm]} {cy}
              </span>
              <button
                onClick={() => {
                  setYm(cm === 11 ? [cy + 1, 0] : [cy, cm + 1]);
                  setValgtDag(null);
                }}
                aria-label="Neste måned"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white transition-colors hover:bg-[var(--n-50)]"
                style={{ border: "1px solid var(--n-200)", color: "var(--ink)" }}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[11.5px] font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-3)" }}>
              <span>Ma</span><span>Ti</span><span>On</span><span>To</span><span>Fr</span><span>Lø</span><span>Sø</span>
            </div>
            <div key={`${cy}-${cm}-grid`} className="jr-fade-up grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <span key={`tom-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: dagerIMnd }).map((_, i) => {
                const dagNr = i + 1;
                const dt = new Date(cy, cm, dagNr);
                const dagIso = iso(dt);
                const w = ukeplan.find((x) => x.wd === dt.getDay());
                const evs = evByIso.get(dagIso) ?? [];
                const erIdag = dagIso === idagIso;
                const erValgt = valgtDag === dagIso;
                const erFortid = idagIso !== "" && dagIso < idagIso;
                const dempet = erFortid && !visHistorikk;
                return (
                  <button
                    key={dagIso}
                    onClick={() => !dempet && setValgtDag(dagIso)}
                    aria-label={`${dagNr}. ${MANED_NAVN[cm].toLowerCase()}`}
                    className="flex aspect-square flex-col items-center justify-center gap-[3px] rounded-[var(--r-sm)] p-0.5 transition-all duration-150"
                    style={{
                      cursor: dempet ? "default" : "pointer",
                      background: dempet
                        ? "transparent"
                        : erValgt || evs.length
                          ? "var(--gold-100)"
                          : w
                            ? "var(--n-50)"
                            : "transparent",
                      border: erValgt
                        ? "2px solid var(--gfgk-gold)"
                        : erIdag
                          ? "2px solid var(--gfgk-teal)"
                          : "1px solid transparent",
                    }}
                  >
                    <span
                      className="text-[13.5px] tabular-nums"
                      style={{
                        color: dempet ? "var(--n-300)" : "var(--ink)",
                        fontWeight: erIdag || erValgt ? 800 : w || evs.length ? 600 : 400,
                      }}
                    >
                      {dagNr}
                    </span>
                    <span className="flex h-1.5 gap-1">
                      {!dempet && w ? (
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: TYPE_FARGER[w.type].dot }} />
                      ) : null}
                      {!dempet && evs.length ? (
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gfgk-gold)" }} />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] font-semibold" style={{ color: "var(--fg-3)" }}>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-teal)" }} />Teknikk
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--green-500)" }} />Spill
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-red)" }} />Fysisk / lek
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--gfgk-gold)" }} />Arrangement
              </span>
              <button
                onClick={() => setVisHistorikk((v) => !v)}
                className="jr-link ml-auto cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-bold"
                style={{ fontFamily: "var(--font-jr-sans)" }}
              >
                {visHistorikk ? "Skjul tidligere økter" : "Vis tidligere økter"}
              </button>
            </div>
          </div>
          <div
            key={`${gKey}-${valgtDag}`}
            className="jr-fade-up min-h-[220px] rounded-[var(--r-lg)] p-6 text-white sm:p-7"
            style={{ background: "var(--ink)" }}
          >
            <div className="text-[12.5px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--gfgk-gold)" }}>
              {selLabel}
            </div>
            <h3 className="mt-2.5 text-[22px] font-bold text-white">{selTittel}</h3>
            <p className="mb-0 mt-2.5 text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {selTekst}
            </p>
            {selItems.map((it) => (
              <div
                key={it.tittel + it.meta}
                className="mt-3.5 rounded-[var(--r-sm)] px-4 py-3"
                style={{ background: "rgba(255,255,255,0.07)", borderLeft: `3px solid ${it.farge}` }}
              >
                <div className="text-[14.5px] font-bold">{it.tittel}</div>
                <div className="mt-0.5 text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.65)" }}>
                  {it.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 Øktplaner */}
      <section id="okter" className="mx-auto max-w-[1100px] scroll-mt-20 px-5 pb-24 pt-16 sm:px-7 sm:pt-18">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>03</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Øktplaner</span>
        </div>
        <h2 className="mt-3 text-[26px] font-bold leading-[1.06] sm:text-[34px]" style={{ color: "var(--ink)" }}>
          Standardøktene for {g.navn}
        </h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {OKTPLANER[gKey].map((okt) => (
            <div
              key={okt.tittel}
              className="flex flex-col overflow-hidden rounded-[var(--r-lg)] bg-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="flex items-center justify-between gap-2.5 px-5 py-4 text-white" style={{ background: "var(--ink)" }}>
                <div>
                  <div className="text-base font-bold">{okt.tittel}</div>
                  <div className="mt-0.5 text-xs" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.6)" }}>
                    {okt.meta}
                  </div>
                </div>
                <span
                  className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em]"
                  style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}
                >
                  {okt.type}
                </span>
              </div>
              <div className="flex-1 px-5 pb-4 pt-1.5">
                {okt.blokker.map((b) => (
                  <div key={b.min} className="grid grid-cols-[60px_1fr] items-start gap-3 border-b py-2.5" style={{ borderColor: "var(--n-100)" }}>
                    <span className="pt-px text-[12.5px] tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}>
                      {b.min}
                    </span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--ink)" }}>{b.del}</div>
                      <p className="mb-0 mt-0.5 text-[13px] leading-normal" style={{ color: "var(--fg-2)" }}>{b.innhold}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4 pt-3 text-[12.5px] font-semibold" style={{ background: "var(--gold-100)", color: "var(--gold-700)" }}>
                FOKUS <span className="ml-1.5 font-medium" style={{ color: "var(--ink)" }}>{okt.fokus}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-baseline gap-3.5 rounded-[var(--r-md)] bg-white px-6 py-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>Endringer og avlysninger</span>
          <span className="text-sm" style={{ color: "var(--fg-2)" }}>
            varsles alltid i gruppas Spond. Spørsmål?{" "}
            <a href={`mailto:${KONTAKT.epost}`} className="jr-link font-semibold">{KONTAKT.epost}</a>
          </span>
        </div>
      </section>
    </div>
  );
}
