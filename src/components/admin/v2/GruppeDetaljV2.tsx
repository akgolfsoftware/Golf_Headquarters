"use client";

/**
 * AgencyOS Gruppe-detalj — v2 (retning C «Presis»). Rekomponert fra
 * legacy-skjermen (admin/(legacy)/grupper/[id]): hero, neste samling,
 * medlem-grid med sammenlignet statistikk (HCP/runder/plan-fremdrift),
 * gruppeprestasjon-quick-stats.
 *
 * StartOktButton/LeggTilSpillerButton/FjernMedlemButton/SeAlleTimePlanButton/
 * DetaljerButton/AapneButton (gruppe-actions.tsx) er tailwind-only og
 * gjenbrukes som de er.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  KpiFlis,
  StatusPill,
  MikroMeta,
  TomTilstand,
  AvatarFoto,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type SamlingRad = {
  id: string;
  title: string;
  startAt: string;
  location: string | null;
  recurring: string | null;
  maxParticipants: number | null;
};

export type MedlemRad = {
  id: string;
  userId: string;
  navn: string;
  avatarUrl: string | null;
  homeClub: string | null;
  erHjelpetrener: boolean;
  erPro: boolean;
  schoolYear: string | null;
  hcp: number | null;
  runder90d: number;
  planNavn: string | null;
  planAndel: number;
  planDone: number;
  planTotal: number;
};

export type GruppeDetaljV2Data = {
  id: string;
  navn: string;
  type: string;
  antallMedlemmer: number;
  antallHjelpetrenere: number;
  snittHcp: string;
  totalRunder: number;
  proAndel: number;
  antallSamlinger: number;
  coachNavn: string | null;
  coachEpost: string | null;
  nesteSamling: (SamlingRad & { description: string | null }) | null;
  kommendeSamlinger: SamlingRad[];
  medlemmer: MedlemRad[];
  trinnValg: string[];
  aktivtTrinn: string | null;
  kandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
};

export type GruppeDetaljV2Actions = {
  StartOktButton: React.ComponentType;
  LeggTilSpillerButton: React.ComponentType<{ groupId: string; kandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[] }>;
  FjernMedlemButton: React.ComponentType<{ groupId: string; userId: string; navn: string }>;
  SeAlleTimePlanButton: React.ComponentType<{ groupId: string }>;
  DetaljerButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
  AapneButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function fmtDato(iso: string): string {
  return NB_DATE.format(new Date(iso));
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function GruppeDetaljV2({
  data,
  actions: A,
}: {
  data: GruppeDetaljV2Data;
  actions: GruppeDetaljV2Actions;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Link href="/admin/grupper" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <MikroMeta icon="arrow-left">Grupper</MikroMeta>
      </Link>

      {/* Hode */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Caps>AgencyOS · Grupper</Caps>
            <StatusPill tone="lime">{data.type.toUpperCase()}</StatusPill>
          </div>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.navn}>{""}</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {data.antallMedlemmer} medlemmer · Snitt-HCP {data.snittHcp} · {data.antallSamlinger} planlagte samlinger · Coach{" "}
            {data.coachNavn ?? "ikke satt"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={`/admin/grupper/${data.id}/timeplan`} style={{ textDecoration: "none" }}>
            <MikroMeta icon="calendar">Planlegg / dupliser gruppetrening</MikroMeta>
          </Link>
          <A.LeggTilSpillerButton groupId={data.id} kandidater={data.kandidater} />
        </div>
      </div>

      {/* KPI-rad */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: T.gap }}>
        <KpiFlis label="Medlemmer" value={String(data.antallMedlemmer)} delta={`${data.antallHjelpetrenere} hjelpetrener`} />
        <KpiFlis label="Snitt-HCP" value={data.snittHcp} />
        <KpiFlis label="Runder · 90 d" value={String(data.totalRunder)} />
        <KpiFlis label="PRO-andel" value={`${data.proAndel}%`} />
      </div>

      {/* Neste samling */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <MikroMeta icon="calendar">Gruppeplan · neste samling</MikroMeta>
          </span>
        }
        action={<A.SeAlleTimePlanButton groupId={data.id} />}
      >
        {data.nesteSamling ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 14 }}>
              <div>
                <div style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 700, color: T.fg }}>{data.nesteSamling.title}</div>
                <p style={{ fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, margin: "6px 0 0" }}>
                  {fmtDato(data.nesteSamling.startAt)}
                  {data.nesteSamling.location && ` · ${data.nesteSamling.location}`}
                  {data.nesteSamling.recurring && data.nesteSamling.recurring !== "NONE" && ` · ${data.nesteSamling.recurring}`}
                  {data.nesteSamling.maxParticipants && ` · Max ${data.nesteSamling.maxParticipants} deltagere`}
                </p>
                {data.nesteSamling.description && (
                  <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, marginTop: 8, maxWidth: "60ch" }}>{data.nesteSamling.description}</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <A.DetaljerButton groupId={data.id} scheduleId={data.nesteSamling.id} />
                <A.StartOktButton />
              </div>
            </div>

            {data.kommendeSamlinger.length > 1 && (
              <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}` }}>
                {data.kommendeSamlinger.slice(1).map((s, i, arr) => (
                  <Rad
                    key={s.id}
                    last={i === arr.length - 1}
                    title={s.title}
                    sub={`${fmtDato(s.startAt)}${s.location ? ` · ${s.location}` : ""}`}
                    trailing={<A.AapneButton groupId={data.id} scheduleId={s.id} />}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, margin: 0 }}>
            Ingen samlinger planlagt. Bruk «Planlegg samling»-knappen for å legge inn første økt.
          </p>
        )}
      </Kort>

      {/* Medlemmer */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <MikroMeta icon="users">Medlemmer · sammenlign statistikk</MikroMeta>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>
            {data.medlemmer.length} av {data.antallMedlemmer}
          </span>
        </div>

        {data.trinnValg.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["", ...data.trinnValg].map((t) => {
              const on = (data.aktivtTrinn ?? "") === t;
              return (
                <Link key={t || "alle"} href={t ? `?trinn=${t}` : "?"} scroll={false} style={{ textDecoration: "none" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      borderRadius: 9999,
                      fontFamily: T.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: on ? T.onLime : T.mut,
                      background: on ? T.lime : T.panel2,
                      border: `1px solid ${on ? "transparent" : T.border}`,
                    }}
                  >
                    {t || "Alle"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {data.medlemmer.length === 0 ? (
          <Kort>
            <TomTilstand icon="users" title="Ingen medlemmer ennå" sub="Legg til spillere for å se sammenlignet statistikk per medlem." />
          </Kort>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
            {data.medlemmer.map((m) => (
              <Kort key={m.id} hover pad="16px 18px">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Link href={`/admin/spillere/${m.userId}`} style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "flex-start", gap: 10, textDecoration: "none" }}>
                    <AvatarFoto src={m.avatarUrl} navn={m.navn} size={44} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.navn}
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: T.mut, marginTop: 2 }}>
                        {m.homeClub ?? "Klubb ukjent"} · {m.erHjelpetrener ? "Hjelpetrener" : "Spiller"}
                        {m.schoolYear && ` · ${m.schoolYear}`}
                      </div>
                    </div>
                    {m.erPro && <StatusPill tone="lime">PRO</StatusPill>}
                  </Link>
                  <A.FjernMedlemButton groupId={data.id} userId={m.userId} navn={m.navn} />
                </div>

                <div className="grid grid-cols-3" style={{ gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  <div>
                    <Caps size={8.5}>HCP</Caps>
                    <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, marginTop: 4 }}>
                      {m.hcp != null ? m.hcp.toFixed(1).replace(".", ",") : "—"}
                    </div>
                  </div>
                  <div>
                    <Caps size={8.5}>Runder</Caps>
                    <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, marginTop: 4 }}>{m.runder90d}</div>
                  </div>
                  <div>
                    <Caps size={8.5}>Plan</Caps>
                    <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, marginTop: 4 }}>
                      {m.planNavn ? `${m.planAndel}%` : "—"}
                    </div>
                  </div>
                </div>

                {m.planNavn && m.planTotal > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 6, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 9999, width: `${m.planAndel}%`, background: T.lime }} />
                    </div>
                    <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.planNavn} · {m.planDone}/{m.planTotal} økter
                    </p>
                  </div>
                )}
              </Kort>
            ))}
          </div>
        )}
      </div>

      {/* Gruppeprestasjon — quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: T.gap }}>
        <Kort eyebrow={<MikroMeta icon="trophy">Beste HCP-utvikling</MikroMeta>}>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
            Detaljert utvikling per spiller vises i{" "}
            <Link href="/admin/analyse" style={{ color: T.lime, fontWeight: 600, textDecoration: "none" }}>
              gruppe-analyse
            </Link>
            .
          </p>
        </Kort>
        <Kort eyebrow={<MikroMeta icon="calendar">Oppmøte siste 30 d</MikroMeta>}>
          <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.fg }}>—</div>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>Aktiveres når oppmøte-logg er fylt ut</p>
        </Kort>
        <Kort eyebrow={<MikroMeta icon="users">Coach-ressurs</MikroMeta>}>
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, margin: 0 }}>{data.coachNavn ?? "Ingen primær-coach satt"}</p>
          {data.coachEpost && <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 4 }}>{data.coachEpost}</p>}
        </Kort>
      </div>
    </div>
  );
}
