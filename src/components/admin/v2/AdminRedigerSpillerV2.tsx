"use client";

/**
 * AgencyOS — Rediger spiller (v2, retning C «Presis»). Rekomponering av
 * /admin/spillere/[id]/rediger med BEVART funksjon + datakontrakt: samme
 * felter (Personalia + Coaching), samme server action `lagreSpiller`
 * (kalt direkte med en klientbygd FormData — uendret i `./actions`), samme
 * `SlettSpillerKnapp` (shadcn Dialog — unntatt v2-migreringen). Foresatte og
 * endrings-historikk vises som lesevisning i sidepanelet, samme data som
 * legacy-siden hentet.
 *
 * Bygget av v2-skjema-familien (SkjemaFelt/Inndata/Velger/TekstOmraade) —
 * samme mønster som AdminNySpillerV2. Ingen ad-hoc UI, ingen rå hex (T.*).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  AvatarInit,
  SkjemaFelt,
  Inndata,
  Velger,
  TekstOmraade,
  ValideringsChip,
  CTAPill,
  Knapp,
  TomTilstand,
  T,
} from "@/components/v2";
import { lagreSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";
import { SlettSpillerKnapp } from "@/app/admin/(legacy)/spillere/[id]/rediger/slett-spiller-knapp";

export type RedigerForelder = { id: string; navn: string; relasjon: string };
export type RedigerHistorikk = { id: string; tidspunkt: string; handling: string; aktorNavn: string | null };

export interface AdminRedigerSpillerData {
  id: string;
  navn: string;
  fornavn: string;
  etternavn: string;
  fodselsdatoYmd: string;
  telefon: string;
  epost: string;
  hjemmeklubb: string;
  skole: string;
  klassetrinn: "" | "VG1" | "VG2" | "VG3";
  hcpTekst: string;
  ambisjon: string;
  foreldre: RedigerForelder[];
  historikk: RedigerHistorikk[];
}

const KLASSETRINN_LABEL: Record<string, string> = { "": "Ikke satt", VG1: "VG1", VG2: "VG2", VG3: "VG3" };
const KLASSETRINN_OPTIONS = ["Ikke satt", "VG1", "VG2", "VG3"];

export function AdminRedigerSpillerV2({ data }: { data: AdminRedigerSpillerData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  const [fornavn, setFornavn] = useState(data.fornavn);
  const [etternavn, setEtternavn] = useState(data.etternavn);
  const [fodselsdato, setFodselsdato] = useState(data.fodselsdatoYmd);
  const [telefon, setTelefon] = useState(data.telefon);
  const [epost, setEpost] = useState(data.epost);
  const [hjemmeklubb, setHjemmeklubb] = useState(data.hjemmeklubb);
  const [skole, setSkole] = useState(data.skole);
  const [klassetrinn, setKlassetrinn] = useState<string>(KLASSETRINN_LABEL[data.klassetrinn]);
  const [hcp, setHcp] = useState(data.hcpTekst);
  const [ambisjon, setAmbisjon] = useState(data.ambisjon);
  const [notater, setNotater] = useState("");

  function klassetrinnVerdi(label: string): string {
    const entry = Object.entries(KLASSETRINN_LABEL).find(([, l]) => l === label);
    return entry ? entry[0] : "";
  }

  function lagre() {
    if (pending) return;
    setFeil(null);
    const fd = new FormData();
    fd.set("id", data.id);
    fd.set("fornavn", fornavn);
    fd.set("etternavn", etternavn);
    fd.set("fodselsdato", fodselsdato);
    fd.set("telefon", telefon);
    fd.set("email", epost);
    fd.set("hjemmeklubb", hjemmeklubb);
    fd.set("skole", skole);
    fd.set("klassetrinn", klassetrinnVerdi(klassetrinn));
    fd.set("hcp", hcp);
    fd.set("ambisjon", ambisjon);
    fd.set("notater", notater);

    startTransition(async () => {
      try {
        await lagreSpiller(fd);
      } catch (e) {
        // lagreSpiller redirect()-er ved suksess (kaster NEXT_REDIRECT) — ikke en feil.
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
          router.push(`/admin/spillere/${data.id}`);
          return;
        }
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre endringer.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>{`AgencyOS · Stallen · ${data.navn}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="spiller.">Rediger</Tittel>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/spillere/${data.id}`} style={{ textDecoration: "none" }}>
            <CTAPill ghost>Avbryt</CTAPill>
          </Link>
          <Knapp icon="save" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre endringer"}</Knapp>
        </div>
      </div>

      {feil && <ValideringsChip tone="advarsel" tekst={feil} />}

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]" style={{ gap: T.gap, alignItems: "start" }}>
        {/* Venstre kol — skjema */}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <Kort eyebrow="Personalia">
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
              <SkjemaFelt label="Fornavn"><Inndata label={null} value={fornavn} onChange={setFornavn} /></SkjemaFelt>
              <SkjemaFelt label="Etternavn"><Inndata label={null} value={etternavn} onChange={setEtternavn} /></SkjemaFelt>
              <SkjemaFelt label="Fødselsdato"><Inndata label={null} type="date" value={fodselsdato} onChange={setFodselsdato} /></SkjemaFelt>
              <SkjemaFelt label="Telefon"><Inndata label={null} type="tel" value={telefon} onChange={setTelefon} /></SkjemaFelt>
              <SkjemaFelt label="E-post"><Inndata label={null} type="email" value={epost} onChange={setEpost} /></SkjemaFelt>
              <SkjemaFelt label="Hjemmeklubb"><Inndata label={null} value={hjemmeklubb} onChange={setHjemmeklubb} /></SkjemaFelt>
              <SkjemaFelt label="Skole / VGS"><Inndata label={null} value={skole} onChange={setSkole} /></SkjemaFelt>
              <SkjemaFelt label="Klassetrinn"><Velger label={null} options={KLASSETRINN_OPTIONS} value={klassetrinn} onChange={setKlassetrinn} /></SkjemaFelt>
              <SkjemaFelt label="HCP" hjelp="Bruk komma · f.eks 4,8 eller +0,5"><Inndata label={null} mono value={hcp} onChange={setHcp} /></SkjemaFelt>
            </div>
          </Kort>

          <Kort eyebrow="Coaching">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SkjemaFelt label="Ambisjon" hjelp="Hva spilleren jobber mot — vises i hero">
                <Inndata label={null} value={ambisjon} onChange={setAmbisjon} />
              </SkjemaFelt>
              <SkjemaFelt label="Interne notater" hjelp="Kun coach ser dette">
                <TekstOmraade label={null} value={notater} onChange={setNotater} rows={4} />
              </SkjemaFelt>
            </div>
          </Kort>

          <Kort eyebrow="Foresatte" action={<Caps size={9}>{data.foreldre.length}</Caps>}>
            {data.foreldre.length === 0 ? (
              <TomTilstand icon="users" title="Ingen foresatte registrert" sub="Foreldrekoblinger vises her." />
            ) : (
              data.foreldre.map((p, i) => (
                <Rad
                  key={p.id}
                  leading={<AvatarInit navn={p.navn} size={30} />}
                  title={p.navn}
                  sub={p.relasjon}
                  onClick={() => router.push(`/admin/spillere/${data.id}/profil`)}
                  last={i === data.foreldre.length - 1}
                />
              ))
            )}
          </Kort>
        </div>

        {/* Høyre kol — endrings-historikk */}
        <Kort eyebrow="Endrings-historikk" action={<Caps size={9}>{data.historikk.length}</Caps>}>
          {data.historikk.length === 0 ? (
            <TomTilstand icon="clock" title="Ingen endringer ennå" sub="Alle lagrede endringer vises her." />
          ) : (
            data.historikk.map((h, i) => (
              <Rad
                key={h.id}
                title={h.handling}
                sub={h.aktorNavn ? `${h.tidspunkt} · av ${h.aktorNavn}` : h.tidspunkt}
                trailing={null}
                last={i === data.historikk.length - 1}
              />
            ))
          )}
        </Kort>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <SlettSpillerKnapp spillerId={data.id} spillerNavn={data.navn} />
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/spillere/${data.id}`} style={{ textDecoration: "none" }}>
            <CTAPill ghost>Avbryt</CTAPill>
          </Link>
          <Knapp icon="save" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre endringer"}</Knapp>
        </div>
      </div>
    </div>
  );
}
