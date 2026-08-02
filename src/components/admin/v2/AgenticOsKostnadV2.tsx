/**
 * AgenticOS — kostnad og kvalitet. Server component, ren visning.
 *
 * Tre spørsmål loggen nå kan svare på: hva koster AI-en, hvilken promptversjon
 * fungerer, og hvorfor blir forslag avvist.
 *
 * Tall som ikke er dekkende blir merket, ikke pyntet. Mangler vi pris for en
 * modell, står kostnaden som ufullstendig framfor å vise en sum som ser
 * fullstendig ut.
 */

import type { AgenticOsOversikt } from "@/lib/agenticos/kostnad";

const kort: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 16,
  background: "var(--card)",
};

const dempet: React.CSSProperties = { color: "var(--muted-foreground)", fontSize: 13 };

const tallStil: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono), monospace",
  fontVariantNumeric: "tabular-nums",
};

function usd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function prosent(n: number): string {
  return `${(n * 100).toFixed(0)} %`;
}

function Seksjon({ tittel, hjelp, children }: {
  tittel: string;
  hjelp?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ ...kort, marginTop: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{tittel}</h3>
      {hjelp && <p style={{ ...dempet, margin: "4px 0 12px" }}>{hjelp}</p>}
      {children}
    </section>
  );
}

export function AgenticOsKostnadV2({ data }: { data: AgenticOsOversikt | null }) {
  if (!data) {
    return (
      <section style={{ ...kort, marginTop: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>AgenticOS — kostnad og kvalitet</h3>
        <p style={{ ...dempet, margin: "8px 0 0" }}>
          Loggen er ikke tilgjengelig. Er tabellen opprettet? Kjør{" "}
          <code>scripts/create-ai-interaksjoner-2026-08-02.ts</code>.
        </p>
      </section>
    );
  }

  const totalInteraksjoner = data.maaneder.reduce((a, m) => a + m.antall, 0);

  if (totalInteraksjoner === 0) {
    return (
      <section style={{ ...kort, marginTop: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>AgenticOS — kostnad og kvalitet</h3>
        <p style={{ ...dempet, margin: "8px 0 0" }}>
          Ingen AI-interaksjoner logget ennå. Tallene fylles etter hvert som planer genereres,
          Caddie brukes og agentene kjører.
        </p>
      </section>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 650 }}>AgenticOS — kostnad og kvalitet</h2>

      {data.modellerUtenPris.length > 0 && (
        <p
          style={{
            ...dempet,
            marginTop: 8,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          Kostnaden er ufullstendig: vi mangler pris for{" "}
          <strong>{data.modellerUtenPris.join(", ")}</strong>. Tokens telles, men kroner kan ikke
          regnes ut før satsene er lagt inn i <code>PRISER</code> i{" "}
          <code>src/lib/agenticos/kostnad.ts</code>. Tallene under er dermed et gulv, ikke totalen.
        </p>
      )}

      <Seksjon
        tittel="Forbruk per måned"
        hjelp="Måned bøttes i Oslo-tid. Kost vises kun for modeller vi har en bekreftet sats for."
      >
        {data.maaneder.map((m) => (
          <div key={m.maaned} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong style={tallStil}>{m.maaned}</strong>
              <span style={tallStil}>
                {m.antall} interaksjoner · {usd(m.kjentKostUsd)}
                {m.utenPris > 0 && ` (+${m.utenPris} uten pris)`}
              </span>
            </div>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, ...dempet }}>
              {m.perModell.map((pm) => (
                <li key={pm.modell} style={tallStil}>
                  {pm.modell}: {pm.antall} · {pm.tokensInn.toLocaleString("nb-NO")} inn /{" "}
                  {pm.tokensUt.toLocaleString("nb-NO")} ut ·{" "}
                  {pm.kostUsd === null ? "ukjent pris" : usd(pm.kostUsd)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Seksjon>

      <Seksjon
        tittel="Kvalitet per promptversjon"
        hjelp="Godkjenningsrate regnes av forslag som faktisk er avgjort. Flater uten godkjenningsflyt står alltid som ventende — der er raten tom, ikke null."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", ...dempet }}>
                <th style={{ padding: "4px 8px 8px 0" }}>Prompt</th>
                <th style={{ padding: "4px 8px 8px 0" }}>Antall</th>
                <th style={{ padding: "4px 8px 8px 0" }}>Godkjent</th>
                <th style={{ padding: "4px 8px 8px 0" }}>Avvist</th>
                <th style={{ padding: "4px 8px 8px 0" }}>Venter</th>
                <th style={{ padding: "4px 0 8px 0" }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.promptversjoner.map((p) => (
                <tr key={`${p.promptId}@${p.promptVersjon}`} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 8px 8px 0" }}>
                    {p.promptId}
                    <span style={dempet}>@{p.promptVersjon}</span>
                  </td>
                  <td style={{ padding: "8px 8px 8px 0", ...tallStil }}>{p.antall}</td>
                  <td style={{ padding: "8px 8px 8px 0", ...tallStil }}>{p.godkjent}</td>
                  <td style={{ padding: "8px 8px 8px 0", ...tallStil }}>{p.avvist}</td>
                  <td style={{ padding: "8px 8px 8px 0", ...tallStil }}>{p.ventende}</td>
                  <td style={{ padding: "8px 0", ...tallStil }}>
                    {p.godkjenningsrate === null ? "—" : prosent(p.godkjenningsrate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seksjon>

      <Seksjon
        tittel="Hvorfor forslag avvises"
        hjelp="Kodet grunn fra godkjenningskøen. Tomt betyr ingen avvisninger med grunn ennå."
      >
        {data.avvisGrunner.length === 0 ? (
          <p style={{ ...dempet, margin: 0 }}>Ingen registrerte avvisningsgrunner.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {data.avvisGrunner.map((g) => (
              <li key={g.begrunnelse} style={{ marginBottom: 4 }}>
                {g.begrunnelse} — <span style={tallStil}>{g.antall}</span>
              </li>
            ))}
          </ul>
        )}
      </Seksjon>
    </div>
  );
}
