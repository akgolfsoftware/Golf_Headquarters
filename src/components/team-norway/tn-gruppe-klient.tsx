"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, FileText, Plus } from "lucide-react";

import { TN } from "@/lib/v2/team-norway";
import { hentLesekvitteringNavnAction, merkPostLestAction, sendPaaminnelseAction, type LesekvitteringNavnSvar } from "@/app/team-norway/tn-post-actions";
import { endrePostAction, slettPostAction } from "@/app/team-norway/tn-redigering-actions";
import { TnKnapperekke, TnSkjemaArk, TnSlettKnapp, TnTekstfelt } from "./tn-handlinger";

/**
 * Klientdelene av TN-13 Gruppeposter og TN-14 Dokumenter.
 * Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-13 og TN-14.
 * Avvik:
 *   - Avvikene for hver skjerm står i tn-gruppeposter-skjerm.tsx og tn-dokumenter-skjerm.tsx.
 */

type Feilbart = { ok: true } | { ok: false; feil: string };

const MAKS_TEGN = 2000;

const seksjonstittel: CSSProperties = { fontFamily: TN.font.display, fontWeight: 400, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: TN.navy900, margin: 0 };
const etikett: CSSProperties = { fontFamily: TN.font.display, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: TN.textSecondary };
const sekundaerKnapp: CSSProperties = { minHeight: 44, padding: "0 14px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontFamily: TN.font.display, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" };
const primaerKnapp: CSSProperties = { minHeight: 44, padding: "0 18px", border: "none", borderRadius: TN.radius.sm, background: TN.navy900, color: TN.white, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" };
const feilboks: CSSProperties = { marginTop: 12, padding: "10px 12px", borderLeft: `3px solid ${TN.status.redText}`, background: TN.status.redBg, color: TN.status.redText, fontSize: 14 };

const OSLO = { timeZone: "Europe/Oslo" } as const;
const tidFormat = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", ...OSLO });

function tid(iso: string) {
  return tidFormat.format(new Date(iso)).replace(",", "");
}

/** «Nytt innlegg» — bare trenere i gruppen ser skjemaet. */
export function TnInnleggSkjema({ send, forfatterNavn, mottakere }: { send: (input: { tekst: string; kind: string }) => Promise<Feilbart>; forfatterNavn: string; mottakere: string }) {
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publiser() {
    const t = tekst.trim();
    if (pending) return;
    if (t.length < 3) return setFeil("Skriv minst én setning før du publiserer.");
    if (t.length > MAKS_TEGN) return setFeil(`Innlegget er for langt. Maks ${MAKS_TEGN} tegn.`);
    setFeil(null);
    startTransition(async () => {
      const svar = await send({ tekst: t, kind: "TEKST" });
      if (!svar.ok) return setFeil(svar.feil);
      setTekst("");
    });
  }

  return (
    <section id="ny-post" style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline", paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>
        <h2 style={seksjonstittel}>Nytt innlegg</h2>
        <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary, textTransform: "uppercase", overflowWrap: "anywhere" }}>Som {forfatterNavn}</span>
      </div>
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        rows={4}
        placeholder="Skriv til gruppen. Kort og konkret."
        aria-label="Nytt innlegg"
        aria-invalid={feil ? true : undefined}
        style={{ width: "100%", marginTop: 14, padding: 12, border: `1px solid ${feil ? TN.status.redText : TN.borderDefault}`, borderRadius: TN.radius.xs, fontSize: 16, lineHeight: 1.55, resize: "vertical", color: TN.textPrimary, background: TN.white, fontFamily: TN.font.body, display: "block" }}
      />
      <div style={{ ...etikett, marginTop: 14 }}>Mottakere</div>
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ minHeight: 44, padding: "0 16px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: TN.navy900, color: TN.white, fontFamily: TN.font.display, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", maxWidth: "100%", overflowWrap: "anywhere" }}>
          {mottakere}
        </span>
      </div>
      {feil ? <div role="alert" style={feilboks}>{feil}</div> : null}
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: TN.font.mono, fontSize: 12, color: tekst.length > MAKS_TEGN ? TN.status.redText : TN.textSecondary }}>{tekst.length} / {MAKS_TEGN}</span>
        <button type="button" onClick={publiser} disabled={pending} style={{ ...primaerKnapp, opacity: pending ? 0.6 : 1 }}>{pending ? "Publiserer …" : "Publiser"}</button>
      </div>
    </section>
  );
}

export type TnInnlegg = {
  id: string;
  forfatter: string;
  rolle: string;
  tidIso: string;
  tekst: string;
  vedlegg: { id: string; fileName: string }[];
  totalt: number;
  lest: number;
  /** Sendt påminnelse, eller null. Bare med i trenerens visning. */
  paaminnelse: { sendtAtIso: string; antall: number } | null;
  endret: boolean;
  /** Forfatteren kan endre. Forfatteren og trener kan slette. Serveren sjekker på nytt. */
  kanEndre: boolean;
  kanSlette: boolean;
};

/** Kvitterer innlegget som lest når spiller eller foresatt ser det. */
function KvitterVedVisning({ postId }: { postId: string }) {
  useEffect(() => {
    void merkPostLestAction(postId);
  }, [postId]);
  return null;
}

export function TnInnleggKort({ innlegg, visHvem, kvitter }: { innlegg: TnInnlegg; visHvem: boolean; kvitter: boolean }) {
  const [apent, setApent] = useState(false);
  const [data, setData] = useState<LesekvitteringNavnSvar>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [paaminnelse, setPaaminnelse] = useState(innlegg.paaminnelse);
  const [paaminnelseFeil, setPaaminnelseFeil] = useState<string | null>(null);
  const [sender, startSending] = useTransition();
  const andel = innlegg.totalt ? (innlegg.lest / innlegg.totalt) * 100 : 0;

  function veksle() {
    const neste = !apent;
    setApent(neste);
    if (!neste || data) return;
    startTransition(async () => {
      setFeil(null);
      try {
        const svar = await hentLesekvitteringNavnAction(innlegg.id);
        if (!svar) setFeil("Du har ikke tilgang til lesekvitteringen.");
        setData(svar);
      } catch {
        setFeil("Lesekvitteringen kunne ikke hentes. Prøv igjen.");
      }
    });
  }

  function paaminn() {
    if (sender) return;
    setPaaminnelseFeil(null);
    startSending(async () => {
      const svar = await sendPaaminnelseAction(innlegg.id);
      if (!svar.ok) return setPaaminnelseFeil(svar.feil);
      setPaaminnelse({ sendtAtIso: svar.sendtAtIso, antall: svar.antall });
    });
  }

  return (
    <article style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", minWidth: 0 }}>
      {kvitter ? <KvitterVedVisning postId={innlegg.id} /> : null}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Initialer navn={innlegg.forfatter} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "baseline" }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, overflowWrap: "anywhere" }}>{innlegg.forfatter}</span>
            <span style={{ fontFamily: TN.font.mono, fontSize: 10.5, letterSpacing: "0.06em", color: TN.textSecondary, textTransform: "uppercase" }}>{innlegg.rolle} · {tid(innlegg.tidIso)}{innlegg.endret ? " · endret" : ""}</span>
          </div>
          <div style={{ marginTop: 6, display: "flex" }}>
            <span style={{ fontSize: 12, padding: "3px 8px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.xs }}>Til hele gruppen</span>
          </div>
        </div>
      </div>
      {innlegg.tekst ? <p style={{ fontSize: 15, lineHeight: 1.62, margin: "12px 0 0", maxWidth: "66ch", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{innlegg.tekst}</p> : null}
      {innlegg.kanEndre || innlegg.kanSlette ? (
        <div style={{ marginTop: 8 }}>
          <TnKnapperekke>
            {innlegg.kanEndre ? (
              <TnSkjemaArk knapp="Endre" knappVariant="tekst" tittel="Endre innlegg" lagreTekst="Lagre endringer" send={(v) => endrePostAction(innlegg.id, v.tekst)}>
                <TnTekstfelt etikett="Innlegg" navn="tekst" standard={innlegg.tekst} maks={2000} rader={6} />
              </TnSkjemaArk>
            ) : null}
            {innlegg.kanSlette ? (
              <TnSlettKnapp knapp="Slett" variant="tekst" tittel="Slett innlegg" tekst="Innlegget og vedleggene slettes for hele gruppen. Lesekvitteringene forsvinner også." bekreft="Slett innlegget" handling={() => slettPostAction(innlegg.id)} />
            ) : null}
          </TnKnapperekke>
        </div>
      ) : null}
      {innlegg.vedlegg.length > 0 ? (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {innlegg.vedlegg.map((v) => (
            <a key={v.id} href={`/api/team-norway/vedlegg/${encodeURIComponent(v.id)}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 8, padding: "0 12px", border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm, color: TN.navy900, fontSize: 14, textDecoration: "none", maxWidth: "100%", minWidth: 0 }}>
              <FileText size={16} aria-hidden="true" style={{ flex: "none" }} />
              <span style={{ overflowWrap: "anywhere" }}>{v.fileName}</span>
            </a>
          ))}
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TN.navy100}` }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <div style={{ fontFamily: TN.font.mono, fontSize: 12.5 }}>{innlegg.lest} av {innlegg.totalt} har lest</div>
          <div style={{ height: 4, background: TN.navy100, borderRadius: TN.radius.xs, marginTop: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${andel}%`, background: TN.navy900 }} />
          </div>
        </div>
        {visHvem ? (
          <button type="button" onClick={veksle} aria-expanded={apent} style={sekundaerKnapp}>
            {apent ? "Skjul" : "Se hvem"}
            <ChevronDown size={14} aria-hidden="true" style={{ transform: apent ? "rotate(180deg)" : undefined }} />
          </button>
        ) : null}
        {visHvem && !paaminnelse && innlegg.lest < innlegg.totalt ? (
          <button type="button" onClick={paaminn} disabled={sender} style={{ ...sekundaerKnapp, opacity: sender ? 0.6 : 1 }}>
            {sender ? "Sender …" : "Send påminnelse"}
          </button>
        ) : null}
        {visHvem && paaminnelse ? (
          <span role="status" style={{ fontSize: 13, color: TN.navy900 }}>
            Påminnelse sendt {tid(paaminnelse.sendtAtIso)} til {paaminnelse.antall}
          </span>
        ) : null}
      </div>
      {paaminnelseFeil ? <div role="alert" style={feilboks}>{paaminnelseFeil}</div> : null}
      {apent ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16, marginTop: 14 }}>
          {pending ? <div style={{ fontSize: 14, color: TN.textSecondary }}>Henter …</div> : null}
          {feil ? <div role="alert" style={{ fontSize: 14, color: TN.status.redText }}>{feil}</div> : null}
          {data ? (
            <>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...etikett, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Lest · {data.apnet.length}</div>
                {data.apnet.map((r) => (
                  <div key={r.userId} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${TN.navy100}`, fontSize: 14 }}>
                    <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{r.navn}</span>
                    <span style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary, whiteSpace: "nowrap" }}>{tid(r.readAt)}</span>
                  </div>
                ))}
                {data.apnet.length === 0 ? <div style={{ padding: "8px 0", fontSize: 14, color: TN.textSecondary }}>Ingen har lest ennå.</div> : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...etikett, paddingBottom: 6, borderBottom: `1px solid ${TN.navy100}` }}>Ikke lest · {data.mangler.length}</div>
                {data.mangler.map((r) => (
                  <div key={r.userId} style={{ padding: "8px 0", borderBottom: `1px solid ${TN.navy100}`, fontSize: 14, overflowWrap: "anywhere" }}>{r.navn}</div>
                ))}
                {data.mangler.length === 0 ? <div style={{ padding: "8px 0", fontSize: 14, color: TN.textSecondary }}>Alle har lest.</div> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Initialer({ navn }: { navn: string }) {
  const tegn = navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() ?? "").join("");
  return (
    <span aria-hidden="true" style={{ width: 44, height: 44, flex: "none", borderRadius: TN.radius.xs, background: TN.navy50, border: `1px solid ${TN.navy100}`, color: TN.navy900, fontFamily: TN.font.display, fontSize: 14, letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {tegn || "?"}
    </span>
  );
}

/**
 * «Last opp dokument» — går via den avgrensede POST-ruten
 * (`/api/team-norway/dokumenter`), aldri via server action, så størrelsesgrensen
 * gjelder bare denne ruten.
 */
export function TnDokumentSkjema({ groupId, maksMb, kategorier }: { groupId: string; maksMb: number; kategorier: string[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fil, setFil] = useState<File | null>(null);
  const [kategori, setKategori] = useState(kategorier[0] ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function lastOpp() {
    if (pending) return;
    if (!fil) return (setMelding(null), setFeil("Velg en fil først."));
    if (fil.size > maksMb * 1024 * 1024) return (setMelding(null), setFeil(`Filen er for stor. Maks ${maksMb} MB.`));
    setFeil(null);
    setMelding(null);
    const form = new FormData();
    form.set("file", fil);
    form.set("kategori", kategori);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/team-norway/dokumenter?groupId=${encodeURIComponent(groupId)}`, { method: "POST", body: form });
        if (!(res.headers.get("content-type") ?? "").includes("application/json")) throw new Error("Opplasting feilet");
        const svar: Feilbart = await res.json();
        if (!svar.ok) return setFeil(svar.feil);
        setMelding(`Lastet opp: ${fil.name}`);
        setFil(null);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } catch {
        setFeil("Opplastingen feilet. Prøv igjen.");
      }
    });
  }

  return (
    <section style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline", paddingBottom: 12, borderBottom: `2px solid ${TN.navy900}` }}>
        <h2 style={seksjonstittel}>Last opp dokument</h2>
        <span style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary }}>PDF, XLSX, JPG, PNG · MAKS {maksMb} MB</span>
      </div>
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <span style={etikett}>Fil</span>
          <label style={{ marginTop: 6, minHeight: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", border: `1px dashed ${TN.borderDefault}`, borderRadius: TN.radius.xs, cursor: "pointer", color: fil ? TN.textPrimary : TN.textSecondary, fontSize: 14, minWidth: 0 }}>
            <Plus size={16} aria-hidden="true" style={{ flex: "none" }} />
            <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{fil ? fil.name : "Velg fil"}</span>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.xlsx"
              aria-label="Velg fil"
              disabled={pending}
              onChange={(e) => (setFil(e.target.files?.[0] ?? null), setFeil(null), setMelding(null))}
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            />
          </label>
        </div>
        <label style={{ flex: "0 1 200px", minWidth: 0 }}>
          <span style={etikett}>Kategori</span>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)} disabled={pending} style={{ marginTop: 6, width: "100%", minHeight: 44, padding: "0 12px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.xs, background: TN.white, color: TN.textPrimary, fontFamily: TN.font.body, fontSize: 16 }}>
            {kategorier.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <button type="button" onClick={lastOpp} disabled={pending} style={{ ...primaerKnapp, opacity: pending ? 0.6 : 1 }}>{pending ? "Laster opp …" : "Last opp"}</button>
      </div>
      {feil ? <div role="alert" style={feilboks}>{feil}</div> : null}
      {melding ? (
        <div role="status" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: TN.navy900 }}>
          <Check size={16} aria-hidden="true" style={{ flex: "none" }} />
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{melding}</span>
        </div>
      ) : null}
    </section>
  );
}
