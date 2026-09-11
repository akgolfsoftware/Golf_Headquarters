"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { lagreManuellRundeSg } from "@/app/portal/mal/runder/[id]/sg-actions";
import { lesManuellSgKladd, sgKladdFraVerdier, type ManuellSgVerdier, type ManuellSgFeil } from "@/lib/portal-runder/manuell-sg";
import { ManuellSgFelt } from "./manuell-sg-felt";
import styles from "./manuell-sg.module.css";

export function ManuellSgRedigering({ roundId, verdier, kilde }: {
  roundId: string; verdier: ManuellSgVerdier; kilde: string | null;
}) {
  const router = useRouter();
  const [apen, setApen] = useState(false);
  const [kladd, setKladd] = useState(() => sgKladdFraVerdier(verdier));
  const [forventet, setForventet] = useState(verdier);
  const [feil, setFeil] = useState<ManuellSgFeil>({});
  const [melding, setMelding] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, startTransition] = useTransition();
  const sender = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (apen) formRef.current?.querySelector<HTMLInputElement>("input")?.focus(); }, [apen]);
  useEffect(() => { if (melding) errorRef.current?.focus(); }, [melding]);

  function apne() {
    setKladd(sgKladdFraVerdier(verdier)); setForventet(verdier);
    setFeil({}); setMelding(null); setLagret(false); setApen(true);
  }
  function lukk() { setApen(false); requestAnimationFrame(() => buttonRef.current?.focus()); }
  function lagre() {
    if (sender.current) return;
    const parsed = lesManuellSgKladd(kladd);
    if (!parsed.ok) { setFeil(parsed.feil); setMelding(parsed.melding); return; }
    if (!parsed.harTall) { setMelding("Fyll inn minst ett SG-tall."); return; }
    setFeil({}); setMelding(null); sender.current = true;
    startTransition(async () => {
      try {
        const svar = await lagreManuellRundeSg(roundId, parsed.verdier, forventet);
        if (!svar.ok) { setMelding(svar.melding); return; }
        setForventet(svar.verdier); setKladd(sgKladdFraVerdier(svar.verdier));
        setLagret(true); lukk(); router.refresh();
      } catch (error) {
        unstable_rethrow(error);
        setMelding("Kunne ikke lagre SG-tallene. Tallene er beholdt. Prøv igjen.");
      } finally { sender.current = false; }
    });
  }

  return (
    <div className={styles.editor}>
      {!apen ? (
        <>
          <button ref={buttonRef} type="button" className={styles.secondary} onClick={apne}>
            {Object.values(verdier).some((v) => v != null) ? "Rediger SG-tall" : "Registrer SG-tall"}
          </button>
          {lagret && <p className={styles.saved} role="status">SG-tallene er lagret.</p>}
        </>
      ) : (
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); lagre(); }}>
          {kilde && kilde !== "manual" && <p className={styles.help}>Når du lagrer, erstattes rundens beregnede eller estimerte SG med tallene i skjemaet. Slagene og scorekortet beholdes.</p>}
          <ManuellSgFelt value={kladd} onChange={setKladd} feil={feil} disabled={pending} />
          {melding && <p ref={errorRef} tabIndex={-1} className={styles.error} role="alert">{melding}</p>}
          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={pending}>{pending ? "Lagrer SG…" : "Lagre SG-tall"}</button>
            <button type="button" className={styles.secondary} disabled={pending} onClick={lukk}>Avbryt</button>
          </div>
        </form>
      )}
    </div>
  );
}
