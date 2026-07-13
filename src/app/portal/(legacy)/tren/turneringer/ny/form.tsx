"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useTilbake } from "@/components/v2/back-button";
import { opprettManuellTurnering } from "../actions";

type TurType = "junior-no" | "amateur-no" | "lokal" | "klubb";
type TurFormat = "STROKE" | "MATCH" | "STABLEFORD" | "OTHER";

const TUR_LABEL: Record<TurType, string> = {
  "junior-no": "Junior-turnering (Norge)",
  "amateur-no": "Amatør-turnering (Norge)",
  "lokal": "Lokal/regional turnering",
  "klubb": "Klubbmesterskap eller intern",
};

const FORMAT_LABEL: Record<TurFormat, string> = {
  STROKE: "Slagspill (Stroke play)",
  MATCH: "Matchspill",
  STABLEFORD: "Stableford",
  OTHER: "Annet",
};

export function NyManuellTurneringForm() {
  const router = useRouter();
  const tilbake = useTilbake("/portal/tren/turneringer");
  const [isPending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [navn, setNavn] = useState("");
  const [sted, setSted] = useState("");
  const [land, setLand] = useState("NO");
  const [startDato, setStartDato] = useState("");
  const [sluttDato, setSluttDato] = useState("");
  const [format, setFormat] = useState<TurFormat>("STROKE");
  const [tour, setTour] = useState<TurType>("junior-no");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);

    startTransition(async () => {
      const result = await opprettManuellTurnering({
        name: navn.trim(),
        location: sted.trim(),
        country: land.trim().toUpperCase(),
        startDate: startDato,
        endDate: sluttDato || undefined,
        format,
        tour,
        notes: notes.trim() || undefined,
      });

      if (!result.ok) {
        setFeil(result.feil);
        return;
      }

      // Redirect tilbake til turnerings-listen
      router.push("/portal/tren/turneringer");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feil && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} />
          <span className="text-sm text-destructive-foreground">{feil}</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-5">
          <Field label="Turneringsnavn" htmlFor="navn" required>
            <input
              id="navn"
              type="text"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="F.eks. GFGK Klubbmesterskap 2026"
              maxLength={200}
              required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Sted / klubb" htmlFor="sted" required>
            <input
              id="sted"
              type="text"
              value={sted}
              onChange={(e) => setSted(e.target.value)}
              placeholder="F.eks. Gamle Fredrikstad Golfklubb"
              maxLength={200}
              required
              className={INPUT_CLASS}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Startdato" htmlFor="startDato" required>
              <input
                id="startDato"
                type="date"
                value={startDato}
                onChange={(e) => setStartDato(e.target.value)}
                required
                className={`${INPUT_CLASS} font-mono tabular-nums`}
              />
            </Field>
            <Field label="Sluttdato" htmlFor="sluttDato">
              <input
                id="sluttDato"
                type="date"
                value={sluttDato}
                onChange={(e) => setSluttDato(e.target.value)}
                min={startDato || undefined}
                className={`${INPUT_CLASS} font-mono tabular-nums`}
              />
            </Field>
          </div>

          <Field label="Kategori" htmlFor="tour" required>
            <select
              id="tour"
              value={tour}
              onChange={(e) => setTour(e.target.value as TurType)}
              className={INPUT_CLASS}
            >
              {(Object.keys(TUR_LABEL) as TurType[]).map((t) => (
                <option key={t} value={t}>
                  {TUR_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Spilleformat" htmlFor="format">
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as TurFormat)}
              className={INPUT_CLASS}
            >
              {(Object.keys(FORMAT_LABEL) as TurFormat[]).map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABEL[f]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Land (ISO 2-bokstaver)" htmlFor="land">
            <input
              id="land"
              type="text"
              value={land}
              onChange={(e) => setLand(e.target.value)}
              placeholder="NO"
              maxLength={2}
              className={`w-24 ${INPUT_CLASS} font-mono uppercase tabular-nums`}
            />
          </Field>

          <Field label="Notater" htmlFor="notes">
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Valgfritt — kontekst, format-detaljer, antall runder ..."
              maxLength={1000}
              rows={3}
              className={`${INPUT_CLASS} resize-none`}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <button
          type="button"
          onClick={tilbake}
          className="rounded-full px-5 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={isPending || !navn.trim() || !sted.trim() || !startDato}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              Lagrer …
            </>
          ) : (
            "Opprett turnering"
          )}
        </button>
      </div>

      <p className="rounded-xl bg-secondary/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Turneringen blir umiddelbart synlig på{" "}
        <code className="font-mono text-foreground">/turneringer</code> og i AgencyOS.
        Den merkes som manuelt opprettet av deg, og coachen kan senere koble den til en
        kjent DataGolf/NGF-turnering hvis det er en match.
      </p>
    </form>
  );
}

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <span className="block font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
