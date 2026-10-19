"use client";

/**
 * AG-04 / AG-23 E-postmaler i nytt design — /admin/kommunikasjon?fane=maler.
 * Erstatter AdminEmailV2 med de samme server-handlingene (createTemplate,
 * updateTemplate, deleteTemplate) og samme data: tellere, søk, gruppefilter,
 * liste, valgt mal med emne og innhold, rask redigering i ark og lenke til den
 * fulle editoren (AG04MalRediger på /admin/email-templates/[id]/rediger).
 * Slett bekreftes i en dialog med rust knapp.
 * «Send test (kommer)» er tatt bort her: Send test finnes i den fulle editoren.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, KnappLenke, Pille, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import { createTemplate, deleteTemplate, updateTemplate } from "@/app/admin/(legacy)/email-templates/actions";
import type { AdminEmailV2Data, AdminEmailV2Template } from "@/lib/admin/kommunikasjon/mal-typer";

type Ark = { modus: "ny" } | { modus: "endre"; mal: AdminEmailV2Template } | null;

function MalArk({ ark, onLukk, onLagret }: { ark: NonNullable<Ark>; onLukk: () => void; onLagret: () => void }) {
  const fra = ark.modus === "endre" ? ark.mal : null;
  const [slug, setSlug] = useState(fra?.slug ?? "");
  const [navn, setNavn] = useState(fra?.name ?? "");
  const [emne, setEmne] = useState(fra?.subject ?? "");
  const [tekst, setTekst] = useState(fra?.body ?? "");
  const [aktiv, setAktiv] = useState(fra?.active ?? true);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const lagre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navn.trim() || !emne.trim() || !tekst.trim()) return setFeil("Navn, emne og tekst må fylles inn.");
    if (!fra && !slug.trim()) return setFeil("Kortnavn (slug) må fylles inn, for eksempel velkomst-full.");
    setFeil(null);
    start(async () => {
      try {
        if (fra) await updateTemplate(fra.id, { name: navn, subject: emne, body: tekst, active: aktiv });
        else await createTemplate({ slug, name: navn, subject: emne, body: tekst, active: aktiv });
        onLagret();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  };

  return (
    <div className="ark-lag" role="dialog" aria-modal="true" aria-labelledby="mal-ark-tittel" onClick={onLukk}>
      <form className="ark" onClick={(e) => e.stopPropagation()} onSubmit={lagre}>
        <div className="ark-topp"><h2 id="mal-ark-tittel">{fra ? `Endre «${fra.name}»` : "Ny e-postmal"}</h2>
          <Knapp variant="spok" onClick={onLukk}>Lukk</Knapp></div>
        <label className="felt"><span className="etikett">{fra ? "Kortnavn (kan ikke endres)" : "Kortnavn (slug)"}</span>
          <input className="mono" value={slug} readOnly={!!fra} onChange={(e) => setSlug(e.target.value)} placeholder="velkomst-full" /></label>
        <label className="felt"><span className="etikett">Navn</span><input value={navn} onChange={(e) => setNavn(e.target.value)} /></label>
        <label className="felt"><span className="etikett">Emne</span><input value={emne} onChange={(e) => setEmne(e.target.value)} /></label>
        <label className="felt"><span className="etikett">Tekst</span>
          <textarea rows={8} value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder="Hei {{name}}, …" style={{ resize: "vertical" }} />
          <span className="hjelp">Felter i doble krøllparenteser fylles ut når e-posten lages.</span></label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span><b className="undertittel">Aktiv</b><span className="kilde" style={{ display: "block" }}>Kan brukes når Jarvis lager utkast.</span></span>
          <button type="button" className="bryter" role="switch" aria-checked={aktiv} aria-label="Aktiv" onClick={() => setAktiv((v) => !v)} />
        </div>
        {feil && <Varsel tone="advarsel" tittel="Ikke lagret">{feil}</Varsel>}
        <div className="knapper">
          <Knapp type="submit" disabled={pending}>{pending ? "Lagrer …" : "Lagre"}</Knapp>
          <Knapp variant="spok" onClick={onLukk}>Avbryt</Knapp>
        </div>
      </form>
    </div>
  );
}

export function AG04Maler({ data }: { data: AdminEmailV2Data }) {
  const router = useRouter();
  const [sok, setSok] = useState("");
  const [gruppe, setGruppe] = useState<string | null>(null);
  const [valgtId, setValgtId] = useState<string | null>(data.maler[0]?.id ?? null);
  const [ark, setArk] = useState<Ark>(null);
  const [slett, setSlett] = useState<AdminEmailV2Template | null>(null);
  const [visTekst, setVisTekst] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtrert = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return data.maler.filter((m) => (!gruppe || m.gruppe === gruppe) && (!q || m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)));
  }, [data.maler, sok, gruppe]);
  const valgt = filtrert.find((m) => m.id === valgtId) ?? filtrert[0] ?? null;

  const lagret = () => { setArk(null); router.refresh(); };
  const slettMal = () => {
    const m = slett;
    if (!m) return;
    setSlett(null);
    setFeil(null);
    start(async () => {
      try { await deleteTemplate(m.id); router.refresh(); }
      catch { setFeil("Kunne ikke slette malen."); }
    });
  };

  return (
    <>
      <div className="knapper"><Knapp onClick={() => setArk({ modus: "ny" })}>Ny mal</Knapp></div>
      <div className="teller-rad">
        <div className="teller"><span className="e">Maler</span><b className="t">{data.total}</b></div>
        <div className="teller"><span className="e">Aktive</span><b className="t">{data.aktive}</b></div>
        <div className="teller"><span className="e">Grupper</span><b className="t">{data.grupper.length}</b></div>
      </div>
      {feil && <Varsel tone="advarsel">{feil}</Varsel>}

      {data.maler.length === 0 ? (
        <Tom tittel="Ingen maler ennå" tekst="Lag en mal, så kan Jarvis bruke den når den lager utkast i Innboks." />
      ) : (
        <>
          <label className="felt"><span className="etikett">Søk</span>
            <input type="search" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Navn, emne eller kortnavn" /></label>
          {data.grupper.length > 0 && (
            <div className="chips" role="group" aria-label="Gruppe">
              <button type="button" aria-pressed={gruppe === null} onClick={() => setGruppe(null)}>Alle</button>
              {data.grupper.map((g) => <button key={g} type="button" aria-pressed={gruppe === g} onClick={() => setGruppe(gruppe === g ? null : g)}>{g}</button>)}
            </div>
          )}
          <div className="to-del bred-v">
            <div>
              <Seksjon tittel={`Maler · ${filtrert.length}`}>
                {filtrert.length === 0 ? <Tom tittel="Ingen treff" tekst="Ingen maler passer søket eller filteret." /> : (
                  <div className="liste">
                    {filtrert.map((m) => (
                      <button key={m.id} type="button" aria-current={valgt?.id === m.id ? "true" : undefined} onClick={() => { setValgtId(m.id); setVisTekst(false); }}
                        style={valgt?.id === m.id ? { background: "var(--sand-100)" } : undefined}>
                        <span aria-hidden style={{ width: 4, height: 28, borderRadius: 2, background: m.active ? "var(--graphite-900)" : "var(--sand-300)" }} />
                        <span><b style={{ overflowWrap: "anywhere" }}>{m.name}</b><span className="kilde" style={{ overflowWrap: "anywhere" }}>{m.subject}</span></span>
                        <Pille tone={m.active ? "ok" : "noy"}>{m.active ? "Aktiv" : "Av"}</Pille>
                      </button>
                    ))}
                  </div>
                )}
              </Seksjon>
            </div>
            <div>
              {valgt && (
                <Seksjon tittel="Valgt mal" hoyre={<Pille tone={valgt.active ? "ok" : "noy"}>{valgt.active ? "Aktiv" : "Inaktiv"}</Pille>}>
                  <div className="kort" style={{ display: "grid", gap: 12 }}>
                    <div><b className="undertittel" style={{ overflowWrap: "anywhere" }}>{valgt.name}</b>
                      <p className="kilde mono" style={{ overflowWrap: "anywhere" }}>{valgt.slug} · endret {valgt.sistEndret}</p></div>
                    <div><span className="kilde">Emne</span><p style={{ overflowWrap: "anywhere" }}>{valgt.subject}</p></div>
                    <div>
                      <Knapp variant="spok" onClick={() => setVisTekst((v) => !v)}>{visTekst ? "Skjul teksten" : "Vis teksten"}</Knapp>
                      {visTekst && <pre className="mono" style={{ margin: "8px 0 0", padding: 12, borderRadius: 8, background: "var(--sand-100)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 13 }}>{valgt.body}</pre>}
                    </div>
                    <div className="knapper">
                      <KnappLenke variant="pri" href={`/admin/email-templates/${valgt.id}/rediger`}>Åpne editoren</KnappLenke>
                      <Knapp variant="sek" onClick={() => setArk({ modus: "endre", mal: valgt })}>Rask endring</Knapp>
                      <Knapp variant="spok" disabled={pending} onClick={() => setSlett(valgt)}>Slett</Knapp>
                    </div>
                    <p className="kilde">Opprettet {valgt.opprettet}</p>
                  </div>
                </Seksjon>
              )}
            </div>
          </div>
        </>
      )}

      {ark && <MalArk key={ark.modus === "endre" ? ark.mal.id : "ny"} ark={ark} onLukk={() => setArk(null)} onLagret={lagret} />}

      {slett && (
        <div className="dialog-lag" role="dialog" aria-modal="true" aria-labelledby="slett-mal-tittel">
          <div className="dialog">
            <h2 id="slett-mal-tittel">Slette «{slett.name}»?</h2>
            <p className="forklar">Malen fjernes. E-poster som allerede er sendt, påvirkes ikke.</p>
            <div className="knapper">
              <Knapp variant="sek" onClick={() => setSlett(null)}>Avbryt</Knapp>
              <Knapp variant="rust" onClick={slettMal}>Slett malen</Knapp>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
