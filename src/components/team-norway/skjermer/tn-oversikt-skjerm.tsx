import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { hentTnGruppetrening, hentTnSamlinger, hentTnTestdag, hentTnTestdager, hentTnTurneringer, type TnGruppetreningRad, type TnTestdagRad } from "@/lib/domain/tn-arbeidsflate";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { summerTnGruppetrening, tnDenneMandag, tnUkenummer, UTENFOR_PLAN_TERSKEL } from "@/lib/domain/tn-trenger-deg";
import { TN } from "@/lib/v2/team-norway";
import { initialer } from "../initialer";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnTekstlenke } from "../tn-flate";
import { TnFlere } from "../tn-flere";
import { TN_AKSER, TnFremdrift, TnStortTall } from "../tn-grunnmur";
import { TnHandlingLenke } from "../tn-handlinger";
import { tnKnappStil } from "../tn-knapp-stil";
import { TnNedtelling } from "../tn-nedtelling";
import { TnOktSkjema, TnSamlingSkjema } from "../tn-redigering-skjema";
import k from "../tn-skra.module.css";
import { TnMarkor, type TnStatus } from "../tn-stall";
import { SkjermRamme, datoKort, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-01 Landslagsoversikt. Retning «Skrå» (Anders 19.10.2026, beslutninger.md
 * §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ»). Fasit: docs/design-system/utkast-tn/nye-veier.html,
 * retning 1. Ekte bilde fra Team Norway Golf-merket kuttet 4° med rød kant, og fire kort
 * over kanten: saker som venter, gruppas trening, neste samling med nedtelling og
 * turnering nå. Fellestesten og gruppepostene står under.
 *
 * Avvik:
 *   - «Trenger deg» bruker AgencyOS-regelen (under 70 % av planen to uker på rad)
 *     på delt trening i Workbench, pluss spillere som står som «Ikke testet» på en
 *     testdag som er holdt. Anders har ikke bekreftet regelen for Team Norway
 *     (README utkast-tn, spørsmål 13). Spillere som ikke deler, er ikke med.
 *   - Svar på samlingen (ja / venter / kan ikke) har ingen datamodell. Bildekortet
 *     og tellerne viser dager igjen og antall spillere i gruppa i stedet.
 *   - Kategori A–K og klasse finnes ikke i spillerraden; raden viser klubb.
 *   - Gruppas trening per akse er med, slik utkastet viser (spørsmål 1 er ikke besvart).
 *   - Gruppepostene viser rollen i gruppen, ikke stillingstittel.
 *   - «I turnering nå» viser plass og brutto slik resultatkildene har dem; score per
 *     hull og til par finnes ikke i turneringsdataene her.
 *   - Menyen (hvit topplinje med piller i utkastet) og skriften (Schibsted Grotesk) er
 *     uavklart; navy sidemeny og Jost/Lato står til Anders har svart.
 */

const klokke = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

function dagnummer(dato: Date) {
  const d = osloDag(dato);
  return Date.UTC(d.aar, d.maned - 1, d.dag) / 864e5;
}

/** «i dag 08:14», «i går 19:02» eller «23.09 15:45». */
function postTid(dato: Date, naa: Date) {
  const diff = dagnummer(naa) - dagnummer(dato);
  const dag = diff === 0 ? "i dag" : diff === 1 ? "i går" : datoKort(dato);
  return `${dag} ${klokke.format(dato)}`;
}

/** Status på testdagen for dem som ikke har gjennomført. Ordet står alltid ved fargen. */
const MANGEL: Record<"PENDING" | "SKIPPED" | "ABSENT", { tekst: string; status: TnStatus }> = {
  PENDING: { tekst: "Ikke testet", status: "folgmed" },
  SKIPPED: { tekst: "Hoppet over", status: "ikkedelt" },
  ABSENT: { tekst: "Fravær", status: "ikkedelt" },
};
const langDag = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Oslo" });
const time = new Intl.DateTimeFormat("nb-NO", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Oslo" });

/** Hilsen etter klokka i Oslo. */
function hilsen(naa: Date) {
  const t = Number(time.format(naa));
  return t < 10 ? "God morgen" : t < 18 ? "God dag" : "God kveld";
}

/** Turneringen pågår fra startdagen til og med dagen etter siste dag. */
function pagar(start: Date | null, slutt: Date | null, naa: Date) {
  return start !== null && start.getTime() <= naa.getTime() && (slutt ?? start).getTime() + 864e5 >= naa.getTime();
}
const komma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");
const flertall = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Testdagen oversikten følger: pågående, ellers neste planlagte, ellers den siste som er holdt. */
function velgTestdag(dager: TnTestdagRad[], naa: Date) {
  const aktiv = dager.find((d) => d.status === "ACTIVE");
  if (aktiv) return aktiv;
  const kommende = dager.filter((d) => d.status === "PLANNED" && d.scheduledAt.getTime() >= naa.getTime()).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  return kommende[0] ?? dager.find((d) => d.status !== "CANCELLED") ?? null;
}

type TrengerRad = { spillerId: string; navn: string; klubb: string | null; plan: TnGruppetreningRad["trening"] | null; underPlan: boolean; manglerTest: boolean };

export async function TnOversiktSkjerm() {
  const bruker = await hentSkjermbruker();
  const samlingsdata = await hentTnSamlinger(bruker);
  if (!samlingsdata) notFound();
  const { kontekst } = samlingsdata;
  const naa = new Date();
  const trener = !kontekst.erSpiller;

  const [testdager, trening, postside, turneringsdata] = await Promise.all([
    trener ? hentTnTestdager(bruker) : Promise.resolve(null),
    trener ? hentTnGruppetrening(bruker, naa) : Promise.resolve(null),
    hentGruppepostSide(kontekst.gruppe.id, bruker.id),
    trener ? hentTnTurneringer(bruker) : Promise.resolve(null),
  ]);

  const neste = [...samlingsdata.samlinger].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).find((s) => s.endDate.getTime() >= naa.getTime()) ?? null;
  const dagerIgjen = neste ? Math.max(0, dagnummer(neste.startDate) - dagnummer(naa)) : null;
  const antallSpillere = samlingsdata.antallSpillere;

  const testdagRad = testdager ? velgTestdag(testdager.dager, naa) : null;
  const testdag = testdagRad ? await hentTnTestdag(bruker, testdagRad.id) : null;
  const holdt = testdag ? testdag.dag.status === "ACTIVE" || testdag.dag.status === "COMPLETED" || testdag.dag.scheduledAt.getTime() < naa.getTime() : false;
  const mangler = testdag ? testdag.dag.deltakere.filter((d) => d.status !== "DONE") : [];
  const gjennomfort = testdag ? testdag.dag.deltakere.length - mangler.length : 0;

  // «Trenger deg»: under planen to uker på rad, eller ikke testet på en testdag som er holdt.
  const rader = trening?.rader ?? [];
  const perSpiller = new Map<string, TrengerRad>();
  for (const r of rader) {
    if (r.trening.underPlan) perSpiller.set(r.spillerId, { spillerId: r.spillerId, navn: r.navn, klubb: r.klubb, plan: r.trening, underPlan: true, manglerTest: false });
  }
  if (holdt && testdag) {
    for (const d of testdag.dag.deltakere.filter((x) => x.status === "PENDING")) {
      const fra = rader.find((r) => r.spillerId === d.spillerId);
      const finnes = perSpiller.get(d.spillerId);
      perSpiller.set(d.spillerId, finnes ? { ...finnes, manglerTest: true } : { spillerId: d.spillerId, navn: d.spillerNavn, klubb: fra?.klubb ?? null, plan: fra?.trening ?? null, underPlan: false, manglerTest: true });
    }
  }
  const trenger = [...perSpiller.values()].sort((a, b) => Number(b.underPlan) - Number(a.underPlan) || (a.plan?.toUker.pct ?? 101) - (b.plan?.toUker.pct ?? 101) || a.navn.localeCompare(b.navn, "nb"));

  const mandag = tnDenneMandag(naa);
  const ukeFra = tnUkenummer(mandag - 28 * 864e5);
  const ukeTil = tnUkenummer(mandag - 7 * 864e5);
  const ukeA = tnUkenummer(mandag - 14 * 864e5);
  const ukeB = ukeTil;
  const gruppe = trening ? summerTnGruppetrening(rader.map((r) => r.trening)) : null;
  const delerIkke = trening && antallSpillere !== null ? Math.max(0, antallSpillere - rader.length) : null;
  const testDato = testdag ? datoKort(testdag.dag.scheduledAt) : null;

  const nyMeny = kontekst.kanAdministrere ? (
    <TnFlere knapp="Ny" variant={trener ? "konturHvit" : "sekundar"}>
      <TnSamlingSkjema knapp="Ny samling" variant="meny" />
      <TnOktSkjema knapp="Ny økt" variant="meny" />
      <TnHandlingLenke href="/team-norway/fellestesting" variant="meny">Ny testdag</TnHandlingLenke>
      <TnHandlingLenke href={`/team-norway/${kontekst.gruppe.id}`} variant="meny">Nytt innlegg</TnHandlingLenke>
    </TnFlere>
  ) : null;


  // Turnering nå: pågående turneringer med spillere som deler med Team Norway.
  const navn = new Map(rader.map((r) => [r.spillerId, r.navn]));
  const turneringer = turneringsdata?.turneringer ?? [];
  const naaTurneringer = turneringer.filter((t) => pagar(t.startDate, t.endDate, naa)).slice(0, 2);
  const nesteTurnering = turneringer.filter((t) => t.startDate !== null && t.startDate.getTime() > naa.getTime()).sort((a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0))[0] ?? null;
  const iTurnering = new Set(naaTurneringer.flatMap((t) => [...t.entries.map((e) => e.userId), ...t.results.map((r) => r.userId)])).size;

  const etterlevelse = gruppe && gruppe.planlagtTimer > 0 ? Math.round((gruppe.gjortTimer / gruppe.planlagtTimer) * 100) : null;
  const akseSum = gruppe ? TN_AKSER.reduce((sum, a) => sum + (gruppe.akseTimer[a] ?? 0), 0) : 0;

  const ingress = [
    iTurnering > 0 && naaTurneringer[0] ? `${iTurnering === 1 ? "Én spiller er" : `${iTurnering} spillere er`} ute på ${naaTurneringer[0].name}.` : null,
    neste ? (dagerIgjen === 0 ? `${neste.name} pågår.` : `${neste.name} starter om ${flertall(dagerIgjen ?? 0, "dag", "dager")}.`) : "Ingen samling er planlagt.",
  ].filter(Boolean).join(" ");

  const forsinkelse = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <SkjermRamme aktiv="oversikt" brukerNavn={bruker.name} kontekst={kontekst}>
      <div className={k.hjem}>
        <div className={k.topp}>
          <div className={k.foto}>
            <Image src="/team-norway/bilder/spiller-ved-vannet.jpg" alt="" fill priority sizes="100vw" />
          </div>
        </div>
        <section className={k.toppInnhold} aria-label="Oversikt">
          <div>
            <div className={k.overlinje}>{langDag.format(naa)} · uke {tnUkenummer(mandag)}</div>
            <h1 className={k.tittel}>
              {hilsen(naa)}.{" "}
              {!trener ? (
                <>Neste samling er <em>{neste ? (dagerIgjen === 0 ? "i gang" : `om ${flertall(dagerIgjen ?? 0, "dag", "dager")}`) : "ikke planlagt"}</em>.</>
              ) : trening === null ? null : trenger.length === 0 ? (
                <>Ingen saker venter på deg.</>
              ) : (
                <><em>{flertall(trenger.length, "sak", "saker")}</em> venter på deg.</>
              )}
            </h1>
            <p className={k.ingress}>
              {trener && trening === null ? "Spillernes trening kan bare leses av trenere som spillerne har delt med." : `${kontekst.gruppe.name}. ${ingress}`}
            </p>
            <div className={k.knapper}>
              {trener && trenger.length > 0 ? <a href="#trenger" style={tnKnappStil("hvit")}>{trenger.length === 1 ? "Se saken" : `Se de ${trenger.length}`}</a> : <TnHandlingLenke href="/team-norway/spillere" variant="hvit">Spillerutvikling</TnHandlingLenke>}
              {nyMeny}
            </div>
          </div>
          {trener ? (
            <div className={k.tall}>
              <div className={k.stat}><b>{etterlevelse === null ? "—" : `${etterlevelse} %`}</b><span>Gjennomført av planen, 4 uker</span></div>
              <div className={k.stat}><b>{antallSpillere === null ? "—" : `${rader.length}/${antallSpillere}`}</b><span>Deler treningen</span></div>
              <div className={k.stat}><b>{gruppe ? `${komma(gruppe.gjortTimer)} t` : "—"}</b><span>Treningstid gruppa, 4 uker</span></div>
            </div>
          ) : null}
        </section>

        <div className={k.kort}>
          <div className={k.kolonne}>
            {trener ? (
              <section id="trenger" className={k.flate} style={forsinkelse(0)} aria-labelledby="tn-saker">
                <h2 id="tn-saker" className={k.flateHode}>Hvem trenger deg nå <Link href="/team-norway/spillere">Alle spillere</Link></h2>
                <p className={k.kilde}>Under {UTENFOR_PLAN_TERSKEL} % av planen uke {ukeA} og {ukeB}, eller ikke testet. Mest akutt først.</p>
                {trening === null ? (
                  <p className={k.tom}>—. Spillernes trening kan bare leses av trenere som spillerne har delt med.</p>
                ) : trenger.length === 0 ? (
                  <p className={k.tom}>Ingen spillere trenger deg nå, etter treningen de har delt og testdagen.</p>
                ) : (
                  <div className={k.liste}>
                    {trenger.map((t) => {
                      const pct = t.plan?.toUker.pct ?? null;
                      const grunn = [t.underPlan ? `Under ${UTENFOR_PLAN_TERSKEL} % av planen` : null, t.manglerTest ? `Ikke testet ${testDato ?? ""}`.trim() : null].filter(Boolean).join(" · ");
                      const innhold = (
                        <>
                          <span className={k.avatar} aria-hidden="true">{initialer(t.navn)}</span>
                          <span className={k.hvem}><b>{t.navn}</b><span>{grunn}{t.klubb ? ` · ${t.klubb}` : ""}</span></span>
                          <span className={k.verdi}><b className={pct !== null && pct < UTENFOR_PLAN_TERSKEL ? k.lav : undefined}>{pct === null ? "—" : `${pct} %`}</b><span>av planen</span></span>
                        </>
                      );
                      // Bare spillere som har delt med Team Norway har en IUP treneren kan åpne.
                      return t.plan ? <Link key={t.spillerId} className={k.rad} href={`/team-norway/spiller/${t.spillerId}/oversikt`}>{innhold}</Link> : <div key={t.spillerId} className={k.rad}>{innhold}</div>;
                    })}
                  </div>
                )}
              </section>
            ) : (
              <section className={k.flate} style={forsinkelse(0)} aria-labelledby="tn-tester">
                <h2 id="tn-tester" className={k.flateHode}>Fellestesting <Link href="/portal/tren/tester/team-norway">Mine tester</Link></h2>
                <p className={k.tom}>Trenerteamet fører testdagene. Egne Team Norway-tester registrerer du i PlayerHQ.</p>
              </section>
            )}

            {trener ? (
              <section className={k.flate} style={forsinkelse(2)} aria-labelledby="tn-trening">
                <h2 id="tn-trening" className={k.flateHode}>Gruppas trening, uke {ukeFra}–{ukeTil} <Link href="/team-norway/manedsplan">Månedsplan</Link></h2>
                <p className={k.kilde}>{gruppe && gruppe.planlagtTimer > 0 ? `${komma(gruppe.gjortTimer)} av ${komma(gruppe.planlagtTimer)} t gjennomført` : "Ingen delt plan"}{delerIkke ? ` · ${flertall(delerIkke, "spiller deler", "spillere deler")} ikke` : ""}</p>
                <div className={k.stabel} role="img" aria-label={TN_AKSER.map((a) => `${a} ${gruppe ? `${komma(gruppe.akseTimer[a] ?? 0)} timer` : "—"}`).join(", ")}>
                  {gruppe && akseSum > 0 ? TN_AKSER.map((a, i) => ((gruppe.akseTimer[a] ?? 0) > 0 ? <i key={a} style={{ flex: gruppe.akseTimer[a], background: TN.akse[a].fyll, ...forsinkelse(i) }} /> : null)) : null}
                </div>
                <div className={k.forklaring}>
                  {TN_AKSER.map((a) => (
                    <span key={a}><i style={{ background: TN.akse[a].fyll }} />{a} <b>{gruppe && akseSum > 0 ? `${Math.round(((gruppe.akseTimer[a] ?? 0) / akseSum) * 100)} %` : "—"}</b></span>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className={k.kolonne}>
            {neste ? (
              <Link href={`/team-norway/samlinger/${neste.id}`} className={`${k.flate} ${k.samling}`} style={forsinkelse(1)} aria-label={`Neste samling: ${neste.name}`}>
                <div className={k.samlingBilde}>
                  <Image src="/team-norway/bilder/putting-green.jpg" alt="" fill sizes="(min-width: 900px) 420px, 100vw" />
                  <div className={k.samlingTekst}>
                    <b>{neste.name}{neste.location ? ` · ${neste.location}` : ""}</b>
                    <span>{periode(neste.startDate, neste.endDate, true)}{antallSpillere !== null ? ` · ${flertall(antallSpillere, "spiller", "spillere")}` : ""}</span>
                  </div>
                </div>
                <div className={k.samlingKropp}>
                  {neste.startDate.getTime() > naa.getTime() ? (
                    <TnNedtelling til={neste.startDate.toISOString()} fra={naa.toISOString()} etikett={`Tid til ${neste.name} starter`} />
                  ) : (
                    <span className={k.flateHode}>Samlingen pågår til {datoKort(neste.endDate)}</span>
                  )}
                  <span className={k.kilde}>Svar på samlingen registreres ikke ennå.</span>
                </div>
              </Link>
            ) : (
              <section className={k.flate} style={forsinkelse(1)} aria-labelledby="tn-samling">
                <h2 id="tn-samling" className={k.flateHode}>Neste samling <Link href="/team-norway/samlinger">Samlinger</Link></h2>
                <p className={k.tom}>Ingen kommende samlinger er registrert for gruppen.</p>
              </section>
            )}

            {trener ? (
              <section className={k.flate} style={forsinkelse(3)} aria-labelledby="tn-turnering">
                <h2 id="tn-turnering" className={k.flateHode}>
                  <span>{naaTurneringer.length > 0 ? <span className={k.livePrikk} aria-hidden="true" /> : null}I turnering nå</span>
                  <Link href="/team-norway/turneringer">Turneringer</Link>
                </h2>
                {turneringsdata === null ? (
                  <p className={k.tom}>—. Turneringene leses bare for spillere som har delt med Team Norway.</p>
                ) : naaTurneringer.length === 0 ? (
                  <p className={k.tom}>Ingen av spillerne er i turnering nå.{nesteTurnering?.startDate ? ` Neste: ${nesteTurnering.name}, ${datoKort(nesteTurnering.startDate)}.` : ""}</p>
                ) : (
                  naaTurneringer.map((t) => {
                    const ider = [...new Set([...t.entries.map((e) => e.userId), ...t.results.map((r) => r.userId)])];
                    return (
                      <div key={t.id}>
                        <p className={k.kilde}><Link href={`/team-norway/turneringer/${t.id}`} style={{ color: "inherit" }}>{t.name}</Link>{t.location ? ` · ${t.location}` : ""}</p>
                        {ider.map((uid) => {
                          const r = t.results.find((x) => x.userId === uid);
                          return (
                            <div key={uid} className={k.liveRad}>
                              <span>{navn.get(uid) ?? "Spiller"}</span>
                              <b>{r?.position != null ? `${r.position}. plass` : "—"}{r?.score != null ? ` · ${r.score}` : ""}</b>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </section>
            ) : null}
          </div>
        </div>
      </div>

      {trener ? (
        <TnFlate style={{ display: "grid", gap: 12 }}>
          {testdag ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "4px 12px" }}>
                <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>Fellestest · {testdag.dag.title}</span>
                <span style={{ fontSize: 12.5, color: TN.ink500 }}>Testdag {testDato}</span>
              </div>
              <TnStortTall verdi={gjennomfort} enhet={`/ ${testdag.dag.deltakere.length}`}>
                <span style={{ fontSize: 14.5, color: TN.ink700 }}>har gjennomført {testdag.dag.protokollNavn}</span>
              </TnStortTall>
              <TnFremdrift andel={testdag.dag.deltakere.length === 0 ? 0 : gjennomfort / testdag.dag.deltakere.length} etikett="Gjennomført" maks={testdag.dag.deltakere.length} naa={gjennomfort} />
              <div style={{ borderTop: `1px solid ${TN.ink200}` }}>
                {mangler.slice(0, 6).map((d) => {
                  const m = MANGEL[d.status as keyof typeof MANGEL];
                  const klubb = rader.find((r) => r.spillerId === d.spillerId)?.klubb;
                  return <TnListerad key={d.id} tittel={d.spillerNavn} tekst={klubb ?? "Klubb ikke registrert"} hoyre={m ? <TnMarkor status={m.status}>{m.tekst}</TnMarkor> : null} />;
                })}
              </div>
              {mangler.length === 0 ? <TnMangler>Alle på testdagen har gjennomført.</TnMangler> : null}
              {mangler.length > 6 ? <TnFotnote>Og {mangler.length - 6} til.</TnFotnote> : null}
              <TnTekstlenke href={`/team-norway/fellestesting?dag=${testdag.dag.id}`}>Før resultater</TnTekstlenke>
            </>
          ) : (
            <>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Fellestesting</span>
              <TnMangler>Ingen testdag er planlagt for gruppen.</TnMangler>
              <TnTekstlenke href="/team-norway/fellestesting">Til fellestesting</TnTekstlenke>
            </>
          )}
        </TnFlate>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <TnFlatehode tittel="Gruppeposter" merknad={poster(postside).length > 0 ? `Siste ${poster(postside).length}` : undefined} />
        <TnFlate style={{ paddingBlock: 4 }}>
          {postside === null ? (
            <TnMangler>Gruppepostene vises bare for medlemmer av gruppen.</TnMangler>
          ) : poster(postside).length === 0 ? (
            <TnMangler>Trenerteamet har ikke skrevet noe til gruppen ennå.</TnMangler>
          ) : (
            poster(postside).map((p, i, alle) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "36px minmax(0, 1fr)", gap: 12, padding: "14px 0", borderBottom: i === alle.length - 1 ? "none" : `1px solid ${TN.ink200}` }}>
                <TnInitialer navn={p.authorNavn} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", alignItems: "baseline" }}>
                    <b style={{ fontSize: 14.5, lineHeight: 1.3 }}>{p.authorNavn}</b>
                    <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, letterSpacing: "0.01em", color: TN.ink500 }}>
                      {postside.forfatterRoller[p.authorUserId] ?? "Trener"} · {postTid(p.createdAt, naa)}
                    </span>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "4px 0 0", maxWidth: "72ch", overflowWrap: "anywhere", whiteSpace: "pre-line", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.tekst}</p>
                </div>
              </div>
            ))
          )}
        </TnFlate>
        {postside ? <TnTekstlenke href={`/team-norway/${kontekst.gruppe.id}`}>Alle gruppeposter</TnTekstlenke> : null}
      </section>

      {trener ? <TnFotnote>Bare det spillerne har delt med Team Norway. Kilde: Workbench i PlayerHQ{testDato ? `, testdagen ${testDato}` : ""} og turneringskatalogen, hentet {datoKort(naa)}</TnFotnote> : null}
    </SkjermRamme>
  );
}

function poster(postside: Awaited<ReturnType<typeof hentGruppepostSide>>) {
  return (postside?.tidslinje ?? []).filter((p) => p.kind !== "DOKUMENT").slice(0, 3);
}
