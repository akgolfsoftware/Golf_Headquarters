"use client";

/* AK Golf HQ v2 — MARKEDSSIDE: Kontakt (/kontakt, akgolf.no, retning C «Presis»).
   Rekomponering av den eksisterende /kontakt-siden (mlegacy) med v2-idiomer.
   Ekte copy hentet 1:1 fra src/app/(marketing)/(mlegacy)/kontakt/page.tsx.

   Skjemaet bruker SAMME server-action (sendKontaktMelding fra ./actions,
   flyttet 1:1 fra mlegacy) og SAMME feltnavn (navn/epost/telefon/tema/melding)
   som originalen — kun visuelt rekomponert med v2-skjema-primitiver
   (Inndata/Velger/TekstOmraade) speilet til skjulte name-felt, siden disse
   primitivene er kontrollerte komponenter uten native `name`-prop.

   Marketing-rammen (MNav/MFot/MRamme) og tekst-idiomene er lokale i denne
   fila, samme mønster som MarkedForsideV2/MarkedPriserV2. */

import { useActionState, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { MMobilMeny } from "./marked-ramme";
import { T } from "@/lib/v2/tokens";
import { Icon, LogoAK, Caps, Kort } from "@/components/v2";
import { Inndata, Velger, TekstOmraade } from "@/components/v2/skjema";
import { sendKontaktMelding, type KontaktFormState } from "@/app/(marketing)/kontakt/actions";

/* ── Marketing-tokens (samme skala som forsiden/priser) ── */
const M = {
  heroD: 56,
  heroM: 36,
  seksD: 30,
  seksM: 24,
  lede: 16.5,
  padDY: 96,
  padDX: 64,
  padMY: 56,
  padMX: 22,
  maxw: 1040,
};

function useMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/* ── Ramme: toppnav + innhold + footer ─────────────────── */
const MNAV: { id: string; l: string; href: string }[] = [
  { id: "hjem", l: "Hjem", href: "/" },
  { id: "coaching", l: "Coaching", href: "/coaching" },
  { id: "playerhq", l: "PlayerHQ", href: "/playerhq" },
  { id: "priser", l: "Priser", href: "/priser" },
];

function MNav({ mobile, aktiv }: { mobile: boolean; aktiv: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: mobile ? "16px 22px" : "20px 64px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <LogoAK size={24} />
      </Link>
      {!mobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {MNAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              style={{
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                color: aktiv === n.id ? T.fg : T.fg2,
                textDecoration: "none",
                borderBottom: aktiv === n.id ? `2px solid ${T.lime}` : "2px solid transparent",
                paddingBottom: 2,
              }}
            >
              {n.l}
            </Link>
          ))}
        </div>
      )}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        {!mobile && (
          <Link
            href="/auth/login"
            style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}
          >
            Logg inn
          </Link>
        )}
        {mobile ? (
          <MMobilMeny aktiv={aktiv} />
        ) : (
          <MCta small href="/auth/signup">
            Kom i gang gratis
          </MCta>
        )}
      </span>
    </div>
  );
}

function MFot({ mobile }: { mobile: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${T.border}`,
        padding: mobile ? "32px 22px" : "40px 64px",
        display: "flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        <LogoAK size={18} color={T.mut} />
        <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>AK Golf Group AS · Fredrikstad</span>
      </span>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { l: "Coaching", href: "/coaching" },
          { l: "PlayerHQ", href: "/playerhq" },
          { l: "Priser", href: "/priser" },
          { l: "Book tid", href: "/booking" },
          { l: "Personvern", href: "/personvern" },
        ].map((f) => (
          <Link key={f.l} href={f.href} style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, textDecoration: "none" }}>
            {f.l}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MRamme({ mobile, aktiv, children }: { mobile: boolean; aktiv: string; children: ReactNode }) {
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        colorScheme: "dark",
        color: T.fg,
        fontFamily: T.ui,
        background: `radial-gradient(1100px 520px at 30% -10%, rgba(0,88,64,0.20), transparent 62%), ${T.bg}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MNav mobile={mobile} aktiv={aktiv} />
      <div style={{ flex: 1 }}>{children}</div>
      <MFot mobile={mobile} />
    </div>
  );
}

/* ── Tekst- og CTA-primitiver ───────────────────────────── */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Caps size={11} color={T.lime} style={{ marginBottom: 18 }}>
      {children}
    </Caps>
  );
}

function HeroT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h1
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.heroM : M.heroD,
        letterSpacing: "-0.035em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.05,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h1>
  );
}

function SeksT({ mobile, children, em }: { mobile: boolean; children: ReactNode; em?: string }) {
  return (
    <h2
      style={{
        fontFamily: T.disp,
        fontWeight: 700,
        fontSize: mobile ? M.seksM : M.seksD,
        letterSpacing: "-0.03em",
        color: T.fg,
        margin: 0,
        lineHeight: 1.08,
      }}
    >
      {children}
      {em && (
        <>
          {" "}
          <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em>
        </>
      )}
    </h2>
  );
}

function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ fontFamily: T.ui, fontSize: M.lede, color: T.fg2, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>
      {children}
    </p>
  );
}

function MCta({
  children,
  ghost,
  small,
  icon,
  href,
  type,
  disabled,
}: {
  children: ReactNode;
  ghost?: boolean;
  small?: boolean;
  icon?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: T.ui,
    fontWeight: 600,
    fontSize: small ? 13 : 15,
    color: ghost ? T.fg : T.onLime,
    background: ghost ? T.panel3 : T.lime,
    border: ghost ? `1px solid ${T.borderS}` : "none",
    borderRadius: 9999,
    padding: small ? "9px 18px" : "14px 28px",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.6 : 1,
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  const inner = (
    <>
      {children}
      {icon && <Icon name={icon} size={small ? 13 : 15} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} disabled={disabled} style={{ ...style, appearance: "none" }}>
      {inner}
    </button>
  );
}

function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ paddingTop: mobile ? M.padMY : M.padDY, paddingBottom: mobile ? M.padMY : M.padDY, paddingLeft: mobile ? M.padMX : M.padDX, paddingRight: mobile ? M.padMX : M.padDX, ...style }}>
      <div style={{ maxWidth: M.maxw, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

/* ── Skjema: SubmitKnapp med pending-state (useFormStatus) ─────────── */
function SubmitKnapp() {
  const { pending } = useFormStatus();
  return (
    <MCta type="submit" icon={pending ? undefined : "send"} disabled={pending}>
      {pending ? "Sender ..." : "Send melding"}
    </MCta>
  );
}

const TEMA_ALTERNATIV = ["Coaching", "Booking", "Annet"];

const KONTAKT_INITIAL: KontaktFormState = { status: "idle" };

function KontaktSkjema() {
  const [state, formAction] = useActionState(sendKontaktMelding, KONTAKT_INITIAL);
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tema, setTema] = useState(TEMA_ALTERNATIV[0]);
  const [melding, setMelding] = useState("");

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Skjulte felt speiler de kontrollerte v2-primitivene, siden action leser FormData */}
      <input type="hidden" name="navn" value={navn} readOnly />
      <input type="hidden" name="epost" value={epost} readOnly />
      <input type="hidden" name="telefon" value={telefon} readOnly />
      <input type="hidden" name="tema" value={tema} readOnly />
      <input type="hidden" name="melding" value={melding} readOnly />

      <Inndata label="Navn" value={navn} onChange={setNavn} placeholder="Ditt navn" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Inndata label="E-post" type="email" value={epost} onChange={setEpost} placeholder="din@epost.no" />
        <Inndata label="Telefon (valgfritt)" type="tel" value={telefon} onChange={setTelefon} placeholder="+47" />
      </div>
      <Velger label="Tema" options={TEMA_ALTERNATIV} value={tema} onChange={setTema} />
      <TekstOmraade label="Melding" value={melding} onChange={setMelding} rows={5} placeholder="Skriv noen ord ..." defaultValue="" />

      {state.status === "ok" && (
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${T.up}66`,
            background: "rgba(79,208,138,0.10)",
            padding: "13px 15px",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {state.melding}
        </div>
      )}
      {state.status === "feil" && (
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${T.down}66`,
            background: "rgba(240,104,62,0.10)",
            padding: "13px 15px",
            fontFamily: T.ui,
            fontSize: 13,
            color: T.fg,
          }}
        >
          {state.melding}
        </div>
      )}

      <div>
        <SubmitKnapp />
      </div>
    </form>
  );
}

/* ── Data (ekte copy fra mlegacy/kontakt) ─────────────────── */
const HOURS: { day: string; coaching: string; mulligan: string }[] = [
  { day: "Mandag", coaching: "09–20", mulligan: "07–00" },
  { day: "Tirsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Onsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Torsdag", coaching: "09–20", mulligan: "07–00" },
  { day: "Fredag", coaching: "09–17", mulligan: "07–00" },
  { day: "Lørdag", coaching: "10–14", mulligan: "07–00" },
  { day: "Søndag", coaching: "Stengt", mulligan: "07–00" },
];

const KONTAKT_FAQ: { q: string; a: string }[] = [
  { q: "Hvor raskt får jeg svar?", a: "Vi svarer på alle henvendelser innen 1 virkedag. Coaching-forespørsler prioriteres." },
  { q: "Trenger jeg medlemskap for å booke?", a: "Nei. Du kan booke enkelttimer eller en gratis kartleggings-økt uten medlemskap. Abonnement gir bedre pris per time." },
  { q: "Hvor holder dere til?", a: "Innendørs på Mulligan Indoor Golf i Fredrikstad og Sarpsborg, og utendørs på Gamle Fredrikstad Golfklubb fra mai til oktober." },
  { q: "Tar dere bedriftsevent?", a: "Ja. Send oss en melding med dato og antall deltakere, så lager vi et tilpasset opplegg." },
];

const ANLEGG: { place: string; address: string; note: string }[] = [
  { place: "Mulligan Indoor Golf Fredrikstad", address: "Produksjonsveien 21, 1618 Fredrikstad", note: "Innendørs · 4× TrackMan 4 · Åpent 07–00" },
  { place: "Mulligan Indoor Golf Sarpsborg", address: "Bjørnstadveien 12, 1712 Sarpsborg", note: "Innendørs · 2× TrackMan iO · Åpent 07–00" },
  { place: "Gamle Fredrikstad Golfklubb", address: "Torsnesveien 16, 1630 Gamle Fredrikstad", note: "Utendørs · Mai–oktober · 18 hull" },
];

function InfoRad({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>
        <Icon name={icon} size={14} style={{ color: T.mut }} />
        {label}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 13.5, fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   M-KONTAKT (/kontakt)
   ════════════════════════════════════════════════════════ */
export function MarkedKontaktV2() {
  const mobile = useMobile();
  const [open, setOpen] = useState(0);

  return (
    <MRamme mobile={mobile} aktiv="kontakt">
      {/* Hero */}
      <Seksjon mobile={mobile} style={{ paddingBottom: mobile ? 28 : 40 }}>
        <div style={{ maxWidth: 620 }}>
          <Eyebrow>Kontakt</Eyebrow>
          <HeroT mobile={mobile} em="høre fra deg">
            Vi vil gjerne
          </HeroT>
          <Lede style={{ marginTop: 20 }}>
            Spørsmål om coaching, junior-program eller bedriftsevent? Skriv noen ord under, eller ring oss direkte. Vi svarer innen 1 virkedag.
          </Lede>
        </div>
      </Seksjon>

      {/* Skjema + sidebar */}
      <Seksjon mobile={mobile} style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 2fr", gap: T.gap * 2 }}>
          <Kort pad="26px 26px 28px" eyebrow="Skjema · Svar innen 1 virkedag">
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, letterSpacing: "-0.02em", marginTop: 4 }}>
              Send oss en melding
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.6, margin: "10px 0 20px" }}>
              Vi leser hver melding personlig. Ingen automat-svar, ingen ventelister.
            </p>
            <KontaktSkjema />
          </Kort>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Kort pad="22px 22px 24px">
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, letterSpacing: "-0.02em" }}>
                Foretrekker du å ringe?
              </div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.55, margin: "8px 0 4px" }}>
                Ring eller send en SMS. Du kan også booke direkte på akgolf.no.
              </p>
              <div style={{ marginTop: 8 }}>
                <InfoRad icon="user" label="Anders Kristiansen" value="+47 482 16 540" />
                <InfoRad icon="mail" label="Bedriftshenvendelser" value="post@akgolf.no" />
                <InfoRad icon="mail" label="E-post · alt annet" value="post@akgolf.no" />
              </div>
            </Kort>

            <Kort tint pad="22px 22px 24px">
              <Eyebrow>Tips</Eyebrow>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, color: T.fg, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Vil du heller bare booke en <em style={{ fontStyle: "italic", color: T.lime }}>prøve-time</em>?
              </div>
              <div style={{ marginTop: 18 }}>
                <MCta small icon="arrow-right" href="/booking">
                  Book direkte
                </MCta>
              </div>
            </Kort>
          </div>
        </div>
      </Seksjon>

      {/* 3 kontakt-kort */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 8 : 12 }}>
        <Caps>Kontaktinfo</Caps>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 18 }}>
          <Kort pad="20px 20px 22px">
            <Caps color={T.mut}>E-post</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, marginTop: 8 }}>post@akgolf.no</div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0" }}>Vi svarer innen 1 virkedag.</p>
          </Kort>
          <Kort pad="20px 20px 22px">
            <Caps color={T.mut}>Telefon</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, marginTop: 8 }}>+47 482 16 540</div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0" }}>Anders Kristiansen · hverdager 09–17</p>
          </Kort>
          <Kort pad="20px 20px 22px">
            <Caps color={T.mut}>Selskap</Caps>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, marginTop: 8 }}>AK Golf Group AS</div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0" }}>Org.nr 927 248 581 · Fredrikstad</p>
          </Kort>
        </div>
      </Seksjon>

      {/* Åpningstider */}
      <Seksjon mobile={mobile}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: T.gap * 2 }}>
          <div>
            <Caps>Åpningstider</Caps>
            <SeksT mobile={mobile} em="komme">
              Når kan du
            </SeksT>
            <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 440 }}>
              Mulligan Indoor Golf er åpent 07–00 alle dager i Fredrikstad og Sarpsborg. Coaching-timer må bookes innenfor coachenes arbeidstid.
            </p>
          </div>
          <Kort pad="6px 0">
            {HOURS.map((h) => {
              const closed = h.coaching === "Stengt";
              return (
                <div
                  key={h.day}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "11px 20px",
                    borderBottom: `1px solid ${T.border}`,
                    fontFamily: T.ui,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: T.fg, fontWeight: 500 }}>{h.day}</span>
                  <span style={{ fontFamily: T.mono, color: closed ? T.mut : T.fg2, fontVariantNumeric: "tabular-nums" }}>{h.coaching}</span>
                  <span style={{ fontFamily: T.mono, color: T.fg2, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{h.mulligan}</span>
                </div>
              );
            })}
          </Kort>
        </div>
      </Seksjon>

      {/* Anlegg */}
      <Seksjon mobile={mobile}>
        <Caps>Anlegg · Øst</Caps>
        <SeksT mobile={mobile} em="frem">
          Finn
        </SeksT>
        <p style={{ fontFamily: T.ui, fontSize: 14, color: T.fg2, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 620 }}>
          Vi holder til på tre anlegg: Mulligan Indoor Golf i Fredrikstad og Sarpsborg for innendørs trening hele året, og Gamle Fredrikstad Golfklubb for utendørs sesong.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: T.gap, marginTop: 24 }}>
          {ANLEGG.map((a) => (
            <Kort key={a.place} pad="20px 20px 22px">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
                <Icon name="map-pin" size={13} style={{ color: T.lime }} />
                {a.note}
              </span>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, color: T.fg, marginTop: 10, letterSpacing: "-0.015em" }}>{a.place}</div>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0" }}>{a.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.lime, textDecoration: "none" }}
              >
                Vis i kart
                <Icon name="external-link" size={12} />
              </a>
            </Kort>
          ))}
        </div>
      </Seksjon>

      {/* FAQ */}
      <Seksjon mobile={mobile}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <Caps>FAQ</Caps>
          <SeksT mobile={mobile} em="vanlige spørsmål">
            Korte svar på
          </SeksT>
          <div
            style={{
              marginTop: 18,
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: T.rCard,
              padding: "4px 20px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            {KONTAKT_FAQ.map((f, i) => {
              const on = open === i;
              return (
                <div key={f.q} style={{ borderBottom: i === KONTAKT_FAQ.length - 1 ? "none" : `1px solid ${T.border}` }}>
                  <button
                    onClick={() => setOpen(on ? -1 : i)}
                    style={{
                      appearance: "none",
                      background: "none",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "16px 0",
                    }}
                  >
                    <span style={{ fontFamily: T.ui, fontSize: 14.5, fontWeight: 600, color: T.fg }}>{f.q}</span>
                    <Icon name={on ? "minus" : "plus"} size={15} style={{ color: on ? T.lime : T.mut, flex: "none" }} />
                  </button>
                  {on && <p style={{ fontFamily: T.ui, fontSize: 13.5, color: T.fg2, lineHeight: 1.65, margin: "0 0 17px", maxWidth: 560 }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </Seksjon>

      {/* Slutt-CTA */}
      <Seksjon mobile={mobile} style={{ paddingTop: mobile ? 24 : 40 }}>
        <div
          style={{
            borderRadius: 24,
            padding: mobile ? "40px 24px" : "64px 56px",
            textAlign: "center",
            background: `linear-gradient(135deg, ${T.forest} 0%, color-mix(in srgb, ${T.forest} 20%, ${T.bg}) 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Eyebrow>Klar når du er</Eyebrow>
          <SeksT mobile={mobile} em="komme i gang">
            Heller bare
          </SeksT>
          <p style={{ fontFamily: T.ui, fontSize: 14, color: "rgba(238,240,236,0.85)", lineHeight: 1.6, margin: "14px auto 0", maxWidth: 480 }}>
            Du trenger ikke vente på svar. Book en økt direkte, eller send oss en e-post om du vil ta det skriftlig først.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <MCta href="/booking" icon="arrow-right">
              Book en økt
            </MCta>
            <MCta ghost href="mailto:post@akgolf.no">
              Send oss en e-post
            </MCta>
          </div>
        </div>
      </Seksjon>
    </MRamme>
  );
}
