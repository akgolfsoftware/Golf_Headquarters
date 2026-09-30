/**
 * Prøvefil for AU-01 til AU-03: innlogging, registrering, passord, pluss
 * sjekk e-post, BankID, logget ut og betalingssteget. Oppdiktede data.
 * Hver tilstand måles i lys og natt (natt heter <tilstand>-natt).
 */
import type { ReactNode } from "react";
import { LoginV2 } from "@/components/portal/v2/LoginV2";
import { SignupV2 } from "@/components/portal/v2/SignupV2";
import { ForgotPasswordV2 } from "@/components/portal/v2/ForgotPasswordV2";
import { ResetPasswordV2 } from "@/components/portal/v2/ResetPasswordV2";
import { CheckEmailV2 } from "@/components/portal/v2/CheckEmailV2";
import { BankIDV2 } from "@/components/portal/v2/BankIDV2";
import { LoggetUtV2 } from "@/components/portal/v2/LoggetUtV2";
import { CheckoutResumeClient } from "@/app/auth/checkout-resume/checkout-resume-client";

export const sti = "/auth/login";

const lang = "Dette er en uvanlig lang feilmelding fra innloggingstjenesten som må brytes pent uten å sprenge skjermen sidelengs.";

const base: Record<string, (natt: boolean) => ReactNode> = {
  "login-tom": (n) => <LoginV2 natt={n} />,
  "login-laster": (n) => <LoginV2 natt={n} forhand={{ laster: true, epost: "hanne.l@demo.no" }} />,
  "login-feil": (n) => <LoginV2 natt={n} forhand={{ feil: "Feil e-post eller passord.", epost: "hanne.l@demo.no" }} />,
  "login-feil-lang": (n) => <LoginV2 natt={n} forhand={{ feil: lang, epost: "en.veldig.lang.epostadresse.som.ikke.brytes@eksempel-domene-som-er-langt.no" }} />,
  "logget-ut": (n) => <LoggetUtV2 natt={n} />,
  "registrer-pakke": (n) => <SignupV2 natt={n} />,
  "registrer-konto": (n) => <SignupV2 natt={n} forhand={{ steg: 1 }} />,
  "registrer-feil": (n) => <SignupV2 natt={n} forhand={{ steg: 1, feil: "En konto med denne e-posten finnes allerede." }} />,
  "registrer-laster": (n) => <SignupV2 natt={n} forhand={{ steg: 1, laster: true }} />,
  "registrer-talent": (n) => <SignupV2 natt={n} kilde="talenthq" />,
  "sjekk-epost": (n) => <CheckEmailV2 natt={n} />,
  "betaling-laster": (n) => <CheckoutResumeClient natt={n} plan="FULL" forhandFeil={false} />,
  "betaling-feil": (n) => <CheckoutResumeClient natt={n} plan="FULL" forhandFeil={true} />,
  "glemt-tom": (n) => <ForgotPasswordV2 natt={n} />,
  "glemt-laster": (n) => <ForgotPasswordV2 natt={n} forhand={{ laster: true, epost: "hanne.l@demo.no" }} />,
  "glemt-sendt": (n) => <ForgotPasswordV2 natt={n} forhand={{ sendt: true, epost: "hanne.l@demo.no" }} />,
  "glemt-feil": (n) => <ForgotPasswordV2 natt={n} forhand={{ feil: "Vent et lite øyeblikk før du ber om en ny lenke." }} />,
  "nytt-passord": (n) => <ResetPasswordV2 natt={n} />,
  "nytt-passord-laster": (n) => <ResetPasswordV2 natt={n} forhand={{ laster: true }} />,
  "nytt-passord-feil": (n) => <ResetPasswordV2 natt={n} forhand={{ feil: "Velg et annet passord enn det du hadde fra før." }} />,
  "nytt-passord-utlopt": (n) => <ResetPasswordV2 natt={n} forhand={{ utlopt: true }} />,
  bankid: (n) => <BankIDV2 natt={n} />,
};

export const tilstander: Record<string, ReactNode> = {};
export const natt: string[] = [];
for (const [k, f] of Object.entries(base)) {
  tilstander[k] = f(false);
  tilstander[`${k}-natt`] = f(true);
  natt.push(`${k}-natt`);
}
