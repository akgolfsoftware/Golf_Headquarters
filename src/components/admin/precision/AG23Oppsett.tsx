"use client";

/**
 * AG-23 Oppsett i nytt design (designbrevet 13.10.2026) — /admin/oppsett og /admin/profile.
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-23 Oppsett».
 *
 * Viser bare det som finnes i basen (egen profil, team). Det som ikke er koblet står
 * som «ikke koblet ennå»; ingenting lagres eller bekreftes falskt. GDPR og logger har
 * egne sider (/admin/gdpr, /admin/audit-log, /admin/feillogg) som fanene lenker til.
 *
 * Faner: Team · Profil · Varsler · Integrasjoner · GDPR · Logger · Markedsføring og hjelp.
 * Gamle fane-ider (inviter, ekstern, mark, virks) peker til fanen de nå ligger i.
 *
 * Avvik:
 *   - Profilen kan ikke endres her (ingen handling); den vises.
 *   - Sletteforespørsler og loggen vises på egne sider, ikke inni fanen.
 *   - «Inviter coach» vises bare for head coach (Anders 16.10, anbefalingen i resten.html).
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, Feil, KnappLenke, Laster, Nokkelverdier, Pille, Seksjon, Tom, Topp, Varsel } from "@/components/admin/agencyos-ny/ny";
import "@/styles/agencyos-ny-mer.css";

export type TeamMedlem = {
  id: string;
  name: string;
  role: string;
  access: "Admin" | "Coach" | "Les";
  /** Null når visningen ikke har lov til å vise e-posten. */
  email: string | null;
};

export type AG23Data = {
  team: TeamMedlem[];
  /** Innlogget brukers egne opplysninger. Null når de ikke er lastet. */
  profil: { navn: string; epost: string | null; rolle: string } | null;
};

export type AG23Tilstand = "data" | "tom" | "laster" | "feil";

export type AG23OppsettProps = {
  tilstand?: AG23Tilstand;
  data?: AG23Data;
  startFane?: string;
  /** Head coach (ADMIN) kan invitere coach og sette opp ekstern trener. */
  erHeadCoach?: boolean;
};

const TOM_DATA: AG23Data = { team: [], profil: null };

type Fane = "team" | "profil" | "varsler" | "integr" | "gdpr" | "logg" | "hjelp";
const FANER: ReadonlyArray<[Fane, string]> = [
  ["team", "Team"], ["profil", "Profil"], ["varsler", "Varsler"], ["integr", "Integrasjoner"],
  ["gdpr", "GDPR"], ["logg", "Logger"], ["hjelp", "Markedsføring og hjelp"],
];
const ALIAS: Record<string, Fane> = { inviter: "team", ekstern: "team", mark: "hjelp", virks: "hjelp" };
const tilFane = (f: string): Fane => ALIAS[f] ?? (FANER.find(([id]) => id === f)?.[0] ?? "team");

function Lenkeliste({ rader }: { rader: ReadonlyArray<[string, string, string]> }) {
  return <div className="liste">
    {rader.map(([href, tittel, tekst]) => <Link key={href} href={href}>
      <span className="ikonboks"><ChevronRight className="ikon" aria-hidden /></span>
      <span><b>{tittel}</b><span className="kilde">{tekst}</span></span>
      <ChevronRight className="ikon" aria-hidden />
    </Link>)}
  </div>;
}

export function AG23Oppsett({ tilstand = "data", data = TOM_DATA, startFane = "team", erHeadCoach = false }: AG23OppsettProps) {
  const [fane, setFane] = useState<Fane>(tilFane(startFane));
  const topp = <Topp dato="Mer · oppsett" tittel="Oppsett" ingress="Profil, team, tilgang, varsler og integrasjoner." />;

  if (tilstand === "laster") return <div className="agn-s" data-testid="ag23-laster">{topp}<Laster tekst="Henter oppsett …" /></div>;
  if (tilstand === "feil") return <div className="agn-s" data-testid="ag23-feil">{topp}<Feil tittel="Oppsettet kunne ikke hentes" tekst="Ingen innstillinger er endret. Prøv igjen." kode="OPPSETT" /></div>;

  const team = tilstand === "tom" ? [] : data.team;

  return <div className="agn-s" data-testid="ag23-oppsett">
    {topp}
    <div className="faner" role="group" aria-label="Del">
      {FANER.map(([id, label]) => <button key={id} type="button" aria-pressed={fane === id} onClick={() => setFane(id)}>{label}</button>)}
    </div>

    {fane === "team" && <div className="seksjon" data-testid="ag23-fane-team">
      {team.length === 0
        ? <Tom tittel="Ingen teammedlemmer å vise" tekst="Coacher og admin vises her når de er lagt til." />
        : <div className="kort rader">
          {team.map((m) => <div key={m.id} className="mer-rad">
            <Avatar navn={m.name} liten />
            <span><b>{m.name}</b><span className="kilde">{m.access === "Admin" ? "Head coach · ser alt, også Økonomi" : "Coach"}{m.email ? ` · ${m.email}` : " · —"}</span></span>
            <Pille tone={m.access === "Admin" ? "ok" : "noy"}>{m.access === "Admin" ? "Head coach" : m.access}</Pille>
          </div>)}
        </div>}
      {erHeadCoach && <div className="knapper">
        <KnappLenke href="/admin/team/inviter" variant="pri">Inviter coach</KnappLenke>
        <KnappLenke href="/admin/team/ekstern">Ekstern trener</KnappLenke>
      </div>}
    </div>}

    {fane === "profil" && <Seksjon tittel="Egen profil" kilde="Bare visning">
      <div data-testid="ag23-fane-profil">
        {data.profil
          ? <Nokkelverdier rader={[["Navn", data.profil.navn], ["E-post", data.profil.epost ?? "—"], ["Rolle", data.profil.rolle]]} />
          : <p className="forklar">Profilen er ikke lastet.</p>}
        <p className="kilde" style={{ marginTop: 8 }}>Endring av profil og totrinnsinnlogging er ikke koblet ennå.</p>
      </div>
    </Seksjon>}

    {fane === "varsler" && <div data-testid="ag23-fane-varsler"><Tom tittel="Varselinnstillinger er ikke koblet ennå" tekst="Innstillingene lagres ikke fra denne skjermen ennå." /></div>}

    {fane === "integr" && <div data-testid="ag23-fane-integr">
      <Tom tittel="Integrasjonsstatus er ikke koblet ennå" tekst="Status for TrackMan, GolfBox, Tripletex og Data Golf leses ikke her ennå."
        handling={<KnappLenke href="/admin/workspace/notion">Notion-oppsett</KnappLenke>} />
    </div>}

    {fane === "gdpr" && <div className="seksjon" data-testid="ag23-fane-gdpr">
      <Varsel tittel="Sletteforespørsler">Spillere ber om sletting fra Meg › Personvern. Head coach godkjenner på GDPR-siden.</Varsel>
      <Lenkeliste rader={[["/admin/gdpr", "GDPR og sletting", "Sletteforespørsler, eksport og samtykker"]]} />
    </div>}

    {fane === "logg" && <div className="seksjon" data-testid="ag23-fane-logg">
      <Lenkeliste rader={[["/admin/audit-log", "Handlingslogg", "Hvem endret hva, og når"], ["/admin/feillogg", "Feillogg", "Feil fra appen og jobbene"]]} />
    </div>}

    {fane === "hjelp" && <div className="seksjon" data-testid="ag23-fane-mark">
      <Lenkeliste rader={[
        ["/admin/email-templates", "E-postmaler", "Malene som brukes i Innboks"],
        ["/admin/hjelp", "Hjelp", "Spørsmål og svar for coacher"],
      ]} />
      <Seksjon tittel="Virksomhet">
        <Nokkelverdier rader={[["Org.nr.", "—", "Ikke registrert her"], ["Virksomheter", "Mulligan · Academy · Software · WANG · GFGK"], ["Tidssone", "Europe/Oslo"]]} />
      </Seksjon>
    </div>}
  </div>;
}
