"use client";

/**
 * PlayerHQ Meg · Helse — v2 Presis + B-pakke (status først, logg = én grønn CTA).
 */

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  Knapp,
  Icon,
  Inndata,
  TekstOmraade,
} from "@/components/v2";

/* ── Datakontrakt (serialiserbar — datoer ferdig-formatert på server) ─── */

export type MegHelseData = {
  /** FYS-score: stall-relativ testbatteri-form (Anders' formel 2026-06-22). */
  fys: { harTester: boolean; score: number | null; antallTester: number };
  /** Siste HealthEntry (nyeste av siste 14 dager), eller null. */
  siste: {
    restingHr: number | null;
    hrv: number | null;
    sleepHours: number | null;
  } | null;
  /** Ekte søvn-snitt siste 7 døgn + antall logger. */
  sovn: { snitt: number | null; antall: number };
  /** Belastning: siste uke vs 4-ukers snitt. */
  belastning: { harData: boolean; prosentAvNormalt: number | null };
  /** Skade & status — ferdig-formaterte datoer. */
  skade: {
    /** «12. mar» hvis aktiv skade, ellers null. */
    aktivSiden: string | null;
    /** Antall tidligere skadeperioder. */
    tidligere: number;
    /** «12. mar» for siste logg, ellers null. */
    sistLogget: string | null;
  };
  /** Startverdier til logg-skjemaet (siste logg + dagens dato). */
  initial: {
    date: string;
    restingHr: number | null;
    hrv: number | null;
    sleepHours: number | null;
    weightKg: number | null;
    notes: string | null;
  };
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

function formatTimer(t: number): string {
  return t.toFixed(1).replace(".", ",");
}

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

/* ── Lokale byggeklosser (kun T.* + v2-komponenter) ────────────────── */

/** Rundt ikon-emblem foran en rad (idiom fra InnstillingerV2/SeksjonIkon). */
function IkonEmblem({ name, farge, tint }: { name: string; farge?: string; tint?: string }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: tint || T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={14} style={{ color: farge || T.fg2 }} />
    </span>
  );
}

/** Høyrestilt mono-verdi i en rad (tabular-nums; «—» i mut når data mangler). */
function RadVerdi({ children, tom }: { children: React.ReactNode; tom?: boolean }) {
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 14,
        fontWeight: 700,
        color: tom ? T.mut : T.fg,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        flex: "none",
      }}
    >
      {children}
    </span>
  );
}

/** KPI-flis: liten label + stort mono-tall (+ enhet) + undertekst. */
function HelseKpi({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  const tom = value === "—";
  return (
    <Kort pad="16px">
      <Caps size={9}>{label}</Caps>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 12 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: tom ? T.mut : T.fg,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
        {unit && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>{unit}</span>}
      </div>
      <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, display: "block", marginTop: 9, lineHeight: 1.35 }}>
        {sub}
      </span>
    </Kort>
  );
}

/* ── Logg-skjema (v2) — samme lagre-flyt (lagreHelseEntry) som før ──── */

type LagreFn = (input: {
  date: string;
  restingHr: number | null;
  hrv: number | null;
  sleepHours: number | null;
  weightKg: number | null;
  notes: string | null;
}) => Promise<void>;

function HelseLoggForm({
  initial,
  lagre,
}: {
  initial: MegHelseData["initial"];
  lagre: LagreFn;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(initial.date);
  const [restingHr, setRestingHr] = useState(initial.restingHr != null ? String(initial.restingHr) : "");
  const [hrv, setHrv] = useState(initial.hrv != null ? String(initial.hrv) : "");
  const [sleep, setSleep] = useState(initial.sleepHours != null ? String(initial.sleepHours) : "");
  const [weight, setWeight] = useState(initial.weightKg != null ? String(initial.weightKg) : "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function submit() {
    setFeil(null);
    startTransition(async () => {
      try {
        const norm = (raw: string) => raw.replace(",", ".").trim();
        await lagre({
          date,
          restingHr: restingHr ? Number(norm(restingHr)) : null,
          hrv: hrv ? Number(norm(hrv)) : null,
          sleepHours: sleep ? Number(norm(sleep)) : null,
          weightKg: weight ? Number(norm(weight)) : null,
          notes: notes.trim() ? notes.trim() : null,
        });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 1500);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  if (!open) {
    return (
      <Knapp icon="plus" full onClick={() => setOpen(true)}>
        Logg søvn / status
      </Knapp>
    );
  }

  return (
    <Kort eyebrow="Manuelt — én logg per dato">
      <div style={{ display: "grid", gap: 14 }} className="sm:grid-cols-2">
        <Inndata label="Dato" type="date" value={date} onChange={setDate} />
        <Inndata label="Hvilepuls (bpm)" type="number" mono value={restingHr} placeholder="f.eks. 52" onChange={setRestingHr} />
        <Inndata label="HRV (ms, RMSSD)" type="number" mono value={hrv} placeholder="f.eks. 65" onChange={setHrv} />
        <Inndata label="Søvn (timer i går natt)" type="number" mono value={sleep} placeholder="f.eks. 7,5" onChange={setSleep} />
        <Inndata label="Vekt (kg)" type="number" mono value={weight} placeholder="f.eks. 78,4" onChange={setWeight} />
      </div>
      <div style={{ marginTop: 14 }}>
        <TekstOmraade label="Notater (valgfritt)" value={notes} rows={2} placeholder="Hvordan føler du deg i dag?" onChange={setNotes} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        <Knapp icon="check" full disabled={pending} onClick={submit}>
          {pending ? "Lagrer…" : "Lagre"}
        </Knapp>
        <Knapp ghost full disabled={pending} onClick={() => setOpen(false)}>
          Lukk
        </Knapp>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        {lagret && (
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.lime }}>
            Lagret
          </span>
        )}
        {feil && (
          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.down }}>
            {feil}
          </span>
        )}
        </div>
      </div>
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegHelseV2({ data, lagre }: { data: MegHelseData; lagre: LagreFn }) {
  const mobile = useMobile();
  const { fys, siste, sovn, belastning, skade, initial } = data;

  const fysValue = fys.harTester && fys.score != null ? String(fys.score) : "—";
  const hvilepuls = siste?.restingHr != null ? String(siste.restingHr) : "—";
  const sovnKpi = siste?.sleepHours != null ? formatTimer(siste.sleepHours) : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps style={{ marginBottom: 10 }}>Meg · Helse</Caps>
        <Tittel mobile={mobile} em="status">
          Helse &amp;
        </Tittel>
      </div>

      {/* 3-KPI-grid */}
      <div className="grid grid-cols-3" style={{ gap: 12 }}>
        <HelseKpi
          label="FYS-score"
          value={fysValue}
          sub={fys.harTester ? `${fys.antallTester}/5 tester` : "Ingen FYS-tester"}
        />
        <HelseKpi label="Hvilepuls" value={hvilepuls} unit={hvilepuls !== "—" ? "bpm" : undefined} sub="Siste logg" />
        <HelseKpi label="Søvn" value={sovnKpi} unit={sovnKpi !== "—" ? "t" : undefined} sub="I går natt" />
      </div>

      {/* Denne uka */}
      <Kort eyebrow="Denne uka">
        <Rad
          leading={<IkonEmblem name="moon" />}
          title="Søvn"
          sub={sovn.snitt != null ? `Snitt siste 7 døgn · ${sovn.antall} logger` : "Ingen søvn-logger siste 7 døgn"}
          trailing={
            <RadVerdi tom={sovn.snitt == null}>
              {sovn.snitt != null ? `${formatTimer(sovn.snitt)} t` : "—"}
            </RadVerdi>
          }
        />
        <Rad
          leading={<IkonEmblem name="activity" />}
          title="Belastning"
          sub={
            belastning.harData
              ? "Siste uke vs 4-ukers snitt (trening + runder)"
              : "For lite trenings-historikk siste 4 uker"
          }
          trailing={
            <RadVerdi tom={belastning.prosentAvNormalt == null}>
              {belastning.prosentAvNormalt != null ? `${belastning.prosentAvNormalt} %` : "—"}
            </RadVerdi>
          }
        />
        <Rad
          last
          leading={<IkonEmblem name="battery-medium" />}
          title="HRV"
          sub={siste?.hrv != null ? "Restitusjon (RMSSD, ms)" : "Restitusjon · logg HRV i skjemaet"}
          trailing={
            <RadVerdi tom={siste?.hrv == null}>{siste?.hrv != null ? `${siste.hrv} ms` : "—"}</RadVerdi>
          }
        />
      </Kort>

      {/* Skade & status */}
      <Kort eyebrow="Skade & status">
        {skade.aktivSiden ? (
          <Rad
            leading={<IkonEmblem name="stethoscope" farge={T.warn} tint={`color-mix(in srgb, ${T.warn} 12%, transparent)`} />}
            title="Aktiv skade"
            sub={`Siden ${skade.aktivSiden}`}
            trailing={<StatusPill tone="warn">Aktiv</StatusPill>}
          />
        ) : (
          <Rad
            leading={<IkonEmblem name="check-circle" farge={T.up} tint={`color-mix(in srgb, ${T.up} 12%, transparent)`} />}
            title="Ingen aktive skader"
            sub={skade.sistLogget ? `Sist logget ${skade.sistLogget}` : "Ingen logger ennå"}
            trailing={<StatusPill tone="up">Frisk</StatusPill>}
          />
        )}
        {skade.tidligere > 0 && (
          <Rad
            leading={<IkonEmblem name="stethoscope" />}
            title="Skadehistorikk"
            sub="Tidligere skadeperioder"
            trailing={<RadVerdi>{skade.tidligere}</RadVerdi>}
          />
        )}
        <Link
          href="/portal/meg/helse/symptom/ny"
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <Rad last leading={<IkonEmblem name="plus" farge={T.lime} />} title="Registrer symptom" sub="Kroppskart, intensitet og triggere" />
        </Link>
      </Kort>

      {/* Forklaring (accent-kort, lime venstrekant) */}
      <Kort style={{ borderLeft: `3px solid ${T.lime}` }}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: T.fg, fontWeight: 600 }}>FYS-score</strong> er din samlede testbatteri-form
          (0–100, relativt til stallen). <strong style={{ color: T.fg, fontWeight: 600 }}>Belastning</strong> viser
          siste ukes trening + runder som prosent av ditt eget 4-ukers snitt (100 % = som vanlig).{" "}
          <strong style={{ color: T.fg, fontWeight: 600 }}>HRV</strong> (RMSSD i ms) logger du selv ved siden av
          hvilepuls. En wearable-sync kan fylle samme felt senere.
        </p>
      </Kort>

      {/* Logg søvn / status */}
      <HelseLoggForm initial={initial} lagre={lagre} />
    </div>
  );
}
