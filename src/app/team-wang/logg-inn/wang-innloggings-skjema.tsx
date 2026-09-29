"use client";

/**
 * WANG-24 Logg inn. Fasit: «WANG Golf Batch 8.dc.html» (#logg-inn) i Claude
 * Design 6cfa623c. Innloggingen er for sportssjef og trenere; elever og
 * foresatte bruker PlayerHQ (beslutninger.md §WANG I AK GOLF HQ, 27.09.2026).
 *
 * Tilstander: skjema, feil e-post/passord, uten nett (før og under forsøk),
 * avvist konto (feil domene eller rolle, fra domenesperren) og «Hvem ser hva».
 * Avvik: «Glemt passord» går til den felles siden for nytt passord i stedet
 * for et eget skjema i kortet, og prototypens demokonto vises ikke.
 */
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Globe, IdCard, Minus, Megaphone, WifiOff } from "lucide-react";

import "@/styles/wang-trener-tokens.css";
import styles from "./wang-login.module.css";
import { loggUtWang } from "@/lib/auth/logout";
import { WANG_FELLESSIDE } from "@/lib/wang/wang-ruter";

export type WangLoggInnDel = "login" | "hvem";

const HVEM = [
  {
    rolle: "Åpen",
    Ikon: Globe,
    ser: ["Fellessiden", "Turneringskalender", "Faste treningstider og sted"],
    ikke: ["Elever og navn", "Tall og tester", "Poster, post og dokumenter"],
  },
  {
    rolle: "Trener",
    Ikon: Megaphone,
    ser: ["Elever i gruppa som har delt med WANG fra PlayerHQ", "Det eleven har delt: testresultater, statistikk eller komplett profil", "Svar på fireukerssjekk og forslag du har sendt"],
    ikke: ["Elever som ikke har delt, selv om de står i gruppa", "Elever som har trukket delingen", "Endre elevens plan eller IUP direkte · du sender forslag"],
  },
  {
    rolle: "Sportssjef",
    Ikon: IdCard,
    ser: ["Alt treneren ser, for elever som har delt", "Samtykkeoversikt: hvem som har delt med WANG", "Trenere og roller, plasser og rekruttering"],
    ikke: ["Innholdet hos elever som ikke har delt", "Elever og foresatte logger ikke inn her · de bruker PlayerHQ"],
  },
] as const;

export function WangInnloggingsSkjema({
  loggInn,
  avvisning = null,
  innloggetSom = null,
  del = "login",
  delHref = { login: "?", hvem: "?del=hvem" },
}: {
  loggInn: (input: { epost: string; passord: string }) => Promise<{ ok: boolean }>;
  /** Satt når domenesperren har avvist kontoen (?avvist=domene|rolle). */
  avvisning?: { tittel: string; tekst: string } | null;
  innloggetSom?: string | null;
  del?: WangLoggInnDel;
  delHref?: Record<WangLoggInnDel, string>;
}) {
  const id = useId();
  const [epost, settEpost] = useState("");
  const [passord, settPassord] = useState("");
  const [visPassord, settVisPassord] = useState(false);
  const [status, settStatus] = useState<"klar" | "venter" | "feil" | "nettfeil" | "ferdig">("klar");
  const [utenNett, settUtenNett] = useState(false);
  const paagar = useRef(false);
  const travel = status === "venter" || status === "ferdig";
  const harFeil = status === "feil" || status === "nettfeil";

  useEffect(() => {
    const oppdater = () => settUtenNett(!navigator.onLine);
    oppdater();
    window.addEventListener("online", oppdater);
    window.addEventListener("offline", oppdater);
    return () => {
      window.removeEventListener("online", oppdater);
      window.removeEventListener("offline", oppdater);
    };
  }, []);

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

  return (
    <main className={`wang-tr ${styles.side}`}>
      <div className={styles.innhold}>
        <div style={{ minWidth: 0 }}>
          <p className={styles.meta}>WANG Toppidrett · Golf · Sportssjef og trener</p>
          <h1 className={styles.h1}>Trenerflaten</h1>
        </div>
        <nav className={styles.chips} aria-label="Del">
          <Link href={delHref.login} className={styles.chip} aria-current={del === "login" ? "page" : undefined} scroll={false}>Logg inn</Link>
          <Link href={delHref.hvem} className={styles.chip} aria-current={del === "hvem" ? "page" : undefined} scroll={false}>Hvem ser hva</Link>
        </nav>

        {del === "hvem" ? (
          <div className={styles.hvem}>
            {HVEM.map(({ rolle, Ikon, ser, ikke }) => (
              <section key={rolle} className={`${styles.kort} ${styles.hvemKort}`}>
                <p className={styles.hvemTittel}><Ikon size={20} strokeWidth={1.5} aria-hidden="true" />{rolle}</p>
                <div className={styles.hvemGruppe}>
                  <span className={styles.hvemEtikett}>Ser</span>
                  {ser.map((x) => <span key={x} className={styles.hvemPunkt}><Check size={16} strokeWidth={1.5} aria-hidden="true" className={styles.ja} /><span>{x}</span></span>)}
                </div>
                <div className={styles.hvemGruppe}>
                  <span className={styles.hvemEtikett}>Ser ikke</span>
                  {ikke.map((x) => <span key={x} className={styles.hvemPunkt}><Minus size={16} strokeWidth={1.5} aria-hidden="true" className={styles.nei} /><span>{x}</span></span>)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className={styles.rutenett}>
            <section className={`${styles.kort} ${styles.loginKort}`} aria-labelledby={`${id}-tittel`}>
              <div className={styles.loginHode}>
                {/* eslint-disable-next-line @next/next/no-img-element -- statisk SVG, ingen optimalisering å hente */}
                <img src="/team-wang/wang-logo-horisontal-hvit.svg" alt="WANG Toppidrett" width={160} height={54} />
              </div>
              <div className={styles.loginKropp}>
                {avvisning ? (
                  <div role="alert" className={styles.avvist}>
                    <p className={styles.avvistTittel}>{avvisning.tittel}</p>
                    <p className={styles.avvistTekst}>{avvisning.tekst}</p>
                  </div>
                ) : null}
                {innloggetSom ? (
                  <form action={loggUtWang} className={styles.innlogget}>
                    <span>Innlogget som {innloggetSom}</span>
                    <button type="submit" className={styles.tbtn}>Logg ut</button>
                  </form>
                ) : null}
                <form onSubmit={send} className={styles.form} aria-busy={travel} aria-labelledby={`${id}-tittel`}>
                  <h2 id={`${id}-tittel`} className={styles.h2}>Logg inn</h2>
                  {utenNett ? (
                    <p role="status" className={styles.nett}>
                      <WifiOff size={18} strokeWidth={1.5} aria-hidden="true" />
                      <span>Uten nett. Innloggingen trenger nett. Prøv igjen når du er tilkoblet.</span>
                    </p>
                  ) : null}
                  <label className={styles.lbl} htmlFor={`${id}-epost`}>
                    E-post
                    <input id={`${id}-epost`} className={harFeil ? `${styles.felt} ${styles.feltFeil}` : styles.felt} name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required disabled={travel} value={epost} onChange={(e) => { settEpost(e.target.value); if (harFeil) settStatus("klar"); }} aria-invalid={harFeil || undefined} aria-describedby={harFeil ? `${id}-feil` : undefined} />
                  </label>
                  <label className={styles.lbl} htmlFor={`${id}-passord`}>
                    Passord
                    <span className={styles.passord}>
                      <input id={`${id}-passord`} className={harFeil ? `${styles.felt} ${styles.feltFeil}` : styles.felt} name="password" type={visPassord ? "text" : "password"} autoComplete="current-password" required disabled={travel} value={passord} onChange={(e) => { settPassord(e.target.value); if (harFeil) settStatus("klar"); }} aria-invalid={harFeil || undefined} aria-describedby={harFeil ? `${id}-feil` : undefined} />
                      <button type="button" className={styles.visPassord} aria-label={visPassord ? "Skjul passord" : "Vis passord"} aria-pressed={visPassord} onClick={() => settVisPassord(!visPassord)}>
                        {visPassord ? <EyeOff size={18} strokeWidth={1.5} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.5} aria-hidden="true" />}
                      </button>
                    </span>
                  </label>
                  {harFeil ? (
                    <p id={`${id}-feil`} role="alert" className={styles.feiltekst}>
                      {status === "nettfeil" ? "Fikk ikke forbindelse. Sjekk nettet og prøv igjen." : "E-post eller passord stemmer ikke."}
                    </p>
                  ) : null}
                  <button type="submit" className={styles.primar} disabled={travel}>
                    {status === "ferdig" ? "Åpner WANG …" : status === "venter" ? "Logger inn …" : "Logg inn"}
                  </button>
                  <span role="status" className={styles.status}>{status === "ferdig" ? "Du er logget inn." : status === "venter" ? "Logger inn" : ""}</span>
                  <div><Link href="/auth/forgot-password" className={styles.tbtn}>Glemt passord</Link></div>
                  <div className={styles.skille}>
                    <Link href={WANG_FELLESSIDE} className={styles.ghost}>Fortsett uten å logge inn</Link>
                    <p className={styles.hjelp}>Fellessiden er åpen for alle. Den viser ingen elever og ingen tall.</p>
                  </div>
                </form>
              </div>
            </section>
            <section className={`${styles.kort} ${styles.infoKort}`} aria-labelledby={`${id}-konto`}>
              <p id={`${id}-konto`} className={styles.infoTittel}>Kontoen opprettes av skolen</p>
              <p className={styles.infoTekst}>Kontoen er for trenere og sportssjef ved WANG. Elever og foresatte logger ikke inn her. De bruker PlayerHQ og deler derfra med WANG.</p>
              <p className={styles.infoTekst}>Har du ikke fått tilgang, spør sportssjefen.</p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
