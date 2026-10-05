"use client";

/**
 * Kilde: AK Golf Precision Athletics PH-15 (Test: gjennomfør i nattmodus / fokus).
 * Natt/fokus-visning med store trykkflater (56-80px), ingen hex-farger (kun CSS-variabler).
 * Implementerer standard avstands- og poengtester med scorekort-grid, stepper og live-lagring.
 */

import React, { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ScorekortSpec } from "@/lib/portal-tester/protocol";
import {
  utledPH15Oppsett,
  beregnPH15Statistikk,
  formaterNorskDesimal,
  justerStepperVerdi,
} from "@/lib/portal-tester/ph15-data";
import {
  startTestSession,
  lagreSteg,
  fullforTestSession,
  avbrytTestSession,
} from "@/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/actions";
import { usePaToast } from "@/components/precision/pa-toast";

interface PH15TestGjennomforProps {
  testId: string;
  testNavn: string;
  beskrivelse: string | null;
  scoringRule: string;
  omraade: string;
  sist: { score: number; dato: string } | null;
  spec: ScorekortSpec;
  protocol: unknown;
  gjenopptak: { sessionId: string; verdier: Record<number, Record<string, string | boolean>> } | null;
}

export function PH15TestGjennomfor({
  testId,
  testNavn,
  beskrivelse: _beskrivelse,
  scoringRule,
  omraade,
  sist,
  spec,
  protocol: _protocol,
  gjenopptak,
}: PH15TestGjennomforProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const oppsett = utledPH15Oppsett(spec, scoringRule);
  const N = oppsett.antallSlag;
  const LIM = oppsett.grenseM ?? 4;

  // Initialiser fra gjenopptak hvis tilstede
  const initRes = (): (number | boolean)[] => {
    if (!gjenopptak?.verdier) return [];
    const r: (number | boolean)[] = [];
    for (let i = 1; i <= N; i++) {
      const v = gjenopptak.verdier[i];
      if (!v) break;
      const val = v["avstand"] ?? v["meter"] ?? v["ok"] ?? v["poeng"] ?? Object.values(v)[0];
      if (typeof val === "boolean" || typeof val === "number") {
        r.push(val);
      } else if (typeof val === "string") {
        const parsed = Number(val.replace(",", "."));
        if (Number.isFinite(parsed)) r.push(parsed);
      }
    }
    return r;
  };

  const [res, setRes] = useState<(number | boolean)[]>(initRes);
  const [m, setM] = useState<number>(oppsett.standardInndataVerdi);
  const [endOpen, setEndOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const paToast = usePaToast();
  const [feil, setFeil] = useState<string | null>(null);

  // Live session ref for speiling
  const sessionIdRef = useRef<string | null>(gjenopptak?.sessionId ?? null);
  const starterOktRef = useRef(false);

  const stats = beregnPH15Statistikk(res, LIM, oppsett.modus);
  const done = res.length >= N;
  const inside = stats.antallInnenforGrense;
  const avg = stats.snittVerdi;

  const showToast = (t: string) => paToast.vis(t);

  // Speiling til TestSession i bakgrunnen
  const speilForsokTilServer = async (slagNr: number, verdi: number | boolean) => {
    try {
      let sid = sessionIdRef.current;
      if (!sid && !starterOktRef.current) {
        starterOktRef.current = true;
        const startRes = await startTestSession({ testId });
        if (startRes.ok) {
          sid = sessionIdRef.current = startRes.sessionId;
        }
        starterOktRef.current = false;
      }
      if (sid) {
        const feltNokkel = spec.forsok[slagNr - 1]?.felter[0]?.key || (oppsett.modus === "hit_miss" ? "ok" : "avstand");
        await lagreSteg({
          sessionId: sid,
          stegIndex: slagNr - 1,
          verdier: { [feltNokkel]: verdi },
        });
      }
    } catch {
      // Best-effort speiling
    }
  };

  const handleRegSlag = (verdiInn?: number | boolean) => {
    if (done) return;
    const verdi = verdiInn !== undefined ? verdiInn : m;
    const nyListe = [...res, verdi];
    setRes(nyListe);

    const nyttSlagNr = nyListe.length;
    void speilForsokTilServer(nyttSlagNr, verdi);

    if (oppsett.modus === "hit_miss") {
      const treff = Boolean(verdi);
      showToast(treff ? "Treff" : "Bom");
    } else {
      const erInnenfor = typeof verdi === "number" && verdi <= LIM;
      showToast(
        `Slag ${nyttSlagNr} · ${formaterNorskDesimal(typeof verdi === "number" ? verdi : null)} ${oppsett.enhet} — ${erInnenfor ? `INNENFOR ${LIM} M` : `UTENFOR ${LIM} M`}`,
      );
    }
  };

  const handleAngreSiste = () => {
    if (res.length === 0) return;
    setRes(res.slice(0, -1));
  };

  const handleSave = () => {
    if (!done) return;
    setFeil(null);

    // Klargjør forsøk-objekter for server
    const forsokData = spec.forsok.map((f, i) => {
      const v = res[i];
      const feltNokkel = f.felter[0]?.key || (oppsett.modus === "hit_miss" ? "ok" : "avstand");
      return {
        nr: f.nr,
        label: f.label,
        verdier: { [feltNokkel]: v ?? null },
      };
    });

    startTransition(async () => {
      try {
        const result = await fullforTestSession({
          testId,
          forsok: forsokData,
        });

        if (result && !result.ok) {
          setFeil(result.error);
        } else {
          setSaved(true);
          showToast(
            `Resultatet er lagret: ${inside} av ${N} innenfor ${LIM} m · Snitt ${formaterNorskDesimal(avg)} ${oppsett.enhet}`,
          );
        }
      } catch {
        // fullforTestSession kaster redirect ved suksess
      }
    });
  };

  const handleAvbryt = () => {
    const sid = sessionIdRef.current;
    startTransition(async () => {
      if (sid) {
        try {
          await avbrytTestSession({ sessionId: sid });
        } catch {
          // Best-effort avbryt
        }
      }
      router.push(`/portal/tren/tester/${testId}`);
    });
  };

  return (
    <div
      data-theme="night"
      style={{
        minHeight: "100dvh",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "calc(12px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom))",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 640, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Toast */}
        {paToast.el}

        {/* Topplinje */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              font: "600 11px/1 var(--font-mono)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "6px 10px",
              borderRadius: 4,
              background: "var(--surface-card)",
              color: "var(--signal)",
              border: "1px solid var(--border-hairline)",
            }}
          >
            Test
          </span>
          <span
            style={{
              font: "500 11px/1.2 var(--font-mono)",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {testNavn.toUpperCase()} · {N} SLAG
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => setEndOpen(true)}
            style={{
              height: 56,
              padding: "0 16px",
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              font: "600 15px/1 var(--font-sans)",
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            Avslutt
          </button>
        </div>

        {/* Feilmelding */}
        {feil && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "var(--surface-card)",
              border: "1px solid var(--border-strong)",
              color: "var(--signal)",
              fontSize: 14,
            }}
          >
            {feil}
          </div>
        )}

        {/* Tittel */}
        <div>
          <h1 style={{ margin: 0, font: "var(--type-title-l)", color: "var(--text-primary)" }}>{testNavn}</h1>
          <div
            style={{
              font: "500 11px/1.4 var(--font-mono)",
              color: "var(--text-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            {omraade.toUpperCase()} · {N} SLAG MOT FLAGG · INNENFOR {LIM} M TELLER
            {sist ? ` · FORRIGE ${sist.score} AV ${N}` : ""}
          </div>
        </div>

        {/* Nøkkeltall / KPI-grid */}
        <div
          className="pa-card"
          style={{
            padding: 16,
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <div>
              <div style={{ font: "500 10px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Innenfor {LIM} m
              </div>
              <div style={{ font: "600 24px/1.2 var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>
                {res.length ? `${inside} av ${res.length}` : "—"}
              </div>
            </div>
            <div>
              <div style={{ font: "500 10px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Snitt
              </div>
              <div style={{ font: "600 24px/1.2 var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>
                {avg == null ? "—" : `${formaterNorskDesimal(avg)} ${oppsett.enhet}`}
              </div>
            </div>
            <div>
              <div style={{ font: "500 10px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Slag
              </div>
              <div style={{ font: "600 24px/1.2 var(--font-mono)", color: "var(--text-primary)", marginTop: 4 }}>
                {res.length} / {N}
              </div>
            </div>
          </div>
        </div>

        {/* Scorekort */}
        <div
          className="pa-card"
          style={{
            padding: 14,
            borderRadius: "var(--radius)",
            border: "1px solid var(--border-hairline)",
            background: "var(--surface-card)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
            <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Scorekort
            </span>
            <span style={{ font: "500 10px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              METER FRA FLAGGET
            </span>
          </div>

          <div
            role="list"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${N <= 5 ? N : 5}, minmax(0, 1fr))`,
              gap: 6,
            }}
          >
            {Array.from({ length: N }, (_, i) => {
              const v = res[i];
              const isNext = i === res.length;
              const ok = v != null && (typeof v === "boolean" ? v : v <= LIM);

              return (
                <div
                  role="listitem"
                  key={i}
                  aria-label={`Slag ${i + 1}${v != null ? ` ${formaterNorskDesimal(typeof v === "number" ? v : null)} meter` : " ikke slått"}`}
                  style={{
                    height: 64,
                    borderRadius: 8,
                    border: `1px solid ${isNext ? "var(--border-ink)" : "var(--border-hairline)"}`,
                    background: ok ? "var(--surface-sunken)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    minWidth: 0,
                    position: "relative",
                  }}
                >
                  <span style={{ font: "500 10px/1 var(--font-mono)", color: "var(--text-muted)" }}>{i + 1}</span>
                  <span
                    style={{
                      font: "600 17px/1 var(--font-mono)",
                      color: v == null ? "var(--text-faint)" : "var(--text-primary)",
                      textDecoration: ok ? "underline" : "none",
                      textUnderlineOffset: 4,
                      textDecorationThickness: 2,
                    }}
                  >
                    {v == null ? "—" : typeof v === "boolean" ? (v ? "OK" : "BOM") : formaterNorskDesimal(v)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ font: "500 9px/1.2 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase", padding: "0 2px" }}>
            UNDERSTREKET = INNENFOR {LIM} M
          </div>
        </div>

        {/* Slagtasting / Stepper mens testen er i gang */}
        {!done && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-secondary)" }}>
                Meter fra flagget · slag {res.length + 1}
              </span>
              {res.length > 0 && (
                <button
                  type="button"
                  onClick={handleAngreSiste}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    font: "var(--type-label)",
                    color: "var(--text-secondary)",
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Angre siste
                </button>
              )}
            </div>

            {oppsett.modus === "hit_miss" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => handleRegSlag(true)}
                  style={{
                    height: 72,
                    borderRadius: 10,
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                    font: "600 20px/1 var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Treff
                </button>
                <button
                  type="button"
                  onClick={() => handleRegSlag(false)}
                  style={{
                    height: 72,
                    borderRadius: 10,
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-secondary)",
                    font: "600 20px/1 var(--font-sans)",
                    cursor: "pointer",
                  }}
                >
                  Bom
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
                  <span
                    style={{
                      font: "600 72px/1 var(--font-mono)",
                      color: "var(--text-primary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formaterNorskDesimal(m)}
                  </span>
                  <span style={{ font: "600 22px/1 var(--font-mono)", color: "var(--text-muted)" }}>
                    {" " + oppsett.enhet}
                  </span>
                  <div
                    style={{
                      font: "500 11px/1 var(--font-mono)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: m <= LIM ? "var(--text-primary)" : "var(--text-muted)",
                      marginTop: 6,
                    }}
                  >
                    {m <= LIM ? `INNENFOR ${LIM} M` : `UTENFOR ${LIM} M`}
                  </div>
                </div>

                {/* Stepper knapper (72px høye) */}
                <div style={{ display: "flex", gap: 6 }}>
                  {oppsett.stepperVerdier.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-label={`${d > 0 ? "+" : "−"}${formaterNorskDesimal(Math.abs(d))} meter`}
                      onClick={() => setM((prev) => justerStepperVerdi(prev, d, 0, 100))}
                      style={{
                        height: 72,
                        flex: "1 1 0",
                        minWidth: 0,
                        borderRadius: 8,
                        border: "1px solid var(--border-strong)",
                        background: "var(--surface-card)",
                        color: "var(--text-primary)",
                        font: "600 21px/1 var(--font-mono)",
                        cursor: "pointer",
                      }}
                    >
                      {(d > 0 ? "+" : "−") + formaterNorskDesimal(Math.abs(d))}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Resultat-oppsummering når alle slag er ført */}
        {done && (
          <div
            className="pa-card"
            style={{
              padding: 16,
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span style={{ font: "600 11px/1 var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Resultat
            </span>
            <div style={{ font: "600 28px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
              {inside} av {N} innenfor {LIM} m
            </div>
            <div style={{ font: "500 11px/1.4 var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {sist
                ? inside > sist.score
                  ? `+${inside - sist.score} SIDEN ${sist.dato}`
                  : inside === sist.score
                    ? `LIKT SOM ${sist.dato}`
                    : `−${sist.score - inside} SIDEN ${sist.dato}`
                : "FØRSTE GJENNOMFØRING"}
            </div>
          </div>
        )}
      </div>

      {/* Bunn-aksjon (fast i bunn) */}
      <div style={{ maxWidth: 640, width: "100%", margin: "24px auto 0" }}>
        {!done ? (
          <button
            type="button"
            onClick={() => handleRegSlag()}
            style={{
              width: "100%",
              height: 80,
              borderRadius: "var(--radius)",
              border: "none",
              background: "var(--primary)",
              color: "var(--surface-page)",
              font: "600 21px/1 var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            Registrer slag {res.length + 1} · {formaterNorskDesimal(m)} {oppsett.enhet}
          </button>
        ) : !saved ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            style={{
              width: "100%",
              height: 64,
              borderRadius: "var(--radius)",
              border: "none",
              background: "var(--primary)",
              color: "var(--surface-page)",
              font: "600 18px/1 var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? "Lagrer…" : `Lagre resultat · ${inside} av ${N}`}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push(`/portal/tren/tester/${testId}`)}
            style={{
              width: "100%",
              height: 64,
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-strong)",
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              font: "600 18px/1 var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            Til testene
          </button>
        )}
      </div>

      {/* Avslutte-dialog */}
      {endOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--scrim-modal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-strong)",
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, font: "600 20px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>
              Avslutte testen?
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--text-secondary)" }}>
              {res.length} av {N} slag er registrert. En test må ha alle {N} slag for å telle. Slagene lagres ikke.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEndOpen(false)}
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  font: "600 14px/1 var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Fortsett
              </button>
              <button
                type="button"
                onClick={handleAvbryt}
                disabled={pending}
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--signal)",
                  color: "var(--surface-page)",
                  font: "600 14px/1 var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Avslutt uten å lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
