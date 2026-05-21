/**
 * Integrasjoner — /portal/meg/innstillinger/integrasjoner
 * Implementering av "Integrasjoner.html" fra Claude Design-bundlen.
 *
 * Settings-shell med side-rail + main-pane:
 *  - Header med eyebrow-crumb og Instrument Serif italic
 *  - 4-celle summary-strip (Tilkoblet/Sist synket/Nye rader/Datapunkter)
 *  - Tilkoblet-grid (GolfBox, TrackMan, Apple Health)
 *  - Tilgjengelig-grid (TrackMan Connect, Strava, Garmin, Spotify PRO, Kalender)
 *  - Help-footer
 */

import Link from "next/link";
import {
  Settings,
  Bell,
  Lock,
  CreditCard,
  Link2,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import "@/components/meg/meg.css";

export const dynamic = "force-dynamic";

export default async function IntegrasjonerPage() {
  const user = await requirePortalUser();

  const [tmCount, tmLast, gcal] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.trackManSession
      .findFirst({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        select: { recordedAt: true, shotCount: true, source: true },
      })
      .catch(() => null),
    prisma.googleCalendarConnection
      .findUnique({ where: { userId: user.id } })
      .catch(() => null),
  ]);

  const tmConnected = tmCount > 0;
  const tmSync = tmLast
    ? `${tmLast.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${tmLast.recordedAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`
    : "Ikke synket enda";
  const tmLastSession = tmLast
    ? `${tmLast.shotCount} shots · ${tmLast.source ?? "TrackMan"}`
    : "—";

  const gcalConnected = !!gcal;

  // Telling for summary
  const connectedCount = 2 + (tmConnected ? 1 : 0) + (gcalConnected ? 1 : 0); // GolfBox + Apple Health always-on i denne demoen
  const totalCount = 8;

  return (
    <div className="meg-scope">
      <nav className="meg-topnav">
        <Link href="/portal/meg/innstillinger" className="back-link">
          <ArrowRight size={14} aria-hidden style={{ transform: "rotate(180deg)" }} /> Tilbake
        </Link>
        <span className="name">AK GOLF · PLAYERHQ</span>
        <span className="crumbs">
          PORTAL / MEG / INNSTILLINGER / <span className="current">INTEGRASJONER</span>
        </span>
      </nav>

      <div className="meg-settings-shell">
        {/* ===== SIDE RAIL ===== */}
        <aside className="meg-side-rail" aria-label="Innstillinger-meny">
          <div className="meg-rail-label">Konto</div>
          <Link href="/portal/meg/innstillinger">
            <Settings size={14} aria-hidden /> Profil
          </Link>
          <Link href="/portal/meg/innstillinger/varsler">
            <Bell size={14} aria-hidden /> Varsler
          </Link>
          <Link href="/portal/meg/innstillinger/personvern">
            <Lock size={14} aria-hidden /> Personvern
          </Link>
          <Link href="/portal/meg/abonnement">
            <CreditCard size={14} aria-hidden /> Abonnement
          </Link>

          <div className="meg-rail-label mt">Data</div>
          <Link href="/portal/meg/innstillinger/integrasjoner" className="active">
            <Link2 size={14} aria-hidden /> Integrasjoner
          </Link>
          <Link href="/portal/meg/innstillinger/eksport">
            <RefreshCw size={14} aria-hidden /> Eksport
          </Link>

          <div className="meg-rail-label mt">Støtte</div>
          <Link href="/portal/meg/help">
            <HelpCircle size={14} aria-hidden /> Hjelpesenter
          </Link>
          <Link href="/portal/meg/help/kontakt">
            <MessageSquare size={14} aria-hidden /> Kontakt support
          </Link>
        </aside>

        {/* ===== MAIN ===== */}
        <main>
          <div className="meg-ph">
            <div className="meg-ph-eyebrow-row">
              <span>Innstillinger</span>
              <span className="dot" />
              <span>Data</span>
              <span className="dot" />
              <span>Integrasjoner</span>
            </div>
            <h1>
              Koble til der <em>data finnes</em>
            </h1>
            <div className="meg-ph-sub">
              Koble PlayerHQ til eksterne tjenester slik at handicap, runder, shot-data, søvn og puls
              samles ett sted — uten manuell jobb.
            </div>
          </div>

          {/* Summary strip */}
          <div className="meg-summary" role="group" aria-label="Status oversikt">
            <div className="meg-summary-cell">
              <span className="lbl">Tilkoblet</span>
              <span className="val">
                {connectedCount}
                <small>/ {totalCount}</small>
              </span>
              <span className="delta muted">aktive kilder</span>
            </div>
            <div className="meg-summary-cell">
              <span className="lbl">Sist synket</span>
              <span className="val">
                {tmLast
                  ? tmLast.recordedAt.toLocaleTimeString("nb-NO", { hour: "2-digit" })
                  : "—"}
                <small>
                  :{tmLast ? tmLast.recordedAt.toLocaleTimeString("nb-NO", { minute: "2-digit" }).slice(-2) : "--"}
                </small>
              </span>
              <span className="delta muted">
                {tmLast ? tmLast.recordedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" }) : "i dag"}
              </span>
            </div>
            <div className="meg-summary-cell">
              <span className="lbl">Nye rader</span>
              <span className="val">{tmLast?.shotCount ?? 0}</span>
              <span className="delta">siste 24 t</span>
            </div>
            <div className="meg-summary-cell">
              <span className="lbl">Datapunkter</span>
              <span className="val">{(tmCount * 47).toLocaleString("nb-NO")}</span>
              <span className="delta muted">totalt</span>
            </div>
          </div>

          {/* Tilkoblet */}
          <div className="meg-int-sec-h">
            <h2>Tilkoblet</h2>
            <span className="count">{connectedCount} aktive</span>
          </div>
          <div className="meg-int-grid">
            <IntegrationCard
              status="on"
              name="GolfBox"
              category="Handicap · Runder"
              description="Handicap, registrerte runder og klubb-medlemskap synkes automatisk fra norske golfklubber."
              data={[
                { k: "Sist synket", v: "19.05.2026 · 08:23" },
                { k: "Siste runde", v: `${user.homeClub ?? "GFGK"} · 18.05 · 74` },
              ]}
              logo={
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#0B5F30" />
                  <path
                    d="M12 6.5a5.5 5.5 0 1 0 5.5 5.5h-4.5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              }
            />
            {tmConnected ? (
              <IntegrationCard
                status="on"
                name="TrackMan Performance Studio"
                category="Shot-data · Range-økter"
                description="Klubb-data, ballhastighet, launch og spin per shot fra studio-økter ved AK Golf-anlegget."
                data={[
                  { k: "Sist synket", v: tmSync },
                  { k: "Siste økt", v: tmLastSession },
                ]}
                logo={
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A0A0A" />
                    <circle cx="9" cy="12" r="2.5" fill="#FF6B00" />
                    <path
                      d="M9 12 L18 8 M9 12 L18 12 M9 12 L18 16"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
            ) : null}
            <IntegrationCard
              status="on"
              name="Apple Health"
              category="Søvn · Puls · HRV"
              description="Søvnkvalitet, hvilepuls og HRV fra iPhone og Apple Watch — brukes til form og restitusjons-trender."
              data={[
                { k: "Sist synket", v: "19.05.2026 · 06:00" },
                { k: "I natt", v: "7 t 12 min · HRV 64 ms" },
              ]}
              logo={
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="#FBFAF8" />
                  <path
                    d="M12 17.5s-5.5-3.4-5.5-7.5a3 3 0 0 1 5.5-1.7A3 3 0 0 1 17.5 10c0 4.1-5.5 7.5-5.5 7.5z"
                    fill="#FB2F4D"
                  />
                </svg>
              }
            />
            {gcalConnected ? (
              <IntegrationCard
                status="on"
                name="Google Calendar"
                category="Kalender-synk"
                description="Push planlagte og fullførte økter til Google Calendar (én-veis)."
                data={[
                  { k: "Sist synket", v: gcal?.updatedAt.toLocaleString("nb-NO") ?? "—" },
                  { k: "Status", v: "Aktiv" },
                ]}
                logo={
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="#0A1F17" strokeWidth="1.6" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#0A1F17" strokeWidth="1.4" />
                    <line x1="8" y1="3" x2="8" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="16" y1="3" x2="16" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="6" y="13" width="4" height="3" rx="0.5" fill="#FB2F4D" />
                    <rect x="14" y="13" width="4" height="3" rx="0.5" fill="#005840" />
                  </svg>
                }
              />
            ) : null}
          </div>

          {/* Tilgjengelig */}
          <div className="meg-int-sec-h">
            <h2>Tilgjengelig</h2>
            <span className="count">{totalCount - connectedCount} ikke tilkoblet</span>
          </div>
          <div className="meg-int-grid">
            {!tmConnected ? (
              <IntegrationCard
                status="off"
                name="TrackMan Connect"
                category="Personlige range-økter"
                description="Range-økter fra TrackMan-baser utenfor AK Golf — Driving Range, Bayhill og andre offentlige anlegg."
                logo={
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A0A0A" />
                    <circle cx="9" cy="12" r="2.5" fill="#FF6B00" />
                    <path d="M14 9.5 L18 12 L14 14.5 Z" fill="#fff" />
                  </svg>
                }
              />
            ) : null}
            <IntegrationCard
              status="off"
              name="Strava"
              category="Kondisjon · Løping · Sykling"
              description="Kondisjons-økter (løping, sykling, tur) logges som FYS-økter i pyramiden din."
              logo={
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#FC4C02" />
                  <path d="M9 17 L13.5 9 L17 15 L14.5 15 L13.5 13 L11.5 17 Z" fill="#fff" />
                </svg>
              }
            />
            <IntegrationCard
              status="off"
              name="Garmin Connect"
              category="Steg · Treningsintensitet"
              description="Daglige steg, hvilepuls, body-battery og treningsbelastning fra Garmin-klokken."
              logo={
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#000" />
                  <path
                    d="M12 6 L17 17 L7 17 Z"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M12 11 L14 15 L10 15 Z" fill="#007CC3" />
                </svg>
              }
            />
            <IntegrationCard
              status="off"
              name="Spotify"
              category="Treningsplaylister"
              description="Knytt egne playlister til økt-typer. Starter automatisk når du trykker «Start økt»."
              proBadge
              logo={
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#1DB954" />
                  <path d="M7 10c3-1 7-1 10 1" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M8 13c2.5-.8 5.5-.8 8 .8" stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                  <path d="M9 15.6c2-.5 4-.4 5.8.6" stroke="#000" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
              }
            />
            {!gcalConnected ? (
              <IntegrationCard
                status="off"
                name="Google Calendar & Apple Calendar"
                category="Kalender-synk"
                description="Push planlagte og fullførte økter til din personlige kalender. Velg én eller begge tjenester — synkroniseringen går én vei (PlayerHQ → kalender)."
                spanTwo
                multipleConnect={["Google", "Apple"]}
                logo={
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="#0A1F17" strokeWidth="1.6" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#0A1F17" strokeWidth="1.4" />
                    <line x1="8" y1="3" x2="8" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="16" y1="3" x2="16" y2="7" stroke="#0A1F17" strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="6" y="13" width="4" height="3" rx="0.5" fill="#FB2F4D" />
                    <rect x="14" y="13" width="4" height="3" rx="0.5" fill="#005840" />
                  </svg>
                }
              />
            ) : null}
          </div>

          {/* Help footer */}
          <div className="meg-help-foot">
            <div className="ico" aria-hidden>
              <HelpCircle size={22} />
            </div>
            <div className="txt">
              <div className="t">Får du ikke koblet til?</div>
              <div className="s">
                Vi har laget en kort guide for hver tjeneste. Eller send oss et spørsmål — vi svarer
                innen 4 timer på hverdager.
              </div>
            </div>
            <Link href="/portal/meg/help/kontakt" className="lnk">
              Kontakt support <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// Card subcomponent
// ============================================================

interface IntegrationCardProps {
  status: "on" | "off";
  name: string;
  category: string;
  description: string;
  data?: { k: string; v: string }[];
  logo: React.ReactNode;
  proBadge?: boolean;
  spanTwo?: boolean;
  multipleConnect?: string[];
}

function IntegrationCard(props: IntegrationCardProps) {
  return (
    <div
      className="meg-icard"
      style={props.spanTwo ? { gridColumn: "span 2" } : undefined}
    >
      {props.proBadge ? <span className="meg-badge-pro">PRO</span> : null}
      <div className="meg-icard-head">
        <div className="meg-icard-logo">{props.logo}</div>
        <div className="meg-icard-meta">
          <div className="meg-icard-name">{props.name}</div>
          <div className="meg-icard-cat">{props.category}</div>
        </div>
        <span className={`meg-icard-status ${props.status}`}>
          <span className="dot" />
          {props.status === "on" ? "Tilkoblet" : "Ikke tilkoblet"}
        </span>
      </div>
      <div className="meg-icard-desc">{props.description}</div>
      {props.data ? (
        <div className="meg-icard-data">
          {props.data.map((d, i) => (
            <div key={i} className="row">
              <span className="k">{d.k}</span>
              <span className="v">{d.v}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="meg-icard-foot">
        {props.status === "on" ? (
          <>
            <button type="button" className="btn">Administrer</button>
            <button type="button" className="btn-ghost-icon" aria-label="Synk på nytt" title="Synk på nytt">
              <RefreshCw size={15} aria-hidden />
            </button>
          </>
        ) : props.multipleConnect ? (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              {props.multipleConnect.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={`btn ${i === 0 ? "btn-forest" : ""}`}
                >
                  <Link2 size={13} aria-hidden /> Koble til {label}
                </button>
              ))}
            </div>
            <button type="button" className="btn-ghost-icon" aria-label="Mer info" title="Mer info">
              <HelpCircle size={15} aria-hidden />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-forest">
              <Link2 size={13} aria-hidden /> Koble til
            </button>
            <button type="button" className="btn-ghost-icon" aria-label="Mer info" title="Mer info">
              <HelpCircle size={15} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
