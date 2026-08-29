"use client";

/**
 * Foreldreportal · Samtykke — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-08 Samtykke.dc.html
 * (+ FO-08L Samtykke lys.dc.html — lys/mørk gjøres av tokens).
 * GDPR-samtykke per relasjon (kort per barn med 51×31-toggler) + «Sletting»-
 * seksjon. Nøytral, ikke salg. Server-actionene er uendret: lagreSamtykker
 * (eksplisitt Lagre-knapp), settHelseSamtykkeForBarn (sporbar rad per klikk)
 * og beOmDataSletting. GDPR-eksporten beholdes som egen rad (tillegg utover
 * fasiten — eksisterende funksjonalitet, notert i PR-en).
 */

import { useState, useTransition } from "react";
import { TL } from "@/lib/v2/train-lock";
import {
  lagreSamtykker,
  beOmDataSletting,
  settHelseSamtykkeForBarn,
} from "@/app/forelder/samtykke/actions";
import {
  HELSE_SAMTYKKE_TEKST,
  type HelseSamtykkeType,
} from "@/lib/health/samtykke-regler";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoKort,
  FoRad,
  FoToggle,
  FoAvatar,
  FoCtaPrimar,
  FoCtaSekundar,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type SamtykkeBarn = {
  id: string;
  name: string;
  email: string;
  /** Lagrede preferanser: consent-nøkkel → på/av. Mangler → av. */
  prefs: Record<string, boolean>;
  /**
   * Helsedata (GDPR art. 9-2 a) — både fra klokke og manuelt utfylt. Ligger
   * IKKE i `prefs`: disse samtykkene lagres som sporbare rader med tidspunkt
   * og tekstversjon, fordi særlige kategorier persondata krever at vi kan
   * bevise samtykket.
   */
  helse: {
    wearable: boolean;
    manuell: boolean;
    coachInnsyn: boolean;
    coachDetalj: boolean;
  };
};

export type ForelderSamtykkeData = {
  barn: SamtykkeBarn[];
  /** «Øyvinds» / «barnas» — for innledningsteksten. */
  barnNavn: string;
  /** Alle påkrevde samtykker aktive på alle barn (server-beregnet). */
  alleAktive: boolean;
  sisteSletting: { type: string; status: string; createdAt: string } | null;
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
};

/* Consent-definisjoner — EKSAKTE nøkler som server-actionen forventer + ekte
   norsk UI-copy (uendret fra den opprinnelige samtykke-skjermen). */
const SAMTYKKER: { key: string; tittel: string; beskrivelse: string }[] = [
  {
    key: "fotoBruk",
    tittel: "Bilder og video",
    beskrivelse: "Brukes i intern coaching",
  },
  {
    key: "dataDeling",
    tittel: "Lagre treningsdata",
    beskrivelse: "Plan, oppmøte og økter",
  },
  {
    key: "nyhetsbrev",
    tittel: "Nyheter på e-post",
    beskrivelse: "Tips, kurs og nyheter om juniorgolf",
  },
  {
    key: "thirdParty",
    tittel: "Dele anonym data videre",
    beskrivelse: "WAGR, NGF og talentregistre hvis barnet kvalifiserer",
  },
];

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ── Helsedata fra treningsklokke (art. 9 — eget, sporbart samtykke) ─ */

function HelseSamtykkeSeksjon({ barn }: { barn: SamtykkeBarn }) {
  const [pending, startTransition] = useTransition();
  const [valg, setValg] = useState(barn.helse);
  const [feil, setFeil] = useState<string | null>(null);

  const felt: Record<HelseSamtykkeType, keyof SamtykkeBarn["helse"]> = {
    WEARABLE_HELSE: "wearable",
    MANUELL_HELSE: "manuell",
    COACH_INNSYN: "coachInnsyn",
    COACH_DETALJ: "coachDetalj",
  };

  function endre(type: HelseSamtykkeType, nyVerdi: boolean) {
    setFeil(null);
    const forrige = valg;

    // Speiler avhengighetene serveren håndhever i beregnSamtykkeStatus:
    // uten en kilde finnes det ingenting å dele, og detaljer forutsetter status.
    const neste = { ...valg, [felt[type]]: nyVerdi };
    const harKilde = neste.wearable || neste.manuell;
    neste.coachInnsyn = harKilde && neste.coachInnsyn;
    neste.coachDetalj = neste.coachInnsyn && neste.coachDetalj;
    setValg(neste);

    startTransition(async () => {
      const svar = await settHelseSamtykkeForBarn(barn.id, type, nyVerdi);
      if (!svar.ok) {
        setValg(forrige);
        setFeil(svar.feil);
      }
    });
  }

  const helseTyper: HelseSamtykkeType[] = ["WEARABLE_HELSE", "MANUELL_HELSE"];
  if (valg.wearable || valg.manuell) helseTyper.push("COACH_INNSYN");
  if (valg.coachInnsyn) helseTyper.push("COACH_DETALJ");

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
      <FoCaps>Helsedata</FoCaps>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {helseTyper.map((type) => (
          <FoRad
            key={type}
            title={HELSE_SAMTYKKE_TEKST[type].tittel}
            sub={HELSE_SAMTYKKE_TEKST[type].forklaring}
            right={
              <FoToggle
                on={valg[felt[type]]}
                disabled={pending}
                onChange={(v) => endre(type, v)}
                label={HELSE_SAMTYKKE_TEKST[type].tittel}
              />
            }
          />
        ))}
      </div>
      {feil && (
        <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.danger, margin: "8px 0 0" }}>
          {feil}
        </p>
      )}
    </div>
  );
}

/* ── Per-barn samtykke-kort (FO-08) ────────────────────────────────── */

function BarnSamtykkeKort({ barn, forste }: { barn: SamtykkeBarn; forste: boolean }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [endret, setEndret] = useState(false);
  const [valg, setValg] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of SAMTYKKER) init[s.key] = barn.prefs[s.key] ?? false;
    return init;
  });

  const fornavn = barn.name.split(" ")[0] ?? barn.name;

  function toggle(key: string, v: boolean) {
    setValg((s) => ({ ...s, [key]: v }));
    setLagret(false);
    setEndret(true);
  }

  function lagre() {
    setFeil(null);
    startTransition(async () => {
      try {
        await lagreSamtykker(barn.id, valg);
        setLagret(true);
        setEndret(false);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Lagring feilet. Prøv igjen.");
      }
    });
  }

  return (
    <FoKort pad="18px" style={{ marginTop: forste ? 14 : 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FoAvatar navn={fornavn} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, color: TL.text }}>
            {fornavn}
          </div>
          <div
            style={{
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Samtykke per barn du er foresatt for
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
        {SAMTYKKER.map((s) => (
          <FoRad
            key={s.key}
            title={s.tittel}
            sub={s.beskrivelse}
            right={
              <FoToggle
                on={valg[s.key] ?? false}
                disabled={pending}
                onChange={(v) => toggle(s.key, v)}
                label={s.tittel}
              />
            }
          />
        ))}
      </div>

      {/* Helsedata — lagres umiddelbart per bryter (egen sporbar hendelse). */}
      <HelseSamtykkeSeksjon barn={barn} />

      {endret && (
        <div style={{ marginTop: 12 }}>
          <FoCtaPrimar disabled={pending} onClick={lagre}>
            {pending ? "Lagrer …" : "Lagre samtykker"}
          </FoCtaPrimar>
        </div>
      )}
      {(lagret || feil) && (
        <p
          style={{
            fontFamily: TL.font.sans,
            fontSize: 12,
            color: feil ? TL.danger : TL.mute,
            margin: "10px 0 0",
          }}
        >
          {feil ?? "Samtykker lagret. Endringer logges i revisjonsloggen."}
        </p>
      )}

      <div
        style={{
          marginTop: 12,
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.mute,
          lineHeight: 1.5,
        }}
      >
        Trekker du samtykket, stopper ny lagring. Data som er nødvendig for
        regnskap beholdes så lenge loven krever.
      </div>
    </FoKort>
  );
}

/* ── Sletting (GDPR) ───────────────────────────────────────────────── */

function SlettingSeksjon({
  sisteSletting,
}: {
  sisteSletting: ForelderSamtykkeData["sisteSletting"];
}) {
  const [pending, startTransition] = useTransition();
  const [sendt, setSendt] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const kvittert = sendt || sisteSletting != null;

  function sletteForespoersel() {
    setFeil(null);
    startTransition(async () => {
      try {
        await beOmDataSletting();
        setSendt(true);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke sende forespørsel. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <div style={{ marginTop: 22 }}>
        <FoCaps>Sletting</FoCaps>
      </div>
      <FoKort pad="16px 18px" style={{ marginTop: 10 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          Be om sletting av data
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.mute,
            lineHeight: 1.5,
          }}
        >
          {kvittert
            ? sisteSletting
              ? `Forespørsel sendt ${formatDato(sisteSletting.createdAt)} — vi svarer innen 30 dager.`
              : "Forespørsel sendt — vi svarer innen 30 dager."
            : "Vi svarer innen 30 dager. Forespørselen gjelder alle koblede barn."}
        </div>
        {!kvittert && (
          <div style={{ marginTop: 10 }}>
            <FoCtaSekundar disabled={pending} onClick={sletteForespoersel}>
              {pending ? "Sender …" : "Start forespørsel"}
            </FoCtaSekundar>
          </div>
        )}
        {feil && (
          <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.danger, margin: "8px 0 0" }}>
            {feil}
          </p>
        )}
        {/* GDPR-eksport — beholdt funksjonalitet (tillegg utover fasiten). */}
        <div style={{ marginTop: 10 }}>
          <FoCtaSekundar
            onClick={() => {
              // Fil-nedlasting (GET-rute som svarer med attachment) — ikke en
              // Next-side, så router.push ville vært feil her.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/forelder/samtykke/eksport";
            }}
          >
            Last ned alle data
          </FoCtaSekundar>
        </div>
      </FoKort>
    </>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderSamtykkeV2({ data }: { data: ForelderSamtykkeData }) {
  const { barn, sisteSletting, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Samtykke"
        under="Per barn du er foresatt for"
      />

      {barn.length === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : (
        barn.map((b, i) => <BarnSamtykkeKort key={b.id} barn={b} forste={i === 0} />)
      )}

      <SlettingSeksjon sisteSletting={sisteSletting} />

      <FoFotnote>
        Behandlingsansvarlig er AK Golf. Kontakt support@akgolf.no ved spørsmål
        om lagring.
      </FoFotnote>
    </FoSkjerm>
  );
}
