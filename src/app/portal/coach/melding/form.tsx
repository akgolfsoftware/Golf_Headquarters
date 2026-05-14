"use client";

import { useState, useTransition } from "react";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";
import { sendCoachMelding } from "./actions";

type Coach = { id: string; name: string };

export function MeldingForm({ coacher }: { coacher: Coach[] }) {
  const [coachId, setCoachId] = useState(coacher[0]?.id ?? "");
  const [emne, setEmne] = useState("");
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!coachId) {
      setError("Velg coach.");
      return;
    }
    if (!content.trim()) {
      setError("Skriv en melding først.");
      return;
    }
    setError(null);
    const samlet = emne.trim() ? `**${emne.trim()}**\n\n${content}` : content;
    startTransition(async () => {
      try {
        await sendCoachMelding({ coachId, content: samlet });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke sende.";
        if (msg === "upgrade-required") {
          setError("Krever Pro-abonnement.");
        } else if (msg.includes("NEXT_REDIRECT")) {
          // Redirect kastes som "error" — la den boble videre
          throw err;
        } else {
          setError(msg);
        }
      }
    });
  }

  if (coacher.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        Ingen coacher er registrert. Direkte meldinger blir tilgjengelig når en coach er knyttet til AK Golf-plattformen.
      </div>
    );
  }

  const valgtCoach = coacher.find((c) => c.id === coachId);
  const valgtInitialer = valgtCoach
    ? valgtCoach.name
        .split(" ")
        .map((d) => d[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  return (
    <form onSubmit={send}>
      {/* Mottaker-bar */}
      {coacher.length > 1 ? (
        <label className="mb-4 block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Til
          </span>
          <select
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-4 text-[14px] font-semibold text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {coacher.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : valgtCoach ? (
        <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
            {valgtInitialer}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">
              {valgtCoach.name}{" "}
              <span className="font-normal text-[12px] text-muted-foreground">
                — Hovedcoach
              </span>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {/* TODO: hent reell svartid og online-status */}
              Direkte melding via CoachHQ
            </div>
          </div>
        </div>
      ) : null}

      {/* Emne */}
      <div className="mb-4">
        <input
          value={emne}
          onChange={(e) => setEmne(e.target.value.slice(0, 120))}
          className="w-full rounded-md border border-input bg-card px-4 py-4 text-[15px] font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
          placeholder="Emne (valgfritt)"
        />
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Hjelper coachen prioritere — kan stå tomt
        </div>
      </div>

      {/* Toolbar + textarea */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-0.5 border-b border-border bg-secondary px-4 py-2">
          <ToolbarKnapp label="Fet">
            <Bold className="h-4 w-4" />
          </ToolbarKnapp>
          <ToolbarKnapp label="Kursiv">
            <Italic className="h-4 w-4" />
          </ToolbarKnapp>
          <Skille />
          <ToolbarKnapp label="Liste">
            <List className="h-4 w-4" />
          </ToolbarKnapp>
          <Skille />
          <ToolbarKnapp label="Lenke">
            <LinkIcon className="h-4 w-4" />
          </ToolbarKnapp>
          <ToolbarKnapp label="Bilde">
            <ImageIcon className="h-4 w-4" />
          </ToolbarKnapp>
          <ToolbarKnapp label="Video">
            <Video className="h-4 w-4" />
          </ToolbarKnapp>
          <ToolbarKnapp label="Vedlegg">
            <Paperclip className="h-4 w-4" />
          </ToolbarKnapp>
          <ToolbarKnapp label="Emoji">
            <Smile className="h-4 w-4" />
          </ToolbarKnapp>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Markdown støttet
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 2000))}
          rows={10}
          placeholder="Skriv direkte til coachen din…"
          className="min-h-[220px] w-full resize-none bg-card px-6 py-4 text-[14.5px] leading-[1.6] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="mt-2 text-right font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {content.length} / 2000
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={() => {
            setContent("");
            setEmne("");
          }}
          className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sender …" : "Send"}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function ToolbarKnapp({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid place-items-center rounded-md px-2 py-1.5 text-[13px] text-foreground transition-colors hover:bg-card"
    >
      {children}
    </button>
  );
}

function Skille() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}
