"use client";

import { useState } from "react";

const baseH = [150, 120, 78];
const suppH = [62, 92, 134];
const tags = ["Spiller A", "Spiller B", "Spiller C"];

export function EquitySection() {
  const [mode, setMode] = useState<"tilp" | "lik">("tilp");

  const caption =
    mode === "tilp"
      ? "Ulik støtte (lime) løfter alle opp til samme mål."
      : "Lik støtte til alle: noen når målet, andre kommer til kort.";

  return (
    <div className="cols-split">
      <div>
        <p className="eyebrow reveal d1">
          <span className="num">02</span>
          <span className="tick" />
          Hvorfor vi deler gruppa
        </p>
        <h2 className="display d-1 reveal d2" style={{ marginTop: 18 }}>
          «Rettferdig» betyr at alle får hjelp med akkurat det{" "}
          <em className="key">de</em> trenger
        </h2>
        <p className="lead muted reveal d3" style={{ marginTop: 24 }}>
          Ikke at alle gjør det samme. Spillerne våre står på ulike steder i
          utviklingen. Én felles økt vil alltid treffe noen perfekt — og bomme
          for resten.
        </p>
        <p className="body reveal d3" style={{ marginTop: 20, maxWidth: "54ch" }}>
          Å dele gruppa er ikke sortering. Det er å ta hver enkelt på alvor. Alle
          er fortsatt i GFGK-elitesatsingen — vi møter dem bare der de faktisk er.
        </p>
        <div className="reveal d4" style={{ marginTop: 28 }}>
          <span className="toggle" role="group" aria-label="Bytt visning">
            <button
              type="button"
              className={mode === "lik" ? "on" : undefined}
              onClick={() => setMode("lik")}
            >
              Lik behandling
            </button>
            <button
              type="button"
              className={mode === "tilp" ? "on" : undefined}
              onClick={() => setMode("tilp")}
            >
              Tilpasset
            </button>
          </span>
        </div>
      </div>

      <div className="card card-xl reveal d3">
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          Samme mål · ulik støtte
        </p>
        <div className="equity">
          <div className="goal">
            <span className="label">Utvikle seg best mulig</span>
          </div>
          {[0, 1, 2].map((i) => (
            <div className="athlete" key={i}>
              <div
                className="support"
                style={{ height: mode === "tilp" ? suppH[i] : 0 }}
              />
              <div className="base" style={{ height: baseH[i] }} />
              <div className="floor" />
              <span className="tag">{tags[i]}</span>
            </div>
          ))}
        </div>
        <p
          className="small muted"
          style={{
            marginTop: 22,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          {caption}
        </p>
      </div>
    </div>
  );
}
