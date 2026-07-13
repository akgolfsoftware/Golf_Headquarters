"use client";

/**
 * TildelModal — interaktiv coach-modal for å tildele test til spiller.
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (test-modul/tildel-test-modal.html).
 */

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Search, X } from "lucide-react";
import { useTilbake } from "@/components/v2/back-button";
import { tildelTest } from "./actions";

type Spiller = { id: string; name: string; initials: string; hcp: string };

type TestItem = {
  id: string;
  name: string;
  description: string;
  pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
};

const PYR_CLASS: Record<TestItem["pyramidArea"], string> = {
  FYS: "te-pyr te-pyr-fys",
  TEK: "te-pyr te-pyr-tek",
  SLAG: "te-pyr te-pyr-slag",
  SPILL: "te-pyr te-pyr-spill",
  TURN: "te-pyr te-pyr-turn",
};

const PYRAMID_FILTERS = ["Alle", "FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

// Fallback-sample hvis ingen TestDefinition i DB
const SAMPLE_TESTS: TestItem[] = [
  { id: "s1", name: "Putt 1–3 m", description: "30 putt · 1m, 2m, 3m · % sunket · ~12 min", pyramidArea: "SLAG" },
  { id: "s2", name: "Putt 4–8 m", description: "20 putt · 4m, 6m, 8m · proximity til hull · ~10 min", pyramidArea: "SLAG" },
  { id: "s3", name: "Putt langdistanse 10–20 m", description: "15 putt · proximity 3-putt unngåelse · ~12 min", pyramidArea: "SLAG" },
  { id: "s4", name: "Chip landingsone 15 m", description: "10 chip · 3m landingsone · % i sone · ~8 min", pyramidArea: "SLAG" },
];

export function TildelModal({
  spiller,
  tester,
  pyrCounts,
}: {
  spiller: Spiller;
  tester: TestItem[];
  pyrCounts: Record<string, number>;
}) {
  const router = useRouter();
  const allTests = tester.length > 0 ? tester : SAMPLE_TESTS;

  const [search, setSearch] = useState("putt");
  const [activeFilter, setActiveFilter] = useState<(typeof PYRAMID_FILTERS)[number]>("SLAG");
  const [selectedTestId, setSelectedTestId] = useState<string>(allTests[0]?.id ?? "");
  const [dato, setDato] = useState<string>("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredTests = useMemo(() => {
    return allTests.filter((t) => {
      if (activeFilter !== "Alle" && t.pyramidArea !== activeFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTests, activeFilter, search]);

  const totalCount = allTests.length;

  const handleClose = useTilbake(`/admin/spillere/${spiller.id}/tester`);

  function handleSend() {
    setFeil(null);
    startTransition(async () => {
      const res = await tildelTest({
        spillerId: spiller.id,
        testId: selectedTestId,
        note: notat,
        dueDate: dato || undefined,
      });
      if (res.ok) router.push("/admin/tester");
      else setFeil(res.error ?? "Kunne ikke tildele testen.");
    });
  }

  return (
    <div className="tester-shell">
      <div className="tester-modal-backdrop" onClick={handleClose} aria-hidden>
        <div
          className="tester-modal"
          role="dialog"
          aria-label="Tildel test"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="tester-modal-head">
            <div>
              <div className="eye">AgencyOS · Stall · Spillere</div>
              <h2>
                Tildel test til <strong>{spiller.name}</strong>
              </h2>
            </div>
            <button
              type="button"
              className="tester-modal-close"
              aria-label="Lukk"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="tester-modal-body">
            {/* Player chip */}
            <div className="te-ply-chip">
              <div className="av">{spiller.initials}</div>
              <div>
                <div className="nm">{spiller.name}</div>
                <div className="sub">
                  A1 · HCP {spiller.hcp} · 12/36 tester gjennomført
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span
                  className="te-pyr te-pyr-slag"
                  style={{ background: "var(--forest)", color: "var(--lime)" }}
                >
                  A1
                </span>
              </div>
            </div>

            {/* Velg test */}
            <div>
              <div className="te-field-lbl">
                Velg test <span className="req">*</span>
              </div>

              <div className="te-search-input">
                <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Søk test, disiplin, mål …"
                />
                <kbd
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--muted)",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    padding: "2px 6px",
                  }}
                >
                  ⌘K
                </kbd>
              </div>

              <div className="te-pyr-filters">
                {PYRAMID_FILTERS.map((f) => {
                  const count =
                    f === "Alle" ? totalCount : pyrCounts[f] ?? 0;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFilter(f)}
                      className={`te-pyr-filter ${activeFilter === f ? "active" : ""}`}
                    >
                      {f} <span className="ct">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="te-test-results">
                {filteredTests.slice(0, 4).map((t) => {
                  const isSelected = t.id === selectedTestId;
                  return (
                    <div
                      key={t.id}
                      className={`te-test-row ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedTestId(t.id)}
                    >
                      <div>
                        <span className={PYR_CLASS[t.pyramidArea]}>{t.pyramidArea}</span>
                      </div>
                      <div>
                        <div className="ttl">{t.name}</div>
                        <div className="sub">{t.description}</div>
                      </div>
                      <div className="check">
                        {isSelected ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
                      </div>
                    </div>
                  );
                })}
                {filteredTests.length === 0 ? (
                  <div
                    className="font-mono"
                    style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 12 }}
                  >
                    Ingen tester matcher
                  </div>
                ) : null}
              </div>
            </div>

            {/* Frist (valgfritt) */}
            <div>
              <div className="te-field-lbl">Frist (valgfritt)</div>
              <input
                type="date"
                value={dato}
                onChange={(e) => setDato(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  padding: "0 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--ink)",
                }}
              />
            </div>

            {/* Notat */}
            <div>
              <div className="te-field-lbl">Notat til spiller</div>
              <textarea
                className="te-textarea"
                value={notat}
                onChange={(e) => setNotat(e.target.value)}
                rows={4}
                placeholder="Hva skal spilleren ha i tankene før testen?"
              />
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: "var(--subtle)",
                  letterSpacing: "0.04em",
                  marginTop: 4,
                }}
              >
                Spilleren får varsel i appen · {notat.length} / 280 tegn
              </div>
            </div>
          </div>

          <footer className="tester-modal-foot">
            {feil && (
              <span className="font-mono text-[11px] text-destructive" style={{ marginRight: "auto" }}>
                {feil}
              </span>
            )}
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="font-mono rounded-full bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="font-display inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              disabled={!selectedTestId || pending}
            >
              {pending ? "Tildeler…" : "Tildel test"}
              <ArrowRight className="h-3 w-3" />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

