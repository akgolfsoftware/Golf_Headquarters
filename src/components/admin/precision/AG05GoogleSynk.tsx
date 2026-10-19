"use client";

/**
 * AG-05 Tilgjengelighet › Google Calendar, i nytt design.
 * Erstatter CalendarSyncSection og SubscriptionsForm på den gamle
 * /admin/availability, med de samme server-handlingene:
 * én kalender får nye bookinger, flere kalendere blokkerer ledige tider,
 * hent kalenderlista på nytt, koble på nytt og koble fra.
 * Koble fra bekreftes i en dialog med rust knapp (avslutter koblingen).
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Knapp, KnappLenke, Nokkelverdier, Seksjon, Tom, Varsel } from "@/components/admin/agencyos-ny/ny";
import { disconnectGoogleCalendar, oppdaterSubscriptions, refreshCalendarList } from "@/app/admin/(legacy)/settings/calendar/actions";
import type { GoogleSynkData } from "@/app/admin/kalender/google-synk-data";

const KOBLE = "/api/google-calendar/connect";
const TID = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Prikk({ farge }: { farge: string | null }) {
  return <span aria-hidden style={{ width: 12, height: 12, borderRadius: 999, flex: "none", background: farge ?? "var(--graphite-500)" }} />;
}

export function AG05GoogleSynk({ data, ok, error }: { data: GoogleSynkData; ok?: string; error?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [beskjed, setBeskjed] = useState<{ ok: boolean; tekst: string } | null>(null);
  const [frakobling, setFrakobling] = useState(false);
  const kalendere = data.koblet ? data.kalendere : [];
  const [pushId, setPushId] = useState(kalendere.find((k) => k.push && k.aktiv)?.id ?? "");
  const [pullIds, setPullIds] = useState(() => new Set(kalendere.filter((k) => k.pull && k.aktiv).map((k) => k.id)));

  const hent = () => { setBeskjed(null); start(async () => {
    const r = await refreshCalendarList();
    setBeskjed(r.ok ? { ok: true, tekst: `Hentet ${r.found} kalendere (${r.upserted} oppdatert, ${r.skipped} hoppet over).` } : { ok: false, tekst: r.error });
    if (r.ok) router.refresh();
  }); };

  const lagre = () => { setBeskjed(null); start(async () => {
    const r = await oppdaterSubscriptions(kalendere.map((k) => {
      const push = k.id === pushId;
      const pull = pullIds.has(k.id);
      return { id: k.id, syncPush: push, syncPull: pull, visIKalender: k.visIKalender, active: push || pull };
    }));
    setBeskjed(r.ok ? { ok: true, tekst: `Lagret for ${r.oppdatert} kalendere.` } : { ok: false, tekst: r.error });
    if (r.ok) router.refresh();
  }); };

  const kobleFra = () => { setFrakobling(false); start(async () => { await disconnectGoogleCalendar(); router.refresh(); }); };

  const vekslePull = (id: string) => setPullIds((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Seksjon tittel="Google Calendar" kilde="Opptatt tid kan aldri dobbeltbookes">
      {ok === "1" && <Varsel tone="ok">Google Calendar er koblet til. Velg hvilke kalendere du vil synke.</Varsel>}
      {error && <Varsel tone="advarsel" tittel="Koblingen feilet">{error.replace(/-/g, " ")}</Varsel>}
      {beskjed && <Varsel tone={beskjed.ok ? "ok" : "advarsel"}>{beskjed.tekst}</Varsel>}

      {!data.koblet ? (
        <Tom tittel="Ikke koblet til" tekst="Du sendes til Google for å gi tilgang. Appen leser og skriver i kalenderen for å unngå dobbeltbooking."
          handling={<KnappLenke variant="pri" href={KOBLE}>Koble til Google Calendar</KnappLenke>} />
      ) : (
        <>
          <div className="kort" style={{ display: "grid", gap: 12 }}>
            <b className="undertittel" style={{ overflowWrap: "anywhere" }}>Koblet til {data.epost}</b>
            <Nokkelverdier rader={[
              ["Status", data.status],
              ["Siste synk", data.sisteSynk ? TID.format(new Date(data.sisteSynk)) : "Aldri"],
              ["Kalendere", String(data.kalendere.length)],
              ...(data.sisteFeil ? [["Siste feil", data.sisteFeil] as const] : []),
            ]} />
            <div className="knapper">
              <KnappLenke href={KOBLE}>Koble på nytt</KnappLenke>
              <Knapp variant="sek" disabled={pending} onClick={hent}>{pending ? "Henter …" : "Hent kalenderlista"}</Knapp>
              <Knapp variant="spok" disabled={pending} onClick={() => setFrakobling(true)}>Koble fra</Knapp>
            </div>
          </div>

          {kalendere.length === 0 ? (
            <Tom tittel="Ingen kalendere funnet" tekst="Hent kalenderlista for å prøve igjen." />
          ) : (
            <>
              {kalendere.some((k) => k.feil) && (
                <Varsel tone="advarsel" tittel={`${kalendere.filter((k) => k.feil).length} kalender kan ikke nås`}>
                  Tilgangen er utgått. Koble Google på nytt. Til da blokkerer ikke disse kalenderne booking.
                </Varsel>
              )}
              <fieldset className="kort" style={{ display: "grid", gap: 8, margin: 0, minWidth: 0 }}>
                <legend className="undertittel" style={{ padding: 0 }}>Hvor legges nye bookinger?</legend>
                <p className="forklar">Når en kunde booker, lages hendelsen i denne kalenderen.</p>
                <div className="liste">
                  {kalendere.map((k) => (
                    <label key={k.id} style={{ opacity: k.feil ? 0.5 : 1, cursor: k.feil ? "not-allowed" : "pointer" }}>
                      <input type="radio" name="push-kalender" checked={pushId === k.id} disabled={!!k.feil} onChange={() => setPushId(k.id)} style={{ width: 20, height: 20, accentColor: "var(--graphite-900)" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><Prikk farge={k.farge} /><b style={{ overflowWrap: "anywhere" }}>{k.navn}</b></span>
                      {k.feil ? <span className="kilde">Ingen tilgang</span> : <span />}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="kort" style={{ display: "grid", gap: 8, margin: 0, minWidth: 0 }}>
                <legend className="undertittel" style={{ padding: 0 }}>Hvilke kalendere blokkerer booking?</legend>
                <p className="forklar">Tider med hendelser i disse kalenderne vises ikke som ledige.</p>
                <div className="liste">
                  {kalendere.map((k) => (
                    <label key={k.id} style={{ opacity: k.feil ? 0.5 : 1, cursor: k.feil ? "not-allowed" : "pointer" }}>
                      <input type="checkbox" checked={pullIds.has(k.id)} disabled={!!k.feil} onChange={() => vekslePull(k.id)} style={{ width: 20, height: 20, accentColor: "var(--graphite-900)" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><Prikk farge={k.farge} /><b style={{ overflowWrap: "anywhere" }}>{k.navn}</b></span>
                      {k.feil ? <span className="kilde">Ingen tilgang</span> : <span />}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="knapper"><Knapp disabled={pending} onClick={lagre}>{pending ? "Lagrer …" : "Lagre kalendervalg"}</Knapp></div>
            </>
          )}
        </>
      )}

      {frakobling && (
        <div className="dialog-lag" role="dialog" aria-modal="true" aria-labelledby="koble-fra-tittel">
          <div className="dialog">
            <h2 id="koble-fra-tittel">Koble fra Google Calendar?</h2>
            <p className="forklar">Bookinger legges ikke lenger i kalenderen, og hendelsene der blokkerer ikke booking.</p>
            <div className="knapper">
              <Knapp variant="sek" onClick={() => setFrakobling(false)}>Avbryt</Knapp>
              <Knapp variant="rust" onClick={kobleFra}>Koble fra</Knapp>
            </div>
          </div>
        </div>
      )}
    </Seksjon>
  );
}
