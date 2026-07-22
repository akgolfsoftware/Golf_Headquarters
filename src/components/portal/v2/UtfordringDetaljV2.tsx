"use client";

/**
 * PlayerHQ Utfordring-detalj — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  MikroMeta,
  TomTilstand,
  Bit,
  Rad,
  AvatarInit,
  KpiFlis,
  SkjemaFelt,
  Inndata,
  HjelpTips,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type DeltakerRad = {
  id: string;
  navn: string;
  erMeg: boolean;
  rank: number | null;
  score: number | null;
  notes: string | null;
};

export type UtfordringDetaljData = {
  id: string;
  name: string;
  description: string | null;
  eierNavn: string;
  drillNavn: string | null;
  /** "ACTIVE" | "ENDED" (rå status fra DrillChallenge). */
  status: string;
  startAt: Date | null;
  endAt: Date | null;
  erEier: boolean;
  erDeltaker: boolean;
  minScore: number | null;
  minNotes: string | null;
  deltakere: DeltakerRad[];
};

export type UtfordringDetaljActions = {
  bliMed: () => Promise<void>;
  avslutt: () => Promise<void>;
  registrerScore: (score: number, notes: string | null) => Promise<void>;
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

function langDato(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]} ${d.getFullYear()}`;
}

function scoreTekst(v: number): string {
  return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)).replace(".", ",");
}

/* ── Score-skjema (deltaker, aktiv utfordring) ─────────────────────── */

function ScoreSkjema({
  minScore,
  minNotes,
  onLagre,
}: {
  minScore: number | null;
  minNotes: string | null;
  onLagre: (score: number, notes: string | null) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [score, setScore] = useState(minScore != null ? scoreTekst(minScore) : "");
  const [notes, setNotes] = useState(minNotes ?? "");
  const [feil, setFeil] = useState<string | null>(null);

  function lagre() {
    const tall = Number(score.replace(",", "."));
    if (!Number.isFinite(tall)) {
      setFeil("Score må være et tall.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        await onLagre(tall, notes.trim() || null);
        router.refresh();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <Kort
      eyebrow={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Min score <HjelpTips k="utfordringScore" />
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14, marginTop: 4 }}>
        <SkjemaFelt label="Score" hjelp="Høyere er bedre. Bruk komma som desimaltegn." feil={feil}>
          <Inndata label={null} value={score} placeholder="F.eks. 42" mono onChange={setScore} />
        </SkjemaFelt>
        <SkjemaFelt label="Notat (valgfritt)" hjelp={null}>
          <Inndata label={null} value={notes} placeholder="Kort kommentar" onChange={setNotes} />
        </SkjemaFelt>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <Knapp icon="check" disabled={pending} onClick={lagre}>
          {pending ? "Lagrer…" : minScore != null ? "Oppdater score" : "Registrer score"}
        </Knapp>
      </div>
    </Kort>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function UtfordringDetaljV2({
  data,
  actions,
}: {
  data: UtfordringDetaljData;
  actions: UtfordringDetaljActions;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const erAktiv = data.status === "ACTIVE";

  const metaParts: string[] = [`Eier: ${data.eierNavn}`];
  if (data.drillNavn) metaParts.push(`Øvelse: ${data.drillNavn}`);
  metaParts.push(`${data.deltakere.length} deltakere`);

  function kjor(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Tilbake */}
      <Link href="/portal/utfordringer" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <MikroMeta icon="arrow-left">PlayerHQ · Utfordringer</MikroMeta>
      </Link>

      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Caps>{erAktiv ? "Aktiv utfordring" : "Avsluttet utfordring"}</Caps>
            <StatusPill tone={erAktiv ? "lime" : "up"}>{erAktiv ? "Aktiv" : "Fullført"}</StatusPill>
            {data.erEier && <Bit icon="star">Eier</Bit>}
          </div>
          <div style={{ marginTop: 10 }}>
            <Tittel em={data.name} />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {metaParts.join(" · ")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {erAktiv && !data.erDeltaker && (
            <Knapp icon="plus" disabled={pending} onClick={() => kjor(actions.bliMed)}>
              Bli med
            </Knapp>
          )}
          {erAktiv && data.erEier && (
            <Knapp icon="flag" ghost disabled={pending} onClick={() => kjor(actions.avslutt)}>
              Avslutt utfordring
            </Knapp>
          )}
        </div>
      </div>

      {/* Beskrivelse */}
      {data.description && (
        <Kort pad="14px 18px">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            {data.description}
          </p>
        </Kort>
      )}

      {/* Nøkkeltall */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Deltakere" value={String(data.deltakere.length)} />
        <KpiFlis label="Startet" value={data.startAt ? langDato(data.startAt) : "—"} />
        <KpiFlis label={erAktiv ? "Slutter" : "Avsluttet"} value={data.endAt ? langDato(data.endAt) : "—"} />
      </div>

      {/* Score-registrering */}
      {erAktiv && data.erDeltaker && (
        <ScoreSkjema minScore={data.minScore} minNotes={data.minNotes} onLagre={actions.registrerScore} />
      )}

      {/* Resultatliste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Caps>Resultatliste ({data.deltakere.length})</Caps>
          <HjelpTips k="utfordringScore" />
        </span>

        {data.deltakere.length === 0 ? (
          <Kort>
            <TomTilstand
              icon="trophy"
              title="Ingen deltakere ennå"
              sub="Del utfordringen og inviter andre til å bli med."
            />
          </Kort>
        ) : (
          <Kort pad="6px 18px">
            {data.deltakere.map((p, i) => (
              <Rad
                key={p.id}
                last={i === data.deltakere.length - 1}
                leading={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: p.rank != null && p.rank <= 3 ? T.lime : T.mut,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 22,
                        textAlign: "right",
                      }}
                    >
                      {p.rank != null ? `#${p.rank}` : "–"}
                    </span>
                    <AvatarInit navn={p.navn} />
                  </span>
                }
                title={p.erMeg ? `${p.navn} (deg)` : p.navn}
                sub={p.notes ?? undefined}
                trailing={
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 16,
                      fontWeight: 700,
                      color: p.score != null ? T.fg : T.mut,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {p.score != null ? scoreTekst(p.score) : "—"}
                  </span>
                }
              />
            ))}
          </Kort>
        )}
      </div>
    </div>
  );
}
