/**
 * /stats/min-progresjon — autentisert SG-utvikling (design 16)
 *
 * Krever innlogget bruker via getCurrentUser(). Redirect til
 * /auth/login?next=/stats/min-progresjon hvis ikke innlogget.
 *
 * Viser:
 *   - Hero med velkomstmelding
 *   - Status-strip (siste sammenligning + KPI)
 *   - SG-trend linjegraf (StatsTrendGraf gjenbrukt)
 *   - 2x2 per-kategori mini-linjer
 *   - Alle sammenligninger-tabell
 *   - "Største gap"-insight
 *   - Empty-state hvis 0 SG-inputs
 *
 * ISR: force-dynamic (personlig data)
 */

import "../stats.css";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { StatsTrendGraf } from "@/components/stats/stats-trend-graf";
import { Reveal } from "@/components/stats/reveal";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { StatsBtn } from "@/components/stats/btn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Min SG-progresjon | AK Golf Stats",
  description: "Se din personlige SG-utvikling over tid. Trend per kategori og sammenligning mot referansespillere.",
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------

async function hentBrukerProgresjon(userId: string) {
  const sammenligninger = await prisma.brukerSammenligning.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sgInputs = await prisma.brukerSgInput.findMany({
    where: { userId },
    orderBy: { dato: "asc" },
    take: 30,
  });

  return { sammenligninger, sgInputs };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function MinProgresjonPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/stats/min-progresjon");

  const { sammenligninger, sgInputs } = await hentBrukerProgresjon(user.id);

  const fornavn = user.name?.split(" ")[0] ?? "deg";
  const harData = sammenligninger.length > 0;

  // SG-trend for graf — grupper på år/måned
  const trendData = sgInputs.map((s, i) => ({
    aar: new Date(s.dato).getFullYear(),
    snitt: s.sgTotal ?? 0,
    antall: i + 1,
  }));

  // Siste sammenligning
  const siste = sammenligninger[0];

  // Per-kategori trend (dummy-beregning fra sgInputs)
  const kategorier = [
    { key: "ott", label: "SG: OFF THE TEE" },
    { key: "app", label: "SG: APPROACH" },
    { key: "arg", label: "SG: AROUND GREEN" },
    { key: "putt", label: "SG: PUTTING" },
  ] as const;

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="stats-hero" style={{ paddingBottom: 40 }}>
        <Reveal>
          <StatsEyebrow>Innlogget · Min progresjon</StatsEyebrow>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              marginTop: 20,
            }}
          >
            Velkommen tilbake,
            <br />
            <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
              {fornavn}
            </em>
            .
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 560 }}>
            {harData
              ? `Du har lagt inn SG ${sammenligninger.length} ganger. Her er trenden din.`
              : "Du har ikke lagt inn SG-data ennå. Start med en sammenligning nedenfor."}
          </p>
          <div className="stats-hero-ctas">
            <Link href="/stats/sg-sammenlign">
              <StatsBtn variant="primary" icon="ArrowRight" size="md">
                Ny sammenligning
              </StatsBtn>
            </Link>
            <Link href="/stats/verktoy/sg-estimator">
              <StatsBtn variant="secondary" size="md">
                SG-estimator
              </StatsBtn>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Empty-state */}
      {!harData && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div
              style={{
                maxWidth: 560,
                margin: "0 auto",
                textAlign: "center",
                padding: "48px 32px",
                background: "var(--s-secondary)",
                borderRadius: "var(--s-r-xl)",
                border: "1px solid var(--s-border)",
              }}
            >
              <TrendingUp
                size={40}
                style={{ color: "var(--s-primary)", opacity: 0.4, margin: "0 auto 16px" }}
                strokeWidth={1.5}
              />
              <div
                className="font-display"
                style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}
              >
                Ingen SG-data ennå
              </div>
              <p style={{ color: "var(--s-muted-fg)", fontSize: 14, lineHeight: 1.5 }}>
                Legg inn din første SG-sammenligning for å starte trenden din. Det tar under 2 minutter.
              </p>
              <div style={{ marginTop: 24 }}>
                <Link href="/stats/sg-sammenlign">
                  <StatsBtn variant="primary" icon="ArrowRight" size="md">
                    Start første sammenligning
                  </StatsBtn>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Status-strip: siste sammenligning */}
      {siste && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <StatsEyebrow>Siste sammenligning</StatsEyebrow>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--s-muted-fg)",
                  }}
                >
                  {new Date(siste.createdAt).toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Din SG total
                  </div>
                  <div
                    className="font-mono"
                    style={{ fontSize: 48, fontWeight: 500, marginTop: 8, lineHeight: 1 }}
                  >
                    {siste.sgDiffTotal !== null
                      ? siste.sgDiffTotal.toFixed(1)
                      : "—"}
                  </div>
                  <div style={{ color: "var(--s-muted-fg)", fontSize: 13, marginTop: 6 }}>
                    per runde
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    vs {siste.refPlayerName}
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: 48,
                      fontWeight: 500,
                      marginTop: 8,
                      lineHeight: 1,
                      color: "var(--s-primary)",
                    }}
                  >
                    {siste.sgDiffTotal !== null
                      ? (siste.sgDiffTotal > 0 ? "+" : "") + siste.sgDiffTotal.toFixed(2)
                      : "—"}
                  </div>
                  <div style={{ color: "var(--s-muted-fg)", fontSize: 13, marginTop: 6 }}>
                    SG-differanse
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--s-muted-fg)",
                    }}
                  >
                    Tour-ekvivalent score
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}
                  >
                    {siste.estPgaTourScore !== null
                      ? siste.estPgaTourScore.toFixed(1)
                      : "—"}
                  </div>
                  <div style={{ color: "var(--s-muted-fg)", fontSize: 13, marginTop: 6 }}>
                    est. på PGA-bane
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <Link href="/stats/sg-sammenlign">
                  <StatsBtn variant="primary" icon="ArrowRight" size="md">
                    Ny sammenligning
                  </StatsBtn>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* SG-trend graf */}
      {trendData.length > 1 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>SG-trend</StatsEyebrow>
                <h2 className="font-display">
                  Din utvikling{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                    over tid
                  </em>
                  .
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div
              style={{
                background: "var(--s-card)",
                border: "1px solid var(--s-border)",
                borderRadius: "var(--s-r-lg)",
                padding: 32,
              }}
            >
              <StatsTrendGraf data={trendData} height={260} />
              <div
                style={{
                  marginTop: 16,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--s-muted-fg)",
                }}
              >
                Tour-snitt = 0 · Lavere = bedre
              </div>
            </div>
          </Reveal>

          {/* Per-kategori 2x2 */}
          <Reveal delay={120}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
                marginTop: 32,
              }}
            >
              {kategorier.map((kat) => {
                const values = sgInputs.map((s) => {
                  const raw =
                    kat.key === "ott"
                      ? s.sgOtt
                      : kat.key === "app"
                        ? s.sgApp
                        : kat.key === "arg"
                          ? s.sgArg
                          : s.sgPutt ?? 0;
                  return Number(raw ?? 0);
                });
                const fra = values[0] ?? 0;
                const til = values[values.length - 1] ?? 0;
                const diff = til - fra;
                const bedre = diff > 0;

                return (
                  <div
                    key={kat.key}
                    style={{
                      background: "var(--s-card)",
                      border: "1px solid var(--s-border)",
                      borderRadius: "var(--s-r-md)",
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--s-muted-fg)",
                        }}
                      >
                        {kat.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: bedre ? "var(--s-primary)" : "#BE3D3D",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {bedre ? (
                          <TrendingUp size={12} strokeWidth={2} />
                        ) : diff < 0 ? (
                          <TrendingDown size={12} strokeWidth={2} />
                        ) : (
                          <Minus size={12} strokeWidth={2} />
                        )}
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 16,
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{ fontSize: 12, color: "var(--s-muted-fg)" }}
                      >
                        {fra.toFixed(1)}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: bedre ? "var(--s-primary)" : "inherit",
                        }}
                      >
                        → {til.toFixed(1)}
                      </span>
                    </div>
                    {values.length === 0 && (
                      <p style={{ color: "var(--s-muted-fg)", fontSize: 12, marginTop: 8 }}>
                        Ingen data ennå
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* Historikk-tabell */}
      {sammenligninger.length > 0 && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <div className="stats-section-head">
              <div>
                <StatsEyebrow>Historikk</StatsEyebrow>
                <h2 className="font-display">
                  Alle dine{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--s-primary)" }}>
                    sammenligninger
                  </em>
                  .
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--s-border)" }}>
                    <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                      Dato
                    </th>
                    <th style={{ padding: "10px 16px 10px 0", textAlign: "left", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                      Referanse
                    </th>
                    <th style={{ padding: "10px 0", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                      SG-diff
                    </th>
                    <th style={{ padding: "10px 0", textAlign: "right", fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--s-muted-fg)" }}>
                      Tour-score est.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sammenligninger.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: "1px dashed var(--s-border)", opacity: i > 9 ? 0.6 : 1 }}
                    >
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        {new Date(s.createdAt).toLocaleDateString("nb-NO")}
                      </td>
                      <td style={{ padding: "12px 16px 12px 0" }}>
                        {s.refPlayerName}
                      </td>
                      <td style={{ padding: "12px 0", textAlign: "right" }}>
                        {s.sgDiffTotal !== null
                          ? (s.sgDiffTotal > 0 ? "+" : "") + s.sgDiffTotal.toFixed(2)
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 0",
                          textAlign: "right",
                          color: "var(--s-primary)",
                          fontWeight: 500,
                        }}
                      >
                        {s.estPgaTourScore !== null
                          ? s.estPgaTourScore.toFixed(1)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </section>
      )}

      {/* Insight-boks: kommentar */}
      {siste?.kommentar && (
        <section className="stats-section stats-section-divider">
          <Reveal>
            <blockquote
              style={{
                borderLeft: "3px solid var(--s-primary)",
                paddingLeft: 24,
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 400,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {siste.kommentar}
              <footer
                style={{
                  display: "block",
                  marginTop: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontStyle: "normal",
                  color: "var(--s-muted-fg)",
                }}
              >
                Notat · {new Date(siste.createdAt).toLocaleDateString("nb-NO")}
              </footer>
            </blockquote>
          </Reveal>
        </section>
      )}

      {/* Mersalg-band */}
      <div className="stats-mersalg-wrap">
        <div className="stats-mersalg">
          <div>
            <StatsEyebrow tone="lime">Bli PlayerHQ PRO</StatsEyebrow>
            <h2>
              Spor alle SG-kategorier{" "}
              <em className="stats-italic-accent">automatisk</em>.
            </h2>
            <p>
              Med PlayerHQ PRO logges SG automatisk fra Trackman og manuell runderegistrering.
              Ingen manuell input — treneren din ser det samme som deg.
            </p>
            <div className="stats-mersalg-ctas">
              <Link href="/portal/meg/abonnement">
                <StatsBtn variant="primary" size="md" icon="ArrowRight">
                  Oppgrader til PRO
                </StatsBtn>
              </Link>
            </div>
          </div>
          <div className="stats-mersalg-card">
            <h4>Inkludert i PRO</h4>
            <ul>
              <li>Automatisk SG-tracking fra Trackman</li>
              <li>Ugentlig AI-analyse av din profil</li>
              <li>Ubegrenset sammenligninger</li>
              <li>Eksport til PDF / Excel</li>
            </ul>
            <div className="stats-mersalg-price">
              <strong>300 kr / mnd</strong> · avbryt når som helst
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
