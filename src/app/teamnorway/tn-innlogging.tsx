"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import styles from "./tn-innlogging.module.css";

type Status = "klar" | "venter" | "feil" | "nettfeil" | "ferdig";

export function TnInnlogging({ retursti }: { retursti: string }) {
  const router = useRouter();
  const id = useId();
  const [epost, settEpost] = useState("");
  const [passord, settPassord] = useState("");
  const [visPassord, settVisPassord] = useState(false);
  const [status, settStatus] = useState<Status>("klar");
  const paagar = useRef(false);
  const opptatt = status === "venter" || status === "ferdig";
  const harFeil = status === "feil" || status === "nettfeil";

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paagar.current || opptatt) return;
    paagar.current = true;
    settStatus("venter");
    try {
      const { error } = await createClient().auth.signInWithPassword({ email: epost.trim(), password: passord });
      if (error?.name === "AuthRetryableFetchError" || error?.status === 0) {
        settStatus("nettfeil");
      } else if (error) {
        settStatus("feil");
      } else {
        settStatus("ferdig");
        router.replace(retursti);
        router.refresh();
      }
    } catch {
      settStatus("nettfeil");
    } finally {
      paagar.current = false;
    }
  }

  return (
    <main className={styles.side}>
      <header className={styles.skinne}>
        <span className={styles.ordmerke}>TEAM NORWAY GOLF</span>
      </header>
      <div className={styles.innhold}>
        <section className={styles.hero} aria-labelledby={`${id}-tittel`}>
          <h1 id={`${id}-tittel`}>Logg inn</h1>
          <p>Bruk AK Golf-kontoen din. Rollen på kontoen avgjør hva du ser.</p>
        </section>
        <form onSubmit={send} className={styles.kort} aria-busy={opptatt} aria-labelledby={`${id}-tittel`}>
          {harFeil && (
            <p id={`${id}-feil`} role="alert" className={styles.feil}>
              {status === "nettfeil"
                ? "Fikk ikke forbindelse. Sjekk nettet og prøv igjen."
                : "Kunne ikke logge inn. Kontroller e-post og passord og prøv igjen."}
            </p>
          )}
          <div className={styles.felt}>
            <label htmlFor={`${id}-epost`}>E-post</label>
            <input id={`${id}-epost`} name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required disabled={opptatt} value={epost} onChange={(e) => settEpost(e.target.value)} aria-describedby={harFeil ? `${id}-feil` : undefined} />
          </div>
          <div className={styles.felt}>
            <label htmlFor={`${id}-passord`}>Passord</label>
            <div className={styles.passord}>
              <input id={`${id}-passord`} name="password" type={visPassord ? "text" : "password"} autoComplete="current-password" required disabled={opptatt} value={passord} onChange={(e) => settPassord(e.target.value)} aria-describedby={harFeil ? `${id}-feil` : undefined} />
              <button type="button" className={styles.visPassord} aria-label={visPassord ? "Skjul passord" : "Vis passord"} aria-pressed={visPassord} onClick={() => settVisPassord(!visPassord)}>
                {visPassord ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.primaer} disabled={opptatt}>
            {status === "ferdig" ? "Åpner Team Norway …" : status === "venter" ? "Logger inn …" : "Logg inn"}
          </button>
          <span role="status" className={styles.status}>{status === "ferdig" ? "Du er logget inn." : status === "venter" ? "Logger inn" : ""}</span>
          <Link href="/auth/forgot-password" className={styles.tekstlenke}>Glemt passord</Link>
        </form>
        <p className={styles.hjelp}>Mangler du tilgang, kontakt landslagstrenerteamet.</p>
      </div>
    </main>
  );
}
