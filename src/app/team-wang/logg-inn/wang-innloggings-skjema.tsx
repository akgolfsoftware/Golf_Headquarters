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
    <div className={styles.flate}>
      <section className={styles.hero} aria-labelledby={`${id}-tittel`}>
        <Image src="/team-wang/hero/trening-golf.jpg" alt="" fill priority sizes="(min-width: 860px) 520px, 100vw" className={styles.bilde} />
        <div className={styles.heroInnhold}>
          <Image src="/team-wang/wang-logo-vertical.svg" alt="WANG Toppidrett Fredrikstad" width={51} height={82} className={styles.logo} priority />
          <p className={styles.kicker}>{variant === "app" ? "Skoleplattform" : "Golf"}</p>
          <h1 id={`${id}-tittel`}>Logg inn</h1>
          <p className={styles.ingress}>{variant === "app"
            ? "Logg inn med WANG-kontoen din. Rollen på kontoen avgjør hva du kan se og gjøre."
            : "Innlogging for trenere og sportssjef ved WANG Toppidrett Fredrikstad."}</p>
        </div>
      </section>
      <form onSubmit={send} className={styles.skjema} aria-busy={travel} aria-labelledby={`${id}-tittel`}>
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
          : <>
            <p className={styles.passordhjelp}>Trenger du nytt passord, kontakt WANG-administrasjonen.</p>
            <Link href="/team-wang/demo" className={styles.tekstlenke}>Åpne Golf-demo</Link>
          </>}
      </form>
    </div>
  </main>;
}
