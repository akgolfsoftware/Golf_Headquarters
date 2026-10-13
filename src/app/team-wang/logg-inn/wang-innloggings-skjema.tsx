"use client";

/** Fasit: designsystem/wang/skjermer-batch2/c7-logg-inn.html. */
import { useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import styles from "./wang-login.module.css";

export function WangInnloggingsSkjema({ loggInn, variant = "golf" }: {
  loggInn: (input: { epost: string; passord: string }) => Promise<{ ok: boolean }>;
  variant?: "golf" | "app";
}) {
  const id = useId();
  const [epost, settEpost] = useState("");
  const [passord, settPassord] = useState("");
  const [visPassord, settVisPassord] = useState(false);
  const [status, settStatus] = useState<"klar" | "venter" | "feil" | "nettfeil" | "ferdig">("klar");
  const paagar = useRef(false);
  const travel = status === "venter" || status === "ferdig";
  const harFeil = status === "feil" || status === "nettfeil";

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paagar.current || travel) return;
    paagar.current = true;
    settStatus("venter");
    try {
      const result = await loggInn({ epost: epost.trim(), passord });
      settStatus(result.ok ? "ferdig" : "feil");
    } catch {
      settStatus("nettfeil");
    } finally {
      paagar.current = false;
    }
  }

  return <main className={styles.side}>
    <header className={styles.hode}>
      <Link href="/team-wang" aria-label="WANG Toppidrett – fellessiden" className={styles.merke}>
        <Image src="/team-wang/wang-crest.svg" alt="" width={34} height={44} />
        <span><strong>WANG Toppidrett Fredrikstad</strong><span>{variant === "app" ? "Skoleplattform" : "Golf"}</span></span>
      </Link>
    </header>
    <div className={styles.innhold}>
      <div className={styles.kolonne}>
        <section className={styles.hero} aria-labelledby={`${id}-tittel`}>
          <h1 id={`${id}-tittel`}>Logg inn</h1>
          <p>{variant === "app"
            ? "Logg inn med WANG-kontoen din. Rollen på kontoen avgjør hva du kan se og gjøre."
            : "Fellessiden er åpen for alle. Logg inn for å åpne innholdet kontoen din har tilgang til."}</p>
        </section>
        <form onSubmit={send} className={styles.kort} aria-busy={travel} aria-labelledby={`${id}-tittel`}>
          {harFeil && <p id={`${id}-feil`} role="alert" className={styles.feil}>
            {status === "nettfeil" ? "Fikk ikke forbindelse. Sjekk nettet og prøv igjen." : "Kunne ikke logge inn. Kontroller e-post og passord og prøv igjen."}
          </p>}
          <div className={styles.felt}>
            <label htmlFor={`${id}-epost`}>E-post</label>
            <input id={`${id}-epost`} name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required disabled={travel} value={epost} onChange={(e) => settEpost(e.target.value)} aria-describedby={harFeil ? `${id}-feil` : undefined} />
          </div>
          <div className={styles.felt}>
            <label htmlFor={`${id}-passord`}>Passord</label>
            <div className={styles.passord}>
              <input id={`${id}-passord`} name="password" type={visPassord ? "text" : "password"} autoComplete="current-password" required disabled={travel} value={passord} onChange={(e) => settPassord(e.target.value)} aria-describedby={harFeil ? `${id}-feil` : undefined} />
              <button type="button" className={styles.visPassord} aria-label={visPassord ? "Skjul passord" : "Vis passord"} aria-pressed={visPassord} onClick={() => settVisPassord(!visPassord)}>{visPassord ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}</button>
            </div>
          </div>
          <button type="submit" className={styles.primaer} disabled={travel}>{status === "ferdig" ? "Åpner WANG …" : status === "venter" ? "Logger inn …" : "Logg inn"}</button>
          <span role="status" className={styles.status}>{status === "ferdig" ? "Du er logget inn." : status === "venter" ? "Logger inn" : ""}</span>
          {variant === "golf"
            ? <Link href="/auth/forgot-password" className={styles.tekstlenke}>Glemt passord</Link>
            : <p className={styles.passordhjelp}>Trenger du nytt passord, kontakt WANG-administrasjonen.</p>}
        </form>
        <p className={styles.hjelp}>{variant === "app"
          ? "Mangler du rolle eller skoletilknytning, kontakt WANG-administrasjonen."
          : "Bruk kontoen du har fått tilgang med. Mangler du tilgang, kontakt treneren din."}</p>
        <Link href={variant === "app" ? "/team-wang/demo" : "/team-wang"} className={styles.sekundaer}>
          {variant === "app" ? "Se Golf-demo uten innlogging" : "Fortsett uten å logge inn"}
        </Link>
      </div>
      <aside className={styles.kort} aria-labelledby={`${id}-tilgang`}>
        <h2 id={`${id}-tilgang`}>Hvem ser hva</h2>
        <dl className={styles.roller}>
          {variant === "app" ? <>
            <div><dt>WANG sentralt</dt><dd>Samlet status uten automatisk tilgang til navngitte elever.</dd></div>
            <div><dt>Skoleledelse</dt><dd>Alle idretter og elevprofiler ved egen skole, men ikke søvn og dagsform.</dd></div>
            <div><dt>Sportssjef og trener</dt><dd>Workbench og utøveroppfølging for idretter de er tildelt.</dd></div>
            <div><dt>Elev og inviterte</dt><dd>Bare egen profil eller innhold som er uttrykkelig delt.</dd></div>
          </> : <>
            <div><dt>Uten innlogging</dt><dd>Felles årsplan, kalender og praktisk informasjon. Ingen elevnavn eller individuelle resultater.</dd></div>
            <div><dt>Elever og foresatte</dt><dd>Personlig innhold følger tilgangen på kontoen din.</dd></div>
            <div><dt>Trenere</dt><dd>Trenerverktøy krever innlogging og tilgang.</dd></div>
          </>}
        </dl>
        {variant === "app" ? <>
          <Link href="/team-wang" className={styles.tekstlenke}>Åpne felles årsplan</Link>
          <Link href="/team-wang/demo" className={styles.tekstlenke}>Åpne Golf-demo</Link>
        </> : <>
          <Link href="/team-wang/coach" className={styles.tekstlenke}>Åpne trenerflaten</Link>
          <Link href="/admin/spillere" className={styles.tekstlenke}>Elevadministrasjon</Link>
        </>}
      </aside>
    </div>
  </main>;
}
