"use client";

import "@/styles/flater-ny-konto.css";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDateOfBirthAndCheckMinor } from "@/app/auth/onboarding/actions";
import { isMinor } from "@/lib/auth/minor";

function dagsStrengTilDato(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [aar, mnd, dag] = v.split("-").map(Number);
  return new Date(Date.UTC(aar, mnd - 1, dag));
}

export function FodselsdatoSkjema() {
  const router = useRouter();
  const [dato, setDato] = useState("");
  const [foresattEpost, setForesattEpost] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, startLagring] = useTransition();

  const valgtDato = dagsStrengTilDato(dato);
  const under16 = valgtDato ? isMinor(valgtDato) : false;
  const iDag = new Date().toISOString().slice(0, 10);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!valgtDato) {
      setFeil("Fyll inn fødselsdatoen din.");
      return;
    }
    startLagring(async () => {
      const svar = await setDateOfBirthAndCheckMinor({
        dateOfBirth: dato,
        guardianEmail: under16 ? foresattEpost.trim() || undefined : undefined,
      });
      if (!svar.ok) {
        setFeil(svar.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      router.replace("/portal");
      router.refresh();
    });
  }

  return (
    <form className="seksjon" onSubmit={lagre} noValidate>
      <label className="felt">
        <span className="etikett">Fødselsdato</span>
        <input
          type="date"
          name="fodselsdato"
          required
          min="1900-01-01"
          max={iDag}
          value={dato}
          onChange={(e) => setDato(e.target.value)}
          autoComplete="bday"
        />
      </label>

      {under16 && (
        <label className="felt">
          <span className="etikett">E-post til forelder</span>
          <input
            type="email"
            name="foresattEpost"
            required
            value={foresattEpost}
            onChange={(e) => setForesattEpost(e.target.value)}
            autoComplete="off"
            inputMode="email"
          />
          <span className="hjelp">
            Du er under 16 år. Forelderen din får en e-post og må godkjenne kontoen.
          </span>
        </label>
      )}

      <div aria-live="polite">
        {feil && <p className="feilmelding" role="alert">{feil}</p>}
      </div>

      <span className="hjelp" style={{ fontSize: 13, color: "var(--graphite-600)" }}>Du kan ikke endre den selv senere. Er den feil, kontakt coach.</span>
      <button type="submit" className="knapp pri stor" disabled={lagrer} aria-busy={lagrer}>
        {lagrer ? "Lagrer …" : "Lagre og åpne PlayerHQ"}
      </button>
    </form>
  );
}
