/**
 * AgencyOS · GDPR-kø (/admin/gdpr) — ADMIN-only.
 * Paper-fasit: AgencyOS-mønster (V2Shell + T.*). Uløste DataExportRequest.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke, Caps, Tittel, Kort, TomTilstand } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { utforSletteforesporsel, avvisForesporsel } from "./actions";

export const metadata: Metadata = {
  title: "GDPR-kø · AgencyOS",
};

function dagerSiden(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function GdprKoPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const pending = await prisma.dataExportRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  const brukerIder = [
    ...new Set(
      pending.flatMap((r) => [r.userId, r.subjectUserId].filter(Boolean) as string[]),
    ),
  ];
  const brukere = await prisma.user.findMany({
    where: { id: { in: brukerIder } },
    select: { id: true, name: true, email: true },
  });
  const navnFor = (id: string | null) => {
    if (!id) return "—";
    const u = brukere.find((b) => b.id === id);
    return u ? `${u.name ?? "?"} (${u.email ?? id})` : id;
  };

  return (
    <V2Shell bredde="kolonne" aktiv="innstillinger" nav={AGENCYOS_NAV} navn={user.name ?? "Admin"}>
      <div
        data-paper-agencyos-gdpr
        data-paper-slug="agencyos-oppsett"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: T.gap,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
        <div>
          <Caps>System · Personvern</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel>GDPR-kø</Tittel>
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.5, maxWidth: "52ch" }}>
            Uløste innsyns- og slettekrav. Slettekrav må behandles innen én måned (art. 12 nr. 3).
          </p>
        </div>

        {pending.length === 0 ? (
          <Kort>
            <TomTilstand
              icon="check"
              title="Ingen uløste forespørsler"
              sub="Nye innsyns- og slettekrav lander her."
            />
          </Kort>
        ) : (
          pending.map((r) => {
            const alder = dagerSiden(r.createdAt);
            const forsinket = alder >= 25;
            return (
              <Kort key={r.id} pad="16px 18px">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 8,
                      background: T.panel3,
                      color: T.fg2,
                    }}
                  >
                    {r.type}
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 12,
                      fontWeight: forsinket ? 700 : 500,
                      color: forsinket ? T.handling : T.mut,
                    }}
                  >
                    {alder} dager gammel
                  </span>
                </div>
                <div style={{ marginTop: 12, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
                  <div>
                    <span style={{ color: T.mut }}>Bedt av: </span>
                    {navnFor(r.userId)}
                  </div>
                  <div>
                    <span style={{ color: T.mut }}>Gjelder: </span>
                    {navnFor(r.subjectUserId ?? r.userId)}
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {r.type === "DELETE" && (
                    <form action={utforSletteforesporsel}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="v2-press v2-focus"
                        style={{
                          appearance: "none",
                          border: "none",
                          cursor: "pointer",
                          minHeight: 44,
                          padding: "10px 16px",
                          borderRadius: 10,
                          background: T.down,
                          color: T.onCta,
                          fontFamily: T.ui,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Utfør sletting
                      </button>
                    </form>
                  )}
                  <form action={avvisForesporsel}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="v2-press v2-focus"
                      style={{
                        appearance: "none",
                        cursor: "pointer",
                        minHeight: 44,
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: T.panel3,
                        color: T.fg,
                        border: `1px solid ${T.borderS}`,
                        fontFamily: T.ui,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Avvis
                    </button>
                  </form>
                </div>
              </Kort>
            );
          })
        )}
      </div>
    </V2Shell>
  );
}
