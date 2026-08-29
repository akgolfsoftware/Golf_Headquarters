"use client";

/**
 * Foreldreportal · Økonomi — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-07 Okonomi.dc.html
 * (+ FO-07L Okonomi lys.dc.html — lys/mørk gjøres av tokens).
 * Abonnement og betalinger gruppert per barn — ikke flat liste. Fasitens
 * «Betal forfalt beløp»-CTA er utelatt (ingen betalings-action for
 * foresatte ennå — avvik notert i PR-en).
 */

import { TL } from "@/lib/v2/train-lock";
import {
  FoSkjerm,
  FoHode,
  FoKort,
  FoAvatar,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export interface ForelderOkonomiBarn {
  childId: string;
  fornavn: string;
  /** Abonnements-etikett («FULL», «GRATIS» …) — vist i undertittelen. */
  tier: string;
  status: string | null;
  /** Ferdigformatert «01.09.2026» — null når abonnement mangler. */
  nesteTrekk: string | null;
  monthlyCredits: number;
  creditsRemaining: number;
  betaltIAarOre: number;
  utestaaendeOre: number;
}

export interface ForelderOkonomiData {
  barnAntall: number;
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
  abonnement: ForelderOkonomiBarn[];
}

/** «20 300,00» — norsk beløpsformat med to desimaler (FO-07). */
function belop(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function tierTekst(b: ForelderOkonomiBarn): string {
  const deler: string[] = [b.tier === "GRATIS" ? "Uten abonnement" : b.tier];
  if (b.monthlyCredits > 0) {
    deler.push(`${b.creditsRemaining} av ${b.monthlyCredits} timer igjen`);
  }
  return deler.join(" · ");
}

function InfoLinje({
  label,
  verdi,
  forfalt,
}: {
  label: string;
  verdi: string;
  forfalt?: boolean;
}) {
  return (
    <div style={{ display: "flex" }}>
      <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: forfalt ? 700 : 600,
          color: forfalt ? TL.danger : TL.text,
        }}
      >
        {verdi}
      </span>
    </div>
  );
}

export function ForelderOkonomiV2({ data }: { data: ForelderOkonomiData }) {
  const { abonnement, barnAntall, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Økonomi"
        under="Abonnement per barn"
      />

      {barnAntall === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : (
        abonnement.map((b, i) => (
          <FoKort
            key={b.childId}
            pad="18px"
            style={{ marginTop: i === 0 ? 14 : 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FoAvatar navn={b.fornavn} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 18, fontWeight: 700, color: TL.text }}>
                  {b.fornavn}
                </div>
                <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                  {tierTekst(b)}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px solid ${TL.hair}`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {b.nesteTrekk && <InfoLinje label="Neste trekk" verdi={b.nesteTrekk} />}
              <InfoLinje label="Betalt i år" verdi={belop(b.betaltIAarOre)} />
              <InfoLinje
                label={b.utestaaendeOre > 0 ? "Forfalt" : "Utestående"}
                verdi={belop(b.utestaaendeOre)}
                forfalt={b.utestaaendeOre > 0}
              />
            </div>
          </FoKort>
        ))
      )}

      <FoFotnote>
        Abonnement endres av klubben. Ta kontakt med coachen hvis noe ser feil
        ut.
      </FoFotnote>
    </FoSkjerm>
  );
}
