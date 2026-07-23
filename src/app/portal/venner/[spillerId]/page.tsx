/**
 * /portal/venner/[spillerId] — B-pakke.
 * Hero/status først, aktivitetsfeed, TomTilstand med vei videre.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentVennProfil } from "@/lib/venner/actions";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  TilbakeLenke,
  StatusPill,
  TomTilstand,
  AvatarInit,
  Icon,
} from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { FjernVennKnapp } from "./FjernVennKnapp";
import { RapporterVennKnapp } from "./RapporterVennKnapp";

export const dynamic = "force-dynamic";

function formatterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default async function VennProfilPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  const user = await requirePortalUser();
  const { spillerId } = await params;

  const data = await hentVennProfil(spillerId);
  if (!data) notFound();

  const { venn, feed, synligAv } = data;
  const fornavn = venn.name.split(" ")[0];
  const etternavn = venn.name.split(" ").slice(1).join(" ");
  const meta = [
    venn.kategori ? `Kategori ${venn.kategori}` : null,
    venn.hcp != null ? `HCP ${venn.hcp.toString().replace(".", ",")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: T.gap,
      }}
    >
      <TilbakeLenke href="/portal/venner">Venner</TilbakeLenke>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <AvatarInit navn={venn.name} size={52} />
          <div style={{ minWidth: 0 }}>
            <Caps>PlayerHQ · Venn</Caps>
            <div style={{ marginTop: 6 }}>
              {etternavn ? (
                <Tittel mobile em={etternavn}>{fornavn}</Tittel>
              ) : (
                <Tittel mobile>{fornavn}</Tittel>
              )}
            </div>
            {meta ? (
              <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, margin: "6px 0 0" }}>{meta}</p>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <StatusPill tone={synligAv ? "up" : "warn"}>
            {synligAv ? "Deler aktivitet" : "Skjult aktivitet"}
          </StatusPill>
          <FjernVennKnapp vennUserId={venn.id} />
        </div>
      </div>

      <div>
        <Caps style={{ marginBottom: 10 }}>Aktivitet</Caps>
        {!synligAv ? (
          <Kort>
            <TomTilstand
              icon="eye"
              title={`${fornavn} deler ikke økter ennå`}
              sub="Denne spilleren har ikke skrudd på synlige økter for venner."
            />
          </Kort>
        ) : feed.length === 0 ? (
          <Kort>
            <TomTilstand
              icon="activity"
              title="Ingen aktivitet ennå"
              sub="Ingen fullførte økter eller runder registrert ennå."
            />
          </Kort>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feed.map((a) => (
              <Kort key={a.id} pad="12px 14px">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                      {a.tittel}
                    </div>
                    <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 3 }}>
                      {a.detalj}
                    </div>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, flex: "none" }}>
                    {formatterDato(a.dato)}
                  </div>
                </div>
              </Kort>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          borderTop: `1px solid ${T.border}`,
          paddingTop: 14,
        }}
      >
        <Icon name="eye" size={14} style={{ color: T.mut, marginTop: 2, flex: "none" }} />
        <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.5 }}>
          Du ser kun AT {fornavn} har trent — ingen plan, mål eller tall er delt.
        </span>
      </div>

      <RapporterVennKnapp vennUserId={venn.id} />
    </div>
    </V2Shell>
  );
}
