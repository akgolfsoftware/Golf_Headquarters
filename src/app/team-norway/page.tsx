import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnOversiktForBruker, erSportssjef } from "@/lib/domain/tn-tilgang";
import { TN } from "@/lib/v2/team-norway";
import { TnKort, TnPille, TnRail, type TnMenyPunkt } from "@/components/team-norway/core";
import { TnRailMobil } from "@/components/team-norway/rail-mobil";

/**
 * TN-02 Oversikt. Dekningsgrad telles fra GroupMember.
 * Testføring og historikk bor i PlayerHQ og lenkes hit — bygges ikke på nytt.
 */
export default async function TeamNorwayOversiktPage() {
  const bruker = await requirePortalUser({
    allow: ["COACH", "ADMIN", "PLAYER", "PARENT"],
    kreverTilgang: "INGEN",
  });
  const side = await hentTnOversiktForBruker({ id: bruker.id, role: bruker.role });
  if (!side) notFound();

  const sportssjef = await erSportssjef({ id: bruker.id, role: bruker.role });
  const gid = side.gruppe.id;
  const punkter: TnMenyPunkt[] = [
    { type: "overskrift", label: "Team Norway" },
    { type: "lenke", label: "Oversikt", href: "/team-norway", aktiv: true },
    { type: "lenke", label: "Gruppeposter", href: `/team-norway/${gid}` },
    { type: "lenke", label: "Dokumenter", href: `/team-norway/${gid}/dokumenter` },
    { type: "lenke", label: "Testføring", href: "/portal/tren/tester/team-norway" },
  ];
  if (sportssjef) {
    punkter.push({ type: "lenke", label: "Trenere og tilgang", href: "/team-norway/tilgang" });
  }

  return (
    <div style={{ minHeight: "100dvh", background: TN.bg, color: TN.ink, fontFamily: TN.font.body }}>
      <TnRailMobil punkter={punkter} orgNavn="Team Norway" />
      <div style={{ display: "flex", gap: 0 }}>
        <TnRail
          punkter={punkter}
          bruker={{ navn: bruker.name ?? "Ukjent", rolle: side.rolle ?? "Medlem" }}
          orgNavn="Team Norway"
          orgUndertittel="Oversikt"
        />
        <main style={{ flex: 1, padding: 24, maxWidth: 960 }}>
          <p style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.ink500, margin: 0 }}>
            Team Norway
          </p>
          <h1 style={{ fontFamily: TN.font.display, fontSize: 28, margin: "8px 0 20px" }}>{side.gruppe.name}</h1>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <TnKort>
              <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 11, textTransform: "uppercase", color: TN.ink500 }}>Spillere i gruppa</p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{side.antallSpillere}</p>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: TN.ink600 }}>Telt fra aktive medlemskap. Ingen oppdiktet dekning.</p>
            </TnKort>
            <TnKort>
              <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 11, textTransform: "uppercase", color: TN.ink500 }}>Trenere</p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>{side.antallTrenere}</p>
              {side.rolle ? <TnPille tone="navy">{side.rolle}</TnPille> : null}
            </TnKort>
            <TnKort>
              <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 11, textTransform: "uppercase", color: TN.ink500 }}>Siste testperiode</p>
              <p style={{ margin: "8px 0 12px", fontSize: 14, color: TN.ink700 }}>
                Resultater og historikk ligger i testføringen. Samlinger er ikke koblet ennå.
              </p>
              <Link href="/portal/tren/tester/team-norway" style={{ color: TN.navy700, fontWeight: 600 }}>
                Åpne testføring
              </Link>
            </TnKort>
          </div>
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href={`/team-norway/${gid}`} style={{ color: TN.navy700, fontWeight: 600 }}>Gruppeposter</Link>
            <Link href={`/team-norway/${gid}/dokumenter`} style={{ color: TN.navy700, fontWeight: 600 }}>Dokumenter</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
