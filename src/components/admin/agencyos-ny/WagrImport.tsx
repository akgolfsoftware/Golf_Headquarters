"use client";

/**
 * Talent · WAGR-import (/innsyn/talent/wagr-import) — Precision Athletics, i AgencyOSSkall. Bare for coach.
 * Samme datakilde (WagrSnapshot) og samme «Synk nå» (synkWagrNaa) som før.
 * Resultatet av synken vises i flaten i stedet for som toast, så det blir stående.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { synkWagrNaa } from "@/app/innsyn/talent/wagr-import/actions";
import { Avatar, Knapp, Pille, Seksjon, Tom, Varsel } from "./ny";

export interface WagrKobletRad {
  id: string;
  spillerId: string;
  navn: string;
  rank: number;
}

export interface WagrImportData {
  koblede: WagrKobletRad[];
  antallSpillere: number;
  sistSynketLabel: string | null;
}

type Melding = { tone: "ok" | "advarsel" | "info"; tekst: string };

export function WagrImport({ data }: { data: WagrImportData }) {
  const [pending, startTransition] = useTransition();
  const [meldinger, setMeldinger] = useState<Melding[]>([]);

  function synk() {
    if (pending) return;
    setMeldinger([]);
    startTransition(async () => {
      const res = await synkWagrNaa();
      if (!res.ok) {
        setMeldinger([{ tone: "advarsel", tekst: `Synk feilet: ${res.feil}` }]);
        return;
      }
      const { resultat } = res;
      const forsokt = resultat.hentet + resultat.blittProff.length + resultat.feilet.length;
      const ut: Melding[] = [
        {
          tone: "ok",
          tekst: `Synk fullført: ${resultat.oppdatert} av ${forsokt} rankinger oppdatert fra wagr.com, ${
            resultat.nyKoblet > 0 ? `${resultat.nyKoblet} nye spillere koblet` : "ingen nye spillere å koble"
          }.`,
        },
      ];
      if (resultat.feilet.length > 0) {
        ut.push({ tone: "advarsel", tekst: `Klarte ikke hente ${resultat.feilet.length} spillere (${resultat.feilet.join(", ")}). Prøv igjen senere.` });
      }
      if (resultat.blittProff.length > 0) {
        ut.push({ tone: "info", tekst: `Blitt proff (ute av WAGR): ${resultat.blittProff.join(", ")}. Siste amatørtall beholdes.` });
      }
      if (resultat.tvetydige.length > 0) {
        ut.push({ tone: "advarsel", tekst: `Flere spillere deler navn (${resultat.tvetydige.join(", ")}). Koble disse manuelt.` });
      }
      setMeldinger(ut);
    });
  }

  const status =
    data.koblede.length === 0 ? "Ingen koblet ennå" : `${data.koblede.length} av ${data.antallSpillere} koblet`;

  return (
    <>
      <section className="kort" aria-label="Status">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <span style={{ minWidth: 0 }}>
            <b className="undertittel" style={{ display: "block" }}>{data.koblede.length} av {data.antallSpillere} spillere har WAGR-profil</b>
            <span className="kilde" style={{ display: "block" }}>
              {data.sistSynketLabel ? `Sist synket ${data.sistSynketLabel}` : "Aldri synket"}
            </span>
          </span>
          <Pille tone={data.koblede.length === 0 ? "noy" : data.koblede.length < data.antallSpillere ? "vent" : "ok"}>{status}</Pille>
        </div>
        <div className="knapper">
          <Knapp onClick={synk} disabled={pending}>{pending ? "Synker …" : "Synk nå"}</Knapp>
        </div>
      </section>

      {meldinger.map((m, i) => (
        <Varsel key={i} tone={m.tone}>{m.tekst}</Varsel>
      ))}

      <Seksjon tittel="Matchede spillere" kilde={String(data.koblede.length)}>
        {data.koblede.length === 0 ? (
          <Tom tittel="Ingen spillere koblet til WAGR ennå" tekst="Trykk «Synk nå» for å hente ranking fra wagr.com og matche stallen." />
        ) : (
          <div className="liste">
            {data.koblede.map((s) => (
              <Link key={s.id} href={`/admin/spillere/${s.spillerId}`}>
                <Avatar navn={s.navn} liten />
                <span><b>{s.navn}</b><span className="kilde">WAGR #{s.rank.toLocaleString("nb-NO")}</span></span>
                <Pille tone="ok">Sikker match</Pille>
              </Link>
            ))}
          </div>
        )}
      </Seksjon>
    </>
  );
}
