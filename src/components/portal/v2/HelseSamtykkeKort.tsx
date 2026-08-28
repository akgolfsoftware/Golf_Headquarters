"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Samtykke til helsedata — GDPR art. 9-2 a.
 *
 * Vises på /portal/meg/innstillinger/personvern. Fire brytere i to grupper:
 * hvor dataene kommer fra (klokka, eller utfylt selv), og hvor mye coachen
 * får se (status, eller tallene bak). Teksten hentes fra
 * HELSE_SAMTYKKE_TEKST, samme kilde som versjonen vi lagrer — så det vi
 * viser og det vi kan bevise er alltid det samme.
 *
 * Spillere under 16 ser bryterne, men kan ikke slå dem PÅ selv: da må en
 * foresatt gjøre det i foreldreportalen. Å slå AV skal alltid være mulig
 * (art. 7-3 — tilbaketrekking skal være like enkelt som samtykke).
 */

import { useState, useTransition } from "react";
import { Kort, Icon, StatusPill } from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";
import { HELSE_SAMTYKKE_TEKST, type HelseSamtykkeType } from "@/lib/health/samtykke-regler";
import { settEgetHelseSamtykke } from "@/app/portal/meg/innstillinger/personvern/helse-samtykke-actions";

export type HelseSamtykkeKortData = {
  wearable: boolean;
  manuell: boolean;
  coachInnsyn: boolean;
  coachDetalj: boolean;
  /** ISO-dato for når et av samtykkene sist ble gitt. */
  sistGittAt: string | null;
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
            style={{ color: TL.mute, marginTop: 3, flex: "none" }}
          />
          <span
            style={{
              fontFamily: TL.font.sans,
              fontSize: 12,
              color: TL.mute,
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

/** Én bryter med forklaring og punktliste. Én kilde til teksten: regel-laget. */
function Samtykkebryter({
  type,
  checked,
  laastPaa,
  pending,
  onEndre,
}: {
  type: HelseSamtykkeType;
  checked: boolean;
  laastPaa: boolean;
  pending: boolean;
  onEndre: (type: HelseSamtykkeType, verdi: boolean) => void;
}) {
  const tekst = HELSE_SAMTYKKE_TEKST[type];
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${TL.hair}` }}>
      <Bryter
        label={tekst.tittel}
        sub={tekst.forklaring}
        checked={checked}
        onChange={(v) => {
          if (pending) return;
          if (laastPaa && v) return; // under 16: kan ikke slå på selv
          onEndre(type, v);
        }}
      />
      <Punktliste punkter={tekst.punkter} />
    </div>
  );
}

type Valg = {
  wearable: boolean;
  manuell: boolean;
  coachInnsyn: boolean;
  coachDetalj: boolean;
};

/**
 * Speiler avhengighetene serveren håndhever i `beregnSamtykkeStatus`, slik at
 * bryterne aldri viser en kombinasjon som ikke kan finnes. Serveren er
 * fasiten — dette er bare for at UI-et ikke skal blinke.
 */
function ryddValg(v: Valg): Valg {
  const harKilde = v.wearable || v.manuell;
  const coachInnsyn = harKilde && v.coachInnsyn;
  return {
    ...v,
    coachInnsyn,
    coachDetalj: coachInnsyn && v.coachDetalj,
  };
}

export function HelseSamtykkeKort({ data }: { data: HelseSamtykkeKortData }) {
  const [pending, startTransition] = useTransition();
  const [valg, setValg] = useState<Valg>({
    wearable: data.wearable,
    manuell: data.manuell,
    coachInnsyn: data.coachInnsyn,
    coachDetalj: data.coachDetalj,
  });
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  const felt: Record<HelseSamtykkeType, keyof Valg> = {
    WEARABLE_HELSE: "wearable",
    MANUELL_HELSE: "manuell",
    COACH_INNSYN: "coachInnsyn",
    COACH_DETALJ: "coachDetalj",
  };

  function endre(type: HelseSamtykkeType, nyVerdi: boolean) {
    setFeil(null);
    setLagret(false);

    // Optimistisk oppdatering, rullet tilbake hvis serveren avviser.
    const forrige = valg;
    setValg(ryddValg({ ...valg, [felt[type]]: nyVerdi }));

    startTransition(async () => {
      const svar = await settEgetHelseSamtykke(type, nyVerdi);
      if (!svar.ok) {
        setValg(forrige);
        setFeil(svar.feil);
        return;
      }
      setLagret(true);
    });
  }

  // Under 16 kan ikke slå PÅ selv, men skal alltid kunne slå AV.
  const laastPaa = data.krevesForesatt;
  const harKilde = valg.wearable || valg.manuell;

  const bryter = (type: HelseSamtykkeType) => (
    <Samtykkebryter
      type={type}
      checked={valg[felt[type]]}
      // Under 16: bryteren kan slås av, men ikke på.
      laastPaa={laastPaa}
      pending={pending}
      onEndre={endre}
    />
  );

  return (
    <Kort>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: TL.dim,
            border: `1px solid ${TL.hair}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="heart" size={16} style={{ color: TL.mute }} />
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
                fontFamily: TL.font.sans,
                fontSize: 16,
                fontWeight: 700,
                color: TL.text,
                letterSpacing: "-0.02em",
              }}
            >
              Helsedata
            </span>
            <StatusPill tone={harKilde ? "up" : "info"}>
              {harKilde ? "På" : "Av"}
            </StatusPill>
          </div>
          <p
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              margin: "6px 0 0",
              lineHeight: 1.5,
            }}
          >
            Søvn, puls og restitusjon er sensitive opplysninger, enten klokka
            måler dem eller du fyller dem ut selv. Du bestemmer hva vi lagrer og
            hva coachen din får se — og kan ombestemme deg når som helst.
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
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
          }}
        >
          <Icon
            name="shield"
            size={15}
            style={{ color: TL.mute, flex: "none", marginTop: 1 }}
          />
          <span
            style={{
              fontFamily: TL.font.sans,
              fontSize: 12.5,
              color: TL.mute,
              lineHeight: 1.5,
            }}
          >
            Du er under 16 år. En foresatt må godkjenne dette i foreldreportalen
            før vi kan hente helsedata. Du kan alltid slå det av selv.
          </span>
        </div>
      )}

      {/* Gruppe 1 — hva vi lagrer. To kilder, samme type opplysning. */}
      {bryter("WEARABLE_HELSE")}
      {bryter("MANUELL_HELSE")}

      {/* Gruppe 2 — hva coachen ser. Meningsløst uten en kilde over. */}
      {harKilde && bryter("COACH_INNSYN")}
      {valg.coachInnsyn && bryter("COACH_DETALJ")}

      {/* Kvittering */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${TL.hair}`,
          fontFamily: TL.font.sans,
          fontSize: 11.5,
          color: feil ? TL.danger : lagret ? TL.ok : TL.mute,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {lagret && !feil && (
          <Icon name="check-circle" size={13} style={{ color: TL.ok }} />
        )}
        <span>
          {pending
            ? "Lagrer …"
            : feil
              ? feil
              : lagret
                ? "Samtykke lagret. Endringen er logget."
                : harKilde && data.sistGittAt
                  ? `Samtykke gitt ${formatDato(data.sistGittAt)}. Endringer logges.`
                  : "Endringer logges i revisjonsloggen."}
        </span>
      </div>
    </Kort>
  );
}
