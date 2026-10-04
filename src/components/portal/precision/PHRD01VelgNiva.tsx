"use client";

/**
 * PH-RD-01 Registrer runde: velg registreringsnivå — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-RD-1.jsx, etag 1790529794183611;
 * nivåtekstene fra ui_kits/_shared/data-rd.js).
 *
 * Tre nivåer: Rask score → scorekortet (RD-06), Import eller manuell SG → SG-skjemaet (RD-07),
 * Slag-for-slag → live-føringen (oppsettet i RD-02 bor i live-flyten).
 *
 * Bevisste avvik fra tegningen:
 *   - Kladden leses fra telefonen (localStorage) og vises bare når en kladd finnes og er forbi
 *     oppsettet. Teksten bruker bane, antall ført og dato fra kladden, ikke faste tall.
 *   - «Tom» vises når appen ikke har noen baner å velge blant. Handlingen «Velg bane»
 *     går til live-føringen, der oppsettet velger bane.
 *   - RD-06 og RD-07 er tegnet (PH-RD-2.jsx, PH-RD-06 til 09) men ikke portert: skjemaene bak Rask score
 *     og Import ligger ennå i det gamle RundeNyForm-skallet. Enheten er delvis levert (parkert).
 *   - Tom- og feiltekstene er skrevet slik at de ikke lover mer enn koden gjør (ingen «sendes når nettet er tilbake»).
 */
import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Flag, Info, ListOrdered, MapPin, RotateCw, Route, TriangleAlert, Upload, type LucideIcon } from "lucide-react";
import { Ikon, KnappLenke, Meta, Sidehode, StatusPille, TomTilstand, FeilTilstand } from "@/components/precision/pa";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { lesKladdCached, lesKladdServer, type RundeKladd } from "@/lib/runde-logg/draft";
import { useLokalDataEier } from "@/lib/offline-queue/eier-context";

export type Niva = "rask" | "import" | "slag";
export type PHRD01Kladd = { bane: string; ferdige: number; av: number; dato: string };

type NivaDef = {
  id: Niva; tittel: string; tekst: string; gir: string[]; ikke: string | null; kvalitet: string;
  icon: LucideIcon; iconName: string; href: string; dq: { tone: "ok" | "warn" | "info"; label: string };
};

// Tekstene er ordrett fra designets RD_DATA.levels.
const NIVAER: NivaDef[] = [
  { id: "rask", tittel: "Rask score", tekst: "Total eller score per hull. Putter, fairway og GIR valgfritt.",
    gir: ["Brutto score og til par", "Putter, FW og GIR hvis logget"], ikke: "Ingen beregnet SG", kvalitet: "Scorekortnivå",
    icon: ListOrdered, iconName: "list-ordered", href: "/portal/mal/runder/ny?flyt=scorekort", dq: { tone: "warn", label: "Tynt grunnlag" } },
  { id: "import", tittel: "Import eller manuell SG", tekst: "Lim inn eller last opp fra UpGame eller annen app, eller skriv inn SG.",
    gir: ["SG totalt og OTT/APP/ARG/PUTT", "Kilde og dato på hvert tall"], ikke: "SG er ikke beregnet av AK Golf", kvalitet: "Manuell / importert SG",
    icon: Upload, iconName: "upload", href: "/portal/mal/runder/ny?flyt=sg", dq: { tone: "info", label: "Manuelt lagt inn" } },
  { id: "slag", tittel: "Slag-for-slag", tekst: "Hvor ballen landet og hvor langt det er igjen, slag for slag.",
    gir: ["Beregnet SG per slag, hull og kategori", "Hullanalyse, dispersjon og putting i fot"], ikke: null, kvalitet: "Komplett slag-for-slag",
    icon: Route, iconName: "route", href: "/portal/runde/live", dq: { tone: "ok", label: "God dekning" } },
];

const CTA: Record<Niva, string> = { rask: "Til scorekort", import: "Til import", slag: "Til oppsett" };

const abonnerIngen = () => () => {};
const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

function tilKladdInfo(k: RundeKladd | null): PHRD01Kladd | null {
  if (!k || k.steg === "oppsett") return null;
  const dato = new Date(k.oppdatert);
  return {
    bane: k.oppsett.courseNavn.trim(),
    ferdige: k.hullData.filter((h) => h.slag.length > 0).length,
    av: k.oppsett.hullValg === "18" ? 18 : 9,
    dato: Number.isNaN(dato.getTime()) ? "—" : DATO.format(dato),
  };
}

/** Leser kladden fra telefonen. Sendes videre til visningen, som ikke kjenner localStorage. */
function useKladd(): PHRD01Kladd | null {
  const eierId = useLokalDataEier();
  const snapshot = useCallback(() => lesKladdCached(eierId), [eierId]);
  return tilKladdInfo(useSyncExternalStore(abonnerIngen, snapshot, lesKladdServer));
}

const CSS = `
.phrd01-nivaer{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;min-width:0}
.phrd01-handling{display:flex;gap:8px;flex-wrap:wrap;justify-content:stretch}
.phrd01-handling>*{flex:1 1 100%}
@media (min-width:1024px){.phrd01-nivaer{grid-template-columns:repeat(3,minmax(0,1fr))}.phrd01-handling{justify-content:flex-end}.phrd01-handling>*{flex:0 0 auto}}
.pa-root .phrd01-hode .pa-pagehead__title,.pa-root .phrd01-hode .pa-pagehead__sub{margin-top:8px}
.phrd01-info{background:var(--info-tint);border-color:transparent}
.phrd01-kort{all:unset;cursor:pointer;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:var(--radius);background:var(--surface-card);border:1px solid var(--border-hairline);min-width:0;min-height:44px}
.phrd01-kort[aria-checked="true"]{border-color:var(--border-ink);box-shadow:inset 0 0 0 1px var(--border-ink)}
`;

export function PHRD01VelgNiva({ tilstand = "data", kladd = null, uleste = 0, feilKode = "FEIL · RUNDE · RD-01" }: {
  tilstand?: "data" | "tom" | "feil"; kladd?: PHRD01Kladd | null; uleste?: number; feilKode?: string;
}) {
  const [valgt, setValgt] = useState<Niva>("slag");
  const gjeldende = NIVAER.find((n) => n.id === valgt) ?? NIVAER[2];

  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
    <div className="pa-side" style={{ maxWidth: 1100 }}>
      <style>{CSS}</style>
      <div className="phrd01-hode"><Sidehode kicker="Runde · Ny" title="Registrer runde" sub="Velg hvor mye du vil føre. Du kan alltid legge til mer etterpå." /></div>
      {tilstand === "feil" ? <FeilTilstand icon={TriangleAlert} title="Runden kunne ikke hentes"
          text="Noe gikk galt da siden skulle hentes. Prøv igjen om litt." code={feilKode}
          retry={<KnappLenke variant="secondary" icon={RotateCw} iconName="rotate-cw" href="/portal/mal/runder/ny">Prøv igjen</KnappLenke>} />
        : tilstand === "tom" ? <TomTilstand icon={Flag} title="Ingen baner registrert"
          text="Det finnes ingen baner i AK Golf ennå. Bane velges i oppsettet når du starter føringen."
          actions={<KnappLenke icon={MapPin} iconName="map-pin" href="/portal/runde/live">Velg bane</KnappLenke>} />
        : <>
          {kladd && <div role="status" className="pa-alert phrd01-info">
            <span style={{ color: "var(--info)", display: "inline-flex", marginTop: 1 }}><Ikon icon={Info} size={18} name="info" /></span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <span className="pa-alert__title">Kladd fra {kladd.dato}</span>
              <span>{kladd.bane ? `${kladd.bane}, ` : ""}{kladd.ferdige} av {kladd.av} hull ført. <Link href="/portal/runde/live" style={{ color: "inherit", textDecoration: "underline", whiteSpace: "nowrap" }}>Fortsett kladden</Link></span>
            </div>
          </div>}
          <div role="radiogroup" aria-label="Registreringsnivå" className="phrd01-nivaer">
            {NIVAER.map((n) => {
              const paa = n.id === valgt;
              return <button key={n.id} type="button" role="radio" aria-checked={paa} onClick={() => setValgt(n.id)} className="phrd01-kort">
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Ikon icon={n.icon} size={20} name={n.iconName} />
                  <span style={{ font: "var(--type-title-s)", color: "var(--text-primary)", flex: 1, minWidth: 0 }}>{n.tittel}</span>
                </span>
                <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{n.tekst}</span>
                <span className="kicker">Hva får du ut av dette?</span>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4, font: "var(--type-body-s)", color: "var(--text-primary)" }}>
                  {n.gir.map((g) => <li key={g}>{g}</li>)}
                  {n.ikke && <li style={{ color: "var(--text-muted)" }}>{n.ikke}</li>}
                </ul>
                <span style={{ marginTop: "auto", display: "flex" }}>
                  {n.dq.tone === "info"
                    ? <span className="pa-status" style={{ color: "var(--info)", background: "var(--info-tint)" }}><span className="pa-status__dot" />{n.dq.label}</span>
                    : <StatusPille tone={n.dq.tone}>{n.dq.label}</StatusPille>}
                </span>
                <Meta>{n.kvalitet.toUpperCase()}</Meta>
              </button>;
            })}
          </div>
          <div className="phrd01-handling">
            <KnappLenke variant="ghost" href="/portal/analysere">Avbryt</KnappLenke>
            <KnappLenke size="lg" iconRight={ArrowRight} href={gjeldende.href}>{CTA[gjeldende.id]}</KnappLenke>
          </div>
        </>}
    </div>
  </PlayerHQSkall>;
}

/** Sideversjonen: leser kladden fra telefonen. */
export function PHRD01MedKladd(props: { tilstand?: "data" | "tom" | "feil"; uleste?: number }) {
  const kladd = useKladd();
  return <PHRD01VelgNiva {...props} kladd={kladd} />;
}
