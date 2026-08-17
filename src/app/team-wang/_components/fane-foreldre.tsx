"use client";

/**
 * Foreldre-fanen.
 *
 * Før åpnet siden med en informasjonsboks og en liste over møter. Neste møte
 * var ikke løftet fram, og chatten lå nederst etter all annen tekst.
 *
 * Nå: neste møte er hero med ÉN primær handling. Chatten står som egen kolonne
 * på desktop og eget kort på mobil. Alt annet er lenker og lesing.
 */

import { useState } from "react";
import { Send } from "lucide-react";

import {
  CHAT_SEED,
  PARENT_MEETINGS,
  daysLabel,
  daysUntil,
  type ChatMelding,
} from "../_data/wang-plan";

// Ingen elevliste her: fellessiden er åpen uten innlogging, og navn pa
// mindreårige skal ikke ligge bak en delbar lenke. Roster med navn finnes kun
// på den auth-gatede /team-wang/coach. Ikke gjeninnfør rosteret her.
//
// `live` tas heller ikke inn lenger: rosteret var eneste bruk av den, og en
// ubrukt WangLiveData-prop er en åpen invitasjon til å rendre navn igjen.
export function FaneForeldre({ naaIso }: { naaIso: string }) {
  const [meldinger, setMeldinger] = useState<ChatMelding[]>(CHAT_SEED);
  const [tekst, setTekst] = useState("");
  const [meldtPaa, setMeldtPaa] = useState(false);

  const send = () => {
    const t = tekst.trim();
    if (!t) return;
    setMeldinger((m) => [
      ...m,
      { id: m.length + 1, sender: "Deg", text: t, time: "nå", own: true },
    ]);
    setTekst("");
  };

  const kommende = PARENT_MEETINGS.filter((p) => p.iso >= naaIso);
  const neste = kommende[0] ?? null;
  const resten = neste
    ? PARENT_MEETINGS.filter((p) => p.iso !== neste.iso)
    : PARENT_MEETINGS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: 24,
          color: "var(--text-primary)",
        }}
      >
        Foreldre
      </h1>

      {/* Hero: neste møte, med den ene primære handlingen på skjermen. */}
      {neste ? (
        <section
          style={{
            background: "var(--grad-hero-line)",
            boxShadow: "var(--shadow-hero)",
            borderRadius: "var(--radius-card)",
            padding: "20px 22px",
            color: "var(--text-on-dark)",
          }}
        >
          <span
            className="t-label"
            style={{ display: "block", color: "var(--wang-mint)" }}
          >
            Neste foreldremøte ·{" "}
            {daysLabel(daysUntil(neste.iso, naaIso)).toLowerCase()}
          </span>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-0.015em",
              marginTop: 6,
            }}
          >
            {neste.tema}
          </span>
          <span
            className="wang-num"
            style={{
              display: "block",
              fontSize: 13.5,
              lineHeight: 1.5,
              color: "var(--text-on-dark-dim)",
              marginTop: 5,
            }}
          >
            {neste.dato} kl. {neste.tid} · {neste.hvor}
          </span>

          <button
            type="button"
            onClick={() => setMeldtPaa((v) => !v)}
            className="wang-pressable"
            aria-pressed={meldtPaa}
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              padding: "0 22px",
              borderRadius: "var(--radius-chip)",
              border: "none",
              cursor: "pointer",
              background: meldtPaa ? "var(--wang-mint)" : "var(--white)",
              color: "var(--wang-navy)",
              fontFamily: "var(--font-brand)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {meldtPaa ? "Deltakelse meldt" : "Meld deltakelse"}
          </button>

          {/* Ingen skal tro de har gitt trener beskjed før koblingen finnes. */}
          {meldtPaa ? (
            <span
              style={{
                display: "block",
                marginTop: 8,
                fontSize: 12,
                color: "var(--text-on-dark-dim)",
              }}
            >
              Registrert her, men ikke sendt til trener ennå. Gi beskjed direkte
              ved forfall.
            </span>
          ) : null}
        </section>
      ) : null}

      {/* Desktop: møtene til venstre, chatten som egen kolonne til høyre. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 22,
          alignItems: "start",
        }}
      >
        <section className="wang-card" style={{ padding: "16px 18px" }}>
          <span
            className="t-label"
            style={{
              display: "block",
              color: "var(--text-secondary)",
              marginBottom: 4,
            }}
          >
            Møter i sesongen
          </span>
          {resten.map((p, i) => (
            <div
              key={p.iso}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 44,
                padding: "10px 0",
                borderBottom:
                  i === resten.length - 1
                    ? "none"
                    : "1px solid var(--border-subtle)",
                minWidth: 0,
              }}
            >
              <span
                className="wang-num"
                style={{
                  flex: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 62,
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 10,
                  background: "var(--tint-navy)",
                  color: "var(--wang-navy)",
                  fontFamily: "var(--font-brand)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {p.dato.replace(/ \d{4}$/, "")}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b
                  style={{
                    display: "block",
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "var(--text-primary)",
                  }}
                >
                  {p.tema}
                </b>
                <span
                  className="wang-num"
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 1,
                  }}
                >
                  kl. {p.tid} · {p.hvor}
                </span>
              </span>
            </div>
          ))}
        </section>

        <section
          className="wang-card"
          style={{
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: "14px 18px 10px",
            }}
          >
            <span
              className="t-label"
              style={{ color: "var(--text-secondary)" }}
            >
              Gruppechat
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--wang-mint)",
                }}
              />
              Trenerne leser her
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: "0 18px 16px",
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {meldinger.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.own ? "flex-end" : "flex-start",
                  gap: 3,
                }}
              >
                {!m.own ? (
                  <span
                    style={{
                      fontFamily: "var(--font-brand)",
                      fontWeight: 700,
                      fontSize: 11.5,
                      color: "var(--text-secondary)",
                      padding: "0 4px",
                    }}
                  >
                    {m.sender}
                  </span>
                ) : null}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: 18,
                    borderBottomRightRadius: m.own ? 4 : 18,
                    borderBottomLeftRadius: m.own ? 18 : 4,
                    background: m.own
                      ? "var(--wang-navy)"
                      : "var(--neutral-50)",
                    color: m.own ? "var(--white)" : "var(--text-primary)",
                    fontSize: 13.5,
                    lineHeight: 1.45,
                  }}
                >
                  {m.text}
                </div>
                <span
                  className="wang-num"
                  style={{
                    fontSize: 10.5,
                    color: "var(--text-secondary)",
                    padding: "0 4px",
                  }}
                >
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: 14,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <input
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Skriv en melding …"
              aria-label="Skriv en melding"
              style={{
                flex: 1,
                minWidth: 0,
                height: 44,
                padding: "0 16px",
                borderRadius: 999,
                border: "1px solid var(--border-subtle)",
                background: "var(--neutral-50)",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              aria-label="Send melding"
              className="wang-pressable"
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: "var(--wang-navy)",
                color: "var(--white)",
              }}
            >
              <Send size={18} strokeWidth={2.2} aria-hidden />
            </button>
          </div>

          {/* Demo-merket står i kortfoten, ikke som blokkerende varsel. */}
          <p
            style={{
              margin: 0,
              padding: "0 18px 14px",
              fontSize: 11.5,
              color: "var(--text-secondary)",
            }}
          >
            Demo-visning — meldinger lagres ikke ennå. Kobles til gruppechatten
            i PlayerHQ.
          </p>
        </section>
      </div>

    </div>
  );
}
