"use client";

/**
 * Foreldreportal · Coach — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-04 Coach.dc.html
 * (+ FO-04L Coach lys.dc.html — lys/mørk gjøres av tokens).
 * Coach-kort med avatar 48, siste melding og én kontakt-CTA — ikke chat.
 * Meldingen kommer fra Notification type «melding» (samme kilde som
 * coachNote i hentForelderUkerapport).
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoAvatar,
  FoCtaPrimar,
  FoCtaSekundar,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export interface ForelderCoachData {
  antallBarn: number;
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
  childFirstName: string | null;
  coachNavn: string | null;
  coachAvatarUrl: string | null;
  coachEpost: string | null;
  /** Siste melding coachen har sendt (ekte Notification, aldri fabrikert). */
  sisteMelding: { title: string; body: string | null; dato: string } | null;
  supportEpost: string;
}

export function ForelderCoachV2({ data }: { data: ForelderCoachData }) {
  const { antallBarn, parentName, childFirstName, coachNavn, coachEpost, sisteMelding, supportEpost } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";
  const [visKontakt, setVisKontakt] = useState(false);

  const epost = coachEpost ?? supportEpost;

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Coach"
        under="Fra siste og kommende booking"
      />

      {antallBarn === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : !coachNavn ? (
        <FoTom
          tittel="Ingen coach registrert ennå"
          sub="Coachen vises her når barnet har hatt eller har en booket time."
        />
      ) : (
        <FoKort pad="18px" style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FoAvatar navn={coachNavn} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: TL.font.sans, fontSize: 20, fontWeight: 700, color: TL.text }}>
                {coachNavn}
              </div>
              <div style={{ marginTop: 1, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                {childFirstName ? `Coach for ${childFirstName}` : "Coach"}
              </div>
            </div>
          </div>

          {sisteMelding && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${TL.hair}` }}>
              <FoCaps>Siste melding · {sisteMelding.dato}</FoCaps>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: TL.font.sans,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: TL.text,
                  textWrap: "pretty",
                }}
              >
                {sisteMelding.body ?? sisteMelding.title}
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <FoCtaPrimar
              onClick={() => {
                window.location.href = `mailto:${epost}`;
              }}
            >
              Kontakt coach
            </FoCtaPrimar>
          </div>
          <div style={{ marginTop: 10 }}>
            <FoCtaSekundar onClick={() => setVisKontakt((v) => !v)}>
              {visKontakt ? epost : "Se kontaktinfo"}
            </FoCtaSekundar>
          </div>
        </FoKort>
      )}

      <FoFotnote>
        Dette er ikke en samtaletråd. Meldinger fra coachen vises her når de
        sendes; svar går på e-post eller telefon.
      </FoFotnote>
    </FoSkjerm>
  );
}
