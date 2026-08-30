"use client";

/**
 * PlayerHQ DataGolf-spillerkort — Train-lock (C10).
 * Fasit: designsystem/train-lock/DG-01 DataGolf spiller.dc.html
 *
 * Fasit: designsystem/train-lock/DG-01 DataGolf spiller.dc.html
 * (DG-01a iPhone / DG-01b iPad / DG-01c Mac).
 *
 * Kun DataGolf-motor. Negative tall = opacity, aldri rødt. PGA-putt merkes
 * som Broadie-tabell. «Tren mot» er UTKAST, aldri auto-plan.
 */

import { useEffect, useState } from "react";
import { TL, TL_BREKK } from "@/lib/v2/train-lock";
import type { DataGolfData } from "@/lib/portal-stats/datagolf-data";
import { fmtDgTall } from "@/lib/portal-stats/datagolf-kort";

export type DataGolfProps = { data: DataGolfData; spillerNavn?: string };

type Fane = "felt" | "skill" | "innspill" | "starter";
type SkjermStorrelse = "compact" | "regular" | "wide";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

function useSkjermStorrelse(): SkjermStorrelse {
  const [s, setS] = useState<SkjermStorrelse>("compact");
  useEffect(() => {
    const mqRegular = window.matchMedia(`(min-width: ${TL_BREKK.ipadSmal}px)`);
    const mqWide = window.matchMedia(`(min-width: ${TL_BREKK.macRail}px)`);
    const oppdater = () => setS(mqWide.matches ? "wide" : mqRegular.matches ? "regular" : "compact");
    oppdater();
    mqRegular.addEventListener("change", oppdater);
    mqWide.addEventListener("change", oppdater);
    return () => {
      mqRegular.removeEventListener("change", oppdater);
      mqWide.removeEventListener("change", oppdater);
    };
  }, []);
  return s;
}

function CapsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

function KpiKort({ verdi, label, stor }: { verdi: string; label: string; stor?: boolean }) {
  const mangler = verdi === "mangler";
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: stor ? 20 : 16 }}>
      <div
        style={{
          fontSize: stor ? 34 : 24,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          color: TL.text,
          opacity: mangler || verdi.startsWith("−") ? 0.45 : 1,
        }}
      >
        {verdi}
      </div>
      <div style={{ marginTop: 6 }}>
        <CapsLabel>{label}</CapsLabel>
      </div>
    </div>
  );
}

function Faner({ value, onChange }: { value: Fane; onChange: (f: Fane) => void }) {
  const tabs: { id: Fane; l: string }[] = [
    { id: "felt", l: "Felt" },
    { id: "skill", l: "Skill" },
    { id: "innspill", l: "Innspill" },
    { id: "starter", l: "Starter" },
  ];
  return (
    <div
      role="tablist"
      aria-label="DataGolf-visning"
      style={{
        marginTop: 14,
        background: TL.elev,
        borderRadius: TL.radius.pill,
        padding: 4,
        display: "flex",
        gap: 2,
        maxWidth: 460,
      }}
    >
      {tabs.map((t) => {
        const aktiv = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(t.id)}
            className={PRESS}
            style={{
              flex: 1,
              height: 32,
              borderRadius: TL.radius.pill,
              background: aktiv ? TL.fill : "transparent",
              color: aktiv ? TL.onFill : TL.mute,
              fontSize: 13,
              fontWeight: 600,
              border: 0,
              cursor: "pointer",
            }}
          >
            {t.l}
          </button>
        );
      })}
    </div>
  );
}

function FeltListe({ data }: { data: DataGolfData }) {
  if (data.felt.length === 0) {
    return (
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
          Ingen DataGolf-felt ennå. Broadie-SG og PEI vises ikke her.
        </p>
      </div>
    );
  }
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
      {data.felt.map((r, i) => (
        <div
          key={`${r.plass}-${r.label}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 0",
            borderBottom: i < data.felt.length - 1 ? `1px solid ${TL.hair}` : "none",
          }}
        >
          <span style={{ width: 18, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.plass}</span>
          <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            {r.erDu && (
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: TL.avatar,
                  color: TL.onAvatar,
                  fontSize: 9,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {data.initialer || "DU"}
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{r.label}</span>
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: TL.text,
              opacity: r.verdi < 0 ? 0.45 : 1,
            }}
          >
            {fmtDgTall(r.verdi)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SkillListe({ data }: { data: DataGolfData }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
      {data.skillKategorier.map((k, i) => (
        <div
          key={k.code}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 0",
            borderBottom: i < data.skillKategorier.length - 1 ? `1px solid ${TL.hair}` : "none",
          }}
        >
          <span style={{ width: 48, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{k.code}</span>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: TL.text }}>{k.name}</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: TL.text,
              opacity: k.verdi == null || k.verdi < 0 ? 0.45 : 1,
            }}
          >
            {fmtDgTall(k.verdi)}
          </span>
        </div>
      ))}
    </div>
  );
}

function InnspillBars({ data }: { data: DataGolfData }) {
  if (data.innspill.length === 0) {
    return (
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <CapsLabel>SG per bøtte</CapsLabel>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
          DataGolf per avstandsbøtte mangler for deg. Broadie-SG fra egne runder vises ikke her.
        </p>
      </div>
    );
  }
  const absMax = Math.max(0.5, ...data.innspill.map((b) => Math.abs(b.verdi ?? 0)));
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
      <CapsLabel>SG per bøtte · {data.innspillErTour ? "DataGolf PGA (ikke deg)" : "meter"}</CapsLabel>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: `repeat(${Math.min(6, data.innspill.length)}, 1fr)` }}>
        {data.innspill.map((b) => {
          const v = b.verdi;
          const hoyde = v == null ? 0 : Math.max(3, Math.round((Math.abs(v) / absMax) * 48));
          const neg = v != null && v < 0;
          return (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: TL.text,
                  opacity: v == null || neg ? 0.45 : 1,
                }}
              >
                {fmtDgTall(v)}
              </span>
              <div style={{ position: "relative", width: "100%", height: 104, marginTop: 8 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 52, height: 1, background: TL.hair }} />
                {v != null &&
                  (neg ? (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 26,
                        top: 53,
                        height: hoyde,
                        background: TL.fill,
                        opacity: 0.4,
                        borderRadius: "0 0 4px 4px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 26,
                        bottom: 52,
                        height: hoyde,
                        background: TL.fill,
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  ))}
              </div>
              <span
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: TL.mute,
                }}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: TL.mute }}>
        {data.innspillErTour
          ? "Tour-bøtter fra DataGolf. 0 er ikke feltsnitt. Dine bøtter mangler."
          : "Feltet = 0 i hver bøtte"}
      </div>
      {data.lekkasje && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${TL.hair}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>Tren mot {data.lekkasje.label}</span>
          <span
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: TL.radius.pill,
              background: TL.dim,
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.text,
            }}
          >
            Utkast
          </span>
        </div>
      )}
    </div>
  );
}

function StarterListe({ data }: { data: DataGolfData }) {
  if (data.starter.length === 0) {
    return (
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>Ingen starter registrert.</p>
      </div>
    );
  }
  const neste = data.starter.find((s) => s.kommende);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
        {data.starter.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 0",
              borderBottom: i < data.starter.length - 1 ? `1px solid ${TL.hair}` : "none",
              flexWrap: "wrap",
            }}
          >
            <span style={{ flex: 1, minWidth: 120, fontSize: 15, fontWeight: 600, color: TL.text }}>{s.navn}</span>
            <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{s.dato}</span>
            <span
              style={{
                width: 72,
                textAlign: "right",
                fontSize: 15,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: TL.text,
                opacity: s.sg == null || s.sg < 0 ? 0.45 : 1,
              }}
            >
              {fmtDgTall(s.sg)}
            </span>
            <span style={{ width: 110, textAlign: "right", fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
              {s.feltstyrke == null ? "feltstyrke mangler" : `feltstyrke ${fmtDgTall(s.feltstyrke)}`}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: TL.mute }}>Feltstyrke = snitt skill i startfeltet · 0 = feltsnitt. Kun DataGolf.</div>
      {neste && (
        <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
          <CapsLabel>Neste start</CapsLabel>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>{neste.navn}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {neste.dato} · startfelt ikke publisert
          </div>
        </div>
      )}
    </div>
  );
}

export function DataGolfV2({ data }: DataGolfProps) {
  const storrelse = useSkjermStorrelse();
  const wide = storrelse === "wide";
  const [fane, setFane] = useState<Fane>("felt");

  const kpis = (
    <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr" : "1fr 1fr 1fr", gap: wide ? 12 : 10 }}>
      <KpiKort verdi={fmtDgTall(data.skill)} label="Skill" stor={wide} />
      <KpiKort verdi={fmtDgTall(data.trueSg)} label="True SG" stor={wide} />
      <KpiKort verdi={fmtDgTall(data.rest)} label="Rest" stor={wide} />
    </div>
  );

  const panel =
    fane === "felt" ? (
      <FeltListe data={data} />
    ) : fane === "skill" ? (
      <SkillListe data={data} />
    ) : fane === "innspill" ? (
      <InnspillBars data={data} />
    ) : (
      <StarterListe data={data} />
    );

  return (
    <div data-screen="DG-01" style={{ display: "flex", flexDirection: "column", width: "100%", background: TL.scene }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <CapsLabel>Analyse · mot feltet</CapsLabel>
          <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: TL.text }}>
            DataGolf
          </h1>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 13, fontWeight: 400, color: TL.mute, lineHeight: 1.45, maxWidth: 640 }}>
        {data.feltTekst}
      </div>

      {wide ? (
        <>
          <Faner value={fane} onChange={setFane} />
          <div style={{ marginTop: 20, display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>{panel}</div>
            <div style={{ width: 320, flexShrink: 0 }}>{kpis}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginTop: 16 }}>{kpis}</div>
          <Faner value={fane} onChange={setFane} />
          <div style={{ marginTop: 14 }}>{panel}</div>
        </>
      )}

      <div style={{ marginTop: 10, fontSize: 13, color: TL.mute }}>
        {data.oppdatertLabel ?? "Ingen DataGolf-runder ennå"}
      </div>

      <p style={{ margin: "16px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
        {data.pgaPuttKildeTekst}
        {data.pgaPutt.length > 0
          ? ` ${data.pgaPutt.length} avstander lastet.`
          : " Tabellen er tom — vi gjetter ikke putt-prosent."}
      </p>

      {/* Lisenskrav fra DataGolf — attribusjon på spillerens DataGolf-kort
          (Anders 30.08.2026, datakartleggingens svar 4). */}
      <p style={{ margin: "10px 0 0", fontSize: 12, color: TL.mute }}>
        Powered by{" "}
        <a
          href="https://datagolf.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Data Golf
        </a>
      </p>
    </div>
  );
}
