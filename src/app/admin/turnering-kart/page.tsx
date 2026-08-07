/**
 * AgencyOS · Norge turneringskart (MVP)
 * Dekning, toppliste, ærlig tomtilstand.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Caps, Tittel, Kort, TomTilstand } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export const dynamic = "force-dynamic";

export default async function TurneringKartPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [
    noPlayers,
    withDg,
    entriesNo,
    rounds,
    tournamentsNo,
    byOrigin,
    topPlayers,
  ] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO" } }),
    prisma.publicPlayer.count({
      where: { country: "NO", dataGolfId: { not: null } },
    }),
    prisma.publicPlayerEntry.count({
      where: { player: { country: "NO" } },
    }),
    prisma.publicPlayerRound.count({
      where: { entry: { player: { country: "NO" } } },
    }),
    prisma.tournament.count({
      where: { OR: [{ country: "NO" }, { tour: { in: ["amateur-no", "junior-no"] } }] },
    }),
    prisma.tournament.groupBy({
      by: ["sourceOrigin"],
      _count: true,
      orderBy: { _count: { sourceOrigin: "desc" } },
      take: 12,
    }),
    prisma.publicPlayer.findMany({
      where: { country: "NO" },
      select: {
        name: true,
        tier: true,
        birthYear: true,
        _count: { select: { entries: true } },
      },
      orderBy: { entries: { _count: "desc" } },
      take: 25,
    }),
  ]);

  const since2016 = await prisma.publicPlayerEntry.count({
    where: {
      player: { country: "NO" },
      tournament: { startDate: { gte: new Date("2016-01-01") } },
    },
  });

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="spillere"
      nav={AGENCYOS_NAV}
      navn={user.name ?? "Coach"}
      avatarUrl={user.avatarUrl}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 0 48px" }}>
        <TilbakeLenke href="/admin/spillere">Stall</TilbakeLenke>
        <div style={{ marginTop: 16 }}>
          <Caps>Data · Norge</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="kart.">Turneringsdekning</Tittel>
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: T.ui,
              fontSize: 13.5,
              color: T.fg2,
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Oversikt over hva som finnes i basen for norske spillere. Tomme
            tall = ærlig mangel, ikke demo.
          </p>
        </div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: T.gap, marginTop: 22 }}
        >
          {[
            { k: "Norske spillere", v: noPlayers },
            { k: "Med DataGolf-ID", v: withDg },
            { k: "Resultatrader (NO)", v: entriesNo },
            { k: "Runder lagret", v: rounds },
            { k: "NO-turneringer", v: tournamentsNo },
            { k: "Entries siden 2016", v: since2016 },
          ].map((x) => (
            <Kort key={x.k}>
              <Caps size={9}>{x.k}</Caps>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 28,
                  fontWeight: 700,
                  color: T.lime,
                  marginTop: 8,
                }}
              >
                {x.v.toLocaleString("nb-NO")}
              </div>
            </Kort>
          ))}
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: T.gap, marginTop: T.gap }}
        >
          <Kort eyebrow="Kilder (tournaments)">
            {byOrigin.length === 0 ? (
              <TomTilstand
                icon="database"
                title="Ingen turneringer"
                sub="Kjør GolfBox/DataGolf-sync."
              />
            ) : (
              byOrigin.map((o, i) => (
                <div
                  key={o.sourceOrigin ?? "null"}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom:
                      i < byOrigin.length - 1 ? `1px solid ${T.border}` : "none",
                    fontFamily: T.ui,
                    fontSize: 13,
                    color: T.fg,
                  }}
                >
                  <span>{o.sourceOrigin ?? "ukjent"}</span>
                  <span style={{ fontFamily: T.mono, color: T.mut }}>
                    {o._count}
                  </span>
                </div>
              ))
            )}
          </Kort>

          <Kort eyebrow="Flest resultater (NO)">
            {topPlayers.length === 0 ? (
              <TomTilstand
                icon="users"
                title="Ingen spillere"
                sub="Importer historikk for å fylle listen."
              />
            ) : (
              topPlayers.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i < topPlayers.length - 1
                        ? `1px solid ${T.border}`
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: T.ui,
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.fg,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 9,
                        color: T.mut,
                        marginTop: 3,
                      }}
                    >
                      {p.tier}
                      {p.birthYear ? ` · ${p.birthYear}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.lime,
                    }}
                  >
                    {p._count.entries}
                  </span>
                </div>
              ))
            )}
          </Kort>
        </div>
      </div>
    </V2Shell>
  );
}
