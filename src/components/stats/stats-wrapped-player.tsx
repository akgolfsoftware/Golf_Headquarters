"use client";

/**
 * StatsWrappedPlayer — client-side slide player for Spotify Wrapped-style rapport
 * Handles: auto-play, pause, keyboard nav, swipe, progress dots.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { StatsWrappedSlide, type WrappedSlideData } from "./stats-wrapped-slide";

interface StatsWrappedPlayerProps {
  slides: WrappedSlideData[];
  delLenke: string;
}

const AUTO_PLAY_MS = 3000;

export function StatsWrappedPlayer({ slides, delLenke }: StatsWrappedPlayerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  // Auto-play
  useEffect(() => {
    if (paused || current === slides.length - 1) return;
    timerRef.current = setTimeout(goNext, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, goNext, slides.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const slide = slides[current];
  const bgVariant = slide?.bgVariant ?? "forest";
  const bgStyles: Record<string, string> = {
    forest: "linear-gradient(160deg, #005840 0%, #003D2C 100%)",
    "forest-dark": "linear-gradient(160deg, #002A1A 0%, #001510 100%)",
    lime: "linear-gradient(160deg, #D1F843 0%, #B8E020 100%)",
    offwhite: "linear-gradient(160deg, #FAFAF7 0%, #F1EEE5 100%)",
  };
  const isDark = bgVariant === "forest" || bgVariant === "forest-dark";
  const uiColor = isDark ? "rgba(250,250,247,0.8)" : "rgba(10,31,23,0.6)";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: bgStyles[bgVariant] ?? bgStyles.forest,
        borderRadius: 24,
        overflow: "hidden",
        userSelect: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars */}
      <div style={{
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        display: "flex",
        gap: 4,
        zIndex: 10,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 999,
              background: i < current
                ? (isDark ? "rgba(250,250,247,0.9)" : "rgba(10,31,23,0.7)")
                : i === current
                ? (isDark ? "hsl(var(--accent))" : "hsl(var(--primary))")
                : (isDark ? "rgba(250,250,247,0.3)" : "rgba(10,31,23,0.2)"),
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Pause / Play toggle */}
      <button
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Spill av" : "Pause"}
        style={{
          position: "absolute",
          top: 32,
          right: 16,
          zIndex: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: uiColor,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          padding: 8,
        }}
      >
        {paused ? "SPILL" : "PAUSE"}
      </button>

      {/* Skip to end */}
      {current < slides.length - 1 && (
        <button
          onClick={() => setCurrent(slides.length - 1)}
          aria-label="Hopp til slutten"
          style={{
            position: "absolute",
            top: 32,
            left: 16,
            zIndex: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: uiColor,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            padding: 8,
          }}
        >
          HOPP TIL SLUTT
        </button>
      )}

      {/* Slide content — fills remaining space */}
      <div style={{ flex: 1, display: "flex", paddingTop: 64, paddingBottom: 80 }}>
        <StatsWrappedSlide
          slide={slide}
          isActive={true}
          delLenke={delLenke}
        />
      </div>

      {/* Tap zones (left = prev, right = next) */}
      <div
        onClick={goPrev}
        style={{
          position: "absolute",
          left: 0,
          top: 64,
          width: "40%",
          bottom: 80,
          cursor: current === 0 ? "default" : "w-resize",
        }}
        aria-hidden="true"
      />
      <div
        onClick={goNext}
        style={{
          position: "absolute",
          right: 0,
          top: 64,
          width: "40%",
          bottom: 80,
          cursor: current === slides.length - 1 ? "default" : "e-resize",
        }}
        aria-hidden="true"
      />

      {/* Arrow buttons */}
      {current > 0 && (
        <button
          onClick={goPrev}
          aria-label="Forrige slide"
          style={{
            position: "absolute",
            left: 16,
            bottom: 24,
            zIndex: 10,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            color: isDark ? "hsl(var(--background))" : "hsl(var(--foreground))",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          ←
        </button>
      )}
      {current < slides.length - 1 && (
        <button
          onClick={goNext}
          aria-label="Neste slide"
          style={{
            position: "absolute",
            right: 16,
            bottom: 24,
            zIndex: 10,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            color: isDark ? "hsl(var(--background))" : "hsl(var(--foreground))",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          →
        </button>
      )}
    </div>
  );
}
