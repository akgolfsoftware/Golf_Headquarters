"use client";

/**
 * Vises bare når en turnering er slått sammen (mergedIntoId satt). Nytt design
 * (19.10.2026), logikken er uendret: flytter IKKE påmeldinger/resultater
 * tilbake, og det står i bekreftelsen.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, Varsel } from "@/components/admin/agencyos-ny/ny";
import { unmergeTurnering } from "@/app/admin/tournaments/actions";

type Props = {
  sourceId: string;
  targetName: string | null;
};

export function UnmergeBanner({ sourceId, targetName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bekreft, setBekreft] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function opphev() {
    setBekreft(false);
    setFeil(null);
    startTransition(async () => {
      const res = await unmergeTurnering(sourceId);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="kort dempet" style={{ display: "grid", gap: 10 }}>
      <b className="undertittel">Slått sammen{targetName ? ` inn i «${targetName}»` : ""}</b>
      <p className="forklar">Turneringen er merket som dublett og skjules i lista. Opphev for å vise den som egen turnering igjen.</p>
      {bekreft ? (
        <>
          <p className="forklar">Påmeldinger og resultater som ble flyttet, flyttes ikke tilbake.</p>
          <div className="knapper">
            <Knapp disabled={pending} onClick={opphev}>Opphev sammenslåingen</Knapp>
            <Knapp variant="spok" onClick={() => setBekreft(false)}>Avbryt</Knapp>
          </div>
        </>
      ) : (
        <div className="knapper"><Knapp variant="sek" disabled={pending} onClick={() => setBekreft(true)}>{pending ? "Opphever …" : "Opphev sammenslåing"}</Knapp></div>
      )}
      {feil && <Varsel tone="advarsel">{feil}</Varsel>}
    </div>
  );
}
