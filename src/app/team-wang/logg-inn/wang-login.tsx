"use client";

/**
 * Fasit: designsystem/wang/skjermer-batch2/c7-logg-inn.html.
 * Ekte innlogging bruker prosjektets eksisterende Supabase-klient.
 * Avvik:
 *   - Ingen påstand om antall forsøk eller låsetid; tjenesten eier grensene.
 *   - Tilgangsteksten beskriver eksisterende innganger. Nye elev-/foresattflater
 *     og gruppetilgang skal verifiseres før de loves her.
 */
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WangInnloggingsSkjema } from "./wang-innloggings-skjema";

export function WangLogin({ retursti = "/team-wang" }: { retursti?: string }) {
  const router = useRouter();
  return <WangInnloggingsSkjema loggInn={async ({ epost, passord }) => {
    const { error } = await createClient().auth.signInWithPassword({ email: epost, password: passord });
    if (error?.name === "AuthRetryableFetchError" || error?.status === 0) throw new Error("Innloggingen fikk ikke forbindelse.");
    if (error) return { ok: false };
    // Behold WANG som returflate. Serverens eksisterende sperrer avgjør
    // tilgang når brukeren åpner trenerverktøy eller personlig innhold.
    router.replace(retursti);
    router.refresh();
    return { ok: true };
  }} />;
}
