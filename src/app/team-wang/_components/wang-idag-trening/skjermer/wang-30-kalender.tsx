import Link from "next/link";
import { Flag, NotebookPen } from "lucide-react";

import { erTurneringstittel } from "@/app/team-wang/_data/live-sesong";
import { hendelserMellom, hentElevOkter, hentGruppeElever, hentGruppeplan } from "@/app/team-wang/_data/wang-idag-trening-data";
import {
  DAG_KORT,
  DAG_LANG,
  MND_LANG,
  OMRADER,
  OMRADE_NAVN,
  ddmm,
  ddmmaaaa,
  erForfalt,
  erGjennomfort,
  erPlanlagt,
  forsteVerdi,
  gruppeokter,
  isoUke,
  leggTilDager,
  lesHeltall,
  mandagI,
  osloIso,
  osloMinutter,
  summer,
  tidsrom,
  timer,
  ukedag,
} from "@/app/team-wang/_data/wang-trening-beregning";
import { ElevVelger } from "@/app/team-wang/_components/wang-idag-trening/elev-velger";
import { Chips, NaaMerke, Omradeprikk, Segment, Sidehode, it as s, lastTrygt, oktHref } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import type { WangSkjermKontekst } from "@/app/team-wang/_components/wang-idag-trening/it-ui";
import { WangDemoMerknad, WangFeil, WangKnapp } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

type Sok = { visning?: string | string[]; uke?: string | string[]; mnd?: string | string[]; elev?: string | string[] };

/** WANG-30 Kalender og uke. Fasit: «WANG Golf Batch 10.dc.html» #kalender (6cfa623c). Rute: /team-wang/i-dag/kalender */
export async function WangKalender({ gruppe, erDemo, sok }: WangSkjermKontekst & { sok: Sok }) {
  const naa = new Date();
  const idag = osloIso(naa);
  const erMnd = forsteVerdi(sok.visning) === "maned";
  const ukeF = lesHeltall(sok.uke, 0, -52, 52);
  const mndF = lesHeltall(sok.mnd, 0, -12, 12);
  const elevId = forsteVerdi(sok.elev) ?? "";

  // Intervall: én uke, eller hele måneden fylt ut til hele uker.
  const mandag = leggTilDager(mandagI(idag), ukeF * 7);
  const [aar, mnd] = idag.split("-").map(Number);
  const mndStart = new Date(Date.UTC(aar, mnd - 1 + mndF, 1)).toISOString().slice(0, 10);
  const mndSlutt = new Date(Date.UTC(aar, mnd + mndF, 0)).toISOString().slice(0, 10);
  const fra = erMnd ? mandagI(mndStart) : mandag;
  const til = erMnd ? leggTilDager(mandagI(mndSlutt), 6) : leggTilDager(mandag, 6);

  const param = (ekstra: Record<string, string>) => {
    const p: Record<string, string> = {};
    if (erMnd) p.visning = "maned";
    if (erMnd && mndF) p.mnd = String(mndF);
    if (!erMnd && ukeF) p.uke = String(ukeF);
    if (elevId) p.elev = elevId;
    Object.assign(p, ekstra);
    for (const k of Object.keys(p)) if (p[k] === "") delete p[k];
    return Object.keys(p).length ? wangHref("WANG-30", {}, p) : wangHref("WANG-30");
  };

  const last = await lastTrygt(async () => {
    const [elever, plan] = await Promise.all([hentGruppeElever(gruppe.id), hentGruppeplan(gruppe.id, idag)]);
    const ids = elevId && elever.some((e) => e.id === elevId) ? [elevId] : elever.map((e) => e.id);
    const okter = await hentElevOkter(ids, fra, til);
    return { elever, plan, okter };
  });

  const kicker = erMnd ? `WANG-30 · ${gruppe.name} · ${MND_LANG[Number(mndStart.slice(5, 7)) - 1]} ${mndStart.slice(0, 4)}` : `WANG-30 · ${gruppe.name} · uke ${isoUke(mandag)} · ${ddmm(mandag)}–${ddmmaaaa(til)}`;

  if (!last.ok) {
    return (
      <div className={s.stabel16}>
        <Sidehode meta={kicker} tittel="Kalender og uke" />
        <WangFeil tittel="Vi fikk ikke hentet kalenderen." tekst="Planen er ikke borte. Prøv igjen om litt." handling={<WangKnapp href={param({})}>Prøv igjen</WangKnapp>} />
      </div>
    );
  }

  const { elever, plan, okter } = last.data;
  const elev = elever.find((e) => e.id === elevId) ?? null;
  const slots = gruppeokter(okter);
  const hendelser = hendelserMellom(plan.hendelser, fra, til).filter((h) => !h.ukentlig);
  const skole = plan.skoledager.filter((d) => d.dato >= fra && d.dato <= til);
  const iPeriode = okter.filter((o) => (erMnd ? o.dato >= mndStart && o.dato <= mndSlutt : true));
  const sum = summer(iPeriode, naa);
  const antallOkter = iPeriode.filter(erPlanlagt).length;
  const antallGjort = iPeriode.filter(erGjennomfort).length;
  const naaMin = osloMinutter(naa);

  const hrefFor: Record<string, string> = { "": param({ elev: "" }), ...Object.fromEntries(elever.map((e) => [e.id, param({ elev: e.id })])) };
  const velger = elever.length > 0 ? <ElevVelger elever={elever} valgt={elev?.id ?? ""} hrefFor={hrefFor} tomEtikett="Hele gruppa" etikett="Elev" /> : null;

  const visninger = [
    { href: param({ visning: "", mnd: "", uke: "" }), etikett: "Uke", aktiv: !erMnd },
    { href: param({ visning: "maned", uke: "", mnd: "" }), etikett: "Måned", aktiv: erMnd },
  ];
  const valg = erMnd
    ? [
        { href: param({ mnd: String(mndF - 1) }), etikett: "Forrige måned", aktiv: false },
        { href: param({ mnd: "" }), etikett: "Denne måneden", aktiv: mndF === 0 },
        { href: param({ mnd: String(mndF + 1) }), etikett: "Neste måned", aktiv: false },
      ]
    : [
        { href: param({ uke: String(ukeF - 1) }), etikett: "Forrige uke", aktiv: false },
        { href: param({ uke: "" }), etikett: "Denne uka", aktiv: ukeF === 0 },
        { href: param({ uke: String(ukeF + 1) }), etikett: "Neste uke", aktiv: false },
      ];

  const dagInnhold = (dato: string) => ({
    okter: slots.filter((g) => g.dato === dato),
    turn: hendelser.filter((h) => h.dato === dato && erTurneringstittel(h.tittel)),
    andre: hendelser.filter((h) => h.dato === dato && !erTurneringstittel(h.tittel)),
    skole: skole.filter((d) => d.dato === dato),
  });

  return (
    <div className={s.stabel16} style={{ gap: 20 }}>
      <Sidehode meta={kicker} tittel="Kalender og uke" undertittel={elev ? elev.navn : `Hele gruppa · ${elever.length} ${elever.length === 1 ? "elev" : "elever"}`} hoyre={velger} />
      {erDemo ? <WangDemoMerknad /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", alignItems: "center", justifyContent: "space-between" }}>
        <Segment valg={visninger} etikett="Visning" jevn />
        <Chips valg={valg} etikett="Periode" />
      </div>

      <section className={`${s.kort} ${s.cnt}`} aria-label="Tellere">
        <div><span className={s.meta} style={{ fontSize: 12.5 }}>Økter</span><span className={s.tall} style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: "var(--wtr-blue)" }}>{antallOkter}</span></div>
        <div><span className={s.meta} style={{ fontSize: 12.5 }}>Gjort</span><span className={s.tall} style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: "var(--wtr-blue)" }}>{antallGjort}</span></div>
        <div>
          <span className={s.meta} style={{ fontSize: 12.5 }}>Timer</span>
          <span className={s.tall} style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: "var(--wtr-blue)" }}>{timer(sum.planlagtMin)}</span>
          <span className={s.tall} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{timer(sum.gjennomfortMin)} gjennomført</span>
        </div>
      </section>
      {!elev && elever.length > 1 ? <p className={s.brod} style={{ fontSize: 14.5 }}>Tellerne summerer alle elevenes økter. Velg en elev for å se én plan.</p> : null}

      {!erMnd ? (
        <div className={s.uke7}>
          {Array.from({ length: 7 }, (_, i) => leggTilDager(mandag, i)).map((dato, i) => {
            const d = dagInnhold(dato);
            const erIdag = dato === idag;
            const tomDag = d.okter.length + d.turn.length + d.andre.length === 0;
            return (
              <section key={dato} className={`${s.dagKort} ${erIdag ? s.dagIdag : ""}`} aria-label={`${DAG_LANG[i]} ${ddmm(dato)}`}>
                <p className={s.dagHode}>
                  <span>{DAG_LANG[i]}</span>
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {erIdag ? <NaaMerke>I dag</NaaMerke> : null}
                    <span className={s.tall} style={{ fontSize: 12.5, color: "var(--wtr-text-muted)" }}>{ddmm(dato)}</span>
                  </span>
                </p>
                {d.turn.map((t) => (
                  <p key={t.id} className={s.merknad}><Flag size={15} strokeWidth={1.5} aria-hidden="true" className={s.flagg} /><span style={{ minWidth: 0 }}>{t.tittel.replace(/^Turnering:\s*/, "")}</span></p>
                ))}
                {d.andre.map((t) => (
                  <p key={t.id} className={s.merknad}><NotebookPen size={15} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none" }} /><span style={{ minWidth: 0 }}>{t.tittel}</span></p>
                ))}
                {d.okter.map((g) => {
                  const pagar = erIdag && naaMin >= g.startMin && naaMin < g.startMin + g.varighetMin;
                  const gjort = g.okter.filter(erGjennomfort).length;
                  const meta = erForfalt(g, naa) ? `${gjort} av ${g.okter.length} gjennomført` : [g.sted, `${g.okter.length} ${g.okter.length === 1 ? "elev" : "elever"}`].filter(Boolean).join(" · ");
                  return (
                    <Link key={g.key} href={oktHref(g.okter[0].id)} className={`${s.okt} ${pagar ? s.oktNaa : ""}`} aria-label={`Åpne øktdetalj: ${g.tittel}`}>
                      <span className={s.oktTopp}>
                        {g.omrader[0] ? <Omradeprikk omrade={g.omrader[0]} palett="kal" /> : null}
                        <span className={s.tall} style={{ fontSize: 11.5, fontWeight: 500, color: "var(--wtr-text-muted)" }}>{tidsrom(g.startMin, g.varighetMin)}</span>
                        {pagar ? <NaaMerke /> : null}
                      </span>
                      <span className={s.oktTittel}>{g.tittel}</span>
                      <span className={s.oktMeta}>{meta}</span>
                    </Link>
                  );
                })}
                {d.skole.length ? <p className={s.skoleLinje}>{d.skole.map((x) => x.tittel).join(" · ")}</p> : null}
                {tomDag && d.skole.length === 0 ? <p className={s.fri}>Ingen økter</p> : null}
              </section>
            );
          })}
        </div>
      ) : (
        <div className={s.mnd}>
          {DAG_KORT.map((h) => <span key={h} className={s.mhead}>{h}</span>)}
          {Array.from({ length: Math.round((new Date(`${til}T00:00:00Z`).getTime() - new Date(`${fra}T00:00:00Z`).getTime()) / 86_400_000) + 1 }, (_, i) => leggTilDager(fra, i)).map((dato) => {
            const ut = dato < mndStart || dato > mndSlutt;
            const d = dagInnhold(dato);
            const linjer = [...d.turn.map((t) => t.tittel.replace(/^Turnering:\s*/, "")), ...d.andre.map((t) => t.tittel), ...d.skole.map((x) => x.tittel)];
            const tom = !ut && d.okter.length === 0 && linjer.length === 0;
            const klasser = [s.celle, ut ? s.celleUt : "", dato === idag ? s.celleIdag : "", tom ? s.celleTom : ""].filter(Boolean).join(" ");
            const aria = `${DAG_LANG[ukedag(dato)]} ${ddmm(dato)}: ${d.okter.length} økter${linjer.length ? `, ${linjer.join(", ")}` : ""}`;
            const innhold = (
              <>
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className={s.tall} style={{ fontSize: 13, fontWeight: 700 }}>{Number(dato.slice(8, 10))}</span>
                  <span className={`${s.kunMobil} ${s.tall}`} style={{ fontSize: 12, color: "var(--wtr-text-muted)" }}>{DAG_KORT[ukedag(dato)]}</span>
                </span>
                <span style={{ display: "grid", gap: 3, minWidth: 0 }}>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {d.okter.flatMap((g) => g.omrader.map((o) => <Omradeprikk key={`${g.key}-${o}`} omrade={o} palett="kal" />))}
                  </span>
                  {linjer.slice(0, 2).map((l) => <span key={l} className={s.celleLinje}>{l}</span>)}
                </span>
              </>
            );
            return d.okter.length > 0 && !ut ? (
              <Link key={dato} href={param({ visning: "", mnd: "", uke: String(Math.round((new Date(`${mandagI(dato)}T00:00:00Z`).getTime() - new Date(`${mandagI(idag)}T00:00:00Z`).getTime()) / (7 * 86_400_000))) })} className={klasser} aria-label={aria}>{innhold}</Link>
            ) : (
              <div key={dato} className={klasser} aria-label={aria}>{innhold}</div>
            );
          })}
        </div>
      )}

      <p style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: "var(--wtr-font-display)", fontSize: 12, fontWeight: 500, color: "var(--wtr-text-muted)" }}>
        {OMRADER.map((o) => (
          <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Omradeprikk omrade={o} palett="kal" />{o} · {OMRADE_NAVN[o]}</span>
        ))}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flag size={14} strokeWidth={1.5} aria-hidden="true" className={s.flagg} />Turnering</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><NotebookPen size={14} strokeWidth={1.5} aria-hidden="true" />Samling, test og annet</span>
      </p>
    </div>
  );
}
