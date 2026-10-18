"use client";

/**
 * AG-16 Gruppa i nytt design (designbrevet 13.10.2026) — /admin/grupper/[id].
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «Gruppa».
 *
 * Samme data og handlinger som før (GruppeDetaljV2Data og handlingene i
 * src/app/admin/grupper/[id]/gruppe-actions.tsx): legg til og fjern medlem,
 * trinnfilter, neste samlinger, rull ut mal og slett gruppe.
 * Fanene er egne adresser: Medlemmer · Faste tider · Skoledata · Stats (AG-A03).
 *
 * Avvik:
 *   - «Tildel TrackMan-økt» til gruppa har ingen handling i appen og er utelatt.
 *     «Tildel test» åpner AG-15 (tildeling per spiller).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, KnappLenke, Nokkelverdier, Pille, Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import type { GruppeDetaljV2Actions, GruppeDetaljV2Data } from "@/components/admin/v2/GruppeDetaljV2";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/agencyos-ny-mer.css";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtHcp = (h: number | null) => formaterTall(h, 1, true);

export type GruppeFane = "medlemmer" | "tider" | "skoledata" | "stats";

/** Fanene i Gruppa. Hver er en egen adresse. */
export function GruppeFanerNy({ groupId, aktiv }: { groupId: string; aktiv: GruppeFane }) {
  const faner: ReadonlyArray<[GruppeFane, string, string]> = [
    ["medlemmer", "Medlemmer", `/admin/grupper/${groupId}`],
    ["tider", "Faste tider", `/admin/grupper/${groupId}/timeplan`],
    ["skoledata", "Skoledata", `/admin/grupper/${groupId}/arsplan/skoledata`],
    ["stats", "Stats", `/admin/grupper/${groupId}/analyse`],
  ];
  return <nav className="faner" aria-label="Gruppa">
    {faner.map(([id, label, href]) => <Link key={id} href={href} aria-current={aktiv === id ? "page" : undefined}>{label}</Link>)}
  </nav>;
}

export function AG16Gruppe({ data, actions: A, ekstra }: { data: GruppeDetaljV2Data; actions: GruppeDetaljV2Actions; ekstra?: ReactNode }) {
  const rolle = (m: GruppeDetaljV2Data["medlemmer"][number]) => (m.erTrener ? "Coach" : m.erHjelpetrener ? "Assist Coach" : "Spiller");
  return <div className="agn-s">
    <Topp tilbake={{ href: "/admin/grupper", tekst: "Grupper" }}
      dato={`Gruppe · ${data.type} · coach ${data.coachNavn ?? "ikke satt"}`}
      tittel={data.navn}
      handlinger={<>
        <KnappLenke href={`/admin/grupper/${data.id}/workbench`}>Åpne gruppeplanen</KnappLenke>
        <KnappLenke href={`/admin/grupper/${data.id}/arsplan`}>Årsplan</KnappLenke>
      </>} />
    <GruppeFanerNy groupId={data.id} aktiv="medlemmer" />

    <div className="teller-rad">
      <div className="teller"><span className="e">Medlemmer</span><b className="t">{data.antallMedlemmer}</b><span className="s">{data.antallHjelpetrenere} assist coach</span></div>
      <div className="teller"><span className="e">Snitt-HCP</span><b className="t">{data.snittHcp}</b></div>
      <div className="teller"><span className="e">Runder · 90 d</span><b className="t">{data.totalRunder}</b></div>
      <div className="teller"><span className="e">Samlinger</span><b className="t">{data.antallSamlinger}</b></div>
    </div>

    <div className="to-del bred-v">
      <div>
        <Seksjon tittel={`Medlemmer · ${data.medlemmer.length}`} hoyre={<A.LeggTilSpillerButton groupId={data.id} kandidater={data.kandidater} trenerKandidater={data.trenerKandidater} />}>
          {data.trinnValg.length > 0 && <div className="chips" role="group" aria-label="Trinn">
            {["", ...data.trinnValg].map((t) => <Link key={t || "alle"} href={t ? `?trinn=${encodeURIComponent(t)}` : "?"} scroll={false} aria-current={(data.aktivtTrinn ?? "") === t ? "page" : undefined}>{t || "Alle"}</Link>)}
          </div>}
          {data.medlemmer.length === 0
            ? <Tom tittel="Ingen medlemmer" tekst="Legg til spillere med PlayerHQ i gruppa." />
            : <div className="kort rader">
              {data.medlemmer.map((m) => <div key={m.id} className="mer-rad">
                <Avatar navn={m.navn} liten lys={m.erTrener || m.erHjelpetrener} />
                <span><Link href={`/admin/spillere/${m.userId}`} style={{ color: "inherit", textDecoration: "none" }}><b>{m.navn}</b></Link>
                  <span className="kilde">{rolle(m)} · HCP {fmtHcp(m.hcp)}{m.schoolYear ? ` · ${m.schoolYear}` : ""}{m.homeClub ? ` · ${m.homeClub}` : ""}</span></span>
                <span className="hoyre">{m.erPro && <Pille>Full</Pille>}<A.FjernMedlemButton groupId={data.id} userId={m.userId} navn={m.navn} /></span>
              </div>)}
            </div>}
          <p className="kilde">Gruppa rangerer ikke spillerne.</p>
        </Seksjon>
      </div>
      <div>
        <Seksjon tittel="Neste samlinger" hoyre={<A.SeAlleTimePlanButton groupId={data.id} />}>
          {data.nesteSamling
            ? <div className="kort">
              <div><b className="undertittel">{data.nesteSamling.title}</b>
                <p className="kilde">{NB_DATO.format(new Date(data.nesteSamling.startAt))}{data.nesteSamling.location ? ` · ${data.nesteSamling.location}` : ""}</p>
                {data.nesteSamling.description && <p className="forklar" style={{ marginTop: 6 }}>{data.nesteSamling.description}</p>}</div>
              <div className="knapper"><A.DetaljerButton groupId={data.id} scheduleId={data.nesteSamling.id} /><A.StartOktButton /></div>
              {data.kommendeSamlinger.slice(1).map((s) => <div key={s.id} className="mer-rad">
                <span className="mono kilde">{NB_DATO.format(new Date(s.startAt))}</span>
                <span><b>{s.title}</b>{s.location && <span className="kilde">{s.location}</span>}</span>
                <A.AapneButton groupId={data.id} scheduleId={s.id} />
              </div>)}
            </div>
            : <Tom tittel="Ingen samlinger planlagt" tekst="Legg inn en fast økt under Faste tider."
              handling={<KnappLenke href={`/admin/grupper/${data.id}/timeplan`}>Ny gruppetrening</KnappLenke>} />}
        </Seksjon>
        <Seksjon tittel="Tildel til gruppa">
          <div className="knapper"><KnappLenke href="/admin/tester?fane=tildelt">Tildel test</KnappLenke></div>
        </Seksjon>
        {ekstra}
        <Seksjon tittel="Coach">
          <Nokkelverdier rader={[["Coach", data.coachNavn ?? "Ikke satt"], ["E-post", data.coachEpost ?? "—"]]} />
        </Seksjon>
        <div className="knapper"><A.SlettGruppeButton groupId={data.id} navn={data.navn} antallMedlemmer={data.antallMedlemmer} antallSamlinger={data.antallSamlinger} /></div>
      </div>
    </div>
  </div>;
}
