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
 * Avvik fra utkastet:
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
type Del = "maler" | "ovelser";

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

export function AG14PlanHubNy({ data, startFane = "ukemaler" }: { data: PlanhubData; startFane?: PlanhubFane }) {
  const router = useRouter();
  const [del, setDel] = useState<Del>(startFane === "ovelser" ? "ovelser" : "maler");
  const [akse, setAkse] = useState<PyramideKode>("SLAG");
  const [ark, setArk] = useState<{ ovelse: PlanhubOvelse | null } | null>(null);
  const [lagret, setLagret] = useState<{ tittel: string; kode: string } | null>(null);
  const antallMaler = data.ukemaler.length + data.program.length + data.standardokter.length;
  const ovelser = useMemo(() => data.ovelser.filter((o) => o.pyramide === akse), [data.ovelser, akse]);
  const velgDel = (d: Del) => { setDel(d); router.replace(`/admin/plan?fane=${d === "maler" ? "ukemaler" : "ovelser"}`, { scroll: false }); };
  const nyOvelse = () => { setLagret(null); setArk({ ovelse: null }); };
  const u = data.uke;

  return <div className="agn-s">
    <div className="topp">
      <Link href="/admin/agencyos" className="ag-tilbake"><ChevronRight className="ikon" aria-hidden style={{ transform: "rotate(180deg)" }} />Cockpit</Link>
      <div className="topp-rad">
        <div><div className="dato">Workbench · maler og øvelser</div><h1 className="tittel">Maler og øvelser</h1></div>
        <div className="knapper"><Link className="knapp sek" href={data.workbenchHref}>Åpne uka i Workbench</Link><button type="button" className="knapp pri" onClick={nyOvelse}><Plus className="ikon" aria-hidden style={{ width: 16, height: 16 }} />Egen øvelse</button></div>
      </div>
      <p className="kilde">Uke {u.nr}: {pl(u.spillere, "spiller", "spillere")} · {pl(u.okter, "økt", "økter")} · {u.udekket} uten økt i uka.</p>
    </div>
    {lagret && <div className="varsel ok" role="status"><b className="undertittel">{lagret.tittel}</b><p className="forklar mono">{lagret.kode}</p></div>}
    <div className="faner" role="group" aria-label="Del">
      <button type="button" aria-pressed={del === "maler"} onClick={() => velgDel("maler")}>Maler</button>
      <button type="button" aria-pressed={del === "ovelser"} onClick={() => velgDel("ovelser")}>Øvelser</button>
      <button type="button" aria-pressed={false} onClick={nyOvelse}>Egen øvelse</button>
    </div>

    {del === "maler" && <div className="seksjon" style={{ gap: "var(--r4)" }}>
      <div className="hoved"><strong>{antallMaler || "—"}</strong><span className="forklar">maler · ukemaler, program og standardøkter</span></div>
      <div className="knapper"><Link className="knapp sek" href="/admin/plan-templates/ny">Ny mal</Link></div>
      {antallMaler === 0 ? <div className="kort dempet"><b className="undertittel">Ingen maler ennå</b><p className="forklar">En mal gjør det raskere å lage nye planer. Lag den første her.</p></div>
        : <div className="mal-grid">
          {data.ukemaler.map((m) => <MalKort key={m.id} m={m} type="Ukemal" />)}
          {data.program.map((m) => <MalKort key={m.id} m={m} type="Program" />)}
          {data.standardokter.map((s) => <div key={s.id} className="mal-kort">
            <div className="sek-topp" style={{ gap: 6 }}><b>{s.navn}</b><span className="akse-prikk" style={{ background: AKSE_FARGE[s.akse] }} aria-hidden /></div>
            <span className="kilde">Standardøkt · {s.akse} · {s.minutter} min · {pl(s.ovelseAntall, "øvelse", "øvelser")}</span>
          </div>)}
        </div>}
    </div>}

    {del === "ovelser" && <div className="seksjon" style={{ gap: "var(--r4)" }}>
      <div className="akse-chips" role="group" aria-label="Pyramide">{AKSER.map((a) => <button key={a} type="button" className={a.toLowerCase()} aria-pressed={akse === a} onClick={() => setAkse(a)}>{a}</button>)}</div>
      {data.ovelserTotalt > data.ovelser.length && <span className="kilde">Viser de {data.ovelser.length} sist endrede av {data.ovelserTotalt}. Hele banken med filtre: Øvelsesbanken.</span>}
      {ovelser.length === 0 ? <div className="kort dempet"><b className="undertittel">Ingen øvelser for {akse} her</b><p className="forklar">Start med én øvelse. Den kan brukes i standardøkter, ukemaler og rett i Workbench.</p><div className="knapper"><button type="button" className="knapp pri" onClick={nyOvelse}>Egen øvelse</button></div></div>
        : ovelser.map((o) => <button key={o.id} type="button" className="ovelse" onClick={() => { setLagret(null); setArk({ ovelse: o }); }} aria-label={`Rediger øvelsen ${o.navn}`}>
          <b>{o.navn}</b><span className="kilde">{mengdeForOvelse(o) ?? "—"}{o.detaljer?.mal?.resultatkrav ? ` · mål ${o.detaljer.mal.resultatkrav}` : ""}</span>
          <code>{formelForOvelse(o)}{metaForOvelse(o) ? ` · ${metaForOvelse(o)}` : ""}</code>
        </button>)}
      <Link className="lenke" href="/admin/ovelser">Hele øvelsesbanken</Link>
    </div>}

    {ark && <AG14Ovelseark key={ark.ovelse?.id ?? "ny"} open ovelse={ark.ovelse} onLukk={() => setArk(null)}
      onLagret={(tittel, kode) => { setArk(null); setLagret({ tittel, kode }); router.refresh(); }} />}
  </div>;
}
