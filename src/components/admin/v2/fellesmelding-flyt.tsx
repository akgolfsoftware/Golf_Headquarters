"use client";

/**
 * Fellesmelding til turneringsdeltakere (D1) — AgencyOS turneringsdetalj.
 * Coachen sender ÉN melding til alle/utvalgte deltakere uten å åpne hver
 * samtale. 3 steg i ett modal-panel (bunn-ark på mobil):
 *   1. Velg mottakere (forhåndsvalgt ALLE, av/på per spiller)
 *   2. Skriv (TekstOmraade + mal-snarveier + forhåndsvisning)
 *   3. Send (bekreftelsesrad + lime Send-CTA + kvittering m/ «Se tråden»)
 *
 * Data: eksisterende TournamentEntry (deltakere) + meldings-infrastrukturen
 * via sendFellesmelding (CoachingSession DIRECT + Notification). Ingen ny
 * datamodell. Alt bygget på v2-primitiver + T-tokens — ingen rå hex.
 */

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { T, Caps, AvatarInit, StatusPill, TomTilstand, type StatusTone } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { TurneringModal, ModalFeil, useMobile } from "@/components/admin/v2/turnering-ui";
import { sendFellesmelding, type FellesmeldingResultat } from "@/app/admin/tournaments/actions";

export type FellesmeldingDeltaker = {
  userId: string;
  navn: string;
  /** TournamentEntryStatus: PLANNED | CONFIRMED | WITHDRAWN | COMPLETED | DNF */
  status: string;
};

/** Ærlige klarspråk-etiketter for påmeldingsstatus — ingen oppdiktet «venteliste». */
const STATUS_LABEL: Record<string, { l: string; tone: StatusTone }> = {
  PLANNED: { l: "Påmeldt", tone: "info" },
  CONFIRMED: { l: "Bekreftet", tone: "up" },
  WITHDRAWN: { l: "Trukket", tone: "down" },
  COMPLETED: { l: "Gjennomført", tone: "lime" },
  DNF: { l: "DNF", tone: "warn" },
};

/** Korte standard-maler (ingen skjermtekst-kilde finnes for D1 ennå). Coachen
 *  redigerer fritt før sending — tidspunktet er kun en plassholder. */
const MALER: { id: string; navn: string; ikon: string; tekst: string }[] = [
  {
    id: "oppmote",
    navn: "Oppmøtetid",
    ikon: "clock",
    tekst:
      "Oppmøte kl. 07:30 ved klubbhuset. Vær klar 15 minutter før første start, og husk gyldig medlemskort.",
  },
  {
    id: "vaeravlys",
    navn: "Væravlysning",
    ikon: "wind",
    tekst:
      "Runden er dessverre avlyst på grunn av været. Vi kommer tilbake med ny dato så snart vi vet mer.",
  },
];

type Steg = "velg" | "skriv" | "send";

export function FellesmeldingFlyt({
  turneringId,
  turneringNavn,
  deltakere,
}: {
  turneringId: string;
  turneringNavn: string;
  deltakere: FellesmeldingDeltaker[];
}) {
  const mobile = useMobile();
  const [open, setOpen] = useState(false);
  const tom = deltakere.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={tom}
        className="v2-press v2-focus"
        title={tom ? "Ingen påmeldte deltakere å sende til" : undefined}
        style={{
          appearance: "none",
          cursor: tom ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          borderRadius: 9999,
          padding: "9px 16px",
          fontFamily: T.ui,
          fontSize: 12.5,
          fontWeight: 600,
          color: tom ? T.mut : T.fg,
          background: T.panel3,
          border: `1px solid ${T.borderS}`,
          opacity: tom ? 0.5 : 1,
          whiteSpace: "nowrap",
        }}
      >
        <Icon name="megaphone" size={14} />
        {mobile ? "Fellesmelding" : "Send fellesmelding"}
      </button>

      {open && (
        <FellesmeldingModal
          turneringId={turneringId}
          turneringNavn={turneringNavn}
          deltakere={deltakere}
          onLukk={() => setOpen(false)}
        />
      )}
    </>
  );
}

function FellesmeldingModal({
  turneringId,
  turneringNavn,
  deltakere,
  onLukk,
}: {
  turneringId: string;
  turneringNavn: string;
  deltakere: FellesmeldingDeltaker[];
  onLukk: () => void;
}) {
  const [steg, setSteg] = useState<Steg>("velg");
  // Forhåndsvalgt ALLE deltakere (brief D1, steg 1).
  const [valgt, setValgt] = useState<Set<string>>(() => new Set(deltakere.map((d) => d.userId)));
  const [tekst, setTekst] = useState("");
  const [resultat, setResultat] = useState<FellesmeldingResultat | null>(null);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const antallValgt = valgt.size;
  const kanSkrive = antallValgt > 0;
  const kanSende = kanSkrive && tekst.trim().length > 0;
  const tom = deltakere.length === 0;

  const valgteIds = useMemo(() => Array.from(valgt), [valgt]);

  function toggle(userId: string) {
    setValgt((prev) => {
      const neste = new Set(prev);
      if (neste.has(userId)) neste.delete(userId);
      else neste.add(userId);
      return neste;
    });
  }

  function velgAlle(alle: boolean) {
    setValgt(alle ? new Set(deltakere.map((d) => d.userId)) : new Set());
  }

  function send(ids: string[]) {
    setFeilmelding(null);
    startTransition(async () => {
      const res = await sendFellesmelding({
        turneringId,
        spillerIds: ids,
        tekst: tekst.trim(),
      });
      if (res.error) {
        setFeilmelding(res.error);
        return;
      }
      setResultat(res);
    });
  }

  // ── Kvittering (etter fullført sending) ───────────────────────────
  if (resultat) {
    const delvis = resultat.feilet.length > 0;
    return (
      <TurneringModal title={turneringNavn} eyebrow="Fellesmelding · Kvittering" onLukk={onLukk} wide>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 14,
            padding: "10px 0 4px",
          }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: `color-mix(in srgb, ${delvis ? T.warn : T.up} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${delvis ? T.warn : T.up} 32%, transparent)`,
            }}
          >
            <Icon name={delvis ? "triangle-alert" : "check"} size={22} style={{ color: delvis ? T.warn : T.up }} />
          </span>
          <div>
            <h3 style={{ fontFamily: T.disp, fontSize: 17, fontWeight: 700, color: T.fg, margin: 0 }}>
              {resultat.sendt} melding{resultat.sendt === 1 ? "" : "er"} sendt
            </h3>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "6px 0 0" }}>
              Landet i PlayerHQ-innboksen til {resultat.sendt} spiller{resultat.sendt === 1 ? "" : "e"}.
            </p>
          </div>
        </div>

        {delvis && (
          <ModalFeil>
            {resultat.feilet.length} av {resultat.sendt + resultat.feilet.length} feilet:{" "}
            {resultat.feilet.map((f) => f.navn).join(", ")}. Prøv de som feilet på nytt.
          </ModalFeil>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
          <Link
            href="/admin/innboks"
            className="v2-press v2-focus"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              borderRadius: 9999,
              padding: "9px 16px",
              fontFamily: T.ui,
              fontSize: 12.5,
              fontWeight: 600,
              color: T.fg,
              background: T.panel3,
              border: `1px solid ${T.borderS}`,
            }}
          >
            <Icon name="message-circle" size={14} />
            Se tråden
          </Link>
          <span style={{ marginLeft: "auto" }} />
          {delvis && (
            <button
              type="button"
              onClick={() => {
                const feiletIds = resultat.feilet.map((f) => f.userId);
                setResultat(null);
                send(feiletIds);
              }}
              disabled={pending}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: pending ? "default" : "pointer",
                borderRadius: 9999,
                padding: "9px 18px",
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 700,
                color: T.onLime,
                background: T.lime,
                border: "none",
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? "Sender…" : "Prøv igjen"}
            </button>
          )}
          <button
            type="button"
            onClick={onLukk}
            className="v2-press v2-focus"
            style={{
              appearance: "none",
              cursor: "pointer",
              borderRadius: 9999,
              padding: "9px 18px",
              fontFamily: T.ui,
              fontSize: 12.5,
              fontWeight: delvis ? 600 : 700,
              color: delvis ? T.fg : T.onLime,
              background: delvis ? T.panel3 : T.lime,
              border: delvis ? `1px solid ${T.borderS}` : "none",
            }}
          >
            Ferdig
          </button>
        </div>
      </TurneringModal>
    );
  }

  const eyebrow =
    steg === "velg" ? "Fellesmelding · 1 av 3" : steg === "skriv" ? "Fellesmelding · 2 av 3" : "Fellesmelding · 3 av 3";

  return (
    <TurneringModal title={turneringNavn} eyebrow={eyebrow} onLukk={onLukk} wide busy={pending}>
      {tom ? (
        <TomTilstand
          icon="users"
          title="Ingen påmeldte deltakere"
          sub="Meld på spillere øverst på turneringssiden før du sender en fellesmelding."
        />
      ) : (
        <>
          {/* ── Steg 1: velg mottakere ─────────────────────────── */}
          {steg === "velg" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>
                  {antallValgt} av {deltakere.length} valgt
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <MiniLenke onClick={() => velgAlle(true)}>Velg alle</MiniLenke>
                  <span style={{ color: T.border }}>·</span>
                  <MiniLenke onClick={() => velgAlle(false)}>Fjern alle</MiniLenke>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  background: T.panel2,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {deltakere.map((d, i) => {
                  const av = valgt.has(d.userId);
                  const st = STATUS_LABEL[d.status] ?? { l: d.status, tone: "info" as StatusTone };
                  return (
                    <button
                      key={d.userId}
                      type="button"
                      onClick={() => toggle(d.userId)}
                      className="v2-focus"
                      style={{
                        appearance: "none",
                        width: "100%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        padding: "10px 13px",
                        background: "transparent",
                        border: "none",
                        borderBottom: i === deltakere.length - 1 ? "none" : `1px solid ${T.border}`,
                        textAlign: "left",
                      }}
                    >
                      <Avkryss av={av} />
                      <AvatarInit navn={d.navn} size={32} />
                      <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.navn}
                      </span>
                      <StatusPill tone={st.tone}>{st.l}</StatusPill>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Steg 2: skriv ──────────────────────────────────── */}
          {steg === "skriv" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {MALER.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTekst(m.tekst)}
                    className="v2-press v2-focus"
                    style={{
                      appearance: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 9999,
                      padding: "7px 13px",
                      fontFamily: T.ui,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: T.fg2,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <Icon name={m.ikon} size={12} style={{ color: T.mut }} />
                    {m.navn}
                  </button>
                ))}
              </div>

              <label>
                <Caps size={9} style={{ marginBottom: 7 }}>Melding</Caps>
                <textarea
                  value={tekst}
                  onChange={(e) => setTekst(e.target.value)}
                  rows={6}
                  autoFocus
                  placeholder="Skriv beskjeden til deltakerne …"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: T.panel2,
                    border: `1px solid ${T.borderS}`,
                    borderRadius: 12,
                    padding: "11px 13px",
                    fontFamily: T.ui,
                    fontSize: 14,
                    color: T.fg,
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.55,
                  }}
                />
              </label>

              {tekst.trim() && (
                <div>
                  <Caps size={9} style={{ marginBottom: 8 }}>Slik lander den hos spilleren</Caps>
                  <ForhandsBoble tekst={tekst.trim()} />
                </div>
              )}
            </div>
          )}

          {/* ── Steg 3: send ───────────────────────────────────── */}
          {steg === "send" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  borderRadius: 12,
                  background: T.panel2,
                  border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${T.lime}`,
                  padding: "13px 15px",
                }}
              >
                <Icon name="users" size={16} style={{ color: T.lime, flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 13, color: T.fg }}>
                  Sendes til <strong>{antallValgt} spiller{antallValgt === 1 ? "" : "e"}</strong> som melding i
                  PlayerHQ-innboksen.
                </span>
              </div>

              <ForhandsBoble tekst={tekst.trim()} />

              {feilmelding && <ModalFeil>{feilmelding}</ModalFeil>}
            </div>
          )}

          {/* ── Fot: navigasjon ────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
            <button
              type="button"
              onClick={steg === "velg" ? onLukk : () => setSteg(steg === "send" ? "skriv" : "velg")}
              disabled={pending}
              className="v2-press v2-focus"
              style={{
                appearance: "none",
                cursor: pending ? "default" : "pointer",
                borderRadius: 9999,
                padding: "9px 16px",
                fontFamily: T.ui,
                fontSize: 12.5,
                fontWeight: 600,
                color: T.fg,
                background: T.panel3,
                border: `1px solid ${T.borderS}`,
                opacity: pending ? 0.6 : 1,
              }}
            >
              {steg === "velg" ? "Avbryt" : "Tilbake"}
            </button>
            <span style={{ marginLeft: "auto" }} />
            {steg === "velg" && (
              <NesteKnapp disabled={!kanSkrive} onClick={() => setSteg("skriv")}>
                Neste
              </NesteKnapp>
            )}
            {steg === "skriv" && (
              <NesteKnapp disabled={tekst.trim().length === 0} onClick={() => setSteg("send")}>
                Neste
              </NesteKnapp>
            )}
            {steg === "send" && (
              <button
                type="button"
                onClick={() => send(valgteIds)}
                disabled={!kanSende || pending}
                className="v2-press v2-focus"
                style={{
                  appearance: "none",
                  cursor: !kanSende || pending ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  borderRadius: 9999,
                  padding: "9px 20px",
                  fontFamily: T.ui,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: T.onLime,
                  background: T.lime,
                  border: "none",
                  opacity: !kanSende || pending ? 0.6 : 1,
                }}
              >
                <Icon name="send" size={14} />
                {pending ? "Sender…" : `Send til ${antallValgt}`}
              </button>
            )}
          </div>
        </>
      )}
    </TurneringModal>
  );
}

/* ── Små byggeklosser ─────────────────────────────────────── */

function NesteKnapp({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="v2-press v2-focus"
      style={{
        appearance: "none",
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 9999,
        padding: "9px 18px",
        fontFamily: T.ui,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg,
        background: T.panel3,
        border: `1px solid ${T.borderS}`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
      <Icon name="arrow-right" size={13} />
    </button>
  );
}

function MiniLenke({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-focus"
      style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.lime }}
    >
      {children}
    </button>
  );
}

function Avkryss({ av }: { av: boolean }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: av ? T.lime : "transparent",
        border: av ? "1px solid transparent" : `1.5px solid ${T.borderS}`,
      }}
    >
      {av && <Icon name="check" size={13} style={{ color: T.onLime }} />}
    </span>
  );
}

/** Forhåndsvisning av meldingsboblen slik den lander i spillerens innboks. */
function ForhandsBoble({ tekst }: { tekst: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9999,
          background: `color-mix(in srgb, ${T.lime} 16%, transparent)`,
          border: `1px solid color-mix(in srgb, ${T.lime} 30%, transparent)`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <Icon name="user" size={16} style={{ color: T.lime }} />
      </span>
      <div
        style={{
          maxWidth: "86%",
          background: T.panel2,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          borderBottomLeftRadius: 5,
          padding: "12px 14px",
          fontFamily: T.ui,
          fontSize: 14,
          lineHeight: 1.55,
          color: T.fg,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {tekst}
      </div>
    </div>
  );
}
