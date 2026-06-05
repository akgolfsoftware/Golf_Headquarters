/**
 * /admin/spillere/[id]/tildel-test — pixel-perfekt port av
 * docs/design-handoff/test-modul/tildel-test-modal.html
 *
 * Renderet som full-page modal med fadet coach-bakgrunn.
 */

import "../planlegge-v2/styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "../planlegge-v2/icons";

const TESTS = [
  { kind: "slag", title: "Putt 1–3 m", sub: "30 putt · 1m, 2m, 3m · % sunket · ~12 min", selected: true },
  { kind: "slag", title: "Putt 4–8 m", sub: "20 putt · 4m, 6m, 8m · proximity til hull · ~10 min" },
  { kind: "slag", title: "Putt langdistanse 10–20 m", sub: "15 putt · proximity 3-putt unngåelse · ~12 min" },
  { kind: "slag", title: "Chip landingsone 15 m", sub: "10 chip · 3m landingsone · % i sone · ~8 min" },
];

export function TildelTestModalScreen({ playerName = "Øyvind Rohjan", playerInitials = "ØR" }: { playerName?: string; playerInitials?: string }) {
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
              <div className="eye">CoachHQ · Stall · Spillere</div>
              <h2>
                Tildel test til <strong>{playerName}</strong>
              </h2>
            </div>
            <Link href="/admin/spillere" className="modal-close" aria-label="Lukk">
              <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
            </Link>
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
                <input placeholder="Søk test, disiplin, mål …" defaultValue="putt" />
                <kbd>⌘K</kbd>
              </div>

              <div className="pyr-filters">
                <button className="pyr-filter">
                  Alle <span className="ct">36</span>
                </button>
                <button className="pyr-filter">
                  FYS <span className="ct">8</span>
                </button>
                <button className="pyr-filter">
                  TEK <span className="ct">6</span>
                </button>
                <button className="pyr-filter active">
                  SLAG <span className="ct">9</span>
                </button>
                <button className="pyr-filter">
                  SPILL <span className="ct">5</span>
                </button>
                <button className="pyr-filter">
                  TURN <span className="ct">4</span>
                </button>
              </div>

              <div className="test-results">
                {TESTS.map((t, i) => (
                  <div key={i} className={`test-row${t.selected ? " selected" : ""}`}>
                    <div className="pyr-cell">
                      <span className={`pyr pyr-${t.kind}`}>{t.kind.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="ttl">{t.title}</div>
                      <div className="sub">{t.sub}</div>
                    </div>
                    <div className="check">
                      {t.selected && <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* date picker */}
            <div className="field">
              <div className="field-lbl">
                Planlagt dato <span className="req">*</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Mai 2026</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button className="btn btn-outline btn-xs" style={{ padding: "4px 10px" }}>← Apr</button>
                  <button className="btn btn-outline btn-xs" style={{ padding: "4px 10px" }}>Jun →</button>
                </div>
              </div>

              <div className="date-pick">
                {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
                  <div key={i} className="dh">{d}</div>
                ))}
                {[
                  ["27", "dim"],
                  ["28", "dim"],
                  ["29", "dim"],
                  ["30", "dim"],
                  ["1", ""],
                  ["2", ""],
                  ["3", ""],
                  ["4", ""],
                  ["5", ""],
                  ["6", ""],
                  ["7", ""],
                  ["8", ""],
                  ["9", ""],
                  ["10", ""],
                  ["11", ""],
                  ["12", ""],
                  ["13", ""],
                  ["14", ""],
                  ["15", ""],
                  ["16", ""],
                  ["17", ""],
                  ["18", ""],
                  ["19", ""],
                  ["20", ""],
                  ["21", ""],
                  ["22", ""],
                  ["23", "today"],
                  ["24", "has"],
                  ["25", "has"],
                  ["26", ""],
                  ["27", "sel"],
                  ["28", "has"],
                  ["29", ""],
                  ["30", ""],
                  ["31", ""],
                ].map(([d, cls], i) => (
                  <div key={`d${i}`} className={`dc${cls ? ` ${cls}` : ""}`}>{d}</div>
                ))}
              </div>

              <div className="suggested">
                <svg fill="none" stroke="currentColor"><use href="#i-zap" /></svg>
                <div>
                  <strong>Foreslått: onsdag 27. mai · 16:00</strong> — Øyvind har Teknisk-økt planlagt; passer å koble på testen før økten.
                </div>
              </div>
            </div>

            {/* notat */}
            <div className="field">
              <div className="field-lbl">Notat til spiller</div>
              <textarea
                className="textarea"
                placeholder="Hva skal Øyvind ha i tankene før testen?"
                defaultValue="Vi tar Putt 1–3m som baseline før vi øker volum til 90 putt/uke. Fokuser på pre-shot rutinen — 7 sekunder fra setup til putt. Lykke til."
              />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--subtle)", letterSpacing: "0.04em", marginTop: "4px" }}>
                Spilleren får varsel på mobil + e-post · 187 / 280 tegn
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button className="btn btn-ghost ghost">Avbryt</button>
            <button className="btn btn-outline">Lagre som utkast</button>
            <button className="btn btn-primary">
              Send forespørsel
              <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
