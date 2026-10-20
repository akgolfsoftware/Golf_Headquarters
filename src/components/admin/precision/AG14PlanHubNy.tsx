"use client";

/**
 * AG-14 Maler og øvelser i nytt design (designbrevet 13.10.2026, pakke 4).
 * Fasit: docs/design-system/utkast-agencyos/workbench.html, skjerm «AG-14 Maler og øvelser».
 * Rute: /admin/plan. Stil: src/styles/agencyos-ny-workbench.css.
 *
 * Samme data som før (hentPlanhub): ukemaler, program og standardøkter under
 * «Maler», øvelsesbanken under «Øvelser», og «Egen øvelse» åpner øvelsesarket
 * (AG14Ovelseark, de åtte trinnene, lagrer i Øvelsesbanken). Lenkene til
 * mal-detalj, redigering, ny mal og utrulling er med. «Hele øvelsesbanken»
 * fører til /admin/ovelser.
 *
 * Bølge 2 (20.10.2026, canvas «Plan-hub»): fire faner (Ukemaler · Program · Standardøkter · Øvelser), «Ny mal» som
 * eneste primærhandling i sidehodet og «Egen øvelse» i Øvelser-fanen.
 *
 * Avvik:
 *   - «Egen øvelse» er et ark med de åtte trinnene, ikke et innfelt skjema:
 *     skjemaet med AK-formel, områder per pyramide og mengde finnes alt i
 *     AG14Ovelseark og lagrer det samme.
 *   - Uke-linja (spillere, økter, udekket) og «Åpne uka i Workbench» er beholdt
 *     fra dagens Plan-hub over fanene, så inngangen ikke forsvinner.
 *   - Kilden på en øvelse («AK Golf», «Anders») finnes ikke i dataene; vises ikke.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { Pille } from "@/components/admin/agencyos-ny/ny";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { formelForOvelse, mengdeForOvelse, metaForOvelse } from "@/lib/agencyos/planhub-ovelse";
import type { PlanhubData, PlanhubFane, PlanhubMal, PlanhubOvelse } from "@/lib/agencyos/planhub-typer";
import type { PyramideKode } from "@/lib/domain/ak-formel-v2";
import { AG14Ovelseark } from "./AG14Ovelseark";
import "@/styles/agencyos-ny-workbench.css";

const AKSER: PyramideKode[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const AKSE_FARGE: Record<PyramideKode, string> = { FYS: "var(--fys-ink)", TEK: "var(--tek-ink)", SLAG: "var(--slag)", SPILL: "var(--spill-ink)", TURN: "var(--turn)" };
const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
const timer = (min: number) => formaterTall(min / 60, 1, true);

function Stablet({ m }: { m: PlanhubMal }) {
  const kilde = m.minutter.length > 0 ? m.minutter : m.fordeling;
  const sum = kilde.reduce((a, x) => a + x.verdi, 0);
  if (sum === 0) return <span className="kilde">Ingen fordeling lagt inn</span>;
  return <div className="stablet" role="img" aria-label={`Fordeling: ${kilde.map((x) => `${x.akse} ${Math.round((x.verdi / sum) * 100)} %`).join(", ")}`}>
    {kilde.map((x) => <i key={x.akse} style={{ width: `${(x.verdi / sum) * 100}%`, background: AKSE_FARGE[x.akse] }} />)}
  </div>;
}

function MalKort({ m, type }: { m: PlanhubMal; type: "Ukemal" | "Program" }) {
  const totalMin = m.minutter.reduce((a, x) => a + x.verdi, 0);
  return <div className="mal-kort">
    <div className="sek-topp" style={{ gap: 6 }}><b>{m.navn}</b><Pille tone={m.godkjent ? "ok" : "noy"}>{m.godkjent ? "Godkjent" : "Utkast"}</Pille></div>
    <span className="kilde">{type} · kategori {m.kategori} · {LPHASE_LABEL[m.fase]}{type === "Program" ? ` · ${m.varighetUker} uker · ${m.ukentligOktAntall} økter/uke` : ` · ${pl(m.oktAntall, "økt", "økter")}${totalMin > 0 ? ` · ${timer(totalMin)} t` : ""}`}</span>
    <Stablet m={m} />
    <span className="kilde">Brukt {m.usageCount} {m.usageCount === 1 ? "gang" : "ganger"}{m.effektAntall > 0 && m.effektAvg != null ? ` · SG-total ${formaterFortegn(m.effektAvg, 2)} etter ${pl(m.effektAntall, "fullført plan", "fullførte planer")}` : ""}</span>
    {m.beskrivelse && <p className="forklar">{m.beskrivelse}</p>}
    <div className="knapper">
      <Link className="knapp sek" href={`/admin/plan-templates/${m.id}`}>Åpne</Link>
      <Link className="knapp spok" href={`/admin/plan-templates/${m.id}/rediger`}>Rediger</Link>
      {m.godkjent && <Link className="knapp spok" href="/admin/grupper">Rull ut</Link>}
    </div>
  </div>;
}

const FANE_NAVN: Record<PlanhubFane, string> = { ukemaler: "Ukemaler", program: "Program", standardokter: "Standardøkter", ovelser: "Øvelser" };

export function AG14PlanHubNy({ data, startFane = "ukemaler" }: { data: PlanhubData; startFane?: PlanhubFane }) {
  const router = useRouter();
  const [fane, setFane] = useState<PlanhubFane>(startFane);
  const [akse, setAkse] = useState<PyramideKode>("SLAG");
  const [ark, setArk] = useState<{ ovelse: PlanhubOvelse | null } | null>(null);
  const [lagret, setLagret] = useState<{ tittel: string; kode: string } | null>(null);
  const antall: Record<PlanhubFane, number> = { ukemaler: data.ukemaler.length, program: data.program.length, standardokter: data.standardokter.length, ovelser: data.ovelserTotalt };
  const ovelser = useMemo(() => data.ovelser.filter((o) => o.pyramide === akse), [data.ovelser, akse]);
  const velgFane = (f: PlanhubFane) => { setFane(f); router.replace(`/admin/plan?fane=${f}`, { scroll: false }); };
  const nyOvelse = () => { setLagret(null); setArk({ ovelse: null }); };
  const u = data.uke;

  return <div className="agn-s">
    <div className="topp">
      <Link href="/admin/agencyos" className="ag-tilbake"><ChevronRight className="ikon" aria-hidden style={{ transform: "rotate(180deg)" }} />Cockpit</Link>
      <div className="topp-rad">
        <div><div className="dato">Workbench · maler og øvelser</div><h1 className="tittel">Plan-hub</h1><p className="ingress">Ukemaler, program og standardøkter, så det går raskere å lage nye planer. Øvelsene bor i øvelsesbanken.</p></div>
        <div className="knapper"><Link className="knapp sek" href={data.workbenchHref}>Åpne uka i Workbench</Link><Link className="knapp pri" href="/admin/plan-templates/ny"><Plus className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Ny mal</Link></div>
      </div>
      <p className="kilde">Uke {u.nr}: {pl(u.spillere, "spiller", "spillere")} · {pl(u.okter, "økt", "økter")} · {u.udekket} uten økt i uka.</p>
    </div>
    {lagret && <div className="varsel ok" role="status"><b className="undertittel">{lagret.tittel}</b><p className="forklar mono">{lagret.kode}</p></div>}
    <div className="faner" role="group" aria-label="Del">
      {(Object.keys(FANE_NAVN) as PlanhubFane[]).map((f) => <button key={f} type="button" aria-pressed={fane === f} onClick={() => velgFane(f)}>{FANE_NAVN[f]}<span className="fane-ant">{antall[f] || "—"}</span></button>)}
    </div>

    {(fane === "ukemaler" || fane === "program") && <div className="seksjon" style={{ gap: "var(--r4)" }}>
      {antall[fane] === 0 ? <div className="kort dempet"><b className="undertittel">{fane === "program" ? "Ingen program ennå" : "Ingen ukemaler ennå"}</b><p className="forklar">{fane === "program" ? "Et program samler ukemaler over flere uker. Lag det første som en mal med flere uker." : "En mal gjør det raskere å lage nye planer. Lag den første her."}</p><div className="knapper"><Link className="knapp sek" href="/admin/plan-templates/ny">Ny mal</Link></div></div>
        : <div className="mal-grid">{(fane === "program" ? data.program : data.ukemaler).map((m) => <MalKort key={m.id} m={m} type={fane === "program" ? "Program" : "Ukemal"} />)}</div>}
    </div>}

    {fane === "standardokter" && <div className="seksjon" style={{ gap: "var(--r4)" }}>
      {data.standardokter.length === 0 ? <div className="kort dempet"><b className="undertittel">Ingen standardøkter ennå</b><p className="forklar">Standardøkter lages i Workbench og kan brukes i alle planer.</p></div>
        : <div className="mal-grid">{data.standardokter.map((s) => <div key={s.id} className="mal-kort">
          <div className="sek-topp" style={{ gap: 6 }}><b>{s.navn}</b><span className="akse-prikk" style={{ background: AKSE_FARGE[s.akse] }} aria-hidden /></div>
          <span className="kilde">Standardøkt · {s.akse} · {s.minutter} min · {pl(s.ovelseAntall, "øvelse", "øvelser")}</span>
        </div>)}</div>}
    </div>}

    {fane === "ovelser" && <div className="seksjon" style={{ gap: "var(--r4)" }}>
      <div className="knapper"><button type="button" className="knapp pri" onClick={nyOvelse}><Plus className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Egen øvelse</button><Link className="knapp sek" href="/admin/ovelser">Hele øvelsesbanken</Link></div>
      <div className="akse-chips" role="group" aria-label="Pyramide">{AKSER.map((a) => <button key={a} type="button" className={a.toLowerCase()} aria-pressed={akse === a} onClick={() => setAkse(a)}>{a}</button>)}</div>
      {data.ovelserTotalt > data.ovelser.length && <span className="kilde">Viser de {data.ovelser.length} sist endrede av {data.ovelserTotalt}. Hele banken med filtre: Øvelsesbanken.</span>}
      {ovelser.length === 0 ? <div className="kort dempet"><b className="undertittel">Ingen øvelser for {akse} her</b><p className="forklar">Start med én øvelse. Den kan brukes i standardøkter, ukemaler og rett i Workbench.</p><div className="knapper"><button type="button" className="knapp pri" onClick={nyOvelse}>Egen øvelse</button></div></div>
        : ovelser.map((o) => <button key={o.id} type="button" className="ovelse" onClick={() => { setLagret(null); setArk({ ovelse: o }); }} aria-label={`Rediger øvelsen ${o.navn}`}>
          <b>{o.navn}</b><span className="kilde">{mengdeForOvelse(o) ?? "—"}{o.detaljer?.mal?.resultatkrav ? ` · mål ${o.detaljer.mal.resultatkrav}` : ""}</span>
          <code>{formelForOvelse(o)}{metaForOvelse(o) ? ` · ${metaForOvelse(o)}` : ""}</code>
        </button>)}
    </div>}

    {ark && <AG14Ovelseark key={ark.ovelse?.id ?? "ny"} open ovelse={ark.ovelse} onLukk={() => setArk(null)}
      onLagret={(tittel, kode) => { setArk(null); setLagret({ tittel, kode }); router.refresh(); }} />}
  </div>;
}
