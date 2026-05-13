"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { sendOnskeligOkt } from "./actions";

type Coach = { id: string; name: string };

type Tier = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

type OktType = "1:1" | "MINI" | "RANGE" | "RUNDE";

type Fasilitet = "MULLIGAN" | "GFGK" | "BOSSUM" | "COACH" | "ONLINE";

const OKT_TYPER: {
  id: OktType;
  title: string;
  tag: string;
  tagTone?: "warning";
  sub: string;
  locked?: boolean;
}[] = [
  {
    id: "1:1",
    title: "1:1 Coaching",
    tag: "60 min",
    sub: "Standard 1:1 — coachen observerer, gir feedback, dere jobber sammen.",
  },
  {
    id: "MINI",
    title: "Mini-økt",
    tag: "30 min",
    sub: "Fokus på ett spesifikt tema — typisk fra forrige runde eller test.",
  },
  {
    id: "RANGE",
    title: "Range-besøk sammen",
    tag: "90 min",
    sub: "Coachen kommer til rangen — fri form, ofte for å sette opp ukens fokus.",
  },
  {
    id: "RUNDE",
    title: "Spille runde sammen",
    tag: "Elite · 4 t",
    tagTone: "warning",
    sub: "9 eller 18 hull. Coachen går med — observerer beslutningstaking.",
    locked: true,
  },
];

const FASILITETER: { id: Fasilitet; title: string; suffix?: string; sub: string }[] = [
  // TODO: hent fra Facility/Location
  {
    id: "MULLIGAN",
    title: "Mulligan Studio",
    suffix: "— din vanlige",
    sub: "TrackMan + video. 800 kr/time delt.",
  },
  { id: "GFGK", title: "GFGK Range", sub: "Utendørs. Gratis for medlem." },
  { id: "BOSSUM", title: "Bossum Golfklubb", sub: "Range + korthold. 200 kr." },
  { id: "COACH", title: "Du velger", sub: "Coachen foreslår basert på fokus." },
  {
    id: "ONLINE",
    title: "Online video-økt",
    sub: "Du sender klipp, coachen gjennomgår live på 30 min.",
  },
];

const TIER_LABEL: Record<Tier, string> = {
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  FYS: "FYS",
  TURN: "TURN",
};

export function OnskeligOktForm({ coacher }: { coacher: Coach[] }) {
  const today = new Date().toISOString().split("T")[0];

  const [oktType, setOktType] = useState<OktType>("1:1");
  const [omrader, setOmrader] = useState<Tier[]>(["SLAG"]);
  const [ekstraOmrader, setEkstraOmrader] = useState<string[]>([]);
  const [detalj, setDetalj] = useState("");
  const [datoer, setDatoer] = useState<{ dato: string; tid: string }[]>([
    { dato: today, tid: "16:00" },
  ]);
  const [fleksibel, setFleksibel] = useState(false);
  const [fasilitet, setFasilitet] = useState<Fasilitet>("MULLIGAN");
  const [melding, setMelding] = useState("");
  const [coachId, setCoachId] = useState(coacher[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const ekstraValg = [
    "PUTT",
    "Mental",
    "Turneringsforberedelse",
    "Annet",
  ];

  function toggleOmrade(t: Tier) {
    setOmrader((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }
  function toggleEkstra(s: string) {
    setEkstraOmrader((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function leggTilTid() {
    if (datoer.length >= 3) return;
    setDatoer((d) => [...d, { dato: today, tid: "16:00" }]);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const forste = datoer[0];
    const preferredAt = fleksibel
      ? undefined
      : forste
        ? `${forste.dato}T${forste.tid}:00`
        : undefined;
    const omradeStr = omrader[0] ?? "SLAG";
    const ekstraInfo = [
      `Type: ${oktType}`,
      `Fasilitet: ${fasilitet}`,
      omrader.length > 1 ? `Områder: ${omrader.join(", ")}` : null,
      ekstraOmrader.length ? `I tillegg: ${ekstraOmrader.join(", ")}` : null,
      detalj ? `Detalj: ${detalj}` : null,
      melding ? `Melding: ${melding}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    startTransition(async () => {
      try {
        await sendOnskeligOkt({
          preferredAt,
          pyramidArea: omradeStr,
          notes: ekstraInfo,
          coachId: coachId || undefined,
        });
      } catch {
        setError("Kunne ikke sende. Prøv igjen.");
      }
    });
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-6">
      {coacher.length > 1 && (
        <FormSection num="00 · COACH" title="Hvem skal ta økten?">
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="">Ingen preferanse</option>
            {coacher.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormSection>
      )}

      <FormSection num="01 · TYPE" title="Hva slags økt?">
        <div className="flex flex-col gap-2">
          {OKT_TYPER.map((t) => (
            <RadioCard
              key={t.id}
              title={t.title}
              tag={t.tag}
              tagTone={t.tagTone}
              sub={t.sub}
              selected={oktType === t.id}
              locked={t.locked}
              onClick={() => !t.locked && setOktType(t.id)}
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        num="02 · TEMA"
        title="Hva vil du jobbe med?"
        help="Velg én eller flere. Coachen bruker dette til å forberede."
      >
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TIER_LABEL) as Tier[]).map((t) => (
            <Chip
              key={t}
              active={omrader.includes(t)}
              onClick={() => toggleOmrade(t)}
            >
              {TIER_LABEL[t]}
            </Chip>
          ))}
          {ekstraValg.map((label) => (
            <Chip
              key={label}
              active={ekstraOmrader.includes(label)}
              onClick={() => toggleEkstra(label)}
            >
              {label}
            </Chip>
          ))}
        </div>
        <div className="mt-4">
          <label className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Mer detalj (valgfritt)
          </label>
          <textarea
            value={detalj}
            onChange={(e) => setDetalj(e.target.value)}
            className="min-h-24 w-full rounded-md border border-input bg-card px-4 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Beskriv mer hvis du vil — eks. «Jeg sliter med høyre-misser fra 100 m sist runde»"
          />
        </div>
      </FormSection>

      <FormSection
        num="03 · TID"
        title="Når passer det best?"
        help="Foreslå opp til 3 alternativer — eller velg «Helt fleksibel»."
      >
        <div className="flex flex-col gap-2">
          {datoer.map((d, i) => (
            <TimeRow
              key={i}
              num={String(i + 1).padStart(2, "0")}
              dato={d.dato}
              tid={d.tid}
              showLabels={i === 0}
              disabled={fleksibel}
              onChange={(field, value) => {
                const ny = [...datoer];
                ny[i] = { ...ny[i], [field]: value };
                setDatoer(ny);
              }}
            />
          ))}
          {datoer.length < 3 && (
            <button
              type="button"
              onClick={leggTilTid}
              disabled={fleksibel}
              className="mt-2 inline-flex items-center gap-2 self-start rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Legg til alternativ ({3 - datoer.length} igjen)
            </button>
          )}
        </div>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={fleksibel}
            onChange={(e) => setFleksibel(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Helt fleksibel — coachen foreslår tid
        </label>
      </FormSection>

      <FormSection num="04 · FASILITET" title="Hvor?">
        <div className="flex flex-col gap-2">
          {FASILITETER.map((f) => (
            <RadioCard
              key={f.id}
              title={f.title}
              titleSuffix={f.suffix}
              sub={f.sub}
              selected={fasilitet === f.id}
              onClick={() => setFasilitet(f.id)}
            />
          ))}
        </div>
      </FormSection>

      <FormSection num="05 · MELDING" title="Noe coachen bør vite? (valgfritt)">
        <textarea
          value={melding}
          onChange={(e) => setMelding(e.target.value.slice(0, 500))}
          className="min-h-24 w-full rounded-md border border-input bg-card px-4 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Skriv en kort melding hvis du vil …"
        />
        <div className="mt-1 flex justify-end font-mono text-[10px] text-muted-foreground">
          {melding.length} / 500
        </div>
      </FormSection>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-border pt-6">
        <Link
          href="/portal"
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Avbryt
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sender …" : "Send forespørsel"}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function FormSection({
  num,
  title,
  help,
  children,
}: {
  num: string;
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {num}
        </div>
        <h2 className="mt-1 font-display text-lg font-semibold leading-snug">
          {title}
        </h2>
        {help && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {help}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function RadioCard({
  title,
  titleSuffix,
  tag,
  tagTone,
  sub,
  selected,
  locked,
  onClick,
}: {
  title: string;
  titleSuffix?: string;
  tag?: string;
  tagTone?: "warning";
  sub: string;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  const tagStyle =
    tagTone === "warning"
      ? "bg-accent/40 text-accent-foreground"
      : "bg-secondary text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={`flex items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 ${
        selected ? "border-primary ring-2 ring-primary/15" : "border-border"
      } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span
        className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">
            {title}
            {titleSuffix && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {titleSuffix}
              </span>
            )}
          </div>
          {tag && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${tagStyle}`}
            >
              {tag}
            </span>
          )}
        </div>
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {sub}
        </div>
      </div>
    </button>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors hover:opacity-90 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TimeRow({
  num,
  dato,
  tid,
  showLabels,
  disabled,
  onChange,
}: {
  num: string;
  dato: string;
  tid: string;
  showLabels?: boolean;
  disabled?: boolean;
  onChange: (field: "dato" | "tid", value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr_1fr] items-end gap-2">
      <span className="pb-2 font-mono text-xs text-muted-foreground">{num}</span>
      <div>
        {showLabels && (
          <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Dato
          </label>
        )}
        <input
          type="date"
          value={dato}
          disabled={disabled}
          onChange={(e) => onChange("dato", e.target.value)}
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
        />
      </div>
      <div>
        {showLabels && (
          <label className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Klokkeslett
          </label>
        )}
        <input
          type="time"
          value={tid}
          disabled={disabled}
          onChange={(e) => onChange("tid", e.target.value)}
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
