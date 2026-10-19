"use client";

/**
 * AG-23 Oppsett › Inviter coach i nytt design — /admin/team/inviter.
 * Erstatter AdminInviterCoachTrainLock med samme server-handling (inviterCoach),
 * samme validering og samme ekstra tilganger (bare head coach kan gi dem).
 * Etter vellykket invitasjon sendes coachen tilbake til Oppsett › Team.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, KnappLenke, Seksjon, Varsel } from "@/components/admin/agencyos-ny/ny";
import { Capability, CAPABILITY_BESKRIVELSER } from "@/lib/auth/cbac";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";

// G6: ekstra tilganger utover COACH-standarden. Skrives som GRANT i user_capabilities.
const EKSTRA_TILGANGER: Capability[] = [
  Capability.VIEW_FINANCE,
  Capability.MANAGE_FACILITIES,
  Capability.MANAGE_USERS,
  Capability.USE_AGENTS,
  Capability.INVITE_USERS,
];

const TILBAKE = "/admin/oppsett?fane=team";

export function AG23InviterCoach({ kanTildeleTilganger = false }: { kanTildeleTilganger?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgte, setValgte] = useState<Capability[]>([]);
  const [feil, setFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);

  const veksle = (cap: Capability, paa: boolean) => setValgte((v) => (paa ? [...new Set([...v, cap])] : v.filter((c) => c !== cap)));

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFeil(null);
    setFeltFeil({});
    setOk(null);
    start(async () => {
      const res = await inviterCoach(epost.trim(), navn.trim(), kanTildeleTilganger && valgte.length > 0 ? valgte : undefined);
      if (!res.ok) {
        setFeil(res.error);
        setFeltFeil(res.fieldErrors ?? {});
        return;
      }
      setOk(res.epostSendt ? "Coachen er invitert. E-posten med innloggingslenke er sendt." : "Coachen er opprettet. E-posten ble ikke sendt fordi e-posttjenesten ikke er satt opp.");
      setTimeout(() => router.push(TILBAKE), 1500);
    });
  };

  return (
    <form onSubmit={send} className="kort" style={{ display: "grid", gap: 16, maxWidth: 620 }}>
      <p className="forklar">Coachen får en e-post med innloggingslenke og kan logge inn med en gang, med samme e-post.</p>
      <label className="felt"><span className="etikett">Navn</span>
        <input value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Fornavn Etternavn" autoComplete="name" aria-invalid={!!feltFeil.name} />
        {feltFeil.name && <span className="feiltekst">{feltFeil.name}</span>}</label>
      <label className="felt"><span className="etikett">E-post</span>
        <input type="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="coach@akgolf.no" autoComplete="email" aria-invalid={!!feltFeil.email} />
        {feltFeil.email && <span className="feiltekst">{feltFeil.email}</span>}</label>

      {kanTildeleTilganger && (
        <Seksjon tittel="Ekstra tilganger">
          <p className="forklar">Vanlig trenertilgang (grupper, planer, tester, spillerdata og booking) følger med. Kryss av for det ekstra denne coachen skal ha.</p>
          <div className="liste">
            {EKSTRA_TILGANGER.map((cap) => (
              <label key={cap} style={{ cursor: "pointer" }}>
                <input type="checkbox" checked={valgte.includes(cap)} onChange={(e) => veksle(cap, e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--graphite-900)" }} />
                <b>{CAPABILITY_BESKRIVELSER[cap]}</b>
                <span />
              </label>
            ))}
          </div>
        </Seksjon>
      )}

      {feil && !Object.keys(feltFeil).length && <Varsel tone="advarsel" tittel="Ikke sendt">{feil}</Varsel>}
      {ok && <Varsel tone="ok">{ok}</Varsel>}
      <div className="knapper">
        <Knapp type="submit" disabled={pending}>{pending ? "Sender …" : "Send invitasjon"}</Knapp>
        <KnappLenke variant="spok" href={TILBAKE}>Avbryt</KnappLenke>
      </div>
    </form>
  );
}
