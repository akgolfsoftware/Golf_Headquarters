"use client";

/**
 * AgencyOS Organisasjon — v2 (retning C «Presis»). Coach/ADMIN-flate for klubb,
 * team, snarveier og tilgang. Ingen mockup fantes — komponert utelukkende av
 * v2-biblioteket (src/components/v2), ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Funksjon/data bevart fra de ekte skjermene den samler
 * (src/app/admin/organisasjon + /admin/settings + /admin/klubb/innstillinger):
 *   - KPI: klubber · fasiliteter · coacher · admin (ekte Prisma-tellinger).
 *   - Klubb-info fra ClubSettings-singelton (navn/org.nr/daglig leder/e-post/
 *     telefon/adresse) — «—» der feltet er tomt, aldri fabrikert.
 *   - Klubber & anlegg fra prisma.location (navn/adresse/aktiv/fasilitetstall).
 *   - Team & roller fra prisma.user (ADMIN/COACH + unike spillere i gruppene);
 *     ADMIN = «Eier», COACH = «Coach».
 *   - Snarveier (handlingsrader) til organisasjonens undersider — ekte ruter,
 *     ingen fabrikerte statustall.
 *   - Tilgang & synlighet: org-preferansene har ingen persistensmodell ennå, så
 *     radene vises ærlig som «—» (ingen påfunnet av/på-tilstand), med lenke til
 *     den ekte CBAC-tilgangsmatrisen.
 *
 * Mobil: KPI 2-kol, alle 2-kol-seksjoner stables (klubb-info | klubber, samt
 * team | snarveier), lister er kort-rader. Tabell-følelsen på team ligger i en
 * desktop-only kolonneoverskrift som skjules under md.
 */

import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  CTAPill,
  AvatarInit,
  ProfilFelt,
  InnsiktChip,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export interface AdminOrgV2KlubbInfo {
  navn: string;
  orgNr: string;
  dagligLeder: string;
  epost: string;
  telefon: string;
  adresse: string;
}
export interface AdminOrgV2Klubb {
  id: string;
  navn: string;
  adresse: string;
  aktiv: boolean;
  fasiliteter: number;
}
export interface AdminOrgV2Team {
  id: string;
  navn: string;
  rolle: string;
  spillere: number;
  eier: boolean;
}
export interface AdminOrgV2Handling {
  icon: string;
  tittel: string;
  sub: string;
  href: string;
}
export interface AdminOrgV2Data {
  klubbInfo: AdminOrgV2KlubbInfo;
  redigerHref: string;
  kpis: { klubber: number; fasiliteter: number; coacher: number; admin: number };
  klubber: AdminOrgV2Klubb[];
  team: AdminOrgV2Team[];
  handlinger: AdminOrgV2Handling[];
  /** Ærlige tilgangs-etiketter uten persistert av/på-tilstand. */
  tilgangRader: string[];
  tilgangHref: string;
}

const TOM = "—";
const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** Liten ikon-flate til snarvei-radenes leading. */
function HandlingIkon({ name }: { name: string }) {
  return (
    <span
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: T.panel2,
        border: `1px solid ${T.border}`,
      }}
    >
      <Icon name={name} size={16} style={{ color: T.fg2 }} />
    </span>
  );
}

export function AdminOrgV2({ data }: { data: AdminOrgV2Data }) {
  const { klubbInfo, kpis } = data;

  // ── Hode ──────────────────────────────────────────────────────
  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>System · Admin · AgencyOS</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="& tilgang.">Organisasjon</Tittel>
        </div>
      </div>
      <Link href={data.redigerHref} className="hidden md:inline-flex" style={{ textDecoration: "none" }}>
        <CTAPill icon="pencil">Rediger klubb</CTAPill>
      </Link>
    </div>
  );

  // ── KPI-flis (4) ──────────────────────────────────────────────
  const kpi = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis label="Klubber" value={kpis.klubber} />
      <KpiFlis label="Fasiliteter" value={kpis.fasiliteter} />
      <KpiFlis label="Coacher" value={kpis.coacher} />
      <KpiFlis label="Admin" value={kpis.admin} />
    </div>
  );

  // ── Klubb-info (ClubSettings-singelton, «—» ved tomt felt) ─────
  const felt = (label: string, value: string, mono?: boolean) => (
    <ProfilFelt label={label} value={value === TOM ? undefined : value} placeholder={TOM} mono={mono} />
  );
  const klubbinfo = (
    <Kort
      tint
      eyebrow="Klubb-info"
      action={
        <Link href={data.redigerHref} style={{ textDecoration: "none" }}>
          <Caps size={9} color={T.lime}>Rediger →</Caps>
        </Link>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
        {felt("Klubbnavn", klubbInfo.navn)}
        {felt("Org.nr", klubbInfo.orgNr, true)}
        {felt("Daglig leder", klubbInfo.dagligLeder)}
        {felt("E-post", klubbInfo.epost)}
        {felt("Telefon", klubbInfo.telefon, true)}
        {felt("Adresse", klubbInfo.adresse)}
      </div>
    </Kort>
  );

  // ── Klubber & anlegg (prisma.location) ────────────────────────
  const klubber = (
    <Kort
      eyebrow="Klubber & anlegg"
      action={data.klubber.length > 0 ? <Caps size={9}>{pl(data.klubber.length, "klubb", "klubber")}</Caps> : undefined}
      pad="4px 20px"
    >
      {data.klubber.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="building-2" title="Ingen klubber registrert" sub="Legg til klubb og anlegg under Klubb-innstillinger." />
        </div>
      ) : (
        data.klubber.map((k, i) => (
          <Rad
            key={k.id}
            leading={<AvatarInit navn={k.navn} size={34} />}
            title={k.navn}
            sub={k.adresse || TOM}
            meta={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {pl(k.fasiliteter, "fasilitet", "fasiliteter")}
                </span>
                <StatusPill tone={k.aktiv ? "up" : "down"}>{k.aktiv ? "Aktiv" : "Inaktiv"}</StatusPill>
              </span>
            }
            trailing={null}
            last={i === data.klubber.length - 1}
          />
        ))
      )}
    </Kort>
  );

  // ── Team & roller (prisma.user ADMIN/COACH) ───────────────────
  const teamHode = (
    <div className="hidden md:flex" style={{ alignItems: "center", gap: 12, padding: "0 0 8px" }}>
      <span style={{ width: 34, flex: "none" }} />
      <Caps size={9} style={{ flex: 1 }}>Coach</Caps>
      <Caps size={9} style={{ width: 150, flex: "none", textAlign: "right" }}>Spillere · rolle</Caps>
    </div>
  );
  const team = (
    <Kort
      eyebrow="Team & roller"
      action={data.team.length > 0 ? <Caps size={9}>{pl(data.team.length, "person", "personer")}</Caps> : undefined}
      pad="4px 20px"
    >
      {data.team.length === 0 ? (
        <div style={{ padding: "16px 0" }}>
          <TomTilstand icon="users" title="Ingen coacher registrert" sub="Ingen ADMIN- eller COACH-brukere er koblet til organisasjonen ennå." />
        </div>
      ) : (
        <>
          {teamHode}
          {data.team.map((t, i) => (
            <Rad
              key={t.id}
              leading={<AvatarInit navn={t.navn} size={34} />}
              title={t.navn}
              sub={t.rolle}
              meta={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {t.spillere}
                  </span>
                  <StatusPill tone={t.eier ? "lime" : "info"}>{t.eier ? "Eier" : "Coach"}</StatusPill>
                </span>
              }
              trailing={null}
              last={i === data.team.length - 1}
            />
          ))}
        </>
      )}
    </Kort>
  );

  // ── Snarveier (handlingsrader → undersider, ekte ruter) ───────
  const snarveier = (
    <Kort eyebrow="Snarveier" pad="4px 20px">
      {data.handlinger.map((h, i) => (
        <Link key={h.href} href={h.href} style={{ textDecoration: "none", display: "block" }}>
          <Rad
            leading={<HandlingIkon name={h.icon} />}
            title={h.tittel}
            sub={h.sub}
            last={i === data.handlinger.length - 1}
          />
        </Link>
      ))}
    </Kort>
  );

  // ── Tilgang & synlighet (ingen persistert av/på-tilstand) ─────
  const tilgang = (
    <Kort
      eyebrow="Tilgang & synlighet"
      action={
        <Link href={data.tilgangHref} style={{ textDecoration: "none" }}>
          <Caps size={9} color={T.lime}>Full matrise →</Caps>
        </Link>
      }
      pad="4px 20px"
    >
      {data.tilgangRader.map((label, i) => (
        <Rad
          key={label}
          title={label}
          meta={<span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut }}>{TOM}</span>}
          trailing={null}
          last={i === data.tilgangRader.length - 1}
        />
      ))}
    </Kort>
  );

  const innsikt = `${pl(kpis.klubber, "klubb", "klubber")} · ${pl(kpis.coacher + kpis.admin, "person i teamet", "personer i teamet")}. Rolletilgang styres i tilgangsmatrisen.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}

      {/* Mobil-handling (skjult på desktop der den ligger i hodet) */}
      <Link href={data.redigerHref} className="flex md:hidden" style={{ textDecoration: "none" }}>
        <CTAPill icon="pencil">Rediger klubb</CTAPill>
      </Link>

      {kpi}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {klubbinfo}
        {klubber}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
        {team}
        {snarveier}
      </div>

      {tilgang}

      <InnsiktChip cta="Åpne tilgang">{innsikt}</InnsiktChip>
    </div>
  );
}
