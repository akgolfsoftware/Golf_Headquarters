"use client";

/**
 * QuizShell — full Buzzfeed-stil quiz med state.
 * Intro → 10 spørsmål → resultat.
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import { QUIZ_SPORSMAL, KATEGORI_LABELS, type QuizSporsmal } from "@/data/quiz-questions";
import { CountUp } from "@/components/stats/count-up";
import { StatsQuizCard } from "@/components/stats/stats-quiz-card";

type QuizState = "intro" | "sporsmal" | "feedback" | "resultat";

interface KategoriScore {
  riktige: number;
  totalt: number;
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 999,
            background: i < current
              ? "var(--s-primary)"
              : i === current
              ? "var(--s-accent)"
              : "var(--s-border)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function KategoriPrikker({ riktige, totalt }: { riktige: number; totalt: number }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: totalt }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 12, height: 12,
            borderRadius: "50%",
            background: i < riktige ? "var(--s-primary)" : "var(--s-border)",
          }}
        />
      ))}
    </div>
  );
}

export function QuizShell() {
  const [state, setState] = useState<QuizState>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [svar, setSvar] = useState<boolean[]>([]);
  const [showDelModal, setShowDelModal] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  const sporsmal = QUIZ_SPORSMAL[currentIdx];
  const totalt = QUIZ_SPORSMAL.length;
  const riktige = svar.filter(Boolean).length;

  const percentile = Math.round((riktige / totalt) * 100);

  // Per-kategori
  const kategoriScore: Record<string, KategoriScore> = {};
  QUIZ_SPORSMAL.forEach((q, i) => {
    const k = q.kategori;
    if (!kategoriScore[k]) kategoriScore[k] = { riktige: 0, totalt: 0 };
    kategoriScore[k].totalt++;
    if (svar[i]) kategoriScore[k].riktige++;
  });

  const handleSvar = useCallback(
    (korrekt: boolean) => {
      const newSvar = [...svar, korrekt];
      setSvar(newSvar);
      if (currentIdx < totalt - 1) {
        setCurrentIdx((i) => i + 1);
        setState("sporsmal");
      } else {
        setState("resultat");
      }
    },
    [svar, currentIdx, totalt],
  );

  const reset = () => {
    setState("intro");
    setCurrentIdx(0);
    setSvar([]);
    setShowDelModal(false);
  };

  const twitterTekst = encodeURIComponent(
    `Jeg fikk ${riktige}/${totalt} pa AK Golf-statistikk-quizen! Klarer du a sla meg? akgolf.no/stats/quiz`
  );

  const handleKopier = () => {
    navigator.clipboard.writeText("https://akgolf.no/stats/quiz").then(() => {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    });
  };

  /* ── INTRO ── */
  if (state === "intro") {
    return (
      <div className="stats-quiz-center">
        <div className="stats-quiz-intro">
          <div className="stats-quiz-eyebrow">AK GOLF STATS · QUIZ</div>
          <h1 className="stats-quiz-intro-headline">
            Hvor mye vet du om <em style={{ fontStyle: "italic", color: "var(--s-primary)" }}>proffene</em>?
          </h1>
          <div className="stats-quiz-intro-meta">
            10 SPORSMAL · 3 MINUTTER · DEL RESULTATET
          </div>
          <div className="stats-quiz-intro-dots">
            {["?", "·", "?", "·", "?"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 40, height: 40,
                  borderRadius: "50%",
                  background: c === "?" ? "var(--s-secondary)" : "transparent",
                  border: c === "?" ? "2px solid var(--s-border)" : "none",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: c === "?" ? 18 : 14,
                  color: "var(--s-muted-fg)",
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <button
            className="stats-btn stats-btn-primary stats-btn-lg"
            onClick={() => setState("sporsmal")}
            style={{ marginTop: 16 }}
          >
            START QUIZ →
          </button>
        </div>
      </div>
    );
  }

  /* ── SPØRSMÅL ── */
  if (state === "sporsmal" && sporsmal) {
    return (
      <div className="stats-quiz-center">
        <div className="stats-quiz-sporsmal-wrap">
          {/* Header */}
          <div className="stats-quiz-header">
            <div className="stats-quiz-progress-label">
              SPORSMAL {currentIdx + 1} AV {totalt}
            </div>
            <div className="stats-quiz-score-label">
              {riktige} RIKTIGE SA LANGT
            </div>
          </div>
          <ProgressDots total={totalt} current={currentIdx} />
          <StatsQuizCard
            sporsmal={sporsmal}
            nummer={currentIdx + 1}
            totalt={totalt}
            onSvar={handleSvar}
          />
        </div>
      </div>
    );
  }

  /* ── RESULTAT ── */
  if (state === "resultat") {
    return (
      <div className="stats-quiz-center">
        <div className="stats-quiz-resultat">
          <div className="stats-quiz-eyebrow" style={{ textAlign: "center" }}>RESULTAT</div>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--s-muted-fg)" }}>Du fikk</span>
          </div>
          <div className="stats-quiz-big-score">
            <CountUp value={riktige} duration={1200} />
            <span className="stats-quiz-big-score-denom"> / {totalt}</span>
          </div>
          <div className="stats-quiz-percentile">
            Du er bedre enn {percentile}% av alle som har tatt denne quizen.
          </div>

          {/* Per kategori */}
          <div className="stats-quiz-kategorier">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 16 }}>
              PER KATEGORI
            </div>
            {Object.entries(kategoriScore).map(([k, v]) => (
              <div key={k} className="stats-quiz-kategori-row">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, minWidth: 120 }}>
                  {KATEGORI_LABELS[k as QuizSporsmal["kategori"]] ?? k}:
                </span>
                <KategoriPrikker riktige={v.riktige} totalt={v.totalt} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--s-muted-fg)" }}>
                  {v.riktige}/{v.totalt}
                </span>
              </div>
            ))}
          </div>

          {/* CTAer */}
          <div className="stats-quiz-ctas">
            <button
              className="stats-btn stats-btn-primary stats-btn-lg"
              onClick={() => setShowDelModal(true)}
            >
              Del resultatet →
            </button>
            <button
              className="stats-btn stats-btn-secondary stats-btn-md"
              onClick={reset}
            >
              Prøv igjen
            </button>
          </div>

          {/* Mersalg */}
          <div className="stats-quiz-mersalg">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 12 }}>
              LIKER DU STATS? FOLG DINE EGNE.
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>
              PlayerHQ regner ut din egen SG automatisk. Da kan du ta quiz-en om deg selv.
            </p>
            <Link href="/portal" className="stats-btn stats-btn-secondary stats-btn-sm" style={{ textDecoration: "none", display: "inline-flex" }}>
              Prøv PlayerHQ gratis →
            </Link>
          </div>

          {/* Relatert */}
          <div className="stats-quiz-relatert">
            <Link href="/stats" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)", textDecoration: "none" }}>
              ← Tilbake til Stats Hub
            </Link>
          </div>
        </div>

        {/* Del-modal */}
        {showDelModal && (
          <div
            className="stats-quiz-modal-overlay"
            onClick={() => setShowDelModal(false)}
          >
            <div
              className="stats-quiz-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--s-muted-fg)", marginBottom: 16 }}>
                DEL RESULTATET
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                {riktige}/{totalt}
              </div>
              <p style={{ fontSize: 14, color: "var(--s-muted-fg)", textAlign: "center", marginBottom: 28 }}>
                Golf-statistikk quiz · AK Golf Stats
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href={`https://x.com/intent/tweet?text=${twitterTekst}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stats-btn stats-btn-primary stats-btn-md"
                  style={{ textDecoration: "none", textAlign: "center" }}
                >
                  Del pa X / Twitter
                </a>
                <button
                  className="stats-btn stats-btn-secondary stats-btn-md"
                  onClick={handleKopier}
                >
                  {kopiert ? "Kopiert!" : "Kopier lenke"}
                </button>
              </div>
              <button
                onClick={() => setShowDelModal(false)}
                style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--s-muted-fg)" }}
              >
                LUKK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
