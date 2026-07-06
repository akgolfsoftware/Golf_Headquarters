"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AthleticBadge } from "@/components/athletic/badge";
import { confirmGuardianConsent } from "./actions";

type Props = {
  token: string;
  playerName: string;
  playerEmail: string;
  guardianEmail: string;
  playerAge: number | null;
};

export function GuardianConsentForm({
  token,
  playerName,
  playerEmail,
  guardianEmail,
  playerAge,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [guardianName, setGuardianName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeDataProcessing, setAgreeDataProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!guardianName.trim()) {
      setError("Skriv inn fullt navn.");
      return;
    }
    if (!agreeTerms || !agreeDataProcessing) {
      setError("Du må samtykke til begge punktene for å fortsette.");
      return;
    }

    startTransition(async () => {
      const result = await confirmGuardianConsent({
        token,
        guardianName: guardianName.trim(),
      });
      if (!result.ok) {
        setError(result.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      router.push(`/auth/login?guardian_consent_given=1`);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-6"
    >
      {/* Player info */}
      <div className="rounded-xl border border-border bg-secondary/30 p-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          SPILLER
        </div>
        <div className="font-display mt-1 text-base font-semibold">
          {playerName}{" "}
          {playerAge !== null ? (
            <span className="text-sm font-normal text-muted-foreground">
              ({playerAge} år)
            </span>
          ) : null}
        </div>
        <div className="font-mono mt-0.5 text-[10px] text-muted-foreground">
          {playerEmail}
        </div>
      </div>

      {/* Guardian name */}
      <div className="mt-6">
        <label
          htmlFor="guardianName"
          className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
        >
          Ditt fulle navn (foresatt) *
        </label>
        <input
          id="guardianName"
          type="text"
          required
          value={guardianName}
          onChange={(e) => setGuardianName(e.target.value)}
          autoComplete="name"
          placeholder="F.eks. Anne Hansen"
          className="mt-1.5 w-full rounded-xl border border-border bg-secondary px-[14px] py-[11px] text-sm text-foreground outline-none placeholder:text-muted-foreground/60 transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,88,64,0.10)]"
        />
        <p className="font-mono mt-1 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          REGISTRERT E-POST: {guardianEmail}
        </p>
      </div>

      {/* Consent checkboxes */}
      <div className="mt-6 space-y-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-card p-4 hover:bg-secondary/30">
          <input
            type="checkbox"
            checked={agreeDataProcessing}
            onChange={(e) => setAgreeDataProcessing(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-sm leading-snug">
            <strong className="text-foreground">
              Jeg samtykker til at AK Golf behandler {playerName} sine
              persondata
            </strong>{" "}
            iht. personvernerklæringen. Dette inkluderer profil, treningsdata,
            golf-statistikk, bookinger og kommunikasjon med coach.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-card p-4 hover:bg-secondary/30">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
          />
          <span className="text-sm leading-snug">
            <strong className="text-foreground">
              Jeg har lest og godtar vilkårene
            </strong>{" "}
            for bruk av AK Golf-plattformen på vegne av {playerName}, og
            bekrefter at jeg har foreldreansvar/foresattmyndighet.
          </span>
        </label>
      </div>

      {/* Error */}
      {error ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
        >
          <AthleticBadge variant="urgent">Feil</AthleticBadge>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      ) : null}

      {/* Submit — pill, mono caps (kanon-CTA) */}
      <button
        type="submit"
        disabled={isPending || !agreeTerms || !agreeDataProcessing}
        aria-busy={isPending || undefined}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
        {isPending ? "Lagrer samtykke…" : "Bekreft samtykke"}
      </button>

      <p className="mt-4 text-xs text-muted-foreground">
        Ved å bekrefte gir du juridisk samtykke iht. GDPR artikkel 8. Du kan
        trekke samtykket når som helst.
      </p>
    </form>
  );
}
