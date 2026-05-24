"use client";

/**
 * AddExerciseSheet — bottomsheet for å opprette egendefinerte øvelser
 *
 * Design: PlayerHQ Øvelsesbibliotek.html (Claude Design, 2026-05-24)
 * - Grønn header med lime-tekst
 * - Chip-selektorer for muskelgrupper og fasiliteter
 * - Bilde-upload (stub) + YouTube/Vimeo-URL
 * - Lagre-knapp med Server Action
 */

import { useState, useTransition } from "react";
import {
  X,
  Camera,
  Plus,
  Check,
  Play,
} from "lucide-react";
import { createCustomExercise } from "@/app/portal/tren/ovelser/actions";

const MUSKELGRUPPER = ["Glutes", "Hamstrings", "Core", "Skulder", "Rygg", "Bein", "Biceps", "Triceps", "Bryst"];
const FASILITETER = ["GYM", "Vektstang", "Trapbar", "Medisinball", "Løpebane", "Strikk", "Hjemme", "Bane"];

export function AddExerciseSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [navn, setNavn] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [settReps, setSettReps] = useState("");
  const [intensitet, setIntensitet] = useState("");
  const [valgteMuskler, setValgteMuskler] = useState<string[]>([]);
  const [valgteFasiliteter, setValgteFasiliteter] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function toggleMuskel(m: string) {
    setValgteMuskler((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function toggleFasilitet(f: string) {
    setValgteFasiliteter((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function handleLagre() {
    if (!navn.trim()) return;
    startTransition(async () => {
      await createCustomExercise({
        navn: navn.trim(),
        beskrivelse: beskrivelse.trim() || null,
        defaultRepsSets: settReps.trim() || null,
        intensitet: intensitet ? Number(intensitet) : null,
        muscleGroups: valgteMuskler,
        fasilitetKrav: valgteFasiliteter,
        videoUrl: videoUrl.trim() || null,
      });
      setLagret(true);
      setTimeout(() => {
        setLagret(false);
        onClose();
        // Reset
        setNavn("");
        setBeskrivelse("");
        setSettReps("");
        setIntensitet("");
        setValgteMuskler([]);
        setValgteFasiliteter([]);
        setVideoUrl("");
      }, 800);
    });
  }

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Legg til øvelse"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl bg-card shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-1 pt-2.5 shrink-0">
          <div className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="mx-3 mb-0 shrink-0 rounded-[18px] bg-primary px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">
              Nytt biblioteks-element
            </p>
            <h2 className="font-display mt-0.5 text-[18px] font-bold tracking-tight text-accent">
              Legg til øvelse
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Lukk"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-accent hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Navn */}
          <Field label="Navn">
            <input
              className="input-field"
              placeholder="F.eks. Kettlebell swing"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              autoFocus
            />
          </Field>

          {/* Beskrivelse */}
          <Field label="Beskrivelse" optional>
            <textarea
              className="input-field resize-none"
              placeholder="Utførelse, cues, tips …"
              rows={3}
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
            />
          </Field>

          {/* Sett × reps + Intensitet */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sett × reps">
              <input
                className="input-field"
                placeholder="3 × 12"
                value={settReps}
                onChange={(e) => setSettReps(e.target.value)}
              />
            </Field>
            <Field label="Intensitet" optional suffix="1–10">
              <input
                className="input-field"
                placeholder="7"
                type="number"
                min={1}
                max={10}
                value={intensitet}
                onChange={(e) => setIntensitet(e.target.value)}
              />
            </Field>
          </div>

          {/* Muskelgrupper */}
          <Field label="Muskelgrupper">
            <div className="flex flex-wrap gap-2 mt-1">
              {MUSKELGRUPPER.map((m) => (
                <ChipToggle
                  key={m}
                  label={m}
                  selected={valgteMuskler.includes(m)}
                  onClick={() => toggleMuskel(m)}
                />
              ))}
              <button className="chip-add">
                <Plus size={12} />
                Legg til
              </button>
            </div>
          </Field>

          {/* Fasiliteter */}
          <Field label="Fasiliteter som trengs">
            <div className="flex flex-wrap gap-2 mt-1">
              {FASILITETER.map((f) => (
                <ChipToggle
                  key={f}
                  label={f}
                  selected={valgteFasiliteter.includes(f)}
                  onClick={() => toggleFasilitet(f)}
                />
              ))}
              <button className="chip-add">
                <Plus size={12} />
                Legg til
              </button>
            </div>
          </Field>

          {/* Bilde upload */}
          <Field label="Bilde / screenshot" optional>
            <button className="w-full rounded-2xl border-2 border-dashed border-border bg-secondary/30 py-6 flex flex-col items-center gap-2.5 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-accent">
                <Camera size={20} />
              </div>
              <div className="text-center">
                <p className="text-[13.5px] font-semibold text-foreground">
                  Last opp bilde
                </p>
                <p className="font-mono text-[10.5px] text-muted-foreground tracking-wide mt-0.5">
                  Maks 5 MB · JPG · PNG
                </p>
              </div>
            </button>
          </Field>

          {/* YouTube / Vimeo */}
          <Field label="YouTube / Vimeo-lenke" optional>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-5 w-6 items-center justify-center rounded bg-[#FF0000] text-white">
                <Play size={10} fill="white" strokeWidth={0} />
              </span>
              <input
                className="input-field pl-12"
                placeholder="https://youtube.com/..."
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </Field>

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-card px-5 py-4 flex flex-col items-center gap-2.5">
          <button
            onClick={handleLagre}
            disabled={!navn.trim() || isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-semibold text-accent shadow-lg shadow-primary/20 transition-opacity disabled:opacity-50"
          >
            <Check size={15} />
            {lagret ? "Lagret!" : isPending ? "Lagrer …" : "Lagre øvelse"}
          </button>
          <p className="font-mono text-[10.5px] text-muted-foreground tracking-wide">
            Øvelsen deles automatisk med din coach
          </p>
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: white;
          border: 1.5px solid hsl(var(--border));
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          color: hsl(var(--foreground));
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-field:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.10);
        }
        .input-field::placeholder { color: hsl(var(--muted-foreground)); }
        .chip-add {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 13px; border-radius: 9999px;
          border: 1.5px dashed hsl(var(--muted-foreground));
          background: transparent;
          font-size: 12.5px; font-weight: 500;
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .chip-add:hover { border-color: hsl(var(--primary)); color: hsl(var(--primary)); }
        .font-display { font-family: var(--font-inter-tight, 'Inter Tight', system-ui, sans-serif); }
      `}</style>
    </>
  );
}

function Field({
  label,
  optional,
  suffix,
  children,
}: {
  label: string;
  optional?: boolean;
  suffix?: string;
  children: React.ReactNode;
}) {
  // Innpakker children i en gruppe slik at label er korrekt assosiert via
  // implicit binding (input nestet inni <label>) — alle inputs i denne
  // fila bruker dette mønsteret.
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {suffix && (
          <span className="font-body text-[10px] font-medium normal-case tracking-normal text-muted-foreground/70">
            {suffix}
          </span>
        )}
        {optional && (
          <span className="font-body text-[10px] font-medium normal-case tracking-normal text-muted-foreground/60">
            — valgfri
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-all ${
        selected
          ? "bg-accent text-foreground border-2 border-accent/70 font-semibold"
          : "bg-secondary text-foreground border-2 border-transparent hover:border-border"
      }`}
    >
      {selected && <Check size={11} strokeWidth={2.5} />}
      {label}
    </button>
  );
}
