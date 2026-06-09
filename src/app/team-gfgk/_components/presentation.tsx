"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GfgkData } from "../data";
import { EquitySection } from "./equity-section";
import { PyramidSection } from "./pyramid-section";
import { Spread } from "./spread";
import { PlayerCards } from "./player-cards";
import { ResultsTable } from "./results-table";

const SECTION_COUNT = 8;
const STORE_KEY = "gfgk-deck-foreldre";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function Presentation({ data }: { data: GfgkData }) {
  const deckRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);

  const go = useCallback((i: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    const target = Math.max(0, Math.min(SECTION_COUNT - 1, i));
    const sections = deck.querySelectorAll<HTMLElement>(".section, .cover");
    sections[target]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Observer: marker mest synlige seksjon som aktiv
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const sections = Array.from(
      deck.querySelectorAll<HTMLElement>(".section, .cover"),
    );
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const k = sections.indexOf(e.target as HTMLElement);
          if (k >= 0) ratios.set(k, e.intersectionRatio);
        });
        let maxRatio = 0;
        let idx = 0;
        sections.forEach((_, k) => {
          const r = ratios.get(k) ?? 0;
          if (r > maxRatio) {
            maxRatio = r;
            idx = k;
          }
        });
        setCurrent(idx);
      },
      {
        root: deck,
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
      },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Tastatur-navigasjon
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        (e.key === " " && !e.shiftKey)
      ) {
        e.preventDefault();
        go(current + 1);
      } else if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "PageUp" ||
        (e.key === " " && e.shiftKey)
      ) {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(SECTION_COUNT - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  // Gjenopprett posisjon
  useEffect(() => {
    let saved = 0;
    try {
      saved = parseInt(localStorage.getItem(STORE_KEY) || "0", 10) || 0;
    } catch {
      saved = 0;
    }
    if (saved > 0 && saved < SECTION_COUNT) {
      requestAnimationFrame(() => go(saved));
    }
    // kjør kun ved montering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lagre posisjon
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, String(current));
    } catch {
      /* ignore */
    }
  }, [current]);

  const active = (i: number) =>
    current === i ? { "data-active": "" } : {};

  return (
    <div className="gfgk-deck">
      <div
        className="progress"
        style={{ width: `${(current / (SECTION_COUNT - 1)) * 100}%` }}
      />

      <header className={`topbar${current === 0 ? " on-photo" : ""}`}>
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/team-gfgk/logo-primary-on-light.svg" alt="AK Golf HQ" />
          <span className="sep" />
          <span className="club">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/team-gfgk/partner-gfgk.png" alt="GFGK" />
            <span className="full">GFGK Junior · Elite</span>
          </span>
        </div>
      </header>

      <main className="deck" ref={deckRef}>
        {/* 1 · COVER */}
        <section className="cover" {...active(0)}>
          <div className="bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/team-gfgk/hero-putting-green.webp"
              alt="Putting green i morgenlys"
            />
          </div>
          <div className="scrim-top" />
          <div className="scrim-bot" />
          <div className="inner">
            <p className="eyebrow reveal d1">
              <span className="tick" />
              GFGK Junior · Elitesatsing · Foreldremøte
            </p>
            <h1
              className="display d-hero reveal d2"
              style={{ marginTop: 20, maxWidth: "16ch" }}
            >
              Hver spiller, sin <em className="key">egen</em> reise
            </h1>
            <p
              className="lead reveal d3"
              style={{ marginTop: 24, maxWidth: "54ch" }}
            >
              Vi har delt elitegruppa i mindre treningsgrupper. Ikke for å
              rangere — men for at hver enkelt skal få akkurat det de trenger for
              å utvikle seg best mulig.
            </p>
          </div>
          <div className="scroll-hint">
            <span>Scroll eller bruk piltastene</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* 2 · HVORFOR VI DELER */}
        <section className="section" {...active(1)}>
          <div className="wrap">
            <EquitySection />
          </div>
        </section>

        {/* 3 · PYRAMIDEN */}
        <section className="section section-tight" {...active(2)}>
          <div className="wrap" style={{ marginTop: "auto", marginBottom: "auto" }}>
            <div className="section-head" style={{ maxWidth: 720 }}>
              <p className="eyebrow reveal d1">
                <span className="num">03</span>
                <span className="tick" />
                Det faglige fundamentet
              </p>
              <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                Utvikling bygges <em className="key">nedenfra</em> og opp
              </h2>
              <p className="lead muted reveal d3" style={{ marginTop: 20 }}>
                Vi bygger en spiller nedenfra og opp, som en pyramide. Det
                nederste må sitte før det øverste gir mening. Klikk på et lag
                for å se hva vi mener.
              </p>
            </div>
            <PyramidSection />
          </div>
        </section>

        {/* 4 · SPENNET */}
        <section className="section" {...active(3)}>
          <div className="wrap">
            <div className="section-head" style={{ maxWidth: 720 }}>
              <p className="eyebrow reveal d1">
                <span className="num">04</span>
                <span className="tick" />
                Slik ser nåståstedet ut
              </p>
              <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                Spennet i gruppa er <em className="key">stort</em> — derfor deler
                vi
              </h2>
              <p className="lead muted reveal d3" style={{ marginTop: 20 }}>
                Hver prikk er en spiller, anonymisert. Brutto snitt score på 18
                hull. Ingen navn, ingen rangering — bare den objektive grunnen
                til at én felles økt ikke kan treffe alle.
              </p>
            </div>
            <div className="card card-xl reveal d3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <p className="eyebrow" style={{ margin: 0 }}>
                  Brutto snitt score · 18 hull · 2025–2026
                </p>
                <p className="pyr-hint" style={{ margin: 0 }}>
                  Banejustert · vanskelig bane teller annerledes enn lett
                </p>
              </div>
              <Spread />
              <div className="grid g-3" style={{ marginTop: 28, gap: 24 }}>
                <div className="stat">
                  <div className="k">Lavest i gruppa</div>
                  <div className="v">74,0</div>
                </div>
                <div className="stat">
                  <div className="k">Høyest i gruppa</div>
                  <div className="v">104,2</div>
                </div>
                <div className="stat">
                  <div className="k">Spenn</div>
                  <div className="v" style={{ color: "var(--primary)" }}>
                    30,2
                  </div>
                </div>
              </div>
              <p className="body muted" style={{ marginTop: 24, maxWidth: "70ch" }}>
                Over{" "}
                <b style={{ color: "var(--foreground)" }}>30 slags forskjell</b>{" "}
                mellom ytterpunktene. En spiller som bygger teknisk grunnmur og
                en som finpusser turneringsspill, trenger fundamentalt ulike
                økter. Det er ikke en svakhet i gruppa — det er helt vanlig i et
                bredt aldersspenn.
              </p>
            </div>
          </div>
        </section>

        {/* 5 · SPILLERKORT */}
        <section className="section section-tight" {...active(4)}>
          <div
            className="wrap wrap-wide"
            style={{ marginTop: "auto", marginBottom: "auto" }}
          >
            <div className="section-head" style={{ maxWidth: 760 }}>
              <p className="eyebrow reveal d1">
                <span className="num">05</span>
                <span className="tick" />
                Spillerkort
              </p>
              <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                Hver spiller har sitt <em className="key">eget</em> kort
              </h2>
              <p className="lead muted reveal d3" style={{ marginTop: 20 }}>
                Ikke en rangeringsliste. Hvert kort viser spillerens eget
                nåståsted, hvor hovedfokuset ligger i pyramiden nå, og hva neste
                steg er. Tre treningsgrupper — fleksible, ikke låste.
              </p>
            </div>
            <div className="reveal d3">
              <PlayerCards />
            </div>
          </div>
        </section>

        {/* 6 · SPILLEREN EIER */}
        <section className="section" {...active(5)}>
          <div className="wrap">
            <div className="section-head" style={{ maxWidth: 760 }}>
              <p className="eyebrow reveal d1">
                <span className="num">06</span>
                <span className="tick" />
                Spilleren eier utviklingen
              </p>
              <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                Målet er en spiller som tar ansvar <em className="key">selv</em>
              </h2>
              <p className="lead muted reveal d3" style={{ marginTop: 20 }}>
                Spilleren setter ord på hva de jobber med og eier sine egne mål.
                De voksne rundt har ulike, tydelige roller — alle på samme lag.
              </p>
            </div>
            <div className="grid g-3 reveal d3">
              <div className="card card-pad-lg role-card">
                <span className="ico-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
                  </svg>
                </span>
                <h3 className="display d-3">Spilleren</h3>
                <p className="body muted">
                  Eier sin egen utvikling. Setter egne mål, sier fra om hva som
                  er vanskelig, og tar ansvar for treningen. Det er deres reise.
                </p>
                <span className="chip chip-accent" style={{ alignSelf: "flex-start" }}>
                  Eier
                </span>
              </div>
              <div className="card card-pad-lg role-card">
                <span className="ico-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                  </svg>
                </span>
                <h3 className="display d-3">Forelderen</h3>
                <p className="body muted">
                  Heier, legger til rette og stoler på planen. Støtter, styrer
                  ikke. Den tryggeste rollen er å være interessert — uten å overta
                  målene.
                </p>
                <span className="chip" style={{ alignSelf: "flex-start" }}>
                  <span className="dot" />
                  Støtter
                </span>
              </div>
              <div className="card card-pad-lg role-card">
                <span className="ico-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </span>
                <h3 className="display d-3">Treneren</h3>
                <p className="body muted">
                  Ser hvor spilleren er, lager planen og tilpasser økta. Bygger
                  grunnmuren i riktig rekkefølge, og flytter fokus når utviklingen
                  tilsier det.
                </p>
                <span className="chip" style={{ alignSelf: "flex-start" }}>
                  <span className="dot" />
                  Veileder
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 7 · VEIEN VIDERE */}
        <section className="section" {...active(6)}>
          <div className="wrap">
            <div className="cols-split">
              <div>
                <p className="eyebrow reveal d1">
                  <span className="num">07</span>
                  <span className="tick" />
                  Veien videre
                </p>
                <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                  Gruppene er <em className="key">fleksible</em> — ingen er låst
                </h2>
                <p className="lead muted reveal d3" style={{ marginTop: 22 }}>
                  En spiller flytter seg når utviklingen tilsier det. Vi
                  evaluerer jevnlig, og alle er fortsatt en del av
                  GFGK-elitesatsingen. Dette er en start, ikke en dom.
                </p>
              </div>
              <div className="reveal d3">
                <div className="principle">
                  <span className="n">01</span>
                  <div>
                    <h3 className="display d-3" style={{ fontSize: 20 }}>
                      Jevnlig evaluering
                    </h3>
                    <p className="body muted" style={{ marginTop: 6 }}>
                      Vi følger utviklingen tett og justerer gruppene gjennom
                      sesongen — ikke én gang i året.
                    </p>
                  </div>
                </div>
                <div className="principle">
                  <span className="n">02</span>
                  <div>
                    <h3 className="display d-3" style={{ fontSize: 20 }}>
                      Bevegelse begge veier
                    </h3>
                    <p className="body muted" style={{ marginTop: 6 }}>
                      Når grunnmuren sitter, flytter fokuset oppover i
                      pyramiden. Gruppen følger spilleren.
                    </p>
                  </div>
                </div>
                <div className="principle">
                  <span className="n">03</span>
                  <div>
                    <h3 className="display d-3" style={{ fontSize: 20 }}>
                      Ingen holdes utenfor
                    </h3>
                    <p className="body muted" style={{ marginTop: 6 }}>
                      Alle er i elitesatsingen. Differensiering handler om
                      innhold i økta, ikke om hvem som får være med.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="featured card-xl reveal d4"
              style={{ marginTop: 48, padding: "clamp(28px,4vw,44px)" }}
            >
              <div className="ball" />
              <p className="eyebrow">Takk for at dere kom</p>
              <h3
                className="display d-2 on-dark"
                style={{ marginTop: 16, maxWidth: "22ch" }}
              >
                Når hver spiller får det <em className="key">de</em> trenger,
                løfter vi hele gruppa.
              </h3>
              <p
                className="lead on-dark"
                style={{ marginTop: 18, maxWidth: "60ch", color: "rgba(245,244,238,0.85)" }}
              >
                Spørsmål er alltid velkomne — før, under og etter sesongen. Vi er
                på samme lag.
              </p>
            </div>
          </div>
        </section>

        {/* 8 · KOMPLETT RESULTATOVERSIKT */}
        <section className="section section-table" {...active(7)}>
          <div className="wrap wrap-wide">
            <div className="section-head" style={{ maxWidth: 760 }}>
              <p className="eyebrow reveal d1">
                <span className="num">08</span>
                <span className="tick" />
                Komplett resultatoversikt
              </p>
              <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
                Alle spillere, alle <em className="key">turneringer</em>
              </h2>
              <p className="lead muted reveal d3" style={{ marginTop: 20 }}>
                Hele gruppa samlet — med fulle navn, sesongtall og hver enkelt
                turnering. Klikk på en kolonne for å sortere, eller på en spiller
                for å se alle rundene.
              </p>
            </div>
            <div className="reveal d3">
              <ResultsTable data={data} />
            </div>
          </div>
        </section>
      </main>

      <nav className="navbar" aria-label="Seksjonsnavigasjon">
        <span className="counter">
          <span className="cur">{pad(current + 1)}</span> / {pad(SECTION_COUNT)}
        </span>
        <button
          type="button"
          className="nav-btn"
          aria-label="Forrige"
          disabled={current === 0}
          onClick={() => go(current - 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="dots">
          {Array.from({ length: SECTION_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot${current === i ? " active" : ""}`}
              aria-label={`Gå til seksjon ${i + 1}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="nav-btn"
          aria-label="Neste"
          disabled={current === SECTION_COUNT - 1}
          onClick={() => go(current + 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
