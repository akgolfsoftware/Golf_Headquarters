"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/shared/modal";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticButton } from "@/components/athletic/button";

type ReauthModalProps = {
  /**
   * Om modalen er åpen. Parent kontrollerer state.
   */
  open: boolean;
  /**
   * Lukker modalen uten å fullføre handlingen.
   */
  onClose: () => void;
  /**
   * Kalt når bruker har bekreftet passord med suksess.
   * Parent fortsetter med den sensitive handlingen her.
   */
  onSuccess: () => void;
  /**
   * Beskrivelse av hva som krever re-auth.
   * Vises i modal-bodyen — f.eks. "Du er i ferd med å deaktivere 2FA".
   */
  reason: string;
  /**
   * Knapp-tekst for bekreftelses-handlingen.
   * Default: "Bekreft".
   */
  bekreftTekst?: string;
};

/**
 * Re-auth-modal for sensitive handlinger.
 *
 * Krever at brukeren bekrefter passordet sitt før en sensitiv handling
 * (deaktiver 2FA, slett konto, endre passord, avbestill abonnement, etc.).
 *
 * Henter innlogget bruker via Supabase Auth og verifiserer passord ved å
 * kalle signInWithPassword() — som også fungerer som "frisker opp" sesjonen.
 *
 * Bruk:
 *   const [showReauth, setShowReauth] = useState(false);
 *   const [pendingAction, setPendingAction] = useState<() => void>(() => () => {});
 *
 *   function deaktiver2FA() {
 *     setPendingAction(() => async () => {
 *       await supabase.auth.mfa.unenroll({ factorId });
 *     });
 *     setShowReauth(true);
 *   }
 *
 *   <ReauthModal
 *     open={showReauth}
 *     onClose={() => setShowReauth(false)}
 *     onSuccess={() => { pendingAction(); setShowReauth(false); }}
 *     reason="Du er i ferd med å deaktivere tofaktor-autentisering."
 *     bekreftTekst="Bekreft og deaktiver"
 *   />
 */
export function ReauthModal({
  open,
  onClose,
  onSuccess,
  reason,
  bekreftTekst = "Bekreft",
}: ReauthModalProps) {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Hent e-post fra innlogget bruker når modalen åpnes.
  useEffect(() => {
    if (!open) return;
    let cancel = false;
    supabase.auth.getUser().then(({ data, error: err }) => {
      if (cancel) return;
      if (err || !data.user?.email) {
        setError("Kunne ikke hente kontoinfo. Logg ut og inn igjen.");
        return;
      }
      setEmail(data.user.email);
    });
    return () => {
      cancel = true;
    };
  }, [open, supabase]);

  // Reset state når modalen lukkes (prop-drevet reset).
  useEffect(() => {
    if (open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPassword("");
    setError(null);
    setPending(false);
  }, [open]);

  async function bekreft(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Mangler kontoinfo. Last siden på nytt.");
      return;
    }
    if (password.length < 1) {
      setError("Skriv inn passordet ditt.");
      return;
    }
    setPending(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setPending(false);
    if (err) {
      setError(oversettAuthFeil(err.message));
      return;
    }
    // Suksess — parent gjør den sensitive handlingen.
    onSuccess();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <span className="inline-flex items-center gap-2">
          <ShieldAlert
            className="h-5 w-5 text-destructive"
            strokeWidth={1.75}
            aria-hidden
          />
          Bekreft passord
        </span>
      }
      description="For sikkerhets skyld må du bekrefte passordet ditt for å fortsette."
    >
      <form onSubmit={bekreft} className="space-y-6">
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground">
          <KeyRound
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <p>{reason}</p>
        </div>

        <div>
          <label
            htmlFor="reauth-password"
            className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Passord
            {email && (
              <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">
                ({email})
              </span>
            )}
          </label>
          <input
            id="reauth-password"
            name="reauth-password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            className="w-full rounded-md border border-input bg-card px-4 py-4 text-base sm:text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          />
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AthleticButton
            type="button"
            variant="ghost-light"
            onClick={onClose}
            disabled={pending}
          >
            Avbryt
          </AthleticButton>
          <AthleticButton
            type="submit"
            variant="primary"
            disabled={pending || !email || password.length < 1}
          >
            {pending ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Bekrefter …
              </>
            ) : (
              bekreftTekst
            )}
          </AthleticButton>
        </div>
      </form>
    </Modal>
  );
}

function oversettAuthFeil(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Feil passord. Prøv igjen.";
  if (msg.includes("rate limit"))
    return "For mange forsøk. Vent litt og prøv igjen.";
  return msg;
}
