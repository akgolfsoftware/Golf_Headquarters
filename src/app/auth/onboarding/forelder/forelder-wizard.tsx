"use client";

/**
 * Forelderens oppstart (AU-04 Forelder) i nytt design (utkast-flater/innlogging.html, «forelderstart»).
 * To steg: 1 Om deg (navn, telefon, relasjon) · 2 Vilkår og samtykke. Lagring er uendret
 * (saveForelderOnboardingStep, completeForelderOnboarding).
 *
 * Avvik mot utkastet: utkastet kobler barnet med barnets e-post. Den koblingen finnes ikke i appen;
 * barnet sender forelderen en lenke fra oppstarten, og forelderen godkjenner der (AU-05). Betaling
 * velges ikke her: forelderen betaler med kort eller Apple Pay når hen booker (§INNLOGGING BARE MED
 * GOOGLE OG PASSORD). Betalingsmåten lagres som «KORT», som før.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FlateRamme } from "@/components/flater/FlateRamme";
import { saveForelderOnboardingStep, completeForelderOnboarding, type ForelderOnboardingData } from "../actions";
import "@/styles/flater-ny-konto.css";

const TOTAL_STEPS = 2;

const RELASJONER = [
  { id: "MOR", label: "Mor" },
  { id: "FAR", label: "Far" },
  { id: "FORESATT", label: "Foresatt" },
] as const;

export function ForelderWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentRelation, setParentRelation] = useState<"MOR" | "FAR" | "FORESATT">("FORESATT");
  const [acceptedTraining, setAcceptedTraining] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedPayment, setAcceptedPayment] = useState(false);

  function buildData(): ForelderOnboardingData {
    return {
      parentName: parentName || undefined,
      parentPhone: parentPhone || undefined,
      parentRelation,
      acceptedTermsParent: acceptedTraining,
      acceptedPrivacyParent: acceptedPrivacy,
      acceptedPaymentParent: acceptedPayment,
      paymentMethod: "KORT",
    };
  }

  function neste() {
    setError(null);
    startTransition(async () => {
      try {
        await saveForelderOnboardingStep(buildData());
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
        return;
      }
      setStep(2);
    });
  }

  function fullfor() {
    setError(null);
    startTransition(async () => {
      try {
        await saveForelderOnboardingStep(buildData());
        await completeForelderOnboarding();
      } catch {
        router.push("/forelder");
        router.refresh();
      }
    });
  }

  const kanFullfore = acceptedTraining && acceptedPrivacy && acceptedPayment;

  return (
    <FlateRamme skall="konto">
      <div className="steghode">
        <div className="rad"><span className="nr">Forelder · steg {step} av {TOTAL_STEPS}</span></div>
        <div className="steg-linje" aria-hidden="true">{Array.from({ length: TOTAL_STEPS }, (_, i) => <i key={i} className={i < step ? "ja" : undefined} />)}</div>
      </div>
      {step === 1 ? (
        <>
          <div className="topp">
            <h1 className="tittel">Om deg</h1>
            <p className="ingress">Barnet ditt sender deg en lenke fra oppstarten. Der godkjenner du kontoen, og barnet vises under Barn.</p>
          </div>
          <form className="seksjon" onSubmit={(e) => { e.preventDefault(); neste(); }}>
            <div className="felt"><label htmlFor="fn">Navn</label><input id="fn" autoComplete="name" value={parentName} onChange={(e) => setParentName(e.target.value)} /></div>
            <div className="felt"><label htmlFor="ft">Telefon</label><input id="ft" type="tel" autoComplete="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} /></div>
            <div className="felt">
              <span className="etikett" id="rel">Jeg er</span>
              <div className="valg" role="group" aria-labelledby="rel">
                {RELASJONER.map((r) => <button key={r.id} type="button" aria-pressed={parentRelation === r.id} onClick={() => setParentRelation(r.id)}>{r.label}</button>)}
              </div>
            </div>
            {error && <p className="feilmelding" role="alert"><AlertCircle className="ikon" aria-hidden="true" />{error}</p>}
            <button type="submit" className="knapp pri stor" disabled={pending || !parentName.trim()}>{pending ? "Lagrer …" : "Neste"}</button>
          </form>
        </>
      ) : (
        <>
          <div className="topp">
            <h1 className="tittel">Vilkår og samtykke</h1>
            <p className="ingress">Du betaler med kort eller Apple Pay når du booker for barnet. Ingenting trekkes nå.</p>
          </div>
          <section className="seksjon">
            <label className="avkrysning"><input type="checkbox" checked={acceptedTraining} onChange={(e) => setAcceptedTraining(e.target.checked)} /><span><b>AK Golf Academy treningsavtale</b>Jeg har lest <a href="/vilkar">vilkårene</a>.</span></label>
            <label className="avkrysning"><input type="checkbox" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} /><span><b>Personvern og datadeling</b>Jeg har lest <a href="/personvern">personvernerklæringen</a>.</span></label>
            <label className="avkrysning"><input type="checkbox" checked={acceptedPayment} onChange={(e) => setAcceptedPayment(e.target.checked)} /><span><b>Betaling og oppsigelse</b>Timer betales med kort eller Apple Pay gjennom Stripe. Avbestilling er gratis til 24 timer før.</span></label>
            {error && <p className="feilmelding" role="alert"><AlertCircle className="ikon" aria-hidden="true" />{error}</p>}
          </section>
          <div className="bunnknapper">
            <button type="button" className="knapp sek" onClick={() => setStep(1)} disabled={pending}>Tilbake</button>
            <button type="button" className="knapp pri stor" onClick={fullfor} disabled={pending || !kanFullfore}>{pending ? "Lagrer …" : "Til forelder"}</button>
          </div>
        </>
      )}
    </FlateRamme>
  );
}
