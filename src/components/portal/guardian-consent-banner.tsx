/**
 * GuardianConsentBanner — varsel-banner som vises i PortalShell når
 * bruker venter på foreldresamtykke (GDPR art. 8, P17).
 *
 * Brukes når user.requiresGuardianConsent && !user.guardianConsentGivenAt.
 */

"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Mail } from "lucide-react";
import { resendGuardianInvitation } from "@/app/auth/onboarding/actions";

type Props = {
  pendingInvitationEmail?: string | null;
};

export function GuardianConsentBanner({ pendingInvitationEmail }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showResend, setShowResend] = useState(false);
  const [newEmail, setNewEmail] = useState(pendingInvitationEmail ?? "");
  const [status, setStatus] = useState<string | null>(null);

  function onResend(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    startTransition(async () => {
      setStatus(null);
      const result = await resendGuardianInvitation({
        guardianEmail: newEmail.trim(),
      });
      if (result.ok) {
        setStatus("Invitasjon sendt ✓");
        setShowResend(false);
      } else {
        setStatus(result.error ?? "Kunne ikke sende.");
      }
    });
  }

  return (
    <div
      role="alert"
      className="border-b border-warn/30 bg-warn/10 px-4 py-3 md:px-8"
      style={{ background: "rgba(184, 133, 42, 0.10)", borderColor: "rgba(184, 133, 42, 0.30)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 shrink-0"
            strokeWidth={1.75}
            style={{ color: "#B8852A", marginTop: "2px" }}
          />
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold text-foreground">
              Venter på foreldresamtykke
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {pendingInvitationEmail ? (
                <>
                  Invitasjon sendt til{" "}
                  <strong className="text-foreground">{pendingInvitationEmail}</strong>.
                  Bruker har full tilgang når forelder bekrefter.
                </>
              ) : (
                <>
                  Du er under 16 år og trenger foreldresamtykke for å bruke alle
                  funksjoner.
                </>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowResend((v) => !v)}
          className="font-mono shrink-0 rounded-full border border-warn/40 bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground hover:bg-warn/10"
          style={{ borderColor: "rgba(184, 133, 42, 0.40)" }}
        >
          {pendingInvitationEmail ? "Send ny invitasjon" : "Legg til forelder"}
        </button>
      </div>

      {showResend ? (
        <form onSubmit={onResend} className="mt-3 flex flex-wrap items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="forelder@example.com"
              autoComplete="email"
              required
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={isPending || !newEmail.trim()}
            className="font-display inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition disabled:opacity-50"
          >
            {isPending ? "Sender…" : "Send"}
          </button>
        </form>
      ) : null}

      {status ? (
        <p
          className={`font-mono mt-2 text-[11px] tracking-[0.06em] ${
            status.includes("✓") ? "text-primary" : "text-destructive"
          }`}
        >
          {status}
        </p>
      ) : null}
    </div>
  );
}
