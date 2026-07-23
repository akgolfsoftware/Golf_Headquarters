"use client";

/**
 * Foreldreportal · Samtykke — v2 Presis + B-pakke (status + lagre-CTA).
 * Server-actions uendret. Kun v2 + T.*. Enklere foreldre-språk.
 */

import { useEffect, useState, useTransition } from "react";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Knapp,
  Rad,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { Bryter } from "@/components/v2/skjema";
import {
  lagreSamtykker,
  beOmDataSletting,
} from "@/app/forelder/samtykke/actions";

/* ── Datakontrakt (avledet av barnets EKTE Prisma-data) ────────────── */

export type SamtykkeBarn = {
  id: string;
  name: string;
  email: string;
  /** Lagrede preferanser: consent-nøkkel → på/av. Mangler → av. */
  prefs: Record<string, boolean>;
};

export type ForelderSamtykkeData = {
  barn: SamtykkeBarn[];
  /** «Øyvinds» / «barnas» — for innledningsteksten. */
  barnNavn: string;
  /** Alle påkrevde samtykker aktive på alle barn (server-beregnet). */
  alleAktive: boolean;
  sisteSletting: { type: string; status: string; createdAt: string } | null;
};

/* Consent-definisjoner — EKSAKTE nøkler som server-actionen forventer + ekte
   norsk UI-copy (uendret fra den opprinnelige samtykke-skjermen). */
const SAMTYKKER: { key: string; tittel: string; beskrivelse: string }[] = [
  {
    key: "fotoBruk",
    tittel: "Bilder og video",
    beskrivelse:
      "AK Golf kan bruke bilder/video av barnet i planer og rapporter, og i markedsføring (anonymisert om ikke annet er avtalt).",
  },
  {
    key: "dataDeling",
    tittel: "Dele treningsdata med coach",
    beskrivelse:
      "Runder, Trackman og helse-data kan deles med barnets coach for bedre planer.",
  },
  {
    key: "nyhetsbrev",
    tittel: "Nyheter på e-post",
    beskrivelse:
      "Tips, kurs og nyheter om juniorgolf. Du kan melde deg av når som helst.",
  },
  {
    key: "thirdParty",
    tittel: "Dele anonym data videre",
    beskrivelse:
      "Anonym data kan deles med WAGR, NGF og talentregistre hvis barnet kvalifiserer.",
  },
];

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

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

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Per-barn samtykke-kort ────────────────────────────────────────── */

function BarnSamtykkeKort({ barn }: { barn: SamtykkeBarn }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [valg, setValg] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of SAMTYKKER) init[s.key] = barn.prefs[s.key] ?? false;
    return init;
  });

  function toggle(key: string) {
    setValg((v) => ({ ...v, [key]: !v[key] }));
    setLagret(false);
  }

  function lagre() {
    setFeil(null);
    startTransition(async () => {
      try {
        await lagreSamtykker(barn.id, valg);
        setLagret(true);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Lagring feilet.");
      }
    });
  }

  return (
    <Kort pad="0">
      {/* Hode: barnets navn + e-post */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="user" size={16} style={{ color: T.fg2 }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: T.disp,
              fontWeight: 700,
              fontSize: 15,
              color: T.fg,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {barn.name}
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 10.5,
              color: T.mut,
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {barn.email}
          </div>
        </div>
      </div>

      {/* Consent-brytere */}
      <div style={{ padding: "4px 18px" }}>
        {SAMTYKKER.map((s, i) => (
          <div
            key={s.key}
            style={{
              padding: "14px 0",
              borderBottom:
                i < SAMTYKKER.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <Bryter
              label={s.tittel}
              sub={s.beskrivelse}
              checked={valg[s.key] ?? false}
              onChange={() => toggle(s.key)}
            />
          </div>
        ))}
      </div>

      {/* Fot: kvittering + lagre */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 18px",
          borderTop: `1px solid ${T.border}`,
          background: T.panel2,
        }}
      >
        <span
          style={{
            fontFamily: T.ui,
            fontSize: 11.5,
            color: lagret ? T.up : feil ? T.down : T.mut,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {lagret && (
            <Icon name="check-circle" size={14} style={{ color: T.up }} />
          )}
          {lagret
            ? "Samtykker lagret"
            : feil
              ? feil
              : "Endringer logges i revisjonsloggen."}
        </span>
        <Knapp icon="check" disabled={pending} onClick={lagre}>
          {pending ? "Lagrer …" : "Lagre samtykker"}
        </Knapp>
      </div>
    </Kort>
  );
}

/* ── Data-handlinger (GDPR eksport + sletting) ─────────────────────── */

function DataHandlinger({
  sisteSletting,
}: {
  sisteSletting: ForelderSamtykkeData["sisteSletting"];
}) {
  const [pending, startTransition] = useTransition();
  const [sendt, setSendt] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function sletteForespoersel() {
    setFeil(null);
    startTransition(async () => {
      try {
        await beOmDataSletting();
        setSendt(true);
      } catch (err) {
        setFeil(
          err instanceof Error ? err.message : "Kunne ikke sende forespørsel.",
        );
      }
    });
  }

  const slettingKvittert = sendt || sisteSletting != null;

  return (
    <Kort eyebrow="Dine data">
      {/* Eksport — GET-nedlasting til den ekte eksport-ruten */}
      <Rad
        leading={
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: T.panel3,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="download" size={16} style={{ color: T.lime }} />
          </span>
        }
        title="Last ned alle data"
        sub="Full GDPR-eksport som fil"
        onClick={() => {
          window.location.href = "/forelder/samtykke/eksport";
        }}
      />

      {/* Sletting */}
      <button
        type="button"
        className="v2-press v2-focus"
        onClick={pending ? undefined : sletteForespoersel}
        disabled={pending}
        style={{
          appearance: "none",
          width: "calc(100% + 20px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 10px",
          margin: "0 -10px",
          borderRadius: 10,
          border: "none",
          background: "transparent",
          cursor: pending ? "default" : "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `color-mix(in srgb, ${T.down} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.down} 26%, transparent)`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          <Icon name="trash-2" size={15} style={{ color: T.down }} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: T.ui,
              fontSize: 13.5,
              fontWeight: 600,
              color: T.down,
            }}
          >
            {pending ? "Sender forespørsel …" : "Be om sletting av data"}
          </span>
          <span
            style={{
              display: "block",
              fontFamily: T.ui,
              fontSize: 11.5,
              color: T.mut,
              marginTop: 2,
            }}
          >
            AK Golf behandler forespørselen manuelt
          </span>
        </span>
      </button>

      {feil && (
        <p
          style={{
            fontFamily: T.ui,
            fontSize: 12,
            color: T.down,
            margin: "8px 0 0",
          }}
        >
          {feil}
        </p>
      )}

      {slettingKvittert && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 12,
            padding: "11px 13px",
            borderRadius: 12,
            background: `color-mix(in srgb, ${T.up} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${T.up} 24%, transparent)`,
          }}
        >
          <Icon
            name="check"
            size={15}
            style={{ color: T.up, flex: "none", marginTop: 1 }}
          />
          <span
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: T.fg, fontWeight: 600 }}>
              Slette-forespørsel registrert.
            </strong>{" "}
            {sisteSletting && !sendt
              ? `Sendt ${formatDato(sisteSletting.createdAt)}. `
              : ""}
            AK Golf behandler forespørselen og kontakter deg på e-post.
          </span>
        </div>
      )}
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderSamtykkeV2({ data }: { data: ForelderSamtykkeData }) {
  const mobile = useMobile();
  const { barn, barnNavn, alleAktive, sisteSletting } = data;
  const harBarn = barn.length > 0;

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
          <Caps>Personvern</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="samtykke">
              Personvern og
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
            Du styrer hva som er greit for {barnNavn} data.
          </span>
        </div>
        {harBarn && (
          <StatusPill tone={alleAktive ? "up" : "warn"}>
            {alleAktive ? "Alt godkjent" : "Se gjennom"}
          </StatusPill>
        )}
      </div>

      {/* Ansvars-info (anbefaling, aldri sperre) */}
      <Kort tint>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon
            name="shield"
            size={18}
            style={{ color: T.lime, flex: "none", marginTop: 2 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: T.disp,
                fontWeight: 700,
                fontSize: 15,
                color: T.fg,
              }}
            >
              Du bestemmer til barnet er 18
            </div>
            <p
              style={{
                fontFamily: T.ui,
                fontSize: 12.5,
                color: T.fg2,
                lineHeight: 1.55,
                margin: "6px 0 0",
              }}
            >
              Over 13 år: snakk gjerne gjennom valgene sammen. Etter 18 tar
              barnet over selv.
            </p>
          </div>
        </div>
      </Kort>

      {/* Per-barn samtykke-kort, eller tom-tilstand */}
      {harBarn ? (
        barn.map((b) => <BarnSamtykkeKort key={b.id} barn={b} />)
      ) : (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn er koblet"
            sub="Når barn er koblet via invitasjon, vises samtykkene her."
          />
        </Kort>
      )}

      {/* Data-handlinger */}
      {harBarn && <DataHandlinger sisteSletting={sisteSletting} />}

      {/* Personvern-policy */}
      <Kort eyebrow="Slik håndterer vi data">
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.fg2,
            lineHeight: 1.55,
          }}
        >
          <li>Data lagres innenfor EU/EØS via Supabase (Frankfurt-region).</li>
          <li>Vi deler aldri persondata med tredjepart uten eksplisitt samtykke.</li>
          <li>
            Du kan be om full dataeksport eller sletting når som helst via{" "}
            <a
              href="mailto:personvern@akgolf.no"
              style={{ color: T.lime, textDecoration: "none" }}
            >
              personvern@akgolf.no
            </a>
            .
          </li>
          <li>Endringer i samtykker logges i revisjonsloggen og er sporbare.</li>
        </ul>
      </Kort>
    </div>
  );
}
