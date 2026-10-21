"use client";

/**
 * PH-25 Velg Full (/portal/meg/abonnement/oppgrader/flyt) — nytt design, pakke 14 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/meg-resten.html, skjermen «Velg Full».
 * Betalingen er uendret: POST /api/stripe/checkout med plan «pro» (månedlig) eller «pro_aar» (årlig),
 * deretter Stripe Checkout (kort og Apple Pay). Siden sender bort spillere som alt har Full eller har
 * et feilet abonnement (page.tsx).
 *
 * Avvik:
 *   - Årlig er forhåndsvalgt, som i utkastet. Den gamle flyten startet på månedlig.
 *   - «Én uke Full før første trekk» vises bare når spilleren ikke har hatt PlayerHQ-abonnement før:
 *     checkout-ruta gir prøveuka bare ved første abonnement. Ellers står det at første trekk er i dag.
 *   - Prisene står i koden som i den gamle flyten (299 kr/mnd, 2 690 kr/år) og i produktreglene;
 *     Stripe-prisen er fasit ved betaling.
 */
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke5-skra.css";

export type PH25VelgFullData = {
  /** Spilleren har ikke hatt PlayerHQ-abonnement før, og får én uke Full før første trekk. */
  faarProveuke: boolean;
  /** «mandag 12. oktober», dagen for første trekk med prøveuke. */
  forsteTrekk: string;
};

type Plan = "mnd" | "ar";
const PRIS: Record<Plan, string> = { mnd: "299 kr", ar: "2 690 kr" };

export function PH25VelgFull({ data }: { data: PH25VelgFullData }) {
  const [plan, setPlan] = useState<Plan>("ar");
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function tilBetaling() {
    setLaster(true);
    setFeil(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan === "ar" ? "pro_aar" : "pro" }),
      });
      const svar = await res.json().catch(() => ({}));
      if (!res.ok || !svar.url) throw new Error("Betalingen kunne ikke åpnes. Prøv igjen om litt.");
      window.location.href = svar.url;
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Betalingen kunne ikke åpnes.");
      setLaster(false);
    }
  }

  return <div className="phn phn-meg phn-skra">
    <SkraTopp
      lav
      etikett="Meg"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={<>Meg · abonnement</>}
      tittel={<>Velg Full</>}
      handling={<span className="skra-tilbake"><Link className="tilbake" href="/portal/meg/abonnement"><ChevronLeft size={18} aria-hidden />Abonnement</Link></span>}
    />
    <SkraFlyt lav><div className="side">
    <div className="to-del">
      <div>
        <div className="mr-full-topp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/playerhq/slag-simulator.jpg" alt="" />
          <div className="ft"><span className="e">PlayerHQ-nivå</span><b className="navn">Full</b><span>Plan og Workbench, treningsøkta og Caddie. Du har Gratis i dag.</span></div>
        </div>
        <section className="phn-seksjon" aria-labelledby="full-gir">
          <div className="phn-sek-topp"><h2 id="full-gir">Det Full gir</h2></div>
          <ul className="mr-inkl">
            <li><Check size={18} aria-hidden /><span><b>Plan og Workbench</b>År, periode, måned og uke som henger sammen.<span className="mr-akse-prikk" aria-hidden><i /><i /><i /><i /><i /></span></span></li>
            <li><Check size={18} aria-hidden /><span><b>Treningsøkta</b>Klokke, tellere og resultat rett i Stats.</span></li>
            <li><Check size={18} aria-hidden /><span><b>Fysisk program og turneringer</b>I samme plan som golføktene.</span></li>
            <li><Check size={18} aria-hidden /><span><b>Caddie</b>Spør om planen, rundene og øvelsene dine.</span></li>
          </ul>
          <p className="phn-kilde">Gratis har allerede runder, Stats med Strokes Gained, tester og booking.</p>
        </section>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="full-betal">
          <div className="phn-sek-topp"><h2 id="full-betal">Betal per måned eller år</h2></div>
          <div className="mr-planvalg" role="group" aria-label="Betalingsintervall">
            <button type="button" className="mr-plan" aria-pressed={plan === "mnd"} onClick={() => setPlan("mnd")}><span className="rund" aria-hidden /><span><b>Månedlig</b><span className="phn-kilde">Si opp når som helst</span></span><span className="pris">299 kr<small>per måned</small></span></button>
            <button type="button" className="mr-plan" aria-pressed={plan === "ar"} onClick={() => setPlan("ar")}><span className="rund" aria-hidden /><span><b>Årlig</b><span className="phn-kilde">Tilsvarer 224 kr i måneden</span></span><span className="pris">2 690 kr<small>per år</small></span></button>
          </div>
        </section>
        {data.faarProveuke
          ? <div className="mr-vilkaar"><b>Én uke Full før første trekk</b><span>Første trekk: {PRIS[plan]} {data.forsteTrekk}. Du kan si opp før det.</span></div>
          : <div className="mr-vilkaar"><b>Første trekk i dag</b><span>Du har hatt Full før, så prøveuka er brukt. {PRIS[plan]} trekkes når du betaler.</span></div>}
        {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
        <button type="button" className="phn-knapp pri stor" onClick={tilBetaling} disabled={laster}>{laster ? "Åpner betalingen …" : "Til betaling"}</button>
        <div className="mr-betal-merke"><span>Betal hos Stripe med</span><span className="m">Kort</span><span className="m">Apple Pay</span></div>
        <p className="phn-kilde">Er du med i coaching-pakken Performance eller Performance Pro, er Full inkludert, og du betaler ikke for appen.</p>
      </div>
    </div>
  </div></SkraFlyt></div>;
}
