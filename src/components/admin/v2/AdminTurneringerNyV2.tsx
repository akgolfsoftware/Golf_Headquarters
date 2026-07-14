"use client";

/**
 * AgencyOS v2 — Ny turnering, 5-stegs veiviser (`/admin/tournaments/ny`,
 * AgencyOS Bølge 3.30, 2026-07-14). Port fra `(legacy)/tournaments/ny/
 * page.tsx` + `wizard.tsx` — samme 5 steg (Type → Detaljer → Format →
 * Påmelding → Bekreft), samme validering per steg, samme `createTournament`-
 * server-action-kontrakt (bor i `(legacy)/tournaments/ny/actions.ts`,
 * uendret). Steg-navigasjon: `Veiviser`. Enkeltvalg (type): `ValgKort`.
 * Multi-/enkeltvalg-chips (format/tee/HCP/viktighet): lokal `Pill`, samme
 * idiom som `DrillSkjemaFelter.tsx`.
 */

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, ValgKort, Icon, T, Veiviser, ValideringsChip } from "@/components/v2";
import { Inndata, Velger, TekstOmraade, Bryter } from "@/components/v2/skjema";
import { createTournament } from "@/app/admin/(legacy)/tournaments/ny/actions";

type Course = { id: string; name: string };

type StepKey = 1 | 2 | 3 | 4 | 5;
type TurneringType = "INTERN" | "EKSTERN";
type Format = "STROKE" | "MATCH" | "STABLEFORD" | "SKINS" | "FOURSOME";
type Hcp = "FULL" | "P90" | "P75" | "SCRATCH";
type Prioritet = "MAJOR" | "NORMAL" | "LOCAL";

type State = {
  type: TurneringType;
  name: string;
  startDate: string;
  endDate: string;
  courseId: string;
  manualVenue: string;
  rounds: number;
  description: string;
  format: Format;
  teeOptions: string[];
  hcpAdjust: Hcp;
  hasCut: boolean;
  registrationDeadline: string;
  maxParticipants: number;
  feeKr: number;
  priority: Prioritet;
  sendInvitations: boolean;
};

const INITIAL: State = {
  type: "INTERN",
  name: "",
  startDate: "",
  endDate: "",
  courseId: "",
  manualVenue: "",
  rounds: 2,
  description: "",
  format: "STROKE",
  teeOptions: ["Gul"],
  hcpAdjust: "FULL",
  hasCut: false,
  registrationDeadline: "",
  maxParticipants: 36,
  feeKr: 450,
  priority: "NORMAL",
  sendInvitations: true,
};

const FORMAT_LABELS: Record<Format, string> = {
  STROKE: "Strokeplay",
  MATCH: "Matchplay",
  STABLEFORD: "Stableford",
  SKINS: "Skins",
  FOURSOME: "Foursome",
};

const HCP_LABELS: Record<Hcp, string> = {
  FULL: "Full HCP",
  P90: "90 %",
  P75: "75 %",
  SCRATCH: "Scratch",
};

const PRIO_LABELS: Record<Prioritet, string> = {
  MAJOR: "Major",
  NORMAL: "Normal",
  LOCAL: "Lokal",
};

const TEE_VALG = ["Hvit", "Gul", "Blå", "Rød", "Sort"];
const STEG_NAVN = ["Type", "Detaljer", "Format", "Påmelding", "Bekreft"];

function formatNoDate(s: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

function formatKr(n: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", minimumFractionDigits: 2 }).format(n);
}

function validateStep(step: StepKey, s: State): string | null {
  if (step === 1) {
    if (s.type !== "INTERN" && s.type !== "EKSTERN") return "Velg type";
    return null;
  }
  if (step === 2) {
    if (s.name.trim().length < 2) return "Navn er påkrevd";
    if (!s.startDate) return "Startdato er påkrevd";
    if (s.endDate && s.endDate < s.startDate) return "Sluttdato må være etter startdato";
    if (!s.courseId && !s.manualVenue.trim()) return "Velg bane eller skriv inn manuelt";
    if (s.rounds < 1) return "Antall runder må være minst 1";
    return null;
  }
  if (step === 3) {
    if (s.teeOptions.length === 0) return "Velg minst én tee";
    return null;
  }
  if (step === 4) {
    if (s.maxParticipants < 1) return "Max deltakere må være minst 1";
    if (s.feeKr < 0) return "Pris kan ikke være negativ";
    if (s.registrationDeadline && s.startDate && s.registrationDeadline > s.startDate) return "Påmeldingsfrist må være før startdato";
    return null;
  }
  return null;
}

function Stakk({ children, gap = 20 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>;
}

function Felt({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <Caps size={9}>{label}{required && <span style={{ color: T.down }}> *</span>}</Caps>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function Pill({ aktiv, onClick, children }: { aktiv: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      style={{ appearance: "none", cursor: "pointer", borderRadius: 9999, border: `1px solid ${aktiv ? "transparent" : T.borderS}`, background: aktiv ? T.lime : T.panel2, color: aktiv ? T.onLime : T.fg2, fontFamily: T.ui, fontSize: 12, fontWeight: 600, padding: "7px 14px" }}
    >
      {children}
    </button>
  );
}

function Sum({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <Icon name={icon} size={12} style={{ color: T.mut }} />}
        <Caps size={9}>{label}</Caps>
      </div>
      <div style={{ marginTop: 4, fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{value}</div>
    </div>
  );
}

const gridFelter = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 } as const;

export function AdminTurneringerNyV2({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>(1);
  const [state, setState] = useState<State>(INITIAL);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [visFeil, setVisFeil] = useState(false);

  const stepError = useMemo(() => validateStep(step, state), [step, state]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    for (const k of [1, 2, 3, 4] as StepKey[]) {
      const feil = validateStep(k, state);
      if (feil) {
        setStep(k);
        setVisFeil(true);
        setError(feil);
        return;
      }
    }
    setError(null);
    startTransition(async () => {
      const res = await createTournament({
        type: state.type,
        name: state.name,
        startDate: state.startDate,
        endDate: state.endDate || null,
        courseId: state.courseId || null,
        manualVenue: state.manualVenue || null,
        rounds: state.rounds,
        description: state.description || null,
        format: state.format,
        teeOptions: state.teeOptions,
        hcpAdjust: state.hcpAdjust,
        hasCut: state.hasCut,
        registrationDeadline: state.registrationDeadline || null,
        maxParticipants: state.maxParticipants,
        feeOre: Math.round(state.feeKr * 100),
        priority: state.priority,
        sendInvitations: state.sendInvitations,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/admin/tournaments/${res.tournamentId}`);
    });
  }

  function neste() {
    if (step < 5) {
      const feil = validateStep(step, state);
      if (feil) {
        setVisFeil(true);
        setError(feil);
        return;
      }
      setVisFeil(false);
      setError(null);
      setStep(((step as number) + 1) as StepKey);
    } else {
      submit();
    }
  }

  function tilbake() {
    setVisFeil(false);
    setError(null);
    if (step > 1) setStep(((step as number) - 1) as StepKey);
  }

  function toggleTee(t: string) {
    update("teeOptions", state.teeOptions.includes(t) ? state.teeOptions.filter((x) => x !== t) : [...state.teeOptions, t]);
  }

  const venue = courses.find((c) => c.id === state.courseId)?.name || state.manualVenue || "—";
  const feilTekst = visFeil ? error ?? stepError : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>AgencyOS · Turneringer</Caps>
          <Tittel em="turnering">Opprett en ny</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: 460 }}>
            Multi-stegs veiviser fanger alt vi trenger for startliste, regler og resultatoppfølging.
          </p>
        </div>
        <Link href="/admin/tournaments" style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "6px 14px", textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="x" size={12} />Avbryt
        </Link>
      </div>

      <Kort>
        {step === 1 && (
          <Stakk>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <ValgKort
                tittel="Intern AK-turnering"
                sub="Vi arrangerer selv — AK Golf Cup, klubbmesterskap, treningsmatch."
                valgt={state.type === "INTERN"}
                onClick={() => update("type", "INTERN")}
              />
              <ValgKort
                tittel="Eksternt event"
                sub="Spillere melder seg på en ekstern turnering (NM, Srixon Tour osv.) — vi tracker resultatene."
                valgt={state.type === "EKSTERN"}
                onClick={() => update("type", "EKSTERN")}
              />
            </div>
          </Stakk>
        )}

        {step === 2 && (
          <Stakk>
            <div style={gridFelter}>
              <Felt label="Navn på turnering" required><Inndata label={null} value={state.name} onChange={(v) => update("name", v)} placeholder="F.eks. Larvik Open 2026" /></Felt>
              <Felt label="Antall runder"><Inndata label={null} type="number" mono value={String(state.rounds)} onChange={(v) => update("rounds", Math.max(1, Number(v) || 1))} /></Felt>
              <Felt label="Startdato" required><Inndata label={null} type="date" value={state.startDate} onChange={(v) => update("startDate", v)} /></Felt>
              <Felt label="Sluttdato (valgfri)"><Inndata label={null} type="date" value={state.endDate} onChange={(v) => update("endDate", v)} /></Felt>
              <Felt label="Bane (fra biblioteket)">
                <Velger label={null} value={state.courseId} onChange={(v) => update("courseId", v)} options={[{ value: "", label: "— Ingen / skriv inn manuelt —" }, ...courses.map((c) => ({ value: c.id, label: c.name }))]} />
              </Felt>
              <Felt label="Bane (manuelt)"><Inndata label={null} value={state.manualVenue} onChange={(v) => update("manualVenue", v)} placeholder="F.eks. Larvik GK" /></Felt>
            </div>
            <Felt label="Beskrivelse (valgfri)"><TekstOmraade label={null} value={state.description} onChange={(v) => update("description", v)} rows={4} placeholder="Intern info, regler, premier, briefing-tid…" /></Felt>
          </Stakk>
        )}

        {step === 3 && (
          <Stakk>
            <Felt label="Konkurranse-format">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => <Pill key={f} aktiv={state.format === f} onClick={() => update("format", f)}>{FORMAT_LABELS[f]}</Pill>)}
              </div>
            </Felt>
            <Felt label="Tee (multi-valg)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TEE_VALG.map((t) => <Pill key={t} aktiv={state.teeOptions.includes(t)} onClick={() => toggleTee(t)}>{t}</Pill>)}
              </div>
            </Felt>
            <Felt label="HCP-justering">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(Object.keys(HCP_LABELS) as Hcp[]).map((h) => <Pill key={h} aktiv={state.hcpAdjust === h} onClick={() => update("hcpAdjust", h)}>{HCP_LABELS[h]}</Pill>)}
              </div>
            </Felt>
            <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
              <Bryter label="Cut etter runde 2" sub="Kun de beste spillerne fortsetter til siste runde(r)." checked={state.hasCut} onChange={(v) => update("hasCut", v)} />
            </div>
          </Stakk>
        )}

        {step === 4 && (
          <Stakk>
            <div style={gridFelter}>
              <Felt label="Påmeldingsfrist"><Inndata label={null} type="date" value={state.registrationDeadline} onChange={(v) => update("registrationDeadline", v)} /></Felt>
              <Felt label="Max deltakere"><Inndata label={null} type="number" mono value={String(state.maxParticipants)} onChange={(v) => update("maxParticipants", Math.max(1, Number(v) || 1))} /></Felt>
              <Felt label="Pris per deltaker (NOK)"><Inndata label={null} type="number" mono value={String(state.feeKr)} onChange={(v) => update("feeKr", Math.max(0, Number(v) || 0))} /></Felt>
              <Felt label="Viktighet">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(Object.keys(PRIO_LABELS) as Prioritet[]).map((p) => <Pill key={p} aktiv={state.priority === p} onClick={() => update("priority", p)}>{PRIO_LABELS[p]}</Pill>)}
                </div>
              </Felt>
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
              <Bryter label="Send invitasjon når turneringen opprettes" sub="Spillere som inviteres senere får automatisk e-post og in-app push." checked={state.sendInvitations} onChange={(v) => update("sendInvitations", v)} />
            </div>
          </Stakk>
        )}

        {step === 5 && (
          <Stakk>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <Sum label="Type" value={state.type === "INTERN" ? "Intern AK" : "Eksternt event"} icon="trophy" />
              <Sum label="Navn" value={state.name || "—"} icon="flag" />
              <Sum label="Dato" value={state.endDate && state.endDate !== state.startDate ? `${formatNoDate(state.startDate)} – ${formatNoDate(state.endDate)}` : formatNoDate(state.startDate)} icon="calendar" />
              <Sum label="Bane" value={venue} icon="map-pin" />
              <Sum label="Format" value={`${FORMAT_LABELS[state.format]} · ${state.rounds} runde${state.rounds === 1 ? "" : "r"}`} icon="flag" />
              <Sum label="Tee · HCP" value={`${state.teeOptions.join(", ") || "—"} · ${HCP_LABELS[state.hcpAdjust]}`} />
              <Sum label="Påmeldingsfrist" value={formatNoDate(state.registrationDeadline)} icon="calendar" />
              <Sum label="Kapasitet · pris" value={`${state.maxParticipants} plasser · ${formatKr(state.feeKr)}`} icon="users" />
              <Sum label="Viktighet" value={PRIO_LABELS[state.priority]} />
              <Sum label="Cut" value={state.hasCut ? "Ja, etter runde 2" : "Nei"} />
            </div>
            {state.description && (
              <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
                <Caps size={9}>Beskrivelse</Caps>
                <p style={{ marginTop: 8, whiteSpace: "pre-line", fontFamily: T.ui, fontSize: 13, color: T.fg }}>{state.description}</p>
              </div>
            )}
            <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
              <Bryter label="Send invitasjon nå" sub="Inviterte spillere får varsel med en gang turneringen er opprettet." checked={state.sendInvitations} onChange={(v) => update("sendInvitations", v)} />
            </div>
          </Stakk>
        )}
      </Kort>

      {feilTekst && <ValideringsChip tone="advarsel" tekst={feilTekst} />}

      <Kort pad="16px 20px">
        <Veiviser
          steg={STEG_NAVN}
          aktiv={step - 1}
          onTilbake={tilbake}
          onNeste={neste}
          nesteTekst="Neste"
          tilbakeTekst="Forrige"
          sisteTekst={pending ? "Oppretter…" : "Opprett turnering"}
        />
      </Kort>
    </div>
  );
}
