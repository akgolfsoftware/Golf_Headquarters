/**
 * PlayerHQ · Booking — landingsside
 *
 * Implementert fra Booking-flyt landingsside.html (Bundle 3 design).
 * 6-stegs booking-flyt: Lokasjon → Trener → Coaching-type → Dato/tid → Betaling → Bekreftet
 *
 * Steg 1 (velg lokasjon) vises på denne siden. De øvrige stegene
 * er separate ruter som lenkes fra step-actions-knappene.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  MapPin,
  Check,
  Users,
  ShieldCheck,
  ArrowRight,
  Star,
} from "lucide-react";
import "@/components/booking/booking.css";

export const metadata = {
  title: "Book coaching — AK Golf",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Lokasjon = {
  id: string;
  navn: string;
  sted: string;
  tagline: string;
  pill: string;
  pillType: "lime" | "normal";
  trenere: number;
  aapent: string;
  fasiliteter: string[];
  anbefalt?: boolean;
};

type CoachInfo = {
  id: string;
  navn: string;
  initialer: string;
  rolle: string;
  bio: string;
  rating: string;
  elever: number;
  erfaring: string;
  fraPris: string;
  ribbon?: string;
  ribbonType?: "lime" | "cream";
  tags: string[];
};

// ---------------------------------------------------------------------------
// Static data (erstattes med Prisma-queries når Location-seed er utfylt)
// ---------------------------------------------------------------------------

const LOKASJONER: Lokasjon[] = [
  {
    id: "gfgk",
    navn: "Gamle Fredrikstad Golfklubb",
    sted: "Fredrikstad",
    tagline:
      "Hjemmebanen vår. 9-hulls par 3-bane, Performance Studio med Trackman 4 og to-kamera-system — best for tek-arbeid året rundt.",
    pill: "Anbefalt",
    pillType: "lime",
    trenere: 5,
    aapent: "07–22",
    fasiliteter: [
      "2. etg. driving range",
      "Putting green",
      "Nærspillsgreen",
      "Performance Studio",
      "9 hull · par 3-bane",
    ],
    anbefalt: true,
  },
  {
    id: "miklagard",
    navn: "Miklagard Golfklubb",
    sted: "Kløfta",
    tagline:
      "Vårt sekundære anlegg — Norges mest prestisjetunge mesterskapsbane. Best for spill-trening på en utfordrende layout.",
    pill: "Nytt anlegg",
    pillType: "normal",
    trenere: 3,
    aapent: "06–22",
    fasiliteter: [
      "2. etg. Trackman driving range",
      "2 × Performance Golf Studio",
      "Stor putting green",
      "Nærspillsgreen",
      "State-of-the-art wedge-område",
    ],
  },
];

const COACHES: CoachInfo[] = [
  {
    id: "anders",
    navn: "Anders Kristiansen",
    initialer: "AK",
    rolle: "Head Coach · AK Golf Academy",
    bio: "«Spesialitet: TrackMan-tall + scoring + mental struktur som holder under press. Passer best for golfere som er klare for målbar progresjon og vil ha en plan å jobbe ut fra.»",
    rating: "4,9",
    elever: 38,
    erfaring: "15 år",
    fraPris: "600 kr / 20 min",
    ribbon: "Mest brukt",
    ribbonType: "lime",
    tags: ["Tek", "Slag", "Spill", "Turn"],
  },
  {
    id: "markus",
    navn: "Markus Røinås Pedersen",
    initialer: "MR",
    rolle: "Sportslig leder junior · GFGK",
    bio: "«Tålmodig og lekent fokus på grunnleggende mekanikk. Den ideelle starten hvis du er ny til golfen eller har høyt handicap og vil bygge fundamentet riktig.»",
    rating: "4,8",
    elever: 18,
    erfaring: "4 år",
    fraPris: "300 kr / 20 min",
    ribbon: "Junior",
    ribbonType: "cream",
    tags: ["Tek", "Fys", "Spill"],
  },
];

const COACHING_TYPER = [
  {
    id: "privat",
    ikon: "person",
    navn: "Privat coaching",
    tags: [{ label: "Populær", type: "lime" as const }],
    beskrivelse:
      "En-til-en-session med din coach. Full Trackman-analyse, video-gjennomgang og en konkret plan du tar med hjem.",
    features: [
      { label: "Varighet", verdi: "20 / 45 / 60 min" },
      { label: "Plasser", verdi: "1" },
      { label: "Trackman", verdi: "inkludert" },
    ],
    fraPris: "600",
    per: "kr / 20 min",
  },
  {
    id: "gruppe",
    ikon: "users",
    navn: "Gruppe-coaching",
    tags: [{ label: "Best verdi", type: "forest" as const }],
    beskrivelse:
      "Maks 4 spillere. Coach deler tid likt men alle får individuell feedback. Sosialt og kostnadseffektivt.",
    features: [
      { label: "Varighet", verdi: "60 / 90 min" },
      { label: "Plasser", verdi: "2–4" },
      { label: "Trackman", verdi: "per gruppe" },
    ],
    fraPris: "249",
    per: "kr / pers / 60 min",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BookingLandingsside() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Hent eventuelle aktive lokasjoner fra DB (ellers brukes static fallback)
  const dbLokasjoner = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    take: 10,
  });

  const visLokasjoner = dbLokasjoner.length > 0 ? dbLokasjoner : null;

  return (
    <div className="bk-scope space-y-8 pb-16">
      {/* ── Steg-hero ── */}
      <div className="bk-step-hero">
        <div className="bk-step-eyebrow">
          <span className="bk-num">1</span>Velg lokasjon
        </div>
        <h1>
          Hvor vil du <em>trene</em>?
        </h1>
        <p className="bk-lede">
          Vi har to anlegg med Trackman, video-analyse og innendørs studio.{" "}
          <strong>Begge har samme priser</strong> — velg det som ligger nærmest
          deg.
        </p>
      </div>

      {/* ── Stepper ── */}
      <div className="bk-stepper">
        <div className="bk-stepper-item active">
          <span className="bk-n">1</span>Lokasjon
        </div>
        <div className="bk-stepper-sep" />
        <div className="bk-stepper-item">
          <span className="bk-n">2</span>Trener
        </div>
        <div className="bk-stepper-sep" />
        <div className="bk-stepper-item">
          <span className="bk-n">3</span>Coaching
        </div>
        <div className="bk-stepper-sep" />
        <div className="bk-stepper-item">
          <span className="bk-n">4</span>Dato &amp; tid
        </div>
        <div className="bk-stepper-sep" />
        <div className="bk-stepper-item">
          <span className="bk-n">5</span>Betaling
        </div>
        <div className="bk-stepper-sep" />
        <div className="bk-stepper-item">
          <span className="bk-n">6</span>Bekreftet
        </div>
      </div>

      {/* ── Lokasjonskort ── */}
      {visLokasjoner ? (
        <div className="bk-loc-grid">
          {visLokasjoner.map((loc) => (
            <Link
              key={loc.id}
              href={`/portal/booking/anlegg/${loc.id}`}
              className="bk-loc-card block no-underline"
            >
              <div
                className="bk-loc-hero"
                style={{ backgroundColor: "#062b1c" }}
              >
                <div className="bk-loc-badge-row">
                  <span className="bk-loc-pill">Aktiv</span>
                  <span className="bk-loc-check">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </div>
                <h3>{loc.name}</h3>
                <div className="bk-loc-where">
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  Norge
                </div>
              </div>
              <div className="bk-loc-body">
                <div className="bk-loc-tagline">
                  Klikk for å se tilgjengelige tider.
                </div>
                <div className="bk-loc-meta-grid">
                  <div className="bk-loc-meta">
                    <div className="bk-lbl">Bane</div>
                    <div className="bk-val">{loc.name}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bk-loc-grid">
          {LOKASJONER.map((loc) => (
            <Link
              key={loc.id}
              href={`/portal/booking/anlegg/${loc.id}`}
              className="bk-loc-card block no-underline"
            >
              <div
                className="bk-loc-hero"
                style={{ backgroundColor: "#062b1c" }}
              >
                <div className="bk-loc-badge-row">
                  <span
                    className={`bk-loc-pill ${loc.pillType === "lime" ? "lime" : ""}`}
                  >
                    {loc.pill}
                  </span>
                  <span className="bk-loc-check">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </div>
                <h3>{loc.navn}</h3>
                <div className="bk-loc-where">
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {loc.sted}
                </div>
              </div>
              <div className="bk-loc-body">
                <div className="bk-loc-tagline">{loc.tagline}</div>
                <div className="bk-fac-chips">
                  {loc.fasiliteter.map((f) => (
                    <span key={f} className="bk-fac-chip">
                      <Check
                        className="h-2.5 w-2.5 text-primary"
                        strokeWidth={2}
                      />
                      {f}
                    </span>
                  ))}
                </div>
                <div className="bk-loc-meta-grid">
                  <div className="bk-loc-meta">
                    <div className="bk-lbl">Trenere</div>
                    <div className="bk-val">{loc.trenere}</div>
                  </div>
                  <div className="bk-loc-meta">
                    <div className="bk-lbl">Åpent</div>
                    <div className="bk-val">{loc.aapent}</div>
                  </div>
                  <div className="bk-loc-meta">
                    <div className="bk-lbl">Bane</div>
                    <div className="bk-val">✓</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Steg 2: Velg trener ── */}
      <div>
        <div className="bk-step-hero mt-12">
          <div className="bk-step-eyebrow">
            <span className="bk-num">2</span>Velg trener
          </div>
          <h1>
            Hvem vil du <em>trene med</em>?
          </h1>
          <p className="bk-lede">
            Hver trener har sitt eget fokusområde og prisnivå.{" "}
            <strong>Bla gjennom bio og spesialitet</strong> — du kan alltids
            bytte coach senere.
          </p>
        </div>

        <div className="bk-sel-loc-strip">
          <span className="bk-av">GFGK</span>
          <div>
            <div className="bk-loc-label">Lokasjon</div>
            <div className="bk-loc-val">Gamle Fredrikstad Golfklubb</div>
          </div>
          <Link href="/portal/booking" className="bk-change">
            Endre
          </Link>
        </div>

        <div className="bk-coach-grid">
          {COACHES.map((coach) => (
            <Link
              key={coach.id}
              href={`/portal/booking/coach/${coach.id}`}
              className="bk-coach-card-pub block no-underline"
            >
              {coach.ribbon && (
                <span
                  className={`bk-coach-ribbon ${coach.ribbonType === "cream" ? "cream" : ""}`}
                >
                  {coach.ribbon}
                </span>
              )}
              <div className="bk-coach-photo">{coach.initialer}</div>
              <div>
                <h3>{coach.navn}</h3>
                <div className="bk-coach-role">{coach.rolle}</div>
              </div>
              <p className="bk-coach-bio">{coach.bio}</p>
              <div className="bk-coach-specs">
                {coach.tags.map((t) => (
                  <span key={t} className="bk-spec-chip">
                    {t}
                  </span>
                ))}
              </div>
              <div className="bk-coach-meta-row">
                <span>
                  <Star
                    className="inline h-3 w-3 fill-current"
                    strokeWidth={0}
                  />{" "}
                  <strong>{coach.rating}</strong> · {coach.elever} elever
                </span>
                <span>{coach.erfaring} erfaring</span>
              </div>
              <div className="bk-coach-price-row">
                <span className="bk-from">Fra</span>
                <span className="bk-price">{coach.fraPris}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Steg 3: Velg coaching-type ── */}
      <div>
        <div className="bk-step-hero mt-12">
          <div className="bk-step-eyebrow">
            <span className="bk-num">3</span>Velg coaching-type
          </div>
          <h1>
            Hva passer best for <em>deg</em>?
          </h1>
          <p className="bk-lede">
            Velg mellom privat en-til-en og gruppe-coaching.{" "}
            <strong>Begge gir full Trackman-analyse</strong> — pris og
            gruppestørrelse varierer.
          </p>
        </div>

        <div className="bk-coaching-list">
          {COACHING_TYPER.map((ct) => (
            <Link
              key={ct.id}
              href={`/portal/booking/ny?type=${ct.id}`}
              className="bk-coaching-card block no-underline"
            >
              <div className="bk-coaching-icon">
                {ct.ikon === "person" ? (
                  <Users className="h-8 w-8" strokeWidth={1.5} />
                ) : (
                  <Users className="h-8 w-8" strokeWidth={1.5} />
                )}
              </div>
              <div className="bk-coaching-body">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3>{ct.navn}</h3>
                  {ct.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={`bk-pill-tag ${tag.type}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <p className="bk-desc">{ct.beskrivelse}</p>
                <div className="bk-features">
                  {ct.features.map((f) => (
                    <span key={f.label} className="bk-feature">
                      <Check
                        className="h-3 w-3 text-primary"
                        strokeWidth={2}
                      />
                      {f.label}: <strong>{f.verdi}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div className="bk-coaching-right">
                <div className="bk-from">Fra</div>
                <div className="bk-price">{ct.fraPris}</div>
                <div className="bk-per">{ct.per}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Steg-actions (hopp til booking-wizard) ── */}
      <div className="bk-step-actions">
        <span className="bk-meta">
          Velg coaching-type ovenfor for å gå til kalender og tid
        </span>
        <Link href="/portal/booking/ny" className="bk-btn-lime">
          Book direkte
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      {/* ── Trust-strip ── */}
      <div className="bk-trust-strip">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <span>
          <strong>Trygg booking.</strong> Bekreftet på e-post og i appen.
          Avbestilling gratis inntil 24t før økt.
        </span>
      </div>
    </div>
  );
}
