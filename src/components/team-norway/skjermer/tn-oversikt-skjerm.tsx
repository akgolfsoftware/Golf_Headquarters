import { notFound } from "next/navigation";

import { hentTnGruppetrening, hentTnSamlinger, hentTnTestdag, hentTnTestdager, type TnGruppetreningRad, type TnTestdagRad } from "@/lib/domain/tn-arbeidsflate";
import { hentGruppepostSide } from "@/lib/domain/tn-post";
import { summerTnGruppetrening, tnDenneMandag, tnUkenummer, UTENFOR_PLAN_TERSKEL } from "@/lib/domain/tn-trenger-deg";
import { TN } from "@/lib/v2/team-norway";
import { initialer } from "../initialer";
import { TnFlate, TnFlatehode, TnFotnote, TnInitialer, TnListerad, TnMangler, TnRutenett, TnSkjermhode, TnTekstlenke } from "../tn-flate";
import { TnFlere } from "../tn-flere";
import { TnFremdrift, TnStortTall, type TnAkse } from "../tn-grunnmur";
import { TnHandlingLenke } from "../tn-handlinger";
import { tnKnappStil } from "../tn-knapp-stil";
import { TnOktSkjema, TnSamlingSkjema } from "../tn-redigering-skjema";
import { TnBaand, TnBaandListe, TnBildekort, TnBildekortKilde, TnHelt, TnHeltAkser, TnHeltKnapper, TnHeltSporsmaal, TnHeltTall, TnHeltTekst, TnHeltTellere, TnMarkor, TnPlanstolpe, TnSpillerrad, type TnStatus } from "../tn-stall";
import { SkjermRamme, datoKort, hentSkjermbruker, osloDag, periode } from "./felles";

/**
 * TN-01 Landslagsoversikt. Utkast 2, retning B «Stall og helteflate» (godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-tn/daglig.html, skjerm Oversikt (pakke 2).
 * Hovedtallet er hvor mange spillere som trenger treneren nå, med båndet «Trenger deg»
 * under, neste samling som bildekort og fellestesten som stolpe.
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

  const [testdager, trening, postside] = await Promise.all([
    trener ? hentTnTestdager(bruker) : Promise.resolve(null),
    trener ? hentTnGruppetrening(bruker, naa) : Promise.resolve(null),
    hentGruppepostSide(kontekst.gruppe.id, bruker.id),
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
  const antallUnder = trenger.filter((t) => t.underPlan).length;
  const antallTest = trenger.filter((t) => t.manglerTest && !t.underPlan).length;

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

  const nesteTekst = neste ? `${dagerIgjen === 0 ? "pågår" : dagerIgjen === 1 ? "dag igjen" : "dager igjen"} · ${periode(neste.startDate, neste.endDate, true)}` : null;

  return (
    <SkjermRamme aktiv="oversikt" brukerNavn={bruker.name} kontekst={kontekst}>
      <TnSkjermhode overlinje={`${langDag.format(naa)} · uke ${tnUkenummer(mandag)}`} tittel="Oversikt" ingress={`${kontekst.gruppe.name}. Hvem som trenger deg, neste samling og fellestesten.`} />

      {trener ? (
        <TnHelt
          etikett="Hvem trenger deg nå"
          venstre={
            <>
              <TnHeltSporsmaal>Hvem trenger deg nå?</TnHeltSporsmaal>
              {trening ? (
                <>
                  <TnHeltTall verdi={trenger.length}>{trenger.length === 1 ? "spiller trenger deg" : "spillere trenger deg"}</TnHeltTall>
                  <TnHeltTekst>
                    {trenger.length === 0
                      ? `Ingen er under ${UTENFOR_PLAN_TERSKEL} % av planen to uker på rad${holdt ? ", og alle på testdagen er testet" : ""}.`
                      : [
                          antallUnder > 0 ? `${antallUnder === 1 ? "Én har" : `${antallUnder} har`} gjennomført under ${UTENFOR_PLAN_TERSKEL} % av planen uke ${ukeA} og ${ukeB}.` : null,
                          antallTest > 0 ? `${antallTest === 1 ? "Én" : antallTest} står som ikke testet fra fellestesten ${testDato}.` : null,
                        ].filter(Boolean).join(" ")}
                  </TnHeltTekst>
                </>
              ) : (
                <>
                  <TnHeltTall verdi="—" />
                  <TnHeltTekst>Spillernes trening kan bare leses av trenere som spillerne har delt med.</TnHeltTekst>
                </>
              )}
              <TnHeltKnapper>
                {trenger.length > 0 ? <a href="#trenger" style={tnKnappStil("hvit")}>{trenger.length === 1 ? "Se spilleren" : `Se de ${trenger.length}`}</a> : <TnHandlingLenke href="/team-norway/spillere" variant="hvit">Spillerutvikling</TnHandlingLenke>}
                {nyMeny}
              </TnHeltKnapper>
            </>
          }
          hoyre={
            <>
              <TnHeltAkser
                tittel={gruppe && gruppe.planlagtTimer > 0 ? `Gruppas trening uke ${ukeFra}–${ukeTil} · ${komma(gruppe.gjortTimer)} av ${komma(gruppe.planlagtTimer)} t` : `Gruppas trening uke ${ukeFra}–${ukeTil} · ingen delt plan`}
                timer={gruppe && gruppe.planlagtTimer > 0 ? gruppe.akseTimer : {}}
              />
              <TnHeltTellere
                tall={[
                  { verdi: neste ? dagerIgjen : "—", tekst: neste ? `dager til ${neste.name}` : "ingen samling planlagt" },
                  { verdi: testdag ? `${gjennomfort}/${testdag.dag.deltakere.length}` : "—", tekst: "har tatt fellestesten" },
                  { verdi: delerIkke ?? "—", tekst: "deler ikke treningen" },
                ]}
              />
            </>
          }
        />
      ) : (
        <TnHelt
          etikett="Neste samling"
          venstre={
            <>
              <TnHeltSporsmaal>Neste samling</TnHeltSporsmaal>
              <TnHeltTall verdi={neste ? dagerIgjen : "—"}>{neste ? nesteTekst : "Ingen samling planlagt"}</TnHeltTall>
              {neste ? <TnHeltTekst>{neste.name}{neste.location ? `, ${neste.location}` : ""}.</TnHeltTekst> : null}
              {neste ? <TnHeltKnapper><TnHandlingLenke href={`/team-norway/samlinger/${neste.id}`} variant="hvit">Se samlingen</TnHandlingLenke></TnHeltKnapper> : null}
            </>
          }
        />
      )}

      {trener && trening ? (
        <TnBaand id="trenger" status={trenger.length > 0 ? "trenger" : undefined} tittel="Trenger deg" antall={trenger.length} kilde="Mest akutt først">
          <TnBaandListe>
            {trenger.map((t) => {
              const pct = t.plan?.toUker.pct ?? null;
              const akse = (t.plan?.mestAkse ?? null) as TnAkse | null;
              return (
                <TnSpillerrad
                  key={t.spillerId}
                  // Bare spillere som har delt med Team Norway har en IUP treneren kan åpne.
                  href={t.plan ? `/team-norway/spiller/${t.spillerId}/oversikt` : undefined}
                  status="trenger"
                  initialer={initialer(t.navn)}
                  navn={t.navn}
                  fakta={t.klubb ?? "Klubb ikke registrert"}
                  verdi={pct === null ? "—" : `${pct} %`}
                  verdiTekst="av planen"
                  lav={pct !== null && pct < UTENFOR_PLAN_TERSKEL}
                  stolpe={t.plan && pct !== null ? (
                    <TnPlanstolpe
                      andel={pct / 100}
                      akse={akse}
                      etikett={`Gjennomført ${pct} prosent av planen uke ${ukeA} og ${ukeB}`}
                      venstre={akse ? `Mest ${akse}` : "Ingen gjennomført tid"}
                      hoyre={<><b>{komma(t.plan.toUker.gjortMin / 60)}</b> av <b>{komma(t.plan.toUker.planlagtMin / 60)}</b> t</>}
                    />
                  ) : undefined}
                  grunn={[
                    t.underPlan ? `Under ${UTENFOR_PLAN_TERSKEL} % av planen uke ${ukeA} og ${ukeB}` : null,
                    t.manglerTest ? `Ikke testet på fellestesten ${testDato}` : null,
                  ].filter(Boolean).join(" · ")}
                />
              );
            })}
            {trenger.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen spillere trenger deg nå, etter treningen de har delt og testdagen.</TnMangler></TnFlate> : null}
          </TnBaandListe>
          <TnTekstlenke href="/team-norway/spillere">{antallSpillere !== null ? `Alle ${flertall(antallSpillere, "spiller", "spillere")} i Spillerutvikling` : "Spillerutvikling"}</TnTekstlenke>
        </TnBaand>
      ) : null}

      <TnRutenett min={340}>
        {neste ? (
          <TnBildekort href={`/team-norway/samlinger/${neste.id}`} bilde="/team-norway/bilder/spill-bane.jpg" alt="Golfbane med fairway og green" navy>
            <TnBildekortKilde>Neste samling</TnBildekortKilde>
            <span style={{ display: "block", fontFamily: TN.font.display, fontWeight: 500, fontSize: 24, lineHeight: 1.2, letterSpacing: "0.02em", overflowWrap: "anywhere" }}>{neste.name}{neste.location ? ` ${neste.location}` : ""}</span>
            <TnStortTall verdi={dagerIgjen} paaNavy><span style={{ fontSize: 14.5, color: TN.rail.text }}>{nesteTekst}</span></TnStortTall>
            <span style={{ fontSize: 14.5, lineHeight: 1.55, color: TN.rail.text }}>{antallSpillere !== null ? `${flertall(antallSpillere, "spiller", "spillere")} i gruppa. Svar på samlingen registreres ikke ennå.` : "Svar på samlingen registreres ikke ennå."}</span>
            <span><span style={tnKnappStil("hvit")}>Se samlingen</span></span>
          </TnBildekort>
        ) : (
          <TnFlate style={{ background: TN.ink50, display: "grid", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Neste samling</span>
            <TnMangler>Ingen kommende samlinger er registrert for gruppen.</TnMangler>
            <TnTekstlenke href="/team-norway/samlinger">Samlinger og terminliste</TnTekstlenke>
          </TnFlate>
        )}

        <TnFlate style={{ display: "grid", gap: 12 }}>
          {!trener ? (
            <>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Fellestesting</span>
              <TnMangler>Trenerteamet fører testdagene. Egne Team Norway-tester registrerer du i PlayerHQ.</TnMangler>
              <TnTekstlenke href="/portal/tren/tester/team-norway">Mine tester</TnTekstlenke>
            </>
          ) : testdag ? (
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
      </TnRutenett>

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

      {trener ? <TnFotnote>Bare det spillerne har delt med Team Norway. Kilde: Workbench i PlayerHQ{testDato ? ` og testdagen ${testDato}` : ""}, hentet {datoKort(naa)}</TnFotnote> : null}
    </SkjermRamme>
  );
}

function poster(postside: Awaited<ReturnType<typeof hentGruppepostSide>>) {
  return (postside?.tidslinje ?? []).filter((p) => p.kind !== "DOKUMENT").slice(0, 3);
}
