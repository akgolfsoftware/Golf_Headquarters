"use client";

/**
 * AG-17 Turneringer › Ny turnering i nytt design — /admin/tournaments/ny.
 * Erstatter TurneringWizardV2. Samme fem steg, samme validering og samme
 * payload til createTournament (server-handlingen zod-validerer på nytt).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Nokkelverdier, Seksjon, Varsel } from "@/components/admin/agencyos-ny/ny";
import { createTournament } from "@/app/admin/tournaments/ny/actions";

type Course = { id: string; name: string };
type Steg = 0 | 1 | 2 | 3 | 4;
type TurneringType = "INTERN" | "EKSTERN";
type Format = "STROKE" | "MATCH" | "STABLEFORD" | "SKINS" | "FOURSOME";
type Hcp = "FULL" | "P90" | "P75" | "SCRATCH";
type Prioritet = "MAJOR" | "NORMAL" | "LOCAL";

type State = {
  type: TurneringType; name: string; startDate: string; endDate: string; courseId: string; manualVenue: string;
  rounds: number; description: string; format: Format; teeOptions: string[]; hcpAdjust: Hcp; hasCut: boolean;
  registrationDeadline: string; maxParticipants: number; feeKr: number; priority: Prioritet; sendInvitations: boolean;
};

const START: State = {
  type: "INTERN", name: "", startDate: "", endDate: "", courseId: "", manualVenue: "", rounds: 2, description: "",
  format: "STROKE", teeOptions: ["Gul"], hcpAdjust: "FULL", hasCut: false, registrationDeadline: "",
  maxParticipants: 36, feeKr: 450, priority: "NORMAL", sendInvitations: true,
};

const FORMAT: Record<Format, string> = { STROKE: "Strokeplay", MATCH: "Matchplay", STABLEFORD: "Stableford", SKINS: "Skins", FOURSOME: "Foursome" };
const HCP: Record<Hcp, string> = { FULL: "Full HCP", P90: "90 %", P75: "75 %", SCRATCH: "Scratch" };
const PRIO: Record<Prioritet, string> = { MAJOR: "Major", NORMAL: "Normal", LOCAL: "Lokal" };
const TEE = ["Hvit", "Gul", "Blå", "Rød", "Sort"];
const STEG = ["Type", "Detaljer", "Format", "Påmelding", "Bekreft"] as const;
const RAD = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } as const;
const VALG = { width: 20, height: 20, accentColor: "var(--graphite-900)" } as const;

const dato = (s: string) => {
  if (!s) return "—";
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};
const kr = (n: number) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

function valider(steg: Steg, s: State): string | null {
  if (steg === 1) {
    if (s.name.trim().length < 2) return "Navnet må fylles inn.";
    if (!s.startDate) return "Startdato må fylles inn.";
    if (s.endDate && s.endDate < s.startDate) return "Sluttdato må være etter startdato.";
    if (!s.courseId && !s.manualVenue.trim()) return "Velg bane eller skriv den inn.";
    if (s.rounds < 1) return "Antall runder må være minst 1.";
  }
  if (steg === 2 && s.teeOptions.length === 0) return "Velg minst én tee.";
  if (steg === 3) {
    if (s.maxParticipants < 1) return "Maks deltakere må være minst 1.";
    if (s.feeKr < 0) return "Prisen kan ikke være negativ.";
    if (s.registrationDeadline && s.startDate && s.registrationDeadline > s.startDate) return "Påmeldingsfristen må være før startdato.";
  }
  return null;
}

function Radio<T extends string>({ navn, verdier, etiketter, verdi, onVelg }: { navn: string; verdier: readonly T[]; etiketter: Record<T, string>; verdi: T; onVelg: (v: T) => void }) {
  return (
    <div className="valg" role="group" aria-label={navn}>
      {verdier.map((v) => <button key={v} type="button" aria-pressed={verdi === v} onClick={() => onVelg(v)}>{etiketter[v]}</button>)}
    </div>
  );
}

export function AG17TurneringNy({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [steg, setSteg] = useState<Steg>(0);
  const [s, setS] = useState<State>(START);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sett = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));

  const neste = () => {
    const f = valider(steg, s);
    if (f) return setFeil(f);
    setFeil(null);
    if (steg < 4) setSteg((steg + 1) as Steg);
  };
  const tilbake = () => { setFeil(null); if (steg > 0) setSteg((steg - 1) as Steg); };

  const opprett = () => {
    for (const k of [1, 2, 3] as Steg[]) {
      const f = valider(k, s);
      if (f) { setSteg(k); setFeil(f); return; }
    }
    setFeil(null);
    start(async () => {
      const res = await createTournament({
        type: s.type, name: s.name, startDate: s.startDate, endDate: s.endDate || null, courseId: s.courseId || null,
        manualVenue: s.manualVenue || null, rounds: s.rounds, description: s.description || null, format: s.format,
        teeOptions: s.teeOptions, hcpAdjust: s.hcpAdjust, hasCut: s.hasCut, registrationDeadline: s.registrationDeadline || null,
        maxParticipants: s.maxParticipants, feeOre: Math.round(s.feeKr * 100), priority: s.priority, sendInvitations: s.sendInvitations,
      });
      if (!res.ok) return setFeil(res.error);
      router.push(`/admin/tournaments/${res.tournamentId}`);
    });
  };

  const bane = courses.find((c) => c.id === s.courseId)?.name || s.manualVenue || "—";
  const veksleTee = (t: string) => sett("teeOptions", s.teeOptions.includes(t) ? s.teeOptions.filter((x) => x !== t) : [...s.teeOptions, t]);
  const Invitasjon = <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, cursor: "pointer" }}>
    <input type="checkbox" checked={s.sendInvitations} onChange={(e) => sett("sendInvitations", e.target.checked)} style={VALG} />
    <span>Send invitasjon når turneringen opprettes</span></label>;

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <nav className="valg" aria-label="Steg">
        {STEG.map((n, i) => <button key={n} type="button" aria-pressed={steg === i} disabled={i > steg} onClick={() => { setFeil(null); setSteg(i as Steg); }}>{i + 1}. {n}</button>)}
      </nav>

      <div className="kort" style={{ display: "grid", gap: 16 }}>
        {steg === 0 && (
          <Seksjon tittel="Hva slags turnering?">
            <div className="liste" role="radiogroup" aria-label="Type">
              {([["INTERN", "Intern AK-turnering", "Vi arrangerer selv: AK Golf Cup, klubbmesterskap, treningsmatch."], ["EKSTERN", "Ekstern turnering", "Spillerne melder seg på en ekstern turnering (NM, Srixon Tour). Vi fører resultatene."]] as const).map(([v, t, sub]) => (
                <label key={v} style={{ cursor: "pointer" }}>
                  <input type="radio" name="type" checked={s.type === v} onChange={() => sett("type", v)} style={VALG} />
                  <span><b>{t}</b><span className="kilde">{sub}</span></span><span />
                </label>
              ))}
            </div>
          </Seksjon>
        )}

        {steg === 1 && <>
          <label className="felt"><span className="etikett">Navn på turneringen</span><input value={s.name} onChange={(e) => sett("name", e.target.value)} placeholder="Larvik Open 2026" /></label>
          <div style={RAD}>
            <label className="felt"><span className="etikett">Startdato</span><input type="date" value={s.startDate} onChange={(e) => sett("startDate", e.target.value)} /></label>
            <label className="felt"><span className="etikett">Sluttdato (valgfritt)</span><input type="date" value={s.endDate} onChange={(e) => sett("endDate", e.target.value)} /></label>
            <label className="felt"><span className="etikett">Antall runder</span><input type="number" inputMode="numeric" min={1} value={s.rounds} onChange={(e) => sett("rounds", Math.max(1, Number(e.target.value) || 1))} /></label>
          </div>
          <div style={RAD}>
            {courses.length > 0 && <label className="felt"><span className="etikett">Bane fra biblioteket</span>
              <select value={s.courseId} onChange={(e) => sett("courseId", e.target.value)}>
                <option value="">Ingen, skriv inn selv</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></label>}
            <label className="felt"><span className="etikett">Bane (hvis den ikke er i lista)</span><input value={s.manualVenue} onChange={(e) => sett("manualVenue", e.target.value)} placeholder="Larvik GK" /></label>
          </div>
          <label className="felt"><span className="etikett">Beskrivelse (valgfritt)</span>
            <textarea rows={3} value={s.description} onChange={(e) => sett("description", e.target.value)} placeholder="Regler, premier, oppmøtetid" style={{ resize: "vertical" }} /></label>
        </>}

        {steg === 2 && <>
          <Seksjon tittel="Spillform"><Radio navn="Spillform" verdier={Object.keys(FORMAT) as Format[]} etiketter={FORMAT} verdi={s.format} onVelg={(v) => sett("format", v)} /></Seksjon>
          <Seksjon tittel="Tee" kilde="Velg én eller flere">
            <div className="chips" role="group" aria-label="Tee">
              {TEE.map((t) => <button key={t} type="button" aria-pressed={s.teeOptions.includes(t)} onClick={() => veksleTee(t)}>{t}</button>)}
            </div>
          </Seksjon>
          <Seksjon tittel="HCP-justering"><Radio navn="HCP-justering" verdier={Object.keys(HCP) as Hcp[]} etiketter={HCP} verdi={s.hcpAdjust} onVelg={(v) => sett("hcpAdjust", v)} /></Seksjon>
          <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, cursor: "pointer" }}>
            <input type="checkbox" checked={s.hasCut} onChange={(e) => sett("hasCut", e.target.checked)} style={VALG} />
            <span>Cut etter runde 2. Bare de beste spiller siste runde.</span></label>
        </>}

        {steg === 3 && <>
          <div style={RAD}>
            <label className="felt"><span className="etikett">Påmeldingsfrist</span><input type="date" value={s.registrationDeadline} onChange={(e) => sett("registrationDeadline", e.target.value)} /></label>
            <label className="felt"><span className="etikett">Maks deltakere</span><input type="number" inputMode="numeric" min={1} value={s.maxParticipants} onChange={(e) => sett("maxParticipants", Math.max(1, Number(e.target.value) || 1))} /></label>
            <label className="felt"><span className="etikett">Pris per deltaker (kr)</span><input type="number" inputMode="numeric" min={0} value={s.feeKr} onChange={(e) => sett("feeKr", Math.max(0, Number(e.target.value) || 0))} /></label>
          </div>
          <Seksjon tittel="Viktighet"><Radio navn="Viktighet" verdier={Object.keys(PRIO) as Prioritet[]} etiketter={PRIO} verdi={s.priority} onVelg={(v) => sett("priority", v)} /></Seksjon>
          {Invitasjon}
        </>}

        {steg === 4 && <>
          <Seksjon tittel="Sjekk og opprett">
            <Nokkelverdier rader={[
              ["Type", s.type === "INTERN" ? "Intern AK-turnering" : "Ekstern turnering"],
              ["Navn", s.name || "—"],
              ["Dato", s.endDate && s.endDate !== s.startDate ? `${dato(s.startDate)} – ${dato(s.endDate)}` : dato(s.startDate)],
              ["Bane", bane],
              ["Spillform", `${FORMAT[s.format]} · ${s.rounds} ${s.rounds === 1 ? "runde" : "runder"}`],
              ["Tee · HCP", `${s.teeOptions.join(", ") || "—"} · ${HCP[s.hcpAdjust]}`],
              ["Påmeldingsfrist", dato(s.registrationDeadline)],
              ["Plasser · pris", `${s.maxParticipants} · ${kr(s.feeKr)}`],
              ["Viktighet", PRIO[s.priority]],
              ["Cut", s.hasCut ? "Ja, etter runde 2" : "Nei"],
            ]} />
          </Seksjon>
          {s.description && <div className="kort dempet"><b className="undertittel">Beskrivelse</b><p className="forklar" style={{ whiteSpace: "pre-line" }}>{s.description}</p></div>}
          {Invitasjon}
        </>}
      </div>

      {feil && <Varsel tone="advarsel" tittel={steg === 4 ? "Ikke opprettet" : "Kan ikke gå videre"}>{feil}</Varsel>}

      <div className="knapper" style={{ justifyContent: "space-between" }}>
        {steg > 0 ? <Knapp variant="sek" onClick={tilbake}>Tilbake</Knapp> : <span />}
        {steg < 4 ? <Knapp onClick={neste}>Neste</Knapp> : <Knapp disabled={pending} onClick={opprett}>{pending ? "Oppretter …" : "Opprett turnering"}</Knapp>}
      </div>
    </div>
  );
}
