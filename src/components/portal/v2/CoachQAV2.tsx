"use client";

/**
 * PlayerHQ Coach — Spørsmål — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  PillTabs,
  StatusPill,
  Rad,
  AvatarInit,
  TomTilstand,
  CTAPill,
} from "@/components/v2";

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

/* ── Ren hjelper ───────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

type Filter = "alle" | "apne" | "besvart";

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function CoachQAV2({ data }: { data: CoachQAData }) {
  const mobile = useMobile();
  const [filter, setFilter] = useState<Filter>("alle");

  const { sporsmal } = data;
  const antallApne = sporsmal.filter((s) => !s.besvart).length;
  const antallBesvart = sporsmal.length - antallApne;

  const vist = sporsmal.filter((s) =>
    filter === "apne" ? !s.besvart : filter === "besvart" ? s.besvart : true,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Coach · Spørsmål</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="spillere">
            Spørsmål fra
          </Tittel>
        </div>
      </div>

      {/* KPI-rad — ekte tellinger fra køen */}
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
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
              <CTAPill icon="send" full>
                Still et spørsmål
              </CTAPill>
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
