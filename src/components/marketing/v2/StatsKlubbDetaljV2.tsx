"use client";

/**
 * AK Golf HQ v2 — /stats/klubber/[slug] (retning C, mørk).
 * Swap av (mlegacy)/stats/klubber/[slug]/page.tsx → v2-utseende. Data
 * (SEED_KLUBBER-rad, SPILLERE_PER_KLUBB, DB-turneringer) er 1:1 videreført
 * fra legacy-siden og sendes inn som props fra page.tsx (server).
 */
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

import { Icon, Kort, Caps, KpiFlis, DataTabell, TomTilstand } from "@/components/v2";
import type { DataTabellRow } from "@/components/v2";
import { StatsRamme, useMobile } from "./stats-ramme";
import { Eyebrow, HeroT, SeksT, MCta, Seksjon } from "./marked-ramme";

export interface StatsKlubbDetaljV2Props {
  navn: string;
  kommune: string;
  region: string;
  spillere: number;
  pro: number;
  college: number;
  junior: number;
  turneringer: number;
  spillerRader: { navn: string; tier: string; snitt: number; antall: number }[];
  fordeling: { label: string; n: number }[];
  aktivitet: { id: string; navn: string; dato: string }[];
}

const FORDELING_FARGE: Record<string, string> = {
  Pro: TL.fill,
  College: TL.ok,
  Junior: TL.mute,
  Amatør: TL.mute,
};

export function StatsKlubbDetaljV2({
  navn,
  kommune,
  region,
  spillere,
  pro,
  college,
  turneringer,
  spillerRader,
  fordeling,
  aktivitet,
}: StatsKlubbDetaljV2Props) {
  const mobile = useMobile();

  const tabellRader: DataTabellRow[] = spillerRader.map((s) => ({
    navn: s.navn,
    tier: s.tier,
    snitt: s.snitt,
    runder: s.antall,
  }));

  return (
    <StatsRamme mobile={mobile} aktiv="klubber" waveId="stats-klubb-detalj">
      {/* Hero */}
      <Seksjon mobile={mobile}>
        <Link
          href="/stats/klubber"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute, textDecoration: "none", marginBottom: 18 }}
        >
          <Icon name="arrow-left" size={12} /> Klubbdatabase
        </Link>
        <Eyebrow>
          {kommune.toUpperCase()} · {region.toUpperCase()}
        </Eyebrow>
        <HeroT mobile={mobile}>{navn}</HeroT>
      </Seksjon>

      {/* KPI-strip */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: AK.gap }}>
          <KpiFlis label="Spillere" value={spillere} />
          <KpiFlis label="Pro" value={pro} />
          <KpiFlis label="College" value={college} />
          <KpiFlis label="Turneringer" value={turneringer} />
        </div>
      </Seksjon>

      {/* Spillertabell */}
      {tabellRader.length > 0 && (
        <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
          <Caps>Spillerne våre</Caps>
          <div style={{ marginTop: 14, marginBottom: 20 }}>
            <SeksT mobile={mobile} em="snittscore.">
              Topp spillere etter
            </SeksT>
          </div>
          <Kort pad={mobile ? "16px" : "20px 22px"}>
            <DataTabell
              columns={[
                { key: "navn", label: "Spiller" },
                { key: "tier", label: "Kategori" },
                { key: "snitt", label: "Snitt", mono: true, align: "right", sortable: true },
                { key: "runder", label: "Runder", mono: true, align: "right", sortable: true },
              ]}
              rows={tabellRader}
              sortKey="snitt"
              sortDir="asc"
              mobilKort
            />
          </Kort>
        </Seksjon>
      )}

      {/* Distribusjon + turneringer */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: AK.gap }}>
          <div>
            <Caps>Distribusjon</Caps>
            <div style={{ marginTop: 14, marginBottom: 20 }}>
              <SeksT mobile={mobile} em="profil.">
                Spiller
              </SeksT>
            </div>
            <Kort pad="20px 22px">
              {fordeling.map((f, i) => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${TL.hair}` }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: FORDELING_FARGE[f.label] ?? TL.mute }} />
                    {f.label}
                  </span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text }}>{f.n}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${TL.hair}`, fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
                {spillere} spillere totalt
              </div>
            </Kort>
          </div>

          <div>
            <Caps>Turneringer</Caps>
            <div style={{ marginTop: 14, marginBottom: 20 }}>
              <SeksT mobile={mobile} em="aktivitet.">
                Siste
              </SeksT>
            </div>
            {aktivitet.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {aktivitet.map((t) => (
                  <Kort key={t.id} pad="14px 18px">
                    <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>{t.navn}</div>
                    <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 4 }}>{t.dato}</div>
                  </Kort>
                ))}
              </div>
            ) : (
              <Kort>
                <TomTilstand icon="trophy" title="Ingen turneringer registrert ennå" sub={`${turneringer} turneringer registrert på denne klubben totalt. Data synkes løpende.`} />
              </Kort>
            )}
          </div>
        </div>
      </Seksjon>

      {/* Mersalg */}
      <Seksjon mobile={mobile}>
        <Kort tint pad={mobile ? "26px 22px" : "40px 44px"} style={{ textAlign: mobile ? "left" : "center" }}>
          <Caps color={TL.fill} style={{ marginBottom: 14 }}>
            PlayerHQ
          </Caps>
          <SeksT mobile={mobile} em={navn}>
            Spill for
          </SeksT>
          <p style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, margin: "14px auto 0", maxWidth: 480, lineHeight: 1.65 }}>
            Logg runder og hev klubbens snitt. Sammenlign deg med de beste fra din klubb.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22, justifyContent: mobile ? "flex-start" : "center" }}>
            <MCta icon="arrow-right" href="/auth/signup">
              Start gratis
            </MCta>
            <MCta ghost href="/stats/klubber">
              Alle klubber
            </MCta>
          </div>
        </Kort>
      </Seksjon>
    </StatsRamme>
  );
}
