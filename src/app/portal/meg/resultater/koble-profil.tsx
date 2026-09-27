"use client";

/**
 * «Er dette deg?»: finn spilleren i resultathistorikken og koble den til profilen.
 * Alle beslutninger tas på serveren (actions.ts). Klienten viser bare treffene
 * serveren allerede har kontrollert mot profilen.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { Kort, CTAPill, TomTilstand } from "@/components/v2/core";
import { Inndata } from "@/components/v2/skjema";
import { ValideringsChip } from "@/components/v2/struktur";
import type { Kandidat } from "@/lib/profil-kobling/typer";
import { avvisVentende, bekreftKandidat, bekreftVentende, sokKandidater } from "./actions";

const sans = { fontFamily: TL.font.sans } as const;
const mono = { fontFamily: TL.font.mono, fontVariantNumeric: "tabular-nums" } as const;

function KandidatKort({ k, children }: { k: Kandidat; children: React.ReactNode }) {
  return (
    <Kort>
      <div style={{ ...sans, fontSize: 16, fontWeight: 600, color: TL.text }}>{k.name}</div>
      <div style={{ ...sans, fontSize: 12.5, color: TL.mute, marginTop: 2 }}>
        {[k.birth_year ? `Født ${k.birth_year}` : null, k.club].filter(Boolean).join(" · ")}
        {k.tournaments > 0 && ` · ${k.tournaments} turneringer`}
      </div>
      {k.evidence.length > 0 && (
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 6 }}>
          {k.evidence.map((e, i) => (
            <li key={i} style={{ ...sans, fontSize: 12.5, color: TL.text }}>
              <span style={{ ...mono, fontSize: 11, color: TL.mute }}>{e.date ?? "—"}</span>
              {"  "}
              {e.tournament}
              {e.class ? <span style={{ color: TL.mute }}> · {e.class}</span> : null}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>{children}</div>
    </Kort>
  );
}

export function KobleProfil({ ventende }: { ventende: { linkId: number; kandidat: Kandidat } | null }) {
  const router = useRouter();
  const [golfId, setGolfId] = useState("");
  const [kandidater, setKandidater] = useState<Kandidat[] | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, startTransition] = useTransition();

  function sok() {
    setFeil(null);
    startTransition(async () => {
      const svar = await sokKandidater({ golfId: golfId || undefined });
      if (!svar.ok) return setFeil(svar.feil);
      setKandidater(svar.kandidater);
    });
  }

  function bekreft(personId: number) {
    setFeil(null);
    startTransition(async () => {
      const svar = await bekreftKandidat({ personId, golfId: golfId || undefined });
      if (!svar.ok) return setFeil(svar.feil);
      router.refresh();
    });
  }

  function ventendeValg(handling: typeof bekreftVentende) {
    if (!ventende) return;
    setFeil(null);
    startTransition(async () => {
      const svar = await handling({ linkId: ventende.linkId });
      if (!svar.ok) return setFeil(svar.feil);
      router.refresh();
    });
  }

  if (ventende) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ ...sans, fontSize: 14, color: TL.text, margin: 0 }}>Er dette deg?</p>
        <KandidatKort k={ventende.kandidat}>
          <CTAPill enTing onClick={() => ventendeValg(bekreftVentende)}>Ja, dette er meg</CTAPill>
          <CTAPill ghost onClick={() => ventendeValg(avvisVentende)}>Nei, ikke meg</CTAPill>
        </KandidatKort>
        {feil && <div role="alert"><ValideringsChip tone="advarsel" tekst={feil} /></div>}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Kort eyebrow="Koble resultatene dine">
        <p style={{ ...sans, fontSize: 14, lineHeight: 1.55, color: TL.text, margin: "0 0 14px", maxWidth: "58ch" }}>
          Vi henter turneringsresultatene dine fra GolfBox og viser dem her. Vi bruker navnet og fødselsåret i
          profilen din. Har du golf-ID, gir den et sikrere treff.
        </p>
        <div style={{ maxWidth: 320 }}>
          <Inndata
            label="Golf-ID (valgfri)"
            placeholder="303-579"
            defaultValue=""
            mono
            value={golfId}
            onChange={setGolfId}
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <CTAPill enTing onClick={sok}>{venter ? "Søker …" : "Finn resultatene mine"}</CTAPill>
        </div>
        {feil && <div role="alert" style={{ marginTop: 12 }}><ValideringsChip tone="advarsel" tekst={feil} /></div>}
      </Kort>

      {kandidater && kandidater.length === 0 && (
        <Kort>
          <TomTilstand
            icon="flag"
            title="Fant ingen treff"
            sub="Sjekk at navnet og fødselsdatoen i profilen stemmer, eller oppgi golf-ID. Kommer du ikke videre, ta det opp med treneren din."
          />
        </Kort>
      )}

      {kandidater && kandidater.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ ...sans, fontSize: 14, color: TL.text, margin: 0 }}>
            {kandidater.length === 1 ? "Er dette deg?" : "Hvilken av disse er deg?"}
          </p>
          {kandidater.map((k) => (
            <KandidatKort key={k.person_id} k={k}>
              <CTAPill enTing onClick={() => bekreft(k.person_id)}>Ja, dette er meg</CTAPill>
            </KandidatKort>
          ))}
        </div>
      )}
    </div>
  );
}
