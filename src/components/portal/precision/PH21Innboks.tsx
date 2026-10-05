"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, Sparkles, Video, CalendarRange, AlertCircle, HelpCircle } from "lucide-react";
import { KnappLenke, StatusPille, TomTilstand, FeilTilstand, Meta } from "@/components/precision/pa";
import { SideHode, Side, Stabel, Kort } from "@/components/precision/pa-a4";
import {
  type PH21Data,
  type PH21Tab,
  PH21_TABS,
  parsePH21Tab,
  computePH21TabCounts,
} from "@/lib/portal-coach/ph21-data";
import {
  sendPH21MeldingAction,
  sendPH21SporsmalAction,
  sendPH21TilbakemeldingAction,
  sendPH21OnskeAction,
  respondPH21PlanAction,
} from "@/lib/portal-coach/ph21-actions";
import "@/styles/precision-komponenter.css";

export type PH21InnboksProps = {
  data: PH21Data;
  initialTab?: PH21Tab;
  tilstand?: "data" | "tom" | "laster" | "feil";
  feilTekst?: string;
};

export function PH21Innboks({
  data,
  initialTab = "msg",
  tilstand = "data",
  feilTekst,
}: PH21InnboksProps) {
  const router = useRouter();
  const [tab, setTab] = useState<PH21Tab>(parsePH21Tab(initialTab));
  const [isPending, startTransition] = useTransition();

  // Toast-tilstand
  const [toast, setToast] = useState<{ title: string; meta?: string } | null>(null);

  const showToast = (title: string, meta?: string) => {
    setToast({ title, meta });
    setTimeout(() => setToast(null), 4000);
  };

  // Meldinger-tilstand
  const [msgTxt, setMsgTxt] = useState("");
  const [messages, setMessages] = useState(data.messages);

  // Spørsmål-tilstand
  const [qTxt, setQTxt] = useState("");
  const [questions, setQuestions] = useState(data.questions);

  // Tilbakemelding-tilstand
  const [fbSessionId, setFbSessionId] = useState(data.recentSessions[0]?.value || "");
  const [fbRating, setFbRating] = useState<number | null>(null);
  const [fbTxt, setFbTxt] = useState("");
  const [feedbackList, setFeedbackList] = useState(data.feedback);

  // Videoer og Planer-tilstand
  const [videos] = useState(data.videos);
  const [plans, setPlans] = useState(data.plans);

  // Ønske-tilstand
  const [wDay, setWDay] = useState("Man 28.09");
  const [wArea, setWArea] = useState("Innspill");
  const [wTxt, setWTxt] = useState("");
  const [wSent, setWSent] = useState(false);

  const counts = computePH21TabCounts({ plans, videos });

  // Håndterere
  const handleSendMelding = () => {
    if (!msgTxt.trim() || !data.coach?.id) return;
    const textToSend = msgTxt.trim();
    setMsgTxt("");

    const tempMsg = {
      id: `temp-${Date.now()}`,
      role: "me" as const,
      text: textToSend,
      t: "Nå",
    };
    setMessages((prev) => [...prev, tempMsg]);

    startTransition(async () => {
      const res = await sendPH21MeldingAction(data.coach!.id, textToSend);
      if (res.ok) {
        showToast("Meldingen er sendt", data.coach!.name.toUpperCase());
        router.refresh();
      } else {
        showToast("Kunne ikke sende", res.error || "Feil oppsto");
      }
    });
  };

  const handleSendSporsmal = () => {
    if (!qTxt.trim()) return;
    const textToSend = qTxt.trim();
    setQTxt("");

    const tempQ = {
      id: `temp-q-${Date.now()}`,
      t: textToSend,
      date: "I dag",
      status: "Venter på svar" as const,
      answer: null,
    };
    setQuestions((prev) => [tempQ, ...prev]);

    startTransition(async () => {
      const res = await sendPH21SporsmalAction(textToSend);
      if (res.ok) {
        showToast("Spørsmålet er sendt", "STATUS · VENTER PÅ SVAR");
        router.refresh();
      } else {
        showToast("Kunne ikke sende", res.error || "Feil oppsto");
      }
    });
  };

  const handleSendTilbakemelding = () => {
    if (!fbRating) return;
    const selectedSession = data.recentSessions.find((s) => s.value === fbSessionId);
    const sessionLabel = selectedSession?.label || "Gjennomført økt";

    const tempFb = {
      id: `temp-fb-${Date.now()}`,
      session: sessionLabel,
      from: "me" as const,
      rating: fbRating,
      text: fbTxt.trim() || "—",
      t: "I dag",
    };
    setFeedbackList((prev) => [tempFb, ...prev]);
    const r = fbRating;
    const t = fbTxt;
    setFbRating(null);
    setFbTxt("");

    startTransition(async () => {
      const res = await sendPH21TilbakemeldingAction(fbSessionId, r, t);
      if (res.ok) {
        showToast("Tilbakemeldingen er sendt", sessionLabel.toUpperCase());
        router.refresh();
      } else {
        showToast("Kunne ikke sende", res.error || "Feil oppsto");
      }
    });
  };

  const handleSendOnske = () => {
    if (!wTxt.trim()) return;
    setWSent(true);

    startTransition(async () => {
      const res = await sendPH21OnskeAction({ day: wDay, area: wArea, text: wTxt.trim() });
      if (res.ok) {
        showToast("Ønsket er sendt til Anders", `${wDay.toUpperCase()} · ${wArea.toUpperCase()}`);
        router.refresh();
      } else {
        showToast("Kunne ikke sende", res.error || "Feil oppsto");
        setWSent(false);
      }
    });
  };

  const handlePlanResponse = (planId: string, status: "Godtatt" | "Avvist") => {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, status } : p)));

    startTransition(async () => {
      const res = await respondPH21PlanAction(planId, status);
      if (res.ok) {
        showToast(
          status === "Godtatt" ? "Planen er godtatt" : "Planen er avvist",
          status === "Godtatt" ? "AKTIV FRA MANDAG" : "ANDERS FÅR BESKJED",
        );
        router.refresh();
      } else {
        showToast("Kunne ikke oppdatere plan", res.error || "Feil oppsto");
      }
    });
  };

  if (tilstand === "feil") {
    return (
      <Side max={1200}>
        <SideHode kicker="Innboks · Feil" title="Innboks" sub="Kunne ikke laste innboksen" />
        <FeilTilstand
          icon={AlertCircle}
          title="Meldingene kunne ikke hentes"
          text={feilTekst || "Det du skriver lagres og sendes når forbindelsen er tilbake."}
          code="FEIL 503 · MELDINGER"
        />
      </Side>
    );
  }

  if (tilstand === "laster") {
    return (
      <Side max={1200}>
        <SideHode kicker="Innboks" title="Innboks" sub="Henter samtalen med Anders …" />
        <Kort pad={24}>
          <div style={{ textAlign: "center" }}>
            <Meta>Henter meldinger og planer …</Meta>
          </div>
        </Kort>
      </Side>
    );
  }

  // Ikke-coachet oppsalgsflate hvis spilleren ikke har tilknyttet coach
  if (!data.isCoached && tilstand !== "tom") {
    return (
      <Side max={1200}>
        <SideHode
          kicker="Innboks · AK Golf"
          title="Innboks"
          sub="Hovedcoach · Meldinger, spørsmål og planer samlet."
          actions={
            <KnappLenke variant="secondary" icon={Sparkles} href="/portal/caddie">
              Spør Caddie
            </KnappLenke>
          }
        />
        <Kort pad={24} gap={16}>
          <TomTilstand
            icon={HelpCircle}
            title="Coach følger med her — når du er med i AK Golf Academy"
            text="Med en coaching-pakke eller plass i en AK-gruppe får du egen coach, ukeplaner laget for deg og direkte meldinger her."
          />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <KnappLenke href="/portal/booking">Book en prøvetime</KnappLenke>
          </div>
        </Kort>
      </Side>
    );
  }

  return (
    <Side max={1200}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
          <div className="pa-toast">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span>{toast.title}</span>
              {toast.meta && <span className="pa-toast__meta">{toast.meta}</span>}
            </div>
          </div>
        </div>
      )}

      <SideHode
        kicker={`Innboks · ${data.coach?.name ?? "Anders Kristiansen"}`}
        title="Innboks"
        sub="Hovedcoach · Fredrikstad GK. Meldinger, spørsmål, videoer og planer samlet."
        actions={
          <KnappLenke variant="secondary" icon={Sparkles} href="/portal/caddie">
            Spør Caddie
          </KnappLenke>
        }
      />

      {/* Faner */}
      <div className="pa-tabs" role="tablist">
        {PH21_TABS.map((t) => {
          const count = t.value === "plan" ? counts.plan : t.value === "vid" ? counts.vid : undefined;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className="pa-tab"
              onClick={() => setTab(t.value)}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {t.label}
              {count !== undefined && <span className="pa-tab__count">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* FANE: MELDINGER (msg) */}
      {tab === "msg" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            className="pa-card"
            style={{
              padding: 16,
              minHeight: 360,
              maxHeight: 560,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.length === 0 ? (
              <TomTilstand
                icon={Send}
                title="Ingen meldinger ennå"
                text={`Send en melding for å starte samtalen med ${data.coach?.name ?? "coachen din"}.`}
              />
            ) : (
              messages.map((m) => {
                const me = m.role === "me";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: me ? "flex-end" : "flex-start",
                      gap: 4,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "min(520px, 88%)",
                        padding: "10px 14px",
                        borderRadius: "var(--radius)",
                        background: me ? "var(--primary)" : "var(--surface-flat)",
                        color: me ? "var(--text-on-primary)" : "var(--text-primary)",
                        border: me ? "none" : "1px solid var(--border-hairline)",
                        font: "var(--type-body-s)",
                        textWrap: "pretty",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {m.text}
                      {m.attach && (
                        <div
                          style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: "1px solid var(--border-hairline)",
                            font: "var(--type-meta)",
                            letterSpacing: "var(--tracking-mono)",
                          }}
                        >
                          ØKT · {m.attach.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Meta>
                      {me ? "DU" : (data.coach?.name?.toUpperCase() ?? "COACH")} · {m.t}
                    </Meta>
                  </div>
                );
              })
            )}
          </div>

          {/* Svar-felt */}
          <div
            className="pa-card"
            style={{
              padding: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              aria-label={`Melding til ${data.coach?.name ?? "coachen"}`}
              value={msgTxt}
              onChange={(e) => setMsgTxt(e.target.value)}
              placeholder={`Skriv til ${data.coach?.name?.split(" ")[0] ?? "Anders"} …`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMelding();
                }
              }}
              style={{
                flex: 1,
                minHeight: 44,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-flat)",
                color: "var(--text-primary)",
                font: "var(--type-body)",
                outline: "none",
              }}
            />
            <button
              type="button"
              disabled={!msgTxt.trim() || isPending}
              onClick={handleSendMelding}
              className="pa-btn pa-btn--primary"
              style={{ minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* FANE: SPØRSMÅL (q) */}
      {tab === "q" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {/* Still et spørsmål */}
          <Kort pad={16} gap={12}>
            <span className="kicker">Still et spørsmål</span>
            <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
              Ett spørsmål om gangen. {data.coach?.name?.split(" ")[0] ?? "Anders"} svarer skriftlig eller i neste time.
            </p>
            <textarea
              value={qTxt}
              onChange={(e) => setQTxt(e.target.value)}
              placeholder="Hvordan varmer jeg opp før tidlig start?"
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-flat)",
                color: "var(--text-primary)",
                font: "var(--type-body)",
                resize: "vertical",
              }}
            />
            <div>
              <button
                type="button"
                disabled={!qTxt.trim() || isPending}
                onClick={handleSendSporsmal}
                className="pa-btn pa-btn--primary"
                style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Send size={16} />
                <span>Send spørsmål</span>
              </button>
            </div>
          </Kort>

          {/* Dine spørsmål */}
          <Kort pad={16} gap={8}>
            <span className="kicker" style={{ paddingBottom: 4 }}>
              Dine spørsmål
            </span>
            {questions.length === 0 ? (
              <p style={{ margin: "8px 0", font: "var(--type-body-s)", color: "var(--text-muted)" }}>
                Ingen spørsmål ennå.
              </p>
            ) : (
              questions.map((q, i) => (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "12px 0",
                    borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
                    <span
                      style={{
                        font: "500 14px/1.35 var(--font-sans)",
                        color: "var(--text-primary)",
                        flex: "1 1 200px",
                      }}
                    >
                      {q.t}
                    </span>
                    <StatusPille tone={q.status === "Besvart" ? "ok" : "neutral"}>{q.status}</StatusPille>
                  </div>
                  {q.answer && (
                    <p
                      style={{
                        margin: 0,
                        font: "var(--type-body-s)",
                        color: "var(--text-secondary)",
                        textWrap: "pretty",
                      }}
                    >
                      {q.answer}
                    </p>
                  )}
                  <Meta>{q.date}</Meta>
                </div>
              ))
            )}
          </Kort>
        </div>
      )}

      {/* FANE: TILBAKEMELDING (fb) */}
      {tab === "fb" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {/* Gi tilbakemelding */}
          <Kort pad={16} gap={16}>
            <span className="kicker">Tilbakemelding på økt</span>
            {data.recentSessions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>ØKT</label>
                <select
                  value={fbSessionId}
                  onChange={(e) => setFbSessionId(e.target.value)}
                  style={{
                    minHeight: 44,
                    padding: "0 12px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-flat)",
                    color: "var(--text-primary)",
                    font: "var(--type-body)",
                  }}
                >
                  {data.recentSessions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>HVORDAN GIKK ØKTA?</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>
                {[
                  { r: 1, label: "Tung" },
                  { r: 2, label: "Slapp" },
                  { r: 3, label: "Ok" },
                  { r: 4, label: "God" },
                  { r: 5, label: "Topp" },
                ].map(({ r, label }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFbRating(r)}
                    style={{
                      minHeight: 44,
                      padding: "4px 2px",
                      borderRadius: "var(--radius-pill)",
                      border: fbRating === r ? "1px solid var(--primary)" : "1px solid var(--border-strong)",
                      background: fbRating === r ? "var(--primary)" : "var(--surface-card)",
                      color: fbRating === r ? "var(--text-on-primary)" : "var(--text-primary)",
                      font: "var(--type-label)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{r}</span>
                    <span style={{ fontSize: "var(--fs-11)", opacity: 0.8 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>KOMMENTAR (VALGFRITT)</label>
              <input
                type="text"
                value={fbTxt}
                onChange={(e) => setFbTxt(e.target.value)}
                placeholder="Hva satt, hva satt ikke"
                style={{
                  minHeight: 44,
                  padding: "0 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border-hairline)",
                  background: "var(--surface-flat)",
                  color: "var(--text-primary)",
                  font: "var(--type-body)",
                }}
              />
            </div>

            <div>
              <button
                type="button"
                disabled={!fbRating || isPending}
                onClick={handleSendTilbakemelding}
                className="pa-btn pa-btn--primary"
                style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Send size={16} />
                <span>Send tilbakemelding</span>
              </button>
            </div>
          </Kort>

          {/* Tidligere tilbakemeldinger */}
          <Kort pad={16} gap={8}>
            <span className="kicker" style={{ paddingBottom: 4 }}>
              Tidligere
            </span>
            {feedbackList.length === 0 ? (
              <p style={{ margin: "8px 0", font: "var(--type-body-s)", color: "var(--text-muted)" }}>—</p>
            ) : (
              feedbackList.map((f, i) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "12px 0",
                    borderTop: i > 0 ? "1px solid var(--border-hairline)" : "none",
                  }}
                >
                  <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    {f.session}
                  </span>
                  <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{f.text}</span>
                  <Meta>
                    {f.from === "me" ? `DU · DAGSFORM ${f.rating} / 5` : (data.coach?.name?.toUpperCase() ?? "COACH")} ·{" "}
                    {f.t}
                  </Meta>
                </div>
              ))
            )}
          </Kort>
        </div>
      )}

      {/* FANE: VIDEOER (vid) */}
      {tab === "vid" && (
        <div>
          {videos.length === 0 ? (
            <TomTilstand
              icon={Video}
              title={`Ingen videoer fra ${data.coach?.name?.split(" ")[0] ?? "Anders"}`}
              text="Videoer fra timene dine dukker opp her."
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 12 }}>
              {videos.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => showToast("Spiller av", `${v.title.toUpperCase()} · ${v.len}`)}
                  className="pa-card pa-card--interactive"
                  style={{ padding: 0, overflow: "hidden", textAlign: "left", font: "inherit", cursor: "pointer", border: "1px solid var(--border-hairline)" }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 9",
                      background: "var(--surface-flat)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Video size={36} style={{ color: "var(--text-muted)" }} />
                    <span
                      style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        padding: "3px 6px",
                        borderRadius: "var(--radius-inner)",
                        background: "var(--surface-inverse)",
                        color: "var(--text-inverse)",
                        font: "500 11px/1 var(--font-mono)",
                      }}
                    >
                      {v.len}
                    </span>
                  </div>
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                      {v.title}
                    </span>
                    <Meta>
                      {data.coach?.name?.toUpperCase() ?? "COACH"} · {v.date}
                      {v.seen ? " · SETT" : " · NY"}
                    </Meta>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FANE: PLANER (plan) */}
      {tab === "plan" && (
        <Stabel>
          {plans.length === 0 ? (
            <TomTilstand
              icon={CalendarRange}
              title={`Ingen planer fra ${data.coach?.name?.split(" ")[0] ?? "Anders"}`}
              text="Når coachen sender en ukeplan, godtar eller avviser du den her."
            />
          ) : (
            plans.map((p) => (
              <Kort key={p.id} pad={16} gap={12}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ font: "var(--type-title-s)", color: "var(--text-primary)", flex: "1 1 200px" }}>
                    {p.title}
                  </span>
                  <StatusPille tone={p.status === "Godtatt" ? "ok" : p.status === "Avvist" ? "warn" : "neutral"}>
                    {p.status}
                  </StatusPille>
                </div>
                <Meta>
                  {p.sessions} ØKTER · {p.hours.toUpperCase()} · SENDT {p.sent}
                </Meta>
                {p.status === "Venter på spiller" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handlePlanResponse(p.id, "Godtatt")}
                      className="pa-btn pa-btn--primary"
                      style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Check size={16} />
                      <span>Godta plan</span>
                    </button>
                    <KnappLenke variant="secondary" href="/portal/planlegge">
                      Se i Plan
                    </KnappLenke>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handlePlanResponse(p.id, "Avvist")}
                      className="pa-btn pa-btn--ghost"
                      style={{ minHeight: 44 }}
                    >
                      Avvis
                    </button>
                  </div>
                )}
              </Kort>
            ))
          )}
        </Stabel>
      )}

      {/* FANE: ØNSKET ØKT (ønske) */}
      {tab === "ønske" && (
        <div className="pa-card" style={{ padding: 16, gap: 16, maxWidth: 640 }}>
          <span className="kicker">Ønsket økt</span>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
            Be om en økt eller et tema. {data.coach?.name?.split(" ")[0] ?? "Anders"} legger den inn i planen hvis det
            passer.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>DAG</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Man 28.09", "Tir 29.09", "Ons 30.09", "Tor 01.10"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setWDay(d)}
                  style={{
                    minHeight: 44,
                    padding: "0 14px",
                    borderRadius: "var(--radius-pill)",
                    border: wDay === d ? "1px solid var(--primary)" : "1px solid var(--border-strong)",
                    background: wDay === d ? "var(--primary)" : "var(--surface-card)",
                    color: wDay === d ? "var(--text-on-primary)" : "var(--text-primary)",
                    font: "var(--type-label)",
                    cursor: "pointer",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>OMRÅDE</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Utslag", "Innspill", "Nærspill", "Putting", "Banespill"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setWArea(a)}
                  style={{
                    minHeight: 44,
                    padding: "0 14px",
                    borderRadius: "var(--radius-pill)",
                    border: wArea === a ? "1px solid var(--primary)" : "1px solid var(--border-strong)",
                    background: wArea === a ? "var(--primary)" : "var(--surface-card)",
                    color: wArea === a ? "var(--text-on-primary)" : "var(--text-primary)",
                    font: "var(--type-label)",
                    cursor: "pointer",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>HVA VIL DU JOBBE MED?</label>
            <input
              type="text"
              value={wTxt}
              onChange={(e) => setWTxt(e.target.value)}
              placeholder="Lengdekontroll 50–70 m før klubbmesterskapet"
              style={{
                minHeight: 44,
                padding: "0 12px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border-hairline)",
                background: "var(--surface-flat)",
                color: "var(--text-primary)",
                font: "var(--type-body)",
              }}
            />
          </div>

          {wSent ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <StatusPille tone="neutral">Sendt</StatusPille>
              <Meta>
                {wDay.toUpperCase()} · {wArea.toUpperCase()} · VENTER PÅ {data.coach?.name?.toUpperCase() ?? "ANDERS"}
              </Meta>
            </div>
          ) : (
            <div>
              <button
                type="button"
                disabled={!wTxt.trim() || isPending}
                onClick={handleSendOnske}
                className="pa-btn pa-btn--primary"
                style={{ minHeight: 44, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Send size={16} />
                <span>Send ønske</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Side>
  );
}
