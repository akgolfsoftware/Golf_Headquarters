/**
 * PlayerHQ · Turnering-detalj (/portal/tren/turneringer/[id]) — Paper-port W1
 * (fase2). Fasit: designsystem/paper/fase2/playerhq/playerhq-turnering-detalj.html.
 *
 * Fakta-radene bygges her KUN av reelle loader-felter (Startavgift/Reise
 * finnes ikke i schemaet → utelates ærlig). Dobbel bekreftelse (claim +
 * confirm) skjer i komponenten. Loader (loadTurneringDetalj), auth-guard og
 * server actions (meldDegAv, startTurneringsrunde) er uendret.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTurneringDetalj } from "@/lib/portal-turnering/turnering-detalj-data";
import { meldDegAv } from "@/app/portal/(legacy)/tren/turneringer/actions";
import { startTurneringsrunde } from "./actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

import {
  TurneringDetaljV2,
  type TurneringDetaljV2Data,
} from "@/components/portal/v2/TurneringDetaljV2";

export const dynamic = "force-dynamic";

export default async function TurneringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await loadTurneringDetalj(user.id, id);

  // Tom tilstand — fasit-copy: «Fant ikke turneringen», én vei videre.
  if (!data) {
    return (
      <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/tren/turneringer">Turneringer</TilbakeLenke>
        <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              padding: "24px 16px",
              background: TL.dock,
              border: `1px dashed ${TL.hair}`,
              borderRadius: TL.radius.card,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
              Fant ikke turneringen
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
              Den kan være avlyst eller flyttet i GolfBox. Katalogen har alltid
              gjeldende liste.
            </p>
            <Link
              href="/portal/tren/turneringer"
              data-od-id="turnd-tom-katalog"
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
              Til turneringskatalogen
            </Link>
          </div>
        </div>
      </V2Shell>
    );
  }

  const pameldt = data.entry?.state.active === true;

  async function avmeldAction() {
    "use server";
    const me = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
    const entry = await prisma.tournamentEntry.findFirst({
      where: { userId: me.id, tournamentId: id },
      select: { id: true },
    });
    if (entry) await meldDegAv(entry.id);
  }

  async function startRundeAction() {
    "use server";
    await startTurneringsrunde(id);
  }

  // «Start turneringsrunde» kun for en aktivt påmeldt spiller, når turneringen
  // er relevant nå, en bane finnes, og det ikke alt er startet en runde.
  const kanStarteRunde =
    pameldt && data.erRelevantNa && data.rundeBaneId != null && data.liveRunde == null;

  // EntryState → forenklet status for dobbel bekreftelse-flyten.
  const entryStatus: TurneringDetaljV2Data["entryStatus"] = !data.entry
    ? "INGEN"
    : data.entry.state.active
      ? data.entry.state.tone === "ok"
        ? "CONFIRMED"
        : data.entry.state.tone === "warn"
          ? "CLAIMED"
          : "PLANNED"
      : "ANNEN";

  // Faktakort — kun reelle felter (aldri fabrikkerte verdier).
  const fakta: TurneringDetaljV2Data["fakta"] = [];
  fakta.push({ k: "Når", v: data.dateLong });
  if (data.venue) fakta.push({ k: "Bane", v: data.venue });
  if (data.format) fakta.push({ k: "Format", v: data.format });
  if (data.entryClosesLabel) fakta.push({ k: "Påmeldingsfrist", v: data.entryClosesLabel });
  if (data.recommendedLevel) fakta.push({ k: "Nivå", v: data.recommendedLevel });
  if (data.entry) fakta.push({ k: "I sesongplanen din", v: `plan ${data.entry.planTier}` });

  const v2Data: TurneringDetaljV2Data = {
    id: data.id,
    navn: data.name,
    sub: [data.venue, data.dateCompact, data.entry ? `plan ${data.entry.planTier}` : null]
      .filter(Boolean)
      .join(" · "),
    fakta,
    fristLabel: data.entryClosesLabel,
    entryStatus,
    notater: data.entry?.notes ?? null,
    historikk: data.history.map((h) => ({
      id: h.id,
      aar: h.year,
      plassering: h.position,
      score: h.score,
    })),
    arrangorUrl: data.registrationUrl ?? data.officialUrl,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/turneringer">Turneringer</TilbakeLenke>
      <TurneringDetaljV2
        data={v2Data}
        avmeldAction={avmeldAction}
        turneringsrunde={
          data.liveRunde
            ? {
                rundeId: data.liveRunde.id,
                fort: data.liveRunde.fort,
                score: data.liveRunde.score,
                hullAntall: data.liveRunde.hullAntall,
              }
            : null
        }
        kanStarteRunde={kanStarteRunde}
        startRundeAction={startRundeAction}
      />
    </V2Shell>
  );
}
