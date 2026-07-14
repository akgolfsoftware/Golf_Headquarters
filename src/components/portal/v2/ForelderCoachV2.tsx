"use client";

/**
 * Foreldreportal · Coach — v2 (retning C «Presis»). Komponert kun av
 * v2-komponenter fra "@/components/v2" (ingen ad-hoc UI, ingen rå hex — kun T.*).
 *
 * En ekte toveis coach-dialog for foreldre finnes ikke i datamodellen ennå
 * (CoachingSession er spiller↔coach, ikke forelder↔coach) — så denne skjermen
 * viser i stedet det vi faktisk har: hvem barnets coach er, siste faktiske
 * melding coachen har sendt, og en kontakt-CTA. Ingen fabrikerte meldinger
 * eller lanseringsdatoer.
 *
 * Server component (src/app/forelder/coach/page.tsx) eier auth + dataoppslag
 * og gir V2Shell chrome-en; denne komponenten rendrer den indre innholds-
 * stacken. Mobil-først: alt stabler i én kolonne, CTA går full bredde på mobil.
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
          <Caps>Foreldreportal · Coach</Caps>
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
            sub="Be spilleren sende en invitasjon, eller kontakt coachen din — så dukker kontaktinfo opp her."
          />
        </Kort>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
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
          <Caps>Foreldreportal · Coach</Caps>
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
            Kontaktinfo og siste melding fra coachen. Private coach-notater er
            ikke synlige her.
          </span>
        </div>
        <StatusPill tone="info">Lesemodus</StatusPill>
      </div>

      {/* Coach-kort */}
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
              {coachEpost && (
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
                  Kontakt {coachNavn.split(" ")[0]}
                </Knapp>
              )}
            </div>
          </div>
        ) : (
          <TomTilstand
            icon="user"
            title="Ingen coach tilknyttet ennå"
            sub="Coachen dukker opp her så snart barnet har booket en time."
          />
        )}
      </Kort>

      {/* Siste melding fra coach */}
      <Kort eyebrow="Siste melding fra coach">
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
            title="Ingen meldinger fra coach ennå"
            sub="Når coachen sender noe, dukker det opp her."
          />
        )}
      </Kort>

      {/* Personvern-note — stille påminnelse */}
      <InnsiktChip>
        Private coach-notater vises aldri i foreldreportalen. Du ser kun det
        coachen aktivt deler.
      </InnsiktChip>

      {/* Support-fallback */}
      <Kort eyebrow="Trenger du hjelp?">
        <Rad
          leading={<Icon name="help-circle" size={16} style={{ color: T.fg2 }} />}
          title="Kontakt support"
          sub={supportEpost}
          trailing={
            <Knapp
              icon="mail"
              onClick={() =>
                (window.location.href = mailto(
                  supportEpost,
                  "Spørsmål fra foreldre",
                ))
              }
            >
              Skriv
            </Knapp>
          }
          last
        />
      </Kort>
    </div>
  );
}
