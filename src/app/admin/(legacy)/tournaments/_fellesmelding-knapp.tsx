"use client";

/**
 * Fellesmelding-knapp + komponer-panel for Turneringer-tabellen.
 *
 * Port av fasit `screens-ops.jsx` → TournamentsScreen sin compose-flyt:
 * ghost-knapp per rad åpner høyre-panel (Sheet, fasit `.panel` 460px) med
 * eyebrow «FELLESMELDING» + turneringsnavn, accent-kort «Sendes til alle
 * påmeldte deltakere», Emne (forhåndsutfylt «Orientering · {navn}») og
 * Melding. «Send til alle» lukker panelet — som forrige FellesmeldingDialog
 * er flyten presentasjonell; ingen send-backend finnes ennå.
 */

import { useState, useTransition } from "react";
import { Send, Users } from "lucide-react";
import { sendTournamentFellesmelding } from "@/app/admin/(legacy)/tournaments/actions";

import { agBtnClass } from "@/components/admin/agencyos/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FellesmeldingKnapp({
  navn,
  mottakere,
}: {
  navn: string;
  mottakere: number;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Orientering · ${navn}`);
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        className={agBtnClass("ghost", "sm")}
        onClick={() => setOpen(true)}
        disabled={mottakere === 0}
      >
        <Send size={14} strokeWidth={1.5} /> Fellesmelding
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size="lg">
          <SheetHeader>
            <div className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
              Fellesmelding
            </div>
            <SheetTitle className="mt-2 font-display text-[17px] font-bold tracking-[-0.01em]">
              {navn}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 flex items-center gap-[10px] rounded-[10px] border border-border border-l-[3px] border-l-accent bg-card px-4 py-[14px]">
              <Users size={18} strokeWidth={1.5} className="shrink-0 text-primary" />
              <span className="font-mono text-xs text-foreground">
                Sendes til alle påmeldte deltakere
              </span>
            </div>

            <label className="mb-4 flex flex-col gap-[7px]">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Emne
              </span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>

            <label className="flex flex-col gap-[7px]">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
                Melding
              </span>
              <Textarea
                rows={6}
                className="min-h-[140px]"
                placeholder="Oppmøte 07:30 ved klubbhus. Husk regnplagg…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
          </div>

          <div className="flex gap-[10px] border-t border-border px-5 py-[14px]">
            <button
              type="button"
              className={`${agBtnClass("ghost")} flex-1`}
              onClick={() => setOpen(false)}
            >
              Avbryt
            </button>
            {feedback && (
              <p className="mb-2 w-full font-mono text-[10px] text-muted-foreground">{feedback}</p>
            )}
            <button
              type="button"
              className={`${agBtnClass("primary")} flex-1`}
              disabled={pending || !body.trim()}
              onClick={() => {
                startTransition(async () => {
                  const res = await sendTournamentFellesmelding({
                    subject: subject.trim() || `Orientering · ${navn}`,
                    body: body.trim(),
                  });
                  if (res.ok) {
                    setFeedback(`Sendt til ${res.count ?? 0} spillere i gruppene`);
                    setOpen(false);
                    setBody("");
                  } else {
                    setFeedback(res.error ?? "Kunne ikke sende");
                  }
                });
              }}
            >
              <Send size={16} strokeWidth={1.5} /> {pending ? "Sender…" : "Send til alle"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
