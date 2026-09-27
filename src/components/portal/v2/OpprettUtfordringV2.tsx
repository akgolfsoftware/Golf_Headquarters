"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { opprettUtfordring } from "@/app/portal/(legacy)/utfordringer/actions";
import { Caps, Tittel, Kort, Knapp, SkjemaFelt, Inndata, TekstOmraade, Velger, SegmentertFaner, MikroMeta } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

export type UtfordringDeltakerValg = {
  id: string;
  navn: string;
  kilde: "Venn" | "Gruppe";
  detaljer: string;
};

export type UtfordringOvelseValg = {
  id: string;
  navn: string;
  higherIsBetter: boolean | null;
};

type Props = {
  deltakere: UtfordringDeltakerValg[];
  ovelser: UtfordringOvelseValg[];
};

function retningTekst(higherIsBetter: boolean): string {
  return higherIsBetter ? "Høyest score vinner" : "Lavest score vinner";
}

export function OpprettUtfordringV2({ deltakere, ovelser }: Props) {
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [drillId, setDrillId] = useState("");
  const [higherIsBetter, setHigherIsBetter] = useState(true);
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);

  const valgtOvelse = useMemo(
    () => ovelser.find((ovelse) => ovelse.id === drillId) ?? null,
    [drillId, ovelser],
  );
  const effektivRetning = valgtOvelse?.higherIsBetter ?? higherIsBetter;

  function toggleDeltaker(id: string) {
    setValgte((forrige) => {
      const neste = new Set(forrige);
      if (neste.has(id)) neste.delete(id);
      else neste.add(id);
      return neste;
    });
  }

  function submit() {
    const trimmetNavn = navn.trim();
    if (!trimmetNavn) {
      setFeil("Gi utfordringen et navn.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        await opprettUtfordring({
          name: trimmetNavn,
          description: beskrivelse.trim() || null,
          drillId: drillId || null,
          higherIsBetter,
          deltakerIds: [...valgte],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Kunne ikke opprette utfordringen.";
        if (message.includes("NEXT_REDIRECT")) throw err;
        setFeil(message);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <Link href="/portal/utfordringer" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <MikroMeta icon="arrow-left">PlayerHQ · Utfordringer</MikroMeta>
      </Link>

      <div>
        <Caps>Ny utfordring</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="utfordring">Opprett</Tittel>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, margin: "10px 0 0", lineHeight: 1.55 }}>
          Velg deltakere fra venner og grupper. Du blir alltid lagt til selv.
        </p>
      </div>

      <Kort>
        <div style={{ display: "grid", gap: 14 }}>
          <SkjemaFelt label="Navn" hjelp="Kort navn som vises i listen." feil={feil}>
            <Inndata label={null} value={navn} placeholder="F.eks. Færrest putter fredag" onChange={setNavn} />
          </SkjemaFelt>

          <SkjemaFelt label="Beskrivelse" hjelp="Valgfritt. Forklar hva som skal registreres.">
            <TekstOmraade label={null} value={beskrivelse} placeholder="Kort regel eller notat" rows={3} onChange={setBeskrivelse} />
          </SkjemaFelt>

          <SkjemaFelt label="Øvelse" hjelp="Valgfritt. Når øvelsen har fast score-retning, styrer den rangeringen.">
            <Velger
              label={null}
              value={drillId}
              defaultValue=""
              onChange={setDrillId}
              options={[
                { value: "", label: "Fri utfordring" },
                ...ovelser.map((ovelse) => ({ value: ovelse.id, label: ovelse.navn })),
              ]}
            />
          </SkjemaFelt>

          <div>
            <SegmentertFaner
              label="Score-retning"
              value={String(effektivRetning)}
              onChange={(id) => setHigherIsBetter(id === "true")}
              options={[
                { id: "true", label: "Høyest vinner" },
                { id: "false", label: "Lavest vinner" },
              ]}
            />
            <p style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, margin: "8px 0 0", lineHeight: 1.45 }}>
              {valgtOvelse?.higherIsBetter != null
                ? `${retningTekst(effektivRetning)}. Retningen er låst av valgt øvelse.`
                : `${retningTekst(effektivRetning)}.`}
            </p>
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Deltakere">
        {deltakere.length === 0 ? (
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0, lineHeight: 1.55 }}>
            Ingen venner eller gruppemedlemmer er tilgjengelige ennå.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {deltakere.map((deltaker) => {
              const valgt = valgte.has(deltaker.id);
              return (
                <button
                  key={deltaker.id}
                  type="button"
                  className="v2-focus v2-press"
                  onClick={() => toggleDeltaker(deltaker.id)}
                  aria-pressed={valgt}
                  style={{
                    appearance: "none",
                    display: "grid",
                    gridTemplateColumns: "20px minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    minHeight: 48,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${valgt ? TL.fill : TL.hair}`,
                    background: valgt ? TL.dim : "transparent",
                    color: "inherit",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      border: `1.5px solid ${valgt ? TL.fill : TL.hair}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {valgt && <span style={{ width: 10, height: 10, borderRadius: 999, background: TL.fill }} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
                      {deltaker.navn}
                    </span>
                    <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, marginTop: 3 }}>
                      {deltaker.detaljer}
                    </span>
                  </span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 600, color: TL.mute, textTransform: "uppercase" }}>
                    {deltaker.kilde}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Kort>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Knapp icon="plus" disabled={pending} onClick={submit} style={{ background: TL.warm, color: TL.onFill }}>
          {pending ? "Oppretter..." : "Opprett utfordring"}
        </Knapp>
      </div>
    </div>
  );
}
