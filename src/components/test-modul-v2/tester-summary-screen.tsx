/**
 * /portal/test/[testId]/summary — pixel-perfekt port av
 *   - docs/design-handoff/test-modul/tester-summary-pr.html (Ny PR)
 *   - docs/design-handoff/test-modul/tester-summary-progress.html (uten PR)
 *
 * Variant velges via prop. Pixel-perfekt mockup-versjon.
 */

import "../planlegge-v2/styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "../planlegge-v2/icons";

export function TesterSummaryScreen({ variant = "pr" }: { variant?: "pr" | "progress" }) {
  const isPR = variant === "pr";
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      {/* Confetti — kun PR-variant */}
      {isPR && (
        <div className="confetti" aria-hidden="true">
          {[
            { l: "8%", t: "18%", w: "10px", h: "10px", bg: "var(--lime)", rot: 20 },
            { l: "18%", t: "10%", w: "6px", h: "14px", bg: "var(--forest)", rot: -10 },
            { l: "32%", t: "28%", w: "8px", h: "8px", bg: "var(--lime-deep)", round: true },
            { l: "78%", t: "14%", w: "8px", h: "14px", bg: "var(--lime)", rot: 30 },
            { l: "88%", t: "26%", w: "10px", h: "10px", bg: "var(--forest)", round: true },
            { l: "92%", t: "42%", w: "6px", h: "12px", bg: "var(--lime)", rot: -20 },
            { l: "4%", t: "42%", w: "8px", h: "8px", bg: "var(--warn)", rot: 15 },
            { l: "14%", t: "62%", w: "6px", h: "14px", bg: "var(--lime-deep)", rot: 45 },
            { l: "84%", t: "60%", w: "10px", h: "10px", bg: "var(--lime)", rot: -30 },
          ].map((c, i) => (
            <span
              key={i}
              className="c-dot"
              style={{
                left: c.l,
                top: c.t,
                width: c.w,
                height: c.h,
                background: c.bg,
                ...(c.rot ? { transform: `rotate(${c.rot}deg)` } : {}),
                ...(c.round ? { borderRadius: "50%" } : {}),
              }}
            />
          ))}
        </div>
      )}

      <div className="shell" style={{ position: "relative", zIndex: 1 }}>
        <header className="min-top">
          <Link
            className="back"
            href="/portal"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-left" /></svg>
            PlayerHQ
          </Link>
          <span className="right">
            <span className="ok-dot" /> Test fullført · synket
          </span>
        </header>

        <div className="page narrow">
          {/* HERO */}
          <section className="hero-center">
            <div className="check-circle">
              <svg fill="none" stroke="currentColor"><use href="#i-check-circle" /></svg>
            </div>

            {isPR && (
              <div className="pr-eyebrow">
                <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-trophy" /></svg>
                NY PERSONLIG REKORD
              </div>
            )}

            <h1>
              {isPR ? (
                <>
                  Ny personlig <em>rekord!</em>
                </>
              ) : (
                <>
                  Bra <em>fremgang</em>
                </>
              )}
            </h1>

            <div className="sub">Driver Basic · 9. forsøk · PEI</div>

            <div className="pr-score">
              <span className="num">0,054</span>
            </div>

            <div className="pr-delta">
              <svg fill="none" stroke="currentColor"><use href="#i-trend-up" /></svg>
              {isPR ? "+0,008 mot 12. mai (67,4 → 0,054)" : "+0,003 mot 14. apr (0,057 → 0,054)"}
            </div>

            <p className="serif-quote">
              {isPR
                ? "5 driver-slag på rad. Snitt carry 246 m, sideavvik +1 m. Tightest spread du har levert siden januar."
                : "Solid økning vs forrige forsøk. Du nærmer deg PR (0,054) med jevn fremgang."}
            </p>
          </section>

          {/* 3 stats */}
          <section className="stat3" style={{ marginTop: "36px" }}>
            <div className={`s3${isPR ? " lime" : ""}`}>
              <div className="ic">
                <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-trophy" /></svg>
              </div>
              <div className="lbl">Personlig rekord</div>
              <div className="val">0,054</div>
              <div className="sub" style={isPR ? { color: "var(--forest)" } : undefined}>
                {isPR ? "Ny · i dag 14:24" : "28. apr 2026"}
              </div>
            </div>
            <div className="s3">
              <div className="ic">
                <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-target" /></svg>
              </div>
              <div className="lbl">Snitt PEI</div>
              <div className="val">0,074</div>
              <div className="sub">Over 9 forsøk</div>
            </div>
            <div className="s3">
              <div className="ic">
                <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-list" /></svg>
              </div>
              <div className="lbl">Antall forsøk</div>
              <div className="val">9</div>
              <div className="sub">Siden januar 2026</div>
            </div>
          </section>

          {/* benchmark */}
          <section className="bench" style={{ marginTop: "14px" }}>
            <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-trophy" /></svg>
            <div className="txt">
              <strong>PGA Tour Top 40 — snitt PEI &lt; 0,06.</strong> Du leverte 0,054 — under benchmark. Lim-deep zone.
            </div>
          </section>

          {/* Hva nå */}
          <section className="card" style={{ marginTop: "20px" }}>
            <div className="card-h" style={{ marginBottom: "8px" }}>
              <h2>Hva nå?</h2>
            </div>

            {[
              <>
                <strong>Resultatet er sendt automatisk til coach Anders.</strong> Han ser det i AgencyOS med en gang.
              </>,
              <>
                Ta samme test om <strong>14 dager</strong> for å måle om PEI under 0,06 holder seg konsistent.
              </>,
              <>
                Sammenlign mot <strong>A1-kohort</strong> på test-detalj — du er nå <strong>96. percentil</strong>.
              </>,
            ].map((txt, i) => (
              <div key={i} className="next-row">
                <div className="dot">
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5"><use href="#i-check" /></svg>
                </div>
                <div className="txt">{txt}</div>
              </div>
            ))}
          </section>

          {/* footer CTAs */}
          <section className="foot-cta" style={{ marginTop: "18px" }}>
            <Link className="btn btn-outline" href="/portal/tren/tester/demo">
              Tilbake til Driver Basic
            </Link>
            <Link className={`btn ${isPR ? "pr-gradient-btn" : "btn-primary"}`} href="/portal/tren/tester">
              Alle tester
              <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-arrow-right" /></svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
