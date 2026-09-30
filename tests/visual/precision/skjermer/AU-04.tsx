/**
 * Prøvefil for AU-04 Oppstart (spiller og forelder) og AU-05 samtykke via lenke.
 * Syntetiske data, ingen ekte spillere. Sju steg for spiller, fire for forelder.
 * Kjør: node tests/visual/precision/maal.mjs AU-04
 */
import { useEffect, type ReactNode } from "react";
import { Sun } from "lucide-react";
import { VeiviserFlate, ProgressDots, StepHeading, PrimaryCta, SecondaryLink, Field, TextField, InfoNote, FieldGroupLabel, OptionRow, PillToggle, ProfileCard, PlaceRow, AddRowButton, NumberRow, FrequencySegment, CoachCard, PlanCard, SummaryCard, SummaryRow, AgreeItem, SecurityStrip, StepHeader } from "@/components/auth/precision/veiviser";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { GuardianConsentPA } from "@/components/auth/precision/GuardianConsentPA";
import { SamtykkeVenterPA } from "@/components/auth/precision/SamtykkeVenterPA";
import { LydSamtykkeStatus } from "@/components/auth/precision/LydSamtykkeStatus";
import { LydSamtykkeForm } from "@/app/auth/lyd-samtykke/[token]/lyd-samtykke-form";

export const sti = "/auth/onboarding";
const noop = () => {};
const ingen = async () => {};

function Steg({ n, children, feil }: { n: number; children: ReactNode; feil?: string }) {
  return (
    <VeiviserFlate>
      <div className="flex w-full flex-col gap-5">
        {n > 1 && <ProgressDots total={7} current={n} etikett="Spiller" valgfri={n < 7} />}
        <div className="flex flex-col gap-5">{children}</div>
        {feil && <InlineVarsel tone="signal">{feil}</InlineVarsel>}
        {n > 1 && n < 7 && <SecondaryLink onClick={noop}>Hopp over og gå til portalen</SecondaryLink>}
      </div>
    </VeiviserFlate>
  );
}

const steg1 = (
  <Steg n={1}>
    <StepHeading eyebrow="VELKOMMEN" title="Vi" emphasis="gleder oss" titleAfter=" til å jobbe med deg." deck="Coach Anders har invitert deg inn i AK Golf Academy. De neste minuttene tar vi en kort gjennomgang for å sette opp profilen din." />
    <PrimaryCta onClick={noop}>Kom i gang</PrimaryCta>
  </Steg>
);
const steg2 = (
  <Steg n={2}>
    <StepHeading title="La oss bli" emphasis="kjent" titleAfter="." deck="Litt om deg, så vi vet hvem vi trener med." />
    <Field label="Telefon" htmlFor="t"><TextField id="t" mono type="tel" placeholder="+47 ..." /></Field>
    <Field label="Fødselsdato" hint="Under 16 år: forelder må samtykke" htmlFor="f"><TextField id="f" mono placeholder="ÅÅÅÅ-MM-DD" defaultValue="2009-04-12" /></Field>
    <InfoNote>Du er under 16 år. Vi sender en lenke til forelderen din for samtykke.</InfoNote>
    <Field label="Forelderens e-post" htmlFor="g"><TextField id="g" type="email" placeholder="forelder@example.com" /></Field>
    <PrimaryCta onClick={noop} onBack={noop}>Neste</PrimaryCta>
  </Steg>
);
const steg3 = (
  <Steg n={3}>
    <StepHeading title="Fortell om" emphasis="treningen" titleAfter="." />
    <FieldGroupLabel>Hvor trener du?</FieldGroupLabel>
    <PlaceRow name="Testklubb GK" isIndoor={false} capabilities={["RANGE"]} capabilityOptions={[{ id: "RANGE", label: "Range" }, { id: "PUTTING", label: "Puttinggreen" }, { id: "SIM", label: "Simulator" }]} onNameChange={noop} onIndoorChange={noop} onToggleCapability={noop} onRemove={noop} />
    <AddRowButton label="Legg til sted" onClick={noop} />
    <FieldGroupLabel>Økter per uke</FieldGroupLabel>
    <FrequencySegment options={[1, 2, 3, 4, 5, 6, 7]} value={5} onChange={noop} unit="økter" />
    <FieldGroupLabel>Trener helst</FieldGroupLabel>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{["man", "tir", "ons", "tor", "fre", "lør", "søn"].map((d, i) => <PillToggle key={d} label={d} selected={i % 2 === 0} onClick={noop} icon={i === 0 ? Sun : undefined} />)}</div>
    <PrimaryCta onClick={noop} onBack={noop}>Neste</PrimaryCta>
  </Steg>
);
const steg4 = (
  <Steg n={4}>
    <StepHeading title="Hvor står" emphasis="du" titleAfter=" i dag?" />
    <Field label="HCP" htmlFor="h"><TextField id="h" mono inputMode="decimal" placeholder="—" defaultValue="8,4" /></Field>
    <NumberRow id="sg1" label="SG i år" hint="hvis du har det" value="" onChange={noop} />
    <NumberRow id="sg2" label="SG forrige sesong" hint="hvis du har det" value="" onChange={noop} />
    <PrimaryCta onClick={noop} onBack={noop}>Neste</PrimaryCta>
  </Steg>
);
const steg5 = (
  <Steg n={5}>
    <StepHeading title="Hvor" emphasis="er du" titleAfter=" i golfspillet?" />
    <ProfileCard name="Konkurranse" desc="Jeg spiller turneringer og vil score lavere." icon={Sun} selected onClick={noop} />
    <ProfileCard name="Lavere score" desc="Jeg spiller for å bli bedre." icon={Sun} selected={false} onClick={noop} />
    <OptionRow label="Klubb" sub="Klubbturneringer" trailing="NIVÅ 1" selected={false} onClick={noop} />
    <OptionRow label="Region" sub="Srixon Tour og Norgescup" trailing="NIVÅ 2" selected onClick={noop} />
    <PrimaryCta onClick={noop} onBack={noop}>Neste</PrimaryCta>
  </Steg>
);
const steg6 = (
  <Steg n={6}>
    <StepHeading title="Din" emphasis="coach" titleAfter=" og ditt opplegg." />
    <CoachCard initials="AK" name="Anders Kristiansen" role="Head coach" meta="AK Golf Academy" selected onClick={noop} />
    <PlanCard tier="FULL" price="299 kr" per="/ mnd" features={["Plan fra coach", "Workbench og Caddie"]} footnote="ELLER 2 690 KR / ÅR" recommended selected onClick={noop} />
    <PlanCard tier="TALENT" price="0 kr" features={["Spillerprofil og åpent testbatteri"]} selected={false} onClick={noop} />
    <PrimaryCta onClick={noop} onBack={noop}>Neste</PrimaryCta>
  </Steg>
);
const steg7 = (
  <Steg n={7}>
    <StepHeading title="Nesten" emphasis="i mål" titleAfter=" — siste sjekk." />
    <SummaryCard><SummaryRow label="Coach" value="Anders Kristiansen" /><SummaryRow label="Pakke" value="FULL · 299 kr / mnd" /><SummaryRow label="Økter per uke" value="5" /></SummaryCard>
    <AgreeItem title="Jeg godtar vilkårene" desc="Bruksvilkår for AK Golf HQ." checked onClick={noop} />
    <AgreeItem title="Jeg har lest personvernerklæringen" desc="Hvilke data vi samler og hvorfor." checked={false} onClick={noop} />
    <SecurityStrip>Dataene dine lagres i EU og deles bare med coachen din.</SecurityStrip>
    <PrimaryCta onClick={noop} onBack={noop}>Fullfør</PrimaryCta>
  </Steg>
);
const forelder = (
  <VeiviserFlate>
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2"><ProgressDots total={4} current={2} etikett="Forelder" /><StepHeader eyebrow="Din info" onBack={noop} canGoBack /></div>
      <StepHeading title="Bekreft" emphasis="din info" titleAfter="." deck="Litt info om deg som foresatt, slik at vi kan sende fakturaer og holde kontakten." />
      <Field label="Ditt navn" htmlFor="fn"><TextField id="fn" placeholder="Fullt navn" /></Field>
      <div className="pa-seg pa-seg--full" role="group" aria-label="Relasjon">{["Mor", "Far", "Foresatt"].map((r, i) => <button key={r} type="button" className="pa-seg__opt" aria-pressed={i === 0}>{r}</button>)}</div>
      <PrimaryCta onClick={noop}>Neste — Godkjenn vilkår</PrimaryCta>
    </div>
  </VeiviserFlate>
);

const Natt = ({ children }: { children: ReactNode }) => { useEffect(() => { document.querySelectorAll(".pa-root").forEach((el) => el.setAttribute("data-theme", "night")); }); return <>{children}</>; };

const samtykke = <GuardianConsentPA state="form" token="t" playerName="Testspiller Demo" playerAge={13} playerEmail="testspiller@example.com" guardianEmail="forelder@example.com" />;

export const tilstander = {
  steg1, steg2, steg3, steg4, steg5, steg6, steg7,
  steg2feil: <Steg n={2} feil="Kunne ikke lagre. Prøv igjen.">{steg2.props.children.props.children}</Steg>,
  forelder,
  samtykke,
  samtykkeUtlopt: <GuardianConsentPA state="expired" playerName="Testspiller Demo" playerAge={13} email="forelder@example.com" />,
  samtykkeGitt: <GuardianConsentPA state="success" playerName="Testspiller Demo" playerAge={13} />,
  venter: <SamtykkeVenterPA spillerNavn="Testspiller" invitasjonEmail="forelder@example.com" loggUt={ingen} />,
  venterTom: <SamtykkeVenterPA spillerNavn="Testspiller" invitasjonEmail={null} loggUt={ingen} />,
  lyd: <LydSamtykkeForm token="abcdefghijklmnopqrstuvwxyz" spillerNavn="Testspiller Demo" ordlyd={"Jeg samtykker til at AK Golf Academy tar lydopptak av coachingøkter med spilleren.\n\nOpptakene brukes til oppfølging og lagres på spillerens profil. Samtykket kan trekkes når som helst via treneren."} />,
  lydUgyldig: <LydSamtykkeStatus tittel="Lenken virker ikke" tekst="Lenken er ugyldig eller allerede brukt. Be treneren sende ny e-post hvis du fortsatt skal gi samtykke." />,
  lydGitt: <LydSamtykkeStatus tittel="Allerede registrert" tekst="Samtykke for Testspiller Demo er allerede gitt. Du trenger ikke gjøre noe mer." />,
  nattSteg2: <Natt>{steg2}</Natt>,
  nattSteg6: <Natt>{steg6}</Natt>,
  nattSamtykke: <Natt>{samtykke}</Natt>,
  nattVenter: <Natt><SamtykkeVenterPA spillerNavn="Testspiller" invitasjonEmail="forelder@example.com" loggUt={ingen} /></Natt>,
};
export const natt = ["nattSteg2", "nattSteg6", "nattSamtykke", "nattVenter"];
