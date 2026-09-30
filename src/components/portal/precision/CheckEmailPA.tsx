"use client";

/**
 * /auth/check-email i Precision Athletics — steg 3 «Sjekk e-post» i AU-02
 * (Claude Design 7d7c2994, ui_kits/konto/screens/AU-01-03.jsx). Statisk
 * venteskjerm: ingen skjemalogikk. Lenkemålene (/auth/signup, /auth/login) er
 * uendret fra CheckEmailV2; ?subscribe= følger med til «registrer deg på nytt».
 */
import Link from "next/link";
import { KnappLenke, Meta } from "@/components/precision/pa";
import { AuthBoks, AuthHode, Fremdrift } from "@/components/precision/pa-auth";

export function CheckEmailPA({ subscribe, tema }: { subscribe?: string; tema?: "night" }) {
  const signup = subscribe ? `/auth/signup?subscribe=${encodeURIComponent(subscribe)}` : "/auth/signup";
  return <AuthBoks maks={520} tema={tema}>
    <Fremdrift steg={2} />
    <AuthHode tittel="Sjekk e-posten din" under="Vi har sendt en bekreftelseslenke til e-postadressen du registrerte deg med. Klikk på lenken for å aktivere kontoen din." />
    <Meta>FANT DU DEN IKKE? SJEKK SØPPELPOST</Meta>
    <div className="pa-auth__rad"><KnappLenke href="/auth/login" variant="ghost">Tilbake til innlogging</KnappLenke></div>
    <Link href={signup} className="pa-auth__lenke" style={{ alignSelf: "flex-start" }}>Registrer deg på nytt</Link>
  </AuthBoks>;
}
