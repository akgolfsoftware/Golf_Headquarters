import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sesjon-opptak
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Coaching</em>-opptak
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last opp lyd-fil → automatisk transkripsjon (Deepgram) → AI-summering.
        </p>
      </header>

      {!harDeepgramKey && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-5">
          <h3 className="font-display text-base font-semibold tracking-tight">
            Deepgram ikke konfigurert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Automatisk transkripsjon krever en{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              DEEPGRAM_API_KEY
            </code>{" "}
            i .env.local. Inntil videre kan opptak lastes opp manuelt og
            transkripsjon limes inn for hånd.
          </p>
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Opplastet av {user.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Manuelt opplastings-grensesnitt med Supabase Storage kommer i v2.
          Inntil da: bruk Supabase Dashboard direkte for å lagre lyd-filer.
        </p>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Siste 30 opptak
        </h3>
        {recordings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Ingen opptak registrert ennå.
          </div>
        ) : (
          <ul className="space-y-2">
            {recordings.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4"
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
                    STATUS_FARGE[r.status] ?? "bg-muted text-muted-foreground"
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
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs text-foreground">
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
