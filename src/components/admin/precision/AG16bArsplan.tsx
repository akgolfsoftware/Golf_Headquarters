/**
 * AG-16b Gruppas årsplan i Precision Athletics. Tegnet i natt i Claude Design
 * 7d7c2994 (ui_kits/agencyos/screens/AG-16b.jsx) fordi tegningen manglet;
 * Anders må se den (port 7).
 *
 * Lesevisning av gruppeplanen: perioder, faste tider, samlinger, skolehendelser
 * og turneringer, samme data som /team-wang (hentGruppeKalenderData). Ingen
 * spillernavn. Periodene er tekst og dato, ikke fargeflater: farge betyr akse.
 */
import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarRange, Trophy, Upload } from "lucide-react";
import { Meta, KnappLenke, TomTilstand, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { FanerLenker, Side, SideHode } from "@/components/precision/pa-a4";
import "@/styles/precision-a5.css";
import { GruppeKalenderWrapper } from "@/components/gruppe-kalender/gruppe-kalender-wrapper";
import type { GruppeKalenderData, SkoleHendelse } from "@/lib/gruppe-kalender/types";

export type AG16bTilstand = "data" | "tom" | "laster" | "feil";
export type AG16bArsplanProps = {
  tilstand: AG16bTilstand;
  gruppe: { id: string; navn: string };
  data: GruppeKalenderData | null;
  trinn: string | null;
  kanRedigere?: boolean;
};

const TRINN = ["VG1", "VG2", "VG3"] as const;
const UKEDAG = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];
const KATEGORI: Record<SkoleHendelse["category"], string> = {
  TIME: "Time", PROVE: "Prøve", HELDAGSPROVE: "Heldagsprøve", EKSAMEN: "Eksamen", FERIE: "Ferie", SKOLETUR: "Skoletur", ANNET: "Annet",
};

const dagFmt = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
const dagAarFmt = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
const mndFmt = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const klokkeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
const nokkelFmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Oslo" });

const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const mndNokkel = (iso: string) => nokkelFmt.format(new Date(iso)).slice(0, 7);
const dagFør = (iso: string) => new Date(new Date(iso).getTime() - 24 * 3600 * 1000);

function Seksjon({ k, meta, children }: { k: string; meta?: string; children: ReactNode }) {
  return <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto", minWidth: 0 }}>{k}</span>
      {meta && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>;
}

function Rad({ a, sub, b, forste }: { a: ReactNode; sub?: string | null; b?: ReactNode; forste?: boolean }) {
  return <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,auto)", gap: 12, alignItems: "center", minHeight: 52, borderTop: forste ? "none" : "1px solid var(--border-hairline)", padding: "6px 0", minWidth: 0 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{a}</span>
      {sub && <Meta>{sub}</Meta>}
    </span>
    {b != null && <span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", overflowWrap: "anywhere", minWidth: 0 }}>{b}</span>}
  </div>;
}

export function GruppeFanerPa({ id, aktiv }: { id: string; aktiv: "arsplan" | "skoledata" }) {
  return <FanerLenker faner={[
    { href: `/admin/grupper/${id}`, navn: "Medlemmer", aktiv: false },
    { href: `/admin/grupper/${id}/workbench`, navn: "Workbench", aktiv: false },
    { href: `/admin/grupper/${id}/arsplan`, navn: "Årsplan", aktiv: aktiv === "arsplan" },
    { href: `/admin/grupper/${id}/timeplan`, navn: "Timeplan", aktiv: false },
    { href: `/admin/grupper/${id}/arsplan/skoledata`, navn: "Skoledata", aktiv: aktiv === "skoledata" },
  ]} />;
}

function Innhold({ gruppe, data, trinn }: { gruppe: AG16bArsplanProps["gruppe"]; data: GruppeKalenderData; trinn: string | null }) {
  const base = `/admin/grupper/${gruppe.id}/arsplan`;
  const skole = data.skoleHendelser.filter((h) => !trinn || h.classYear == null || h.classYear === trinn);
  const maaneder: { nokkel: string; label: string; rader: SkoleHendelse[] }[] = [];
  for (const h of skole) {
    const n = mndNokkel(h.date);
    let m = maaneder.find((x) => x.nokkel === n);
    if (!m) { m = { nokkel: n, label: stor(mndFmt.format(new Date(h.date))), rader: [] }; maaneder.push(m); }
    m.rader.push(h);
  }
  const faste = [...data.faste].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));

  const perioder = <Seksjon k="Perioder" meta={`${data.perioder.length} ${data.perioder.length === 1 ? "PERIODE" : "PERIODER"}`}>
    {data.perioder.length === 0
      ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen perioder lagt inn for gruppen. Perioder settes i gruppe-Workbench.</p>
      : <div role="list">{data.perioder.map((p, i) => <div key={p.id} style={{ minWidth: 0 }}>
          <Rad forste={i === 0} a={p.name}
            sub={[p.note, p.kompetansemal.length ? `${p.kompetansemal.length} KOMPETANSEMÅL` : null].filter(Boolean).join(" · ").toUpperCase() || null}
            b={`${dagFmt.format(new Date(p.startDate))} – ${dagAarFmt.format(dagFør(p.endDate))}`} />
          {p.kompetansemal.length > 0 && <ul aria-label={`Kompetansemål ${p.name}`} style={{ margin: "0 0 8px", paddingLeft: 18, listStyle: "disc", display: "flex", flexDirection: "column", gap: 4, font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>
            {p.kompetansemal.map((k) => <li key={k.id}>{k.classYear} · {k.curriculumCode} nr. {k.goalNumber}: {k.text}</li>)}
          </ul>}
        </div>)}</div>}
  </Seksjon>;

  const fasteKort = <Seksjon k="Faste tider" meta={faste.length ? `${faste.length} PER UKE` : undefined}>
    {faste.length === 0
      ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Gruppen har ingen faste ukentlige tider.</p>
      : <div role="list">{faste.map((f, i) => <Rad key={f.id} forste={i === 0} a={f.title} b={`${UKEDAG[f.weekday] ?? "—"} ${f.startTime}–${f.endTime}`} />)}</div>}
  </Seksjon>;

  const samlinger = <Seksjon k="Samlinger" meta={data.samlinger.length ? `${data.samlinger.length} PLANLAGT` : undefined}>
    {data.samlinger.length === 0
      ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen samlinger i planen.</p>
      : <div role="list">{data.samlinger.map((s, i) => <Rad key={s.id} forste={i === 0} a={s.title}
          sub={[s.kind === "HELDAGSSAMLING" ? "Heldagssamling" : "Samling", s.location].filter(Boolean).join(" · ").toUpperCase()}
          b={`${dagFmt.format(new Date(s.startAt))} ${klokkeFmt.format(new Date(s.startAt))}`} />)}</div>}
  </Seksjon>;

  const skoleKort = <Seksjon k="Skolehendelser" meta={trinn ?? "ALLE TRINN"}>
    <div role="group" aria-label="Velg trinn" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {["", ...TRINN].map((t) => {
        const på = (trinn ?? "") === t;
        return <Link key={t || "alle"} href={t ? `${base}?trinn=${t}` : base} scroll={false} className="pa-choice" aria-current={på ? "true" : undefined} style={på ? { textDecoration: "none", background: "var(--primary)", borderColor: "var(--primary)", color: "var(--text-on-primary)" } : { textDecoration: "none" }}>{t || "Alle trinn"}</Link>;
      })}
    </div>
    {maaneder.length === 0
      ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen skolehendelser lagt inn. Lim inn skolerute og prøveplan under Skoledata.</p>
      : maaneder.map((m) => <div key={m.nokkel} role="list" aria-label={m.label}>
          <Meta style={{ display: "block", marginTop: 8 }}>{m.label.toUpperCase()}</Meta>
          {m.rader.map((h, i) => <Rad key={h.id} forste={i === 0} a={h.title}
            sub={[KATEGORI[h.category], h.classYear ?? "Alle trinn", h.note].filter(Boolean).join(" · ").toUpperCase()}
            b={dagFmt.format(new Date(h.date))} />)}
        </div>)}
  </Seksjon>;

  const turneringer = <Seksjon k="Turneringsplan" meta={data.turneringer.length ? `${data.turneringer.length} KOMMENDE` : undefined}>
    {data.turneringer.length === 0
      ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen kommende turneringer i seriene ennå.</p>
      : <div role="list">{data.turneringer.map((t, i) => <Rad key={t.id} forste={i === 0}
          a={t.slug ? <Link href={`/turneringer/${t.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{t.navn}</Link> : t.navn}
          sub={[t.serie, t.location].filter(Boolean).join(" · ").toUpperCase()}
          b={t.endDate && nokkelFmt.format(new Date(t.startDate)) !== nokkelFmt.format(new Date(t.endDate)) ? `${dagFmt.format(new Date(t.startDate))} – ${dagFmt.format(new Date(t.endDate))}` : dagFmt.format(new Date(t.startDate))} />)}</div>}
  </Seksjon>;

  const kalender = <Seksjon k="Kalender" meta="ÅR · MÅNED · UKE · DAG">
    <div style={{ minWidth: 0 }}><GruppeKalenderWrapper data={data} classYear={trinn} /></div>
  </Seksjon>;

  return <div className="pa-a5-stack">{kalender}<div className="pa-a5-grid pa-a5-grid--2">
    <div className="pa-a5-stack">{perioder}{skoleKort}</div>
    <div className="pa-a5-stack">{fasteKort}{samlinger}{turneringer}</div>
  </div></div>;
}

export function AG16bArsplan({ tilstand, gruppe, data, trinn, kanRedigere = true }: AG16bArsplanProps) {
  return <Side max={1200}>
    <SideHode kicker="Mer · Grupper" title="Årsplan" sub={gruppe.navn}
      actions={kanRedigere ? <KnappLenke variant="secondary" size="sm" href={`/admin/grupper/${gruppe.id}/arsplan/skoledata`} icon={Upload} iconName="upload">Legg inn skoledata</KnappLenke> : undefined} />
    <GruppeFanerPa id={gruppe.id} aktiv="arsplan" />
    {tilstand === "laster" ? <LasterTilstand text="Henter årsplanen …" />
      : tilstand === "feil" ? <FeilTilstand icon={CalendarRange} title="Årsplanen kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="FEIL 503 · ÅRSPLAN" />
      : tilstand === "tom" || !data ? <TomTilstand icon={Trophy} title="Ingen kalenderdata for gruppen" text={`Fant ingen faste tider eller perioder for «${gruppe.navn}» i systemet.`}
          actions={<KnappLenke variant="secondary" href={`/admin/grupper/${gruppe.id}/workbench`} icon={CalendarRange}>Åpne gruppe-Workbench</KnappLenke>} />
      : <Innhold gruppe={gruppe} data={data} trinn={trinn} />}
  </Side>;
}
