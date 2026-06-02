"use client";

/**
 * SpillerSok — client component for the player search panel.
 * Must be client because it contains onClick handlers on buttons.
 */

interface SpillerSokProps {
  name: "a" | "b";
  label: string;
  suggested: Array<{ slug: string; name: string; tier: string; birthYear: number | null }>;
  currentSlug?: string;
}

export function SpillerSok({ name, label, suggested, currentSlug }: SpillerSokProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E3DD",
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground))",
          marginBottom: 14,
        }}
      >
        {label}
      </div>

      <input
        name={name}
        type="text"
        defaultValue={currentSlug ?? ""}
        placeholder="Søk etter navn eller slug…"
        style={{
          width: "100%",
          border: "1px solid #E5E3DD",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#C4C0B8",
          margin: "16px 0 10px",
        }}
      >
        RASKE VALG
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {suggested.slice(0, 6).map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => {
              const input = document.querySelector(
                `input[name="${name}"]`,
              ) as HTMLInputElement | null;
              if (input) input.value = s.slug;
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: s.slug === currentSlug ? "rgba(0,88,64,0.06)" : "transparent",
              border: "1px solid transparent",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "hsl(var(--secondary))",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                color: "hsl(var(--primary))",
                flexShrink: 0,
              }}
            >
              {s.name
                .split(" ")
                .map((n) => n[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "hsl(var(--foreground))",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.tier} {s.birthYear ? `· f. ${s.birthYear}` : ""}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
