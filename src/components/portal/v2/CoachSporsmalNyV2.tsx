"use client";

/**
 * PlayerHQ Coach · Nytt spørsmål — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  StatusPill,
  Rad,
  Inndata,
  TekstOmraade,
  FilterChips,
  Veiviser,
  TomTilstand,
} from "@/components/v2";

export type MinSporsmal = {
  id: string;
  tittel: string;
  besvart: boolean;
  /** Forhåndsformatert «dd.mm hh:mm» (nb-NO, Europe/Oslo) fra createdAt. */
  tid: string;
};

export type CoachSporsmalNyData = {
  /** true når server-actionen nettopp redirectet hit med ?sendt=1. */
  sendt: boolean;
  mine: MinSporsmal[];
};

export type StillSporsmalV2Input = { title: string; body: string };

const HURTIGTEMA = ["Om en økt", "Feedback på sving", "Turneringsplan", "Annet"] as const;

export function CoachSporsmalNyV2({
  data,
  sendAction,
}: {
  data: CoachSporsmalNyData;
  sendAction: (input: StillSporsmalV2Input) => Promise<void>;
}) {
  const { sendt, mine } = data;
  const [tema, setTema] = useState<string>(HURTIGTEMA[0]);
  const [aktiv, setAktiv] = useState(0);
  const [tittel, setTittel] = useState<string>(HURTIGTEMA[0]);
  const [sporsmal, setSporsmal] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function velgTema(t: string) {
    setTema(t);
    if (t !== "Annet") setTittel(t);
  }

  function send() {
    if (tittel.trim().length < 3 || sporsmal.trim().length < 10) {
      setFeil("Skriv en tittel (minst 3 tegn) og et spørsmål (minst 10 tegn).");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        await sendAction({ title: tittel.trim(), body: sporsmal.trim() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        // redirect() kaster en kontrollflyt-feil — la den boble videre.
        if (msg.includes("NEXT_REDIRECT")) throw err;
        setFeil("Kunne ikke sende spørsmålet. Prøv igjen.");
      }
    });
  }

  function onNeste() {
    if (aktiv === 0) {
      setAktiv(1);
      return;
    }
    send();
  }

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Coach · Nytt spørsmål</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="coach">Still spørsmål til</Tittel>
        </div>
      </div>

      {sendt && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <StatusPill tone="up">Sendt</StatusPill>
            <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>
              Spørsmålet er sendt til coachen din. Du får svar i samtalen.
            </span>
          </div>
        </Kort>
      )}

      {aktiv === 0 && (
        <Kort eyebrow="Tema">
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginBottom: 12 }}>
            Hva gjelder spørsmålet?
          </div>
          <FilterChips items={[...HURTIGTEMA]} active={[tema]} onToggle={velgTema} />
        </Kort>
      )}

      {aktiv === 1 && (
        <Kort eyebrow="Skriv spørsmålet">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Inndata label="Tittel" value={tittel} onChange={setTittel} placeholder="Hva gjelder det?" />
            <TekstOmraade
              label="Spørsmål"
              value={sporsmal}
              onChange={setSporsmal}
              rows={7}
              placeholder={`Spør coachen din om ${tema.toLowerCase()} …`}
            />
          </div>
          {feil && <div style={{ fontFamily: T.ui, fontSize: 12, color: T.down, marginTop: 10 }}>{feil}</div>}
        </Kort>
      )}

      <Veiviser
        steg={["Hva gjelder spørsmålet?", "Skriv spørsmålet"]}
        aktiv={aktiv}
        onTilbake={aktiv > 0 ? () => setAktiv(0) : undefined}
        onNeste={pending ? undefined : onNeste}
        sisteTekst={pending ? "Sender …" : "Send spørsmål"}
      />

      <Kort eyebrow="Mine spørsmål" action={<span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>{mine.length} totalt</span>}>
        {mine.length === 0 ? (
          <TomTilstand icon="message-square" title="Ingen spørsmål ennå" sub="Spørsmålene du sender, dukker opp her med status." />
        ) : (
          <div>
            {mine.map((q, i) => (
              <Link key={q.id} href={`/portal/coach/sporsmal/${q.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <Rad
                  title={q.tittel}
                  sub={q.tid}
                  meta={<StatusPill tone={q.besvart ? "up" : "info"}>{q.besvart ? "Besvart" : "Venter"}</StatusPill>}
                  last={i === mine.length - 1}
                />
              </Link>
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}
