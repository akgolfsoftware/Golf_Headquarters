import Link from "next/link";
import { notFound } from "next/navigation";
import { TnKort, TnPille, TnRail, type TnMenyPunkt } from "@/components/team-norway/core";
import { TnRailMobil } from "@/components/team-norway/rail-mobil";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnOversiktForBruker } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";

/**
 * TN-02 Oversikt — inngang til den kanoniske Team Norway-gruppen.
 * Fasit: designsystem/team-norway/templates/tn-oversikt/TnOversikt.dc.html
 * Avvik:
 *   - Viser bare verifiserbare medlemstall; dekningsgrad, samlinger og
 *     handlingskø mangler egne ferdige datakilder og fabrikkeres ikke.
 *   - Testlenken er spillerens eksisterende registrering i PlayerHQ, ikke en
 *     komplett Team Norway-trenerreise eller en ny fellestestingsflate.
 *   - Ingen riggrad: visuell rigg dekker ikke Claw / Team Norway ennå.
 */
export default async function TeamNorwayOversiktPage() {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const side = await hentTnOversiktForBruker({ id: bruker.id, role: bruker.role });
  if (!side) notFound();

  const gruppeHref = `/team-norway/${side.gruppe.id}`;
  const erSpillerIGruppe = side.rolle === "PLAYER";
  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Team Norway" },
    { type: "lenke", label: "Oversikt", href: "/team-norway", aktiv: true },
  ];

  // Ressurslenker er kun synlige når den samme serverkontrollen fant et
  // aktivt medlemskap. Lenken i seg selv gir aldri tilgang til ressursen.
  if (side.erAktivtMedlem) {
    punkter.push(
      { type: "lenke", label: "Gruppeposter", href: gruppeHref },
      { type: "lenke", label: "Dokumenter", href: `${gruppeHref}/dokumenter` },
    );
  }
  if (erSpillerIGruppe) {
    punkter.push({
      type: "lenke",
      label: "Egen testføring i PlayerHQ",
      href: "/portal/tren/tester/team-norway",
    });
  }

  const lenkeStil = {
    minHeight: 44,
    display: "inline-flex",
    alignItems: "center",
    color: TN.navy700,
    fontFamily: TN.font.body,
    fontSize: TN.text.sm,
    fontWeight: TN.weight.semibold,
    textDecoration: "underline",
    textUnderlineOffset: 4,
  } as const;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        background: TN.surfacePage,
        color: TN.textPrimary,
        fontFamily: TN.font.body,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <TnRail
        punkter={punkter}
        bruker={{ navn: bruker.name ?? "Ukjent", rolle: side.rolle }}
        orgNavn="Team Norway"
        orgUndertittel="Oversikt"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <TnRailMobil punkter={punkter} orgNavn="Team Norway" />
        <main
          style={{
            width: "100%",
            maxWidth: 1040,
            padding: "clamp(20px, 4vw, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p
              style={{
                margin: 0,
                fontFamily: TN.font.mono,
                fontSize: TN.text.micro,
                letterSpacing: TN.tracking.eyebrow,
                textTransform: "uppercase",
                color: TN.textSecondary,
              }}
            >
              Team Norway · TN-02
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: TN.font.display,
                fontSize: TN.text.h1,
                fontWeight: TN.weight.bold,
                letterSpacing: TN.tracking.heading,
                color: TN.navy900,
              }}
            >
              {side.gruppe.name}
            </h1>
            <p style={{ margin: 0, maxWidth: 680, color: TN.textSecondary, lineHeight: TN.leading.normal }}>
              Oversikten viser aktive medlemskap i den konkrete Team Norway-gruppen.
            </p>
          </header>

          <section
            aria-label="Gruppestatus"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 16,
            }}
          >
            <TnKort>
              <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Aktive spillere</p>
              <p style={{ margin: "8px 0 0", color: TN.navy900, fontSize: TN.text.display, fontWeight: TN.weight.bold }}>
                {side.antallSpillere}
              </p>
              <p style={{ margin: "8px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
                Telt fra aktive spiller-medlemskap i gruppen.
              </p>
            </TnKort>

            <TnKort>
              <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Aktive trenere</p>
              <p style={{ margin: "8px 0 10px", color: TN.navy900, fontSize: TN.text.display, fontWeight: TN.weight.bold }}>
                {side.antallTrenere}
              </p>
              <TnPille tone="navy">Din grupperolle: {side.rolle}</TnPille>
            </TnKort>

            <TnKort>
              <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Datagrunnlag</p>
              <p style={{ margin: "10px 0 0", color: TN.textPrimary, fontSize: TN.text.base, lineHeight: TN.leading.normal }}>
                Dekningsgrad og kommende samlinger vises når egne, verifiserte datakilder er koblet til.
              </p>
            </TnKort>
          </section>

          {side.erAktivtMedlem ? (
            <section aria-label="Grupperessurser" style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <Link href={gruppeHref} style={lenkeStil}>Gruppeposter</Link>
              <Link href={`${gruppeHref}/dokumenter`} style={lenkeStil}>Dokumenter</Link>
              {erSpillerIGruppe ? (
                <Link href="/portal/tren/tester/team-norway" style={lenkeStil}>
                  Før egne Team Norway-tester i PlayerHQ
                </Link>
              ) : null}
            </section>
          ) : (
            <TnKort padding={18}>
              <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
                Du ser aggregatet som administrator. Gruppeposter, dokumenter og testføring krever egne tilganger og åpnes derfor ikke herfra.
              </p>
            </TnKort>
          )}

          {erSpillerIGruppe ? (
            <p style={{ margin: 0, maxWidth: 680, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
              Testlenken åpner din eksisterende registrering i PlayerHQ. Den er ikke en komplett trenerreise for Team Norway.
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
