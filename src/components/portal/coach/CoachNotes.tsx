import Link from "next/link";
import { ArrowRight, FileText, Tag } from "lucide-react";
import { AthleticCard } from "@/components/athletic/card";
import type { CoachNoteItem } from "@/app/portal/coach/actions";

type CoachNotesProps = {
  notes: CoachNoteItem[];
};

export function CoachNotes({ notes }: CoachNotesProps) {
  return (
    <AthleticCard
      label="Notater fra coach"
      action={
        <Link
          href="/portal/coach/notes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          Alle notater
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      }
    >
      {notes.length === 0 ? (
        <div className="py-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">Ingen notater delt med deg ennå.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/30"
            >
              <h3 className="font-display text-sm font-semibold leading-tight">
                {n.title ?? "Notat fra coach"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.content}</p>
              {n.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {n.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                    >
                      <Tag className="h-2.5 w-2.5" strokeWidth={2} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
                {n.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AthleticCard>
  );
}
