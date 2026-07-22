"use client";

/**
 * PlayerHQ Varsler — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  VarselRad,
  TomTilstand,
} from "@/components/v2";

/* ── Datakontrakt (fra server-loaderen) ────────────────────────────── */

export type VarslerV2Item = {
  id: string;
  /** v2 ikon-navn (kebab-case), avledet av Notification.type på server. */
  icon: string;
  tittel: string;
  tid: string;
  ulest: boolean;
  link: string | null;
};

export type VarslerV2Data = {
  idag: VarslerV2Item[];
  tidligere: VarslerV2Item[];
  uleste: number;
};

const TALLORD = [
  "Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks",
  "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv",
];

/* ── Seksjonskort (eyebrow + varsel-rader) ─────────────────────────── */

function Seksjon({
  label,
  rader,
  onNaviger,
}: {
  label: string;
  rader: VarslerV2Item[];
  onNaviger: (link: string) => void;
}) {
  if (rader.length === 0) return null;
  return (
    <Kort eyebrow={label} pad="14px 16px">
      {rader.map((n, i) => (
        <VarselRad
          key={n.id}
          icon={n.icon}
          tittel={n.tittel}
          sub={null}
          tid={n.tid}
          ulest={n.ulest}
          last={i === rader.length - 1}
          onClick={n.link ? () => onNaviger(n.link as string) : undefined}
        />
      ))}
    </Kort>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function VarslerV2({ data }: { data: VarslerV2Data }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { idag, tidligere, uleste } = data;

  const tomt = idag.length === 0 && tidligere.length === 0;
  const ulesteOrd = uleste <= 12 ? TALLORD[uleste] : String(uleste);

  function markerAlle() {
    startTransition(async () => {
      await markNotificationsRead();
      router.refresh();
    });
  }

  function naviger(link: string) {
    router.push(link);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode: tittel + ulest-pille + marker alle lest */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Tittel em="nå">Varsler</Tittel>
          {uleste > 0 && <StatusPill tone="lime">{ulesteOrd} nye</StatusPill>}
        </div>
        {uleste > 0 && (
          <Knapp icon="check" ghost disabled={pending} onClick={markerAlle}>
            {pending ? "Markerer…" : "Marker alle lest"}
          </Knapp>
        )}
      </div>

      {/* Innhold */}
      {tomt ? (
        <Kort>
          <TomTilstand
            icon="bell"
            title="Ingen varsler — du er à jour"
            sub="Nye meldinger, bookinger og forslag dukker opp her."
          />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <Link
              href="/portal"
              style={{
                textDecoration: "none",
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 600,
                color: T.mut,
              }}
            >
              Tilbake til hjem →
            </Link>
          </div>
        </Kort>
      ) : (
        <>
          <Seksjon label="I dag" rader={idag} onNaviger={naviger} />
          <Seksjon label="Tidligere" rader={tidligere} onNaviger={naviger} />
          <Caps size={9} style={{ textAlign: "center", color: T.mut, marginTop: 2 }}>
            Varsler eldre enn 7 dager slettes automatisk
          </Caps>
        </>
      )}
    </div>
  );
}
