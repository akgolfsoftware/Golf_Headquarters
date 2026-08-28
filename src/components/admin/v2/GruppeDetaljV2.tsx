"use client";

/**
 * AgencyOS Gruppe-detalj — T8 Train-lock.
 * Samme datakontrakt og action-slots som før.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TlBadge, TlKort, TlKnapp, TlRad, TlTilbake, TlTittel, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import { GruppeFaner } from "./GruppeFaner";

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
  erTrener: boolean;
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
  trenerKandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
};

export type GruppeDetaljV2Actions = {
  StartOktButton: React.ComponentType;
  LeggTilSpillerButton: React.ComponentType<{
    groupId: string;
    kandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
    trenerKandidater: { id: string; name: string; hcp: number | null; homeClub: string | null }[];
  }>;
  FjernMedlemButton: React.ComponentType<{ groupId: string; userId: string; navn: string }>;
  SeAlleTimePlanButton: React.ComponentType<{ groupId: string }>;
  DetaljerButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
  AapneButton: React.ComponentType<{ groupId: string; scheduleId: string }>;
  SlettGruppeButton: React.ComponentType<{
    groupId: string;
    navn: string;
    antallMedlemmer: number;
    antallSamlinger: number;
  }>;
};

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function fmtDato(iso: string): string {
  return NB_DATE.format(new Date(iso));
}

function fmtHcp(h: number | null): string {
  if (h == null) return "—";
  return h.toFixed(1).replace(".", ",");
}

export function GruppeDetaljV2({
  data,
  actions: A,
  ekstra,
}: {
  data: GruppeDetaljV2Data;
  actions: GruppeDetaljV2Actions;
  ekstra?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TlTilbake href="/admin/grupper">Grupper</TlTilbake>
      <GruppeFaner groupId={data.id} aktiv="medlemmer" />

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <TlTittel sub={`${data.antallMedlemmer} medlemmer · Snitt-HCP ${data.snittHcp} · Coach ${data.coachNavn ?? "ikke satt"}`}>
            {data.navn}
          </TlTittel>
        </div>
        <TlBadge tone={data.antallMedlemmer > 0 ? "nøytral" : "varsel"}>
          {data.antallMedlemmer === 0 ? "Ingen medlemmer" : `${data.antallMedlemmer} medlemmer`}
        </TlBadge>
      </div>

      <TlKnapp variant="primaer" href={`/admin/grupper/${data.id}/timeplan`}>
        Planlegg gruppetrening
      </TlKnapp>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <TlKnapp variant="sekundaer" href={`/admin/grupper/${data.id}/workbench`}>
          Workbench
        </TlKnapp>
        <TlKnapp variant="tertiaer" href={`/admin/stall/dag`}>
          Stall-dag
        </TlKnapp>
        <A.LeggTilSpillerButton
          groupId={data.id}
          kandidater={data.kandidater}
          trenerKandidater={data.trenerKandidater}
        />
        <A.SlettGruppeButton
          groupId={data.id}
          navn={data.navn}
          antallMedlemmer={data.antallMedlemmer}
          antallSamlinger={data.antallSamlinger}
        />
      </div>

      {ekstra}

      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 12 }}>
        {[
          { l: "Medlemmer", v: String(data.antallMedlemmer), s: `${data.antallHjelpetrenere} hjelpecoach` },
          { l: "Snitt-HCP", v: data.snittHcp, s: undefined },
          { l: "Runder · 90 d", v: String(data.totalRunder), s: undefined },
          { l: "PRO-andel", v: `${data.proAndel} %`, s: undefined },
        ].map((k) => (
          <TlKort key={k.l} pad="14px 16px">
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: TL.mute }}>
              {k.l}
            </div>
            <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: TL.text }}>
              {k.v}
            </div>
            {k.s && <div style={{ marginTop: 4, fontSize: 12, color: TL.mute }}>{k.s}</div>}
          </TlKort>
        ))}
      </div>

      <TlKort eyebrow="Neste samling" action={<A.SeAlleTimePlanButton groupId={data.id} />}>
        {data.nesteSamling ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: TL.text }}>{data.nesteSamling.title}</div>
            <p style={{ fontSize: 13, color: TL.mute, margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
              {fmtDato(data.nesteSamling.startAt)}
              {data.nesteSamling.location && ` · ${data.nesteSamling.location}`}
            </p>
            {data.nesteSamling.description && (
              <p style={{ fontSize: 13, color: TL.mute, marginTop: 8, maxWidth: "60ch" }}>{data.nesteSamling.description}</p>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <A.DetaljerButton groupId={data.id} scheduleId={data.nesteSamling.id} />
              <A.StartOktButton />
            </div>
            {data.kommendeSamlinger.length > 1 &&
              data.kommendeSamlinger.slice(1).map((s, i, arr) => (
                <TlRad
                  key={s.id}
                  last={i === arr.length - 1}
                  title={s.title}
                  sub={`${fmtDato(s.startAt)}${s.location ? ` · ${s.location}` : ""}`}
                  trailing={<A.AapneButton groupId={data.id} scheduleId={s.id} />}
                  chevron={false}
                />
              ))}
          </>
        ) : (
          <TlTomTilstand icon="calendar" title="Ingen samlinger planlagt" sub="Bruk «Planlegg gruppetrening» for å legge inn første økt." />
        )}
      </TlKort>

      <TlKort eyebrow={`Medlemmer · ${data.medlemmer.length}`}>
        {data.trinnValg.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {["", ...data.trinnValg].map((t) => {
              const on = (data.aktivtTrinn ?? "") === t;
              return (
                <Link
                  key={t || "alle"}
                  href={t ? `?trinn=${t}` : "?"}
                  scroll={false}
                  className="v2-press v2-focus"
                  style={{
                    textDecoration: "none",
                    height: 28,
                    padding: "0 12px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: on ? TL.onFill : TL.mute,
                    background: on ? TL.fill : "transparent",
                    boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
                  }}
                >
                  {t || "Alle"}
                </Link>
              );
            })}
          </div>
        )}
        {data.medlemmer.length === 0 ? (
          <TlTomTilstand icon="users" title="Ingen medlemmer ennå" sub="Legg til spillere for å se gruppen her." />
        ) : (
          data.medlemmer.map((m, i) => (
            <TlRad
              key={m.id}
              title={
                <Link href={`/admin/spillere/${m.userId}`} style={{ color: TL.text, textDecoration: "none" }}>
                  {m.navn}
                </Link>
              }
              sub={`${m.homeClub ?? "Klubb ukjent"} · ${m.erTrener ? "Trener" : m.erHjelpetrener ? "Hjelpecoach" : "Spiller"}${m.schoolYear ? ` · ${m.schoolYear}` : ""}`}
              meta={`HCP ${fmtHcp(m.hcp)}`}
              trailing={<A.FjernMedlemButton groupId={data.id} userId={m.userId} navn={m.navn} />}
              chevron={false}
              last={i === data.medlemmer.length - 1}
            />
          ))
        )}
      </TlKort>

      <TlKort eyebrow="Coach">
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{data.coachNavn ?? "Ingen primær-coach satt"}</div>
        {data.coachEpost && <div style={{ marginTop: 4, fontSize: 13, color: TL.mute }}>{data.coachEpost}</div>}
      </TlKort>
    </div>
  );
}
