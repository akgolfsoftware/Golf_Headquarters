"use client";

/**
 * AG-16 Gruppe · Årsplan i nytt design (bølge 2, 20.10.2026) — /admin/grupper/[id]/arsplan.
 * Fasit: canvas «Gruppe · årsplan» (AgencyOS bølge 2). Stil: src/styles/agencyos-ny-arsplan.css.
 *
 * Samme data som den delte gruppekalenderen (hentGruppeKalenderData: perioder med kompetansemål, samlinger,
 * skolehendelser, faste tider og turneringer). Den delte kalenderen (gruppe-kalender-wrapper) brukes fortsatt
 * av de åpne sidene og røres ikke.
 *
 * Avvik:
 *   - Timer per akse per periode vises ikke her: de bor i gruppeplanen i Workbench (PeriodBlock), ikke i
 *     TrainingPeriod. Lenke til gruppeplanen er med.
 *   - Periodene i bånd og liste er grafitt og grått (farge betyr bare akse); tonen fra basen brukes ikke.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Seksjon, Tom } from "@/components/admin/agencyos-ny/ny";
import type { GruppeKalenderData, SkoleHendelseKategori } from "@/lib/gruppe-kalender/types";
import "@/styles/agencyos-ny-arsplan.css";

const TRINN = ["VG1", "VG2", "VG3"] as const;
const MAANED = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const MAANED_LANG = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
const UKEDAG = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const UKEDAG_LANG = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
const SKOLE: Record<SkoleHendelseKategori, string> = { TIME: "Time", PROVE: "Prøve", HELDAGSPROVE: "Heldagsprøve", EKSAMEN: "Eksamen", FERIE: "Ferie", SKOLETUR: "Skoletur", ANNET: "Annet" };

const OSLO_DAG = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });
const OSLO_KL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
const oslo = (iso: string) => OSLO_DAG.format(new Date(iso));
const utcDag = (iso: string) => iso.slice(0, 10);

type Hendelse = { id: string; type: "heldag" | "samling" | "skole" | "turnering" | "trening"; tittel: string; tid: string | null; sted: string | null };

function dagerMellom(fra: string, til: string): string[] {
  const ut: string[] = [];
  const c = new Date(`${fra}T00:00:00Z`);
  const slutt = new Date(`${til}T00:00:00Z`);
  while (c <= slutt && ut.length < 400) { ut.push(c.toISOString().slice(0, 10)); c.setUTCDate(c.getUTCDate() + 1); }
  return ut;
}

function byggHendelser(d: GruppeKalenderData, trinn: string | null): Map<string, Hendelse[]> {
  const kart = new Map<string, Hendelse[]>();
  const leggTil = (dag: string, h: Hendelse) => kart.set(dag, [...(kart.get(dag) ?? []), h]);
  for (const s of d.samlinger) {
    const kl = s.kind === "HELDAGSSAMLING" ? null : `${OSLO_KL.format(new Date(s.startAt))}–${OSLO_KL.format(new Date(s.endAt))}`;
    for (const dag of dagerMellom(oslo(s.startAt), oslo(s.endAt))) leggTil(dag, { id: `s-${s.id}-${dag}`, type: s.kind === "HELDAGSSAMLING" ? "heldag" : "samling", tittel: s.title, tid: kl, sted: s.location });
  }
  for (const h of d.skoleHendelser) {
    if (h.classYear !== null && trinn !== null && h.classYear !== trinn) continue;
    leggTil(utcDag(h.date), { id: `h-${h.id}`, type: "skole", tittel: `${SKOLE[h.category]}: ${h.title}`, tid: null, sted: h.classYear });
  }
  for (const t of d.turneringer) {
    for (const dag of dagerMellom(utcDag(t.startDate), utcDag(t.endDate ?? t.startDate))) leggTil(dag, { id: `t-${t.id}-${dag}`, type: "turnering", tittel: t.navn, tid: null, sted: t.location });
  }
  return kart;
}

const TYPE_ETT: Record<Hendelse["type"], string> = { heldag: "Heldagssamling", samling: "Samling", skole: "Skole", turnering: "Turnering", trening: "Fast tid" };

function manedsrutenett(aar: number, maaned: number) {
  const forste = new Date(Date.UTC(aar, maaned, 1));
  const antall = new Date(Date.UTC(aar, maaned + 1, 0)).getUTCDate();
  const forskyv = (forste.getUTCDay() + 6) % 7;
  return { forskyv, dager: Array.from({ length: antall }, (_, i) => `${aar}-${String(maaned + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`) };
}

function Aarsband({ d, aarStart }: { d: GruppeKalenderData; aarStart: number }) {
  const maaneder = Array.from({ length: 12 }, (_, i) => ({ aar: aarStart + (i >= 5 ? 1 : 0), m: (7 + i) % 12 }));
  const indeks = (iso: string) => { const dt = new Date(iso); return (dt.getUTCFullYear() - aarStart) * 12 + dt.getUTCMonth() - 7; };
  const segmenter = d.perioder.flatMap((p) => {
    const fra = Math.max(0, indeks(p.startDate));
    const til = Math.min(11, indeks(new Date(new Date(p.endDate).getTime() - 86_400_000).toISOString()));
    return til < 0 || fra > 11 || til < fra ? [] : [{ p, fra, til }];
  });
  return <>
    <div className="ars-band" role="img" aria-label={`Periodene i året: ${segmenter.map((s) => s.p.name).join(", ")}`}>
      {segmenter.map(({ p, fra, til }, i) => <div key={p.id} className={i % 2 === 0 ? "ars-seg mork" : "ars-seg mid"} style={{ gridColumn: `${fra + 1} / ${til + 2}` }}><b>{p.name}</b></div>)}
    </div>
    <div className="ars-maaneder" aria-hidden>{maaneder.map((x) => <span key={`${x.aar}-${x.m}`}>{MAANED[x.m]}</span>)}</div>
    <ul className="ars-perioder">
      {d.perioder.map((p) => <li key={p.id}>
        <b>{p.name}</b>
        <span className="kilde mono">{new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(p.startDate))} – {new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(new Date(p.endDate).getTime() - 86_400_000))}</span>
        {p.note && <span className="kilde">{p.note}</span>}
      </li>)}
    </ul>
  </>;
}

export function AG16Arsplan({ groupId, data, trinn }: { groupId: string; data: GruppeKalenderData; trinn: string | null }) {
  const naa = new Date();
  const idag = OSLO_DAG.format(naa);
  const aarStart = Number(idag.slice(5, 7)) >= 8 ? Number(idag.slice(0, 4)) : Number(idag.slice(0, 4)) - 1;
  const [vis, setVis] = useState({ aar: Number(idag.slice(0, 4)), m: Number(idag.slice(5, 7)) - 1 });
  const [valgt, setValgt] = useState<string>(idag);
  const hendelser = useMemo(() => byggHendelser(data, trinn), [data, trinn]);
  const { forskyv, dager } = manedsrutenett(vis.aar, vis.m);
  const flytt = (n: number) => setVis((v) => { const t = v.aar * 12 + v.m + n; return { aar: Math.floor(t / 12), m: ((t % 12) + 12) % 12 }; });

  const ukedagIdx = (iso: string) => (new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7;
  const valgtHendelser = [
    ...data.faste.filter((f) => f.weekday === ukedagIdx(valgt)).map<Hendelse>((f) => ({ id: `f-${f.id}`, type: "trening", tittel: f.title, tid: `${f.startTime}–${f.endTime}`, sted: null })),
    ...(hendelser.get(valgt) ?? []),
  ];
  const periodeIDag = data.perioder.find((p) => valgt >= utcDag(p.startDate) && valgt < utcDag(p.endDate));
  const valgtDato = new Date(`${valgt}T00:00:00Z`);
  const basePath = `/admin/grupper/${groupId}/arsplan`;
  const tomt = data.perioder.length === 0 && data.samlinger.length === 0 && data.faste.length === 0;

  return <>
    {tomt && <Tom tittel="Ingen kalenderdata" tekst={`«${data.gruppeNavn}» mangler perioder, samlinger og faste tider.`} />}

    <Seksjon tittel="Året" hoyre={<Link href={`/admin/grupper/${groupId}/workbench`} className="ars-lenke">Timer per akse: gruppeplanen</Link>}>
      {data.perioder.length === 0 ? <p className="kilde">Ingen perioder lagt inn. Legg dem inn i gruppeplanen i Workbench.</p> : <Aarsband d={data} aarStart={aarStart} />}
    </Seksjon>

    <Seksjon tittel="Samlinger og skole">
      <div className="chips" role="group" aria-label="Trinn">
        {["", ...TRINN].map((t) => <Link key={t || "alle"} href={t ? `${basePath}?trinn=${t}` : basePath} scroll={false} aria-current={(trinn ?? "") === t ? "page" : undefined}>{t || "Alle trinn"}</Link>)}
      </div>
      <div className="ars-kal">
        <div className="ars-maaned">
          <div className="ars-maaned-topp">
            <h3>{MAANED_LANG[vis.m]} {vis.aar}</h3>
            <span className="ars-navigasjon">
              <button type="button" onClick={() => flytt(-1)} aria-label="Forrige måned"><ChevronLeft className="ikon" aria-hidden /></button>
              <button type="button" onClick={() => flytt(1)} aria-label="Neste måned"><ChevronRight className="ikon" aria-hidden /></button>
            </span>
          </div>
          <div className="ars-rutenett" role="group" aria-label={`${MAANED_LANG[vis.m]} ${vis.aar}`}>
            {UKEDAG.map((u) => <span key={u} className="meta" aria-hidden>{u}</span>)}
            {Array.from({ length: forskyv }, (_, i) => <span key={`t${i}`} />)}
            {dager.map((iso) => {
              const h = hendelser.get(iso) ?? [];
              const harHeldag = h.some((x) => x.type === "heldag");
              const harSamling = h.some((x) => x.type === "samling");
              const harSkole = h.some((x) => x.type === "skole");
              const harTurn = h.some((x) => x.type === "turnering");
              return <button key={iso} type="button" aria-pressed={valgt === iso} aria-label={`${Number(iso.slice(8))}. ${MAANED_LANG[vis.m].toLowerCase()}${h.length ? `, ${h.length} ${h.length === 1 ? "hendelse" : "hendelser"}` : ""}`}
                className={`ars-dag${iso === idag ? " idag" : ""}`} onClick={() => setValgt(iso)}>
                <span className="num">{Number(iso.slice(8))}</span>
                <span className="ars-merker" aria-hidden>
                  {(harSamling || harHeldag) && <i className={harHeldag ? "heldag" : "samling"} />}
                  {harTurn && <i className="turnering" />}
                  {harSkole && <i className="skole" />}
                </span>
              </button>;
            })}
          </div>
          <p className="kilde ars-tegn"><i className="samling" /> Samling · <i className="heldag" /> Heldagssamling · <i className="turnering" /> Turnering · <i className="skole" /> Skole</p>
        </div>
        <div className="kort ars-dagpanel" aria-live="polite">
          <b className="undertittel">{UKEDAG_LANG[ukedagIdx(valgt)].replace(/^./, (c) => c.toUpperCase())} {valgtDato.getUTCDate()}. {MAANED_LANG[valgtDato.getUTCMonth()].toLowerCase()}</b>
          {valgtHendelser.length === 0 ? <p className="kilde">Ingen registrerte hendelser denne dagen.</p>
            : <ul className="ars-hendelser">{valgtHendelser.map((h) => <li key={h.id}>
              <span className="pille noy"><i aria-hidden />{TYPE_ETT[h.type]}</span>
              <b>{h.tittel}</b>
              <span className="kilde mono">{[h.tid, h.sted].filter(Boolean).join(" · ") || "—"}</span>
            </li>)}</ul>}
          {periodeIDag && <div className="ars-mal">
            <b>{periodeIDag.name}</b>
            {periodeIDag.kompetansemal.length === 0
              ? <p className="kilde">Ingen kompetansemål lagt til for perioden ennå.</p>
              : <ul>{periodeIDag.kompetansemal.map((m) => <li key={m.id}><span className="kilde mono">{m.classYear} · {m.curriculumCode} {m.goalNumber}</span> {m.text}</li>)}</ul>}
          </div>}
        </div>
      </div>
    </Seksjon>

    <Seksjon tittel="Turneringsplan" kilde={`${data.turneringer.length} ${data.turneringer.length === 1 ? "turnering" : "turneringer"}`}>
      {data.turneringer.length === 0 ? <p className="kilde">Ingen turneringer i planen.</p>
        : <div className="ars-turn">{data.turneringer.map((t) => <div key={t.id} className="ars-turn-rad">
          <span className="num ars-turn-dato">{new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(t.startDate))}{t.endDate && utcDag(t.endDate) !== utcDag(t.startDate) ? ` – ${new Intl.DateTimeFormat("nb-NO", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(t.endDate))}` : ""}</span>
          <b>{t.slug ? <Link href={`/turneringer/${t.slug}`}>{t.navn}</Link> : t.navn}</b>
          <span className="kilde">{[t.serie, t.location].filter(Boolean).join(" · ")}</span>
        </div>)}</div>}
    </Seksjon>
  </>;
}
