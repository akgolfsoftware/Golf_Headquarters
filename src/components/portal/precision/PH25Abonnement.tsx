"use client";

/**
 * PH-25 Abonnement og innstillinger — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-25.jsx, etag 1790579267730211).
 *
 * Tegningen samler abonnement, samtykke, varsler, sikkerhet, hjelp, sletting og
 * tilbakemelding på én skjerm. Appen har egne adresser for dem (Stripe og Supabase
 * kalles fra hver sin flate), så samme innhold er delt på sider som henger sammen med
 * fanene «Abonnement» og «Innstillinger». Alle sidene bruker delene i denne fila.
 *
 * Bevisste avvik fra tegningen:
 *   - Ingen bryter for betalingsperiode: appen bytter ikke måned/år selv, det skjer i Stripe.
 *     Prisene står i FULL-kortet («eller 2 690 kr per år»).
 *   - Kortet viser ikke merke og siste fire siffer: appen lagrer aldri kortdata («—»).
 *   - Tofaktor er lenke til oppsettet, ikke bryter: appen har ingen lagret 2FA-status.
 *   - «Slett konto» sender en forespørsel som coach eller admin behandler (ingen hard sletting),
 *     og bekreftes med SLETT i dialog.
 *   - «Avslutt abonnement» er egen side (Stripe kalles FØR egen database), med samme dialog.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import {
  ArrowLeft, ArrowUpRight, Check, CircleAlert, CircleHelp, RotateCw, CreditCard, Download, FileText, Heart, KeyRound,
  Lock, Mail, MessageSquare, Send, Shield, Trash2, User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeilTilstand, Ikon, Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { Bryter, Dialogboks, FanerLenker, Kolonner, Nokkelverdi, Side, SideHode, Stabel, Tabell } from "@/components/precision/pa-a4";
import { Felt, InlineVarsel } from "@/components/precision/pa-a5";
import { Sokefelt } from "@/components/precision/pa-a2";
import { ReauthModal } from "@/components/auth/reauth-modal";
import { cancelPro } from "@/app/portal/meg/abonnement/avbestill/actions";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { exportUserData } from "@/app/portal/meg/innstillinger/actions";
import { settEgetHelseSamtykke } from "@/app/portal/meg/innstillinger/personvern/helse-samtykke-actions";
import { giDelingsSamtykke, trekkDelingsSamtykke } from "@/app/portal/meg/innstillinger/personvern/deling-samtykke-actions";
import { submitFeedback } from "@/app/portal/meg/feedback/actions";
import { opprettGdprForesporsel } from "@/lib/moderering/actions";
import type { HelseSamtykkeType } from "@/lib/health/samtykke-regler";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences } from "@/lib/preferences";
import type { HjelpArtikkel, HjelpFaq, HjelpKategori } from "@/app/portal/meg/help/data";
import "@/styles/precision-a2500.css";

/* ---------- Felles ---------- */

const kort = (style?: React.CSSProperties) => ({ padding: 16, gap: 12, display: "flex", flexDirection: "column", minWidth: 0, ...style }) as const;
const muted = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const upper = (s: string) => s.toLocaleUpperCase("nb-NO");
const kr = (n: number | null | undefined) => (n == null ? "—" : `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} kr`);

function Sek({ t, meta, children, style }: { t: string; meta?: ReactNode; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="pa-card" style={kort(style)}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="kicker">{t}</span>
        {meta}
      </div>
      {children}
    </div>
  );
}

function Lenke({ href, icon, name, tittel, sub, ekstern }: { href: string; icon: LucideIcon; name: string; tittel: string; sub?: string; ekstern?: boolean }) {
  const inn = (
    <>
      <Ikon icon={icon} size={16} name={name} />
      <span className="ph25-lenke__tekst">
        <span className="ph25-lenke__tittel">{tittel}</span>
        {sub && <span className="ph25-lenke__sub">{sub}</span>}
      </span>
      <Ikon icon={ArrowUpRight} size={14} name="arrow-up-right" />
    </>
  );
  return ekstern
    ? <a href={href} className="ph25-lenke">{inn}</a>
    : <Link href={href} className="ph25-lenke">{inn}</Link>;
}

/** .pa-control er border-box: innholdsboksen blir 2 px lavere enn treffmålet, så inputen dekker borderen. */
function Inn(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <span className="pa-control ph25-inn"><input {...props} /></span>;
}

function Tilbake({ href, tekst }: { href: string; tekst: string }) {
  return <KnappLenke variant="secondary" icon={ArrowLeft} iconName="arrow-left" href={href}>{tekst}</KnappLenke>;
}

function Faner({ aktiv }: { aktiv: "abonnement" | "innstillinger" }) {
  return (
    <FanerLenker faner={[
      { href: "/portal/meg/abonnement", navn: "Abonnement", aktiv: aktiv === "abonnement" },
      { href: "/portal/meg/innstillinger", navn: "Innstillinger", aktiv: aktiv === "innstillinger" },
    ]} />
  );
}

/* ---------- Abonnement ---------- */

export type PH25Faktura = { id: string; dato: string; tekst: string; belopKr: number };

export type PH25AbonnementData = {
  nivaa: "FULL" | "TALENT";
  /** Coaching-pakken som gir FULL uten månedspris, ellers null. */
  pakkeNavn: string | null;
  /** FULL fra prøveperiode eller AK-gruppe (ikke betalt selv). */
  inkludert: boolean;
  prisMndKr: number;
  prisAarKr: number;
  fornyes: string | null;
  betalingFeilet: boolean;
  kanOppgradere: boolean;
  kanEndreKort: boolean;
  kanAvbestille: boolean;
  fakturaer: PH25Faktura[];
  flagg: { ok: boolean; avbrutt: boolean; avbestilt: boolean };
};

const TALENT_FUNKSJONER = ["Åpent testbatteri", "Analyse og runderegistrering med SG", "Booking av enkelttimer", "DataGolf-sammenligning"];
const FULL_FUNKSJONER = ["Alt i TALENT", "Plan og Workbench", "Live-økt og Gameplan", "Caddie", "TrackMan-import"];

export function PH25Abonnement({ data }: { data: PH25AbonnementData }) {
  const router = useRouter();
  const full = data.nivaa === "FULL";
  const spar = data.prisMndKr * 12 - data.prisAarKr;
  const planer = [
    { id: "TALENT" as const, pris: null, funksjoner: TALENT_FUNKSJONER },
    { id: "FULL" as const, pris: data.prisMndKr, funksjoner: FULL_FUNKSJONER },
  ];
  return (
    <Side max={1200}>
      <SideHode kicker="Meg · Abonnement" title="Abonnement" actions={<Tilbake href="/portal/meg" tekst="Meg" />} />
      <Faner aktiv="abonnement" />
      {data.flagg.ok && <InlineVarsel tone="ok">Betalingen er fullført. Det kan ta et lite øyeblikk før statusen under oppdateres.</InlineVarsel>}
      {data.flagg.avbrutt && (
        <InlineVarsel tone="info">
          Betalingen ble avbrutt. Ingenting er trukket fra kortet ditt.
          {data.kanOppgradere && <> <Link href="/portal/meg/abonnement/oppgrader/flyt" style={{ color: "inherit", fontWeight: 600 }}>Prøv igjen</Link></>}
        </InlineVarsel>
      )}
      {data.flagg.avbestilt && (
        <InlineVarsel tone="warn" tittel="FULL avsluttes.">
          Du beholder alt {data.fornyes ? `til og med ${data.fornyes}` : "ut perioden"}. Ingen flere trekk.
        </InlineVarsel>
      )}
      {data.betalingFeilet && (
        <InlineVarsel tone="signal" tittel="Siste betaling feilet.">Oppdater betalingskortet for å beholde tilgangen.</InlineVarsel>
      )}
      {!full && (
        <InlineVarsel tone="info" tittel="Gameplan krever FULL">
          Åpent i TALENT: testbatteriet, analyse og runderegistrering med SG, DataGolf-sammenligning, booking av enkelttimer og konto. Velg FULL for plan, Live-økt, Gameplan og Caddie.
        </InlineVarsel>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 12 }}>
        {planer.map((p) => {
          const paa = full ? p.id === "FULL" : p.id === "TALENT";
          return (
            <div key={p.id} className="pa-card ph25-plan" data-paa={paa} style={kort()}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ font: "600 17px/1 var(--font-mono)", color: "var(--text-primary)", letterSpacing: ".04em", flex: 1 }}>{p.id}</span>
                {paa && <StatusPille tone="ok">Ditt nivå</StatusPille>}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <span style={{ font: "var(--type-metric)", color: "var(--text-primary)" }}>{p.pris ? kr(p.pris) : "Gratis"}</span>
                {p.pris != null && <Meta>per mnd · eller {kr(data.prisAarKr)} per år</Meta>}
              </div>
              <ul className="ph25-liste">
                {p.funksjoner.map((f) => <li key={f}><Ikon icon={Check} size={14} name="check" />{f}</li>)}
              </ul>
              {p.id === "FULL" && full && (
                <Meta>{data.pakkeNavn ? `INKLUDERT I ${upper(data.pakkeNavn)}` : data.inkludert ? "INKLUDERT · INGEN MÅNEDSPRIS" : data.fornyes ? `FORNYES ${upper(data.fornyes)}` : "LØPER MÅNED FOR MÅNED"}</Meta>
              )}
              {p.id === "FULL" && !full && data.kanOppgradere && (
                <div><KnappLenke href="/portal/meg/abonnement/oppgrader/flyt">Velg FULL</KnappLenke></div>
              )}
              {p.id === "FULL" && !full && <Meta>ÅRLIG GIR {upper(kr(spar))} LAVERE PRIS</Meta>}
            </div>
          );
        })}
      </div>

      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 380px), 1fr))">
        <Stabel>
          <Sek t="Betalingskort">
            <Nokkelverdi items={[["Kort", "—", { hint: "Kortdata lagres aldri hos oss" }], ["Neste trekk", data.fornyes ?? "—", { mono: true }]]} />
            {data.kanEndreKort && <div><KnappLenke variant="secondary" size="sm" icon={CreditCard} iconName="credit-card" href="/portal/meg/abonnement/kort/ny">Endre betalingskort</KnappLenke></div>}
            <Meta>KORTET ENDRES HOS STRIPE</Meta>
          </Sek>
          {data.kanAvbestille && (
            <Sek t="Avslutt abonnement">
              <p style={muted}>Du beholder FULL ut perioden. Deretter får du TALENT.</p>
              <div><KnappLenke variant="ghost" href="/portal/meg/abonnement/avbestill">Avslutt abonnement</KnappLenke></div>
            </Sek>
          )}
        </Stabel>
        <Stabel>
          {data.fakturaer.length === 0 ? (
            <Sek t="Faktura"><p style={muted}>Ingen fakturaer ennå. Kvitteringer dukker opp her etter betaling.</p></Sek>
          ) : (
            <Tabell
              caption="Faktura"
              onSelect={(id) => router.push(`/portal/meg/abonnement/faktura/${id}`)}
              rows={data.fakturaer}
              columns={[
                { key: "d", label: "Dato", mono: true, render: (r) => r.dato },
                { key: "t", label: "Gjelder", render: (r) => r.tekst },
                { key: "a", label: "Beløp", mono: true, align: "right", render: (r) => kr(r.belopKr) },
                { key: "s", label: "Status", render: () => <StatusPille tone="ok">Betalt</StatusPille> },
              ]}
            />
          )}
          <div className="pa-card" style={kort({ paddingBlock: 4 })}><Lenke href="/portal/meg/dokumenter" icon={FileText} name="file-text" tittel="Alle dokumenter" /></div>
        </Stabel>
      </Kolonner>
    </Side>
  );
}

/* ---------- Avslutt abonnement ---------- */

export type PH25Konsekvens = { tittel: string; detalj: string };
export type PH25AvbestillData = { ukedag: string; dato: string; dagerIgjen: number; konsekvenser: PH25Konsekvens[] };

export function PH25Avbestill({ data }: { data: PH25AvbestillData }) {
  const [aapen, setAapen] = useState(false);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function avslutt() {
    setFeil(null);
    start(async () => {
      // Ved suksess redirecter actionen (Stripe kalles før egen database); ved feil kommer { ok: false }.
      const svar = await cancelPro();
      if (svar && !svar.ok) {
        setAapen(false);
        setFeil(svar.error ?? "Noe gikk galt. Prøv igjen om litt.");
      }
    });
  }

  return (
    <Side max={720}>
      <SideHode kicker="Meg · Abonnement" title="Avslutte FULL?" actions={<Tilbake href="/portal/meg/abonnement" tekst="Abonnement" />} />
      <Sek t="FULL gjelder til" meta={<Meta>{data.dagerIgjen} DAGER IGJEN</Meta>}>
        <span style={{ font: "var(--type-metric)", color: "var(--text-primary)", textTransform: "capitalize" }}>{data.ukedag} {data.dato}</span>
        <p style={muted}>Etter det får du TALENT: testbatteri, analyse og runderegistrering, booking og konto. Plan fra coach, Live-økt, Gameplan og Caddie stopper. Ingen flere trekk.</p>
      </Sek>
      <Sek t="Dette stopper">
        <ul className="ph25-liste">
          {data.konsekvenser.map((k) => (
            <li key={k.tittel} style={{ alignItems: "flex-start" }}>
              <Ikon icon={Lock} size={14} name="lock" />
              <span style={{ minWidth: 0 }}><strong style={{ fontWeight: 600 }}>{k.tittel}</strong> · <span style={{ color: "var(--text-secondary)" }}>{k.detalj}</span></span>
            </li>
          ))}
        </ul>
      </Sek>
      {feil && <InlineVarsel tone="signal" tittel="Kunne ikke avslutte.">{feil}</InlineVarsel>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <KnappLenke href="/portal/meg/abonnement" icon={Heart} iconName="heart">Behold FULL</KnappLenke>
        <Knapp variant="secondary" onClick={() => setAapen(true)}>Avslutt abonnement</Knapp>
      </div>
      <Meta>INGENTING ENDRES FØR DU BEKREFTER</Meta>
      <Dialogboks
        open={aapen}
        title="Avslutte FULL?"
        onClose={() => setAapen(false)}
        footer={<>
          <Knapp variant="secondary" onClick={() => setAapen(false)}>Behold FULL</Knapp>
          <Knapp variant="signal" loading={pending} loadingText="Avslutter …" onClick={avslutt}>Avslutt abonnement</Knapp>
        </>}
      >
        FULL gjelder til og med {data.dato}. Deretter får du TALENT. Du betaler ikke mer.
      </Dialogboks>
    </Side>
  );
}

/* ---------- Innstillinger ---------- */

export type PH25InnstillingerData = {
  epost: string;
  notif: UserPreferences["notif"];
  venneOktSynlig: boolean;
  samtykke: { kreves: boolean; godkjentDato: string | null; godkjentAv: string | null };
  abonnement: { nivaa: "FULL" | "TALENT"; tekst: string };
};

const VARSLER: ReadonlyArray<readonly [keyof UserPreferences["notif"], string]> = [
  ["treningsplanOppdatert", "Ny plan fra coach"],
  ["nyMeldingFraCoach", "Meldinger fra coach"],
  ["paaminnelse", "Påminnelse rett før økt"],
  ["turneringsresultater", "Turneringsresultater"],
  ["ukentligRapport", "Ukesdigest"],
];

export function PH25Innstillinger({ data }: { data: PH25InnstillingerData }) {
  const [notif, setNotif] = useState(data.notif);
  const [venner, setVenner] = useState(data.venneOktSynlig);
  const [feil, setFeil] = useState(false);
  const [, start] = useTransition();

  function lagre(neste: Partial<UserPreferences>, tilbake: () => void) {
    setFeil(false);
    start(async () => {
      try { await oppdaterPreferences(neste); } catch { tilbake(); setFeil(true); }
    });
  }
  function veksle(k: keyof UserPreferences["notif"], v: boolean) {
    const forrige = notif;
    const neste = { ...notif, [k]: v };
    setNotif(neste);
    lagre({ notif: neste }, () => setNotif(forrige));
  }

  const s = data.samtykke;
  return (
    <Side max={1200}>
      <SideHode kicker="Meg · Innstillinger" title="Innstillinger" actions={<Tilbake href="/portal/meg" tekst="Meg" />} />
      <Faner aktiv="innstillinger" />
      {feil && <InlineVarsel tone="signal" tittel="Endringen ble ikke lagret.">Prøv igjen.</InlineVarsel>}
      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 380px), 1fr))">
        <Stabel>
          <Sek t="Konto">
            <Nokkelverdi items={[
              ["E-post", data.epost, { hint: "Innloggingen din. Endres under Sikkerhet." }],
              ["Abonnement", data.abonnement.nivaa, { mono: true, hint: data.abonnement.tekst }],
              ...(s.kreves ? [["Foreldresamtykke", s.godkjentDato ? `${s.godkjentAv ? `Godkjent av ${s.godkjentAv}` : "Godkjent"} · ${s.godkjentDato}` : "Venter på godkjenning fra en forelder"] as const] : []),
            ]} />
            <Lenke href="/portal/meg/profil" icon={User} name="user" tittel="Rediger profil" sub="Navn, bilde og opplysninger" />
          </Sek>
          <Sek t="Varsler">
            {VARSLER.map(([k, l]) => <Bryter key={k} checked={notif[k]} onChange={(v) => veksle(k, v)} label={l} />)}
            <Meta>PÅ = DU FÅR VARSEL I APPEN</Meta>
          </Sek>
          <Sek t="Synlighet">
            <Bryter
              checked={venner}
              onChange={(v) => { const f = venner; setVenner(v); lagre({ venneOktSynlig: v }, () => setVenner(f)); }}
              label="La venner se øktene mine"
            />
            <Meta>VENNER SER BARE AT EN ØKT SKJEDDE, ALDRI PLAN ELLER TALL</Meta>
          </Sek>
        </Stabel>
        <Stabel>
          <Sek t="Samtykke og personvern" meta={<Meta>UNDER 16 ÅR GIR FORELDEREN SAMTYKKET</Meta>}>
            <Lenke href="/portal/meg/innstillinger/personvern" icon={Shield} name="shield" tittel="Samtykker" sub="Helsedata, deling, eksport av data" />
          </Sek>
          <Sek t="Sikkerhet">
            <Lenke href="/portal/meg/innstillinger/sikkerhet" icon={Lock} name="lock" tittel="Passord og tofaktor" sub="Endre passord og e-post, se siste innlogging" />
          </Sek>
          <Sek t="Hjelp">
            <Lenke href="/portal/meg/help/artikkel/logg-din-forste-runde" icon={FileText} name="file-text" tittel="Slik registrerer du en runde" />
            <Lenke href="/portal/meg/help/artikkel/koble-til-trackman" icon={FileText} name="file-text" tittel="Slik kobler du TrackMan" />
            <Lenke href="/portal/meg/help" icon={CircleHelp} name="circle-help" tittel="Hjelpesenter" sub="Søk, kategorier og kontakt" />
          </Sek>
          <Sek t="Tilbakemelding">
            <p style={muted}>Bug, forslag eller ros. Vi leser alt.</p>
            <div><KnappLenke variant="secondary" size="sm" icon={Send} iconName="send" href="/portal/meg/feedback">Gi tilbakemelding</KnappLenke></div>
          </Sek>
          <Sek t="Slett konto">
            <p style={muted}>Forespørselen behandles av coach eller admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde. Avidentifisert treningshistorikk beholdes.</p>
            <div><KnappLenke variant="secondary" size="sm" icon={Trash2} iconName="trash-2" href="/portal/meg/innstillinger/personvern#slett-konto">Slett konto</KnappLenke></div>
          </Sek>
        </Stabel>
      </Kolonner>
    </Side>
  );
}

/* ---------- Sikkerhet ---------- */

function oversettAuthFeil(msg: string): string {
  if (msg.includes("should be different from the old password")) return "Velg et annet passord enn det du hadde fra før.";
  if (msg.includes("Password should be at least")) return "Passordet må være minst 8 tegn.";
  if (msg.includes("Auth session missing")) return "Økten din er utløpt. Logg ut og inn igjen.";
  if (msg.includes("A user with this email address has already been registered")) return "Denne e-postadressen er allerede i bruk.";
  return msg;
}
const krevesReauth = (msg: string) => msg.includes("AAL") || msg.includes("reauthenticat");

export function PH25Sikkerhet({ sisteInnlogging }: { sisteInnlogging: string }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwFeil, setPwFeil] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);
  const [epost, setEpost] = useState("");
  const [epBusy, setEpBusy] = useState(false);
  const [epFeil, setEpFeil] = useState<string | null>(null);
  const [epOk, setEpOk] = useState(false);
  const [reauth, setReauth] = useState(false);
  const [grunn, setGrunn] = useState("");
  const retry = useRef<(() => void) | null>(null);

  async function lagrePassord() {
    setPwFeil(null); setPwOk(false);
    if (pw.length < 8) { setPwFeil("Passordet må være minst 8 tegn."); return; }
    if (pw !== pw2) { setPwFeil("Passordene er ikke like."); return; }
    setPwBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwBusy(false);
    if (error) {
      if (krevesReauth(error.message)) {
        retry.current = () => void lagrePassord();
        setGrunn("Du er i ferd med å endre passordet ditt. Bekreft identiteten din for å fortsette.");
        setReauth(true);
        return;
      }
      setPwFeil(oversettAuthFeil(error.message));
      return;
    }
    setPwOk(true); setPw(""); setPw2("");
  }

  async function lagreEpost() {
    setEpFeil(null); setEpOk(false);
    const e = epost.trim();
    if (!e || !e.includes("@")) { setEpFeil("Skriv inn en gyldig e-postadresse."); return; }
    setEpBusy(true);
    const { error } = await createClient().auth.updateUser({ email: e });
    setEpBusy(false);
    if (error) {
      if (krevesReauth(error.message)) {
        retry.current = () => void lagreEpost();
        setGrunn("Du er i ferd med å endre e-postadressen din. Bekreft identiteten din for å fortsette.");
        setReauth(true);
        return;
      }
      setEpFeil(oversettAuthFeil(error.message));
      return;
    }
    setEpOk(true);
  }

  return (
    <Side max={1200}>
      <SideHode kicker="Meg · Innstillinger" title="Sikkerhet" actions={<Tilbake href="/portal/meg/innstillinger" tekst="Innstillinger" />} />
      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 380px), 1fr))">
        <Stabel>
          <Sek t="Tofaktor-innlogging (2FA)">
            <p style={muted}>Med tofaktor trenger du en kode fra mobilen i tillegg til passordet. Anbefales.</p>
            <div><KnappLenke icon={KeyRound} iconName="key-round" href="/portal/meg/sikkerhet/2fa">Sett opp tofaktor</KnappLenke></div>
          </Sek>
          <Sek t="Innlogging">
            <Nokkelverdi items={[["Siste innlogging", sisteInnlogging, { mono: true }]]} />
            <Meta>FULL ØKTLISTE ER IKKE TILGJENGELIG ENNÅ</Meta>
          </Sek>
        </Stabel>
        <Stabel>
          <Sek t="Endre passord">
            <Felt label="Nytt passord" error={pwFeil ?? undefined}><Inn type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Minst 8 tegn" /></Felt>
            <Felt label="Bekreft nytt passord"><Inn type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Gjenta passordet" /></Felt>
            {pwOk && !pwFeil && <InlineVarsel tone="ok">Passord oppdatert.</InlineVarsel>}
            <div><Knapp icon={Check} iconName="check" loading={pwBusy} onClick={() => void lagrePassord()}>Lagre nytt passord</Knapp></div>
          </Sek>
          <Sek t="Endre e-post">
            <Felt label="Ny e-postadresse" error={epFeil ?? undefined}><Inn type="email" autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="navn@eksempel.no" /></Felt>
            {epOk && !epFeil && <InlineVarsel tone="ok">Bekreftelseslenke sendt til {epost.trim()}. E-posten endres først når du klikker lenken.</InlineVarsel>}
            <div><Knapp icon={Mail} iconName="mail" loading={epBusy} loadingText="Sender …" onClick={() => void lagreEpost()}>Lagre ny e-post</Knapp></div>
            <Meta>GLEMT PASSORDET? BRUK «GLEMT PASSORD» PÅ INNLOGGINGSSIDEN</Meta>
          </Sek>
        </Stabel>
      </Kolonner>
      {reauth && (
        <ReauthModal
          open
          onClose={() => setReauth(false)}
          onSuccess={() => { setReauth(false); retry.current?.(); }}
          reason={grunn}
        />
      )}
    </Side>
  );
}

/* ---------- Samtykker og personvern ---------- */

export type PH25HelseData = { wearable: boolean; manuell: boolean; coachInnsyn: boolean; coachDetalj: boolean; sistGittAt: string | null; krevesForesatt: boolean };
export type PH25DelingGruppe = { gruppeId: string; gruppeNavn: string; testResultater: boolean; stats: boolean };
export type PH25Tekst = { tittel: string; forklaring: string; punkter?: readonly string[] };
/** Samtykketeksten kommer fra regel-laget på serveren: det som vises er det som lagres og kan bevises. */
export type PH25PersonvernData = {
  helse: PH25HelseData;
  helseTekst: Record<HelseSamtykkeType, PH25Tekst>;
  delingGrupper: PH25DelingGruppe[];
  delingTekst: Record<"TEST_RESULTATER" | "STATS", PH25Tekst>;
  krevesForesatt: boolean;
};

const datoLang = (iso: string) => new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });

function Samtykkebryter({ tittel, forklaring, punkter, checked, onChange }: { tittel: string; forklaring: string; punkter?: readonly string[]; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="ph25-bryterrad">
      <Bryter checked={checked} onChange={onChange} label={tittel} />
      <p style={muted}>{forklaring}</p>
      {punkter && punkter.length > 0 && (
        <ul className="ph25-liste">{punkter.map((p) => <li key={p} style={{ alignItems: "flex-start" }}><Ikon icon={Check} size={14} name="check" /><span style={{ minWidth: 0 }}>{p}</span></li>)}</ul>
      )}
    </div>
  );
}

type HelseValg = { wearable: boolean; manuell: boolean; coachInnsyn: boolean; coachDetalj: boolean };
/** Speiler avhengighetene serveren håndhever: coachen ser bare det som har en kilde. */
function ryddValg(v: HelseValg): HelseValg {
  const coachInnsyn = (v.wearable || v.manuell) && v.coachInnsyn;
  return { ...v, coachInnsyn, coachDetalj: coachInnsyn && v.coachDetalj };
}
const HELSE_FELT: Record<HelseSamtykkeType, keyof HelseValg> = { WEARABLE_HELSE: "wearable", MANUELL_HELSE: "manuell", COACH_INNSYN: "coachInnsyn", COACH_DETALJ: "coachDetalj" };

function HelseSamtykke({ data, tekster }: { data: PH25HelseData; tekster: PH25PersonvernData["helseTekst"] }) {
  const [pending, start] = useTransition();
  const [valg, setValg] = useState<HelseValg>({ wearable: data.wearable, manuell: data.manuell, coachInnsyn: data.coachInnsyn, coachDetalj: data.coachDetalj });
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const harKilde = valg.wearable || valg.manuell;

  function endre(type: HelseSamtykkeType, ny: boolean) {
    if (pending) return;
    if (data.krevesForesatt && ny) return; // under 16: kan ikke slå på selv, men alltid av
    setFeil(null); setLagret(false);
    const forrige = valg;
    setValg(ryddValg({ ...valg, [HELSE_FELT[type]]: ny }));
    start(async () => {
      const svar = await settEgetHelseSamtykke(type, ny);
      if (!svar.ok) { setValg(forrige); setFeil(svar.feil); return; }
      setLagret(true);
    });
  }
  const rad = (type: HelseSamtykkeType) => {
    const t = tekster[type];
    return <Samtykkebryter key={type} tittel={t.tittel} forklaring={t.forklaring} punkter={t.punkter} checked={valg[HELSE_FELT[type]]} onChange={(v) => endre(type, v)} />;
  };
  return (
    <Sek t="Helsedata" meta={<StatusPille tone={harKilde ? "ok" : "neutral"}>{harKilde ? "På" : "Av"}</StatusPille>}>
      <p style={muted}>Søvn, puls og restitusjon er sensitive opplysninger. Du bestemmer hva vi lagrer og hva coachen din får se, og kan ombestemme deg når som helst.</p>
      {data.krevesForesatt && <InlineVarsel tone="info">Du er under 16 år. En foresatt må godkjenne dette i foreldreportalen før vi kan hente helsedata. Du kan alltid slå det av selv.</InlineVarsel>}
      {rad("WEARABLE_HELSE")}
      {rad("MANUELL_HELSE")}
      {harKilde && rad("COACH_INNSYN")}
      {valg.coachInnsyn && rad("COACH_DETALJ")}
      <Meta>{pending ? "LAGRER …" : feil ? upper(feil) : lagret ? "SAMTYKKE LAGRET · ENDRINGEN ER LOGGET" : harKilde && data.sistGittAt ? `SAMTYKKE GITT ${upper(datoLang(data.sistGittAt))} · ENDRINGER LOGGES` : "ENDRINGER LOGGES I REVISJONSLOGGEN"}</Meta>
    </Sek>
  );
}

type DelingScope = "TEST_RESULTATER" | "STATS";
const SCOPE_FELT: Record<DelingScope, "testResultater" | "stats"> = { TEST_RESULTATER: "testResultater", STATS: "stats" };

function DelingSamtykke({ grupper, krevesForesatt, tekster }: { grupper: PH25DelingGruppe[]; krevesForesatt: boolean; tekster: PH25PersonvernData["delingTekst"] }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState(grupper);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const noeDelt = status.some((g) => g.testResultater || g.stats);

  function endre(gruppeId: string, scope: DelingScope, ny: boolean) {
    if (pending) return;
    if (krevesForesatt && ny) return;
    setFeil(null); setLagret(false);
    const forrige = status;
    setStatus((p) => p.map((g) => (g.gruppeId === gruppeId ? { ...g, [SCOPE_FELT[scope]]: ny } : g)));
    start(async () => {
      const svar = ny ? await giDelingsSamtykke(scope, gruppeId) : await trekkDelingsSamtykke(scope, gruppeId);
      if (!svar.ok) { setStatus(forrige); setFeil(svar.feil); return; }
      setLagret(true);
    });
  }
  return (
    <Sek t="Deling med eksterne miljøer" meta={<StatusPille tone={noeDelt ? "ok" : "neutral"}>{noeDelt ? "På" : "Av"}</StatusPille>}>
      <p style={muted}>Miljøer som Team Norway og WANG kan be om innsyn i testresultater og statistikk. Ingenting deles uten samtykke her. Gruppemedlemskap alene gir aldri deling.</p>
      {krevesForesatt && <InlineVarsel tone="info">Du er under 16 år. En foresatt må godkjenne delingen i foreldreportalen før noe deles. Du kan alltid slå det av selv.</InlineVarsel>}
      {status.length === 0 ? (
        <p style={muted}>Ingen eksterne miljøer har bedt om innsyn ennå. Når et miljø får lesetilgang til en av gruppene dine, dukker valget opp her.</p>
      ) : status.map((g) => (
        <div key={g.gruppeId} style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid var(--border-hairline)", paddingTop: 12 }}>
          <span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{g.gruppeNavn}</span>
          {(Object.keys(SCOPE_FELT) as DelingScope[]).map((scope) => {
            const t = tekster[scope];
            return <Samtykkebryter key={scope} tittel={t.tittel} forklaring={t.forklaring} checked={g[SCOPE_FELT[scope]]} onChange={(v) => endre(g.gruppeId, scope, v)} />;
          })}
        </div>
      ))}
      <Meta>{pending ? "LAGRER …" : feil ? upper(feil) : lagret ? "SAMTYKKE LAGRET · ENDRINGEN ER LOGGET" : "ENDRINGER LOGGES I REVISJONSLOGGEN"}</Meta>
    </Sek>
  );
}

function Eksport() {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  function eksporter() {
    start(async () => {
      setStatus(null);
      const r = await exportUserData();
      if (!r.ok || !r.data) { setStatus({ ok: false, msg: r.error ?? "Eksport feilet." }); return; }
      const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `akgolf-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ ok: true, msg: "Eksport lastet ned" });
    });
  }
  return (
    <Sek t="Last ned dine data">
      <p style={muted}>Få en fil med profil, runder, økter, mål, betalinger, varsler og meldinger.</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Knapp variant="secondary" icon={Download} iconName="download" loading={pending} loadingText="Genererer …" onClick={eksporter}>Last ned mine data</Knapp>
        {status && <Meta>{upper(status.msg)}</Meta>}
      </div>
    </Sek>
  );
}

function SlettKonto() {
  const [aapen, setAapen] = useState(false);
  const [tekst, setTekst] = useState("");
  const [grunn, setGrunn] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const lukk = () => { setAapen(false); setTekst(""); setGrunn(""); setFeil(null); };

  function send() {
    start(async () => {
      setFeil(null);
      const r = await opprettGdprForesporsel(grunn.trim() || undefined);
      if (!r.ok) { setFeil(r.error ?? "Kunne ikke sende forespørselen."); return; }
      lukk();
      setMelding(r.alleredeSendt ? "Du har allerede en åpen forespørsel." : "Forespørsel om sletting sendt");
    });
  }
  return (
    <div id="slett-konto" className="pa-card" style={kort()}>
      <span className="kicker">Slett konto</span>
      <p style={muted}>Forespørselen behandles av coach eller admin. Ved godkjenning anonymiseres navn, e-post, telefon og bilde. Avidentifisert treningshistorikk beholdes.</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Knapp variant="secondary" size="sm" icon={Trash2} iconName="trash-2" onClick={() => setAapen(true)}>Slett konto</Knapp>
        {melding && <Meta>{upper(melding)}</Meta>}
      </div>
      <Dialogboks
        open={aapen}
        title="Slette kontoen?"
        onClose={lukk}
        footer={<>
          <Knapp variant="secondary" onClick={lukk}>Behold kontoen</Knapp>
          <Knapp variant="signal" disabled={tekst.trim().toUpperCase() !== "SLETT"} loading={pending} loadingText="Sender …" onClick={send}>Send forespørsel</Knapp>
        </>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, font: "var(--type-body)" }}>Dette kan ikke angres. Skriv SLETT for å bekrefte.</p>
          <Felt label="Skriv SLETT" error={feil ?? undefined}><Inn value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder="SLETT" style={{ fontFamily: "var(--font-mono)" }} /></Felt>
          <Felt label="Hvorfor? (valgfritt)"><Inn value={grunn} onChange={(e) => setGrunn(e.target.value)} placeholder="Skriv kort" maxLength={500} /></Felt>
        </div>
      </Dialogboks>
    </div>
  );
}

export function PH25Personvern({ data }: { data: PH25PersonvernData }) {
  return (
    <Side max={1200}>
      <SideHode kicker="Meg · Innstillinger" title="Samtykker" sub="Du kan endre alt her, når som helst. Ingenting deles uten ja." actions={<Tilbake href="/portal/meg/innstillinger" tekst="Innstillinger" />} />
      <Kolonner mal="repeat(auto-fit, minmax(min(100%, 380px), 1fr))">
        <Stabel>
          <HelseSamtykke data={data.helse} tekster={data.helseTekst} />
          <DelingSamtykke grupper={data.delingGrupper} krevesForesatt={data.krevesForesatt} tekster={data.delingTekst} />
        </Stabel>
        <Stabel>
          <Eksport />
          <Sek t="Hvordan vi behandler dataene dine">
            <ul className="ph25-liste">
              {[
                ["Lagring", "Alle data lagres kryptert i EU (Supabase)."],
                ["Betaling", "Kortdata håndteres kun av Stripe. Vi lagrer aldri kortnummer."],
                ["E-post", "Kun nødvendige e-poster (booking, plan, varsler), ikke reklame uten samtykke."],
              ].map(([t, d]) => (
                <li key={t} style={{ alignItems: "flex-start" }}><Ikon icon={Lock} size={14} name="lock" /><span style={{ minWidth: 0 }}><strong style={{ fontWeight: 600 }}>{t}:</strong> {d}</span></li>
              ))}
            </ul>
            <p style={muted}>Mer i <Link href="/personvern" style={{ color: "inherit", fontWeight: 600 }}>personvernerklæringen</Link>. Spørsmål? <a href="mailto:post@akgolf.no" style={{ color: "inherit", fontWeight: 600 }}>post@akgolf.no</a></p>
          </Sek>
          <SlettKonto />
        </Stabel>
      </Kolonner>
    </Side>
  );
}

/* ---------- Hjelp ---------- */

export type PH25HjelpData = { faq: HjelpFaq[]; kategorier: HjelpKategori[]; artikler: HjelpArtikkel[] };

export function PH25Hjelp({ data }: { data: PH25HjelpData }) {
  const [sok, setSok] = useState("");
  const q = sok.trim().toLocaleLowerCase("nb-NO");
  const kat = q ? data.kategorier.filter((k) => `${k.tittel} ${k.beskrivelse}`.toLocaleLowerCase("nb-NO").includes(q)) : data.kategorier;
  const art = q ? data.artikler.filter((a) => `${a.tittel} ${a.kategori}`.toLocaleLowerCase("nb-NO").includes(q)) : [];
  const faq = q ? data.faq.filter((f) => `${f.q} ${f.a}`.toLocaleLowerCase("nb-NO").includes(q)) : data.faq;
  const ingen = q && kat.length + art.length + faq.length === 0;
  return (
    <Side max={1200}>
      <SideHode kicker="Meg · Hjelp" title="Hjelpesenter" actions={<Tilbake href="/portal/meg/innstillinger" tekst="Innstillinger" />} />
      <Sokefelt value={sok} onChange={setSok} placeholder="Søk i hjelpesenteret" label="Søk i hjelpesenteret" />
      {ingen ? (
        <Sek t="Ingen treff">
          <p style={muted}>Fant ingenting på «{sok.trim()}». Ta kontakt, så hjelper vi deg.</p>
          <div><KnappLenke variant="secondary" size="sm" icon={MessageSquare} iconName="message-square" href="/portal/meg/help/kontakt">Kontakt oss</KnappLenke></div>
        </Sek>
      ) : (
        <Kolonner mal="repeat(auto-fit, minmax(min(100%, 380px), 1fr))">
          <Stabel>
            {kat.length > 0 && (
              <Sek t="Kategorier" meta={<Meta>{kat.length}</Meta>}>
                {kat.map((k) => <Lenke key={k.slug} href={`/portal/meg/help/kategori/${k.slug}`} icon={CircleHelp} name="circle-help" tittel={k.tittel} sub={`${k.antall} artikler · ${k.beskrivelse}`} />)}
              </Sek>
            )}
            {art.length > 0 && (
              <Sek t="Artikler" meta={<Meta>{art.length}</Meta>}>
                {art.map((a) => <Lenke key={a.slug} href={`/portal/meg/help/artikkel/${a.slug}`} icon={FileText} name="file-text" tittel={a.tittel} sub={`${a.kategori} · ${a.lesetid} min`} />)}
              </Sek>
            )}
          </Stabel>
          <Stabel>
            {faq.length > 0 && (
              <Sek t="Ofte stilte spørsmål">
                {faq.map((f) => (
                  <details key={f.q} style={{ borderTop: "1px solid var(--border-hairline)", paddingBlock: 4 }}>
                    <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center", font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{f.q}</summary>
                    <p style={{ ...muted, paddingBottom: 8 }}>{f.a}</p>
                  </details>
                ))}
              </Sek>
            )}
            <Sek t="Ta kontakt">
              <Lenke href="/portal/meg/help/kontakt" icon={MessageSquare} name="message-square" tittel="Kontakt support" />
              <Lenke href="mailto:support@akgolf.no" icon={Mail} name="mail" tittel="support@akgolf.no" ekstern />
              <Lenke href="/portal/meg/feedback" icon={Send} name="send" tittel="Gi tilbakemelding" />
            </Sek>
          </Stabel>
        </Kolonner>
      )}
    </Side>
  );
}

/* ---------- Tilbakemelding ---------- */

type FeedbackType = "bug" | "forslag" | "ros" | "sporsmal";
const FEEDBACK_TYPER: ReadonlyArray<{ id: FeedbackType; label: string }> = [
  { id: "bug", label: "Bug" }, { id: "forslag", label: "Forslag" }, { id: "ros", label: "Ros" }, { id: "sporsmal", label: "Spørsmål" },
];

function fritekstSporsmal(nps: number): string {
  if (nps <= 6) return "Hva bør vi forbedre?";
  if (nps <= 8) return "Hva mangler for å gi en 10-er?";
  return "Hva liker du best?";
}

export function PH25Feedback({ takk }: { takk: boolean }) {
  const [nps, setNps] = useState(9);
  const [type, setType] = useState<FeedbackType>("forslag");
  const [tekst, setTekst] = useState("");
  const [anonym, setAnonym] = useState(false);
  const [feil, setFeil] = useState(false);
  const [pending, start] = useTransition();

  function send() {
    setFeil(false);
    start(async () => {
      try { await submitFeedback({ nps, type, tekst: tekst.trim(), anonym }); } catch { setFeil(true); }
    });
  }
  return (
    <Side max={720}>
      <SideHode kicker="Meg · Tilbakemelding" title="Tilbakemelding" sub="Vi leser alt. Det tar under ett minutt." actions={<Tilbake href="/portal/meg/innstillinger" tekst="Innstillinger" />} />
      {takk && <InlineVarsel tone="ok" tittel="Sendt.">Takk for tilbakemeldingen. Du gjør PlayerHQ bedre.</InlineVarsel>}
      {feil && <InlineVarsel tone="signal" tittel="Tilbakemeldingen ble ikke sendt.">Økten din kan ha utløpt. Logg inn på nytt og prøv igjen. Teksten din ligger igjen her.</InlineVarsel>}
      <Sek t="Hvor sannsynlig er det at du anbefaler PlayerHQ?" meta={<Meta>0–10</Meta>}>
        <div className="ph25-nps" role="group" aria-label="Anbefaling fra 0 til 10">
          {Array.from({ length: 11 }, (_, i) => (
            <Knapp key={i} variant={nps === i ? "primary" : "secondary"} aria-pressed={nps === i} onClick={() => setNps(i)}>{i}</Knapp>
          ))}
        </div>
      </Sek>
      <Sek t="Type tilbakemelding">
        <div className="pa-seg" role="group" aria-label="Type tilbakemelding" style={{ flexWrap: "wrap" }}>
          {FEEDBACK_TYPER.map((t) => <button key={t.id} type="button" className="pa-seg__opt" aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.label}</button>)}
        </div>
      </Sek>
      <Sek t="Din tilbakemelding" meta={<Meta>{tekst.length} / 2000</Meta>}>
        <Felt label={fritekstSporsmal(nps)}>
          <textarea className="pa-control" rows={5} value={tekst} maxLength={2000} onChange={(e) => setTekst(e.target.value)} placeholder="Skriv kort" style={{ width: "100%", minHeight: 120, padding: 12, resize: "vertical" }} />
        </Felt>
        <Bryter checked={anonym} onChange={setAnonym} label="Send anonymt" />
      </Sek>
      <div><Knapp icon={Send} iconName="send" disabled={tekst.trim().length === 0} loading={pending} loadingText="Sender …" onClick={send}>Send</Knapp></div>
    </Side>
  );
}

/* ---------- Feil (brukes av error.tsx under /portal/meg) ---------- */

export function PH25Feil({ reset, kicker, title, tittel, tekst, kode, tilbake }: {
  reset: () => void; kicker: string; title: string; tittel: string; tekst: string; kode: string; tilbake: { href: string; tekst: string };
}) {
  return (
    <Side max={720}>
      <SideHode kicker={kicker} title={title} />
      <FeilTilstand
        icon={CircleAlert}
        title={tittel}
        text={tekst}
        code={kode}
        retry={<>
          <Knapp icon={RotateCw} iconName="rotate-cw" onClick={reset}>Prøv igjen</Knapp>
          <KnappLenke variant="ghost" href={tilbake.href}>{tilbake.tekst}</KnappLenke>
        </>}
      />
    </Side>
  );
}
