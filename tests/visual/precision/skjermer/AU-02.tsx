/** Prøvefil for AU-02 Registrer (/auth/signup, /auth/check-email, /auth/checkout-resume). Syntetiske data. */
import { SignupPA } from "@/components/portal/precision/SignupPA";
import { CheckEmailPA } from "@/components/portal/precision/CheckEmailPA";
import { CheckoutResumeClient } from "@/app/auth/checkout-resume/checkout-resume-client";

export const sti = "/auth/signup";
export const natt = ["pakke-natt", "konto-natt", "sjekk-epost-natt", "betaling-feil-natt"];

export const tilstander = {
  pakke: <SignupPA forhandsvisning={{}} />,
  "pakke-natt": <SignupPA forhandsvisning={{ tema: "night" }} />,
  talent: <SignupPA kilde="talenthq" forhandsvisning={{}} />,
  konto: <SignupPA forhandsvisning={{ steg: 1 }} />,
  "konto-natt": <SignupPA forhandsvisning={{ steg: 1, tema: "night" }} />,
  "konto-tom-feil": <SignupPA forhandsvisning={{ steg: 1, feltfeil: true }} />,
  "konto-feil": <SignupPA forhandsvisning={{ steg: 1, feil: "En konto med denne e-posten finnes allerede." }} />,
  laster: <SignupPA forhandsvisning={{ steg: 1, laster: true }} />,
  "sjekk-epost": <CheckEmailPA />,
  "sjekk-epost-natt": <CheckEmailPA tema="night" />,
  "betaling-laster": <CheckoutResumeClient plan="pro" forhandsvisning="laster" />,
  "betaling-feil": <CheckoutResumeClient plan="pro" forhandsvisning="feil" />,
  "betaling-feil-natt": <CheckoutResumeClient plan="pro" forhandsvisning="feil" tema="night" />,
};
