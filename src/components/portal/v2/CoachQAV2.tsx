"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Coach — Spørsmål — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState } from "react";
import Link from "next/link";
import { Kort, KpiFlis, PillTabs, StatusPill, Rad, AvatarInit, TomTilstand } from "@/components/v2";
/* ── Datakontrakt (serialiserbar — formatert på server) ────────────── */

export type CoachSporsmal = {
  id: string;
  /** Navnet på spilleren som spurte (oppslått fra User). */
  navn: string;
  tittel: string;
  /** status === "ANSWERED". */
  besvart: boolean;
  /** Forhåndsformatert «dd.mm hh:mm» (nb-NO) fra createdAt. */
  tid: string;
};

export type CoachQAData = {
  sporsmal: CoachSporsmal[];
};

type Filter = "alle" | "apne" | "besvart";

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachQAV2({ data }: { data: CoachQAData }) {
  const [filter, setFilter] = useState<Filter>("alle");

  const { sporsmal } = data;
  const antallApne = sporsmal.filter((s) => !s.besvart).length;
  const antallBesvart = sporsmal.length - antallApne;

  const vist = sporsmal.filter((s) =>
    filter === "apne" ? !s.besvart : filter === "besvart" ? s.besvart : true,
  );

  return (
    <div data-paper-wave-g="coachqa" data-paper-portal-coach-qa data-paper-slug="playerhq-coach-hub" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Spørsmål</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Coach</span>
        </div>
      </div>

      {/* KPI-rad — ekte tellinger fra køen */}
      <div className="grid grid-cols-3" style={{ gap: 16 }}>
        <KpiFlis label="Åpne" value={String(antallApne)} varsle={antallApne > 0} />
        <KpiFlis label="Besvart" value={String(antallBesvart)} />
        <KpiFlis label="Totalt" value={String(sporsmal.length)} />
      </div>

      {/* Liste */}
      <Kort
        eyebrow="Innkomne spørsmål"
        action={
          <PillTabs
            tabs={[
              { id: "alle", l: "Alle" },
              { id: "apne", l: "Åpne" },
              { id: "besvart", l: "Besvart" },
            ]}
            value={filter}
            onChange={(id) => setFilter(id as Filter)}
          />
        }
      >
        {sporsmal.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TomTilstand
              icon="message-circle"
              title="Ingen spørsmål ennå"
              sub="Når noen stiller et spørsmål, dukker det opp her."
            />
            <Link href="/portal/coach/sporsmal/ny" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Still et spørsmål</span>
            </Link>
          </div>
        ) : vist.length === 0 ? (
          <TomTilstand
            icon="filter"
            title="Ingen i denne visningen"
            sub="Bytt filter for å se de andre spørsmålene."
          />
        ) : (
          <div>
            {vist.map((s, i) => (
              <Link
                key={s.id}
                href={`/portal/coach/sporsmal/${s.id}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <Rad
                  leading={<AvatarInit navn={s.navn} size={38} />}
                  title={s.tittel}
                  sub={`${s.navn} · ${s.tid}`}
                  meta={
                    <StatusPill tone={s.besvart ? "up" : "info"}>
                      {s.besvart ? "Besvart" : "Åpent"}
                    </StatusPill>
                  }
                  last={i === vist.length - 1}
                />
              </Link>
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}
