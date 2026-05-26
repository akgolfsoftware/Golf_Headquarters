export function PlayerHQMockup() {
  const drills = [
    { tekst: "50-ball putting-runde", ferdig: true },
    { tekst: "Pitching 30–50 m (20 slag)", ferdig: true },
    { tekst: "Bane-runde 18 hull", ferdig: false },
  ];

  const sg = [
    { label: "OTT", verdi: 0.6, positiv: true },
    { label: "APP", verdi: -0.3, positiv: false },
    { label: "ARG", verdi: -1.1, positiv: false },
    { label: "PUTT", verdi: 0.2, positiv: true },
  ];

  return (
    <div className="relative" style={{ perspective: "1400px" }}>
      {/* Glow under */}
      <div
        className="absolute inset-x-16 bottom-0 h-16 blur-3xl"
        style={{ background: "rgba(0,88,64,0.15)" }}
        aria-hidden="true"
      />

      <div
        className="relative overflow-hidden rounded-xl border border-border shadow-[0_32px_72px_rgba(0,0,0,0.18)]"
        style={{ transform: "rotateX(4deg) rotateY(-5deg)" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 bg-[#1c1c1e] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden="true" />
          <div className="mx-6 flex flex-1 items-center justify-center rounded-md bg-white/[0.07] px-4 py-1.5">
            <span className="font-mono text-[11px] text-white/40">
              akgolf.no/portal
            </span>
          </div>
        </div>

        {/* App shell */}
        <div className="flex h-[500px] overflow-hidden bg-background">
          {/* Sidebar */}
          <aside className="flex w-48 flex-shrink-0 flex-col bg-[#061210] text-white">
            <div className="px-6 py-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                AK Golf
              </span>
              <p className="mt-0.5 text-sm font-bold text-white">PlayerHQ</p>
            </div>

            <nav className="flex-1 space-y-0.5 px-4">
              {[
                { label: "Hjem", aktiv: true },
                { label: "Tren" },
                { label: "Mål" },
                { label: "Coach" },
                { label: "Bookinger" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-md px-4 py-2 text-[12px] ${
                    item.aktiv
                      ? "bg-white/10 font-semibold text-white"
                      : "text-white/50"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="border-t border-white/10 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-[#061210]">
                  M
                </div>
                <div>
                  <p className="text-[11px] font-medium text-white">Markus R.</p>
                  <p className="text-[10px] text-white/40">HCP −2,4</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
            {/* Greeting */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  Torsdag 15. mai 2026
                </p>
                <h2 className="mt-0.5 font-[var(--font-instrument-serif)] text-[22px] font-semibold text-foreground">
                  God morgen,{" "}
                  <em className="italic text-primary">Markus</em>
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Neste økt: fredag 16. mai · 14:00 · Golfhuset Fredrikstad
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-bold text-[#061210]">
                HCP −2,4
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Credits igjen", verdi: "3", sub: "av 4 denne mnd" },
                { label: "Streak", verdi: "12", sub: "dager på rad" },
                { label: "SG 30 dager", verdi: "−0,8", sub: "mot scratch" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-1 font-mono text-[18px] font-semibold tabular-nums text-foreground">
                    {s.verdi}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Bottom row: plan + SG */}
            <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden">
              {/* Plan */}
              <div className="flex flex-col rounded-lg border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                    Denne uken
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] text-primary">
                    2 / 3
                  </span>
                </div>
                <div className="mt-2 flex-1 space-y-2.5">
                  {drills.map((d) => (
                    <div key={d.tekst} className="flex items-center gap-2">
                      <div
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          d.ferdig
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {d.ferdig && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-[11px] ${
                          d.ferdig
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {d.tekst}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SG chart */}
              <div className="flex flex-col rounded-lg border border-border bg-white p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                  Strokes Gained
                </p>
                <div className="mt-2 flex flex-1 items-end gap-2">
                  {sg.map((b) => {
                    const høyde = Math.round(Math.abs(b.verdi) * 80 + 12);
                    const farge = b.positiv ? "hsl(var(--primary))" : "hsl(var(--destructive))";
                    return (
                      <div
                        key={b.label}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <span
                          className="font-mono text-[9px] font-semibold"
                          style={{ color: farge }}
                        >
                          {b.verdi > 0 ? "+" : ""}
                          {b.verdi}
                        </span>
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: `${høyde}px`,
                            backgroundColor: `${farge}22`,
                          }}
                        >
                          <div
                            className="w-full rounded-sm"
                            style={{
                              height: `${høyde - 4}px`,
                              backgroundColor: farge,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {b.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
