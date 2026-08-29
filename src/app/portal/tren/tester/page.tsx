/**
 * PlayerHQ · Tester (/portal/tren/tester).
 * Fasit: designsystem/train-lock/PH-15 Analyse tester.dc.html
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
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";

import { Caps, TilbakeLenke } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export const dynamic = "force-dynamic";

const TONE_FARGE: Record<"pos" | "neg" | "flat", string> = {
  pos: TL.ok,
  neg: TL.danger,
  flat: TL.mute,
};

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
      {/* PH-15: Tester er push under Analyse. */}
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <div
        data-paper-slug="playerhq-tester-hub"
        data-od-id="playerhq-tester-hub"
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* PH-15-hode: «Tester» 34/700 + mute sub «N aktive» */}
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: TL.font.sans,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: TL.text,
            }}
          >
            Tester
          </h1>
          <span
            style={{
              display: "block",
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {screen.totalTests} aktive · {screen.testedCount} testet
          </span>
        </div>

        {screen.totalTests === 0 ? (
          /* Tom tilstand — fasit-copy, én vei videre (Workbench) */
          <div
            style={{
              padding: "24px 16px",
              background: TL.dock,
              border: `1px dashed ${TL.hair}`,
              borderRadius: TL.radius.card,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Ingen tester i batteriet ditt ennå
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              Testene avtaler du med Anders i Workbench — legg dem inn som vanlige økter der,
              sammen med resten av planen din.
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
                borderRadius: TL.radius.card,
                background: TL.fill,
                color: TL.onFill,
                fontFamily: TL.font.sans,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Åpne Workbench
            </Link>
          </div>
        ) : (
          <>
            {/* Én ting nå — neste test (kun når en faktisk står for tur) */}
            {neste && (
              <div
                style={{
                  background: TL.dim,
                  border: `1px solid ${TL.hair}`,
                  borderRadius: TL.radius.card,
                  padding: 16,
                }}
              >
                <Caps>Én ting nå</Caps>
                <h3 style={{ margin: "8px 0", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                  {neste.navn} står for tur
                </h3>
                <p style={{ margin: "0 0 16px", fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, maxWidth: "52ch" }}>
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
                    borderRadius: TL.radius.card,
                    background: TL.fill,
                    color: TL.onFill,
                    fontFamily: TL.font.sans,
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
                    background: TL.dock,
                    border: `1px dashed ${TL.hair}`,
                    borderRadius: TL.radius.card,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                    Ingen resultater ennå
                  </h3>
                  <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
                    {screen.totalTests} tester ligger klare i batteriet — første måling blir
                    referansen din.
                  </p>
                </div>
              ) : (
                /* PH-15: én elev-flate med hairline-delte rader */
                <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
                  {medResultat.map((r, i) => (
                    <Link
                      key={r.id}
                      href={r.href}
                      data-od-id={`tester-rad-${i}`}
                      className="v2-press"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "15px 0",
                        borderBottom: i < medResultat.length - 1 ? `1px solid ${TL.hair}` : "none",
                        textDecoration: "none",
                        color: "inherit",
                        minWidth: 0,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                          {r.name}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontFamily: TL.font.sans,
                            fontSize: 13,
                            color: TL.mute,
                            marginTop: 2,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {r.axis.toUpperCase()}
                          {r.latestDate ? ` · sist ${r.latestDate}` : ""}
                        </span>
                      </div>
                      <div style={{ textAlign: "right", flex: "none" }}>
                        <span
                          style={{
                            display: "block",
                            fontFamily: TL.font.sans,
                            fontSize: 15,
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                            color: TL.text,
                          }}
                        >
                          {r.latest}
                        </span>
                        {r.delta && (
                          <span
                            style={{
                              display: "block",
                              marginTop: 2,
                              fontFamily: TL.font.sans,
                              fontSize: 13,
                              color: TONE_FARGE[r.delta.tone],
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {r.delta.text} vs forrige
                          </span>
                        )}
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
                borderRadius: TL.radius.card,
                background: TL.dock,
                border: `1px solid ${TL.hair}`,
                fontFamily: TL.font.sans,
                fontSize: 12.5,
                color: TL.mute,
              }}
            >
              <Icon name="refresh-cw" size={16} style={{ color: TL.mute, flex: "none", marginTop: 2 }} />
              <span>
                Nye tester planlegges i Workbench, sammen med Anders — som vanlige økter. Hvert
                logget resultat oppdaterer talentprofilen din automatisk.
              </span>
            </div>
          </>
        )}
      </div>
    </V2Shell>
  );
}
