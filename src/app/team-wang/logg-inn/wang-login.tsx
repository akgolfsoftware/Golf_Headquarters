"use client";

/**
 * WANG-24 Logg inn — kobler skjemaet til prosjektets Supabase-klient.
 * Ingen påstand om antall forsøk eller låsetid; tjenesten eier grensene.
 * Serverens domenesperre avgjør tilgang når brukeren åpner trenerflaten.
 */
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WangInnloggingsSkjema, type WangLoggInnDel } from "./wang-innloggings-skjema";

export function WangLogin({
  retursti = "/team-wang/i-dag",
  avvisning = null,
  innloggetSom = null,
  del = "login",
  delHref,
}: {
  retursti?: string;
  avvisning?: { tittel: string; tekst: string } | null;
  innloggetSom?: string | null;
  del?: WangLoggInnDel;
  delHref: Record<WangLoggInnDel, string>;
}) {
  const router = useRouter();
  return <WangInnloggingsSkjema avvisning={avvisning} innloggetSom={innloggetSom} del={del} delHref={delHref} loggInn={async ({ epost, passord }) => {
    const { error } = await createClient().auth.signInWithPassword({ email: epost, password: passord });
    if (error?.name === "AuthRetryableFetchError" || error?.status === 0) throw new Error("Innloggingen fikk ikke forbindelse.");
    if (error) return { ok: false };
    router.replace(retursti);
    router.refresh();
    return { ok: true };
  }} />;
}
