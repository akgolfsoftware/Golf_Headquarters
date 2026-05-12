import { Mic } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const STATUS_FARGE: Record<string, string> = {
  PROCESSING: "bg-accent/30 text-foreground",
  DONE: "bg-primary/10 text-primary",
  FAILED: "bg-destructive/15 text-destructive",
};

export default async function RecordingAdmin() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const recordings = await prisma.sessionRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const harDeepgramKey = !!process.env.DEEPGRAM_API_KEY;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Sesjon-opptak"
        titleItalic="Coaching"
        titleTrail="-opptak"
        sub="Last opp lyd-fil → automatisk transkripsjon (Deepgram) → AI-summering."
      />

      {!harDeepgramKey && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-6">
          <h3 className="font-display text-base font-semibold tracking-tight">
            Deepgram ikke konfigurert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Automatisk transkripsjon krever en{" "}
            <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">
              DEEPGRAM_API_KEY
            </code>{" "}
            i .env.local. Inntil videre kan opptak lastes opp manuelt og
            transkripsjon limes inn for hånd.
          </p>
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Opplastet av {user.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Manuelt opplastings-grensesnitt med Supabase Storage kommer i v2.
          Inntil da: bruk Supabase Dashboard direkte for å lagre lyd-filer.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Siste 30 opptak
        </h3>
        {recordings.length === 0 ? (
          <EmptyState
            icon={Mic}
            titleItalic="Ingen opptak"
            titleTrail="registrert"
            sub="Opptak fra coaching-økter dukker opp her etter opplasting."
          />
        ) : (
          <ul className="space-y-2">
            {recordings.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {r.createdAt.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    STATUS_FARGE[r.status] ?? "bg-secondary text-muted-foreground"
                  }`}
                >
                  {r.status}
                </span>
                {r.duration && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {Math.round(r.duration / 60)} min
                  </span>
                )}
                <a
                  href={r.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Åpne lyd →
                </a>
                {r.transcript && (
                  <details className="w-full">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Vis transkripsjon
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary/50 p-4 text-xs text-foreground">
                      {r.transcript}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
