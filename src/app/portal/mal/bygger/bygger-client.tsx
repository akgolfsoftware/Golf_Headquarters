"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles } from "lucide-react";
import { aiSuggestGoal, completeGoalBuilder, type AiSuggestion } from "./actions";

type Step = 1 | 2 | 3 | 4 | 5;

type Message = {
  role: "system" | "user";
  text: string;
  italicAccent?: string;
};

const AREA_CHIPS = ["Handicap", "Score-snitt", "SG: Putting", "SG: Approach"];
const LEVEL_CHIPS = ["Ja, +3,5 stemmer", "Det har endret seg"];
const DREAM_CHIPS = ["+4,0 — neste steg", "+5,0 — ambisiøst", "Plus-handicap", "Annet …"];

export function MalByggerClient({ fornavn }: { fornavn: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(3);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [area, setArea] = useState("Handicap");
  const [currentLevel] = useState("+3,5");
  const [dreamGoal, setDreamGoal] = useState("+5,0");
  const [timeframe, setTimeframe] = useState<string | null>("60 dager");
  const [effort, setEffort] = useState<string | null>(null);

  const messages: Message[] = [
    {
      role: "system",
      text: `Hei ${fornavn}! La oss bygge et SMART-mål sammen. Først — hva vil du forbedre mest akkurat nå?`,
    },
    { role: "user", text: `${area}. Det er der jeg ser tydeligst forskjell mot A1-gjengen.` },
    {
      role: "system",
      text: `Bra valg. Jeg ser fra GolfBox at du står på ${currentLevel} akkurat nå. Stemmer det?`,
    },
    { role: "user", text: "Ja, det stemmer. Jeg vil senke det." },
    {
      role: "system",
      text: "Hva er drømme-målet? Skriv det inn eller velg en av forslagene jeg har basert på din historikk.",
    },
    { role: "user", text: `${dreamGoal}. Jeg vil være blant de beste juniorene i Norge.` },
    {
      role: "system",
      text: "Det er ambisiøst — men gjennomførbart. Vi har sett tre A1-spillere senke HCP −1,5 på 60 dager i 2025 med målrettet putt- og kortspill-arbeid.",
    },
  ];

  function regenerateSuggestion() {
    startTransition(async () => {
      const s = await aiSuggestGoal({ area, currentLevel, dreamGoal });
      setSuggestion(s);
    });
  }

  function fullfor() {
    if (!timeframe || !effort) return;
    startTransition(async () => {
      await completeGoalBuilder({
        area,
        currentLevel,
        dreamGoal,
        timeframe,
        effort,
      });
      router.push("/portal/mal");
    });
  }

  return (
    <>
      {/* Progress strip */}
      <div className="border-b border-border bg-background/80 py-3">
        <div className="mx-auto flex max-w-[720px] items-center gap-3 px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Steg <strong className="text-foreground">{step}</strong> av 5 ·{" "}
            <em className="not-italic font-display italic font-normal text-primary">
              {step === 1 && "Område"}
              {step === 2 && "Dagens nivå"}
              {step === 3 && "Drømme-mål"}
              {step === 4 && "Tidsramme"}
              {step === 5 && "Innsats"}
            </em>
          </span>
          <div className="flex flex-1 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full ${
                  n < step
                    ? "bg-primary"
                    : n === step
                      ? "bg-accent"
                      : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Chat */}
        <main className="mx-auto w-full max-w-[640px] space-y-5 px-6 py-10 pb-40">
          {messages.map((msg, i) => (
            <ChatRow key={i} msg={msg} />
          ))}

          {/* Chips for dagens steg */}
          {step === 1 && (
            <ChipsRow chips={AREA_CHIPS} selected={area} onSelect={setArea} />
          )}
          {step === 2 && (
            <ChipsRow chips={LEVEL_CHIPS} selected="Ja, +3,5 stemmer" onSelect={() => {}} />
          )}
          {step === 3 && (
            <ChipsRow
              chips={DREAM_CHIPS}
              selected={DREAM_CHIPS[1]}
              onSelect={(c) => {
                if (c.startsWith("+")) setDreamGoal(c.split(" ")[0]);
              }}
            />
          )}
          {step === 4 && (
            <ChipsRow
              chips={["30 dager", "60 dager", "90 dager", "Før Junior-NM"]}
              selected={timeframe ?? ""}
              onSelect={setTimeframe}
            />
          )}
          {step === 5 && (
            <ChipsRow
              chips={["3 økter/uke", "5 økter/uke", "Coach-styrt"]}
              selected={effort ?? ""}
              onSelect={setEffort}
            />
          )}

          {/* AI feedback boks */}
          {step >= 3 && (
            <div className="ml-11 max-w-[420px] rounded-[10px] border border-[rgb(209_248_67_/_0.4)] border-l-[3px] border-l-accent bg-[rgb(209_248_67_/_0.10)] px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
              <strong className="font-bold">Realistisk innen 60 dager med 5 økter/uke.</strong>{" "}
              Hvis du foretrekker færre økter, anbefaler jeg 90&nbsp;dagers tidsramme i stedet.
            </div>
          )}

          {/* Navigation */}
          <div className="ml-11 flex items-center gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="rounded-full border border-border bg-transparent px-4 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Tilbake
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground hover:opacity-90"
              >
                Fortsett
              </button>
            ) : (
              <button
                type="button"
                onClick={fullfor}
                disabled={pending || !timeframe || !effort}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Lagrer …" : "Fullfør og lagre mål"}
              </button>
            )}
            <button
              type="button"
              onClick={regenerateSuggestion}
              disabled={pending}
              className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-3 w-3" strokeWidth={1.75} />
              {pending ? "Tenker …" : "Be om nytt forslag"}
            </button>
          </div>

          {suggestion && (
            <div className="ml-11 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-[12px] text-foreground">
              <strong>AI:</strong> {suggestion.feedback}
            </div>
          )}
        </main>

        {/* Sidebar — live mål-preview */}
        <aside className="hidden border-l border-border bg-card p-6 lg:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Ditt mål — bygges nå
          </div>
          <h4 className="mt-3 font-display text-[22px] font-semibold leading-tight -tracking-[0.01em]">
            Senk <em className="font-display italic font-normal text-primary">HCP</em>-en din
          </h4>
          <ul className="mt-5 space-y-3">
            <PreviewRow label="Område" value={area} filled />
            <PreviewRow label="Dagens nivå" value={currentLevel} mono filled />
            <PreviewRow label="Drømme-mål" value={dreamGoal} mono current />
            <PreviewRow
              label="Tidsramme"
              value={timeframe ?? "Velg neste …"}
              filled={!!timeframe}
              current={step === 4}
            />
            <PreviewRow
              label="Innsats"
              value={effort ?? "Velg neste …"}
              filled={!!effort}
              current={step === 5}
            />
          </ul>
        </aside>
      </div>

      {/* Input bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[640px] items-center gap-2 px-6 py-3">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Eller skriv ditt eget svar …"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            aria-label="Svar til AI"
          />
          <button
            type="button"
            disabled={!input.trim()}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-foreground hover:bg-[#C5ED32] disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}

function ChatRow({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[460px] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-[14px] leading-relaxed text-primary-foreground">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-foreground">
        <Sparkles className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="max-w-[460px] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-[14px] leading-relaxed text-foreground">
        {msg.text}
      </div>
    </div>
  );
}

function ChipsRow({
  chips,
  selected,
  onSelect,
}: {
  chips: string[];
  selected: string;
  onSelect: (chip: string) => void;
}) {
  return (
    <div className="ml-11 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`rounded-full border px-4 py-2 text-[12.5px] font-semibold transition-colors ${
            selected === c
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-muted-foreground"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  filled,
  current,
  mono,
}: {
  label: string;
  value: string;
  filled?: boolean;
  current?: boolean;
  mono?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          current ? "bg-accent ring-2 ring-accent/40" : filled ? "bg-primary" : "bg-border"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </div>
        <div
          className={`mt-0.5 text-[13.5px] ${
            filled ? "text-foreground font-semibold" : "text-muted-foreground italic"
          } ${mono ? "font-mono tabular-nums" : ""}`}
        >
          {value}
        </div>
      </div>
    </li>
  );
}
