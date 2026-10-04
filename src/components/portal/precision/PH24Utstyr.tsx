"use client";

/**
 * PlayerHQ · Meg · Utstyr og bag (PH-24) — Precision Athletics.
 * Kilde: AK Golf Precision Athletics PH-24 (Meg / Utstyrsbag).
 *
 * Egenskaper:
 * - Komplett 14-køllers bagoversikt (Driver, Woods, Hybrider, Jern, Wedger, Putter, Ball, Bag, Notater).
 * - Lengdetrapp (Carry-snitt fra TrackMan) med horisontale søyler og standardavvik.
 * - Gap-analyse med evaluering av avstander mellom påfølgende køller.
 * - Direkte redigering og lagring til databasen via lagreUtstyrsbag.
 * - Kun semantiske CSS-variabler, 0 hardkodede hex/rgba-verdier.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Save, CheckCircle2, Layers, Target, Info, Sparkles } from "lucide-react";
import { type UtstyrsbagInput } from "@/app/portal/meg/utstyrsbag/actions";
import { type UtstyrFlateData } from "@/lib/portal/utstyr-data";
import { analyserGap } from "@/lib/portal/ph24-data";

export type PH24UtstyrProps = {
  data: UtstyrFlateData;
  initialBag: UtstyrsbagInput;
  onLagreBag: (data: UtstyrsbagInput) => Promise<void>;
};

const FELT_DEFINISJONER: { key: keyof UtstyrsbagInput; label: string; placeholder: string; hint: string }[] = [
  { key: "driver", label: "Driver", placeholder: "f.eks. TaylorMade Qi10 9°", hint: "Modell, loft og skaft" },
  { key: "fairwayWoods", label: "Fairwaywoods", placeholder: "f.eks. TaylorMade Qi10 3W 15°", hint: "3-wood, 5-wood, mini" },
  { key: "hybrids", label: "Hybrider", placeholder: "f.eks. Ping G430 4H 22°", hint: "Modell og loft" },
  { key: "irons", label: "Jernsett", placeholder: "f.eks. Titleist T150 4–PW", hint: "Modell og spenn" },
  { key: "wedges", label: "Wedger", placeholder: "f.eks. Vokey SM10 50° / 54° / 58°", hint: "Loft, bounce og grind" },
  { key: "putter", label: "Putter", placeholder: "f.eks. Scotty Cameron Phantom X 5.5", hint: "Modell og lengde" },
  { key: "ball", label: "Golfball", placeholder: "f.eks. Titleist Pro V1", hint: "Spillmodell" },
  { key: "bag", label: "Bag / tralle", placeholder: "f.eks. Sun Mountain H2NO", hint: "Bærebag eller trallebag" },
  { key: "notes", label: "Notater & spesifikasjoner", placeholder: "f.eks. Project X 6.0 skaft, Golf Pride MCC grep", hint: "Greptype, tilpasninger" },
];

export function PH24Utstyr({ data, initialBag, onLagreBag }: PH24UtstyrProps) {
  const [redigerer, setRedigerer] = useState(false);
  const [bagState, setBagState] = useState<UtstyrsbagInput>(initialBag);
  const [suksess, setSuksess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await onLagreBag(bagState);
      setSuksess(true);
      setRedigerer(false);
      setTimeout(() => setSuksess(false), 4000);
    });
  };

  // Beregn maks carry for skalering av gapping-søylene
  const maksCarry = data.koller.length > 0 ? Math.max(...data.koller.map((k) => k.median)) : 250;

  // Parvis gapping-analyse
  const analyserteGap = [];
  for (let i = 0; i < data.koller.length - 1; i++) {
    const k1 = data.koller[i];
    const k2 = data.koller[i + 1];
    if (k1 && k2) {
      analyserteGap.push(analyserGap(k1.klubb, k2.klubb, k1.median, k2.median));
    }
  }

  const antallFylte = Object.values(bagState).filter((v) => v && v.trim().length > 0).length;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "16px 20px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Topplinje */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          href="/portal/meg"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          Tilbake til Meg
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Utstyr og bag
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)" }}>
              Køllespesifikasjoner og målte TrackMan-lengder (carry).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRedigerer(!redigerer)}
            style={{
              minHeight: 44,
              padding: "10px 16px",
              borderRadius: "var(--radius)",
              background: redigerer ? "var(--surface-sunken)" : "var(--primary)",
              color: redigerer ? "var(--text-primary)" : "var(--text-on-primary)",
              border: "1px solid var(--border-hairline)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxSizing: "border-box",
            }}
          >
            <Edit3 size={14} />
            <span>{redigerer ? "Lukk redigering" : "Rediger bagen"}</span>
          </button>
        </div>
      </div>

      {suksess && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius)",
            background: "var(--ok-tint)",
            color: "var(--ok)",
            border: "1px solid var(--ok)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Utstyrsbagen ble oppdatert og lagret!</span>
        </div>
      )}

      {/* Redigeringsskjema dersom åpent */}
      {redigerer && (
        <form
          onSubmit={handleSave}
          style={{
            padding: 20,
            borderRadius: "var(--radius)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-ink)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
              Oppdater køller og spesifikasjoner
            </h2>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{antallFylte} av 9 felter fylt ut</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FELT_DEFINISJONER.map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type="text"
                  value={bagState[f.key] ?? ""}
                  onChange={(e) => setBagState({ ...bagState, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: "9px 12px",
                    borderRadius: "var(--radius)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{f.hint}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setRedigerer(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "8px 16px",
                borderRadius: "var(--radius)",
                background: "transparent",
                border: "1px solid var(--border-hairline)",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 44,
                padding: "8px 18px",
                borderRadius: "var(--radius)",
                background: "var(--primary)",
                color: "var(--text-on-primary)",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                gap: 6,
                boxSizing: "border-box",
              }}
            >
              <Save size={14} />
              <span>{isPending ? "Lagrer..." : "Lagre endringer"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 14-køllers bagoversikt */}
      <section
        style={{
          padding: 20,
          borderRadius: "var(--radius)",
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Bagens innhold</h2>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
            {data.bagFelter.length} køllesett registrert
          </span>
        </div>

        {data.bagFelter.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {data.bagFelter.map((f) => (
              <div
                key={f.label}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius)",
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-hairline)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {f.label}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{f.kort}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{f.verdi}</span>
              </div>
            ))}

            {data.tilbehor.map((t) => (
              <div
                key={t.label}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius)",
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-hairline)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {t.label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{t.verdi}</span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 24,
              borderRadius: "var(--radius)",
              background: "var(--surface-sunken)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={24} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Ingen bagopplysninger registrert</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: "44ch" }}>
              Klikk «Rediger bagen» over for å legge inn driver, jern og wedger, så har coachen og gapping-analysen riktig referanse.
            </span>
          </div>
        )}

        {data.notater && (
          <div
            style={{
              marginTop: 4,
              padding: "10px 14px",
              borderRadius: "var(--radius)",
              background: "var(--surface-sunken)",
              fontSize: 13,
              color: "var(--text-secondary)",
              display: "flex",
              gap: 8,
              alignItems: "baseline",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase" }}>Notater:</span>
            <span>{data.notater}</span>
          </div>
        )}
      </section>

      {/* Lengdetrapp og Gapping-analyse */}
      <section
        style={{
          padding: 20,
          borderRadius: "var(--radius)",
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
              Lengdetrapp (Carry snitt fra TrackMan)
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Siste {data.vinduDager} dager · {data.okter} TrackMan-økter
          </span>
        </div>

        {data.koller.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.koller.map((k) => {
              const breddeProsent = Math.min(100, Math.max(12, (k.median / maksCarry) * 100));
              return (
                <div key={k.klubb} style={{ display: "grid", gridTemplateColumns: "64px 1fr 70px", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                    {k.klubb}
                  </span>
                  <div
                    style={{
                      height: 24,
                      background: "var(--surface-sunken)",
                      borderRadius: "var(--radius-inner)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${breddeProsent}%`,
                        height: "100%",
                        background: "var(--primary)",
                        borderRadius: "var(--radius-inner)",
                        opacity: 0.85,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {Math.round(k.median)} m
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{k.slag} slag</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: 24,
              borderRadius: "var(--radius)",
              background: "var(--surface-sunken)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Info size={24} style={{ color: "var(--text-muted)" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Ingen målte TrackMan-slag ennå</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: "44ch" }}>
              Når du slår baller på TrackMan med klubbvalg, bygges den faktiske lengdetrappa automatisk opp basert på carry-snitt.
            </span>
          </div>
        )}

        {/* Gapping-analyse advarsler/anbefalinger */}
        {analyserteGap.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Avstandsintervaller (gap mellom køller)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {analyserteGap.map((g) => (
                <div
                  key={`${g.fra}-${g.til}`}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius)",
                    background:
                      g.status === "normal"
                        ? "var(--surface-sunken)"
                        : g.status === "for-tett"
                        ? "var(--warn-tint)"
                        : "var(--surface-sunken)",
                    border: "1px solid var(--border-hairline)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {g.fra} → {g.til}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                      {g.meter} m
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: g.status === "normal" ? "var(--surface-card)" : "var(--surface-card)",
                        color: g.status === "normal" ? "var(--text-secondary)" : "var(--warn)",
                      }}
                    >
                      {g.status === "normal" ? "OK" : g.status === "for-tett" ? "Tett" : "Stort gap"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
