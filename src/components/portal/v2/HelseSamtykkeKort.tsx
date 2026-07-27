"use client";

/**
 * Samtykke til helsedata fra treningsklokke (Whoop/Garmin) — GDPR art. 9-2 a.
 *
 * Vises på /portal/meg/innstillinger/personvern. To uavhengige brytere:
 * hente data i det hele tatt, og la coach se restitusjonsstatus. Teksten
 * hentes fra HELSE_SAMTYKKE_TEKST, samme kilde som versjonen vi lagrer —
 * så det vi viser og det vi kan bevise er alltid det samme.
 *
 * Spillere under 16 ser bryterne, men kan ikke slå dem PÅ selv: da må en
 * foresatt gjøre det i foreldreportalen. Å slå AV skal alltid være mulig
 * (art. 7-3 — tilbaketrekking skal være like enkelt som samtykke).
 */

import { useState, useTransition } from "react";
import { T, Kort, Icon, StatusPill } from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";
import {
  HELSE_SAMTYKKE_TEKST,
  type HelseSamtykkeType,
} from "@/lib/health/samtykke-regler";
import { settEgetHelseSamtykke } from "@/app/portal/meg/innstillinger/personvern/helse-samtykke-actions";

export type HelseSamtykkeKortData = {
  wearable: boolean;
  coachInnsyn: boolean;
  /** ISO-dato for når wearable-samtykket sist ble gitt. */
  wearableGittAt: string | null;
  /** Under 16: kun foresatt kan slå samtykket PÅ. */
  krevesForesatt: boolean;
};

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Punktliste({ punkter }: { punkter: string[] }) {
  return (
    <ul
      style={{
        margin: "8px 0 0",
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {punkter.map((p) => (
        <li key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Icon
            name="check"
            size={12}
            style={{ color: T.mut, marginTop: 3, flex: "none" }}
          />
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12,
              color: T.fg2,
              lineHeight: 1.5,
            }}
          >
            {p}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function HelseSamtykkeKort({ data }: { data: HelseSamtykkeKortData }) {
  const [pending, startTransition] = useTransition();
  const [wearable, setWearable] = useState(data.wearable);
  const [coachInnsyn, setCoachInnsyn] = useState(data.coachInnsyn);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function endre(type: HelseSamtykkeType, nyVerdi: boolean) {
    setFeil(null);
    setLagret(false);

    // Optimistisk oppdatering, rullet tilbake hvis serveren avviser.
    const forrigeWearable = wearable;
    const forrigeCoach = coachInnsyn;
    if (type === "WEARABLE_HELSE") {
      setWearable(nyVerdi);
      // Skrur du av datainnhentingen, faller coach-innsyn bort med den —
      // samme regel som serveren håndhever i beregnSamtykkeStatus.
      if (!nyVerdi) setCoachInnsyn(false);
    } else {
      setCoachInnsyn(nyVerdi);
    }

    startTransition(async () => {
      const svar = await settEgetHelseSamtykke(type, nyVerdi);
      if (!svar.ok) {
        setWearable(forrigeWearable);
        setCoachInnsyn(forrigeCoach);
        setFeil(svar.feil);
        return;
      }
      setLagret(true);
    });
  }

  // Under 16 kan ikke slå PÅ selv, men skal alltid kunne slå AV.
  const laastPaa = data.krevesForesatt;

  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="heart" size={16} style={{ color: T.fg2 }} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: T.disp,
                fontSize: 16,
                fontWeight: 700,
                color: T.fg,
                letterSpacing: "-0.02em",
              }}
            >
              Helsedata fra klokka
            </span>
            <StatusPill tone={wearable ? "up" : "info"}>
              {wearable ? "Påkoblet" : "Av"}
            </StatusPill>
          </div>
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 13,
              color: T.fg2,
              margin: "6px 0 0",
              lineHeight: 1.5,
            }}
          >
            Whoop og Garmin måler søvn og restitusjon. Sier du ja, bruker vi det
            til å tilpasse treningen din — og du kan ombestemme deg når som helst.
          </p>
        </div>
      </div>

      {laastPaa && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 14,
            padding: "11px 13px",
            borderRadius: 12,
            background: T.panel2,
            border: `1px solid ${T.border}`,
          }}
        >
          <Icon
            name="shield"
            size={15}
            style={{ color: T.mut, flex: "none", marginTop: 1 }}
          />
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.5,
            }}
          >
            Du er under 16 år. En foresatt må godkjenne dette i foreldreportalen
            før vi kan hente helsedata. Du kan alltid slå det av selv.
          </span>
        </div>
      )}

      {/* Samtykke 1 — hente data i det hele tatt */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <Bryter
          label={HELSE_SAMTYKKE_TEKST.WEARABLE_HELSE.tittel}
          sub={HELSE_SAMTYKKE_TEKST.WEARABLE_HELSE.forklaring}
          checked={wearable}
          onChange={(v) => {
            if (pending) return;
            if (laastPaa && v) return; // under 16: kan ikke slå på selv
            endre("WEARABLE_HELSE", v);
          }}
        />
        <Punktliste punkter={HELSE_SAMTYKKE_TEKST.WEARABLE_HELSE.punkter} />
      </div>

      {/* Samtykke 2 — coach-innsyn. Meningsløst uten det første. */}
      {wearable && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <Bryter
            label={HELSE_SAMTYKKE_TEKST.COACH_INNSYN.tittel}
            sub={HELSE_SAMTYKKE_TEKST.COACH_INNSYN.forklaring}
            checked={coachInnsyn}
            onChange={(v) => {
              if (pending) return;
              if (laastPaa && v) return;
              endre("COACH_INNSYN", v);
            }}
          />
          <Punktliste punkter={HELSE_SAMTYKKE_TEKST.COACH_INNSYN.punkter} />
        </div>
      )}

      {/* Kvittering */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
          fontFamily: T.ui,
          fontSize: 11.5,
          color: feil ? T.down : lagret ? T.up : T.mut,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lagret && !feil && (
          <Icon name="check-circle" size={13} style={{ color: T.up }} />
        )}
        <span>
          {pending
            ? "Lagrer …"
            : feil
              ? feil
              : lagret
                ? "Samtykke lagret. Endringen er logget."
                : wearable && data.wearableGittAt
                  ? `Samtykke gitt ${formatDato(data.wearableGittAt)}. Endringer logges.`
                  : "Endringer logges i revisjonsloggen."}
        </span>
      </div>
    </Kort>
  );
}
