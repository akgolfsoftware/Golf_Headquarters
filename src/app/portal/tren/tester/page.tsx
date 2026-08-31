/**
 * PlayerHQ · Tester (/portal/tren/tester).
 * Fasit: designsystem/train-lock/TE-01 Tester hub iPhone.dc.html
 * Fasit: designsystem/train-lock/TE-01L Tester hub lys.dc.html
 *
 * IA-revisjon (PX-3-rest, 29.08.2026): erstatter den forrige
 * pyramide-akse-hero+filtrert-liste-strukturen (PH-15) med fasitens FLATE
 * liste av ALLE tilgjengelige protokoller, gruppert GOLFSLAG/TEKNIKK (aldri
 * pyramide-aksene fys/tek/slag/spill/turn) — se
 * src/lib/portal-tester/hub-gruppe.ts for gruppe-logikken og HANDOFF.md
 * §TESTER for fasit-begrunnelsen («Hub = to grupper»). Ren sortering/
 * gruppering av samme underliggende data (TestDefinition/TestResult via
 * loadTesterScreen) — ingen ny datamodell. Samme data brukes fortsatt av
 * admin-spillervisningen (AdminSpillerTesterV2), som er URØRT av denne
 * porten.
 *
 * Fasitens hub har INGEN «Én ting nå»-hero (HANDOFF: «Live (TE-04/06) =
 * artefakt over I dag uten dock») — pågående/live økter vises der, ikke her.
 * Raden er alltid trykkbar inn til testens detaljside, som selv har «Start
 * test» (TE-02/TE-13-detaljpanelet, PORTERT: 1:1 flat liste — split-pane
 * inspektørpanelet fra TE-02/TE-13 er IKKE bygget her, se PR-notat).
 *
 * Tallformat på høyre side følger TE-00s korttype-copy per scoring-kind
 * (formatHubVerdi) — PEI vises med ÉTT tall (prosent), ikke fasitens to
 * («4,26 % · 0,04»): det andre tallet er en spredning som ikke finnes i
 * dagens scoreTest()-aggregat, og fabrikkeres ikke her (anti-scope).
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadTesterScreen, type TestRow } from "@/lib/portal-tester/tester-data";
import { hubGruppeForNavn, formatHubVerdi, HUB_GRUPPE_LABEL, HUB_GRUPPE_REKKEFOLGE, type HubGruppe } from "@/lib/portal-tester/hub-gruppe";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Caps, TilbakeLenke } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export const dynamic = "force-dynamic";

export default async function TesterHubPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const screen = await loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier });

  // Flat liste av ALLE tester i spillerens univers, gruppert GOLFSLAG/TEKNIKK/Andre
  // (rekkefølge innad i gruppen arves fra loadTesterScreen: gjort → ugjort, alfabetisk).
  const alleRader = screen.groups.flatMap((g) => g.rows);
  const grupper = new Map<HubGruppe, TestRow[]>();
  for (const gruppe of HUB_GRUPPE_REKKEFOLGE) grupper.set(gruppe, []);
  for (const rad of alleRader) {
    const gruppe = rad.hubGruppe ?? hubGruppeForNavn(rad.name);
    grupper.get(gruppe)!.push(rad);
  }

  const forfallerAntall = alleRader.filter((r) => r.forfallDato != null).length;

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      {/* PH-15/TE-01: Tester er push under Analyse. */}
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <div
        data-paper-slug="playerhq-tester-hub"
        data-od-id="playerhq-tester-hub"
        style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* TE-01-hode: caps «Analyse · satt av Anders» → «Tester» 34/700 → mute «N forfaller» */}
        <div style={{ marginBottom: 14 }}>
          <Caps>Analyse · satt av Anders</Caps>
          <h1
            style={{
              margin: "6px 0 0",
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
          <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
            {forfallerAntall === 0 ? "Ingen forfaller" : forfallerAntall === 1 ? "1 forfaller" : `${forfallerAntall} forfaller`}
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
            {HUB_GRUPPE_REKKEFOLGE.map((gruppe) => {
              const rader = grupper.get(gruppe)!;
              if (rader.length === 0) return null;
              return (
                <div key={gruppe} style={{ marginTop: 18 }}>
                  <Caps>{HUB_GRUPPE_LABEL[gruppe]}</Caps>
                  <div style={{ marginTop: 4 }}>
                    {rader.map((r, i) => (
                      <TesterRad key={r.id} r={r} siste={i === rader.length - 1} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* «+ egen test» — TE-01 fottrykk, leder til eksisterende opprett-flyt. */}
            <Link
              href="/portal/tren/tester/ny/egen"
              data-od-id="tester-ny-egen"
              className="v2-press v2-focus"
              style={{
                marginTop: 16,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                borderRadius: TL.radius.card,
                boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 600,
                color: TL.text,
              }}
            >
              + egen test
            </Link>

            {/* Sync-note — Workbench planlegger, talentprofilen mottar */}
            <div
              style={{
                marginTop: 18,
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

/** TE-01 hub-rad: tittel + regel-undertekst venstre, verdi + FORFALL/PLANLAGT-caps høyre. */
function TesterRad({ r, siste }: { r: TestRow; siste: boolean }) {
  const verdi = r.attempts > 0 ? formatHubVerdi({ scoringKind: r.scoringKind, latestRaw: r.latestRaw, shotsCount: r.shotsCount }) : "—";
  const capsTekst = r.forfallDato ? (r.attempts > 0 ? `FORFALL ${r.forfallDato}` : `PLANLAGT ${r.forfallDato}`) : null;

  return (
    <Link
      href={r.href}
      data-od-id={`tester-hub-rad-${r.id}`}
      className="v2-press"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 12px",
        marginInline: -12,
        borderRadius: TL.radius.card,
        borderBottom: siste ? "none" : `1px solid ${TL.hair}`,
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
            marginTop: 2,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {r.rule}
        </span>
      </div>
      <div style={{ textAlign: "right", flex: "none" }}>
        <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
          {verdi}
        </span>
        {capsTekst && (
          <span
            style={{
              display: "block",
              marginTop: 2,
              fontFamily: TL.font.mono,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: TL.mute,
              whiteSpace: "nowrap",
            }}
          >
            {capsTekst}
          </span>
        )}
      </div>
    </Link>
  );
}
