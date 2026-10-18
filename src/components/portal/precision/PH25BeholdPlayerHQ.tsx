"use client";

/**
 * PH-25 Behold PlayerHQ (/portal/meg/abonnement/fortsett) — nytt design, pakke 14 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/meg-resten.html, skjermen «Behold PlayerHQ».
 * Handlingene er uendret: «Fortsett» åpner Stripe Checkout med startEtterCoaching (abonnementet starter
 * som prøve fram til coaching-pakken slutter), «Nei takk» kaller avslaaWinback.
 *
 * Avvik:
 *   - Hovedtallet er gjennomført tid i planen siste fire uker (økter med status gjennomført i Workbench).
 *     Utkastet viser «trent siste fire uker»; logget trening utenfor planen er ikke med.
 *   - «Økter i planen» teller alle økter som er lagt i spillerens plan, ikke «siden januar».
 *   - Mangler sluttdatoen på pakken, står det «når coaching-pakken slutter» i stedet for en dato.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { avslaaWinback } from "@/app/portal/meg/abonnement/fortsett/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-meg-resten.css";

export type PH25BeholdData = {
  tilbudId: string;
  /** «31. oktober», eller null når datoen mangler. */
  slutt: string | null;
  /** «1. november», dagen etter at pakken slutter, eller null. */
  fraDato: string | null;
  /** Gjennomførte minutter i planen siste fire uker. */
  minutter: number;
  okter: number;
  runder: number;
  tester: number;
  malsetninger: number;
};

type Plan = "mnd" | "ar";

export function PH25BeholdPlayerHQ({ data }: { data: PH25BeholdData }) {
  const [plan, setPlan] = useState<Plan>("ar");
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [avslaar, startAvslaa] = useTransition();
  const fra = data.fraDato ? `Fra ${data.fraDato}` : "Når pakken slutter";
  const t = Math.floor(data.minutter / 60), m = data.minutter % 60;

  async function fortsett() {
    setLaster(true);
    setFeil(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan === "ar" ? "pro_aar" : "pro", startEtterCoaching: true }),
      });
      const svar = await res.json().catch(() => ({}));
      if (!res.ok || !svar.url) throw new Error("Betalingen kunne ikke åpnes. Prøv igjen om litt.");
      window.location.href = svar.url;
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Betalingen kunne ikke åpnes.");
      setLaster(false);
    }
  }

  return <div className="phn phn-meg"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/abonnement"><ChevronLeft size={18} aria-hidden />Abonnement</Link>
      <div><div className="phn-dato">Meg · abonnement{data.slutt ? ` · coaching-pakken avsluttes ${data.slutt}` : ""}</div><h1 className="phn-tittel">Behold PlayerHQ</h1></div>
      <p className="mr-ingress">Coaching-pakken avsluttes, men planen og treningen din blir liggende. Velg Full for å fortsette som i dag, eller gå over til Gratis.</p>
    </div>
    <div className="to-del">
      <div>
        <section className="phn-kort" aria-label="Det du har bygget opp">
          <div className="phn-hoved">
            {data.minutter > 0 ? <strong>{t}<small>t {m} min</small></strong> : <strong>—</strong>}
            <span className="phn-forklar">gjennomført i planen siste fire uker</span>
          </div>
          <div className="mr-beholder">
            <div><b>{data.okter}</b><span>økter i planen</span></div>
            <div><b>{data.runder}</b><span>runder registrert</span></div>
            <div><b>{data.tester}</b><span>tester med resultat</span></div>
            <div><b>{data.malsetninger}</b><span>målsetninger i gang</span></div>
          </div>
          <p className="phn-kilde">Fra planen, rundene og testene dine</p>
        </section>
        <div className="mr-vilkaar"><b>Med Gratis{data.fraDato ? ` fra ${data.fraDato}` : ""}</b><span>Runder, Stats med Strokes Gained, tester og booking blir. Plan, Workbench, treningsøkta og Caddie låses, men ingenting slettes.</span></div>
      </div>
      <div>
        <section className="phn-seksjon" aria-labelledby="behold-full">
          <div className="phn-sek-topp"><h2 id="behold-full">Fortsett med Full</h2></div>
          <div className="mr-planvalg" role="group" aria-label="Betalingsintervall">
            <button type="button" className="mr-plan" aria-pressed={plan === "ar"} onClick={() => setPlan("ar")}><span className="rund" aria-hidden /><span><b>Årlig</b><span className="phn-kilde">{fra}</span></span><span className="pris">2 690 kr<small>per år</small></span></button>
            <button type="button" className="mr-plan" aria-pressed={plan === "mnd"} onClick={() => setPlan("mnd")}><span className="rund" aria-hidden /><span><b>Månedlig</b><span className="phn-kilde">{fra}</span></span><span className="pris">299 kr<small>per måned</small></span></button>
          </div>
        </section>
        {feil && <div className="mr-melding feil" role="alert">{feil}</div>}
        <button type="button" className="phn-knapp pri stor" onClick={fortsett} disabled={laster || avslaar}>
          {laster ? "Åpner betalingen …" : plan === "ar" ? "Fortsett med årlig, 2 690 kr" : "Fortsett med månedlig, 299 kr"}
        </button>
        <button type="button" className="phn-knapp sek stor" disabled={laster || avslaar}
          onClick={() => startAvslaa(() => avslaaWinback(data.tilbudId))}>
          {avslaar ? "Lagrer …" : "Nei takk, gå over til Gratis"}
        </button>
        <p className="phn-kilde">Ingenting trekkes før {data.fraDato ?? "coaching-pakken slutter"}. Betaling hos Stripe med kort eller Apple Pay.</p>
      </div>
    </div>
  </div></div>;
}
