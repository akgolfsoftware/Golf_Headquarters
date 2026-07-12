/**
 * PlayerHQ TrackMan-hub — v2. Liste over importerte økter, nyeste først.
 * Import-modalene (CSV/HTML/TrackMan) og trend-seksjonen er tailwind/shadcn
 * og gjenbrukes som de er; sidens ramme og liste er v2. Ingen hardkodede
 * tall — ærlig tom tilstand når ingen økt er importert.
 * «?»-regelen: TrackMan-begrepet forklares via hjelpetekst-nøkkelen trackman.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  CTAPill,
  TomTilstand,
  HjelpTips, TilbakeLenke } from "@/components/v2";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import { CsvImportModal } from "./csv-import-modal";
import { HtmlImportModal } from "./html-import-modal";
import { TrackManTrendSeksjon, byggTrendData } from "./trend-seksjon";
import type { TrackManEnvironment } from "@/generated/prisma/client";

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

export default async function TrackManListePage() {
  const user = await requirePortalUser();

  const [okter, clubSignaler] = await Promise.all([
    prisma.trackManSession.findMany({
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
    }),
    prisma.signal.findMany({
      where: { userId: user.id, kind: "CLUB_AVG" },
      select: { value: true, payload: true, computedAt: true },
      orderBy: { computedAt: "asc" },
    }),
  ]);

  const hode = (
    <div>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Caps>TrackMan · sesjonsanalyse</Caps>
        <HjelpTips k="trackman" size={11} />
      </span>
      <div style={{ marginTop: 10 }}>
        <Tittel em="per kølle">Range-analyse</Tittel>
      </div>
      {okter.length > 0 && (
        <p style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, margin: "10px 0 0" }}>
          {okter.length} {okter.length === 1 ? "økt" : "økter"} registrert · nyeste først
        </p>
      )}
    </div>
  );

  const importKnapper = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <TrackmanImportModal
        variant="primary"
        label={okter.length === 0 ? "Importer TrackMan" : "Importer ny økt"}
      />
      <CsvImportModal />
      <HtmlImportModal />
    </div>
  );

  if (okter.length === 0) {
    return (
      <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          {hode}
          <Kort>
            <TomTilstand
              icon="activity"
              title="Ingen TrackMan-data importert ennå"
              sub="Importer din første økt for å se spredning, stabilitet og full parameter-tabell per kølle."
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              {importKnapper}
            </div>
            <p
              style={{
                fontFamily: T.mono,
                fontSize: 11,
                lineHeight: 1.7,
                color: T.mut,
                background: T.panel2,
                borderRadius: 8,
                padding: "10px 14px",
                margin: "14px 0 0",
              }}
            >
              <strong style={{ color: T.fg }}>Eksporter fra TrackMan:</strong>
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
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {hode}
        {importKnapper}

        {/* Trend-seksjon (vises kun ved ≥ 2 sesjoner) */}
        <TrackManTrendSeksjon data={byggTrendData(okter, clubSignaler)} />

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
                        background: T.panel2,
                        border: `1px solid ${T.border}`,
                        borderRadius: 10,
                        padding: "6px 10px",
                        minWidth: 46,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 15,
                          fontWeight: 700,
                          color: T.fg,
                          lineHeight: 1,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {okt.recordedAt.getDate().toString().padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: 8.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: T.mut,
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

        {/* Coach-vurdering */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/portal/coach/melding?type=trackman-vurdering" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="send">
              Be om coach-vurdering
            </CTAPill>
          </Link>
        </div>
      </div>
    </V2Shell>
  );
}
