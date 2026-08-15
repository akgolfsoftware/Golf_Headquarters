"use client";

/**
 * Plan → Samlinger.
 *
 * Endringen fra før: frist og egenandel er ALLTID synlig i kortfoten. De sto
 * bak et trekkspill, og det er nettopp de to tingene en forelder leter etter.
 * Ingen kort må lenger åpnes for å svare på «hva koster det og når må vi si
 * fra». Bindende påmelding står i teksten, ikke bare i statusen.
 */

import { Calendar, Flag } from "lucide-react";

import { FULL_DAY_CAMPS, TRAINING_CAMPS, campStatus } from "../_data/wang-plan";
import { IconChip, StatusChip } from "./primitiver";

export function FaneSamlinger() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div
        className="wang-card"
        style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}
      >
        <IconChip icon="users" color="navy" size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            Oppmøte er obligatorisk
          </div>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              lineHeight: 1.55,
              color: "var(--text-secondary)",
              maxWidth: 680,
            }}
          >
            Meld fra til trener ved fravær. Program legges ut før hver samling.{" "}
            <strong style={{ color: "var(--text-primary)" }}>Treningssamlinger</strong> går over
            flere dager, mens{" "}
            <strong style={{ color: "var(--text-primary)" }}>heldagssamlinger</strong> er temadager.
          </p>
        </div>
      </div>

      <section>
        <SeksjonTittel>Treningssamlinger</SeksjonTittel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 14,
          }}
        >
          {TRAINING_CAMPS.map((c) => {
            const st = campStatus(c.status);
            const bindende = c.pamelding.toLowerCase().includes("bindende");
            return (
              <div
                key={c.name}
                className="wang-card"
                style={{
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text-primary)",
                      minWidth: 0,
                    }}
                  >
                    {c.name}
                  </div>
                  <StatusChip color={st.statusColor} icon={st.statusIcon} label={st.statusLabel} />
                </div>

                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "var(--text-secondary)",
                  }}
                >
                  {c.desc}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <InfoRad
                    ikon={<Calendar size={15} strokeWidth={2} aria-hidden />}
                    label="Dato"
                    verdi={c.dato}
                    mono
                  />
                  <InfoRad
                    ikon={<Flag size={15} strokeWidth={2} aria-hidden />}
                    label="Hvor"
                    verdi={c.hvor}
                  />
                  <InfoRad label="Påmelding" verdi={c.pamelding} sterk={bindende} />
                </div>

                {/* Kortfoten: de to tallene en forelder faktisk leter etter. */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 11,
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span
                    className="wang-num"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: 12.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Frist {c.pamfrist}
                  </span>
                  <b
                    className="wang-num"
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--wang-teal-text)",
                    }}
                  >
                    {c.egenandel}
                  </b>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SeksjonTittel>Heldagssamlinger</SeksjonTittel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FULL_DAY_CAMPS.map((dd) => (
            <div
              key={dd.iso + dd.tema}
              className="wang-card"
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                className="wang-num"
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 96,
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 12,
                  background: "var(--tint-navy)",
                  color: "var(--wang-navy)",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  textAlign: "center",
                }}
              >
                {dd.dato}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: "var(--text-primary)",
                  }}
                >
                  {dd.tema}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 3,
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: "var(--neutral-300)",
                    }}
                  />
                  {dd.hvor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SeksjonTittel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-brand)",
        fontWeight: 700,
        fontSize: 17,
        margin: "2px 2px 12px",
        color: "var(--text-primary)",
      }}
    >
      {children}
    </div>
  );
}

function InfoRad({
  ikon,
  label,
  verdi,
  mono,
  sterk,
}: {
  ikon?: React.ReactNode;
  label: string;
  verdi: string;
  mono?: boolean;
  sterk?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        color: "var(--text-secondary)",
        minWidth: 0,
      }}
    >
      {ikon ? (
        <span style={{ display: "inline-flex", alignSelf: "center", flex: "none" }}>{ikon}</span>
      ) : (
        <span style={{ width: 15, flex: "none" }} />
      )}
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 12.5,
          color: "var(--text-secondary)",
          flex: "none",
        }}
      >
        {label}
      </span>
      <span
        className={mono ? "wang-num" : undefined}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: sterk ? "var(--cat-orange-text)" : "var(--text-primary)",
          fontWeight: sterk ? 700 : 400,
          minWidth: 0,
        }}
      >
        {verdi}
      </span>
    </div>
  );
}
