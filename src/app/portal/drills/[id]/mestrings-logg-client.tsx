"use client";

/**
 * PlayerHQ · Drill-detalj · Mestringslogg + Rating klient-komponent
 *
 * Inneholder:
 * - Mestringslogg-tabell (siste 10 økt-registreringer)
 * - Skjema for å registrere ny mestrings-økt (csScore + kommentar)
 * - Rating-widget: 5 type-knapper for å rate drillen
 *
 * Alle actions kommuniserer med server actions i ./actions.ts.
 */

import { useTransition, useState } from "react";
import {
  CheckCircle2,
  Star,
  Loader2,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import { registrerMestringsOkt, rateDrill } from "./actions";

/* ─── Typer ─── */

type MestringsLoggRad = {
  id: string;
  dato: Date;
  csScore: number | null;
  coachVurdering: number | null;
  kommentar: string | null;
  mestret: boolean;
};

type DrillRatingRad = {
  id: string;
  rating: number;
  type: string | null;
  kommentar: string | null;
  createdAt: Date;
};

type Props = {
  drillId: string;
  drillNavn: string;
  mestringsLogg: MestringsLoggRad[];
  ratings: DrillRatingRad[];
  csForMeg: number | null;
};

/* ─── Rating-typer ─── */

type RatingType = {
  id: string;
  label: string;
  rating: number;
  farge: string;
};

const RATING_TYPER: RatingType[] = [
  {
    id: "aha",
    label: "Aha!",
    rating: 5,
    farge:
      "border-accent bg-accent/20 text-accent-foreground hover:bg-accent/30",
  },
  {
    id: "utfordrende",
    label: "Utfordrende",
    rating: 4,
    farge:
      "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    id: "passe",
    label: "Passe",
    rating: 3,
    farge:
      "border-border bg-secondary text-secondary-foreground hover:bg-muted",
  },
  {
    id: "kjedelig",
    label: "Kjedelig",
    rating: 2,
    farge:
      "border-muted bg-muted/50 text-muted-foreground hover:bg-muted",
  },
  {
    id: "for_vanskelig",
    label: "For vanskelig",
    rating: 1,
    farge:
      "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
];

/* ─── Hjelpere ─── */

function datoFormat(dato: Date): string {
  return new Date(dato).toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CoachStjerner({ antall }: { antall: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < antall
              ? "fill-accent text-accent-foreground"
              : "text-border"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* ─── Mestringslogg-seksjon ─── */

export function MestringsLoggClient({
  drillId,
  drillNavn,
  mestringsLogg,
  ratings,
  csForMeg,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [csInput, setCsInput] = useState("");
  const [kommentarInput, setKommentarInput] = useState("");
  const [registrerStatus, setRegistrerStatus] = useState<
    "idle" | "ok" | "mestret" | "feil"
  >("idle");
  const [ratingStatus, setRatingStatus] = useState<
    "idle" | "ok" | "feil"
  >("idle");
  const [valgtRatingId, setValgtRatingId] = useState<string | null>(null);

  // Bruk siste rating som "min rating"
  const siste = ratings[0] ?? null;

  function handleRegistrer() {
    const csScoreParsed = csInput.trim()
      ? parseInt(csInput.trim(), 10)
      : null;
    if (csInput.trim() && isNaN(csScoreParsed!)) return;

    startTransition(async () => {
      const res = await registrerMestringsOkt(
        drillId,
        csScoreParsed ?? null,
        kommentarInput.trim() || null,
      );
      if (res.ok) {
        setRegistrerStatus(res.mestret ? "mestret" : "ok");
        setCsInput("");
        setKommentarInput("");
      } else {
        setRegistrerStatus("feil");
      }
    });
  }

  function handleRate(ratingType: RatingType) {
    setValgtRatingId(ratingType.id);
    startTransition(async () => {
      const res = await rateDrill(
        drillId,
        ratingType.rating,
        ratingType.id,
        null,
      );
      if (res.ok) {
        setRatingStatus("ok");
      } else {
        setRatingStatus("feil");
        setValgtRatingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Mestringslogg-tabell */}
      <section
        aria-labelledby="mestringslogg-heading"
        className="rounded-2xl border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="h-4 w-4 text-primary"
              strokeWidth={1.75}
            />
            <h2
              id="mestringslogg-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Mestringslogg · siste 10 ganger
            </h2>
          </div>
          {csForMeg !== null && (
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              CS-target: <span className="text-foreground">{csForMeg}</span>
            </span>
          )}
        </div>

        {mestringsLogg.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="font-display text-base italic text-muted-foreground">
              Ingen økt-registreringer enda. Registrer din første nedenfor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Dato
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    CS-score
                  </th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Mestret
                  </th>
                  <th className="hidden px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:table-cell">
                    Coach
                  </th>
                  <th className="hidden px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground md:table-cell">
                    Kommentar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mestringsLogg.map((rad) => (
                  <tr key={rad.id} className={rad.mestret ? "bg-primary/5" : ""}>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                      {datoFormat(rad.dato)}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm tabular-nums font-medium">
                      {rad.csScore !== null ? (
                        <span
                          className={
                            csForMeg !== null && rad.csScore >= csForMeg
                              ? "text-primary"
                              : "text-foreground"
                          }
                        >
                          {rad.csScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {rad.mestret ? (
                        <CheckCircle2
                          className="h-4 w-4 text-primary"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <span className="h-4 w-4 text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {rad.coachVurdering !== null ? (
                        <CoachStjerner antall={rad.coachVurdering} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {rad.kommentar ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Registrer mestrings-økt */}
      <section
        aria-labelledby="registrer-heading"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2
            id="registrer-heading"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary"
          >
            Registrer mestrings-økt
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Logg CS-score og kommentar etter en økt med{" "}
          <span className="font-medium text-foreground">{drillNavn}</span>.
          {csForMeg !== null && (
            <>
              {" "}
              Mål: <span className="font-mono font-medium">{csForMeg}</span>
            </>
          )}
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cs-score-input"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              CS-score (valgfri)
            </label>
            <input
              id="cs-score-input"
              type="number"
              min={0}
              max={100}
              placeholder="f.eks. 87"
              value={csInput}
              onChange={(e) => {
                setCsInput(e.target.value);
                if (registrerStatus !== "idle") setRegistrerStatus("idle");
              }}
              className="h-11 w-32 rounded-md border border-input bg-background px-3 font-mono text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="kommentar-input"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Kommentar (valgfri)
            </label>
            <input
              id="kommentar-input"
              type="text"
              placeholder="Hva gikk bra? Hva kan bli bedre?"
              value={kommentarInput}
              onChange={(e) => setKommentarInput(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="button"
            onClick={handleRegistrer}
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            )}
            Registrer
          </button>
        </div>

        {registrerStatus === "ok" && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Okten er registrert.
            <button
              type="button"
              onClick={() => setRegistrerStatus("idle")}
              className="ml-auto"
              aria-label="Lukk"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {registrerStatus === "mestret" && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-accent/60 bg-accent/20 px-4 py-3 text-sm text-accent-foreground">
            <Zap className="h-4 w-4 shrink-0 text-accent-foreground" strokeWidth={1.75} />
            <span className="font-semibold">Drill mestret!</span> Veldig bra
            — du har nådd CS-target. Neste steg i progresjonsseria er klar.
            <button
              type="button"
              onClick={() => setRegistrerStatus("idle")}
              className="ml-auto"
              aria-label="Lukk"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {registrerStatus === "feil" && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Noe gikk galt. Prøv igjen.
          </div>
        )}
      </section>

      {/* Rating-widget */}
      <section
        aria-labelledby="rating-heading"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="rating-heading"
              className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Hva synes du om denne drillen?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Din tilbakemelding hjelper Anders å velge riktige drills for deg.
            </p>
          </div>
          {siste !== null && (
            <div className="shrink-0 text-right">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Sist rated
              </span>
              <p className="text-sm font-medium capitalize text-foreground">
                {siste.type?.replace("_", " ") ?? "—"}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RATING_TYPER.map((rt) => {
            const erValgt =
              valgtRatingId === rt.id ||
              (valgtRatingId === null &&
                siste?.type === rt.id);
            return (
              <button
                key={rt.id}
                type="button"
                onClick={() => handleRate(rt)}
                disabled={pending || ratingStatus === "ok"}
                aria-pressed={erValgt}
                className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  erValgt
                    ? rt.farge + " ring-2 ring-offset-1 ring-primary/40"
                    : rt.farge
                }`}
              >
                {rt.label}
              </button>
            );
          })}
        </div>

        {ratingStatus === "ok" && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Takk for tilbakemeldingen!
          </p>
        )}
        {ratingStatus === "feil" && (
          <p className="mt-3 text-sm text-destructive">
            Noe gikk galt. Prøv igjen.
          </p>
        )}
      </section>
    </div>
  );
}
