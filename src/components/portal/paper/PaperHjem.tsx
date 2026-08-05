"use client";

/**
 * PaperHjem — PlayerHQ «I dag» 1:1 mot Claude Paper-fasiten
 * designsystem/paper/fase1/playerhq-chat-{desktop,mobil}.html
 *
 * Klassenavn matcher paper-playerhq-hjem.css (stage, icbtn, you, boxbar …).
 * IKKE V2Shell / inline T-tokens.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/app/portal/actions";
import type { GjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { FangstModal } from "@/components/portal/v2/chat/FangstModal";
import { usePortalChat } from "@/components/portal/v2/chat/use-portal-chat";
import { PaperShell } from "./PaperShell";

type Props = {
  data: DashboardData;
  gjennomfore: GjennomforeData;
  naaTekst: string | null;
};

function klokkeNaa(): string {
  try {
    return new Intl.DateTimeFormat("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Oslo",
    }).format(new Date());
  } catch {
    return "";
  }
}

function datoLinje(): string {
  try {
    return new Intl.DateTimeFormat("nb-NO", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      timeZone: "Europe/Oslo",
    }).format(new Date());
  } catch {
    return "";
  }
}

function kategoriFraSnitt(avg: number | null | undefined): string | null {
  if (avg == null || !Number.isFinite(avg)) return null;
  if (avg <= 72) return "A";
  if (avg <= 78) return "B";
  if (avg <= 85) return "C";
  return "D";
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
      <path d="M19 11a7 7 0 0 1-14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function LoopNav({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const forHref = gjennomfore.nesteOkt?.href ?? null;
  const underHref =
    gjennomfore.nesteOkt?.status === "now" ? gjennomfore.nesteOkt.href : null;
  const etterId = gjennomfore.fullfortIdag[0]?.id;
  const etterHref = etterId ? `/portal/okt/${etterId}/oppsummering` : null;

  return (
    <nav className="loop" aria-label="Sløyfen før, under og etter økta">
      {forHref ? (
        <Link href={forHref} className="on">
          FØR
        </Link>
      ) : (
        <span className="on" aria-current="step">
          FØR
        </span>
      )}
      <span className="arw" aria-hidden="true">
        →
      </span>
      {underHref ? (
        <Link href={underHref}>UNDER</Link>
      ) : (
        <span title="Økta er ikke i gang ennå">UNDER</span>
      )}
      <span className="arw" aria-hidden="true">
        →
      </span>
      {etterHref ? (
        <Link href={etterHref}>ETTER</Link>
      ) : (
        <span title="Ingen fullført økt å oppsummere ennå">ETTER</span>
      )}
    </nav>
  );
}

function NowBlock({
  gjennomfore,
  onSeMer,
}: {
  gjennomfore: GjennomforeData;
  onSeMer: () => void;
}) {
  const okt = gjennomfore.nesteOkt;
  if (!okt || (okt.status !== "upcoming" && okt.status !== "now")) return null;
  const erAktiv = okt.status === "now";

  return (
    <article className="turn" id="turnNow">
      <div className="ai">
        <div className="eyebrow" style={{ marginBottom: "var(--s2)" }}>
          systemet, uoppfordret · <span className="num">{klokkeNaa()}</span>
        </div>
        <div className="nowblock" id="nowBlock">
          <div className="eyebrow">Én ting nå</div>
          <h3>{erAktiv ? "Økta er i gang" : `Dagens økt starter ${okt.relTidTekst}`}</h3>
          <p>
            {okt.sted} · {okt.tid}. {okt.tittel}.
          </p>
          <div className="acts">
            <Link href={okt.href} className="btn primary">
              {erAktiv ? "Fortsett økta" : "Start økta"}
            </Link>
            <button type="button" className="btn ghost sm" onClick={onSeMer}>
              Se mer
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TomUke({ ukenummer }: { ukenummer: number }) {
  return (
    <article className="turn">
      <div className="ai">
        <div className="eyebrow" style={{ marginBottom: "var(--s2)" }}>
          systemet · <span className="num">{klokkeNaa()}</span>
        </div>
        <h3 style={{ margin: "0 0 var(--s2)", fontFamily: "var(--disp)", fontSize: 16 }}>
          Anders har ikke publisert uke {ukenummer} ennå
        </h3>
        <p style={{ margin: 0, maxWidth: "46ch", color: "var(--muted)" }}>
          Du har ingen økt i dag. Spør meg om forrige uke, eller fang en observasjon mens du venter.
        </p>
        <div className="acts" style={{ marginTop: "var(--s3)" }}>
          <Link href="/portal/planlegge" className="btn ink">
            Se plan
          </Link>
        </div>
      </div>
    </article>
  );
}

function Velkomst({
  fornavn,
  onFangst,
  onForesla,
}: {
  fornavn: string;
  onFangst: () => void;
  onForesla: (t: string) => void;
}) {
  return (
    <article className="turn">
      <div className="ai">
        <div className="eyebrow" style={{ marginBottom: "var(--s2)" }}>
          PlayerHQ · <span className="num">{klokkeNaa()}</span>
        </div>
        <p style={{ margin: "0 0 var(--s3)", maxWidth: "52ch" }}>
          Hei {fornavn}. Spør meg om treningen din — jeg henter ekte tall fra planen, øktene og
          banen.
        </p>
        <div className="acts">
          <button type="button" className="btn ghost sm" onClick={onFangst}>
            Fang en observasjon
          </button>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => onForesla("Hva skal jeg prioritere i dag?")}
          >
            Hva skal jeg prioritere?
          </button>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => onForesla("Hvordan ligger jeg an denne uka?")}
          >
            Hvordan ligger jeg an?
          </button>
        </div>
      </div>
    </article>
  );
}

function ArtefaktInnhold({ gjennomfore }: { gjennomfore: GjennomforeData }) {
  const okt = gjennomfore.nesteOkt ?? gjennomfore.fullfortIdag[0] ?? null;
  if (!okt) {
    return (
      <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
        Ingen økt planlagt i dag. Se ukeplanen for neste mulighet.
      </p>
    );
  }
  return (
    <div className="artcard">
      <div className="eyebrow">Dagens økt</div>
      <strong
        style={{ display: "block", fontFamily: "var(--disp)", fontSize: 15, marginTop: 6 }}
      >
        {okt.tittel}
      </strong>
      <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--muted)" }}>
        <span className="num">{okt.tid}</span>
        {okt.sted ? <> · {okt.sted}</> : null}
        {okt.relTidTekst ? <> · {okt.relTidTekst}</> : null}
      </div>
      {okt.meta ? (
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 12.5 }}>{okt.meta}</p>
      ) : null}
      {okt.drillNavn?.length ? (
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "var(--muted)", fontSize: 12.5 }}>
          {okt.drillNavn.slice(0, 5).map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      {/* Ink — ikke accent. Oransje eies av NowBlock i tråden. */}
      <div className="acts" style={{ marginTop: 14 }}>
        <Link href={okt.href} className="btn ink">
          {okt.status === "now"
            ? "Fortsett økta"
            : okt.status === "done"
              ? "Se oppsummering"
              : "Start økta"}
        </Link>
      </div>
    </div>
  );
}

export function PaperHjem({ data, gjennomfore, naaTekst }: Props) {
  const [input, setInput] = useState("");
  const [fangstApen, setFangstApen] = useState(false);
  const [artApen, setArtApen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage, stop } = usePortalChat();
  const isLoading = status === "streaming" || status === "submitted";

  const fornavn = data.user.fornavn || data.user.name.split(" ")[0] || "der";
  const kat = kategoriFraSnitt(data.kpiStats.avgScore);
  const ukeHarOkter = data.week.some((d) => d.sessions.length > 0);
  const visTomUke = ukeHarOkter === false && messages.length === 0;
  const ukenummer = data.weekNumber;

  // Fasit viser "SG total +2,92" — vi har snittscore; formater som tall
  const sgTekst =
    data.kpiStats.avgScore != null
      ? data.kpiStats.avgScore.toFixed(1).replace(".", ",")
      : null;

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    if (!artApen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [artApen]);

  const send = useCallback(async () => {
    const t = input.trim();
    if (!t || isLoading) return;
    setInput("");
    await sendMessage(t);
  }, [input, isLoading, sendMessage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <PaperShell>
      {/* art-open-klasse på root styres via body-class i effect under —
          PaperShell eier .paper-hjem, så vi speiler via data-attr på stage + CSS :has */}
      {/* Midtkolonne — fasit: .stage */}
      <main className="stage" data-art-open={artApen ? "true" : undefined}>
        <header className="top">
          <div>
            <h1 id="surfaceTitle">I dag</h1>
            <div className="eyebrow">
              {data.user.name}
              {kat ? <> · kat. {kat}</> : null}
              {sgTekst ? (
                <>
                  {" "}
                  · SG total <span className="num">{sgTekst}</span>
                </>
              ) : null}
              <>
                {" "}
                · <span className="num">{datoLinje()}</span>{" "}
                <span className="num">{klokkeNaa()}</span>
              </>
              {naaTekst ? <> · {naaTekst}</> : null}
            </div>
          </div>
          <LoopNav gjennomfore={gjennomfore} />
          <button
            type="button"
            className="btn sm"
            id="artOpen"
            aria-controls="artifact"
            aria-expanded={artApen}
            onClick={() => setArtApen(true)}
          >
            Dagens økt
          </button>
          <button
            type="button"
            className="icbtn"
            id="openCaptureTop"
            aria-label="Fang en observasjon"
            aria-haspopup="dialog"
            aria-expanded={fangstApen}
            onClick={() => setFangstApen(true)}
          >
            <IconMic />
          </button>
        </header>

        <div
          className="thread"
          id="thread"
          ref={threadRef}
          tabIndex={-1}
          aria-label="Samtale med PlayerHQ"
        >
          {visTomUke ? (
            <TomUke ukenummer={ukenummer} />
          ) : (
            <>
              {messages.length === 0 ? (
                <Velkomst
                  fornavn={fornavn}
                  onFangst={() => setFangstApen(true)}
                  onForesla={(t) => void sendMessage(t)}
                />
              ) : null}

              {messages.map((m) => (
                <article key={m.id} className="turn">
                  {m.role === "user" ? (
                    <div className="you">
                      <div className="bubble">
                        {m.parts.map((p, i) =>
                          p.type === "text" ? <span key={i}>{p.text}</span> : null,
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="ai">
                      <div className="eyebrow" style={{ marginBottom: "var(--s2)" }}>
                        PlayerHQ
                      </div>
                      {m.parts.map((p, i) =>
                        p.type === "text" ? (
                          <p
                            key={i}
                            style={{
                              margin: "0 0 var(--s2)",
                              maxWidth: "56ch",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {p.text}
                          </p>
                        ) : null,
                      )}
                    </div>
                  )}
                </article>
              ))}

              {isLoading ? (
                <article className="turn">
                  <div className="ai">
                    <div className="eyebrow">PlayerHQ tenker…</div>
                    <div className="skel" style={{ height: 14, width: "40%", marginTop: 8 }} />
                    <div className="skel" style={{ height: 14, width: "62%", marginTop: 6 }} />
                  </div>
                </article>
              ) : null}

              <NowBlock gjennomfore={gjennomfore} onSeMer={() => setArtApen(true)} />
            </>
          )}
        </div>

        <div className="composer">
          <div className="box">
            <label className="sr" htmlFor="paper-ta">
              Skriv til PlayerHQ
            </label>
            <textarea
              id="paper-ta"
              rows={1}
              placeholder="Spør om treningen din …"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isLoading}
            />
            <div className="boxbar">
              <button
                type="button"
                className="icbtn"
                aria-label="Legg ved"
                title="Legg ved"
                onClick={() => setFangstApen(true)}
              >
                <IconPlus />
              </button>
              <button
                type="button"
                className="icbtn"
                aria-label="Stemme"
                title="Stemme"
                onClick={() => setFangstApen(true)}
              >
                <IconMic />
              </button>
              <span style={{ flex: 1 }} />
              {isLoading ? (
                <button type="button" className="btn sm ink" onClick={() => stop()}>
                  Stopp
                </button>
              ) : (
                <button
                  type="button"
                  className="btn sm primary sendbtn"
                  aria-label="Send"
                  disabled={!input.trim()}
                  onClick={() => void send()}
                >
                  <IconSend />
                  <span>Send</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Artefakt 360px desktop / sheet ≤1120 */}
      <aside
        className={`artifact${artApen ? " on" : ""}`}
        id="artifact"
        aria-label="Dagens økt"
      >
        <div className="arthead">
          <strong>Dagens økt</strong>
          <button
            type="button"
            className="icbtn"
            aria-label="Lukk"
            onClick={() => setArtApen(false)}
          >
            <IconX />
          </button>
        </div>
        <div className="artbody">
          <ArtefaktInnhold gjennomfore={gjennomfore} />
        </div>
      </aside>

      {artApen ? (
        <button
          type="button"
          className="scrim on"
          aria-label="Lukk panel"
          onClick={() => setArtApen(false)}
        />
      ) : null}

      <FangstModal open={fangstApen} onClose={() => setFangstApen(false)} />
    </PaperShell>
  );
}
