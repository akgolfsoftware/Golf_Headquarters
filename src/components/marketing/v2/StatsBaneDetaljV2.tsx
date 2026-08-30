"use client";

/**
 * AK Golf HQ v2 — /stats/baner/[slug] (retning C, mørk).
 * Swap av (mlegacy)/stats/baner/[slug]/page.tsx → v2-utseende. Ekte bane-data
 * (hentBaneBySlug/hentBaneStats) + DB-turneringer kommer inn som props fra
 * page.tsx (server). Score-distribusjon + leaderboard er statisk illustrasjon
 * (1:1 videreført fra legacy inntil runde-data finnes per bane).
 */
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

import { Icon, Kort, Caps, KpiFlis } from "@/components/v2";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, MCta, Seksjon } from "./marked-ramme";

export interface BaneDetaljFakta {
  label: string;
  value: string;
}
export interface BaneTee {
  tee: string;
  farge: string;
  lengde: number;
  slope: number;
  cr: number;
  par: number;
}
export interface BaneScoreBucket {
  range: string;
  count: number;
}
export interface BaneLeaderboardRad {
  rank: number;
  spiller: string;
  score: number;
  ar: number;
  turnering: string;
}

export interface StatsBaneDetaljV2Props {
  navn: string;
  kommune: string;
  region: string;
  lengdeMeter: number | null;
  slope: number | null;
  courseRating: number | null;
  par: number;
  antallHull: number;
  oppstartsaar: number | null;
  bio: string | null;
  antallTurneringer: number;
  antallSpillere: number;
  lavesteRunde: number | null;
  fakta: BaneDetaljFakta[];
  scoreDist: BaneScoreBucket[];
  leaderboard: BaneLeaderboardRad[];
  aktivitet: { id: string; navn: string; dato: string; norske?: number | null }[];
  teer: BaneTee[];
}

export function StatsBaneDetaljV2({
  navn,
  kommune,
  region,
  lengdeMeter,
  slope,
  courseRating,
  par,
  antallHull,
  oppstartsaar,
  bio,
  antallTurneringer,
  antallSpillere,
  lavesteRunde,
  fakta,
  scoreDist,
  leaderboard,
  aktivitet,
  teer,
}: StatsBaneDetaljV2Props) {
  const mobile = useMobile();
  const maxScoreCount = Math.max(1, ...scoreDist.map((b) => b.count));

  return (
    <StatsRamme mobile={mobile} aktiv="baner" waveId="stats-bane-detalj">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Link
          href="/stats/baner"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute, textDecoration: "none", marginBottom: 18 }}
        >
          <Icon name="arrow-left" size={12} /> Banedatabase
        </Link>
        <Eyebrow>
          {kommune.toUpperCase()} · {region.toUpperCase()}
        </Eyebrow>
        <HeroT mobile={mobile}>{navn}</HeroT>
        <div
          style={{
            marginTop: 24,
            height: mobile ? 140 : 220,
            borderRadius: 14,
            border: `1px solid ${TL.hair}`,
            background: TL.dock,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: TL.font.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Banebilde · {navn}
        </div>
      </Seksjon>

      {/* KPI 5-tall */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: AK.gap }}>
          <KpiFlis label="Lengde (m)" value={lengdeMeter ?? "—"} />
          <KpiFlis label="Slope" value={slope ?? "—"} />
          <KpiFlis label="CR" value={courseRating ?? "—"} />
          <KpiFlis label={`Par · ${antallHull} hull`} value={par} />
          <KpiFlis label="Turneringer her" value={antallTurneringer} />
        </div>
      </Seksjon>

      {/* Om banen */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Om banen</Caps>
        {oppstartsaar && (
          <div style={{ marginTop: 14, marginBottom: 20 }}>
            <SeksT mobile={mobile} em={String(oppstartsaar)}>
              Etablert i
            </SeksT>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.3fr 1fr", gap: AK.gap, marginTop: oppstartsaar ? 0 : 20 }}>
          <Kort pad="24px 26px">
            <p style={{ fontFamily: TL.font.sans, fontSize: 14.5, color: TL.mute, lineHeight: 1.7, margin: 0 }}>{bio}</p>
          </Kort>
          <Kort pad="20px 22px">
            <Caps style={{ marginBottom: 16 }}>Bane-fakta</Caps>
            {fakta.map((f, i) => (
              <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i === 0 ? "none" : `1px dashed ${TL.hair}` }}>
                <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{f.label}</span>
                <span style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>{f.value}</span>
              </div>
            ))}
          </Kort>
        </div>
      </Seksjon>

      {/* Vår statistikk */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Vår statistikk</Caps>
        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <SeksT mobile={mobile} em={`${antallSpillere} spillere.`}>
            {antallTurneringer} turneringer,
          </SeksT>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: AK.gap, marginBottom: 20 }}>
          <KpiFlis label="Laveste runde noensinne" value={lavesteRunde ?? "—"} />
          <Kort>
            <Caps size={9}>Snittscore (alle runder)</Caps>
            <div style={{ fontFamily: TL.font.mono, fontSize: 34, fontWeight: 700, color: TL.text, marginTop: 10, lineHeight: 1 }}>78,4</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginTop: 6 }}>alle nivåer · 2026</div>
          </Kort>
          <Kort>
            <Caps size={9}>Runder i databasen</Caps>
            <div style={{ fontFamily: TL.font.mono, fontSize: 34, fontWeight: 700, color: TL.text, marginTop: 10, lineHeight: 1 }}>2 847</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginTop: 6 }}>siden 2018</div>
          </Kort>
        </div>

        <Kort pad="24px 26px">
          <Caps style={{ marginBottom: 20 }}>Score-distribusjon · alle runder</Caps>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
            {scoreDist.map((b, i) => (
              <div key={b.range} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  title={`${b.range}: ${b.count} sp.`}
                  style={{
                    width: "100%",
                    height: `${Math.max((b.count / maxScoreCount) * 100, 4)}%`,
                    borderRadius: "4px 4px 0 0",
                    background: i === 4 ? TL.fill : TL.dim,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
            <span>{scoreDist[0]?.range}</span>
            <span>{scoreDist[scoreDist.length - 1]?.range}</span>
          </div>
        </Kort>
      </Seksjon>

      {/* Leaderboard */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <Caps>Leaderboard</Caps>
        <div style={{ marginTop: 14, marginBottom: 20 }}>
          <SeksT mobile={mobile} em="dominerer her?">
            Hvem
          </SeksT>
        </div>
        <Kort pad="0">
          {leaderboard.map((r, i) => (
            <div
              key={r.rank}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 18px",
                borderTop: i === 0 ? "none" : `1px solid ${TL.hair}`,
              }}
            >
              <span style={{ width: 22, flex: "none", fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: r.rank <= 3 ? TL.fill : TL.mute }}>{r.rank}</span>
              <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 500, color: TL.text }}>{r.spiller}</span>
              {!mobile && <span style={{ flex: 1, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>{r.turnering}</span>}
              <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{r.ar}</span>
              <span style={{ width: 40, textAlign: "right", fontFamily: TL.font.mono, fontSize: 14, fontWeight: 700, color: r.rank <= 3 ? TL.fill : TL.text }}>{r.score}</span>
            </div>
          ))}
        </Kort>
      </Seksjon>

      {/* Kommende/siste turneringer */}
      {aktivitet.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps>Turneringer</Caps>
          <div style={{ marginTop: 14, marginBottom: 20 }}>
            <SeksT mobile={mobile} em="her.">
              Siste aktivitet
            </SeksT>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {aktivitet.map((t) => (
              <Kort key={t.id} pad="14px 20px" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>{t.navn}</div>
                  <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>{t.dato}</div>
                </div>
                {t.norske != null && t.norske > 0 && (
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.fill, flex: "none" }}>{t.norske} norske</span>
                )}
              </Kort>
            ))}
          </div>
        </Seksjon>
      )}

      {/* Tee-sammenligning */}
      {teer.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps>Teer</Caps>
          <div style={{ marginTop: 14, marginBottom: 20 }}>
            <SeksT mobile={mobile} em="sammenligning.">
              Tee
            </SeksT>
          </div>
          <Kort pad="0">
            {teer.map((t, i) => (
              <div key={t.tee} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                <span style={{ width: 12, height: 12, borderRadius: 9999, background: t.farge, flex: "none", border: `1px solid ${TL.hair}` }} />
                <span style={{ width: mobile ? 60 : 90, flex: "none", fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{t.tee}</span>
                <span style={{ flex: 1, fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, textAlign: "right" }}>{t.lengde} m</span>
                <span style={{ flex: 1, fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, textAlign: "right" }}>Slope {t.slope}</span>
                {!mobile && <span style={{ flex: 1, fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, textAlign: "right" }}>CR {t.cr}</span>}
                <span style={{ flex: 1, fontFamily: TL.font.mono, fontSize: 12.5, color: TL.mute, textAlign: "right" }}>Par {t.par}</span>
              </div>
            ))}
          </Kort>
        </Seksjon>
      )}

      {/* Mersalg */}
      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ textAlign: mobile ? "left" : "center" }}>
          <Caps color={TL.fill} style={{ marginBottom: 14 }}>
            PlayerHQ
          </Caps>
          <SeksT mobile={mobile} em={navn}>
            Mål Strokes Gained på
          </SeksT>
          <p style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, margin: "14px auto 0", maxWidth: 480, lineHeight: 1.65 }}>
            Logg runder, se hull-for-hull-analyse og sammenlign deg med spillere på samme bane. Gratis å starte.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22, justifyContent: mobile ? "flex-start" : "center" }}>
            <MCta icon="arrow-right" href="/auth/signup">
              Start gratis
            </MCta>
            <MCta ghost href="/stats/baner">
              Alle baner
            </MCta>
          </div>
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}
