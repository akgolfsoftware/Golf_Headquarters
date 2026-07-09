"use client";

/**
 * /admin/spillere/[id]/tildel-test — port av
 * docs/design-handoff/test-modul/tildel-test-modal.html
 *
 * Renderet som full-page modal med fadet coach-bakgrunn.
 * Koblet til ekte test-tildeling via tildelTest-action
 * (samme som /admin/tester/tildel/[spillerId]).
 */

import "../planlegge-v2/styles.css";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlanleggeSprite } from "../planlegge-v2/icons";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";

type TestItem = {
  id: string;
  name: string;
  description: string;
  pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
};

const PYRAMID_FILTERS = ["Alle", "FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export function TildelTestModalScreen({
  playerId,
  playerName = "Øyvind Rohjan",
  playerInitials = "ØR",
  tester,
  pyrCounts,
}: {
  playerId: string;
  playerName?: string;
  playerInitials?: string;
  tester: TestItem[];
  pyrCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<(typeof PYRAMID_FILTERS)[number]>("Alle");
  const [selectedTestId, setSelectedTestId] = useState<string>(tester[0]?.id ?? "");
  const [dato, setDato] = useState<string>("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredTests = useMemo(() => {
    return tester.filter((t) => {
      if (activeFilter !== "Alle" && t.pyramidArea !== activeFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tester, activeFilter, search]);

  const totalCount = tester.length;

  function handleSend() {
    setFeil(null);
    startTransition(async () => {
      const res = await tildelTest({
        spillerId: playerId,
        testId: selectedTestId,
        note: notat,
        dueDate: dato || undefined,
      });
      if (res.ok) router.push(`/admin/spillere/${playerId}/tester`);
      else setFeil(res.error ?? "Kunne ikke tildele testen.");
    });
  }

  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <div className="behind" aria-hidden="true">
        <div className="b-side" />
        <div className="b-top" />
        <div className="b-hero" />
        <div className="b-card" style={{ top: "170px", left: "280px", width: "280px", height: "120px" }} />
        <div className="b-card" style={{ top: "170px", left: "580px", width: "280px", height: "120px" }} />
        <div className="b-card" style={{ top: "170px", left: "880px", width: "280px", height: "120px" }} />
        <div className="b-card" style={{ top: "310px", left: "280px", right: "40px", height: "280px" }} />
      </div>

      <div className="modal-backdrop">
        <div className="modal" role="dialog" aria-label="Tildel test">
          <div className="modal-head">
            <div>
              <div className="eye">AgencyOS · Stall · Spillere</div>
              <h2>
                Tildel test til <strong>{playerName}</strong>
              </h2>
            </div>
            <button
              type="button"
              className="modal-close"
              aria-label="Lukk"
              onClick={() => router.back()}
            >
              <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
            </button>
          </div>

          <div className="modal-body">
            {/* player chip */}
            <div className="ply-chip">
              <div className="av">{playerInitials}</div>
              <div>
                <div className="nm">{playerName}</div>
                <div className="sub">A1 · HCP 4.8 · 12/36 tester gjennomført</div>
              </div>
              <div className="right">
                <span className="pill pill-pro">A1</span>
              </div>
            </div>

            {/* velg test */}
            <div className="field">
              <div className="field-lbl">
                Velg test <span className="req">*</span>
              </div>

              <div className="search-input">
                <svg fill="none" stroke="currentColor"><use href="#i-search" /></svg>
                <input
                  placeholder="Søk test, disiplin, mål …"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd>⌘K</kbd>
              </div>

              <div className="pyr-filters">
                {PYRAMID_FILTERS.map((f) => {
                  const count = f === "Alle" ? totalCount : pyrCounts[f] ?? 0;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setActiveFilter(f)}
                      className={`pyr-filter${activeFilter === f ? " active" : ""}`}
                    >
                      {f} <span className="ct">{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="test-results">
                {filteredTests.map((t) => {
                  const isSelected = t.id === selectedTestId;
                  const kind = t.pyramidArea.toLowerCase();
                  return (
                    <div
                      key={t.id}
                      className={`test-row${isSelected ? " selected" : ""}`}
                      onClick={() => setSelectedTestId(t.id)}
                    >
                      <div className="pyr-cell">
                        <span className={`pyr pyr-${kind}`}>{t.pyramidArea}</span>
                      </div>
                      <div>
                        <div className="ttl">{t.name}</div>
                        <div className="sub">{t.description}</div>
                      </div>
                      <div className="check">
                        {isSelected && (
                          <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredTests.length === 0 && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--muted)",
                      padding: "24px",
                      textAlign: "center",
                    }}
                  >
                    Ingen tester matcher
                  </div>
                )}
              </div>
            </div>

            {/* frist (valgfritt) */}
            <div className="field">
              <div className="field-lbl">Frist (valgfritt)</div>
              <input
                type="date"
                value={dato}
                onChange={(e) => setDato(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  padding: "0 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--ink)",
                }}
              />
            </div>

            {/* notat */}
            <div className="field">
              <div className="field-lbl">Notat til spiller</div>
              <textarea
                className="textarea"
                placeholder={`Hva skal ${playerName.split(" ")[0]} ha i tankene før testen?`}
                value={notat}
                onChange={(e) => setNotat(e.target.value)}
              />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--subtle)", letterSpacing: "0.04em", marginTop: "4px" }}>
                Spilleren får varsel i appen · {notat.length} / 280 tegn
              </div>
            </div>
          </div>

          <div className="modal-foot">
            {feil && (
              <span
                className="ghost"
                style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--destructive, #A32D2D)" }}
              >
                {feil}
              </span>
            )}
            <button type="button" className="btn btn-ghost ghost" onClick={() => router.back()} disabled={pending}>
              Avbryt
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!selectedTestId || pending}
            >
              {pending ? "Tildeler…" : "Tildel test"}
              <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
