"use client";

/**
 * Ny spiller (AG-07 › «Ny spiller», AG-07-NY i Precision Athletics) på
 * /admin/spillere/ny. Ett skjema i fire seksjoner i stedet for firestegs
 * veiviser (samme løsning som AG-08 Rediger): Identitet, Golf-profil,
 * App-nivå og foresatte, Velkomst.
 *
 * Samme server action (createSpiller), samme felt og samme validering som
 * Train-lock-veiviseren. Spillere under 18 krever foresatt (navn og e-post);
 * samtykke og barnevern-regler ligger uendret i createSpiller.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { Dempet, Seksjon } from "@/components/precision/pa-spiller360";
import { createSpiller, type OpprettSpillerInput } from "@/app/admin/(legacy)/spillere/ny/actions";
import {
  ALL_PROGRAMS,
  SPILLER_KATEGORIER,
  SPILLER_TIERS,
  type SpillerKategori,
  type SpillerTier,
} from "@/app/admin/(legacy)/spillere/ny/constants";
import type { PlayerProgram } from "@/generated/prisma/client";
import { alderFraDato, AG07_NY_TOM, valider, type AG07NySkjema } from "./ag07-ny-logikk";

export { AG07_NY_TOM };
export type { AG07NySkjema };

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT: "WANG Toppidrett Fredrikstad",
  WANG_UNG: "WANG Ung Fredrikstad",
  GFGK_MINI: "GFGK Mini",
  GFGK_BREDDE: "GFGK Bredde/Utvikling",
  GFGK_JENTER: "GFGK Jenter",
  GFGK_ELITE: "GFGK Elite",
  AK_ACADEMY: "AK Golf Academy",
  AK_ACADEMY_JUNIOR: "AK Golf Academy Junior",
  PLATFORM_ONLY: "Selvbetjent (ingen coach)",
};

const KATEGORI_BESKRIVELSE: Record<SpillerKategori, string> = {
  A1: "Toppspiller, landslag eller elite",
  A2: "Talent, regional elite",
  B1: "Etablert, klubb-elite",
  B2: "Utvikling, junior med ambisjon",
  C: "Bredde, fritid og nybegynner",
};

const TIER_BESKRIVELSE: Record<SpillerTier, string> = {
  GRATIS: "Gratis · PlayerHQ med rundelogg og enkel statistikk",
  PRO: "Pro · 299 kr/mnd · full PlayerHQ, AI-coach og planer",
};

function Felt({ label, name, value, onChange, feil, hint, type = "text", required, mono, placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void; feil?: string; hint?: string;
  type?: string; required?: boolean; mono?: boolean; placeholder?: string;
}) {
  return (
    <label className="a8-etikett">{label}{required ? " · påkrevd" : ""}
      <input className={mono ? "a8-felt a8-felt--mono" : "a8-felt"} name={name} type={type} value={value}
        placeholder={placeholder} aria-invalid={feil ? true : undefined} onChange={(e) => onChange(e.target.value)} />
      {feil ? <span role="alert" className="a8-tekst">{feil}</span> : hint ? <Meta>{hint.toUpperCase()}</Meta> : null}
    </label>
  );
}

function Valg<T extends string>({ verdier, valgt, tekst, onVelg, label }: {
  verdier: readonly T[]; valgt: T; tekst: (v: T) => string; onVelg: (v: T) => void; label: string;
}) {
  return (
    <div role="group" aria-label={label} className="a8-faner">
      {verdier.map((v) => (
        <button key={v} type="button" className="a8-fane" style={{ minWidth: 44, justifyContent: "center" }} aria-pressed={valgt === v} onClick={() => onVelg(v)}>{tekst(v)}</button>
      ))}
    </div>
  );
}

export function AG07Ny({ initial = AG07_NY_TOM }: { initial?: AG07NySkjema }) {
  const router = useRouter();
  const [s, setS] = useState<AG07NySkjema>(initial);
  const [visFeil, setVisFeil] = useState(false);
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [serverFelt, setServerFelt] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const sett = <K extends keyof AG07NySkjema>(k: K, v: AG07NySkjema[K]) => setS((x) => ({ ...x, [k]: v }));

  const alder = useMemo(() => (s.fodselsdato ? alderFraDato(s.fodselsdato) : null), [s.fodselsdato]);
  const erUnder18 = alder !== null && alder < 18;
  const klientFeil = valider(s, alder);
  const feil = visFeil ? { ...serverFelt, ...klientFeil } : serverFelt;
  const antall = Object.keys(feil).length;

  function opprett() {
    if (pending) return;
    setServerFeil(null);
    setServerFelt({});
    if (Object.keys(klientFeil).length) { setVisFeil(true); return; }
    const input: OpprettSpillerInput = {
      navn: s.navn.trim(),
      epost: s.epost.trim(),
      program: s.program,
      programCoachId: "",
      fodselsdato: s.fodselsdato,
      hcp: s.hcp.trim() === "" ? null : Number(s.hcp.replace(",", ".")),
      kategori: s.kategori,
      hjemmeklubb: s.hjemmeklubb.trim(),
      tier: s.tier,
      foreldreNavn: erUnder18 ? s.foreldreNavn.trim() : "",
      foreldreEpost: erUnder18 ? s.foreldreEpost.trim() : "",
      foreldreTelefon: erUnder18 ? s.foreldreTelefon.trim() : "",
      velkomstMelding: s.velkomstMelding.trim(),
      sendInvitasjon: s.sendInvitasjon,
    };
    start(async () => {
      const r = await createSpiller(input);
      if (r.ok) router.push(`/admin/spillere/${r.userId}`);
      else { setServerFeil(r.error); if (r.fieldErrors) setServerFelt(r.fieldErrors); }
    });
  }

  const knappTekst = s.sendInvitasjon ? "Opprett og send invitasjon" : "Opprett spiller";
  const opprettKnapp = (tekst: string) => <Knapp type="button" icon={Check} iconName="check" loading={pending} loadingText="Oppretter …" onClick={opprett}>{tekst}</Knapp>;

  return (
    <div className="a8-side" style={{ maxWidth: 960 }}>
      <SideHode kicker="Stall · Ny spiller" title="Ny spiller"
        sub="Spilleren får invitasjon på e-post hvis du sender den nå. Spillere under 18 trenger en foresatt."
        actions={<><KnappLenke variant="ghost" href="/admin/spillere">Avbryt</KnappLenke>{opprettKnapp("Opprett spiller")}</>} />

      {(antall > 0 || serverFeil) && (
        <div role="alert" className="pa-card a8-sek" style={{ gap: 4 }}>
          <span className="kicker">{serverFeil && antall === 0 ? "Spilleren ble ikke opprettet" : antall === 1 ? "Ett felt må rettes" : `${antall} felt må rettes`}</span>
          <p className="a8-tekst">{serverFeil && antall === 0 ? serverFeil : "Spilleren er ikke lagret."}</p>
        </div>
      )}

      <Seksjon k="Identitet" meta="PÅKREVD" gap={12}>
        <label className="a8-etikett">Program
          <select className="a8-felt" value={s.program} onChange={(e) => sett("program", e.target.value as PlayerProgram)}>
            {ALL_PROGRAMS.map((p) => <option key={p} value={p}>{PROGRAM_LABEL[p]}</option>)}
          </select>
          <Meta>SPILLEREN ENROLLERES I PROGRAMMET · KAN ENDRES PÅ PROFILEN</Meta>
        </label>
        <div className="a8-skjema a8-skjema__to">
          <Felt label="Fullt navn" name="navn" required value={s.navn} onChange={(v) => sett("navn", v)} feil={feil.navn} />
          <Felt label="E-post" name="epost" type="email" required value={s.epost} onChange={(v) => sett("epost", v)} feil={feil.epost} hint="Brukes som innloggings-ID" />
          <Felt label="Fødselsdato" name="fodselsdato" type="date" required mono value={s.fodselsdato} onChange={(v) => sett("fodselsdato", v)} feil={feil.fodselsdato} />
          <div className="a8-etikett">Alder
            <div className="a8-kort-hode" style={{ minHeight: 44 }}>
              <span className="a8-v">{alder == null ? "—" : `${alder} år`}</span>
              {erUnder18 && <StatusPille tone="warn">Foresatt påkrevd</StatusPille>}
            </div>
          </div>
        </div>
      </Seksjon>

      <Seksjon k="Golf-profil" meta="VALGFRITT" gap={12}>
        <div className="a8-skjema a8-skjema__to">
          <Felt label="Handicap (HCP)" name="hcp" mono value={s.hcp} onChange={(v) => sett("hcp", v)} feil={feil.hcp} hint="Bruk komma · f.eks. 12,3" placeholder="—" />
          <Felt label="Hjemmeklubb" name="hjemmeklubb" value={s.hjemmeklubb} onChange={(v) => sett("hjemmeklubb", v)} feil={feil.hjemmeklubb} />
        </div>
        <div className="a8-etikett">Kategori
          <Valg verdier={SPILLER_KATEGORIER} valgt={s.kategori} tekst={(v) => v} onVelg={(v) => sett("kategori", v)} label="Kategori" />
          <Meta>{`${s.kategori} · ${KATEGORI_BESKRIVELSE[s.kategori]}`.toUpperCase()}</Meta>
        </div>
      </Seksjon>

      <Seksjon k="App-nivå og foresatte" gap={12}>
        <div className="a8-etikett">App-nivå
          <Valg verdier={SPILLER_TIERS} valgt={s.tier} tekst={(v) => (v === "GRATIS" ? "Gratis" : "Pro")} onVelg={(v) => sett("tier", v)} label="App-nivå" />
          <Meta>{TIER_BESKRIVELSE[s.tier].toUpperCase()}</Meta>
        </div>
        {erUnder18 ? (
          <>
            <div className="a8-skjema a8-skjema__to">
              <Felt label="Foresatt: navn" name="foreldreNavn" required value={s.foreldreNavn} onChange={(v) => sett("foreldreNavn", v)} feil={feil.foreldreNavn} />
              <Felt label="Foresatt: e-post" name="foreldreEpost" type="email" required value={s.foreldreEpost} onChange={(v) => sett("foreldreEpost", v)} feil={feil.foreldreEpost} />
              <Felt label="Foresatt: telefon (valgfri)" name="foreldreTelefon" type="tel" mono value={s.foreldreTelefon} onChange={(v) => sett("foreldreTelefon", v)} feil={feil.foreldreTelefon} />
            </div>
            <Meta>SAMTYKKE SENDES TIL FORESATT · INGEN DATA DELES FØR DET ER GITT</Meta>
          </>
        ) : (
          <Dempet>{alder == null ? "Fyll inn fødselsdato for å se om foresatt trengs." : "Spilleren er myndig. Ingen foresatt nødvendig."}</Dempet>
        )}
      </Seksjon>

      <Seksjon k="Velkomst" gap={12}>
        <label className="a8-etikett">Velkomstmelding
          <textarea className="a8-felt" rows={4} value={s.velkomstMelding} onChange={(e) => sett("velkomstMelding", e.target.value)} />
          <Meta>VISES I SPILLERENS INNBOKS OG I INVITASJONEN</Meta>
        </label>
        <div className="a8-etikett">Invitasjon
          <Valg verdier={["nå", "senere"] as const} valgt={s.sendInvitasjon ? "nå" : "senere"} tekst={(v) => (v === "nå" ? "Send nå" : "Send senere")} onVelg={(v) => sett("sendInvitasjon", v === "nå")} label="Invitasjon" />
          <Meta>{(s.sendInvitasjon ? "Spilleren får e-post med innlogging når du oppretter" : "Opprett nå, inviter senere fra profilen").toUpperCase()}</Meta>
        </div>
      </Seksjon>

      <div className="a8-knapper" style={{ justifyContent: "flex-end" }}>
        <KnappLenke variant="ghost" href="/admin/spillere">Avbryt</KnappLenke>
        {opprettKnapp(knappTekst)}
      </div>
    </div>
  );
}
