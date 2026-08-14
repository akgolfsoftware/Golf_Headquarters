"use client";

/**
 * PlayerHQ · Kalender · Opptatt tid — spillerens egne avtaler.
 *
 * Det som ikke ligger i noen annen tabell: «mandag 16.30 tannlege». Skole,
 * gruppetrening og fravær hentes automatisk fra sine egne kilder og vises
 * ikke her — dette er kun det spilleren legger inn selv.
 */

import { useState, useTransition } from "react";
import { Kort, Knapp, Caps, Tag, MikroMeta } from "@/components/v2";
import { Inndata, Velger, Avkryssing, SkjemaFelt } from "@/components/v2";
import {
  leggTilOpptattTid,
  slettOpptattTid,
  type OpptattRad,
} from "@/app/portal/kalender/opptatt-actions";

const KIND_VALG = [
  { value: "AVTALE", label: "Avtale" },
  { value: "SKOLE", label: "Skole" },
  { value: "JOBB", label: "Jobb" },
  { value: "REISE", label: "Reise" },
  { value: "ANNET", label: "Annet" },
];

const GJENTAK_VALG = [
  { value: "NONE", label: "Én gang" },
  { value: "WEEKLY", label: "Hver uke" },
];

function fmtDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function fmtKl(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "2026-08-03T16:30" for datetime-local. */
function tilLokalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type Props = { rader: OpptattRad[] };

export function OpptattTidV2({ rader }: Props) {
  const [venter, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [apen, setApen] = useState(false);

  const naa = new Date();
  const om1t = new Date(naa.getTime() + 60 * 60 * 1000);

  const [tittel, setTittel] = useState("");
  const [start, setStart] = useState(tilLokalInput(naa));
  const [slutt, setSlutt] = useState(tilLokalInput(om1t));
  const [kind, setKind] = useState("AVTALE");
  const [gjentak, setGjentak] = useState("NONE");
  const [privat, setPrivat] = useState(false);

  function lagre() {
    setFeil(null);
    startTransition(async () => {
      const res = await leggTilOpptattTid({
        title: tittel,
        startAt: start,
        endAt: slutt,
        kind: kind as "AVTALE",
        recurring: gjentak as "NONE",
        isPrivate: privat,
      });
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setTittel("");
      setPrivat(false);
      setApen(false);
    });
  }

  function slett(id: string) {
    startTransition(async () => {
      const res = await slettOpptattTid(id);
      if (!res.ok) setFeil(res.feil);
    });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Kort
        eyebrow="Opptatt tid"
        action={
          <Knapp ghost onClick={() => setApen((v) => !v)}>
            {apen ? "Avbryt" : "Legg til"}
          </Knapp>
        }
      >
        <Caps>
          Skole, gruppetrening og fravær hentes automatisk. Her legger du inn
          dine egne avtaler, så planleggeren ikke legger trening oppå dem.
        </Caps>

        {apen && (
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <Inndata
              label="Hva"
              value={tittel}
              placeholder="Tannlege"
              onChange={setTittel}
            />
            <Inndata
              label="Fra"
              type="datetime-local"
              value={start}
              onChange={setStart}
            />
            <Inndata
              label="Til"
              type="datetime-local"
              value={slutt}
              onChange={setSlutt}
            />
            <Velger
              label="Type"
              options={KIND_VALG}
              value={kind}
              onChange={setKind}
            />
            <Velger
              label="Gjentakelse"
              options={GJENTAK_VALG}
              value={gjentak}
              onChange={setGjentak}
            />
            <SkjemaFelt
              label="Personvern"
              hjelp="Coachen ser at tiden er opptatt, men ikke hva den går til."
            >
              <Avkryssing
                label="Skjul detaljene for coachen"
                checked={privat}
                onChange={setPrivat}
              />
            </SkjemaFelt>
            {feil && <Caps color="var(--p-dn)">{feil}</Caps>}
            <Knapp full disabled={venter || tittel.trim().length === 0} onClick={lagre}>
              {venter ? "Lagrer …" : "Lagre"}
            </Knapp>
          </div>
        )}
      </Kort>

      {rader.length === 0 ? (
        <Kort>
          <Caps>Ingen egne avtaler lagt inn.</Caps>
        </Kort>
      ) : (
        rader.map((r) => (
          <Kort
            key={r.id}
            action={
              <Knapp ghost disabled={venter} onClick={() => slett(r.id)}>
                Slett
              </Knapp>
            }
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong>{r.title}</strong>
                {r.isPrivate && <Tag tone="info">Privat</Tag>}
                {r.recurring === "WEEKLY" && <Tag>Hver uke</Tag>}
              </div>
              <MikroMeta icon="clock">
                {fmtDato(r.startAt)} · {fmtKl(r.startAt)}–{fmtKl(r.endAt)}
              </MikroMeta>
            </div>
          </Kort>
        ))
      )}
    </div>
  );
}
