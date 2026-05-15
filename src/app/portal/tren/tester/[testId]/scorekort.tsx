"use client";

import { useState, useMemo, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { registrerResultat } from "../actions";

type ShotDef = {
  nr: number;
  label: string;
  target?: number;
  category?: string;
};

type InputField = {
  key: string;
  label: string;
  unit: string;
};

type Protocol = {
  totalShots: number;
  shots: ShotDef[];
  inputFields: InputField[];
  scoring: string;
  scoringDescription: string;
};

function beregnScore(
  scoring: string,
  values: Record<number, Record<string, number>>,
): number | null {
  const filled = Object.values(values).filter(
    (v) => Object.keys(v).length > 0 && Object.values(v).some((n) => !isNaN(n)),
  );
  if (filled.length === 0) return null;

  switch (scoring) {
    case "pei_average": {
      const dists = filled
        .map((v) => Math.abs(v.resultatM ?? 0))
        .filter((d) => d > 0);
      return dists.length > 0
        ? dists.reduce((s, d) => s + d, 0) / dists.length
        : null;
    }
    case "pei_total": {
      const vals = Object.values(values);
      let total = 0;
      for (const v of vals) {
        const carry = v.carry ?? 0;
        const side = Math.abs(v.retning ?? v.carrySide ?? 0);
        total += Math.sqrt(side * side + 0) + (carry > 0 ? 0 : 0);
        if (side > 0) total += side;
      }
      return total > 0 ? total : null;
    }
    case "carry_average": {
      const carries = filled.map((v) => v.carry ?? 0).filter((c) => c > 0);
      return carries.length > 0
        ? carries.reduce((s, c) => s + c, 0) / carries.length
        : null;
    }
    case "count_ok": {
      let count = 0;
      for (const v of Object.values(values)) {
        if (v.ok === 1 || v.poeng > 0) count += v.ok ?? v.poeng ?? 0;
      }
      return count > 0 ? count : filled.length > 0 ? 0 : null;
    }
    case "points_total": {
      let total = 0;
      for (const v of Object.values(values)) {
        total += v.poeng ?? 0;
      }
      return filled.length > 0 ? total : null;
    }
    case "distance_average": {
      const dists = filled.map((v) => Math.abs(v.distanse ?? 0));
      return dists.length > 0
        ? dists.reduce((s, d) => s + d, 0) / dists.length
        : null;
    }
    case "spread_stddev": {
      const carries = filled.map((v) => v.carry ?? 0).filter((c) => c > 0);
      if (carries.length < 2) return null;
      const mean = carries.reduce((s, c) => s + c, 0) / carries.length;
      const variance =
        carries.reduce((s, c) => s + (c - mean) ** 2, 0) / carries.length;
      return Math.sqrt(variance);
    }
    default:
      return null;
  }
}

export function Scorekort({
  testId,
  protocol,
}: {
  testId: string;
  protocol: Protocol;
}) {
  const [values, setValues] = useState<Record<number, Record<string, number>>>(
    {},
  );
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  const liveScore = useMemo(
    () => beregnScore(protocol.scoring, values),
    [protocol.scoring, values],
  );

  const filledCount = Object.values(values).filter((v) =>
    Object.values(v).some((n) => !isNaN(n) && n !== 0),
  ).length;

  function handleChange(shotNr: number, fieldKey: string, raw: string) {
    const num = raw === "" ? NaN : parseFloat(raw.replace(",", "."));
    setValues((prev) => ({
      ...prev,
      [shotNr]: { ...(prev[shotNr] ?? {}), [fieldKey]: num },
    }));
    setLagret(false);
  }

  function handleSubmit() {
    if (liveScore === null) return;
    const fd = new FormData();
    fd.set("testId", testId);
    fd.set("score", String(liveScore));
    fd.set("notes", notes);
    fd.set("details", JSON.stringify(values));
    startTransition(async () => {
      await registrerResultat(fd);
      setLagret(true);
    });
  }

  const isLowerBetter = ["pei_average", "pei_total", "distance_average", "spread_stddev"].includes(
    protocol.scoring,
  );

  const categories = [
    ...new Set(protocol.shots.map((s) => s.category).filter(Boolean)),
  ] as string[];
  const hasCategories = categories.length > 1;

  const categoryHeaderAt = useMemo(() => {
    const set = new Set<number>();
    if (!hasCategories) return set;
    let prev = "";
    for (const shot of protocol.shots) {
      if (shot.category && shot.category !== prev) {
        set.add(shot.nr);
        prev = shot.category;
      }
    }
    return set;
  }, [hasCategories, protocol.shots]);

  return (
    <div className="space-y-6">
      {/* Live resultat-stripe */}
      <div className="sticky top-0 z-10 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Live resultat
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold tabular-nums text-foreground">
                {liveScore !== null
                  ? liveScore.toFixed(1).replace(".", ",")
                  : "---"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {protocol.scoring === "count_ok" || protocol.scoring === "points_total"
                  ? "poeng"
                  : protocol.scoring === "carry_average"
                    ? "m carry"
                    : "m"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Utfylt
            </span>
            <div className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {filledCount} / {protocol.totalShots}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {protocol.scoringDescription}
          {isLowerBetter ? " (lavere er bedre)" : " (høyere er bedre)"}
        </p>
      </div>

      {/* Scorekort-tabell */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <div
            className="hidden border-b border-border bg-muted/40 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:grid"
            style={{
              gridTemplateColumns: `40px 1.5fr ${protocol.inputFields.map(() => "1fr").join(" ")}`,
              gap: "8px",
              minWidth: protocol.inputFields.length > 2 ? `${200 + protocol.inputFields.length * 100}px` : undefined,
            }}
          >
            <div>#</div>
            <div>Slag</div>
            {protocol.inputFields.map((f) => (
              <div key={f.key}>
                {f.label} ({f.unit})
              </div>
            ))}
          </div>

          <div className="divide-y divide-border/60">
            {protocol.shots.map((shot) => {
              const showCategoryHeader = categoryHeaderAt.has(shot.nr);

              return (
                <div key={shot.nr}>
                  {showCategoryHeader && (
                    <div className="bg-muted/20 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                      {shot.category}
                    </div>
                  )}
                  <div
                    className="grid items-center gap-2 px-4 py-2 sm:gap-3"
                    style={{
                      gridTemplateColumns: `40px 1.5fr ${protocol.inputFields.map(() => "1fr").join(" ")}`,
                      minWidth: protocol.inputFields.length > 2 ? `${200 + protocol.inputFields.length * 100}px` : undefined,
                    }}
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {shot.nr}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm text-foreground">{shot.label}</span>
                      {shot.target !== undefined && (
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          mål: {shot.target}
                          {protocol.inputFields[0]?.unit === "ja/nei" ? "" : "m"}
                        </span>
                      )}
                    </div>
                    {protocol.inputFields.map((field) => (
                      <div key={field.key}>
                        {field.unit === "ja/nei" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleChange(
                                shot.nr,
                                field.key,
                                String(
                                  (values[shot.nr]?.[field.key] ?? 0) === 1
                                    ? 0
                                    : 1,
                                ),
                              )
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                              values[shot.nr]?.[field.key] === 1
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {values[shot.nr]?.[field.key] === 1 ? "OK" : "---"}
                          </button>
                        ) : (
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={field.unit}
                            className="h-9 w-full min-w-16 rounded-md border border-border bg-background px-3 font-mono text-sm tabular-nums outline-none transition-colors focus:border-primary"
                            onChange={(e) =>
                              handleChange(shot.nr, field.key, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notater + lagre */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="notes"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Notater (valgfritt)
          </label>
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vind, underlag, følt energi..."
            className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={liveScore === null || isPending || lagret}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Lagrer...
            </>
          ) : lagret ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Resultat lagret
            </>
          ) : (
            "Lagre resultat"
          )}
        </button>
      </div>
    </div>
  );
}
