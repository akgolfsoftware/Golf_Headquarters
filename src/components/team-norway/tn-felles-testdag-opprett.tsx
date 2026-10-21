"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { opprettFellesTestdag } from "@/app/team-norway/tn-testdag-actions";
import type { TnTestdagGruppevalg } from "@/lib/domain/tn-arbeidsflate";
import { TnKnapp, TnInput } from "./core";
import { TN } from "@/lib/v2/team-norway";

type Protokoll = { id: string; navn: string };

/** Oppretter én nasjonal testdag med én protokollert stasjon per valgt gruppe. */
export function TnFellesTestdagOpprett({ grupper, protokoller }: { grupper: TnTestdagGruppevalg[]; protokoller: Protokoll[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [valgte, setValgte] = useState<Set<string>>(new Set());
  const [spillerIder, setSpillerIder] = useState<Record<string, Set<string>>>({});
  const [protokollIder, setProtokollIder] = useState<Record<string, string>>({});
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();

  const stasjoner = useMemo(() => grupper.filter((gruppe) => valgte.has(gruppe.id)), [grupper, valgte]);
  const harTN = stasjoner.some((gruppe) => gruppe.type === "TEAM_NORWAY");
  const harWang = stasjoner.some((gruppe) => gruppe.type === "WANG");
  const antallValgteSpillere = stasjoner.reduce((sum, gruppe) => sum + (spillerIder[gruppe.id]?.size ?? 0), 0);

  function velgGruppe(gruppeId: string, valgt: boolean) {
    setValgte((forrige) => {
      const neste = new Set(forrige);
      if (valgt) neste.add(gruppeId);
      else neste.delete(gruppeId);
      return neste;
    });
  }

  function velgSpiller(gruppeId: string, spillerId: string, valgt: boolean) {
    setSpillerIder((forrige) => {
      const neste = new Set(forrige[gruppeId] ?? []);
      if (valgt) neste.add(spillerId);
      else neste.delete(spillerId);
      return { ...forrige, [gruppeId]: neste };
    });
  }

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeil(null);
    const lokalDato = new Date(scheduledAt);
    if (Number.isNaN(lokalDato.getTime())) {
      setFeil("Ugyldig tidspunkt.");
      return;
    }
    start(async () => {
      try {
        const resultat = await opprettFellesTestdag({
          title,
          location: location || undefined,
          scheduledAt: lokalDato.toISOString(),
          stations: stasjoner.map((gruppe) => ({
            groupId: gruppe.id,
            stationName: gruppe.navn,
            protocolId: protokollIder[gruppe.id] ?? protokoller[0]?.id ?? "",
            spillerIder: [...(spillerIder[gruppe.id] ?? [])],
          })),
        });
        if (!resultat.ok) {
          setFeil(resultat.error);
          return;
        }
        router.push(`/team-norway/fellestesting?dag=${resultat.stationIds[0]}`);
      } catch {
        setFeil("Kunne ikke opprette felles testdag (nettverksfeil). Prøv igjen.");
      }
    });
  }

  return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TnInput label="Navn på testdagen" value={title} onChange={setTitle} placeholder="F.eks. Nasjonal testdag oktober" required />
      <TnInput label="Sted (valgfritt)" value={location} onChange={setLocation} placeholder="F.eks. Fredrikstad Golfklubb" />
      <TnInput label="Tidspunkt" type="datetime-local" value={scheduledAt} onChange={setScheduledAt} required />

      <fieldset style={{ border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.md, padding: 14 }}>
        <legend style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900, padding: "0 4px" }}>
          Skoler og grupper ({stasjoner.length} stasjoner)
        </legend>
        <p style={{ margin: "0 0 12px", color: TN.textSecondary, fontSize: TN.text.xs }}>Velg Team Norway og minst én WANG-skole. Hver valgt gruppe blir sin egen stasjon med separat protokoll og deltakerkø.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {grupper.map((gruppe) => {
            const valgt = valgte.has(gruppe.id);
            const valgteSpillere = spillerIder[gruppe.id] ?? new Set<string>();
            return (
              <section key={gruppe.id} style={{ border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.md, padding: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
                  <input type="checkbox" checked={valgt} onChange={(event) => velgGruppe(gruppe.id, event.target.checked)} />
                  {gruppe.navn} <span style={{ color: TN.textSecondary, fontWeight: TN.weight.regular }}>· {gruppe.type === "WANG" ? "WANG" : "Team Norway"}</span>
                </label>
                {valgt && (
                  <div style={{ display: "grid", gap: 12, paddingTop: 8 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>
                      Protokoll for {gruppe.navn}
                      <select value={protokollIder[gruppe.id] ?? protokoller[0]?.id ?? ""} onChange={(event) => setProtokollIder((forrige) => ({ ...forrige, [gruppe.id]: event.target.value }))} style={{ minHeight: 44, borderRadius: TN.radius.md, border: `1px solid ${TN.borderSubtle}`, padding: "0 12px", fontSize: TN.text.sm }}>
                        {protokoller.map((protokoll) => <option key={protokoll.id} value={protokoll.id}>{protokoll.navn}</option>)}
                      </select>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                      {gruppe.spillere.map((spiller) => (
                        (() => {
                          const valgtAnnensteds = stasjoner.find((annen) => annen.id !== gruppe.id && spillerIder[annen.id]?.has(spiller.id));
                          return (
                            <label key={spiller.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, fontSize: TN.text.sm, color: valgtAnnensteds ? TN.textSecondary : TN.navy900 }}>
                              <input type="checkbox" checked={valgteSpillere.has(spiller.id)} disabled={Boolean(valgtAnnensteds)} onChange={(event) => velgSpiller(gruppe.id, spiller.id, event.target.checked)} />
                              {spiller.navn}{valgtAnnensteds ? ` · allerede valgt ved ${valgtAnnensteds.navn}` : ""}
                            </label>
                          );
                        })()
                      ))}
                      {gruppe.spillere.length === 0 && <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Ingen aktive spillere i denne gruppen.</p>}
                    </div>
                    <span style={{ color: TN.textSecondary, fontSize: TN.text.xs }}>{valgteSpillere.size} spillere valgt</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </fieldset>

      {feil && <p role="alert" style={{ margin: 0, color: TN.red600, fontSize: TN.text.sm }}>{feil}</p>}
      <TnKnapp type="submit" variant="primaer" disabled={venter || !title.trim() || !scheduledAt || !harTN || !harWang || antallValgteSpillere === 0 || stasjoner.some((gruppe) => !(spillerIder[gruppe.id]?.size))}>
        {venter ? "Oppretter felles testdag …" : "Opprett felles testdag"}
      </TnKnapp>
    </form>
  );
}
