"use client";

import { useTransition } from "react";
import { avbrytInvitasjon, fjernForelderTilgang } from "./actions";

export function AvbrytInvitasjonKnapp({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Avbryt invitasjonen?")) return;
        startTransition(async () => {
          await avbrytInvitasjon(id);
        });
      }}
      className="rounded-md min-h-11 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {pending ? "Avbryter…" : "Avbryt"}
    </button>
  );
}

export function FjernForelderKnapp({ linkId }: { linkId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Fjerne forelderens tilgang? Forelderen vil ikke lenger se din profil.")) return;
        startTransition(async () => {
          await fjernForelderTilgang(linkId);
        });
      }}
      className="rounded-md min-h-11 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
    >
      {pending ? "Fjerner…" : "Fjern tilgang"}
    </button>
  );
}
