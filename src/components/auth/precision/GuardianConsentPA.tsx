"use client";

/**
 * Foreldresamtykke via lenke (AU-05) i Precision Athletics. Erstatter
 * GuardianConsentV2 på /auth/guardian-consent/[token]. Logikken er den samme
 * (klientvalidering + server-action `confirmGuardianConsent`), bare flaten er ny.
 * Tegning: 7d7c2994, ui_kits/konto/screens/AU-04-06.jsx › AU05.
 * GDPR art. 8: lenken gir bare tilgang til selve samtykket.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Knapp, KnappLenke, Meta } from "@/components/precision/pa";
import { Felt, InlineVarsel, Kort, TekstFelt } from "@/components/precision/pa-a5";
import { confirmGuardianConsent } from "@/app/auth/guardian-consent/[token]/actions";
import { AuthFlate, AuthOverskrift } from "./AuthFlate";
import { AgreeItem } from "./veiviser";

export type GuardianConsentPAProps =
  | { state: "form"; token: string; playerName: string; playerAge: number | null; playerEmail: string; guardianEmail: string }
  | { state: "expired"; playerName: string; playerAge: number | null; email: string }
  | { state: "success"; playerName: string; playerAge: number | null };

const lenkeStil = { color: "var(--link)", textDecoration: "underline", textUnderlineOffset: 3 } as const;

function Hode({ playerName, playerAge }: { playerName: string; playerAge: number | null }) {
  return (
    <AuthOverskrift
      kicker={`Samtykke for ${playerName}${playerAge !== null ? ` · ${playerAge} år` : ""}`}
      tittel="Bekreft samtykke"
      tekst={`For at ${playerName} skal kunne bruke AK Golf. Du kan trekke samtykket senere.`}
    />
  );
}

function Info() {
  return (
    <Kort>
      <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>Hva betyr dette samtykket?</span>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        <li><strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>GDPR artikkel 8:</strong> Norske barn under 16 år trenger foreldresamtykke før de kan dele persondata med en tjeneste.</li>
        <li><strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>Du kan trekke samtykket</strong> når som helst ved å kontakte oss på <a href="mailto:post@akgolf.no" style={lenkeStil}>post@akgolf.no</a>.</li>
        <li><strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>Du får tilgang</strong> til en foreldreportal som lar deg følge barnets utvikling, fakturaer og kommunikasjon med coach.</li>
      </ul>
    </Kort>
  );
}

function Bunn() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <Link href="/personvern" style={{ ...lenkeStil, font: "500 14px/1 var(--font-sans)", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Personvern</Link>
      <Link href="/vilkar" style={{ ...lenkeStil, font: "500 14px/1 var(--font-sans)", display: "inline-flex", alignItems: "center", minHeight: 44 }}>Vilkår</Link>
    </div>
  );
}

function Skjema({ token, playerName, playerAge, playerEmail, guardianEmail }: Extract<GuardianConsentPAProps, { state: "form" }>) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [databehandling, setDatabehandling] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const kanSende = navn.trim().length > 0 && databehandling && vilkar;

  function send(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) return setFeil("Skriv inn fullt navn.");
    if (!databehandling || !vilkar) return setFeil("Du må samtykke til begge punktene for å fortsette.");
    start(async () => {
      const result = await confirmGuardianConsent({ token, guardianName: navn.trim() });
      if (!result.ok) return setFeil(result.error ?? "Noe gikk galt. Prøv igjen.");
      router.push("/auth/login?guardian_consent_given=1");
    });
  }

  return (
    <>
      <Hode playerName={playerName} playerAge={playerAge} />
      <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Kort style={{ gap: 4 }}>
          <Meta>SPILLER</Meta>
          <span style={{ font: "600 15px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{playerName}{playerAge !== null ? ` · ${playerAge} år` : ""}</span>
          <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{playerEmail || "—"}</span>
        </Kort>
        <Felt label="Ditt fulle navn (foresatt)" hint={`Registrert e-post: ${guardianEmail}`}>
          <TekstFelt type="text" value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="F.eks. Anne Hansen" autoComplete="name" />
        </Felt>
        <div role="group" aria-label="Samtykker" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AgreeItem title={`Jeg samtykker til at AK Golf behandler ${playerName} sine persondata`} desc="Iht. personvernerklæringen: profil, treningsdata, golf-statistikk, bookinger og kommunikasjon med coach." checked={databehandling} onClick={() => setDatabehandling((v) => !v)} />
          <AgreeItem title="Jeg har lest og godtar vilkårene" desc={`For bruk av AK Golf på vegne av ${playerName}. Jeg bekrefter at jeg har foreldreansvar eller foresattmyndighet.`} checked={vilkar} onClick={() => setVilkar((v) => !v)} />
        </div>
        <InlineVarsel tone="info">Denne lenken gir bare tilgang til dette samtykket. Den logger deg ikke inn og viser ingen andre data.</InlineVarsel>
        {feil && <InlineVarsel tone="signal">{feil}</InlineVarsel>}
        <Knapp type="submit" fullWidth size="lg" icon={Check} loading={pending} loadingText="Lagrer samtykke …" disabled={!kanSende}>Bekreft samtykke</Knapp>
        <Meta>GDPR ART. 8 · DU KAN TREKKE SAMTYKKET NÅR SOM HELST</Meta>
      </form>
      <Info />
      <Bunn />
    </>
  );
}

export function GuardianConsentPA(props: GuardianConsentPAProps) {
  return (
    <AuthFlate max={520}>
      {props.state === "form" ? (
        <Skjema {...props} />
      ) : props.state === "expired" ? (
        <>
          <AuthOverskrift kicker="Samtykke" tittel="Invitasjonen er utløpt" tekst={<>Lenken er ikke lenger gyldig. Be spilleren sende en ny invitasjon til <strong style={{ color: "var(--text-primary)" }}>{props.email}</strong>. Lenken gir aldri tilgang til noe annet enn selve samtykket.</>} />
          <Bunn />
        </>
      ) : (
        <>
          <AuthOverskrift kicker="Samtykke" tittel="Samtykke allerede gitt" tekst={<>Du har allerede bekreftet samtykke for <strong style={{ color: "var(--text-primary)" }}>{props.playerName}</strong>. Du kan endre eller trekke samtykket i foreldreportalen.</>} />
          <div><KnappLenke href="/forelder" size="lg">Gå til foreldreportal</KnappLenke></div>
          <Bunn />
        </>
      )}
    </AuthFlate>
  );
}
