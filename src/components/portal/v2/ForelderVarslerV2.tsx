"use client";

/**
 * Foreldreportal · Varsler — v2 Presis + B-pakke (status + tom = vei).
 * Kanaler fortsatt lese-modus (ikke lagret ennå). Kun v2 + T.*.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Bryter,
  TomTilstand,
  Icon,
  Knapp,
} from "@/components/v2";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type ForelderVarsel = {
  id: string;
  /** Notification.type — «MESSAGE» | «BOOKING» | «PAYMENT» | annet. */
  type: string;
  title: string;
  body: string | null;
  /** Barnets fornavn (avsender-kontekst). */
  childFirstName: string;
  /** Forhåndsformatert nb-NO dato/tid («07. jul 14:30»). */
  dato: string;
};

export type ForelderVarslerData = {
  /** Forelderens e-post — der varsler sendes inntil push er på plass. */
  email: string;
  /** Koblede barn (id + navn + relasjon) for per-barn-kanalene. */
  barn: { id: string; name: string; relationship: string }[];
  /** Barnas nyeste varsler (inntil 8). */
  varsler: ForelderVarsel[];
};

/* ── Statisk kanal-config (1:1 fra originalen) ─────────────────────── */

type Kanal = { key: string; label: string; sub: string };

const KANALER: Kanal[] = [
  { key: "okt_planlagt", label: "Ny økt planlagt", sub: "Når coach legger inn økt" },
  { key: "okt_fullfort", label: "Økt fullført", sub: "Når barnet logger fullført økt" },
  { key: "faktura", label: "Ny faktura", sub: "Når betaling forfaller eller mislykkes" },
  { key: "melding", label: "Coach-melding", sub: "Når coach sender direktemelding" },
];

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
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

/** Notification-type → v2-ikonnavn (samme kartlegging som originalen). */
function varselIkon(type: string): string {
  if (type === "MESSAGE") return "message-circle";
  if (type === "BOOKING") return "calendar";
  if (type === "PAYMENT") return "mail";
  return "check-circle";
}

/* ── Ett varsel i «Siste varsler»-lista ────────────────────────────── */

function VarselRad({ v, last }: { v: ForelderVarsel; last: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "13px 0",
        borderBottom: last ? "none" : `1px solid ${T.border}`,
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
        <Icon name={varselIkon(v.type)} size={15} style={{ color: T.fg2 }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: T.ui,
            fontSize: 13.5,
            fontWeight: 600,
            color: T.fg,
          }}
        >
          {v.title}
        </div>
        {v.body && (
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.55,
              margin: "4px 0 0",
            }}
          >
            {v.body}
          </p>
        )}
        <Caps size={9} style={{ marginTop: 7 }}>
          {v.childFirstName} · {v.dato}
        </Caps>
      </div>
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderVarslerV2({ data }: { data: ForelderVarslerData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { email, barn, varsler } = data;

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
          <Caps>Varsler</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="hører om">
              Hva du
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
            Du får e-post om det viktigste per barn.
          </span>
        </div>
        <StatusPill tone={varsler.length > 0 ? "info" : "up"}>
          {varsler.length > 0 ? `${varsler.length} nylig` : "Ingen nye"}
        </StatusPill>
      </div>

      {/* Status: e-post inntil app-varsler */}
      <Kort tint>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon
            name="bell"
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
              Varsler sendes på e-post
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
              App-varsler kommer snart. Inntil videre går alt til {email}.
            </p>
          </div>
        </div>
      </Kort>

      {/* Én vei videre (B) */}
      <div>
        <Knapp icon="arrow-right" full={mobile} onClick={() => router.push("/forelder")}>
          Til oversikten
        </Knapp>
      </div>

      {/* Per barn — kanaler */}
      {barn.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn koblet ennå"
            sub="Be spilleren sende en invitasjon, så dukker varselvalg opp her."
          />
        </Kort>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Caps>{`Per barn · ${barn.length}`}</Caps>
          {barn.map((b) => (
            <Kort key={b.id}>
              {/* Barn-hode */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  paddingBottom: 12,
                  marginBottom: 4,
                  borderBottom: `1px solid ${T.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: T.panel3,
                      border: `1px solid ${T.border}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    <Icon name="user" size={15} style={{ color: T.fg2 }} />
                  </span>
                  <span
                    style={{
                      fontFamily: T.disp,
                      fontWeight: 700,
                      fontSize: 15,
                      color: T.fg,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {b.name}
                  </span>
                </div>
                <Caps size={9} style={{ flex: "none" }}>
                  {b.relationship}
                </Caps>
              </div>
              {/* Kanaler — låst-på brytere (lese-modus) */}
              <div
                className="grid grid-cols-1 md:grid-cols-2"
                style={{ gap: 14, marginTop: 12 }}
              >
                {KANALER.map((k) => (
                  <Bryter
                    key={k.key}
                    checked
                    label={k.label}
                    sub={k.sub}
                  />
                ))}
              </div>
            </Kort>
          ))}
        </div>
      )}

      {/* Siste varsler */}
      <Kort
        eyebrow="Siste varsler"
        action={
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {varsler.length} de siste dagene
          </span>
        }
      >
        {varsler.length === 0 ? (
          <TomTilstand
            icon="bell"
            title="Ingen varsler å vise"
            sub="Når det skjer noe for barna, dukker det opp her."
          />
        ) : (
          <div>
            {varsler.map((v, i) => (
              <VarselRad key={v.id} v={v} last={i === varsler.length - 1} />
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}
