"use client";

/**
 * Foreldreportal · Coach — v2 Presis + B-pakke (status + én grønn CTA).
 * Kun v2 + T.*. Enklere foreldre-språk.
 */

import { useEffect, useState } from "react";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Rad,
  InnsiktChip,
  Knapp,
  Icon,
  AvatarFoto,
  TomTilstand,
} from "@/components/v2";

export interface ForelderCoachData {
  /** Antall koblede barn — 0 gir ærlig tom-tilstand. */
  antallBarn: number;
  childFirstName: string | null;
  /** Barnets coach, avledet fra kommende/siste booking. Null = ingen coach tildelt ennå. */
  coachNavn: string | null;
  coachAvatarUrl: string | null;
  coachEpost: string | null;
  nesteBooking: { dato: string; serviceName: string } | null;
  /** Siste faktiske melding fra coachen (Notification type="melding"). Null = ingen ennå. */
  sisteMelding: { title: string; body: string | null; dato: string } | null;
  /** Support-adresse for spørsmål utover coach-kontakt. */
  supportEpost: string;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

function mailto(epost: string, emne: string): string {
  return `mailto:${epost}?subject=${encodeURIComponent(emne)}`;
}

export function ForelderCoachV2({ data }: { data: ForelderCoachData }) {
  const mobile = useMobile();
  const {
    antallBarn,
    coachNavn,
    coachAvatarUrl,
    coachEpost,
    nesteBooking,
    sisteMelding,
    supportEpost,
  } = data;

  if (antallBarn === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Coach</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="coach">
              Barnets
            </Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn er koblet ennå"
            sub="Be spilleren sende en invitasjon, eller spør coachen — så dukker kontakt opp her."
          />
        </Kort>
      </div>
    );
  }

  const statusTekst = coachNavn
    ? nesteBooking
      ? "Neste time booket"
      : "Ingen time snart"
    : "Mangler coach";
  const statusTone = coachNavn
    ? nesteBooking
      ? "up"
      : "info"
    : "warn";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>Coach</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="coach">
              Barnets
            </Tittel>
          </div>
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.mut,
              display: "block",
              marginTop: 8,
            }}
          >
            Kontakt og siste melding. Private notater er ikke synlige her.
          </span>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {/* Coach-kort + én primær CTA */}
      <Kort tint={!!coachNavn}>
        {coachNavn ? (
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <AvatarFoto src={coachAvatarUrl} navn={coachNavn} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: T.disp,
                  fontWeight: 700,
                  fontSize: mobile ? 17 : 19,
                  letterSpacing: "-0.01em",
                  color: T.fg,
                  lineHeight: 1.3,
                }}
              >
                {coachNavn}
              </div>
              <p
                style={{
                  fontFamily: T.ui,
                  fontSize: 13,
                  color: T.fg2,
                  lineHeight: 1.6,
                  margin: "8px 0 16px",
                }}
              >
                {nesteBooking
                  ? `Neste time: ${nesteBooking.serviceName} · ${nesteBooking.dato}`
                  : "Ingen kommende time booket akkurat nå."}
              </p>
              {coachEpost ? (
                <Knapp
                  icon="mail"
                  full={mobile}
                  onClick={() =>
                    (window.location.href = mailto(
                      coachEpost,
                      "Spørsmål fra foreldre",
                    ))
                  }
                >
                  Skriv til {coachNavn.split(" ")[0]}
                </Knapp>
              ) : (
                <Knapp
                  icon="mail"
                  full={mobile}
                  onClick={() =>
                    (window.location.href = mailto(
                      supportEpost,
                      "Spørsmål fra foreldre",
                    ))
                  }
                >
                  Kontakt support
                </Knapp>
              )}
            </div>
          </div>
        ) : (
          <>
            <TomTilstand
              icon="user"
              title="Ingen coach tilknyttet ennå"
              sub="Coachen dukker opp her når barnet har booket en time."
            />
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <Knapp
                icon="mail"
                onClick={() =>
                  (window.location.href = mailto(
                    supportEpost,
                    "Spørsmål fra foreldre",
                  ))
                }
              >
                Kontakt support
              </Knapp>
            </div>
          </>
        )}
      </Kort>

      {/* Siste melding fra coach */}
      <Kort eyebrow="Siste melding">
        {sisteMelding ? (
          <Rad
            leading={
              <Icon name="message-circle" size={16} style={{ color: T.fg2 }} />
            }
            title={sisteMelding.title}
            sub={sisteMelding.body ?? undefined}
            meta={
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  color: T.mut,
                  whiteSpace: "nowrap",
                }}
              >
                {sisteMelding.dato}
              </span>
            }
            trailing={null}
            last
          />
        ) : (
          <TomTilstand
            icon="message-circle"
            title="Ingen meldinger ennå"
            sub="Når coachen sender noe, dukker det opp her."
          />
        )}
      </Kort>

      <InnsiktChip>
        Du ser bare det coachen deler med deg — ikke private treningsnotater.
      </InnsiktChip>
    </div>
  );
}
