"use client";

/**
 * Kalenderhendelse (ferie, stengt anlegg, møte) i Precision, 29.09.2026:
 * /admin/kalender/hendelse/ny og /admin/kalender/hendelse/[id].
 *
 * Samme handlinger som før: opprettHendelse og slettHendelse, pluss ny
 * oppdaterHendelse (samme tilgangsregel som sletting, oppdaterer Google).
 * Tid sendes som «YYYY-MM-DDTHH:mm» og tolkes på serveren som Oslo-veggklokke.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Knapp, Meta } from "@/components/precision/pa";
import { Dialogboks, Kort, Nedtrekk, Nokkelverdi, Skjemafelt, Tekstfelt, TekstOmrade } from "@/components/precision/pa-a4";
import { Datofelt, tidsvalg } from "@/components/precision/pa-booking";
import { opprettHendelse, oppdaterHendelse, slettHendelse } from "@/lib/kalender-hendelse/actions";
import "@/styles/precision-a4.css";

/** Hele døgnet i kvartersteg (00:00–23:45). */
const TIDER = [...tidsvalg(0, 23), ...["23:15", "23:30", "23:45"].map((v) => ({ value: v, label: v }))];

const erRedirect = (e: unknown) => e instanceof Error && e.message.includes("NEXT_REDIRECT");

function pluss60(tid: string): string {
  const [h, m] = tid.split(":").map(Number);
  const t = Math.min(23 * 60 + 45, h * 60 + m + 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export type HendelseVerdier = { tittel: string; startDato: string; startTid: string; sluttDato: string; sluttTid: string; notat: string };

export function HendelseSkjema({ id, start, onAvbryt }: { id?: string; start: HendelseVerdier; onAvbryt?: () => void }) {
  const router = useRouter();
  const [pending, startT] = useTransition();
  const [v, setV] = useState<HendelseVerdier>(start);
  const [feil, setFeil] = useState<string | null>(null);
  const medTid = (t: string) => (TIDER.some((o) => o.value === t) ? TIDER : [{ value: t, label: t }, ...TIDER]);

  const lagre = () => {
    setFeil(null);
    if (!v.tittel.trim()) { setFeil("Tittel er påkrevd."); return; }
    const startAt = `${v.startDato}T${v.startTid}`;
    const endAt = `${v.sluttDato}T${v.sluttTid}`;
    const gyldig = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!gyldig.test(startAt) || !gyldig.test(endAt)) { setFeil("Velg dato og klokkeslett."); return; }
    // Strengene sammenlignes leksikalsk (samme format), uten tidssone-tolkning i nettleseren.
    if (endAt <= startAt) { setFeil("Slutt må være etter start."); return; }
    const input = { title: v.tittel.trim(), startAt, endAt, notes: v.notat.trim() || undefined };
    startT(async () => {
      try {
        if (id) await oppdaterHendelse(id, input);
        else await opprettHendelse(input);
      } catch (e) {
        if (erRedirect(e)) return;
        setFeil(e instanceof Error ? e.message : "Kunne ikke lagre hendelsen.");
      }
    });
  };

  return (
    <Kort>
      <Skjemafelt label="Tittel" required><Tekstfelt value={v.tittel} onChange={(t) => setV({ ...v, tittel: t.slice(0, 200) })} placeholder="Ferie, stengt anlegg, møte …" /></Skjemafelt>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 12 }}>
        <Skjemafelt label="Startdato"><Datofelt value={v.startDato} onChange={(d) => setV({ ...v, startDato: d, sluttDato: v.sluttDato < d ? d : v.sluttDato })} /></Skjemafelt>
        <Skjemafelt label="Start"><Nedtrekk value={v.startTid} onChange={(t) => setV({ ...v, startTid: t, sluttTid: v.startDato === v.sluttDato && v.sluttTid <= t ? pluss60(t) : v.sluttTid })} options={medTid(v.startTid)} /></Skjemafelt>
        <Skjemafelt label="Sluttdato"><Datofelt value={v.sluttDato} min={v.startDato} onChange={(d) => setV({ ...v, sluttDato: d })} /></Skjemafelt>
        <Skjemafelt label="Slutt"><Nedtrekk value={v.sluttTid} onChange={(t) => setV({ ...v, sluttTid: t })} options={medTid(v.sluttTid)} /></Skjemafelt>
      </div>
      <Skjemafelt label="Notat (valgfritt)"><TekstOmrade value={v.notat} onChange={(n) => setV({ ...v, notat: n.slice(0, 2000) })} placeholder="—" /></Skjemafelt>
      {feil && <p role="alert" className="a4-feil">{feil}</p>}
      <Meta>HENDELSEN BLOKKERER BOOKING I TIDSROMMET OG LEGGES I GOOGLE-KALENDEREN NÅR DEN ER KOBLET</Meta>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Knapp icon={Check} iconName="check" loading={pending} onClick={lagre}>{id ? "Lagre endringer" : "Lagre hendelse"}</Knapp>
        <Knapp variant="ghost" onClick={() => (onAvbryt ? onAvbryt() : router.push("/admin/kalender"))}>Avbryt</Knapp>
      </div>
    </Kort>
  );
}

export function HendelseDetalj({ id, tid, notat, kanEndre, verdier }: {
  id: string; tid: string; notat: string | null; kanEndre: boolean; verdier: HendelseVerdier;
}) {
  const [endre, setEndre] = useState(false);
  const [slett, setSlett] = useState(false);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  if (endre) return <HendelseSkjema id={id} start={verdier} onAvbryt={() => setEndre(false)} />;

  return (
    <Kort>
      <Nokkelverdi items={[["Tid", tid, {}], ["Notat", notat, {}]]} />
      {feil && <p role="alert" className="a4-feil">{feil}</p>}
      {kanEndre ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp variant="secondary" icon={Pencil} iconName="pencil" onClick={() => setEndre(true)}>Endre hendelse</Knapp>
          <Knapp variant="ghost" icon={Trash2} iconName="trash-2" onClick={() => setSlett(true)}>Slett hendelse</Knapp>
        </div>
      ) : (
        <Meta>BARE EIEREN AV HENDELSEN ELLER EN ADMIN KAN ENDRE ELLER SLETTE DEN</Meta>
      )}
      <Dialogboks
        open={slett}
        onClose={() => setSlett(false)}
        title="Slette hendelsen?"
        footer={<>
          <Knapp variant="ghost" onClick={() => setSlett(false)}>Avbryt</Knapp>
          <Knapp variant="signal" icon={Trash2} iconName="trash-2" loading={pending} loadingText="Sletter …" onClick={() => start(async () => {
            try { await slettHendelse(id); } catch (e) { if (erRedirect(e)) return; setFeil(e instanceof Error ? e.message : "Kunne ikke slette."); setSlett(false); }
          })}>Ja, slett</Knapp>
        </>}
      >
        <p style={{ margin: 0 }}>Hendelsen fjernes fra kalenderen og fra Google-kalenderen. Tiden blir ledig for booking igjen.</p>
      </Dialogboks>
    </Kort>
  );
}
