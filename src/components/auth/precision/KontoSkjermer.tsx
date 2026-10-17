"use client";

/**
 * AU-01 til AU-03 i nytt design (docs/design-system/utkast-flater/innlogging.html, utkast 1 15.10.2026):
 * logg inn, logget ut, opprett konto, sjekk e-post, glemt passord og nytt passord.
 *
 * Bare Google eller e-post og passord (§INNLOGGING BARE MED GOOGLE OG PASSORD, 15.10). Magisk lenke,
 * engangskode og SMS-plassholderen fra forrige versjon er tatt bort.
 *
 * Avvik mot utkastet:
 * - Passord krever minst 10 tegn, som utkastet. Eksisterende passord på 8–9 tegn virker fortsatt ved innlogging.
 * - «Velg nivå» lagrer bare ønsket: alle starter på Gratis (ensureUser), og Full betales etter oppstarten
 *   via Stripe Checkout (plan «pro», 299 kr/mnd). Årspris velges i Meg › Abonnement.
 * - E-posten til «Sjekk e-posten din» bæres i sessionStorage, aldri i adressen.
 */
import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, Check, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FlateRamme } from "@/components/flater/FlateRamme";
import "@/styles/flater-ny-konto.css";

export const MIN_PASSORD = 10;
const EPOST_NOKKEL = "ak-registrert-epost";
const FORELDER_EPOST_NOKKEL = "ak-forelder-epost";

/** Leser én verdi fra sessionStorage etter hydrering (null på serveren og når lagring er stengt). */
function useLagret(nokkel: string): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(nokkel);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

function Feil({ children }: { children: ReactNode }) {
  return (
    <p className="feilmelding" role="alert">
      <AlertCircle className="ikon" aria-hidden="true" />
      {children}
    </p>
  );
}

function origin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function oversettAuthFeil(msg: string): string {
  if (/already registered|already exists/i.test(msg)) return "Det finnes allerede en konto med denne e-posten. Logg inn, eller be om nytt passord.";
  if (/Password should be at least/i.test(msg)) return `Passordet er for kort. Minst ${MIN_PASSORD} tegn.`;
  if (/rate limit|too many/i.test(msg)) return "For mange forsøk. Prøv igjen om litt.";
  if (/Invalid login credentials/i.test(msg)) return "E-post eller passord stemmer ikke. Prøv igjen, eller be om nytt passord.";
  if (/Email not confirmed/i.test(msg)) return "E-posten er ikke bekreftet ennå. Trykk på lenken vi sendte deg.";
  return "Noe gikk galt. Ingenting er lagret. Prøv igjen.";
}

const FEILKODER: Record<string, string> = {
  "no-code": "Innloggingen ble avbrutt. Prøv igjen.",
  "invalid-code": "Lenken er brukt eller utløpt. Logg inn, eller be om en ny lenke.",
};

async function google(next: string) {
  return createClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin()}/api/auth/oauth-callback?next=${encodeURIComponent(next)}` },
  });
}

/* ---------- AU-01 Logg inn ---------- */

export function Innlogging({ next, feilkode }: { next?: string; feilkode?: string }) {
  const [epost, setEpost] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState<string | null>(feilkode ? FEILKODER[feilkode] ?? null : null);
  const [laster, setLaster] = useState(false);
  const etter = next ?? "/auth/etter-innlogging";

  async function loggInn(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    setLaster(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: epost.trim(), password: passord });
      if (error) {
        setLaster(false);
        setFeil(oversettAuthFeil(error.message));
        return;
      }
    } catch {
      setLaster(false);
      setFeil("Innloggingen virket ikke. Sjekk nettet og prøv igjen.");
      return;
    }
    window.location.replace(etter);
  }

  async function medGoogle() {
    setFeil(null);
    setLaster(true);
    const { error } = await google(etter);
    if (error) {
      setLaster(false);
      setFeil("Google-innloggingen virket ikke. Prøv igjen, eller bruk e-post og passord.");
    }
  }

  return (
    <FlateRamme skall="konto" toppLenke={{ tekst: "Ny bruker? Registrer", href: "/auth/signup" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde, samme som utkastet */}
      <img className="konto-bilde" src="/images/playerhq/turn-tee.jpg" alt="" width={960} height={300} />
      <div className="topp">
        <h1 className="tittel">Logg inn</h1>
      </div>
      <button type="button" className="knapp google hel" onClick={medGoogle} disabled={laster}>Logg inn med Google</button>
      <div className="eller">eller</div>
      <form className="seksjon" onSubmit={loggInn} noValidate>
        <div className="felt">
          <label htmlFor="le">E-post</label>
          <input id="le" type="email" required autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} />
        </div>
        <div className="felt">
          <label htmlFor="lp">Passord</label>
          <input id="lp" type="password" required autoComplete="current-password" value={passord} aria-invalid={feil ? "true" : "false"} onChange={(e) => setPassord(e.target.value)} />
        </div>
        {feil && <Feil>{feil}</Feil>}
        <button type="submit" className="knapp pri stor" disabled={laster || !epost.trim() || !passord}>
          {laster ? "Logger inn …" : "Logg inn"}
        </button>
        <a href="/auth/forgot-password" className="lenke">Glemt passord?</a>
      </form>
    </FlateRamme>
  );
}

/* ---------- AU-01 Logget ut ---------- */

export function LoggetUt() {
  return (
    <FlateRamme skall="konto">
      <span className="stor-ikon"><Check className="ikon" aria-hidden="true" /></span>
      <div className="topp">
        <h1 className="tittel">Du er logget ut</h1>
        <p className="ingress">Ingenting er lagret på denne enheten. Logg inn igjen når du vil fortsette.</p>
      </div>
      <a href="/auth/login" className="knapp pri stor">Logg inn</a>
      <Link href="/" className="lenke">Til forsiden</Link>
    </FlateRamme>
  );
}

/* ---------- AU-02 Opprett konto ---------- */

type Rolle = "PLAYER" | "PARENT";
type Niva = "GRATIS" | "FULL";

export function Registrering({
  standardEpost,
  subscribe,
  kilde,
  startRolle = "PLAYER",
  forelderGodkjent,
}: {
  standardEpost?: string;
  subscribe?: string;
  kilde?: "talenthq";
  startRolle?: Rolle;
  forelderGodkjent?: boolean;
}) {
  const [rolle, setRolle] = useState<Rolle>(startRolle);
  const [niva, setNiva] = useState<Niva>(subscribe ? "FULL" : "GRATIS");
  const [navn, setNavn] = useState("");
  const [epostSkrevet, setEpost] = useState<string | null>(standardEpost ?? null);
  const [passord, setPassord] = useState("");
  const [vilkar, setVilkar] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  // Forelder som nettopp godkjente fra lenken: e-posten fra invitasjonen, aldri i adressen.
  const fraGodkjenning = useLagret(FORELDER_EPOST_NOKKEL);
  const epost = epostSkrevet ?? (startRolle === "PARENT" ? fraGodkjenning ?? "" : "");

  // Full betales etter oppstarten (checkout-resume). Forelder har ikke PlayerHQ-nivå.
  const plan = rolle === "PLAYER" && niva === "FULL" ? subscribe ?? "pro" : undefined;
  const oppstart = plan ? `/auth/onboarding?subscribe=${encodeURIComponent(plan)}` : "/auth/onboarding";

  async function opprett(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!navn.trim()) return setFeil("Skriv navnet ditt.");
    if (passord.length < MIN_PASSORD) return setFeil(`Passordet må ha minst ${MIN_PASSORD} tegn.`);
    if (!vilkar) return setFeil("Du må godta vilkårene for å opprette konto.");
    setLaster(true);
    const [fornavn, ...rest] = navn.trim().split(/\s+/);
    const { data, error } = await createClient().auth.signUp({
      email: epost.trim(),
      password: passord,
      options: {
        // Rolle og navn leses av ensureUser og oauth-callback. Nivå settes aldri fra klienten.
        data: { role: rolle, tier: "GRATIS", firstName: fornavn, lastName: rest.join(" "), ...(kilde ? { kilde } : {}) },
        emailRedirectTo: `${origin()}/api/auth/oauth-callback?next=${encodeURIComponent(oppstart)}`,
      },
    });
    if (error) {
      setLaster(false);
      setFeil(oversettAuthFeil(error.message));
      return;
    }
    if (data.session) {
      window.location.replace(oppstart);
      return;
    }
    try {
      sessionStorage.setItem(EPOST_NOKKEL, epost.trim());
    } catch {
      // Uten lagring viser sjekk-e-post-siden en generell tekst.
    }
    window.location.replace("/auth/check-email");
  }

  async function medGoogle() {
    setFeil(null);
    setLaster(true);
    const { error } = await google(oppstart);
    if (error) {
      setLaster(false);
      setFeil("Google-innloggingen virket ikke. Prøv igjen, eller bruk e-post og passord.");
    }
  }

  const ingress = forelderGodkjent
    ? "Kontoen til barnet er godkjent. Opprett din egen konto med samme e-post, så ser du barnet under Forelder."
    : kilde === "talenthq"
      ? "Gratis profil med testbatteri, statistikk og Strokes Gained."
      : "Du kan starte gratis og bytte til Full når som helst.";

  return (
    <FlateRamme skall="konto" bred toppLenke={{ tekst: "Har du konto? Logg inn", href: "/auth/login" }}>
      <div className="topp">
        <h1 className="tittel">Opprett konto</h1>
        <p className="ingress">{ingress}</p>
      </div>
      <section className="seksjon">
        <span className="undertittel" id="jeg-er">Jeg er</span>
        <div className="valg" role="group" aria-labelledby="jeg-er">
          <button type="button" aria-pressed={rolle === "PLAYER"} onClick={() => setRolle("PLAYER")}>Spiller</button>
          <button type="button" aria-pressed={rolle === "PARENT"} onClick={() => setRolle("PARENT")}>Forelder</button>
        </div>
      </section>
      {rolle === "PLAYER" && kilde !== "talenthq" && (
        <section className="seksjon">
          <span className="undertittel" id="niva">Velg nivå</span>
          <div className="pakker" role="group" aria-labelledby="niva">
            <button type="button" className="pakke" aria-pressed={niva === "GRATIS"} onClick={() => setNiva("GRATIS")}>
              <span className="rad"><b>Gratis</b><span className="pris">0 kr</span></span>
              <ul><li>Registrer runder og se snittscore</li><li>Book time med coach</li></ul>
            </button>
            <button type="button" className="pakke" aria-pressed={niva === "FULL"} onClick={() => setNiva("FULL")}>
              <span className="rad"><b>Full</b><span className="pris">299 kr/mnd</span></span>
              <ul><li>Plan, Workbench og Live-økt</li><li>Strokes Gained, tester og Caddie</li></ul>
              <span className="kilde">Eller 2 690 kr/år. Én uke Full før første trekk.</span>
            </button>
          </div>
        </section>
      )}
      <form className="seksjon" onSubmit={opprett} noValidate>
        <div className="felt"><label htmlFor="rn">Navn</label><input id="rn" autoComplete="name" value={navn} onChange={(e) => setNavn(e.target.value)} /></div>
        <div className="felt"><label htmlFor="re">E-post</label><input id="re" type="email" required autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} /></div>
        <div className="felt">
          <label htmlFor="rp">Passord</label>
          <input id="rp" type="password" required autoComplete="new-password" value={passord} onChange={(e) => setPassord(e.target.value)} aria-describedby="rp-hjelp" />
          <span className="hjelp" id="rp-hjelp">Minst {MIN_PASSORD} tegn.</span>
        </div>
        <label className="avkrysning">
          <input type="checkbox" checked={vilkar} onChange={(e) => setVilkar(e.target.checked)} />
          <span>Jeg godtar <a href="/vilkar">vilkårene</a> og har lest <a href="/personvern">personvernerklæringen</a>.</span>
        </label>
        {feil && <Feil>{feil}</Feil>}
        <button type="submit" className="knapp pri stor" disabled={laster}>{laster ? "Oppretter konto …" : "Opprett konto"}</button>
        <div className="eller">eller</div>
        <button type="button" className="knapp google hel" onClick={medGoogle} disabled={laster}>Fortsett med Google</button>
      </form>
      <p className="kilde">{plan ? "Betaling for Full skjer etter oppstarten. Ingenting trekkes før du har bekreftet." : "Du kan bytte til Full senere i Meg."}</p>
    </FlateRamme>
  );
}

/* ---------- AU-02 Sjekk e-post ---------- */

export function SjekkEpost() {
  const epost = useLagret(EPOST_NOKKEL);
  const [status, setStatus] = useState<string | null>(null);

  async function sendPaaNytt() {
    if (!epost) return;
    setStatus(null);
    const { error } = await createClient().auth.resend({ type: "signup", email: epost });
    setStatus(error ? oversettAuthFeil(error.message) : "Ny lenke er sendt.");
  }

  return (
    <FlateRamme skall="konto">
      <span className="stor-ikon"><Mail className="ikon" aria-hidden="true" /></span>
      <div className="topp">
        <h1 className="tittel">Sjekk e-posten din</h1>
        <p className="ingress">
          {epost ? <>Vi har sendt en lenke til <b>{epost}</b>.</> : "Vi har sendt en lenke til e-posten du registrerte."} Trykk på lenken for å bekrefte kontoen og starte oppstarten.
        </p>
      </div>
      <div className="kort dempet"><p className="forklar">Finner du den ikke, se i søppelpost.</p></div>
      {epost && <button type="button" className="knapp sek hel" onClick={sendPaaNytt}>Send lenken på nytt</button>}
      {status && <p className="kilde" role="status">{status}</p>}
      <a href="/auth/signup" className="lenke">Bruk en annen e-post</a>
    </FlateRamme>
  );
}

/* ---------- AU-03 Glemt passord ---------- */

export function GlemtPassord() {
  const [epost, setEpost] = useState("");
  const [sendt, setSendt] = useState(false);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function send(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    setLaster(true);
    const { error } = await createClient().auth.resetPasswordForEmail(epost.trim(), { redirectTo: `${origin()}/auth/reset-password` });
    setLaster(false);
    // Samme svar om kontoen finnes eller ikke; bare tekniske feil vises.
    if (error && /rate limit|too many/i.test(error.message)) return setFeil(oversettAuthFeil(error.message));
    setSendt(true);
  }

  return (
    <FlateRamme skall="konto" tilbake={{ tekst: "Logg inn", href: "/auth/login" }}>
      <div className="topp">
        <h1 className="tittel">Glemt passord</h1>
        <p className="ingress">Skriv e-posten du logger inn med. Vi sender en lenke for å lage nytt passord.</p>
      </div>
      <form className="seksjon" onSubmit={send} noValidate>
        <div className="felt"><label htmlFor="ge">E-post</label><input id="ge" type="email" required autoComplete="email" value={epost} onChange={(e) => setEpost(e.target.value)} /></div>
        {feil && <Feil>{feil}</Feil>}
        <button type="submit" className="knapp pri stor" disabled={laster || !epost.trim()}>{laster ? "Sender …" : "Send lenke"}</button>
      </form>
      {sendt && (
        <div className="kort dempet" role="status">
          <b className="undertittel">Lenken er sendt</b>
          <p className="forklar">Finnes det en konto med denne e-posten, kommer lenken i løpet av et par minutter.</p>
        </div>
      )}
    </FlateRamme>
  );
}

/* ---------- AU-03 Nytt passord ---------- */

export function NyttPassord() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [laster, setLaster] = useState(false);
  const ulike = p2.length > 0 && p1 !== p2;

  async function lagre(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (p1.length < MIN_PASSORD) return setFeil(`Passordet må ha minst ${MIN_PASSORD} tegn.`);
    if (p1 !== p2) return setFeil("Passordene er ikke like.");
    setLaster(true);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    if (error) {
      setLaster(false);
      setFeil(/session|jwt|auth/i.test(error.message) ? "Lenken er utløpt. Be om en ny under Glemt passord." : oversettAuthFeil(error.message));
      return;
    }
    window.location.replace("/auth/etter-innlogging");
  }

  return (
    <FlateRamme skall="konto">
      <div className="topp">
        <h1 className="tittel">Nytt passord</h1>
      </div>
      <form className="seksjon" onSubmit={lagre} noValidate>
        <div className="felt"><label htmlFor="np1">Nytt passord</label><input id="np1" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /><span className="hjelp">Minst {MIN_PASSORD} tegn.</span></div>
        <div className="felt"><label htmlFor="np2">Gjenta passordet</label><input id="np2" type="password" autoComplete="new-password" value={p2} aria-invalid={ulike ? "true" : "false"} onChange={(e) => setP2(e.target.value)} /></div>
        {(feil || ulike) && <Feil>{feil ?? "Passordene er ikke like."}</Feil>}
        <button type="submit" className="knapp pri stor" disabled={laster}>{laster ? "Lagrer …" : "Lagre passord"}</button>
      </form>
      <a href="/auth/forgot-password" className="lenke">Be om ny lenke</a>
    </FlateRamme>
  );
}
