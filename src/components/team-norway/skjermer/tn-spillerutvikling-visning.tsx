import type { TnArbeidskontekst, TnGruppetreningRad, TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import { WAGR_KILDE, type TnApenSpillerRad } from "@/lib/domain/tn-spillerliste-regler";
import { summerTnGruppetrening, tnDenneMandag, tnUkenummer, UTENFOR_PLAN_TERSKEL } from "@/lib/domain/tn-trenger-deg";
import { TN } from "@/lib/v2/team-norway";
import { initialer } from "../initialer";
import { TnFlate, TnFotnote, TnMangler, TnTekstlenke } from "../tn-flate";
import type { TnAkse } from "../tn-grunnmur";
import { TnHandlingLenke } from "../tn-handlinger";
import { tnKnappStil } from "../tn-knapp-stil";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { TnBaand, TnBaandListe, TnHeltKnapper, TnHeltTall, TnHeltTekst, TnHeltTellere, TnPlanstolpe, TnSpillerrad } from "../tn-stall";
import { datoKort } from "./felles";
import st from "./tn-spillere.module.css";

const hcpTall = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const komma = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",");

function hcp(verdi: number | null) {
  if (verdi === null) return "HCP —";
  return `HCP ${verdi < 0 ? `+${hcpTall.format(-verdi)}` : hcpTall.format(verdi)}`;
}

/** Selve skjermen, uten datahenting. Brukes av siden og av skjermprøven (tests/visual/team-norway). */
export function TnSpillerutviklingVisning({
  brukerNavn,
  kontekst,
  visDataGolf,
  rader,
  apne,
  trening: treningRader,
  antallSpillere,
  q,
  naa,
}: {
  brukerNavn: string | null;
  kontekst: TnArbeidskontekst;
  visDataGolf: boolean;
  rader: TnSpillerRad[];
  /** Alle spillere i gruppa med åpne tall; `null` når de ikke er hentet. */
  apne: TnApenSpillerRad[] | null;
  trening: TnGruppetreningRad[] | null;
  antallSpillere: number | null;
  q: string;
  naa: Date;
}) {
  const data = { kontekst, rader };
  const trening = treningRader ? { rader: treningRader } : null;
  const samlingsdata = { antallSpillere };
  const treningPer = new Map((trening?.rader ?? []).map((r) => [r.spillerId, r.trening]));
  const passer = (s: TnSpillerRad) => !q || `${s.navn} ${s.klubb ?? ""}`.toLowerCase().includes(q.toLowerCase());

  const passerApen = (a: TnApenSpillerRad) => !q || a.navn.toLowerCase().includes(q.toLowerCase());

  type Rad = { s: TnSpillerRad; t: NonNullable<ReturnType<typeof treningPer.get>>; pct: number | null };
  const delt: Rad[] = data.rader.flatMap((s) => {
    const t = treningPer.get(s.id);
    return t ? [{ s, t, pct: t.fireUker.planlagtMin > 0 ? Math.round((t.fireUker.gjortMin / t.fireUker.planlagtMin) * 100) : null }] : [];
  });
  const trenger = delt.filter((r) => r.t.underPlan).sort((a, b) => (a.t.toUker.pct ?? 101) - (b.t.toUker.pct ?? 101));
  const folger = delt.filter((r) => !r.t.underPlan && r.pct !== null).sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const utenPlan = delt.filter((r) => !r.t.underPlan && r.pct === null);
  // Alle i gruppa (fra samlingsdataene) minus dem treneren kan lese: spillere som ikke har delt, er ikke i radene.
  const ikkeDelt = (apne ?? []).filter((a) => !a.delt);
  const antallIkkeDelt = apne ? ikkeDelt.length : samlingsdata?.antallSpillere != null ? Math.max(0, samlingsdata.antallSpillere - data.rader.length) : null;
  const wagrDato = ikkeDelt.find((a) => a.wagrDato)?.wagrDato ?? null;

  const gruppe = summerTnGruppetrening(delt.map((r) => r.t));
  const gruppePct = gruppe.planlagtTimer > 0 ? Math.round((gruppe.gjortTimer / gruppe.planlagtTimer) * 100) : null;
  const mandag = tnDenneMandag(naa);
  const ukeA = tnUkenummer(mandag - 14 * 864e5);
  const ukeB = tnUkenummer(mandag - 7 * 864e5);

  const rad = ({ s, t, pct }: Rad, status: "trenger" | "folger" | "folgmed") => {
    const akse = t.mestAkse as TnAkse | null;
    return (
      <TnSpillerrad
        key={s.id}
        href={`/team-norway/spiller/${s.id}/oversikt`}
        status={status}
        initialer={initialer(s.navn)}
        navn={s.navn}
        fakta={`${s.skole ?? s.klubb ?? "Skole ikke registrert"} · ${hcp(s.hcp)}`}
        verdi={pct === null ? "—" : `${pct} %`}
        verdiTekst={pct === null ? "ingen plan" : "av planen"}
        lav={status === "trenger" && pct !== null}
        stolpe={pct !== null ? (
          <TnPlanstolpe
            andel={pct / 100}
            akse={akse}
            etikett={`Gjennomført ${pct} prosent av planen siste fire uker`}
            venstre={akse ? `Mest ${akse}` : "Ingen gjennomført tid"}
            hoyre={<><b>{komma(t.fireUker.gjortMin / 60)}</b> av <b>{komma(t.fireUker.planlagtMin / 60)}</b> t</>}
          />
        ) : undefined}
        grunn={status === "trenger" ? `Under ${UTENFOR_PLAN_TERSKEL} % av planen uke ${ukeA} og ${ukeB}` : undefined}
      />
    );
  };

  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater={!kontekst.erSpiller} kanAdministrere={kontekst.kanAdministrere} visDataGolf={!kontekst.erSpiller && visDataGolf}>
      <TnSkraTopp
        bilde="spiller-ved-vannet"
        etikett="Spillere"
        overlinje={`${data.kontekst.gruppe.name} · uke ${tnUkenummer(mandag)}`}
        tittel="Spillere"
        ingress="Hvem som trenger deg, hvem som følger planen, og hvem som ikke har delt treningen."
        venstre={
          <>
            {trening && gruppePct !== null ? (
              <>
                <TnHeltTall verdi={gruppePct} enhet="%">av planen gjennomført</TnHeltTall>
                <TnHeltTekst>Siste fire uker, for {delt.length} {delt.length === 1 ? "spiller som deler" : "som deler"} treningen. {trenger.length === 1 ? "Én spiller trenger deg." : `${trenger.length} spillere trenger deg.`}</TnHeltTekst>
              </>
            ) : (
              <>
                <TnHeltTall verdi="—" />
                <TnHeltTekst>{trening ? "Ingen planlagt trening siste fire uker i det spillerne har delt." : "Spillernes trening kan bare leses av trenere som spillerne har delt med."}</TnHeltTekst>
              </>
            )}
            <TnHeltKnapper>
              {trenger.length > 0 ? <a href="#trenger" style={tnKnappStil("hvit")}>{trenger.length === 1 ? "Se spilleren" : `Se de ${trenger.length}`}</a> : null}
              {data.kontekst.kanAdministrere ? <TnHandlingLenke href="/team-norway/inviter" variant="konturHvit">Inviter spiller</TnHandlingLenke> : null}
            </TnHeltKnapper>
          </>
        }
        hoyre={
          <TnHeltTellere
            tall={[
              { verdi: trening ? trenger.length : "—", tekst: "trenger deg" },
              { verdi: trening ? folger.length : "—", tekst: "følger planen" },
              { verdi: antallIkkeDelt ?? "—", tekst: "deler ikke" },
            ]}
          />
        }
      />

      <TnSkraKort>
      <form action="/team-norway/spillere" className={st.sok}>
        <label>
          Søk etter spiller
          <input type="search" name="q" defaultValue={q} placeholder="Navn eller klubb" />
        </label>
      </form>

      {data.rader.length === 0 && ikkeDelt.length === 0 ? (
        <TnFlate><TnMangler>{antallIkkeDelt ? `Ingen spillere har delt med deg ennå. ${antallIkkeDelt} i gruppen deler ikke.` : "Ingen spillere i gruppen ennå. Spillerne vises her når de er lagt inn i Team Norway-gruppen."}</TnMangler></TnFlate>
      ) : (
        <>
          {data.rader.length > 0 ? (
          <>
          <TnBaand id="trenger" status={trenger.length > 0 ? "trenger" : undefined} tittel="Trenger deg" antall={trenger.filter((r) => passer(r.s)).length} kilde={`Under ${UTENFOR_PLAN_TERSKEL} % to uker på rad`}>
            <TnBaandListe>
              {trenger.filter((r) => passer(r.s)).map((r) => rad(r, "trenger"))}
              {trenger.length === 0 ? <TnFlate style={{ background: TN.ink50 }}><TnMangler>Ingen er under {UTENFOR_PLAN_TERSKEL} % av planen to uker på rad.</TnMangler></TnFlate> : null}
            </TnBaandListe>
          </TnBaand>

          <TnBaand status="folger" tittel="Følger planen" antall={folger.filter((r) => passer(r.s)).length} kilde="Høyest først">
            <TnBaandListe>{folger.filter((r) => passer(r.s)).map((r) => rad(r, "folger"))}</TnBaandListe>
          </TnBaand>

          {utenPlan.length > 0 ? (
            <TnBaand status="folgmed" tittel="Uten plan" antall={utenPlan.filter((r) => passer(r.s)).length} kilde="Ingen planlagt tid siste fire uker">
              <TnBaandListe>{utenPlan.filter((r) => passer(r.s)).map((r) => rad(r, "folgmed"))}</TnBaandListe>
            </TnBaand>
          ) : null}
          </>
          ) : null}

          <TnBaand status="ikkedelt" tittel="Ikke delt" antall={apne ? ikkeDelt.filter((a) => passerApen(a)).length : antallIkkeDelt ?? 0} kilde="Bare navn og offentlig WAGR-plass før spilleren deler">
            {ikkeDelt.length > 0 ? (
              <TnBaandListe>
                {ikkeDelt.filter((a) => passerApen(a)).map((a) => (
                  <TnSpillerrad
                    key={a.id}
                    status="ikkedelt"
                    initialer={initialer(a.navn)}
                    navn={a.navn}
                    fakta="Ikke delt"
                    verdi={a.wagrPlass ?? "—"}
                    verdiTekst="WAGR-plass"
                  />
                ))}
              </TnBaandListe>
            ) : null}
            <TnFotnote>Spilleren deler selv fra Meg i PlayerHQ. Under 16 år må en foresatt godkjenne.{wagrDato ? ` WAGR-plass: ${WAGR_KILDE}, ${datoKort(wagrDato)}` : ""}</TnFotnote>
          </TnBaand>
        </>
      )}

      <TnFotnote>Plan er gjennomført tid mot planlagt tid siste fire uker. Fargen viser aksen spilleren har trent mest. Kilde: Workbench i PlayerHQ, hentet {datoKort(naa)}</TnFotnote>
      <TnTekstlenke href="/team-norway/uttak">Se uttakskriterier</TnTekstlenke>
      </TnSkraKort>
    </TnShell>
  );
}
