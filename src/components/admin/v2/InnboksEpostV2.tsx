"use client";

/**
 * AgencyOS e-post-innboks — v2. post@akgolf.no inn i cockpit-flyten: agenten
 * genererer et utkast automatisk ved inntak (webhook), Anders leser, redigerer
 * fritt og trykker «Godkjenn og send» — sending skjer ALDRI uten dette
 * knappetrykket. «Arkiver» lukker saken uten svar.
 *
 * Bygget utelukkende av v2-komponentbiblioteket (src/components/v2) — ingen
 * ad-hoc UI, ingen rå hex (kun T.*).
 */

import { useState, useTransition } from "react";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  StatusPill,
  TekstOmraade,
  Knapp,
  TomTilstand,
  type StatusTone,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { sendGodkjentSvar, arkiverEpost } from "@/lib/innboks/actions";
import type { InnboksEpostVm } from "@/lib/innboks/data";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

const STATUS_LABEL: Record<string, { tone: StatusTone; label: string } | undefined> = {
  NY: { tone: "warn", label: "Ny" },
  UTKAST_KLART: { tone: "info", label: "Utkast klart" },
  SENDT: { tone: "up", label: "Sendt" },
};

export function InnboksEpostV2({ epost }: { epost: InnboksEpostVm[] }) {
  const [valgtId, setValgtId] = useState<string | null>(epost[0]?.id ?? null);
  const valgt = epost.find((e) => e.id === valgtId) ?? null;
  const antallNye = epost.filter((e) => e.status === "NY").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>AgencyOS · Innboks</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="post@akgolf.no.">E-post fra</Tittel>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]" style={{ gap: T.gap }}>
        <Kort
          eyebrow="Alle e-poster"
          pad="8px"
          action={epost.length > 0 ? <Caps size={9} color={antallNye > 0 ? T.warn : T.mut}>{pl(epost.length, "e-post", "e-poster")}</Caps> : undefined}
        >
          {epost.length === 0 ? (
            <TomTilstand icon="mail" title="Ingen e-poster" sub="Innboksen er tom." />
          ) : (
            epost.map((e, i) => {
              const status = STATUS_LABEL[e.status];
              return (
                <Rad
                  key={e.id}
                  onClick={() => setValgtId(e.id)}
                  leading={<AvatarInit navn={e.fraNavn ?? e.fraEpost} size={30} />}
                  title={e.fraNavn ?? e.fraEpost}
                  sub={e.emne}
                  meta={
                    status ? (
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                    ) : (
                      <Caps size={9} color={T.mut}>Arkivert</Caps>
                    )
                  }
                  trailing={null}
                  last={i === epost.length - 1}
                />
              );
            })
          )}
        </Kort>

        {valgt ? (
          <EpostDetalj key={valgt.id} epost={valgt} />
        ) : (
          <Kort>
            <TomTilstand icon="mail" title="Velg en e-post" sub="Klikk på en e-post i listen til venstre." />
          </Kort>
        )}
      </div>
    </div>
  );
}

function EpostDetalj({ epost }: { epost: InnboksEpostVm }) {
  const [tekst, setTekst] = useState(epost.utkastSvar ?? "");
  const [isPending, startTransition] = useTransition();
  const [melding, setMelding] = useState<string | null>(null);
  const status = STATUS_LABEL[epost.status];
  const erArkivert = epost.status === "ARKIVERT";
  const erSendt = epost.status === "SENDT";

  function handleSend() {
    setMelding(null);
    startTransition(async () => {
      const res = await sendGodkjentSvar(epost.id, tekst);
      setMelding(res.melding);
    });
  }

  function handleArkiver() {
    startTransition(async () => {
      await arkiverEpost(epost.id);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort
        eyebrow="Original e-post"
        action={status ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : <Caps size={9} color={T.mut}>Arkivert</Caps>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
          <div style={{ fontFamily: T.ui, fontSize: 15, fontWeight: 700, color: T.fg }}>{epost.emne}</div>
          <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
            {epost.fraNavn ? `${epost.fraNavn} · ${epost.fraEpost}` : epost.fraEpost} — {epost.mottattAt}
          </div>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg2, whiteSpace: "pre-wrap", margin: 0 }}>
          {epost.brodtekst || "(tom e-post)"}
        </p>
      </Kort>

      <Kort eyebrow="Svar" action={epost.harUtkast ? <Caps size={9}>Utkast fra agent</Caps> : undefined}>
        <TekstOmraade
          label="Ditt svar — rediger fritt før du sender"
          value={tekst}
          onChange={setTekst}
          rows={10}
          placeholder="Skriv svaret her…"
        />
        {melding && (
          <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 10 }}>{melding}</div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <Knapp icon="send" onClick={handleSend} disabled={isPending || erSendt || erArkivert || !tekst.trim()}>
            Godkjenn og send
          </Knapp>
          <Knapp icon="archive" ghost onClick={handleArkiver} disabled={isPending || erArkivert}>
            Arkiver
          </Knapp>
        </div>
      </Kort>
    </div>
  );
}
