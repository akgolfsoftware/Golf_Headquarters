/**
 * PlayerHQ · Test-detalj (/portal/tren/tester/[testId]) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-test-detalj.html.
 *
 * Struktur per fasit: «om testen» → protokollkort med nummererte steg +
 * scoringsregel (vises ALLTID, også uten resultater) → historikk-stolpediagram
 * med siste måling uthevet + trend-tag + why-details → clay-CTA «Ta måling»
 * (gjennomføringen har egen fasit — denne skjermen er forberedelsen).
 * Auth + datahenting uendret: requirePortalUser + testTilgangWhere +
 * parseProtocol (zod) + parseForScoring/lavereErBedre. `?lagret=1`-kvittering
 * beholdt (funksjonell retur fra gjennomføringen).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { FEATURES } from "@/lib/features";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre } from "@/lib/portal-tester/test-scoring";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";

import { Kort, StatusPill, MikroMeta, TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

const NGF_URL = "https://www.golfforbundet.no/spiller/toppidrett/skjemaer";

/** Grupper forsøk på label → steg-liste (bevart fra forrige versjon). */
function grupperSteg(
  forsok: ScorekortForsok[],
): { label: string; antall: number; target: string | null }[] {
  const m = new Map<string, { label: string; antall: number; target: string | null }>();
  for (const f of forsok) {
    const ex = m.get(f.label);
    if (ex) ex.antall += 1;
    else m.set(f.label, { label: f.label, antall: 1, target: f.target ?? null });
  }
  return [...m.values()];
}

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

function fmtDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
}

function fmtDatoLang(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

export default async function TestDetaljSpillerPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const [{ testId }, sp] = await Promise.all([params, searchParams]);
  const lagret = sp.lagret === "1";

  // Tilgang: samme regel som katalogen — andres private tester gir 404 (K6).
  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
  });
  if (!test) notFound();

  // Historikk eldste→nyeste (stolpediagrammet leser venstre→høyre).
  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId },
    orderBy: { takenAt: "asc" },
    select: { id: true, score: true, takenAt: true },
  });

  const spec = parseProtocol(test.protocol);
  const scoringSpec = parseForScoring(test.protocol);
  const steg = spec ? grupperSteg(spec.forsok) : [];
  const enhet = scoringSpec.unit;
  // Retning fra scoring-typen (motoren). Ukjent (fallback/uten protokoll) → nøytral trend.
  const lavere = scoringSpec.kind === "fallback" ? null : lavereErBedre(scoringSpec.kind);

  // Siste 8 målinger i diagrammet — skala fra faktisk maks (aldri fabrikkert tak).
  const hist = resultater.slice(-8);
  const maks = hist.length > 0 ? Math.max(...hist.map((r) => r.score), 0) : 0;
  const siste = resultater[resultater.length - 1] ?? null;
  const nestSiste = resultater[resultater.length - 2] ?? null;

  let trend: { text: string; tone: "pos" | "neg" | "flat" } | null = null;
  if (siste && nestSiste) {
    const diff = siste.score - nestSiste.score;
    if (diff === 0) {
      trend = { text: "±0 vs forrige måling", tone: "flat" };
    } else {
      const bedre = lavere == null ? null : lavere ? diff < 0 : diff > 0;
      trend = {
        text: `${diff > 0 ? "+" : "−"}${fmtNum(Math.abs(diff))} vs forrige måling`,
        tone: bedre == null ? "flat" : bedre ? "pos" : "neg",
      };
    }
  }
  const toneFarge = { pos: TL.ok, neg: TL.danger, flat: TL.mute } as const;

  const subBiter = [test.pyramidArea, enhet ? `måles i ${enhet}` : null].filter(Boolean);

  /* Protokollkortet — vises ALLTID (fasit), også når spilleren mangler resultater. */
  const protokollKort = (
    <Kort eyebrow="protokoll">
      {steg.length > 0 ? (
        <div>
          {steg.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                gap: 12,
                padding: "8px 0",
                fontSize: 13,
                borderBottom: i === steg.length - 1 ? "none" : `1px solid ${TL.hair}`,
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 22,
                  height: 22,
                  borderRadius: TL.radius.pill,
                  display: "grid",
                  placeItems: "center",
                  background: TL.dock,
                  fontFamily: TL.font.mono,
                  fontSize: 11,
                  color: TL.mute,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontFamily: TL.font.sans, color: TL.mute }}>
                {s.label}
                <span style={{ fontFamily: TL.font.mono, color: TL.mute }}>
                  {" "}× {s.antall}
                  {s.target != null ? ` · mål ${s.target}` : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
            Testen har ingen steg-protokoll i systemet ennå — scoringsregelen under gjelder.
          </p>
          <a href={NGF_URL} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-block", marginTop: 10 }}>
            <MikroMeta icon="external-link">Protokoller hos NGF</MikroMeta>
          </a>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid ${TL.hair}`,
          fontSize: 13,
        }}
      >
        <span style={{ fontFamily: TL.font.sans, color: TL.text }}>Scoring</span>
        <span style={{ fontFamily: TL.font.sans, color: TL.mute }}>{test.scoringRule}</span>
      </div>
    </Kort>
  );

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/tester">Tester</TilbakeLenke>
      <div
        data-paper-slug="playerhq-test-detalj"
        data-od-id="playerhq-test-detalj"
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* Kvittering etter gjennomføring — fasit playerhq-test-gjennomfor.html
            (serveren redirecter hit ved lagring; kvitteringen bor derfor her).
            Talentprofil-lenken vises kun når talent-flaten faktisk er skrudd på. */}
        {lagret && (
          <div
            style={{
              padding: "20px 16px",
              background: TL.elev,
              border: `1px solid ${TL.ok}`,
              borderRadius: TL.radius.card,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <StatusPill tone="up">Lagret</StatusPill>
              <Link href="/portal/coach/melding" style={{ textDecoration: "none", marginLeft: "auto" }}>
                <MikroMeta icon="send">Del med coach</MikroMeta>
              </Link>
            </div>
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute, lineHeight: 1.6 }}>
              Resultatet er lagret og telles i historikken under. Coachen ser det i
              stallen.
            </p>
            {FEATURES.TALENT && (
              <Link
                href="/portal/talent"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 12,
                  minHeight: 44,
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  color: TL.text,
                  textDecoration: "none",
                }}
              >
                Se utviklingen i talentprofilen →
              </Link>
            )}
          </div>
        )}

        {/* Topp — fasit: testnavn / AKSE · måles i [enhet] */}
        <div>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
            {test.name}
          </h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            {subBiter.join(" · ")}
          </span>
        </div>

        {/* Tom tilstand — ingen resultater ennå (protokollen står fortsatt under).
            Fasit: clay-handlingen ligger INNE i tom-blokken, over protokollkortet. */}
        {resultater.length === 0 && (
          <div
            style={{
              padding: "24px 16px",
              background: TL.dock,
              border: `1px dashed ${TL.hair}`,
              borderRadius: TL.radius.card,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Du har ikke tatt denne testen ennå
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              Protokollen står under — første måling blir referansen din.
            </p>
            <Link
              href={`/portal/tren/tester/${test.id}/gjennomfor`}
              data-od-id="testd-tom-start"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: TL.radius.card,
                background: TL.fill,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ta første måling
            </Link>
          </div>
        )}

        {/* Om testen — kun reelle felter (varighet/utstyr finnes ikke i skjemaet) */}
        <Kort eyebrow="om testen">
          {[
            ["Pyramide", test.pyramidArea],
            ...(enhet ? [["Enhet", enhet] as [string, string]] : []),
            ...(steg.length > 0
              ? [["Øvelser", `${steg.length} steg`] as [string, string]]
              : []),
          ].map(([k, v], i, arr) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                padding: "8px 0",
                borderBottom: i === arr.length - 1 ? "none" : `1px solid ${TL.hair}`,
                fontSize: 13,
              }}
            >
              <span style={{ fontFamily: TL.font.sans, color: TL.text }}>{k}</span>
              <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, textAlign: "right", color: TL.text }}>{v}</span>
            </div>
          ))}
          {test.description && (
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: "8px 0 0" }}>
              {test.description}
            </p>
          )}
        </Kort>

        {protokollKort}

        {/* Historikk — stolpediagram med siste måling uthevet + trend-tag */}
        {resultater.length > 0 && (
          <Kort eyebrow={`din historikk · ${resultater.length} ${resultater.length === 1 ? "måling" : "målinger"}`}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 72, margin: "24px 0 12px" }}>
              {hist.map((r, i) => {
                const sisteStolpe = i === hist.length - 1;
                return (
                  <div
                    key={r.id}
                    style={{
                      flex: 1,
                      background: sisteStolpe ? TL.mute : TL.dock,
                      borderRadius: "8px 8px 0 0",
                      position: "relative",
                      minHeight: 8,
                      height: maks > 0 ? `${Math.round((r.score / maks) * 100)}%` : "8px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontFamily: TL.font.mono,
                        fontSize: 9.5,
                        color: TL.mute,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtNum(r.score)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {hist.map((r) => (
                <span
                  key={r.id}
                  style={{ flex: 1, textAlign: "center", fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}
                >
                  {fmtDatoKort(r.takenAt)}
                </span>
              ))}
            </div>
            {trend && (
              <div style={{ marginTop: 12 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 8px",
                    borderRadius: TL.radius.pill,
                    fontFamily: TL.font.mono,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: TL.dock,
                    color: toneFarge[trend.tone],
                    border: `1px solid ${TL.hair}`,
                  }}
                >
                  {trend.text}
                </span>
              </div>
            )}
            <details data-od-id="testd-why" style={{ marginTop: 12, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card }}>
              <summary
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 44,
                  padding: "0 16px",
                  cursor: "pointer",
                  listStyle: "none",
                  fontFamily: TL.font.sans,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: TL.mute,
                }}
              >
                Hvorfor dette tallet
              </summary>
              <ul
                style={{
                  margin: 0,
                  padding: "12px 16px 16px 24px",
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  color: TL.mute,
                  borderTop: `1px solid ${TL.hair}`,
                }}
              >
                <li style={{ marginBottom: 8 }}>
                  Kilde: dine {resultater.length === 1 ? "logg av" : `${resultater.length} loggede målinger av`}{" "}
                  {test.name}, sist {fmtDatoLang((siste ?? resultater[0]).takenAt)}.
                </li>
                {siste && nestSiste ? (
                  <li style={{ marginBottom: 8 }}>
                    Beregning: trenden er siste måling mot nest siste — {fmtNum(siste.score)} mot{" "}
                    {fmtNum(nestSiste.score)}.
                  </li>
                ) : (
                  <li style={{ marginBottom: 8 }}>
                    Beregning: første måling er referansen — trend kommer fra andre måling.
                  </li>
                )}
                <li style={{ marginBottom: 8 }}>
                  Forbehold: målingene er gyldige når protokollen følges likt hver gang.
                </li>
              </ul>
            </details>
          </Kort>
        )}

        {/* Kontrakt §3: skjermens ene aksenthandling — start testen.
            I tom tilstand bor clay-handlingen i tom-blokken over (maks én). */}
        {resultater.length > 0 && (
          <Link
            href={`/portal/tren/tester/${test.id}/gjennomfor`}
            data-od-id="testd-start"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: TL.radius.card,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Start testen
          </Link>
        )}
      </div>
    </V2Shell>
  );
}
