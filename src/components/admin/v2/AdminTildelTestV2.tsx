"use client";

/**
 * AgencyOS — Tildel test (v2, retning C «Presis»). Rekomponering av
 * /admin/spillere/[id]/tildel-test (tidligere `TildelTestModalScreen`,
 * `test-modul-v2/`) med BEVART funksjon: søk + pyramideområde-filter,
 * velg test, valgfri frist + notat, samme server action `tildelTest`
 * (uendret). Rendres som vanlig v2-innholdsside i V2Shell — ikke som
 * modal-over-falsk-bakgrunn (det mønsteret finnes ikke andre steder i v2).
 *
 * Droppet fabrikert spillerinfo fra legacy-skjermen («A1 · HCP 4.8 ·
 * 12/36 tester gjennomført» var hardkodet demo-tekst) — viser kun ekte
 * HCP fra spillerens profil, ærlig tomrom («—») når den mangler.
 *
 * Bygget av v2-komponenter (src/components/v2). Ingen ad-hoc UI, ingen rå
 * hex (kun T.*).
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  PillTabs,
  SkjemaFelt,
  Inndata,
  TekstOmraade,
  ValideringsChip,
  CTAPill,
  Knapp,
  Icon,
  AkseChip,
  TomTilstand,
} from "@/components/v2";
import type { AkseKey } from "@/lib/v2/tokens";
import { tildelTest } from "@/app/admin/(legacy)/tester/tildel/[spillerId]/actions";

export type TildelTestItem = {
  id: string;
  navn: string;
  beskrivelse: string;
  omrade: AkseKey;
};

export interface AdminTildelTestData {
  spillerId: string;
  spillerNavn: string;
  hcpTekst: string | null;
  tester: TildelTestItem[];
  omradeAntall: Record<string, number>;
}

const OMRADE_TABS = ["Alle", "FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export function AdminTildelTestV2({ data }: { data: AdminTildelTestData }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [omrade, setOmrade] = useState<(typeof OMRADE_TABS)[number]>("Alle");
  const [valgtId, setValgtId] = useState(data.tester[0]?.id ?? "");
  const [frist, setFrist] = useState("");
  const [notat, setNotat] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtrert = useMemo(
    () =>
      data.tester.filter((t) => {
        if (omrade !== "Alle" && t.omrade !== omrade) return false;
        if (sok && !t.navn.toLowerCase().includes(sok.toLowerCase())) return false;
        return true;
      }),
    [data.tester, omrade, sok],
  );

  function send() {
    if (pending || !valgtId) return;
    setFeil(null);
    startTransition(async () => {
      const res = await tildelTest({
        spillerId: data.spillerId,
        testId: valgtId,
        note: notat || undefined,
        dueDate: frist || undefined,
      });
      if (res.ok) router.push(`/admin/spillere/${data.spillerId}/tester`);
      else setFeil(res.error ?? "Kunne ikke tildele testen.");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>{`AgencyOS · Stallen · ${data.spillerNavn}`}</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="test.">Tildel</Tittel>
        </div>
      </div>

      <Kort pad="12px 16px">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AvatarInit navn={data.spillerNavn} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{data.spillerNavn}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
              {data.hcpTekst ? `HCP ${data.hcpTekst}` : "HCP —"}
            </div>
          </div>
        </div>
      </Kort>

      <Kort eyebrow="Velg test">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "7px 14px" }}>
            <Icon name="search" size={13} style={{ color: T.mut }} />
            <input
              type="search"
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Søk test, disiplin, mål …"
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg }}
            />
          </label>

          <PillTabs
            tabs={OMRADE_TABS.map((o) => ({
              id: o,
              l: `${o} · ${o === "Alle" ? data.tester.length : (data.omradeAntall[o] ?? 0)}`,
            }))}
            value={omrade}
            onChange={(id) => setOmrade(id as (typeof OMRADE_TABS)[number])}
          />

          {filtrert.length === 0 ? (
            <TomTilstand icon="clipboard-list" title="Ingen tester matcher" sub="Prøv et annet søk eller områdefilter." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filtrert.map((t, i) => (
                <Rad
                  key={t.id}
                  onClick={() => setValgtId(t.id)}
                  leading={<AkseChip a={t.omrade} />}
                  title={t.navn}
                  sub={t.beskrivelse}
                  meta={valgtId === t.id ? <Icon name="check" size={16} style={{ color: T.lime }} /> : undefined}
                  trailing={null}
                  last={i === filtrert.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </Kort>

      <Kort eyebrow="Frist (valgfritt)">
        <SkjemaFelt label={null} hjelp={undefined}>
          <Inndata label={null} type="date" value={frist} onChange={setFrist} />
        </SkjemaFelt>
      </Kort>

      <Kort eyebrow="Notat til spiller">
        <SkjemaFelt label={null} hjelp={`Spilleren får varsel i appen · ${notat.length} / 280 tegn`}>
          <TekstOmraade
            label={null}
            value={notat}
            onChange={(v) => setNotat(v.slice(0, 280))}
            rows={3}
            placeholder={`Hva skal ${data.spillerNavn.split(" ")[0]} ha i tankene før testen?`}
          />
        </SkjemaFelt>
      </Kort>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Link href={`/admin/spillere/${data.spillerId}/tester`} style={{ textDecoration: "none" }}>
          <CTAPill ghost>Avbryt</CTAPill>
        </Link>
        <Knapp icon="arrow-right" onClick={send} disabled={!valgtId || pending}>
          {pending ? "Tildeler…" : "Tildel test"}
        </Knapp>
      </div>
    </div>
  );
}
