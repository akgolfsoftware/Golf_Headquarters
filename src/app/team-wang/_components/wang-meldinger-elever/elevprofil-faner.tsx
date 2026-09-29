import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import {
  hentElevIup,
  hentElevPlan,
  hentElevStats,
  hentElevTester,
  hentElevTurneringer,
  type WangElevGrunn,
} from "@/app/team-wang/_data/wang-elever-data";
import { formaterSg, isoTilKort, isoTilNorsk, norskTall, osloIso, timerTekst } from "@/app/team-wang/_data/wang-elever-regler";
import { WangChips, WangFeil, WangKort, WangStatus, WangTabell, WangTag, type WangStatusTone } from "@/components/wang/trener/wang-ui";
import { elevprofilHref } from "@/lib/wang/wang-ruter";

import { IkkeKobletKort, KortHode, OmradeMerke, dagTekst, meStil as s, tidTekst } from "./felles";

/**
 * Fanene i WANG-44 Elevprofil. Hver fane henter sine egne data, slik at bare
 * den åpne fanen spør databasen. Manglende tall vises som «—».
 */

const FEIL_TEKST = "Ingenting er borte. Det eleven har ført ligger i PlayerHQ. Last siden på nytt om litt.";

// ---------------------------------------------------------------- Plan

export async function PlanFane({ elev }: { elev: WangElevGrunn }) {
  const na = new Date();
  let plan;
  try {
    plan = await hentElevPlan(elev.id, na);
  } catch {
    return <WangFeil tekst={FEIL_TEKST} />;
  }
  const [, , u38, u39] = plan.siste4;
  const toUkerUnder = u38.prosent !== null && u39.prosent !== null && u38.prosent < 70 && u39.prosent < 70;

  return (
    <div className={s.stabel}>
      {toUkerUnder ? (
        <WangFeil
          tittel="Under 70 % av planlagt tid to uker på rad."
          tekst={`${elev.fornavn} gjennomførte ${u38.prosent} % i uke ${u38.uke} og ${u39.prosent} % i uke ${u39.uke}. Ta en prat med ${elev.fornavn}.`}
        />
      ) : null}
      <div className={s.to}>
        {plan.uker.map((u) => (
          <WangKort key={u.startIso}>
            <KortHode
              tittel={`Uke ${u.uke} · ${isoTilKort(u.startIso)}–${isoTilKort(u.sluttIso)}`}
              meta={`${u.okter.length} ${u.okter.length === 1 ? "økt" : "økter"}${u.inneværende ? " · inneværende" : ""}`}
            />
            {u.okter.length === 0 ? (
              <p className={s.tomLinje}>Ingen økter i planen denne uka.</p>
            ) : (
              u.okter.map((o) => (
                <div key={o.id} className={s.rad}>
                  <span className={s.kolonne}>
                    <span className={s.radTittel}>{o.tittel}</span>
                    <span className={s.radMeta}>{dagTekst(o.datoIso)} · {tidTekst(o.startMinutt, o.varighetMin)}</span>
                  </span>
                  <OmradeMerke omrade={o.omrade} />
                </div>
              ))
            )}
          </WangKort>
        ))}
      </div>
      <div className={s.to}>
        <WangKort>
          <div style={{ padding: "18px 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div className={s.kolonne} style={{ gap: 4 }}>
              <h2 className={s.h2}>Siste fire uker</h2>
              <span className={s.metaTekst}>Gjennomført tid av planlagt tid</span>
            </div>
            {plan.siste4.map((u) => (
              <div key={u.startIso} className={s.ukeRad}>
                <span className={s.metaTekst} style={{ color: "var(--wtr-blue)" }}>Uke {u.uke}</span>
                <div className={`${s.bar} ${u.prosent !== null && u.prosent < 70 ? s.barLav : ""}`} role="img" aria-label={u.prosent === null ? "Ingen forfalte økter" : `${u.prosent} prosent`}>
                  <span style={{ width: `${Math.min(100, u.prosent ?? 0)}%` }} />
                </div>
                <span className={s.tall} style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                  {u.prosent === null ? "—" : `${timerTekst(u.gjennomfortMin)} av ${timerTekst(u.planlagtMin)} · ${u.prosent} %`}
                </span>
              </div>
            ))}
            <p className={s.fot}>Eleven fører gjennomføring i PlayerHQ. Bare økter som er over, teller.</p>
          </div>
        </WangKort>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Stats

export async function StatsFane({ elev }: { elev: WangElevGrunn }) {
  let st;
  try {
    st = await hentElevStats(elev.id);
  } catch {
    return <WangFeil tekst={FEIL_TEKST} />;
  }
  const kpi = [
    { etikett: "Snittscore", verdi: norskTall(st.snitt, 1), hint: st.antall ? `Siste ${st.antall} runder` : "Ingen runder", vekt: 800 },
    { etikett: "Strokes gained total", verdi: formaterSg(st.sgTotal), hint: "Per runde mot scratch", vekt: 300 },
    { etikett: "Kategori", verdi: st.kategori ?? "—", hint: st.kategoriNiva ? `${st.kategoriNiva} · AK Golf A–K etter snittscore` : "AK Golf A–K etter snittscore", vekt: 300 },
    { etikett: "Hcp", verdi: norskTall(elev.hcp, 1), hint: "Fra PlayerHQ", vekt: 300 },
  ];
  return (
    <div className={s.stabel}>
      {st.antall === 0 ? (
        <WangKort polstret>
          <p className={s.brod16}>Ingen registrerte 18-hullsrunder ennå. Verdiene står som —.</p>
        </WangKort>
      ) : null}
      <WangKort>
        <div className={s.kpi} aria-label="Nøkkeltall">
          {kpi.map((k) => (
            <div key={k.etikett}>
              <span className={s.metaTekst}>{k.etikett}</span>
              <span className={s.kpiVerdi} style={{ fontWeight: k.vekt }}>{k.verdi}</span>
              <span className={s.kpiHint}>{k.hint}</span>
            </div>
          ))}
        </div>
      </WangKort>
      <div className={s.to}>
        <WangKort>
          <KortHode tittel="Strokes gained per område" meta={`Per runde mot scratch · siste ${st.antall || 10} runder`} />
          {st.sg.map((g) => (
            <div key={g.navn} className={s.rad}>
              <span className={s.radTittel}>{g.navn}</span>
              <span className={s.tall} style={{ fontSize: 16 }}>{formaterSg(g.verdi)}</span>
            </div>
          ))}
          <p className={s.tomLinje} style={{ fontSize: 14, color: "var(--wtr-text-muted)" }}>
            Bare runder med lagret SG teller. Står et område som —, finnes ingen slagdata for det.
          </p>
        </WangKort>
        <WangKort>
          <KortHode tittel="Siste runder" />
          {st.runder.length === 0 ? (
            <p className={s.tomLinje}>Ingen runder registrert.</p>
          ) : (
            st.runder.map((r) => (
              <div key={r.id} className={s.rad}>
                <span className={s.kolonne}>
                  <span className={s.radTittel}>{r.bane}</span>
                  <span className={s.radMeta}>{isoTilNorsk(r.datoIso)} · 18 hull</span>
                </span>
                <span className={s.hoyre}>
                  <span className={s.tall} style={{ fontSize: 16 }}>{r.score}</span>
                  <span className={s.radMeta} style={{ fontSize: 12 }}>SG {formaterSg(r.sgTotal)}</span>
                </span>
              </div>
            ))
          )}
        </WangKort>
      </div>
      <p className={s.fot}>Kilde: runder eleven har registrert i PlayerHQ. Brutto score, bare 18 hull.</p>
    </div>
  );
}

// ---------------------------------------------------------------- Tester

const TESTFILTRE = [
  { id: "alle", navn: "Alle" },
  { id: "golf", navn: "Golf" },
  { id: "fysisk", navn: "Fysisk" },
] as const;

export async function TesterFane({ elev, filter }: { elev: WangElevGrunn; filter: string }) {
  let tester;
  try {
    tester = await hentElevTester(elev.id);
  } catch {
    return <WangFeil tekst={FEIL_TEKST} />;
  }
  const f = TESTFILTRE.find((x) => x.id === filter)?.id ?? "alle";
  const antall = { alle: tester.length, golf: tester.filter((t) => !t.fysisk).length, fysisk: tester.filter((t) => t.fysisk).length };
  const vis = tester.filter((t) => f === "alle" || (f === "fysisk" ? t.fysisk : !t.fysisk));
  const base = elevprofilHref(elev.id, "tester");

  return (
    <div className={s.stabel}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px" }}>
        <WangChips
          etikett="Testgruppe"
          valg={TESTFILTRE.map((x) => ({ etikett: `${x.navn} · ${antall[x.id]}`, href: x.id === "alle" ? base : `${base}&tester=${x.id}`, aktiv: x.id === f }))}
        />
        <span className={s.metaTekst}>{vis.length} {vis.length === 1 ? "test har" : "tester har"} resultat</span>
      </div>
      <WangKort>
        {vis.length === 0 ? (
          <p className={s.tomLinje} style={{ borderTop: 0 }}>Ingen testresultater registrert{f === "alle" ? "" : " i denne gruppen"}.</p>
        ) : (
          <WangTabell
            beskrivelse="Testresultater"
            kolonner={[
              { key: "test", etikett: "Test", bredde: "minmax(0,1.5fr)", helBredde: true },
              { key: "res", etikett: "Resultat", tall: true },
              { key: "meta", etikett: "Dato og hvem", bredde: "minmax(0,1.3fr)", helBredde: true },
              { key: "merke", etikett: "Merke", bredde: "auto" },
            ]}
            rader={vis.map((t) => ({
              id: t.id,
              celler: {
                test: (
                  <span className={s.kolonne}>
                    <span className={s.radTittel} style={{ fontSize: 14.5 }}>{t.navn}</span>
                    <span className={s.radMetaLiten} style={{ fontSize: 11.5 }}>{t.omrade}</span>
                  </span>
                ),
                res: <span className={s.tall} style={{ fontSize: 15 }}>{t.resultat}</span>,
                meta: <span className={s.radMeta}>{isoTilNorsk(t.datoIso)}{t.forer ? ` · ${t.forer}` : ""}</span>,
                merke: <WangTag>{t.merke}</WangTag>,
              },
            }))}
          />
        )}
      </WangKort>
      <p className={s.fot}>Kontrollert: ført av trener, for eksempel på testdag. Egenført: eleven har ført selv i PlayerHQ. Viser siste resultat per test.</p>
    </div>
  );
}

// ---------------------------------------------------------------- IUP

const MAL_STATUS: Record<string, { tekst: string; tone: WangStatusTone }> = {
  IKKE_STARTET: { tekst: "Ikke startet", tone: "planlagt" },
  PAA_VEI: { tekst: "På vei", tone: "pagar" },
  NAADD: { tekst: "Nådd", tone: "ferdig" },
};

function IupSeksjon({ nr, tittel, rader }: { nr: number; tittel: string; rader: Array<{ k: string; v: ReactNode }> }) {
  return (
    <WangKort>
      <div className={s.kortHodeRad} style={{ paddingTop: 14, paddingBottom: 8 }}>
        <h2 className={s.h2} style={{ flex: 1, minWidth: 0 }}>
          <span className={s.tall} style={{ color: "var(--wtr-text-muted)", marginRight: 8 }}>{nr}</span>
          {tittel}
        </h2>
      </div>
      {rader.map((r, i) => (
        <div key={`${r.k}-${i}`} className={s.kv}>
          <span className={s.metaTekst}>{r.k}</span>
          <span className={s.brod} style={{ minWidth: 0 }}>{r.v}</span>
        </div>
      ))}
    </WangKort>
  );
}

export async function IupFane({ elev, gruppeId, gruppeNavn, trenerNavn }: { elev: WangElevGrunn; gruppeId: string; gruppeNavn: string; trenerNavn: string }) {
  const na = new Date();
  let data;
  try {
    const [iup, stats, plan, turn, tester] = await Promise.all([
      hentElevIup(gruppeId, elev.id, na),
      hentElevStats(elev.id),
      hentElevPlan(elev.id, na),
      hentElevTurneringer(elev.id, na),
      hentElevTester(elev.id),
    ]);
    data = { iup, stats, plan, turn, tester };
  } catch {
    return <WangFeil tekst={FEIL_TEKST} />;
  }
  const { iup, stats, plan, turn, tester } = data;
  const periode = iup.navarende;
  const periodeMal = periode ? iup.mal.filter((m) => m.periodeId === periode.id) : [];
  const siste4Plan = plan.siste4.reduce((a, u) => a + u.planlagtMin, 0);
  const siste4Gj = plan.siste4.reduce((a, u) => a + u.gjennomfortMin, 0);
  const sisteTest = tester.map((t) => t.datoIso).sort().at(-1) ?? null;

  const seksjoner: Array<{ tittel: string; rader: Array<{ k: string; v: ReactNode }> }> = [
    {
      tittel: "Personinfo",
      rader: [
        { k: "Navn", v: elev.navn },
        { k: "Alder", v: elev.alder !== null ? `${elev.alder} år` : "—" },
        { k: "Skole og klasse", v: [gruppeNavn, elev.klasse].filter(Boolean).join(" · ") },
        { k: "Klubb", v: elev.klubb ?? "—" },
        { k: "Hcp", v: norskTall(elev.hcp, 1) },
        { k: "Kategori AK Golf", v: stats.snitt !== null ? `${stats.kategori} · ${stats.kategoriNiva} · snittscore ${norskTall(stats.snitt, 1)}` : "—" },
        { k: "Trener", v: trenerNavn },
      ],
    },
    {
      tittel: "Målsetting og oppfølging",
      rader: [
        { k: "Snittscore nå", v: norskTall(stats.snitt, 1) },
        { k: "Strokes gained total nå", v: formaterSg(stats.sgTotal) },
      ],
    },
    {
      tittel: periode ? `Mål i ${periode.navn.toLowerCase()}` : "Mål i perioden",
      rader: periodeMal.length
        ? periodeMal.map((m) => {
            const st = MAL_STATUS[m.status] ?? { tekst: m.status, tone: "planlagt" as const };
            return {
              k: m.akse,
              v: (
                <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px" }}>
                  <span>{m.tittel} · {m.egentidMinUke} min per uke</span>
                  <WangStatus tone={st.tone}>{st.tekst}</WangStatus>
                  <span className={s.radMeta}>Egen {m.egenvurdering ?? "—"} · trener {m.trenervurdering ?? "—"}</span>
                </span>
              ),
            };
          })
        : [{ k: "Mål", v: periode ? "Ingen mål satt for perioden." : "Ingen periode i årsplanen akkurat nå." }],
    },
    {
      tittel: "Årsplan",
      rader: iup.perioder.length
        ? iup.perioder.map((p) => ({ k: p.navn, v: `${isoTilNorsk(p.startIso)}–${isoTilNorsk(p.sluttIso)}${p.fokus ? ` · ${p.fokus}` : ""}` }))
        : [{ k: "Perioder", v: "—" }],
    },
    {
      tittel: "Turneringsplan",
      rader: turn.kommende.length
        ? turn.kommende.slice(0, 8).map((t) => ({ k: isoTilNorsk(osloIso(t.startDato)), v: t.navn }))
        : [{ k: "Kommende", v: "—" }],
    },
    {
      tittel: "Treningsøkter",
      rader: [
        { k: "Siste fire uker", v: siste4Plan > 0 ? `${Math.round((siste4Gj / siste4Plan) * 100)} % av planlagt tid · ${timerTekst(siste4Gj)} av ${timerTekst(siste4Plan)}` : "—" },
      ],
    },
    {
      tittel: "Tester",
      rader: [
        { k: "Resultater", v: `${tester.length} ${tester.length === 1 ? "test har" : "tester har"} resultat` },
        { k: "Siste test", v: sisteTest ? isoTilNorsk(sisteTest) : "—" },
      ],
    },
  ];

  return (
    <div className={s.stabel16}>
      <p className={s.brod16}>Innholdet hentes fra {elev.fornavn}s data i PlayerHQ og gruppas årsplan. Du endrer ikke IUP-en her.</p>
      {seksjoner.map((sek, i) => (
        <IupSeksjon key={sek.tittel} nr={i + 1} tittel={sek.tittel} rader={sek.rader} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Samtaler

export function SamtalerFane({ elev }: { elev: WangElevGrunn }) {
  return (
    <IkkeKobletKort
      tittel="Samtaleloggen er ikke tatt i bruk ennå."
      tekst={`Samtaler med ${elev.fornavn} og det dere avtalte, kan ikke lagres her ennå. Når loggen er på plass, vises samtalene her med dato og avtale.`}
    />
  );
}

// ---------------------------------------------------------------- Turneringer

export async function TurneringerFane({ elev }: { elev: WangElevGrunn }) {
  const na = new Date();
  let t;
  try {
    t = await hentElevTurneringer(elev.id, na);
  } catch {
    return <WangFeil tekst={FEIL_TEKST} />;
  }
  const denneUka = (d: Date) => {
    const iso = osloIso(d);
    const idag = osloIso(na);
    return iso >= idag && Number(new Date(`${iso}T00:00:00Z`)) - Number(new Date(`${idag}T00:00:00Z`)) < 7 * 86_400_000;
  };
  return (
    <div className={s.stabel}>
      <div className={s.to}>
        <WangKort>
          <KortHode tittel="Kommende" />
          {t.kommende.length === 0 ? (
            <p className={s.tomLinje}>Ingen kommende turneringer i PlayerHQ.</p>
          ) : (
            t.kommende.map((x) => (
              <div key={x.turneringId} className={s.rad}>
                <span className={s.kolonne}>
                  <span className={s.radTittel}>{x.navn}</span>
                  <span className={s.radMeta}>{isoTilNorsk(osloIso(x.startDato))}{x.klasse ? ` · ${x.klasse}` : ""}</span>
                </span>
                {denneUka(x.startDato) ? <WangTag>Denne uka</WangTag> : <span />}
              </div>
            ))
          )}
        </WangKort>
        <WangKort>
          <KortHode tittel="Siste" />
          {t.siste.length === 0 ? (
            <p className={s.tomLinje}>{t.koblet ? "Ingen spilte turneringer registrert." : t.tomGrunn || "Ingen spilte turneringer registrert."}</p>
          ) : (
            t.siste.map((x) => (
              <div key={x.turneringId} className={s.rad}>
                <span className={s.kolonne}>
                  <span className={s.radTittel}>
                    {x.kildeUrl ? (
                      <a href={x.kildeUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {x.navn}
                        <ExternalLink size={12} strokeWidth={1.5} aria-hidden="true" />
                      </a>
                    ) : (
                      x.navn
                    )}
                  </span>
                  <span className={s.radMeta}>{isoTilNorsk(osloIso(x.startDato))}{x.klasse ? ` · ${x.klasse}` : ""}</span>
                </span>
                <span className={s.hoyre}>
                  <span className={s.tall} style={{ fontSize: 15, whiteSpace: "nowrap" }}>{x.brutto ?? "—"}</span>
                  <span className={s.radMeta} style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {x.plasseringTekst ?? (x.plassering !== null ? `${x.plassering}. plass` : "—")} · {x.motPar === null ? "—" : x.motPar > 0 ? `+${x.motPar}` : x.motPar === 0 ? "E" : `−${Math.abs(x.motPar)}`}
                  </span>
                </span>
              </div>
            ))
          )}
        </WangKort>
      </div>
      <p className={s.fot}>Brutto score og plassering kommer fra AK Golf pipelines. WANG melder ikke på og bekrefter ingenting. Påmelding gjør eleven selv.</p>
    </div>
  );
}
