"use client";

/**
 * D1 — Fellesmelding til turneringsdeltakere (bolk 5, godkjent av Anders 17. jul 2026).
 * Port av fasit ui_kits/v2/agencyos-fellesmelding.jsx: 3-stegs panel fra
 * turneringsdetaljen — velg mottakere (teller, Alle/Ingen) → skriv (mal-snarveier
 * + forhåndsvisnings-boble) → send (bekreftelsesrad, lime Send-CTA — skjermens
 * ENESTE lime-CTA, sender-tilstand, kvittering, delvis feil m/ «Prøv igjen for N»).
 * Desktop: høyre-panel (drawer). Mobil: fullskjerm-ark. Tom deltakerliste =
 * ærlig tomtilstand uten send. Data: TournamentEntry + meldings-infrastrukturen
 * (sendFellesmeldingTilDeltakere → CoachingSession DIRECT per spiller) — ingen
 * ny datamodell. Mottaker-avkryssing bruker hvit valgt-tilstand (lime er
 * reservert Send-CTA-en).
 */

import { Fragment, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { T, Caps, Knapp, TomTilstand, AvatarInit, HjelpTips } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { useMobile } from "@/components/admin/v2/turnering-ui";
import { sendFellesmeldingTilDeltakere } from "@/app/admin/tournaments/actions";

export type FellesmeldingDeltaker = {
  userId: string;
  navn: string;
  status: "PAMELDT" | "BEKREFTET";
};

/* Mal-snarveier — fasit-tekstene fra mockupen (skjermtekst-banken har ingen
   turneringsmeldinger ennå; tekstene her er designfasitens, aldri fritt oppdiktet). */
const MALER = [
  {
    l: "Oppmøtetid",
    tekst:
      "Oppmøte senest 45 minutter før start ved klubbhuset. Startlisten henger ved sekretariatet.",
  },
  {
    l: "Væravlysning",
    tekst:
      "Dagens runde er avlyst på grunn av været. Ny informasjon kommer så snart banen er spillbar.",
  },
];

function StatusChip({ status }: { status: FellesmeldingDeltaker["status"] }) {
  const c = T.up;
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 8.5,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: c,
        background: `color-mix(in srgb,${c} 12%,transparent)`,
        borderRadius: 5,
        padding: "3px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {status === "BEKREFTET" ? "Bekreftet" : "Påmeldt"}
    </span>
  );
}

/* Hvit valgt-tilstand (FilterChips-idiomet) — lime er reservert Send-CTA-en */
function Sjekk({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 6,
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: on ? T.fg : "transparent",
        border: `1.5px solid ${on ? T.fg : T.borderS}`,
        transition: "background 180ms, border-color 180ms",
      }}
    >
      {on && <Icon name="check" size={12} style={{ color: T.bg }} />}
    </span>
  );
}

function Stegviser({ steg }: { steg: number }) {
  const S = ["Mottakere", "Melding", "Send"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {S.map((l, i) => {
        const nr = i + 1;
        const aktiv = steg === nr;
        const gjort = steg > nr;
        return (
          <Fragment key={l}>
            {i > 0 && (
              <span style={{ flex: 1, height: 1, background: gjort || aktiv ? T.borderS : T.border }} />
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: T.mono,
                  fontSize: 9.5,
                  fontWeight: 700,
                  background: gjort ? T.panel3 : aktiv ? T.fg : T.panel2,
                  color: gjort ? T.fg2 : aktiv ? T.bg : T.mut,
                  border: `1px solid ${aktiv ? "transparent" : T.border}`,
                }}
              >
                {gjort ? <Icon name="check" size={11} /> : nr}
              </span>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: aktiv ? T.fg : T.mut,
                }}
              >
                {l}
              </span>
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}

/* Forhåndsvisning — samme boble som spillerens innboks */
function MeldingsBoble({ tekst, coachNavn, kontekst }: { tekst: string; coachNavn: string; kontekst: string }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <AvatarInit navn={coachNavn} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg }}>{coachNavn}</span>
          <span style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>Nå · {kontekst}</span>
        </div>
        <div
          style={{
            marginTop: 5,
            background: T.panel3,
            border: `1px solid ${T.border}`,
            borderRadius: "4px 14px 14px 14px",
            padding: "10px 12px",
            fontFamily: T.ui,
            fontSize: 12.5,
            color: T.fg,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {tekst || <span style={{ color: T.mut }}>Meldingen din vises slik hos spilleren …</span>}
        </div>
      </div>
    </div>
  );
}

function TekstKnapp({ children, onClick, mut }: { children: ReactNode; onClick: () => void; mut?: boolean }) {
  return (
    <button
      type="button"
      className="v2-focus"
      onClick={onClick}
      style={{
        appearance: "none",
        background: "none",
        border: "none",
        padding: 0,
        fontFamily: T.ui,
        fontSize: 11.5,
        fontWeight: 600,
        color: mut ? T.mut : T.fg2,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

type SendTilstand = "idle" | "sender" | "ok" | "delvis";

function Panel({
  mobile,
  tournamentId,
  turneringNavn,
  kontekst,
  coachNavn,
  deltakere,
  onLukk,
}: {
  mobile: boolean;
  tournamentId: string;
  turneringNavn: string;
  kontekst: string;
  coachNavn: string;
  deltakere: FellesmeldingDeltaker[];
  onLukk: () => void;
}) {
  const [steg, setSteg] = useState(1);
  const [valgte, setValgte] = useState<string[]>(() => deltakere.map((d) => d.userId));
  const [tekst, setTekst] = useState("");
  const [send, setSend] = useState<SendTilstand>("idle");
  const [feilede, setFeilede] = useState<string[]>([]);
  const [sendtAntall, setSendtAntall] = useState(0);
  const [feil, setFeil] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const antall = valgte.length;
  const toggle = (id: string) =>
    setValgte((v) => (v.includes(id) ? v.filter((x) => x !== id) : v.concat(id)));

  const utfor = (mottakere: string[]) => {
    setSend("sender");
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await sendFellesmeldingTilDeltakere({
          tournamentId,
          userIds: mottakere,
          body: tekst.trim(),
        });
        if (!res.ok) {
          setSend(feilede.length > 0 ? "delvis" : "idle");
          setFeil(res.error);
          return;
        }
        setSendtAntall((n) => n + res.sendt);
        if (res.feilede.length > 0) {
          setFeilede(res.feilede.map((f) => f.userId));
          setSend("delvis");
        } else {
          setFeilede([]);
          setSend("ok");
        }
      } catch {
        setSend(feilede.length > 0 ? "delvis" : "idle");
        setFeil("Noe gikk galt — prøv igjen.");
      }
    });
  };

  const hode = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingBottom: 14,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {mobile && (
        <button
          type="button"
          className="v2-press v2-focus"
          aria-label="Lukk"
          onClick={onLukk}
          style={{
            appearance: "none",
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: T.panel2,
            border: `1px solid ${T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flex: "none",
          }}
        >
          <Icon name="arrow-left" size={14} style={{ color: T.fg2 }} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <Caps size={9}>{kontekst}</Caps>
        <div
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: mobile ? 19 : 21,
            color: T.fg,
            marginTop: 5,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Fellesmelding
          <HjelpTips k="fellesmelding" size={12} />
        </div>
      </div>
      {!mobile && (
        <button
          type="button"
          className="v2-press v2-focus"
          aria-label="Lukk"
          onClick={onLukk}
          style={{
            appearance: "none",
            background: "none",
            border: "none",
            width: 28,
            height: 28,
            borderRadius: 9999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: T.mut,
            flex: "none",
          }}
        >
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );

  /* Tom deltakerliste — ærlig tomtilstand uten send */
  if (deltakere.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {hode}
        <TomTilstand
          icon="users"
          title="Ingen deltakere ennå"
          sub="Fellesmeldingen får mottakere når spillere er påmeldt turneringen. Legg til deltakere fra turneringsdetaljen først."
        />
      </div>
    );
  }

  /* Kvitteringstilstanden erstatter stegene helt */
  if (send === "ok") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {hode}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
            padding: "26px 12px 10px",
          }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: `color-mix(in srgb,${T.up} 12%,transparent)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check-circle" size={26} style={{ color: T.up }} />
          </span>
          <div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg }}>
              Sendt til {sendtAntall} {sendtAntall === 1 ? "spiller" : "spillere"}
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: "6px 0 0" }}>
              Meldingen ligger nå i PlayerHQ-innboksen til hver deltaker. Svar fra spillerne kommer i
              innboksen din.
            </p>
          </div>
          <Link href="/admin/innboks" style={{ textDecoration: "none" }}>
            <Knapp ghost icon="arrow-right">Se tråden i innboksen</Knapp>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      {hode}
      <Stegviser steg={steg} />

      {steg === 1 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            {/* Hierarki: tellingen er det viktigste på steget */}
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 15,
                fontWeight: 700,
                color: T.fg,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {antall}
              <span style={{ color: T.mut, fontWeight: 400 }}> av {deltakere.length} valgt</span>
            </span>
            <span style={{ display: "inline-flex", gap: 10 }}>
              <TekstKnapp onClick={() => setValgte(deltakere.map((d) => d.userId))}>Alle</TekstKnapp>
              <TekstKnapp onClick={() => setValgte([])}>Ingen</TekstKnapp>
            </span>
          </div>
          <div
            style={{
              maxHeight: mobile ? "none" : 330,
              overflowY: mobile ? "visible" : "auto",
              margin: "0 -6px",
              padding: "0 6px",
            }}
          >
            {deltakere.map((d, i) => {
              const on = valgte.includes(d.userId);
              const tastToggle = (e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(d.userId);
                }
              };
              return (
                <div
                  key={d.userId}
                  className="v2-row-h v2-focus"
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={on}
                  aria-label={d.navn}
                  onClick={() => toggle(d.userId)}
                  onKeyDown={tastToggle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "9px 8px",
                    margin: "0 -8px",
                    borderRadius: 10,
                    borderBottom: i === deltakere.length - 1 ? "none" : `1px solid ${T.border}`,
                    cursor: "pointer",
                  }}
                >
                  <Sjekk on={on} />
                  <AvatarInit navn={d.navn} size={28} />
                  <span
                    style={{
                      flex: 1,
                      fontFamily: T.ui,
                      fontSize: 13,
                      fontWeight: 600,
                      color: on ? T.fg : T.fg2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {d.navn}
                  </span>
                  <StatusChip status={d.status} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
            {antall === 0 ? (
              <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
                Velg minst én mottaker for å gå videre.
              </span>
            ) : (
              <Knapp ghost icon="arrow-right" onClick={() => setSteg(2)}>
                Skriv melding
              </Knapp>
            )}
          </div>
        </>
      )}

      {steg === 2 && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MALER.map((m) => (
              <button
                key={m.l}
                type="button"
                className="v2-press v2-focus"
                onClick={() => setTekst(m.tekst)}
                style={{
                  appearance: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: T.ui,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: T.fg2,
                  background: T.panel2,
                  border: `1px solid ${T.borderS}`,
                  borderRadius: 9999,
                  padding: "6px 12px",
                }}
              >
                <Icon name="file-text" size={11} style={{ color: T.mut }} />
                {m.l}
              </button>
            ))}
          </div>
          {/* Meldingsfeltet er størst på skjermen — det er jobben */}
          <textarea
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            rows={mobile ? 5 : 6}
            placeholder="Skriv beskjeden til deltakerne …"
            aria-label="Melding til deltakerne"
            className="v2-focus"
            style={{
              width: "100%",
              resize: "vertical",
              fontFamily: T.ui,
              fontSize: 13.5,
              lineHeight: 1.6,
              color: T.fg,
              background: T.panel2,
              border: `1px solid ${T.borderS}`,
              borderRadius: 14,
              padding: "12px 14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div>
            <Caps size={9} style={{ marginBottom: 8 }}>Slik ser den ut hos spilleren</Caps>
            <MeldingsBoble tekst={tekst} coachNavn={coachNavn} kontekst={turneringNavn} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 4 }}>
            <Knapp ghost icon="arrow-left" onClick={() => setSteg(1)}>
              Mottakere
            </Knapp>
            {tekst.trim().length === 0 ? (
              <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, alignSelf: "center" }}>
                Skriv en melding for å gå videre.
              </span>
            ) : (
              <Knapp ghost icon="arrow-right" onClick={() => setSteg(3)}>
                Til sending
              </Knapp>
            )}
          </div>
        </>
      )}

      {steg === 3 && (
        <>
          <div
            style={{
              background: T.panel2,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name="mail" size={15} style={{ color: T.fg2, flex: "none" }} />
            <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55 }}>
              Sendes til{" "}
              <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.fg }}>
                {antall} {antall === 1 ? "spiller" : "spillere"}
              </span>{" "}
              som melding i PlayerHQ-innboksen. Svar kommer i innboksen din.
            </span>
          </div>
          <MeldingsBoble tekst={tekst} coachNavn={coachNavn} kontekst={turneringNavn} />

          {feil && (
            <div
              role="alert"
              style={{
                borderRadius: 11,
                background: `color-mix(in srgb,${T.down} 10%,transparent)`,
                border: `1px solid color-mix(in srgb,${T.down} 35%,transparent)`,
                padding: "10px 13px",
                fontFamily: T.ui,
                fontSize: 12.5,
                color: T.down,
              }}
            >
              {feil}
            </div>
          )}

          {send === "sender" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 2px" }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 9999,
                  border: `2px solid ${T.border}`,
                  borderTopColor: T.lime,
                  animation: "d1FellesmeldingSpin 700ms linear infinite",
                  flex: "none",
                }}
              />
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
                Sender til {antall} {antall === 1 ? "spiller" : "spillere"} …
              </span>
              <style>{"@keyframes d1FellesmeldingSpin{to{transform:rotate(360deg)}}"}</style>
            </div>
          )}

          {send === "delvis" && (
            <div
              style={{
                background: `color-mix(in srgb,${T.warn} 7%,transparent)`,
                border: `1px solid color-mix(in srgb,${T.warn} 35%,transparent)`,
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="triangle-alert" size={14} style={{ color: T.warn, flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg }}>
                  {feilede.length} av {antall} feilet — resten er sendt
                </span>
              </div>
              {feilede.map((id) => {
                const d = deltakere.find((x) => x.userId === id);
                if (!d) return null;
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <AvatarInit navn={d.navn} size={22} />
                    <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>{d.navn}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>Ikke levert</span>
                  </div>
                );
              })}
              <div>
                <Knapp ghost icon="repeat" onClick={() => utfor(feilede)}>
                  Prøv igjen for {feilede.length}
                </Knapp>
              </div>
            </div>
          )}

          {send === "idle" && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 4 }}>
              <Knapp ghost icon="arrow-left" onClick={() => setSteg(2)}>
                Melding
              </Knapp>
              {/* Skjermens ENE accent-jobb */}
              <Knapp icon="send" onClick={() => utfor(valgte)}>
                Send til {antall} {antall === 1 ? "spiller" : "spillere"}
              </Knapp>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function FellesmeldingPanel({
  tournamentId,
  turneringNavn,
  kontekst,
  coachNavn,
  deltakere,
  autoApen,
}: {
  tournamentId: string;
  turneringNavn: string;
  /** Eyebrow-linjen i panelet, f.eks. «21. juli 2026 · Miklagard GK». */
  kontekst: string;
  coachNavn: string;
  deltakere: FellesmeldingDeltaker[];
  /** true når ruten åpnes med ?fellesmelding=1 (fra turneringslisten). */
  autoApen?: boolean;
}) {
  const [apen, setApen] = useState(Boolean(autoApen));
  /* Nøkkel som nullstiller panel-staten (steg/valg/tekst) ved hver ny åpning */
  const [okt, setOkt] = useState(0);
  const mobile = useMobile();

  const apne = () => {
    setOkt((n) => n + 1);
    setApen(true);
  };

  return (
    <>
      <Knapp ghost icon="megaphone" onClick={apne}>
        Send fellesmelding
      </Knapp>
      {apen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
          <div
            onClick={() => setApen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }}
          />
          <div
            style={
              mobile
                ? {
                    position: "absolute",
                    inset: 0,
                    background: T.bg,
                    padding: "14px 16px 24px",
                    overflowY: "auto",
                  }
                : {
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 420,
                    maxWidth: "100%",
                    background: T.panel,
                    borderLeft: `1px solid ${T.borderS}`,
                    boxShadow: "-24px 0 60px rgba(0,0,0,0.5)",
                    padding: "18px 20px",
                    overflowY: "auto",
                  }
            }
          >
            <Panel
              key={okt}
              mobile={mobile}
              tournamentId={tournamentId}
              turneringNavn={turneringNavn}
              kontekst={kontekst}
              coachNavn={coachNavn}
              deltakere={deltakere}
              onLukk={() => setApen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
