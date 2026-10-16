"use client";

/**
 * Rediger profil fra Spiller 360 (AG-08 › «Rediger profil»-arket i
 * ui_kits/agencyos/screens/AG-08.jsx) i Precision Athletics, som egen side
 * på /admin/spillere/[id]/rediger.
 *
 * Samme handlinger som Train-lock-skjemaet: lagreSpiller (hovedskjemaet),
 * settValgtCoach (lagres med én gang), slettSpiller (bare admin, soft-delete)
 * og inviterForelderForSpiller (fra den gamle profilsiden). Alle endringer
 * logges i AuditLog og vises i endringshistorikken.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, UserPlus } from "lucide-react";
import { Knapp, KnappLenke, Meta, Tidslinje } from "@/components/precision/pa";
import { Ark, Dialogboks, SideHode } from "@/components/precision/pa-a4";
import { Dempet, Etikett, Liste, Rad, Seksjon } from "@/components/precision/pa-spiller360";
import { lagreSpiller, settValgtCoach, slettSpiller } from "@/app/admin/(legacy)/spillere/[id]/rediger/actions";
import { inviterForelderForSpiller } from "@/app/admin/(legacy)/spillere/[id]/profil/actions";

export type AG08RedigerData = {
  spillerId: string;
  spillerNavn: string;
  fornavn: string;
  etternavn: string;
  fodselsdatoYmd: string;
  telefon: string;
  epost: string;
  hjemmeklubb: string;
  skole: string;
  klassetrinn: string;
  hcpInput: string;
  ambisjon: string;
  valgtCoachId: string | null;
  coacher: { id: string; navn: string }[];
  foreldre: { id: string; navn: string; relasjon: string }[];
  historikk: { id: string; datoLabel: string; handling: string; aktorNavn: string | null }[];
};

const RELASJONER = [
  { value: "FATHER", label: "Far" },
  { value: "MOTHER", label: "Mor" },
  { value: "GUARDIAN", label: "Verge / annen foresatt" },
] as const;
type Relasjon = (typeof RELASJONER)[number]["value"];

function Felt({ label, name, defaultValue, type = "text", required, hint, mono }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean; hint?: string; mono?: boolean }) {
  return (
    <label className="a8-etikett">{label}{required ? " · påkrevd" : ""}
      <input className={mono ? "a8-felt a8-felt--mono" : "a8-felt"} name={name} type={type} defaultValue={defaultValue} required={required} />
      {hint && <Meta>{hint.toUpperCase()}</Meta>}
    </label>
  );
}

function ValgtCoach({ spillerId, valgt, coacher }: { spillerId: string; valgt: string | null; coacher: AG08RedigerData["coacher"] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const velg = (id: string) => {
    setStatus(null);
    start(async () => {
      const r = await settValgtCoach(spillerId, id === "" ? null : id);
      if (r?.ok) { setStatus("Lagret — varsler og coach-flater bruker denne."); router.refresh(); }
      else setStatus(r?.error ?? "Lagring feilet. Prøv igjen.");
    });
  };
  return (
    <label className="a8-etikett">Valgt coach
      <select className="a8-felt" defaultValue={valgt ?? ""} disabled={pending} onChange={(e) => velg(e.target.value)}>
        <option value="">Ikke valgt (automatisk)</option>
        {coacher.map((c) => <option key={c.id} value={c.id}>{c.navn}</option>)}
      </select>
      <span role="status"><Meta>{(pending ? "Lagrer …" : status ?? "LAGRES MED EN GANG, UTENFOR SKJEMAET").toUpperCase()}</Meta></span>
    </label>
  );
}

function InviterForelder({ spillerId, navn }: { spillerId: string; navn: string }) {
  const [open, setOpen] = useState(false);
  const [epost, setEpost] = useState("");
  const [relasjon, setRelasjon] = useState<Relasjon>("GUARDIAN");
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [pending, start] = useTransition();
  const lukk = () => { setOpen(false); setSendt(false); setFeil(null); };
  const send = () => start(async () => {
    setFeil(null);
    const r = await inviterForelderForSpiller({ playerId: spillerId, email: epost, relation: relasjon });
    if (r && "ok" in r && r.ok) setSendt(true); else setFeil((r as { error?: string } | undefined)?.error ?? "Invitasjonen ble ikke sendt.");
  });
  return <>
    <div><Knapp size="sm" variant="secondary" icon={UserPlus} iconName="user-plus" onClick={() => setOpen(true)}>Legg til forelder</Knapp></div>
    <Ark open={open} onClose={lukk} kicker="Foresatte" title="Inviter forelder"
      footer={sendt ? <Knapp fullWidth onClick={lukk}>Lukk</Knapp> : <><Knapp fullWidth loading={pending} loadingText="Sender …" disabled={!epost.includes("@")} onClick={send}>Send invitasjon</Knapp><Knapp variant="ghost" fullWidth onClick={lukk}>Avbryt</Knapp></>}>
      {sendt ? <p role="status" className="a8-tekst">{`Invitasjon sendt til ${epost}. Forelderen får en e-post med en lenke som er gyldig i 7 dager, og kobles til ${navn} når den godtas.`}</p> : <>
        <label className="a8-etikett">E-postadresse<input className="a8-felt" type="email" required value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="forelder@eksempel.no" /></label>
        <label className="a8-etikett">Relasjon
          <select className="a8-felt" value={relasjon} onChange={(e) => setRelasjon(e.target.value as Relasjon)}>{RELASJONER.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
        </label>
        {feil && <p role="alert" className="a8-tekst">{feil}</p>}
        <Meta>LENKEN ER GYLDIG I 7 DAGER</Meta>
      </>}
    </Ark>
  </>;
}

function SlettSpiller({ spillerId, navn }: { spillerId: string; navn: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const bekreft = () => start(async () => {
    setFeil(null);
    const r = await slettSpiller(spillerId);
    if (r?.ok) router.push("/admin/spillere"); else setFeil(r?.error ?? "Sletting feilet. Prøv igjen.");
  });
  return <>
    <Knapp size="sm" variant="ghost" icon={Trash2} iconName="trash-2" onClick={() => setOpen(true)}>Slett spiller</Knapp>
    <Dialogboks open={open} onClose={() => { if (!pending) setOpen(false); }} title="Slett spiller"
      footer={<><Knapp variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Avbryt</Knapp><Knapp variant="signal" loading={pending} loadingText="Sletter …" onClick={bekreft}>Slett spiller</Knapp></>}>
      <p className="a8-tekst">{`${navn} fjernes fra stallen og mister tilgang. Dataene beholdes og kan gjenopprettes via support. Vil du fortsette?`}</p>
      {feil && <p role="alert" className="a8-tekst">{feil}</p>}
      <Meta>BARE ADMIN KAN SLETTE</Meta>
    </Dialogboks>
  </>;
}

export function AG08Rediger({ data }: { data: AG08RedigerData }) {
  const tilbake = `/admin/spillere/${data.spillerId}`;
  return (
    <div className="a8-side">
      <SideHode kicker={`Stall · Spiller 360 · ${data.spillerNavn}`} title="Rediger profil" sub="Alle endringer logges med navn og tid."
        actions={<><KnappLenke variant="ghost" href={tilbake}>Avbryt</KnappLenke><Knapp type="submit" form="rediger-form" icon={Check} iconName="check">Lagre</Knapp></>} />
      <form id="rediger-form" action={lagreSpiller} className="a8-to">
        <input type="hidden" name="id" value={data.spillerId} />
        <div className="a8-stabel">
          <Seksjon k="Personalia" gap={12}>
            <div className="a8-skjema a8-skjema__to">
              <Felt label="Fornavn" name="fornavn" defaultValue={data.fornavn} required />
              <Felt label="Etternavn" name="etternavn" defaultValue={data.etternavn} />
              <Felt label="Fødselsdato" name="fodselsdato" type="date" defaultValue={data.fodselsdatoYmd} mono />
              <Felt label="Telefon" name="telefon" defaultValue={data.telefon} mono />
              <Felt label="E-post" name="email" type="email" defaultValue={data.epost} required />
              <Felt label="Hjemmeklubb" name="hjemmeklubb" defaultValue={data.hjemmeklubb} />
              <Felt label="Skole / VGS" name="skole" defaultValue={data.skole} />
              <label className="a8-etikett">Klassetrinn
                <select className="a8-felt" name="klassetrinn" defaultValue={data.klassetrinn}>
                  {[["", "Ikke satt"], ["VG1", "VG1"], ["VG2", "VG2"], ["VG3", "VG3"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <Felt label="HCP" name="hcp" defaultValue={data.hcpInput} hint="Bruk komma · f.eks. 4,8 eller +0,5" mono />
            </div>
          </Seksjon>
          <Seksjon k="Coaching" gap={12}>
            <div className="a8-skjema">
              <ValgtCoach spillerId={data.spillerId} valgt={data.valgtCoachId} coacher={data.coacher} />
              <Felt label="Ambisjon" name="ambisjon" defaultValue={data.ambisjon} hint="Hva spilleren jobber mot" />
              <label className="a8-etikett">Interne notater
                <textarea className="a8-felt" name="notater" defaultValue="" rows={4} />
                <Meta>BARE COACH SER DETTE</Meta>
              </label>
            </div>
          </Seksjon>
        </div>
        <div className="a8-stabel">
          <Seksjon k="Foresatte" meta={data.foreldre.length ? `${data.foreldre.length} REGISTRERT` : "INGEN"} gap={12}>
            {!data.foreldre.length ? <Dempet>Ingen foresatte registrert.</Dempet> : (
              <Liste>{data.foreldre.map((f) => <Rad key={f.id}><Etikett a={f.navn} sub={RELASJONER.find((r) => r.value === f.relasjon)?.label ?? f.relasjon} /><span /></Rad>)}</Liste>
            )}
            <InviterForelder spillerId={data.spillerId} navn={data.spillerNavn} />
          </Seksjon>
          <Seksjon k="Endringshistorikk" meta={data.historikk.length ? `${data.historikk.length} ENDRINGER` : "—"}>
            {!data.historikk.length ? <Dempet>Ingen endringer ennå.</Dempet> : (
              <Tidslinje dense items={data.historikk.map((h) => ({ id: h.id, time: h.datoLabel, title: h.handling, meta: h.aktorNavn?.toUpperCase() ?? null }))} />
            )}
          </Seksjon>
          <Seksjon k="Faresone" meta="SOFT-DELETE">
            <div className="a8-knapper"><SlettSpiller spillerId={data.spillerId} navn={data.spillerNavn} /></div>
          </Seksjon>
        </div>
      </form>
      <div className="a8-knapper" style={{ justifyContent: "flex-end" }}>
        <KnappLenke variant="ghost" href={tilbake}>Avbryt</KnappLenke>
        <Knapp type="submit" form="rediger-form" icon={Check} iconName="check">Lagre endringer</Knapp>
      </div>
    </div>
  );
}
