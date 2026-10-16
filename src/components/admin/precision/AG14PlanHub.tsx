"use client";

/**
 * AG-14 Plan-hub, maler og øvelser i Precision Athletics (Claude Design
 * 7d7c2994, ui_kits/agencyos/screens/AG-14.jsx).
 *
 * Fire faner som i tegningen: Ukemaler · Program · Standardøkter · Øvelser.
 * «Ny øvelse» åpner øvelsesarket (AG14Ovelseark), som lagrer via
 * opprettOvelseAction/oppdaterOvelseAction (src/lib/actions/drills-actions.ts).
 *
 * Det hubben og mal-lista (/admin/plan/maler) gjorde før, er med: uke-linja
 * med spillere, økter og udekket, «Åpne uka i Workbench», lenke til teknisk
 * plan, alle maler med status- og periodefilter, uke for uke, bruk og effekt,
 * og lenker til mal-detalj, redigering, ny mal og utrulling.
 *
 * Avvik fra tegningen, med grunn:
 *   - «Bruk i Workbench» på en ukemal: appen har ingen handling som legger en
 *     mal inn i en uke. Kortet åpner malen i stedet.
 *   - «Spillere» på et program: ingen kobling fra mal til spiller finnes.
 *     Kortet viser «brukt N ganger», som er det dataene har.
 *   - Gruppe på en ukemal: PlanTemplate har ingen gruppe. Kategori A–K vises.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, Layers, Library, ListChecks, Pencil, Plus, Send } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Faner, SegmentFilter, SideHode } from "@/components/precision/pa-a4";
import { Aksebar, Hendelseskort, Seksjon, Varsel, type PaAkse } from "@/components/precision/pa-planhub";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { formaterFortegn, formaterTall } from "@/lib/format-tall";
import { formelForOvelse, mengdeForOvelse, metaForOvelse } from "@/lib/agencyos/planhub-ovelse";
import type { PlanhubData, PlanhubFane, PlanhubMal, PlanhubOvelse } from "@/lib/agencyos/planhub-typer";
import { AG14Ovelseark } from "./AG14Ovelseark";

const ak = (a: string) => a.toLowerCase() as PaAkse;
const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;
const timer = (min: number) => formaterTall(min / 60, 1, true);

/** Snitt SG-Total-endring for spillere som fullførte malen (PlanEffectiveness). */
function Effekt({ m }: { m: PlanhubMal }) {
  if (m.effektAntall === 0 || m.effektAvg == null) return null;
  return <Meta>SG-TOTAL {formaterFortegn(m.effektAvg, 2)} · {pl(m.effektAntall, "FULLFØRT PLAN", "FULLFØRTE PLANER")}</Meta>;
}

function MalKort({ m }: { m: PlanhubMal }) {
  const totalMin = m.minutter.reduce((a, x) => a + x.verdi, 0);
  const brukMinutter = m.minutter.length > 0;
  const verdier = (brukMinutter ? m.minutter : m.fordeling).map((x) => ({ akse: ak(x.akse), verdi: x.verdi }));
  return <div className="pa-card a10-seksjon" style={{ gap: 10 }}>
    <div className="a10-ev__hode">
      <span className="a10-ev__tittel">{m.navn}</span>
      <Meta>BRUKT {m.usageCount}</Meta>
    </div>
    <Meta>KATEGORI {m.kategori} · {LPHASE_LABEL[m.fase].toUpperCase()} · {pl(m.oktAntall, "ØKT", "ØKTER")} · {totalMin > 0 ? `${timer(totalMin)} T` : "— T"}</Meta>
    <Aksebar verdier={verdier} label={brukMinutter ? "Minutter per akse" : "Planlagt fordeling"} />
    {verdier.length > 0
      ? <div className="a10-aksenokler">{verdier.map((v) => <span key={v.akse} className="a10-aksenokkel"><AkseMerke axis={v.akse} size="sm" /><Meta>{brukMinutter ? `${v.verdi} MIN` : `${v.verdi} %`}</Meta></span>)}</div>
      : <Meta>INGEN FORDELING LAGT INN</Meta>}
    <div className="a10-knapperad">
      <StatusPille tone={m.godkjent ? "ok" : "neutral"}>{m.godkjent ? "Godkjent" : "Utkast"}</StatusPille>
      <Effekt m={m} />
    </div>
    <MalHandlinger m={m} />
  </div>;
}

function MalHandlinger({ m }: { m: PlanhubMal }) {
  return <div className="a10-knapperad">
    <KnappLenke href={`/admin/plan-templates/${m.id}`} variant="secondary" icon={Layers} iconName="layers">Åpne mal</KnappLenke>
    <KnappLenke href={`/admin/plan-templates/${m.id}/rediger`} variant="ghost" icon={Pencil} iconName="pencil">Rediger</KnappLenke>
    {m.godkjent && <KnappLenke href="/admin/grupper" variant="ghost" icon={Send} iconName="send">Rull ut</KnappLenke>}
  </div>;
}

function dominerende(m: PlanhubMal): PaAkse[] {
  const kilde = m.minutter.length > 0 ? m.minutter : m.fordeling;
  const topp = [...kilde].sort((a, b) => b.verdi - a.verdi)[0];
  return topp ? [ak(topp.akse)] : [];
}

function ProgramKort({ m }: { m: PlanhubMal }) {
  return <Hendelseskort akser={dominerende(m)}>
    <div className="a10-ev__hode"><span className="a10-ev__tittel">{m.navn}</span><Meta>BRUKT {m.usageCount}</Meta></div>
    {m.beskrivelse && <span className="a10-ev__tekst">{m.beskrivelse}</span>}
    <Meta>{m.varighetUker} UKER · {m.ukentligOktAntall} ØKTER/UKE · KATEGORI {m.kategori} · {LPHASE_LABEL[m.fase].toUpperCase()}</Meta>
    <div className="a10-knapperad" style={{ paddingTop: 4 }}>
      <StatusPille tone={m.godkjent ? "ok" : "neutral"}>{m.godkjent ? "Godkjent" : "Utkast"}</StatusPille>
      <Effekt m={m} />
    </div>
    <div className="a10-stabel a10-stabel--tett" style={{ paddingTop: 4 }}>
      <span className="kicker">Uke for uke</span>
      {m.ukeOversikt.length === 0
        ? <Meta>INGEN ØKTER LAGT INN ENNÅ</Meta>
        : <div className="a10-aksenokler">{m.ukeOversikt.map((b) => <span key={b.fraUke} className="a10-aksenokkel"><AkseMerke axis={ak(b.akse)} size="sm" /><Meta>{b.fraUke === b.tilUke ? `UKE ${b.fraUke}` : `UKE ${b.fraUke}–${b.tilUke}`} · {pl(b.oktAntall, "ØKT", "ØKTER")}</Meta></span>)}</div>}
    </div>
    <div style={{ paddingTop: 6 }}><MalHandlinger m={m} /></div>
  </Hendelseskort>;
}

function MalFilter({ maler, children }: { maler: PlanhubMal[]; children: (filtrert: PlanhubMal[]) => React.ReactNode }) {
  const [status, setStatus] = useState("alle");
  const [fase, setFase] = useState("alle");
  const godkjent = maler.filter((m) => m.godkjent).length;
  const faser = useMemo(() => {
    const tall = new Map<string, number>();
    for (const m of maler) tall.set(m.fase, (tall.get(m.fase) ?? 0) + 1);
    return [...tall.entries()].map(([f, n]) => ({ value: f, label: LPHASE_LABEL[f as keyof typeof LPHASE_LABEL], count: n }));
  }, [maler]);
  const filtrert = maler.filter((m) => (status === "alle" || (status === "godkjent") === m.godkjent) && (fase === "alle" || m.fase === fase));
  return <>
    <div className="a10-stabel a10-stabel--tett">
      <SegmentFilter label="Status" value={status} onChange={setStatus} options={[
        { value: "alle", label: "Alle", count: maler.length },
        ...(godkjent > 0 ? [{ value: "godkjent", label: "Godkjent", count: godkjent }] : []),
        ...(maler.length - godkjent > 0 ? [{ value: "utkast", label: "Utkast", count: maler.length - godkjent }] : []),
      ]} />
      {faser.length > 1 && <SegmentFilter label="Periode" value={fase} onChange={setFase} options={[{ value: "alle", label: "Alle perioder" }, ...faser]} />}
    </div>
    {filtrert.length === 0
      ? <TomTilstand icon={ListChecks} title="Ingen maler her" text="Ingen maler passer filteret akkurat nå." />
      : children(filtrert)}
  </>;
}

function OvelseKort({ o, onApne }: { o: PlanhubOvelse; onApne: () => void }) {
  const mengde = mengdeForOvelse(o);
  const mal = o.detaljer?.mal?.resultatkrav ?? null;
  const meta = metaForOvelse(o);
  return <Hendelseskort akser={[ak(o.pyramide)]} onClick={onApne} label={`Rediger øvelsen ${o.navn}`}>
    <span className="a10-ev__hode"><span className="a10-ev__tittel">{o.navn}</span><Meta>{mengde ?? "—"} · MÅL {mal ?? "—"}</Meta></span>
    <span className="a10-ev__kode">{formelForOvelse(o)}</span>
    <Meta>{meta ? meta.toUpperCase() : "OMRÅDE IKKE SATT"}</Meta>
  </Hendelseskort>;
}

export type AG14Props = { data: PlanhubData; startFane?: PlanhubFane };

export function AG14PlanHub({ data, startFane = "ukemaler" }: AG14Props) {
  const router = useRouter();
  const [fane, setFane] = useState<PlanhubFane>(startFane);
  const [ark, setArk] = useState<{ ovelse: PlanhubOvelse | null } | null>(null);
  const [lagret, setLagret] = useState<{ tittel: string; kode: string } | null>(null);

  const velgFane = (f: string) => {
    setFane(f as PlanhubFane);
    router.replace(`/admin/plan?fane=${f}`, { scroll: false });
  };
  const nyOvelse = () => { setLagret(null); velgFane("ovelser"); setArk({ ovelse: null }); };

  const faner = [
    { verdi: "ukemaler", navn: "Ukemaler", antall: data.ukemaler.length },
    { verdi: "program", navn: "Program", antall: data.program.length },
    { verdi: "standardokter", navn: "Standardøkter", antall: data.standardokter.length },
    { verdi: "ovelser", navn: "Øvelser", antall: data.ovelserTotalt },
  ];

  const nyMal = <KnappLenke href="/admin/plan-templates/ny" variant="secondary" icon={Plus} iconName="plus">Ny mal</KnappLenke>;
  const tomMaler = (hva: string) => <TomTilstand icon={Library} title={`Ingen ${hva} ennå`} text="En mal gjør det raskere å lage nye planer. Lag den første her." actions={nyMal} />;

  let innhold: React.ReactNode;
  if (fane === "ukemaler") {
    innhold = data.ukemaler.length === 0 ? tomMaler("ukemaler") : <>
      <div className="a10-knapperad">{nyMal}</div>
      <MalFilter maler={data.ukemaler}>{(l) => <div className="a10-kortnett">{l.map((m) => <MalKort key={m.id} m={m} />)}</div>}</MalFilter>
    </>;
  } else if (fane === "program") {
    innhold = data.program.length === 0 ? tomMaler("program") : <>
      <div className="a10-knapperad">{nyMal}</div>
      <MalFilter maler={data.program}>{(l) => <div className="a10-kortnett">{l.map((m) => <ProgramKort key={m.id} m={m} />)}</div>}</MalFilter>
    </>;
  } else if (fane === "standardokter") {
    innhold = data.standardokter.length === 0
      ? <TomTilstand icon={Library} title="Ingen standardøkter ennå" text="Standardøkter du eller klubben har lagret, vises her." />
      : <div className="a10-kortnett">{data.standardokter.map((s) => <Hendelseskort key={s.id} akser={[ak(s.akse)]}>
        <span className="a10-ev__tittel">{s.navn}</span>
        <Meta>{s.minutter} MIN · {pl(s.ovelseAntall, "ØVELSE", "ØVELSER")}</Meta>
      </Hendelseskort>)}</div>;
  } else {
    innhold = data.ovelser.length === 0
      ? <TomTilstand icon={Library} title="Ingen øvelser ennå" text="Start med én øvelse. Den kan brukes i standardøkter, ukemaler og rett i Workbench." actions={<Knapp icon={Plus} iconName="plus" onClick={nyOvelse}>Ny øvelse</Knapp>} />
      : <div className="a10-stabel a10-stabel--tett">
        {data.ovelserTotalt > data.ovelser.length && <Meta>VISER DE {data.ovelser.length} SIST ENDREDE AV {data.ovelserTotalt}</Meta>}
        {data.ovelser.map((o) => <OvelseKort key={o.id} o={o} onApne={() => { setLagret(null); setArk({ ovelse: o }); }} />)}
      </div>;
  }

  const u = data.uke;
  return <div className="pa-side">
    <SideHode kicker="Plan · maler og øvelser" title="Plan-hub"
      sub="Ukemaler, program, standardøkter og øvelsesbanken. Øvelser bygges etter AK-formelen v2."
      actions={<Knapp icon={Plus} iconName="plus" onClick={nyOvelse}>Ny øvelse</Knapp>} />
    <Seksjon tittel={`Uke ${u.nr}`} meta={`${pl(u.spillere, "SPILLER", "SPILLERE")} · ${pl(u.okter, "ØKT", "ØKTER")} · ${u.udekket} UDEKKET`} label="Denne uka">
      <div className="a10-knapperad">
        <KnappLenke href={data.workbenchHref} variant="secondary" icon={CalendarRange} iconName="calendar-range">Åpne uka i Workbench</KnappLenke>
        <KnappLenke href="/admin/plan/teknisk" variant="ghost" icon={ListChecks} iconName="list-checks">Teknisk plan</KnappLenke>
      </div>
    </Seksjon>
    {lagret && <Varsel tone="ok" tittel={lagret.tittel}><span className="a10-ev__kode">{lagret.kode}</span></Varsel>}
    <Faner faner={faner} valgt={fane} onEndre={velgFane} />
    {innhold}
    {ark && <AG14Ovelseark
      key={ark.ovelse?.id ?? "ny"}
      open
      ovelse={ark.ovelse}
      onLukk={() => setArk(null)}
      onLagret={(tittel, kode) => { setArk(null); setLagret({ tittel, kode }); router.refresh(); }}
    />}
  </div>;
}
