"use client";

/**
 * AU-05 Samtykke via lenke, i Precision Athletics.
 * Fasit: Claude Design 7d7c2994, ui_kits/konto/screens/AU-04-06.jsx (AU05, Box og H).
 *
 * Tre flater bruker samme ramme:
 *  - Foreldresamtykke (GDPR art. 8): /auth/guardian-consent/[token]
 *  - Lydsamtykke via lenke: /auth/lyd-samtykke/[token]
 *  - Venterom for spilleren: /auth/samtykke-venter (tegningens «Spiller»-visning)
 * Oppslag av token skjer fortsatt på serversiden i page.tsx og styrer hvilken tilstand som vises.
 * Handlingene er de samme som før: `confirmGuardianConsent`, `bekreftLydSamtykkeViaToken`,
 * `resendGuardianInvitation` og `logout`.
 */
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { confirmGuardianConsent } from "@/app/auth/guardian-consent/[token]/actions";
import { bekreftLydSamtykkeViaToken } from "@/app/auth/lyd-samtykke/[token]/actions";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";
import { logout } from "@/lib/auth/logout";
import { Knapp, KnappLenke, StatusPille } from "@/components/precision/pa";
import { Avkrysning } from "@/components/precision/pa-planhub";
import { Nokkelverdi, Skjemafelt } from "@/components/precision/pa-a4";
import { InlineVarsel, KortHode } from "@/components/precision/pa-a5";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";
import "@/styles/precision-a4.css";
import "@/styles/precision-au.css";

function Ramme({ bred, natt, children }: { bred?: boolean; natt?: boolean; children: ReactNode }) {
  return (
    <div className="pa-root au" data-design="precision-athletics" data-theme={natt ? "night" : undefined}>
      <div className={bred ? "au__kolonne au__kolonne--bred" : "au__kolonne"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="au__logo au__logo--lys" src="/logos/logo-ak-golf-hq.svg" alt="AK Golf HQ" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="au__logo au__logo--natt" src="/logos/logo-ak-golf-hq-negative.svg" alt="AK Golf HQ" />
        {children}
      </div>
    </div>
  );
}

function Hode({ kicker, tittel, tekst }: { kicker?: string; tittel: string; tekst?: ReactNode }) {
  return (
    <div className="au__hode">
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 className="au__h1">{tittel}</h1>
      {tekst && <p className="au__ingress">{tekst}</p>}
    </div>
  );
}

/* ---------- Foreldresamtykke ---------- */

export type GuardianConsentPrecisionProps = { /** Natt brukes bare på flater brukeren har valgt natt for. Lys er standard. */ natt?: boolean } & (
  | { state: "form"; token: string; playerName: string; playerAge: number | null; playerEmail: string; guardianEmail: string }
  | { state: "expired"; playerName: string; playerAge: number | null; email: string }
  | { state: "success"; playerName: string; playerAge: number | null }
);

const alderTekst = (alder: number | null) => (alder !== null ? ` · ${alder} år` : "");

export function GuardianConsentPrecision(props: GuardianConsentPrecisionProps) {
  if (props.state === "expired") {
    return (
      <Ramme natt={props.natt}>
        <Hode
          kicker={`Samtykke for ${props.playerName}${alderTekst(props.playerAge)}`}
          tittel="Lenken virker ikke"
          tekst={<>Lenken er utløpt. Be spilleren sende en ny invitasjon til <strong>{props.email}</strong>. Lenken gir aldri tilgang til noe annet enn selve samtykket.</>}
        />
      </Ramme>
    );
  }
  if (props.state === "success") {
    return (
      <Ramme natt={props.natt}>
        <Hode
          kicker={`Samtykke for ${props.playerName}${alderTekst(props.playerAge)}`}
          tittel="Samtykket er registrert"
          tekst="Du kan trekke samtykket når som helst i forelderportalen under Samtykke."
        />
        <div><KnappLenke href="/forelder">Gå til foreldreportal</KnappLenke></div>
      </Ramme>
    );
  }
  return <GuardianSkjema {...props} />;
}

function GuardianSkjema({ token, playerName, playerAge, guardianEmail, natt }: Extract<GuardianConsentPrecisionProps, { state: "form" }>) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [databehandling, setDatabehandling] = useState(false);
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) return setFeil("Skriv inn fullt navn.");
    if (!databehandling || !vilkar) return setFeil("Du må samtykke til begge punktene for å fortsette.");
    start(async () => {
      const res = await confirmGuardianConsent({ token, guardianName: navn.trim() });
      if (!res.ok) return setFeil(res.error ?? "Noe gikk galt. Prøv igjen.");
      router.push("/auth/login?guardian_consent_given=1");
    });
  }

  return (
    <Ramme bred natt={natt}>
      <Hode
        kicker={`Samtykke for ${playerName}${alderTekst(playerAge)}`}
        tittel="Bekreft samtykke"
        tekst="Velg hva du samtykker til. Du kan trekke samtykket senere."
      />
      <form onSubmit={send} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Skjemafelt label="Ditt fulle navn" required hint={`Registrert e-post: ${guardianEmail}`}>
          <input className="a4-input" type="text" autoComplete="name" value={navn} onChange={(e) => setNavn(e.target.value)} />
        </Skjemafelt>
        <div className="au__valg">
          <Avkrysning checked={databehandling} onChange={setDatabehandling} label={`Jeg samtykker til at AK Golf behandler ${playerName} sine persondata iht. personvernerklæringen: profil, treningsdata, golfstatistikk, bookinger og kommunikasjon med coach.`} />
          <Avkrysning checked={vilkar} onChange={setVilkar} label={`Jeg har lest og godtar vilkårene for bruk av AK Golf på vegne av ${playerName}, og bekrefter at jeg har foreldreansvar.`} />
        </div>
        <InlineVarsel tone="info">Denne lenken gir bare tilgang til dette samtykket. Den logger deg ikke inn og viser ingen andre data.</InlineVarsel>
        {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
        <Knapp type="submit" fullWidth size="lg" loading={pending} loadingText="Lagrer …">Bekreft samtykke</Knapp>
      </form>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <KortHode tittel="Hva betyr dette samtykket?" />
        <ul className="au__punkter">
          <li><strong>GDPR artikkel 8:</strong> Barn under 16 år trenger foreldresamtykke før de kan dele persondata med en tjeneste.</li>
          <li><strong>Du kan trekke samtykket</strong> når som helst ved å kontakte oss på <a href="mailto:post@akgolf.no" style={{ color: "var(--link)" }}>post@akgolf.no</a>.</li>
          <li><strong>Du får tilgang</strong> til en foreldreportal der du følger barnets utvikling, fakturaer og kommunikasjon med coach.</li>
        </ul>
        <div className="au__lenker">
          <Link className="au__lenke" href="/personvern">Personvernerklæring</Link>
          <Link className="au__lenke" href="/vilkar">Vilkår</Link>
        </div>
      </div>
    </Ramme>
  );
}

/* ---------- Lydsamtykke ---------- */

export type LydSamtykkeStatus = "ugyldig" | "gitt" | "utlopt";

/** Feiltilstandene på /auth/lyd-samtykke/[token]. Tekstene er de samme som før. */
export function LydSamtykkeStatusVisning({ status, spillerNavn, natt }: { status: LydSamtykkeStatus; spillerNavn?: string; natt?: boolean }) {
  const tekst = {
    ugyldig: { t: "Lenken virker ikke", s: "Lenken er ugyldig eller allerede brukt. Be treneren sende ny e-post hvis du fortsatt skal gi samtykke. Lenken gir aldri tilgang til noe annet enn selve samtykket." },
    gitt: { t: "Allerede registrert", s: `Samtykke for ${spillerNavn ?? "spilleren"} er allerede gitt. Du trenger ikke gjøre noe mer.` },
    utlopt: { t: "Lenken er utløpt", s: "Be treneren sende en ny e-post med fersk lenke." },
  }[status];
  return (
    <Ramme bred natt={natt}>
      <Hode kicker="Samtykke" tittel={tekst.t} tekst={tekst.s} />
    </Ramme>
  );
}

export function LydSamtykkePrecision({ token, spillerNavn, ordlyd, forhandsvis, natt }: { token: string; spillerNavn: string; ordlyd: string; natt?: boolean; /** Kun for skjermprøven. */ forhandsvis?: { ferdig?: boolean; feil?: string; laster?: boolean } }) {
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(forhandsvis?.feil ?? null);
  const [ferdig, setFerdig] = useState(forhandsvis?.ferdig ?? false);
  const [ok, setOk] = useState(false);

  function bekreft() {
    setFeil(null);
    start(async () => {
      const res = await bekreftLydSamtykkeViaToken({ token });
      if (!res.ok) return setFeil(res.error);
      setFerdig(true);
    });
  }

  if (ferdig) {
    return (
      <Ramme bred natt={natt}>
        <Hode
          kicker={`Samtykke for ${spillerNavn}`}
          tittel="Takk, samtykket er registrert"
          tekst="Treneren kan starte opptak ved neste økt. Du kan trekke samtykket via treneren."
        />
        <Nokkelverdi items={[["Gjelder", "Lydopptak på trening", { mono: false }], ["Spiller", spillerNavn, { mono: false }], ["Gitt av", "Foresatt", { mono: false }]]} />
      </Ramme>
    );
  }

  const laster = pending || forhandsvis?.laster;
  return (
    <Ramme bred natt={natt}>
      <Hode kicker={`Samtykke for ${spillerNavn} · AK Golf Academy`} tittel="Samtykke til lydopptak" tekst="Les ordlyden og bekreft. Du kan trekke samtykket senere." />
      <pre className="au__ordlyd" tabIndex={0} aria-label="Ordlyd i samtykket">{ordlyd}</pre>
      <div className="au__valg"><Avkrysning checked={ok} onChange={setOk} label="Jeg har lest ordlyden og samtykker på vegne av spilleren." /></div>
      <InlineVarsel tone="info">Denne lenken gir bare tilgang til dette samtykket. Den logger deg ikke inn og viser ingen andre data. Trekker du samtykket, stoppes nye opptak med en gang.</InlineVarsel>
      {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
      <Knapp fullWidth size="lg" disabled={!ok} loading={laster} loadingText="Lagrer …" onClick={bekreft}>Jeg samtykker</Knapp>
    </Ramme>
  );
}

/* ---------- Venterom for spilleren ---------- */

export function SamtykkeVenterPrecision({ spillerNavn, invitasjonEmail, natt }: { spillerNavn: string; invitasjonEmail: string | null; natt?: boolean }) {
  const [pending, start] = useTransition();
  const [epost, setEpost] = useState(invitasjonEmail ?? "");
  const [status, setStatus] = useState<{ ok: boolean; melding: string } | null>(null);
  const epostSendt = Boolean(invitasjonEmail) || Boolean(status?.ok);

  function sendPaNytt(e: React.FormEvent) {
    e.preventDefault();
    if (!epost.trim()) return;
    start(async () => {
      setStatus(null);
      const res = await resendGuardianInvitation({ guardianEmail: epost.trim() });
      setStatus(res.ok ? { ok: true, melding: "Invitasjon sendt. Be forelderen sjekke innboksen." } : { ok: false, melding: res.error ?? "Noe gikk galt. Prøv igjen." });
    });
  }

  return (
    <Ramme bred natt={natt}>
      <Hode
        kicker="Samtykke"
        tittel="Venter på forelder"
        tekst={<>Hei {spillerNavn || "der"}. Du er under 16 år, så en forelder må godkjenne kontoen din.{epostSendt ? " Vi har sendt en e-post til forelderen du oppga." : ""} Du kan ikke bruke PlayerHQ før samtykket er gitt.</>}
      />
      <div><StatusPille tone="warn">Venter på forelder</StatusPille></div>
      <Nokkelverdi items={[
        ["Konto", "Opprettet", { mono: false }],
        ["E-post til forelder", epostSendt ? "Sendt" : "Ikke sendt", { mono: false }],
        ["Foreldresamtykke", "Venter", { mono: false }],
      ]} />
      <form onSubmit={sendPaNytt} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Skjemafelt label={invitasjonEmail ? "Send til annen e-post" : "Legg til forelder"} required>
          <input className="a4-input" type="email" autoComplete="email" placeholder="forelder@example.com" value={epost} onChange={(e) => setEpost(e.target.value)} />
        </Skjemafelt>
        <Knapp type="submit" fullWidth size="lg" loading={pending} loadingText="Sender …" disabled={!epost.trim()}>{invitasjonEmail ? "Send påminnelse" : "Send invitasjon"}</Knapp>
        {status && <InlineVarsel tone={status.ok ? "ok" : "warn"}>{status.melding}</InlineVarsel>}
      </form>
      <div className="au__lenker">
        <a className="au__lenke" href="mailto:post@akgolf.no">Spørsmål? post@akgolf.no</a>
        <span style={{ flex: 1 }} />
        <form action={logout}><button type="submit" className="au__logg">Logg ut</button></form>
      </div>
    </Ramme>
  );
}

