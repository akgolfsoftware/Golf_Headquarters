"use client";

import { useActionState } from "react";

import { lagreFysiskResultat, type FysLagreTilstand } from "@/app/team-wang/(trener)/tester/actions";

import s from "./tk.module.css";

/**
 * «Registrer resultat» (WG-03). Ett resultat om gangen, lagt til i elevens
 * egen historikk. Serverhandlingen kontrollerer tilgang, elev og test.
 */
export function FysRegistrer({ elever, tester, valgtElev, iDag }: {
  elever: Array<{ id: string; navn: string }>;
  tester: Array<{ id: string; navn: string; enhet: string }>;
  valgtElev: string;
  iDag: string;
}) {
  const [tilstand, handling, lagrer] = useActionState<FysLagreTilstand, FormData>(lagreFysiskResultat, null);
  return (
    <form action={handling} className={s.registrer} aria-label="Registrer resultat">
      <div>
        <h2 className={s.h2}>Registrer resultat</h2>
        <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--wtr-text-muted)" }}>Ett resultat om gangen. Legges til i elevens egen historikk.</p>
      </div>
      <label className={s.lbl}>
        Elev
        <select name="elevId" className={s.felt} defaultValue={valgtElev} key={valgtElev}>
          {elever.map((e) => <option key={e.id} value={e.id}>{e.navn}</option>)}
        </select>
      </label>
      <label className={s.lbl}>
        Test
        <select name="testId" className={s.felt} defaultValue={tester[0]?.id}>
          {tester.map((t) => <option key={t.id} value={t.id}>{t.enhet ? `${t.navn} (${t.enhet})` : t.navn}</option>)}
        </select>
      </label>
      <div className={s.toKol}>
        <label className={s.lbl}>
          Resultat
          <input name="verdi" className={`${s.felt} ${s.tall} ${tilstand && !tilstand.ok ? s.feltFeil : ""}`} inputMode="decimal" autoComplete="off" required />
        </label>
        <label className={s.lbl}>
          Dato
          <input name="dato" className={`${s.felt} ${s.tall}`} defaultValue={iDag} placeholder="DD.MM.ÅÅÅÅ" autoComplete="off" required />
        </label>
      </div>
      {tilstand ? (
        <p className={tilstand.ok ? s.okTekst : s.feilTekst} role={tilstand.ok ? "status" : "alert"}>{tilstand.melding}</p>
      ) : null}
      <button type="submit" className={s.kbtn} style={{ width: "100%", fontSize: 14 }} disabled={lagrer}>
        {lagrer ? "Lagrer …" : "Lagre resultat"}
      </button>
    </form>
  );
}
