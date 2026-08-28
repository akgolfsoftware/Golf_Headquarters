/**
 * PlayerHQ · TrackMan-liste (/portal/mal/trackman) — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-trackman-liste.html.
 *
 * Struktur per fasit: topp «Range-analyse / TrackMan · sesjonsanalyse per
 * kølle» → antallslinje → full-bredde ink-importknapp → trendkort
 * (køllehastighet, enkel sparkline) → sesjonsliste (datebox + dato/slag/
 * kilde/miljø) → «Be om coach-vurdering» (ghost, høyrestilt). Tom tilstand
 * med fasit-copy + eksport-instruks. Ingen clay-CTA — fasiten har ingen.
 * Alle tall fra databasen — aldri fabrikkert.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";

import { Kort, Rad, CTAPill, TomTilstand, TilbakeLenke, Icon } from "@/components/v2";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { TrackManTrendSeksjon, byggTrendData } from "./trend-seksjon";
import type { TrackManEnvironment } from "@/generated/prisma/client";
import type { CSSProperties } from "react";

const ENV_LABEL: Record<TrackManEnvironment, string> = {
  SIMULATOR_INDOOR: "Simulator innendørs",
  NET_INDOOR: "Nett innendørs",
  RANGE_OUTDOOR_MAT: "Range utendørs (matte)",
  RANGE_OUTDOOR_GRASS: "Range utendørs (gress)",
  COURSE_PRACTICE: "Banen (trening)",
  COURSE_COMPETITION: "Banen (konkurranse)",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV",
  "html-import": "HTML",
  api: "TrackMan API",
};

/** Fasitens `.btn.ink.full` — ink-fylt, full bredde. */
const INK_FULL: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 48,
  padding: "0 16px",
  fontFamily: TL.font.sans,
  fontSize: 14,
  fontWeight: 500,
  background: TL.fill,
  color: TL.onFill,
  border: `1px solid ${TL.fill}`,
  borderRadius: TL.radius.card,
  cursor: "pointer",
};

export default async function TrackManListePage() {
  const user = await requirePortalUser();

  const okter = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    orderBy: { recordedAt: "desc" },
    select: {
      id: true,
      recordedAt: true,
      source: true,
      shotCount: true,
      environment: true,
      rawJson: true,
    },
  });

  const hode = (
    <div>
      <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
        Range-analyse
      </h1>
      <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
        TrackMan · sesjonsanalyse per kølle
      </span>
    </div>
  );

  const importKnapp = (
    <TrackmanImportModal
      label={okter.length === 0 ? "Importer TrackMan" : "Importer ny økt"}
      triggerStyle={INK_FULL}
    />
  );

  if (okter.length === 0) {
    return (
      <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
        <div
          data-paper-slug="playerhq-trackman-liste"
          data-od-id="playerhq-trackman-liste"
          style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
        >
          {hode}
          {importKnapp}
          <Kort>
            <TomTilstand
              icon="activity"
              title="Ingen TrackMan-data importert ennå"
              sub="Importer din første økt for å se spredning, stabilitet og full parameter-tabell per kølle."
            />
            <p
              style={{
                fontFamily: TL.font.mono,
                fontSize: 11,
                lineHeight: 1.7,
                color: TL.mute,
                background: TL.dock,
                borderRadius: 8,
                padding: "10px 14px",
                margin: "14px 0 0",
              }}
            >
              <strong style={{ color: TL.text }}>Eksporter fra TrackMan:</strong>
              <br />
              CSV: Sessions → velg økt → Export → CSV
              <br />
              HTML: Åpne Multi Group Report i nettleseren → Lagre som HTML
            </p>
          </Kort>
        </div>
      </V2Shell>
    );
  }

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <div
        data-paper-slug="playerhq-trackman-liste"
        data-od-id="playerhq-trackman-liste"
        style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%", minWidth: 0 }}
      >
        {hode}

        <p style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, margin: 0, fontVariantNumeric: "tabular-nums" }}>
          {okter.length} {okter.length === 1 ? "økt" : "økter"} registrert · nyeste først
        </p>

        {importKnapp}

        {/* Trend — enkel sparkline, kun ved ≥ 2 økter med målt køllehastighet */}
        <TrackManTrendSeksjon punkter={byggTrendData(okter)} />

        {/* Videre-lenke — gapping mellom køllene, tallene kommer herfra */}
        <Link href="/portal/mal/trackman/gapping" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <Kort hover>
            <Rad
              leading={<Icon name="sliders" size={16} style={{ color: TL.mute }} />}
              title="Gapping"
              sub="Avstand mellom køllene dine"
              last
            />
          </Kort>
        </Link>

        {/* Sesjonsliste */}
        <Kort pad="6px 18px">
          {okter.map((okt, i) => {
            const datoLang = okt.recordedAt.toLocaleDateString("nb-NO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const kilde = SOURCE_LABEL[okt.source] ?? okt.source;
            const miljo = okt.environment ? ENV_LABEL[okt.environment] : null;

            return (
              <Link
                key={okt.id}
                href={`/portal/mal/trackman/${okt.id}`}
                data-od-id={`trackman-rad-${i}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <Rad
                  last={i === okter.length - 1}
                  leading={
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: TL.dock,
                        border: `1px solid ${TL.hair}`,
                        borderRadius: 10,
                        padding: "6px 10px",
                        minWidth: 46,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TL.font.mono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: TL.text,
                          lineHeight: 1,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {okt.recordedAt.getDate().toString().padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontFamily: TL.font.mono,
                          fontSize: 8.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: TL.mute,
                          marginTop: 2,
                        }}
                      >
                        {okt.recordedAt.toLocaleDateString("nb-NO", { month: "short" })}
                      </span>
                    </span>
                  }
                  title={datoLang}
                  sub={`${okt.shotCount} slag · ${kilde}${miljo ? ` · ${miljo}` : ""}`}
                />
              </Link>
            );
          })}
        </Kort>

        {/* Coach-vurdering — sekundær, høyrestilt per fasit */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="/portal/coach/melding?type=trackman-vurdering"
            data-od-id="trackman-coach"
            style={{ textDecoration: "none" }}
          >
            <CTAPill ghost>
              Be om coach-vurdering
            </CTAPill>
          </Link>
        </div>
      </div>
    </V2Shell>
  );
}
