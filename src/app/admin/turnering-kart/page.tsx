/**
 * AgencyOS · Norge turneringskart (MVP) — Train-lock (T10, 27.08.2026).
 * Dekning, toppliste, ærlig tomtilstand. Minimal TL-verktøyside etter
 * TU-01-mønsteret (D-LYS-OG-5T-BESLUTNING.md §0.9/§2.3).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { TlKort, TlTilbake, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import { TlCaps } from "@/components/admin/v2/godkjenninger/tl-inspektor";

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
        <TlTilbake href="/admin/spillere">Stall</TlTilbake>
        <div style={{ marginTop: 16 }}>
          <TlCaps>Data · Norge</TlCaps>
          <h1 style={{ margin: "10px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Turneringsdekning</h1>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 13.5,
              color: TL.mute,
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
          style={{ gap: 10, marginTop: 22 }}
        >
          {[
            { k: "Norske spillere", v: noPlayers },
            { k: "Med DataGolf-ID", v: withDg },
            { k: "Resultatrader (NO)", v: entriesNo },
            { k: "Runder lagret", v: rounds },
            { k: "NO-turneringer", v: tournamentsNo },
            { k: "Entries siden 2016", v: since2016 },
          ].map((x) => (
            <TlKort key={x.k}>
              <TlCaps size={9}>{x.k}</TlCaps>
              <div
                style={{
                  fontFamily: TL.font.mono,
                  fontSize: 28,
                  fontWeight: 700,
                  color: TL.text,
                  marginTop: 8,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {x.v.toLocaleString("nb-NO")}
              </div>
            </TlKort>
          ))}
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: 18, marginTop: 18 }}
        >
          <TlKort eyebrow="Kilder (tournaments)">
            {byOrigin.length === 0 ? (
              <TlTomTilstand
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
                      i < byOrigin.length - 1 ? `1px solid ${TL.hair}` : "none",
                    fontSize: 13,
                    color: TL.text,
                  }}
                >
                  <span>{o.sourceOrigin ?? "ukjent"}</span>
                  <span style={{ fontFamily: TL.font.mono, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                    {o._count}
                  </span>
                </div>
              ))
            )}
          </TlKort>

          <TlKort eyebrow="Flest resultater (NO)">
            {topPlayers.length === 0 ? (
              <TlTomTilstand
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
                        ? `1px solid ${TL.hair}`
                        : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: TL.text,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: TL.font.mono,
                        fontSize: 9,
                        color: TL.mute,
                        marginTop: 3,
                      }}
                    >
                      {p.tier}
                      {p.birthYear ? ` · ${p.birthYear}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: TL.text,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p._count.entries}
                  </span>
                </div>
              ))
            )}
          </TlKort>
        </div>
      </div>
    </V2Shell>
  );
}
