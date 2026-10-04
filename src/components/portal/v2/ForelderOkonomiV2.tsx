"use client";

/** Foreldreportal · Økonomi. Abonnement per barn er beholdt. Ingen betalingsknapp er lagt til.
 * Historisk sitering: designsystem/train-lock/FO-07 Okonomi.dc.html og FO-07L Okonomi lys.dc.html.
 */

import { tierEtikett } from "@/lib/tier-etikett";
import { FoSkjerm, FoHode, FoKort, FoAvatar, FoFotnote, FoTom } from "@/components/forelder/fo-presisjon";

export interface ForelderOkonomiBarn {
  childId: string;
  fornavn: string;
  tier: string;
  status: string | null;
  nesteTrekk: string | null;
  monthlyCredits: number;
  creditsRemaining: number;
  betaltIAarOre: number;
  utestaaendeOre: number;
}

export interface ForelderOkonomiData {
  barnAntall: number;
  parentName?: string;
  abonnement: ForelderOkonomiBarn[];
}

function belop(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tierTekst(b: ForelderOkonomiBarn): string {
  const deler: string[] = [b.tier === "GRATIS" ? "Uten abonnement" : tierEtikett(b.tier)];
  if (b.monthlyCredits > 0) deler.push(`${b.creditsRemaining} av ${b.monthlyCredits} timer igjen`);
  return deler.join(" · ");
}

export function ForelderOkonomiV2({ data }: { data: ForelderOkonomiData }) {
  const { abonnement, barnAntall, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Økonomi" under="Abonnement per barn" />
      {barnAntall === 0 ? (
        <FoTom tittel="Ingen barn er koblet ennå" sub="Coachen sender invitasjon når barnet er registrert i klubben." />
      ) : (
        abonnement.map((b) => (
          <FoKort key={b.childId}>
            <div className="fo-person">
              <FoAvatar navn={b.fornavn} />
              <div>
                <p className="fo-navn">{b.fornavn}</p>
                <p className="fo-meta">{tierTekst(b)}</p>
              </div>
            </div>
            <div className="fo-skille">
              {b.nesteTrekk && <p className="fo-linje"><span>Neste trekk</span><span>{b.nesteTrekk}</span></p>}
              <p className="fo-linje"><span>Betalt i år</span><span>{belop(b.betaltIAarOre)}</span></p>
              <p className="fo-linje" data-tone={b.utestaaendeOre > 0 ? "signal" : undefined}>
                <span>{b.utestaaendeOre > 0 ? "Forfalt" : "Utestående"}</span>
                <span>{belop(b.utestaaendeOre)}</span>
              </p>
            </div>
          </FoKort>
        ))
      )}
      <FoFotnote>Abonnement endres av klubben. Ta kontakt med coachen hvis noe ser feil ut.</FoFotnote>
    </FoSkjerm>
  );
}
