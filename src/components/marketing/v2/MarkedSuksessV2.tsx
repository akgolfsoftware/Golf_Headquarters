/* AK Golf HQ — MARKEDSSIDE: Suksesshistorier (/suksess).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, case-sitat («.sitat») og sentrert
   avslutning. Skallet er PkShell (variant «side»). Ingen inline-stiler.
   COPY: uendret fra forrige versjon. */

import Link from "next/link";
import { PkShell } from "./paper/PkShell";

type Case = {
  navn: string;
  rolle: string;
  hcpFra: number;
  hcpTil: number;
  periode: string;
  sitat: string;
};

const CASES: Case[] = [
  {
    navn: "Lars H.",
    rolle: "Klubbmedlem, 47 år",
    hcpFra: 28,
    hcpTil: 16,
    periode: "12 måneder",
    sitat:
      "Jeg trodde aldri jeg skulle komme under 20. Med struktur og oppfølging mellom timene falt det på plass. Coachingen ga meg ikke bare bedre slag, den ga meg en plan jeg faktisk kunne følge.",
  },
  {
    navn: "Emma S.",
    rolle: "Junior, 16 år",
    hcpFra: 18,
    hcpTil: 6,
    periode: "2 sesonger",
    sitat:
      "Anders behandlet meg som en utøver fra dag én. Treningsplanene var ikke generiske, de var bygd rundt det jeg trengte. Nå spiller jeg NM og trives med presset.",
  },
  {
    navn: "Geir T.",
    rolle: "Mosjonist, 62 år",
    hcpFra: 22,
    hcpTil: 14,
    periode: "9 måneder",
    sitat:
      "Jeg ville bare slå bedre med jernene mine før pensjonsturneringene. Det jeg fikk var hele spillet løftet: putting, nærspill, og en mental ro jeg aldri har hatt på banen.",
  },
];

export function MarkedSuksessV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-suksess">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Suksesshistorier · AK Golf Academy</span>
          <h1 className="pk-hero">Spillere som har tatt steget.</h1>
          <p className="pk-ing">
            Tre eksempler på hva personlig coaching kan gjøre når plan, struktur og tett oppfølging
            går hånd i hånd.
          </p>
          <div className="pk-knapperad">
            <Link className="pk-btn pk-btn-ink" href="/coaching">
              Les om coaching
            </Link>
            <Link className="pk-btn" href="/kontakt">
              Snakk med oss
            </Link>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Resultater · ekte spillere</span>
          <h2 className="pk-sekt">Fremgang som kan måles.</h2>

          {CASES.map((c) => (
            <div className="pk-sitatrad" key={c.navn}>
              <div>
                <span className="pk-eyebrow">Handicap-utvikling</span>
                <span className="pk-t num">
                  {c.hcpFra} → {c.hcpTil}
                </span>
                <span className="pk-u">{c.periode}</span>
              </div>
              <div>
                <blockquote className="pk-sitat">«{c.sitat}»</blockquote>
                <p className="pk-ing pk-ing-fot">
                  {c.navn}, {c.rolle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Begrenset antall plasser</span>
          <h2 className="pk-sekt">Vil du være neste suksesshistorie?</h2>
          <p className="pk-ing">Vi tar imot et begrenset antall nye spillere hver sesong.</p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/coaching">
              Les om coaching
            </Link>
            <Link className="pk-btn" href="/kontakt">
              Snakk med oss
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
