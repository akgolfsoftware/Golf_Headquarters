"use client";

/**
 * AgencyOS Oppsett-hub — Train-lock (T13, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-18 Oppsett-hub.dc.html (3 skall) +
 * AG-13 Oppsett.dc.html (eldre variant, HANDOFF §16: AG-18 er gjeldende).
 * Fem rader — Akademi, Varsler, Tilgang og roller, Klubb og steder, Konto —
 * INGEN hvit primær-CTA («kjedelig er riktig», ingenting å utføre på
 * hub-nivå). Varsler og Konto navigerer ut til egne, eksisterende ruter
 * (/admin/varsler, /admin/profile); Akademi/Tilgang/Klubb har detalj inni
 * hub-en via `?rad=`.
 *
 * /admin/team folder inn i «Tilgang og roller» (T13-oppgaven) — samme
 * medlemsliste/tellinger som AdminTeamV2, portet til TL. /admin/team
 * redirecter hit.
 *
 * Master–detalj (A2, beslutninger.md §PP-A): desktop viser radlisten +
 * valgt rads detalj i 380px-panelet (samme MasterDetalj-primitiv som T3).
 * Mobil: radlisten alene; velges en rad navigerer siden til `?rad=` og
 * viser KUN detaljen med en TlTilbake til hub-en (fasitens push-mønster).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { MasterDetalj, TlCaps, TlInspektorBlokk, TlInspektorKpi, TlInspektorLinje, TlInspektorpanel, TlKnapp, TlRad, TlRadGruppe, TlTilbake, TlTittel, TlToggleRad, useInspektorSynlig } from "./tl-kit";

export type OppsettRadKey = "akademi" | "varsler" | "tilgang" | "klubb" | "konto";

export interface OppsettTeamMedlem {
  id: string;
  navn: string;
  epost: string;
  rolle: "ADMIN" | "COACH";
  grupper: number;
  tidsvinduer: number;
}

export interface OppsettKlubb {
  id: string;
  navn: string;
  aktiv: boolean;
  fasiliteter: number;
}

export interface AdminOppsettHubData {
  akademi: {
    navn: string;
    hjemmeklubb: string | null;
    sesong: number;
    ukestart: string;
  };
  varslerBeskrivelse: string;
  tilgang: {
    medlemmer: OppsettTeamMedlem[];
    totalCount: number;
    adminCount: number;
    coachCount: number;
    totalSpillere: number;
    snittSpillere: string;
    inviterHref: string;
    tilgangsmatriseHref: string;
  };
  klubb: {
    lokasjoner: OppsettKlubb[];
    innstillingerHref: string;
    fasiliteterHref: string;
  };
  konto: {
    navn: string;
    epost: string;
    rolleLabel: string;
    href: string;
  };
}

const RAD_HREF = "/admin/settings";

function radHref(rad: OppsettRadKey): string {
  return `${RAD_HREF}?rad=${rad}`;
}

/** Akademi — organisasjonens identitet. Ingen redigerbare felter er tegnet i fasiten (Google-synk hører i Kalender-bølgen). */
function AkademiPanel({ data }: { data: AdminOppsettHubData["akademi"] }) {
  return (
    <TlInspektorpanel tittel="Akademi" ariaLabel="Akademi">
      <TlRadGruppe>
        <TlRad title="Navn" trailing={<span style={{ fontSize: 13, color: TL.mute }}>{data.navn}</span>} chevron={false} />
        <TlRad title="Hjemmeklubb" trailing={<span style={{ fontSize: 13, color: TL.mute }}>{data.hjemmeklubb ?? "—"}</span>} chevron={false} />
        <TlRad title="Sesong" trailing={<span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{data.sesong}</span>} chevron={false} />
        <TlRad title="Ukestart" trailing={<span style={{ fontSize: 13, color: TL.mute }}>{data.ukestart}</span>} chevron={false} last />
      </TlRadGruppe>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>Google-synk og ⌘K er ikke tegnet — de hører i Kalender-bølgen.</p>
    </TlInspektorpanel>
  );
}

function TilgangPanel({ data }: { data: AdminOppsettHubData["tilgang"] }) {
  return (
    <TlInspektorpanel
      tittel="Tilgang og roller"
      ariaLabel="Tilgang og roller"
      fot={<TlKnapp variant="sekundaer" href={data.inviterHref} full>Inviter coach</TlKnapp>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TlInspektorKpi label="Team" verdi={String(data.totalCount)} sub={`${data.adminCount} admin · ${data.coachCount} coach`} />
        <TlInspektorKpi label="Spillere" verdi={String(data.totalSpillere)} sub={`snitt ${data.snittSpillere} pr. coach`} />
      </div>

      <TlInspektorBlokk label="Medlemmer">
        {data.medlemmer.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12.5, color: TL.mute }}>Ingen coacher eller administratorer registrert ennå.</p>
        ) : (
          data.medlemmer.map((m) => (
            <TlInspektorLinje
              key={m.id}
              label={`${m.navn} · ${m.rolle === "ADMIN" ? "Eier" : "Coach"}`}
              verdi={`${m.grupper} grp`}
            />
          ))
        )}
      </TlInspektorBlokk>

      <Link href={data.tilgangsmatriseHref} style={{ textDecoration: "none" }}>
        <TlInspektorLinje label="Full tilgangsmatrise (roller × capabilities)" verdi="åpne" />
      </Link>
    </TlInspektorpanel>
  );
}

function KlubbPanel({ data }: { data: AdminOppsettHubData["klubb"] }) {
  const aktive = data.lokasjoner.filter((l) => l.aktiv).length;
  return (
    <TlInspektorpanel
      tittel="Klubb og steder"
      ariaLabel="Klubb og steder"
      fot={<TlKnapp variant="sekundaer" href={data.innstillingerHref} full>Åpne klubb-innstillinger</TlKnapp>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TlInspektorKpi label="Steder" verdi={String(data.lokasjoner.length)} sub={`${aktive} aktive`} />
        <TlInspektorKpi label="Fasiliteter" verdi={String(data.lokasjoner.reduce((s, l) => s + l.fasiliteter, 0))} sub="range, rom, simulator" />
      </div>

      {data.lokasjoner.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>Ingen klubber eller anlegg registrert ennå.</p>
      ) : (
        <TlInspektorBlokk label="Steder">
          {data.lokasjoner.map((l) => (
            <TlInspektorLinje key={l.id} label={l.aktiv ? l.navn : `${l.navn} · deaktivert`} verdi={`${l.fasiliteter} fasiliteter`} />
          ))}
        </TlInspektorBlokk>
      )}

      <div style={{ background: TL.dock, borderRadius: 14, padding: 14 }}>
        <TlCaps size={9}>Simulator</TlCaps>
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: TL.text }}>Bookbar ressurs: nei</div>
        <div style={{ marginTop: 4, fontSize: 12, color: TL.mute }}>Simulator er ikke et produkt. Data kommer fra coaching-økter.</div>
      </div>

      <Link href={data.fasiliteterHref} style={{ textDecoration: "none" }}>
        <TlInspektorLinje label="Fasiliteter · opprett og rediger" verdi="åpne" />
      </Link>
    </TlInspektorpanel>
  );
}

function panelFor(rad: OppsettRadKey, data: AdminOppsettHubData) {
  if (rad === "akademi") return <AkademiPanel data={data.akademi} />;
  if (rad === "tilgang") return <TilgangPanel data={data.tilgang} />;
  if (rad === "klubb") return <KlubbPanel data={data.klubb} />;
  return <AkademiPanel data={data.akademi} />;
}

function OppsettListe({ data, valgtRad }: { data: AdminOppsettHubData; valgtRad: OppsettRadKey }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
      <TlTittel sub="AK Golf Academy">Oppsett</TlTittel>
      <div style={{ fontSize: 13, color: TL.mute }}>Kjedelig er riktig</div>

      <TlRadGruppe>
        <TlRad
          title="Akademi"
          sub="Navn, klubb, sesong"
          href={radHref("akademi")}
          last={false}
        />
        <TlRad
          title="Varsler"
          sub={data.varslerBeskrivelse}
          href="/admin/varsler"
        />
        <TlRad
          title="Tilgang og roller"
          sub="Coach · spiller · forelder"
          meta={String(data.tilgang.totalCount)}
          href={radHref("tilgang")}
        />
        <TlRad
          title="Klubb og steder"
          sub={data.klubb.lokasjoner[0]?.navn ?? "Ingen registrert"}
          href={radHref("klubb")}
        />
        <TlRad
          title="Konto"
          sub={data.konto.navn}
          href={data.konto.href}
          last
        />
      </TlRadGruppe>

      {/* AG-18 linje 39/138: eget toggle-panel under rad-listen, ikke sjette rad.
          UI-only inntil ekte «spillere ser publiserte uker»-setting finnes — se TlToggleRad. */}
      <TlToggleRad title="Spillere ser sin plan" sub="Publiserte uker vises i Player HQ." />
      <div style={{ fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>Google-synk hører i Kalender-bølgen og er ikke tegnet.</div>

      <div aria-hidden style={{ display: "none" }} data-valgt-rad={valgtRad} />
    </div>
  );
}

export function AdminOppsettHubTrainLock({ data, rad }: { data: AdminOppsettHubData; rad: OppsettRadKey | null }) {
  const desktop = useInspektorSynlig();
  const valgtRad: OppsettRadKey = rad ?? "akademi";

  if (!desktop && rad) {
    // Mobil, rad valgt → kun detaljen (fasitens push-mønster), med tilbake til hub-en.
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        <TlTilbake href={RAD_HREF}>Oppsett</TlTilbake>
        {panelFor(valgtRad, data)}
      </div>
    );
  }

  return (
    <MasterDetalj panel={panelFor(valgtRad, data)}>
      <OppsettListe data={data} valgtRad={valgtRad} />
    </MasterDetalj>
  );
}
