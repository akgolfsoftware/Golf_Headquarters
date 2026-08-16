/**
 * PlayerHQ · Tester (/portal/tren/tester) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-tester-hub.html.
 *
 * Struktur per fasit: «Én ting nå» (neste test — pågående/planlagt økt, ellers
 * åpen tildeling fra coach) → «testene dine · siste resultat» med akse, dato,
 * verdi og trend-tag → sync-note om Workbench/talentprofil → ærlig tom tilstand.
 * Antall protokoller vises ALLTID fra databasen (loadTesterScreen.totalTests)
 * — aldri hardkodet. Dataloadere gjenbrukt: loadTesterScreen + TestAssignment.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTesterScreen, type TestRow } from "@/lib/portal-tester/tester-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, TilbakeLenke } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export const dynamic = "force-dynamic";

const TONE_FARGE: Record<"pos" | "neg" | "flat", string> = {
  pos: T.up,
  neg: T.down,
  flat: T.mut,
};

function TrendTag({ delta }: { delta: NonNullable<TestRow["delta"]> }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: T.rPill,
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: T.panel2,
        color: TONE_FARGE[delta.tone],
        border: `1px solid ${T.border}`,
      }}
    >
      {delta.text} vs forrige
    </span>
  );
}

export default async function TesterHubPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [screen, tildelinger] = await Promise.all([
    loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
    prisma.testAssignment.findMany({
      where: { playerId: user.id, status: "OPEN" },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 1,
      select: { testId: true, test: { select: { name: true } }, coach: { select: { name: true } } },
    }),
  ]);

  // «Én ting nå» — neste test: pågående/planlagt økt vinner, ellers åpen
  // tildeling fra coach. Ingen av delene → ingen blokk (aldri fabrikkert).
  const okt = screen.active ?? screen.planned[0] ?? null;
  const tildelt = tildelinger[0] ?? null;
  const neste = okt
    ? { navn: okt.name, href: okt.href, meta: okt.state === "ongoing" ? "Pågår — fortsett der du slapp" : `Planlagt i Testbatteriet${okt.when ? ` · ${okt.when}` : ""}` }
    : tildelt
      ? { navn: tildelt.test.name, href: `/portal/tren/tester/${tildelt.testId}`, meta: `Tildelt av ${tildelt.coach.name}` }
      : null;

  // Liste: tester med minst ett resultat, nyeste-relevante først per akse-orden.
  const medResultat = screen.groups.flatMap((g) => g.rows.filter((r) => r.attempts > 0));

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/planlegge">Plan</TilbakeLenke>
      <div
        data-paper-slug="playerhq-tester-hub"
        data-od-id="playerhq-tester-hub"
        style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* Topp — fasit: Tester / Testbatteriet ditt · resultater går til talentprofilen din */}
        <div>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Tester</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            Testbatteriet ditt · resultater går til talentprofilen din
          </span>
        </div>

        {screen.totalTests === 0 ? (
          /* Tom tilstand — fasit-copy, én vei videre (Workbench) */
          <div
            style={{
              padding: "24px 16px",
              background: T.panel2,
              border: `1px dashed ${T.border}`,
              borderRadius: T.rCard,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              Ingen tester i batteriet ditt ennå
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
              Testbatteriet settes opp sammen med Anders i Workbench — der velger dere hvilke
              tester som hører til nivået ditt.
            </p>
            {/* Kontrakt §3: skjermens ene aksenthandling */}
            <Link
              href="/portal/planlegge/workbench"
              data-od-id="tester-tom-workbench"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: T.rCard,
                background: T.handling,
                color: T.onHandling,
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Åpne Testbatteriet i Workbench
            </Link>
          </div>
        ) : (
          <>
            {/* Én ting nå — neste test (kun når en faktisk står for tur) */}
            {neste && (
              <div
                style={{
                  background: T.handlingSoft,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rCard,
                  padding: 16,
                }}
              >
                <Caps>Én ting nå</Caps>
                <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
                  {neste.navn} står for tur
                </h3>
                <p style={{ margin: "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
                  {neste.meta}. Resultatet går rett inn i talentprofilen din når du logger det.
                </p>
                {/* Kontrakt §3: skjermens ene aksenthandling — starter testen */}
                <Link
                  href={`${neste.href}/gjennomfor`}
                  data-od-id="tester-start-neste"
                  data-paper-en-ting="true"
                  className="v2-press v2-focus"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 56,
                    width: "100%",
                    borderRadius: T.rCard,
                    background: T.handling,
                    color: T.onHandling,
                    fontFamily: T.ui,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Start {neste.navn}
                </Link>
              </div>
            )}

            {/* Testene dine · siste resultat — faktisk antall fra DB */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Caps>
                testene dine · siste resultat · {screen.testedCount} av {screen.totalTests} testet
              </Caps>
              {medResultat.length === 0 ? (
                <div
                  style={{
                    padding: "24px 16px",
                    background: T.panel2,
                    border: `1px dashed ${T.border}`,
                    borderRadius: T.rCard,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
                    Ingen resultater ennå
                  </h3>
                  <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
                    {screen.totalTests} tester ligger klare i batteriet — første måling blir
                    referansen din.
                  </p>
                </div>
              ) : (
                <div>
                  {medResultat.map((r, i) => (
                    <Link
                      key={r.id}
                      href={r.href}
                      data-od-id={`tester-rad-${i}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: T.panel,
                        border: `1px solid ${T.border}`,
                        borderRadius: T.rCard,
                        padding: "12px 16px",
                        marginBottom: 8,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                          {r.name}
                        </span>
                        <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
                          {r.axis.toUpperCase()}
                          {r.latestDate ? ` · sist ${r.latestDate}` : ""}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span
                          style={{
                            fontFamily: T.mono,
                            fontSize: 14,
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                            color: T.fg,
                          }}
                        >
                          {r.latest}
                        </span>
                        {r.delta && <TrendTag delta={r.delta} />}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sync-note — Workbench planlegger, talentprofilen mottar */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                borderRadius: T.rCard,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                fontFamily: T.bodyFont,
                fontSize: 12.5,
                color: T.mut,
              }}
            >
              <Icon name="refresh-cw" size={16} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
              <span>
                Nye tester legges inn i Workbenchs Testbatteri-ark — sammen med Anders. Hvert
                logget resultat oppdaterer talentprofilen din automatisk.
              </span>
            </div>
          </>
        )}
      </div>
    </V2Shell>
  );
}
