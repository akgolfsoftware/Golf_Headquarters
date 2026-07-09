"use client";

/**
 * AgencyOS Team — v2 (retning C «Presis»). Rekomponerer /admin/team
 * (coach- og admin-roster med invitasjon) i v2-språket, drevet av EKTE
 * Prisma-data fra ruten. Bygget utelukkende av v2-komponentbiblioteket
 * (src/components/v2) — ingen ad-hoc UI, ingen rå hex (kun T.*).
 *
 * Mobil-først: KPI-grid 2→4 kolonner, søk filtrerer lista på klienten,
 * roster som Rad-liste (søster-idiom til StallV2) som stables trygt på 375px.
 * Rolle-pillen vises fra md-breakpoint; e-post-handlingen er alltid
 * tilgjengelig per rad.
 *
 * Ærlige tomrom: kun felter med kilde vises (navn, rolle, antall grupper,
 * tidsvinduer, e-post). Ingen fabrikerte tall.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  KpiFlis,
  CTAPill,
  Inndata,
  TomTilstand,
  Icon,
  T,
} from "@/components/v2";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface AdminTeamV2Member {
  id: string;
  navn: string;
  epost: string;
  rolle: "ADMIN" | "COACH";
  /** Antall grupper coachen eier (_count.coachedGroups). */
  grupper: number;
  /** Antall tilgjengelighets-vinduer (_count.coachAvailability). */
  tidsvinduer: number;
}
export interface AdminTeamV2Data {
  medlemmer: AdminTeamV2Member[];
  totalCount: number;
  adminCount: number;
  coachCount: number;
  totalSpillere: number;
  /** Snitt spillere per coach, ferdig formatert (komma-desimal) eller «—». */
  snittSpillere: string;
  /** Adresse til invitasjonsskjemaet. */
  inviterHref: string;
}

const grStr = (n: number) => (n === 1 ? "1 gruppe" : `${n} grupper`);
const tvStr = (n: number) => (n === 1 ? "1 tidsvindu" : `${n} tidsvinduer`);

function MedlemRad({ m, last }: { m: AdminTeamV2Member; last: boolean }) {
  const admin = m.rolle === "ADMIN";
  return (
    <Rad
      leading={<AvatarInit navn={m.navn} size={34} />}
      title={m.navn}
      sub={`${admin ? "Administrator" : "Coach"} · ${grStr(m.grupper)} · ${tvStr(m.tidsvinduer)}`}
      meta={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span className="hidden md:inline-flex">
            <StatusPill tone={admin ? "lime" : "info"}>{admin ? "Admin" : "Coach"}</StatusPill>
          </span>
          <a
            href={`mailto:${m.epost}`}
            aria-label={`Send e-post til ${m.navn}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CTAPill ghost icon="mail" />
          </a>
        </span>
      }
      trailing={null}
      last={last}
    />
  );
}

export function AdminTeamV2({ data }: { data: AdminTeamV2Data }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const filtrert = term
    ? data.medlemmer.filter(
        (m) => m.navn.toLowerCase().includes(term) || m.epost.toLowerCase().includes(term),
      )
    : data.medlemmer;

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>{`${data.totalCount === 1 ? "1 coach" : `${data.totalCount} coacher`} · AgencyOS`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="og roller.">Team</Tittel>
        </div>
      </div>
      <Link href={data.inviterHref} style={{ textDecoration: "none" }}>
        <CTAPill icon="user-plus">Inviter coach</CTAPill>
      </Link>
    </div>
  );

  const kpier = (
    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
      <KpiFlis tint label="Aktive coacher" value={data.totalCount} />
      <KpiFlis label="Spillere fordelt" value={data.totalSpillere} />
      <KpiFlis label="Admin-tilgang" value={data.adminCount} />
      <KpiFlis label="Coacher" value={data.coachCount} />
    </div>
  );

  const sok = (
    <Inndata
      label={null}
      value={q}
      onChange={setQ}
      placeholder="Søk etter navn eller e-post…"
      suffix={<Icon name="search" size={13} style={{ color: T.mut }} />}
    />
  );

  const liste =
    filtrert.length === 0 ? (
      <Kort>
        <TomTilstand
          icon="users"
          title={term ? "Ingen treff" : "Bare deg så langt"}
          sub={
            term
              ? "Ingen teammedlemmer passer søket akkurat nå."
              : "Inviter din første coach — de får en e-post med innloggingslink og kan logge inn umiddelbart."
          }
        />
      </Kort>
    ) : (
      <Kort
        eyebrow="Team · roller"
        action={<Caps size={9}>{`Snitt ${data.snittSpillere} spillere / coach`}</Caps>}
        pad="6px 20px 8px"
      >
        {filtrert.map((m, i) => (
          <MedlemRad key={m.id} m={m} last={i === filtrert.length - 1} />
        ))}
      </Kort>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      {kpier}
      {sok}
      {liste}
      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: 0 }}>
        Inviterte coacher får en e-post med innloggingslink. Autentisering skjer via Supabase Auth ved
        første innlogging.
      </p>
    </div>
  );
}
