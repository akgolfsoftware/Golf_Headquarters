"use client";

/**
 * Foreldreportal · Innstillinger — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-06 Innstillinger.dc.html
 * (+ FO-06L Innstillinger lys.dc.html — lys/mørk gjøres av tokens, aldri
 * varianter her). Varsel-bryterne er lokale (persistens finnes ikke ennå —
 * samme begrensning som før porten, nå i fasitens 51×31-toggle).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoRad,
  FoToggle,
  FoAvatar,
  FoCtaSekundar,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (avledet av requirePortalUser + hentBarnForForelder) ── */

export interface ForelderInnstillingerBarn {
  id: string;
  navn: string;
  relasjon: string;
}

export interface ForelderInnstillingerData {
  navn: string;
  epost: string;
  telefon: string | null;
  avatarUrl: string | null;
  barn: ForelderInnstillingerBarn[];
}

/* Varseltyper — fasitens fire rader (FO-06). Statisk konfig, ikke data. */
const VARSEL_TYPER: { key: string; tittel: string; beskrivelse: string }[] = [
  { key: "plan", tittel: "Endringer i plan", beskrivelse: "Når coachen flytter eller avlyser en økt" },
  { key: "ukerapport", tittel: "Ukerapport", beskrivelse: "Sammendrag hver mandag morgen" },
  { key: "betaling", tittel: "Betalinger", beskrivelse: "Når en faktura forfaller" },
  { key: "turnering", tittel: "Turneringer", beskrivelse: "Påminnelse dagen før" },
];

/** «Mor» / «Far» → fasitens nøytrale «Foresatt». */
function relasjonTekst(relasjon: string): string {
  const r = relasjon.trim();
  return r.length > 0 ? r : "Foresatt";
}

export function ForelderInnstillingerV2({ data }: { data: ForelderInnstillingerData }) {
  const router = useRouter();
  const { navn, epost, barn } = data;
  const fornavn = navn.split(" ")[0] ?? navn;

  const [varsler, setVarsler] = useState<Record<string, boolean>>({
    plan: true,
    ukerapport: true,
    betaling: true,
    turnering: false,
  });

  return (
    <FoSkjerm>
      <FoHode caps={`Forelder · ${fornavn}`} tittel="Innstillinger" under={epost} />

      {/* Varsler — hairline-rader med 51×31-toggle (FO-06) */}
      <div style={{ marginTop: 22 }}>
        <FoCaps>Varsler</FoCaps>
      </div>
      {VARSEL_TYPER.map((v) => (
        <FoRad
          key={v.key}
          title={v.tittel}
          sub={v.beskrivelse}
          right={
            <FoToggle
              on={varsler[v.key] ?? false}
              onChange={(på) => setVarsler((s) => ({ ...s, [v.key]: på }))}
              label={v.tittel}
            />
          }
        />
      ))}

      {/* Koblede barn — kort med avatar 38 + «Endre» (FO-06) */}
      <div style={{ marginTop: 22 }}>
        <FoCaps>Koblede barn</FoCaps>
      </div>
      {barn.length === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {barn.map((b) => {
            const barnFornavn = b.navn.split(" ")[0] ?? b.navn;
            return (
              <div
                key={b.id}
                onClick={() => router.push(`/forelder/barn/${b.id}`)}
                style={{
                  background: TL.elev,
                  borderRadius: 20,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <FoAvatar navn={barnFornavn} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                    {barnFornavn}
                  </div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                    {relasjonTekst(b.relasjon)} · full lesetilgang
                  </div>
                </div>
                <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>Endre</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <FoCtaSekundar onClick={() => router.push("/auth/login")}>Logg ut</FoCtaSekundar>
      </div>

      <FoFotnote>
        Lesetilgang gjelder plan, oppmøte og betaling. Analyse og samtaler er
        ikke tilgjengelig for foresatte.
      </FoFotnote>
    </FoSkjerm>
  );
}
