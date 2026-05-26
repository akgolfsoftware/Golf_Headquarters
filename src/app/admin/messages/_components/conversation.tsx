"use client";

import { useState, useRef, useTransition } from "react";
import {
  Sparkles,
  Send,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";
import { sendMelding } from "../actions";

type ChatMelding = { role?: string; content?: string; ts?: string };

type Props = {
  threadId: string;
  spillerNavn: string;
  spillerInitialer: string;
  spillerId: string;
  spillerTier: string;
  meldinger: ChatMelding[];
  meId: string;
  meName: string;
  meInitialer: string;
};

function formaterTidspunkt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formaterDag(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const idag = new Date();
  const erIdag = d.toDateString() === idag.toDateString();
  if (erIdag) return "I dag";
  const igår = new Date(idag);
  igår.setDate(idag.getDate() - 1);
  if (d.toDateString() === igår.toDateString()) return "I går";
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function Conversation({
  threadId,
  spillerNavn,
  spillerInitialer,
  spillerId,
  spillerTier,
  meldinger,
  meName,
  meInitialer,
}: Props) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [aiUtkast, setAiUtkast] = useState<string | null>(null);
  const [aiLaster, setAiLaster] = useState(false);
  const [aiFeil, setAiFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const proKreves = spillerTier !== "PRO";

  // Grupper meldinger etter dag
  const dager: { dag: string; meldinger: ChatMelding[] }[] = [];
  let forrigeDag = "";
  meldinger.forEach((m) => {
    const dag = formaterDag(m.ts);
    if (dag !== forrigeDag) {
      dager.push({ dag, meldinger: [] });
      forrigeDag = dag;
    }
    dager[dager.length - 1]!.meldinger.push(m);
  });

  async function håndterSend(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) {
      setFeil("Skriv en melding først");
      return;
    }
    setFeil(null);
    const res = await sendMelding(threadId, body);
    if (!res.ok) {
      setFeil(res.error ?? "Kunne ikke sende melding");
    } else {
      setTekst("");
      setAiUtkast(null);
      if (textareaRef.current) textareaRef.current.value = "";
    }
  }

  async function generereAiUtkast() {
    if (proKreves) {
      setAiFeil("AI-utkast krever PRO-abonnement for spilleren");
      return;
    }
    setAiLaster(true);
    setAiFeil(null);
    try {
      // Bruk siste innkommende melding som kontekst
      const sisteFraSpiller = [...meldinger]
        .reverse()
        .find((m) => m.role === "user");
      const promptInnhold = sisteFraSpiller?.content ?? "Skriv et generelt oppfølgingssvar.";

      const res = await fetch("/api/admin/coach-ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          playerName: spillerNavn,
          playerContext: {
            hcp: null,
            ambition: null,
            homeClub: null,
            tier: spillerTier,
            playingYears: null,
            sisteRunder: [],
            aktivPlan: null,
            sisteTester: [],
          },
          messages: [
            {
              role: "user",
              content: `Foreslå et kort, varmt svar på denne meldingen fra spilleren: "${promptInnhold}". Maks 4 setninger, signer ikke med navn.`,
            },
          ],
        }),
      });
      if (!res.ok) {
        setAiFeil("Kunne ikke generere utkast");
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) {
        setAiFeil("Ingen respons fra AI");
        return;
      }
      const decoder = new TextDecoder();
      let samlet = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        samlet += decoder.decode(value, { stream: true });
        setAiUtkast(samlet);
      }
    } catch (err) {
      setAiFeil(err instanceof Error ? err.message : "AI-feil");
    } finally {
      setAiLaster(false);
    }
  }

  function bruksAiUtkast() {
    if (!aiUtkast) return;
    setTekst(aiUtkast);
    if (textareaRef.current) textareaRef.current.value = aiUtkast;
    setAiUtkast(null);
  }

  return (
    <section className="flex min-w-0 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border bg-card px-6 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-muted font-display text-[15px] font-semibold">
          {spillerInitialer}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[16px] font-semibold leading-tight tracking-tight">
            {spillerNavn}
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {spillerTier === "PRO" ? "PRO-medlem" : "Gratis-medlem"} ·{" "}
            <a
              href={`/admin/elever/${spillerId}`}
              className="text-foreground hover:text-primary"
            >
              Åpne profil
            </a>
          </div>
        </div>
        {/* V2: ring/mer-funksjoner kommer
        <button
          type="button"
          disabled
          title="Kommer snart"
          aria-label="Ring (kommer snart)"
          className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-50"
        >
          <Phone size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          disabled
          title="Kommer snart"
          aria-label="Mer (kommer snart)"
          className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-50"
        >
          <MoreVertical size={16} strokeWidth={1.5} />
        </button>
        */}
      </div>

      {/* Meldingsstrøm */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
        {meldinger.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Ingen meldinger ennå — start samtalen nedenfor
            </p>
          </div>
        ) : (
          dager.map((d, i) => (
            <div key={i} className="flex flex-col gap-6">
              <div className="my-1 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                {d.dag}
              </div>
              {d.meldinger.map((m, j) =>
                m.role === "coach" || m.role === "assistant" ? (
                  <MeldingFraMeg
                    key={j}
                    navn={m.role === "assistant" ? "AI-coach" : `Du · ${meName}`}
                    initialer={m.role === "assistant" ? "AI" : meInitialer}
                    tid={formaterTidspunkt(m.ts)}
                    innhold={m.content ?? ""}
                  />
                ) : (
                  <MeldingFraSpiller
                    key={j}
                    navn={spillerNavn}
                    initialer={spillerInitialer}
                    tid={formaterTidspunkt(m.ts)}
                    innhold={m.content ?? ""}
                  />
                ),
              )}
            </div>
          ))
        )}

        {/* AI-utkast inline */}
        {aiUtkast !== null && (
          <div className="ml-auto w-full max-w-[680px] rounded-2xl border border-border bg-accent/15 p-6">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
              <Sparkles size={14} strokeWidth={1.5} />
              AI-utkast — basert på din skrivestil
              {aiLaster && <Loader2 size={12} className="animate-spin" />}
            </div>
            <div className="whitespace-pre-wrap rounded-md border border-border bg-card px-3.5 py-4 text-[13px] leading-relaxed">
              {aiUtkast || (aiLaster ? "Genererer …" : "")}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={bruksAiUtkast}
                disabled={!aiUtkast || aiLaster}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Check size={14} strokeWidth={1.5} />
                Bruk
              </button>
              <button
                type="button"
                onClick={generereAiUtkast}
                disabled={aiLaster}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Pencil size={14} strokeWidth={1.5} />
                Regenerer
              </button>
              <button
                type="button"
                onClick={() => setAiUtkast(null)}
                className="inline-flex items-center rounded-md px-4 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary"
              >
                Forkast
              </button>
            </div>
          </div>
        )}
        {aiFeil && (
          <div className="ml-auto w-full max-w-[680px] rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-[12px] text-destructive">
            {aiFeil}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        action={(fd) => startTransition(() => void håndterSend(fd))}
        className="border-t border-border bg-card px-6 py-4"
      >
        <div className="rounded-2xl border border-border bg-background px-3.5 py-4">
          <textarea
            ref={textareaRef}
            name="body"
            defaultValue={tekst}
            onChange={(e) => setTekst(e.target.value)}
            placeholder="Skriv et svar …"
            rows={2}
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            disabled={isPending}
          />
          <div className="mt-2 flex items-center gap-1.5">
            {/* V2: vedlegg/bilde/plan-funksjoner kommer
            <button
              type="button"
              disabled
              title="Kommer snart"
              aria-label="Legg ved fil (kommer snart)"
              className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-50"
            >
              <Paperclip size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              disabled
              title="Kommer snart"
              aria-label="Bilde (kommer snart)"
              className="grid h-8 w-8 cursor-not-allowed place-items-center rounded-md text-muted-foreground opacity-50"
            >
              <ImageIcon size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              disabled
              title="Kommer snart"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground opacity-50"
            >
              <Calendar size={14} strokeWidth={1.5} />
              Plan
            </button>
            */}
            <button
              type="button"
              onClick={generereAiUtkast}
              disabled={aiLaster || proKreves}
              title={proKreves ? "AI-utkast krever PRO" : "Generer AI-utkast"}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {aiLaster ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} strokeWidth={1.5} />
              )}
              AI-utkast
              {proKreves && (
                <span className="ml-1 rounded-full bg-accent/40 px-1.5 text-[9px] font-semibold text-accent-foreground">
                  PRO
                </span>
              )}
            </button>
            <span className="flex-1" />
            {feil && (
              <span className="text-[11px] text-destructive">{feil}</span>
            )}
            <button
              type="submit"
              disabled={isPending || tekst.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  Send
                  <Send size={14} strokeWidth={1.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function MeldingFraSpiller({
  navn,
  initialer,
  tid,
  innhold,
}: {
  navn: string;
  initialer: string;
  tid: string;
  innhold: string;
}) {
  return (
    <div className="grid max-w-[680px] grid-cols-[36px_1fr] gap-4">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
        {initialer}
      </span>
      <div>
        <div className="mb-1 flex items-baseline gap-2 text-[11px] text-muted-foreground">
          <span className="text-[12px] font-semibold text-foreground">
            {navn}
          </span>
          <span>{tid}</span>
        </div>
        <div className="whitespace-pre-wrap rounded-2xl border border-border bg-card px-4 py-4 text-[13px] leading-relaxed">
          {innhold}
        </div>
      </div>
    </div>
  );
}

function MeldingFraMeg({
  navn,
  initialer,
  tid,
  innhold,
}: {
  navn: string;
  initialer: string;
  tid: string;
  innhold: string;
}) {
  return (
    <div className="grid max-w-[680px] grid-cols-[1fr_36px] justify-self-end gap-4">
      <div>
        <div className="mb-1 flex items-baseline justify-end gap-2 text-[11px] text-muted-foreground">
          <span className="text-[12px] font-semibold text-foreground">
            {navn}
          </span>
          <span>{tid}</span>
        </div>
        <div className="whitespace-pre-wrap rounded-2xl bg-foreground px-4 py-4 text-[13px] leading-relaxed text-background">
          {innhold}
        </div>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-[12px] font-semibold text-primary-foreground">
        {initialer}
      </span>
    </div>
  );
}
