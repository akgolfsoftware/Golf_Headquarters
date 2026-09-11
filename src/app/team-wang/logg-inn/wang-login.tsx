"use client";

/**
 * Fasit: designsystem/wang/skjermer-batch2/c7-logg-inn.html.
 * Ekte innlogging bruker prosjektets eksisterende Supabase-klient.
 * Avvik:
 *   - Ingen påstand om antall forsøk eller låsetid; tjenesten eier grensene.
 *   - Tilgangsteksten beskriver eksisterende innganger. Nye elev-/foresattflater
 *     og gruppetilgang skal verifiseres før de loves her.
 *   - ?next= honores kun for stier under /team-wang (wangReturSti).
 */
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WangInnloggingsSkjema } from "./wang-innloggings-skjema";
import { wangReturSti } from "../_data/wang-retur-sti";

export function WangLogin({ neste }: { neste?: string }) {
  const router = useRouter();
  return (
    <WangInnloggingsSkjema
      loggInn={async ({ epost, passord }) => {
        const { error } = await createClient().auth.signInWithPassword({
          email: epost,
          password: passord,
        });
        if (error?.name === "AuthRetryableFetchError" || error?.status === 0) {
          throw new Error("Innloggingen fikk ikke forbindelse.");
        }
        if (error) return { ok: false };
        router.replace(wangReturSti(neste ?? null));
        router.refresh();
        return { ok: true };
      }}
    />
  );
}
