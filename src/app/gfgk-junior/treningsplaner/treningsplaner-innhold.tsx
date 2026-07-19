"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import {
  ARS_FASER,
  FASE_BADGE,
  FASE_FARGER,
  GRUPPER,
  GRUPPE_KEYS,
  KONTAKT,
  MANEDSPLAN,
  MANED_FASE,
  MANED_KORT,
  MANED_NAVN,
  OKTPLANER,
  PERIODE_NOKKEL,
  TRENINGSFASER,
  TRENINGSFASE_FARGER,
  TYPE_FARGER,
  UKE_NOTATER,
  type FaseNavn,
  type GruppeKey,
  type UkeOkt,
} from "../_data/gfgk-junior-data";

function osloMndIdx(): number {
  return (
    Number(
      new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", month: "numeric" }).format(
        new Date(),
      ),
    ) - 1
  );
}

// Hydreringstrygg «inneværende måned»: server-snapshot = 4 (mai, som i
// designet), klienten leser Oslo-måneden én gang etter hydrering.
const tomAbonnement = () => () => {};
let mndCache: number | null = null;
function klientMnd(): number {
  mndCache ??= osloMndIdx();
  return mndCache;
}

export function TreningsplanerInnhold({
  startGruppe,
  ukeplaner,
}: {
  startGruppe: GruppeKey;
  ukeplaner: Record<GruppeKey, UkeOkt[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [gKey, setGKey] = useState<GruppeKey>(startGruppe);
  const [hoverM, setHoverM] = useState<number | null>(null);
  const [valgtM, setValgtM] = useState<number | null>(null);
  const [apenFase, setApenFase] = useState<string | null>(null);
  // Standard-forhåndsvisning = inneværende måned (Oslo) — hydreringstrygt.
  const stdMnd = useSyncExternalStore(tomAbonnement, klientMnd, () => 4);

  function velgGruppe(k: GruppeKey) {
    setGKey(k);
    setApenFase(null);
    // Handoff: valgt gruppe speiles i URL (?g=U15) uten sidereload.
    router.replace(`${pathname}?g=${k}`, { scroll: false });
  }

  const g = GRUPPER[gKey];
  const previewIdx = hoverM ?? valgtM ?? stdMnd;
  const previewFase = MANED_FASE[previewIdx];
  const [previewTema, previewAktivitet] = MANEDSPLAN[gKey][previewIdx];
  const okter = ukeplaner[gKey];

  return (
    <div>
      {/* Hero + global gruppevelger */}
      <section className="text-white" style={{ background: "var(--ink)" }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-14 sm:px-7 sm:pt-16">
          <span
            className="text-[13px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--gfgk-gold)" }}
          >
            Junior & Elite – Golf Development Program
          </span>
          <h1
            className="mt-3 font-black uppercase leading-[0.98] text-white"
            style={{ fontSize: "clamp(38px, 6vw, 58px)" }}
          >
            Treningsplaner
          </h1>
          <p
            className="mt-4 max-w-[620px] text-[16px] leading-relaxed sm:text-lg"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Fra årsplan til den enkelte økten. Velg gruppe – hele siden oppdaterer seg etter
            alder og nivå.
          </p>
          <div className="flex flex-wrap gap-2 pb-8 pt-7" role="tablist" aria-label="Velg gruppe">
            {GRUPPE_KEYS.map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === gKey}
                onClick={() => velgGruppe(k)}
                className="cursor-pointer rounded-full px-4 py-2.5 text-[15px] font-bold transition-all sm:px-5"
                style={{
                  fontFamily: "var(--font-jr-sans)",
                  border: `1.5px solid ${k === gKey ? "var(--gfgk-white)" : "rgba(255,255,255,0.35)"}`,
                  background: k === gKey ? "var(--gfgk-white)" : "transparent",
                  color: k === gKey ? "var(--ink)" : "rgba(255,255,255,0.85)",
                }}
              >
                <span className="hidden sm:inline">
                  {k} · {GRUPPER[k].navn}
                </span>
                <span className="sm:hidden">{k}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline gap-x-7 gap-y-1.5 px-5 py-4 sm:px-7">
            <span className="text-xl font-bold text-white">{g.navn}</span>
            <span
              className="text-[13.5px]"
              style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.65)" }}
            >
              {g.alder} · {g.kat}
            </span>
            <span className="text-[14.5px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              {g.motto}
            </span>
            <Link
              href={`/gfgk-junior/gruppe/${gKey.toLowerCase()}`}
              className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-sm font-bold no-underline"
              style={{ color: "var(--gfgk-gold)" }}
            >
              Åpne gruppesiden
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* 01 Årsplan */}
      <section id="arsplan" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>01</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Årsplan</span>
        </div>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.06] sm:text-[38px]" style={{ color: "var(--ink)" }}>
          Treningsåret for {g.navn}
        </h2>
        <p className="mt-3.5 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Sesongen deles i fire perioder. Linjen under viser hele året måned for måned – fra
          evaluering om høsten til full turneringssesong.
        </p>

        <div
          className="mt-8 overflow-x-auto rounded-[var(--r-lg)] bg-white p-6 sm:p-7"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="grid min-w-[680px] grid-cols-12 gap-1" onMouseLeave={() => setHoverM(null)}>
            {MANED_FASE.map((fase, i) => (
              <button
                key={MANED_KORT[i]}
                onMouseEnter={() => setHoverM(i)}
                onFocus={() => setHoverM(i)}
                onClick={() => setValgtM(i)}
                className="flex cursor-pointer flex-col gap-2 border-none bg-transparent p-0"
                style={{ fontFamily: "var(--font-jr-sans)" }}
                aria-label={`${MANED_NAVN[i]} – ${fase}`}
              >
                <div
                  className="w-full rounded-full transition-all duration-150"
                  style={{
                    height: previewIdx === i ? 18 : 10,
                    background: FASE_FARGER[fase],
                    opacity: hoverM === null || hoverM === i ? 1 : 0.45,
                  }}
                />
                <span
                  className="w-full text-center text-xs transition-colors"
                  style={{
                    fontFamily: "var(--font-jr-mono)",
                    color: previewIdx === i ? "var(--ink)" : "var(--fg-3)",
                    fontWeight: previewIdx === i ? 700 : 400,
                  }}
                >
                  {MANED_KORT[i]}
                </span>
              </button>
            ))}
          </div>
          <div
            key={`${gKey}-${previewIdx}`}
            className="jr-fade-up mt-4 rounded-[var(--r-md)] px-5 py-4"
            style={{ background: "var(--n-50)", borderLeft: `4px solid ${FASE_FARGER[previewFase]}` }}
          >
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-base font-bold" style={{ color: "var(--ink)" }}>
                {MANED_NAVN[previewIdx]}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                style={{ color: FASE_BADGE[previewFase].fg, background: FASE_BADGE[previewFase].bg }}
              >
                {previewFase}
              </span>
            </div>
            <p className="mb-0 mt-1.5 text-[14.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
              {previewTema}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--fg-3)" }}>
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: FASE_FARGER[previewFase] }}
              />
              {previewAktivitet}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-5">
            {(Object.keys(FASE_FARGER) as FaseNavn[]).map((fase) => (
              <span key={fase} className="inline-flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: "var(--fg-2)" }}>
                <span className="h-3 w-3 rounded-[3px]" style={{ background: FASE_FARGER[fase] }} />
                {fase}
              </span>
            ))}
          </div>
        </div>

        <div key={gKey} className="jr-fade-up mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ARS_FASER[gKey].map((fase) => {
            const apen = apenFase === fase.navn;
            return (
              <div
                key={fase.navn}
                className="overflow-hidden rounded-[var(--r-md)] bg-white transition-shadow duration-200"
                style={{ boxShadow: apen ? "var(--shadow-lg)" : "var(--shadow-md)" }}
              >
                <div className="h-1.5" style={{ background: FASE_FARGER[fase.navn] }} />
                <button
                  onClick={() => setApenFase(apen ? null : fase.navn)}
                  aria-expanded={apen}
                  className="block w-full cursor-pointer border-none bg-transparent p-5 text-left sm:p-6"
                  style={{ fontFamily: "var(--font-jr-sans)" }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="m-0 text-[19px] font-bold" style={{ color: "var(--ink)" }}>
                      {fase.navn}
                    </h3>
                    <span className="text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}>
                      {fase.mnd}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[13px] tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>
                    {fase.timer}
                  </div>
                  <p className="mb-0 mt-2.5 text-[14.5px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
                    {fase.fokus}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold" style={{ color: "var(--teal-600)" }}>
                    {apen ? "Skjul nøkkelpunkter" : "Se nøkkel i perioden"}
                    <ChevronDown
                      className="h-3.5 w-3.5 transition-transform duration-200"
                      style={{ transform: apen ? "rotate(180deg)" : undefined }}
                      strokeWidth={2.5}
                    />
                  </span>
                </button>
                {apen ? (
                  <div className="jr-fade-up px-5 pb-5 sm:px-6">
                    <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--gold-700)" }}>
                      Nøkkel i perioden
                    </div>
                    {PERIODE_NOKKEL[fase.navn].map((punkt) => (
                      <div key={punkt} className="grid grid-cols-[14px_1fr] items-start gap-2 py-1.5">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ background: FASE_FARGER[fase.navn] }} />
                        <span className="text-[13.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                          {punkt}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 Periodisering */}
      <section id="periodisering" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>02</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Periodisering</span>
        </div>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.06] sm:text-[38px]" style={{ color: "var(--ink)" }}>
          Treningsfasene gjennom året
        </h2>
        <p className="mt-3.5 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Innenfor hver periode jobber vi i fem faser – fra å bygge nytt til å prestere når det
          gjelder. Fordelingen under gjelder {g.navn}.
        </p>
        <div className="mt-8 rounded-[var(--r-lg)] p-6 text-white sm:p-9" style={{ background: "var(--ink)" }}>
          <div key={gKey} className="jr-fade-up flex flex-col gap-4">
            {TRENINGSFASER[gKey].map((fase, i) => {
              const farge = TRENINGSFASE_FARGER[i % TRENINGSFASE_FARGER.length];
              return (
                <div key={fase.kode} className="grid grid-cols-[92px_1fr] items-start gap-3.5 sm:grid-cols-[130px_1fr]">
                  <div>
                    <div className="text-[14px] font-medium sm:text-[15px]" style={{ fontFamily: "var(--font-jr-mono)", color: farge }}>
                      {fase.kode}
                    </div>
                    <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {fase.navn}
                    </div>
                  </div>
                  <div>
                    <div className="relative h-5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="flex h-full items-center rounded-full transition-all duration-300" style={{ width: `${fase.pct}%`, background: farge }}>
                        {fase.pct > 15 ? (
                          <span className="ml-auto pr-2 text-[11px] font-bold tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}>
                            {fase.pct} %
                          </span>
                        ) : null}
                      </div>
                      {fase.pct <= 15 ? (
                        <span
                          className="absolute top-1/2 -translate-y-1/2 text-[11px] font-bold tabular-nums"
                          style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.7)", left: `calc(${fase.pct}% + 8px)` }}
                        >
                          {fase.pct} %
                        </span>
                      ) : null}
                    </div>
                    <p className="mb-0 mt-2 text-[13.5px] leading-normal" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {fase.tekst}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mb-0 mt-6 text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.5)" }}>
            Andel av treningstiden over hele året – {gKey} · {g.kat}
          </p>
        </div>
      </section>

      {/* 03 Månedsplan */}
      <section id="manedsplan" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>03</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Månedsplan</span>
        </div>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.06] sm:text-[38px]" style={{ color: "var(--ink)" }}>
          Måned for måned – {g.navn}
        </h2>
        <p className="mt-3.5 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Hver måned har et hovedtema og en nøkkelaktivitet. Detaljert plan sendes ut i Spond
          ved månedsstart.
        </p>
        <div key={gKey} className="jr-fade-up mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MANEDSPLAN[gKey].map(([tema, aktivitet], i) => {
            const fase = MANED_FASE[i];
            return (
              <div
                key={MANED_NAVN[i]}
                className="rounded-[var(--r-md)] bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: "var(--shadow-sm)", borderTop: `4px solid ${FASE_FARGER[fase]}` }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="m-0 text-[17px] font-bold" style={{ color: "var(--ink)" }}>
                    {MANED_NAVN[i]}
                  </h3>
                  <span
                    className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: FASE_BADGE[fase].fg, background: FASE_BADGE[fase].bg }}
                  >
                    {fase}
                  </span>
                </div>
                <p className="mb-0 mt-2 text-[14.5px] leading-normal" style={{ color: "var(--fg-2)" }}>
                  {tema}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--fg-3)" }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: FASE_FARGER[fase] }} />
                  {aktivitet}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04 Ukeplan */}
      <section id="ukeplan" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pt-20 sm:px-7">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>04</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Ukeplan</span>
        </div>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.06] sm:text-[38px]" style={{ color: "var(--ink)" }}>
          Den faste treningsuken
        </h2>
        <p className="mt-3.5 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Faste økter i utesesongen. I grunnperioden (nov–mar) flyttes øktene innendørs – egen
          plan i Spond.
        </p>
        <div key={gKey} className="jr-fade-up mt-8 overflow-hidden rounded-[var(--r-lg)] bg-white" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white sm:px-6" style={{ background: "var(--ink)" }}>
            <span className="text-[15px] font-bold">
              {g.navn} – {g.alder} – {okter.length} økter/uke
            </span>
            <span className="text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.6)" }}>
              {gKey} · {g.kat}
            </span>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-[110px_130px_110px_160px_1fr] gap-4 border-b px-6 py-3 text-[12.5px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--fg-3)", borderColor: "var(--n-100)" }}>
              <span>Dag</span><span>Tid</span><span>Type</span><span>Sted</span><span>Beskrivelse</span>
            </div>
            {okter.map((okt) => (
              <div key={okt.dag + okt.tid} className="grid grid-cols-[110px_130px_110px_160px_1fr] items-center gap-4 border-b px-6 py-4" style={{ borderColor: "var(--n-100)" }}>
                <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>{okt.dag}</span>
                <span className="text-sm tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}>{okt.tid}</span>
                <span className="w-fit rounded-full px-3 py-1 text-[12.5px] font-bold uppercase tracking-[0.04em]" style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}>{okt.type}</span>
                <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>{okt.sted}</span>
                <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>{okt.beskrivelse}</span>
              </div>
            ))}
          </div>
          <div className="md:hidden">
            {okter.map((okt) => (
              <div key={okt.dag + okt.tid} className="border-b px-5 py-4" style={{ borderColor: "var(--n-100)" }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>{okt.dag}</span>
                  <span className="text-sm tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--ink)" }}>{okt.tid}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.04em]" style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}>{okt.type}</span>
                  <span className="text-[13.5px] font-semibold" style={{ color: "var(--fg-3)" }}>{okt.sted}</span>
                </div>
                <p className="mb-0 mt-1.5 text-[14px] leading-snug" style={{ color: "var(--fg-2)" }}>{okt.beskrivelse}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-3.5 text-[13.5px] sm:px-6" style={{ background: "var(--n-50)", color: "var(--fg-3)" }}>
            {UKE_NOTATER[gKey]}
          </div>
        </div>
      </section>

      {/* 05 Øktplaner */}
      <section id="oktplaner" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pb-24 pt-20 sm:px-7">
        <div className="flex items-baseline gap-3.5">
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--fg-3)" }}>05</span>
          <span className="text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--teal-600)" }}>Øktplaner</span>
        </div>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.06] sm:text-[38px]" style={{ color: "var(--ink)" }}>
          Slik er øktene bygget opp
        </h2>
        <p className="mt-3.5 max-w-2xl text-[17px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
          Hver økt følger en fast struktur: oppvarming, hoveddel og avslutning. Innholdet
          varierer med fase og gruppe – dette er standardøktene for {g.navn}.
        </p>
        <div key={gKey} className="jr-fade-up mt-8 grid gap-5 lg:grid-cols-2">
          {OKTPLANER[gKey].map((okt) => (
            <div
              key={okt.tittel}
              className="flex flex-col overflow-hidden rounded-[var(--r-lg)] bg-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="flex items-center justify-between gap-2.5 px-5 py-4 text-white sm:px-6" style={{ background: "var(--ink)" }}>
                <div>
                  <div className="text-[17px] font-bold">{okt.tittel}</div>
                  <div className="mt-0.5 text-[12.5px]" style={{ fontFamily: "var(--font-jr-mono)", color: "rgba(255,255,255,0.6)" }}>
                    {okt.meta}
                  </div>
                </div>
                <span
                  className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.04em]"
                  style={{ color: TYPE_FARGER[okt.type].fg, background: TYPE_FARGER[okt.type].bg }}
                >
                  {okt.type}
                </span>
              </div>
              <div className="flex-1 px-5 pb-5 pt-2 sm:px-6">
                {okt.blokker.map((blokk) => (
                  <div key={blokk.min} className="grid grid-cols-[64px_1fr] items-start gap-3.5 border-b py-3" style={{ borderColor: "var(--n-100)" }}>
                    <span className="pt-px text-[13px] tabular-nums" style={{ fontFamily: "var(--font-jr-mono)", color: "var(--teal-600)" }}>
                      {blokk.min}
                    </span>
                    <div>
                      <div className="text-[14.5px] font-bold" style={{ color: "var(--ink)" }}>{blokk.del}</div>
                      <p className="mb-0 mt-0.5 text-[13.5px] leading-normal" style={{ color: "var(--fg-2)" }}>{blokk.innhold}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-2 px-5 pb-4 pt-3 text-[13px] font-semibold sm:px-6" style={{ background: "var(--gold-100)", color: "var(--gold-700)" }}>
                <span className="text-[11px] uppercase tracking-[0.08em]">Fokus</span>
                <span className="font-medium" style={{ color: "var(--ink)" }}>{okt.fokus}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-baseline gap-3.5 rounded-[var(--r-md)] bg-white px-6 py-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <span className="text-[15px] font-bold" style={{ color: "var(--ink)" }}>Spørsmål om planene?</span>
          <span className="text-[14.5px]" style={{ color: "var(--fg-2)" }}>
            Ta kontakt med trenerteamet –{" "}
            <a href={`mailto:${KONTAKT.epost}`} className="jr-link font-semibold">{KONTAKT.epost}</a>
          </span>
        </div>
      </section>
    </div>
  );
}
