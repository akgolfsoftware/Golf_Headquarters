// PH21TbListe — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Tilbakemeldinger — liste (ME-04 Coach-hub-raden «Tilbakemeldinger»).
 * Fasit: designsystem/train-lock/ME-04 Coach-hub.dc.html (raden, ikke selve
 * listen — ME-04 tegner kun inngangen; listen bygger på samme kortmønster
 * som resten av Coach-hub-flaten).
 *
 * Én rad per økt med skrevet coach-tilbakemelding → åpner detaljsiden
 * /portal/coach/tilbakemelding/[oktId]. Ingen sesong-avgrensning i data —
 * viser alle, aldri en oppdiktet sesongstart.
 *
 * Avvik:
 *   - Listen er montert i PlayerHQSkall. Radene er fortsatt v2-kort. Flaten er ikke målt i appen.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erCoachetSpiller } from "@/lib/auth/coached";
import { getTilbakemeldingerListe } from "@/lib/portal-okt/coach-tilbakemelding-data";
import { Kort, Rad, TomTilstand, TilbakeLenke, Icon } from "@/components/v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tilbakemeldinger · PlayerHQ" };

export default async function TilbakemeldingerListePage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PLAYER" && !(await erCoachetSpiller(user.id))) {
    redirect("/portal/coach");
  }

  const liste = await getTilbakemeldingerListe(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <TilbakeLenke href="/portal/coach">Coach</TilbakeLenke>
      <Kort eyebrow={`Tilbakemeldinger · ${liste.length}`} pad="4px 6px">
        {liste.length > 0 ? (
          liste.map((t, i) => (
            <Link key={t.oktId} href={`/portal/coach/tilbakemelding/${t.oktId}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                last={i === liste.length - 1}
                leading={<Icon name="message-square" size={16} style={{ color: "var(--tl-mute)" }} />}
                title={t.tittel}
                sub={`${t.dato} · ${t.snippet}`}
              />
            </Link>
          ))
        ) : (
          <div style={{ padding: "8px 12px 12px" }}>
            <TomTilstand icon="message-square" title="Ingen tilbakemeldinger ennå" sub="De dukker opp her når coachen din skriver en etter en økt." />
          </div>
        )}
      </Kort>
    </div>
    </PlayerHQSkall>
  );
}
