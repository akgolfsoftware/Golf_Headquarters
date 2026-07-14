"use client";

/**
 * Ny turnering — v2 5-stegs-veiviser. Logikk/validering/payload bevart 1:1
 * fra legacy-wizarden (src/app/admin/(legacy)/tournaments/ny/wizard.tsx) —
 * kun visuelt portert til v2-biblioteket (Veiviser/ValgKort/Inndata/
 * RadioGruppe/Velger). Server-actionen zod-validerer uansett på nytt.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Kort, T, Veiviser, Inndata, Velger, TekstOmraade, RadioGruppe, ValgKort, Avkryssing } from "@/components/v2";
import { createTournament } from "@/app/admin/tournaments/ny/actions";

type Course = { id: string; name: string };

type StepKey = 0 | 1 | 2 | 3 | 4;
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

const FORMAT_OPTS: Format[] = ["STROKE", "MATCH", "STABLEFORD", "SKINS", "FOURSOME"];
const FORMAT_LABELS: Record<Format, string> = {
  STROKE: "Strokeplay",
  MATCH: "Matchplay",
  STABLEFORD: "Stableford",
  SKINS: "Skins",
  FOURSOME: "Foursome",
};
const HCP_OPTS: Hcp[] = ["FULL", "P90", "P75", "SCRATCH"];
const HCP_LABELS: Record<Hcp, string> = { FULL: "Full HCP", P90: "90 %", P75: "75 %", SCRATCH: "Scratch" };
const PRIO_LABELS: Record<Prioritet, string> = { MAJOR: "Major", NORMAL: "Normal", LOCAL: "Lokal" };
const TEE_VALG = ["Hvit", "Gul", "Blå", "Rød", "Sort"];
const STEPS = ["Type", "Detaljer", "Format", "Påmelding", "Bekreft"];

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
    if (s.name.trim().length < 2) return "Navn er påkrevd";
    if (!s.startDate) return "Startdato er påkrevd";
    if (s.endDate && s.endDate < s.startDate) return "Sluttdato må være etter startdato";
    if (!s.courseId && !s.manualVenue.trim()) return "Velg bane eller skriv inn manuelt";
    if (s.rounds < 1) return "Antall runder må være minst 1";
    return null;
  }
  if (step === 2) {
    if (s.teeOptions.length === 0) return "Velg minst én tee";
    return null;
  }
  if (step === 3) {
    if (s.maxParticipants < 1) return "Max deltakere må være minst 1";
    if (s.feeKr < 0) return "Pris kan ikke være negativ";
    if (s.registrationDeadline && s.startDate && s.registrationDeadline > s.startDate) {
      return "Påmeldingsfrist må være før startdato";
    }
    return null;
  }
  return null;
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Caps size={9} style={{ marginBottom: 7 }}>{label}</Caps>
      {children}
    </div>
  );
}

export function TurneringWizardV2({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>(0);
  const [state, setState] = useState<State>(INITIAL);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const stepError = useMemo(() => validateStep(step, state), [step, state]);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function neste() {
    const feil = validateStep(step, state);
    if (feil) {
      setError(feil);
      return;
    }
    setError(null);
    if (step < 4) setStep(((step as number) + 1) as StepKey);
  }
  function tilbake() {
    setError(null);
    if (step > 0) setStep(((step as number) - 1) as StepKey);
  }

  function submit() {
    for (const k of [1, 2, 3] as StepKey[]) {
      const feil = validateStep(k, state);
      if (feil) {
        setStep(k);
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

  function toggleTee(t: string) {
    update("teeOptions", state.teeOptions.includes(t) ? state.teeOptions.filter((x) => x !== t) : [...state.teeOptions, t]);
  }

  const venue = courses.find((c) => c.id === state.courseId)?.name || state.manualVenue || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 640, margin: "0 auto" }}>
      <Veiviser steg={STEPS} aktiv={step} onTilbake={tilbake} onNeste={step === 4 ? submit : neste} sisteTekst={pending ? "Oppretter…" : "Opprett turnering"} />

      <Kort pad="22px 22px">
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, letterSpacing: "-0.02em" }}>Hva slags turnering?</div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "6px 0 0" }}>
                Bestem om dette er en intern AK-turnering eller et eksternt event spillerne påmeldes til.
              </p>
            </div>
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
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StegTittel title="Detaljer" sub="Navn, datoer og hvor turneringen spilles." />
            <Felt label="Navn på turnering">
              <Inndata label={null} value={state.name} onChange={(v) => update("name", v)} placeholder="F.eks. Larvik Open 2026" />
            </Felt>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
              <Felt label="Startdato">
                <Inndata label={null} type="date" value={state.startDate} onChange={(v) => update("startDate", v)} />
              </Felt>
              <Felt label="Sluttdato (valgfri)">
                <Inndata label={null} type="date" value={state.endDate} onChange={(v) => update("endDate", v)} />
              </Felt>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
              <Felt label="Antall runder">
                <Inndata label={null} type="number" mono value={String(state.rounds)} onChange={(v) => update("rounds", Math.max(1, Number(v) || 1))} />
              </Felt>
              <Felt label="Bane (manuelt, hvis ikke i lista)">
                <Inndata label={null} value={state.manualVenue} onChange={(v) => update("manualVenue", v)} placeholder="F.eks. Larvik GK" />
              </Felt>
            </div>
            {courses.length > 0 && (
              <Felt label="Bane (fra biblioteket)">
                <Velger
                  label={null}
                  options={[{ value: "", label: "— Ingen / skriv inn manuelt —" }, ...courses.map((c) => ({ value: c.id, label: c.name }))]}
                  value={state.courseId}
                  onChange={(v) => update("courseId", v)}
                />
              </Felt>
            )}
            <Felt label="Beskrivelse (valgfri)">
              <TekstOmraade label={null} value={state.description} onChange={(v) => update("description", v)} rows={3} placeholder="Intern info, regler, premier, briefing-tid…" />
            </Felt>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <StegTittel title="Spillformat" sub="Hvordan turneringen avgjøres. Tee og HCP-justering brukes for å bygge startliste senere." />
            <RadioGruppe
              label="Konkurranse-format"
              options={FORMAT_OPTS.map((f) => ({ v: f, l: FORMAT_LABELS[f] }))}
              value={state.format}
              onChange={(v) => update("format", v as Format)}
            />
            <Felt label="Tee (multi-select)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TEE_VALG.map((t) => {
                  const on = state.teeOptions.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTee(t)}
                      className="v2-press v2-focus"
                      style={{ appearance: "none", cursor: "pointer", borderRadius: 9999, padding: "8px 15px", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, background: on ? T.lime : T.panel2, border: `1px solid ${on ? "transparent" : T.borderS}`, color: on ? T.onLime : T.fg }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Felt>
            <RadioGruppe
              label="HCP-justering"
              options={HCP_OPTS.map((h) => ({ v: h, l: HCP_LABELS[h] }))}
              value={state.hcpAdjust}
              onChange={(v) => update("hcpAdjust", v as Hcp)}
            />
            <Avkryssing label="Cut etter runde 2 — kun de beste fortsetter til siste runde(r)" checked={state.hasCut} onChange={(v) => update("hasCut", v)} />
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StegTittel title="Påmelding" sub="Frist, kapasitet og pris. Du kan invitere spillere fra stallen senere." />
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
              <Felt label="Påmeldingsfrist">
                <Inndata label={null} type="date" value={state.registrationDeadline} onChange={(v) => update("registrationDeadline", v)} />
              </Felt>
              <Felt label="Max deltakere">
                <Inndata label={null} type="number" mono value={String(state.maxParticipants)} onChange={(v) => update("maxParticipants", Math.max(1, Number(v) || 1))} />
              </Felt>
              <Felt label="Pris per deltaker (NOK)">
                <Inndata label={null} type="number" mono value={String(state.feeKr)} onChange={(v) => update("feeKr", Math.max(0, Number(v) || 0))} />
              </Felt>
            </div>
            <RadioGruppe
              label="Viktighet"
              options={(Object.keys(PRIO_LABELS) as Prioritet[]).map((p) => ({ v: p, l: PRIO_LABELS[p] }))}
              value={state.priority}
              onChange={(v) => update("priority", v as Prioritet)}
            />
            <Avkryssing label="Send invitasjon når turneringen opprettes" checked={state.sendInvitations} onChange={(v) => update("sendInvitations", v)} />
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <StegTittel title="Bekreft og opprett" sub="Sjekk at alt stemmer. Du kan endre detaljer senere fra turnerings-siden." />
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
              <Sum label="Type" value={state.type === "INTERN" ? "Intern AK" : "Eksternt event"} />
              <Sum label="Navn" value={state.name || "—"} />
              <Sum label="Dato" value={state.endDate && state.endDate !== state.startDate ? `${formatNoDate(state.startDate)} – ${formatNoDate(state.endDate)}` : formatNoDate(state.startDate)} />
              <Sum label="Bane" value={venue} />
              <Sum label="Format" value={`${FORMAT_LABELS[state.format]} · ${state.rounds} runde${state.rounds === 1 ? "" : "r"}`} />
              <Sum label="Tee · HCP" value={`${state.teeOptions.join(", ") || "—"} · ${HCP_LABELS[state.hcpAdjust]}`} />
              <Sum label="Påmeldingsfrist" value={formatNoDate(state.registrationDeadline)} />
              <Sum label="Kapasitet · pris" value={`${state.maxParticipants} plasser · ${formatKr(state.feeKr)}`} />
              <Sum label="Viktighet" value={PRIO_LABELS[state.priority]} />
              <Sum label="Cut" value={state.hasCut ? "Ja, etter runde 2" : "Nei"} />
            </div>
            {state.description && (
              <div style={{ borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}`, padding: 14 }}>
                <Caps size={9}>Beskrivelse</Caps>
                <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, whiteSpace: "pre-line", margin: "8px 0 0" }}>{state.description}</p>
              </div>
            )}
            <Avkryssing label="Send invitasjon nå — inviterte spillere får varsel med en gang" checked={state.sendInvitations} onChange={(v) => update("sendInvitations", v)} />
          </div>
        )}

        {(error || stepError) && step !== 4 && error && (
          <div role="alert" style={{ marginTop: 16, borderRadius: 11, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, padding: "10px 13px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
            {error}
          </div>
        )}
        {error && step === 4 && (
          <div role="alert" style={{ marginTop: 16, borderRadius: 11, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${T.down} 35%, transparent)`, padding: "10px 13px", fontFamily: T.ui, fontSize: 12.5, color: T.down }}>
            {error}
          </div>
        )}
      </Kort>
    </div>
  );
}

function StegTittel({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, color: T.fg, letterSpacing: "-0.02em" }}>{title}</div>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "6px 0 0" }}>{sub}</p>
    </div>
  );
}

function Sum({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 11, background: T.panel2, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
      <Caps size={9}>{label}</Caps>
      <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, marginTop: 5 }}>{value}</div>
    </div>
  );
}
