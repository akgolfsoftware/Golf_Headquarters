"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import s from "./forside-ds.module.css";

/**
 * Forsiden i AK Golf Design System (dagens designautoritet, 21.09.2026).
 *
 * Tegning: `ui_kits/akgolf-web/hjem.html` i Claude Design-prosjektet
 * «AK Golf Design System» (87aa23fb) — «papir over foto, coaching først.
 * Ingen scrim, ingen lånte effekter.» Verdiene ligger i
 * `forside-ds.module.css` og er masterens egne.
 *
 * Flaten tegner SITT EGET skall (topplinje og bunn), slik tegningen gjør.
 * `/forside-ny` står derfor i unntakslisten i `(marketing)/layout.tsx` —
 * uten det ville siden fått både MarkedNav og denne topplinja.
 *
 * Bevegelsen er valgfri: uten JavaScript og ved «redusert bevegelse» er siden
 * komplett — fotobåndet står stille på første bilde, og alt innhold er synlig.
 *
 * Ett bevisst avvik fra tegningen: nyhetskortet sier «spillere», ikke
 * «utøvere». Ordboken i designsystemet forbyr «utøver» (Anders 21.09.2026);
 * tegningen er ikke rettet ennå.
 */

const FOTO = "/images/akgolf/";

/** Bildene er 2000×1334 (heroen 2400×1601) — målt, ikke antatt. */
const BREDDE = 2000;
const HOYDE = 1334;

const MENY = [
  { href: "#coaching", tekst: "Coaching" },
  { href: "#playerhq", tekst: "Player HQ" },
  { href: "#akademiet", tekst: "Akademiet" },
  { href: "#anders", tekst: "Om Anders" },
  { href: "/turneringer", tekst: "Turneringer" },
  { href: "#nyheter", tekst: "Nyheter" },
  { href: "#kontakt", tekst: "Kontakt" },
];

const MAATER = [
  {
    nr: "01",
    tittel: "Enkelttime på bane",
    under: "Vi spiller, jeg ser, vi retter underveis.",
    hvor: "ONSØY GK",
  },
  {
    nr: "02",
    tittel: "Enkelttime i studio",
    under: "Innendørs, hele året, med måling.",
    hvor: "HELÅR",
  },
  {
    nr: "03",
    tittel: "Gruppetrening",
    under: "Fast gruppe, samme metode, lavere pris.",
    hvor: "FAST GRUPPE",
  },
  {
    nr: "04",
    tittel: "Foreldresamtale og veiledning",
    under: "Hva du bør presse på, og hva du bør la ligge.",
    hvor: "JUNIORFORELDRE",
  },
  {
    nr: "05",
    tittel: "Bedrift og firmaturer",
    under: "Opplegg for grupper som skal ut en dag.",
    hvor: "PÅ FORESPØRSEL",
  },
];

const PLAYERHQ = [
  { tittel: "I dag", tekst: "Dagens økt, klar når du våkner." },
  { tittel: "Plan", tekst: "Uken framover. Lagret er ikke delt." },
  { tittel: "Analyse", tekst: "Det vi har målt, ikke det vi tror." },
  { tittel: "Meg", tekst: "Din historikk og dine mål." },
];

const BAND_BILDER = [
  { fil: "AK-Golf-Academy-31.webp", alt: "Spillere på bane i høstlys" },
  { fil: "AK-Golf-Academy-44.webp", alt: "To spillere på en green sett ovenfra" },
  { fil: "AK-Golf-Academy-35.webp", alt: "Ball på tee i morgenlys" },
];

const NYHETER = [
  {
    fil: "AK-Golf-Academy-33.webp",
    alt: "Spillere på range i motlys",
    merke: "Turnering",
    tittel: "Fem spillere til NM junior",
    tekst: "Uttaket ble klart etter kvalifiseringen på Onsøy.",
    dato: "12. SEPTEMBER 2026",
  },
  {
    fil: "AK-Golf-Academy-30.webp",
    alt: "Spillere går langs en fairway",
    merke: "Akademiet",
    tittel: "Vinterprogrammet er klart",
    tekst: "Innendørs studio fra 1. november, fire økter i uken.",
    dato: "2. SEPTEMBER 2026",
  },
  {
    fil: "AK-Golf-Academy-7.webp",
    alt: "Spillere i tåkete morgenlys",
    merke: "Metode",
    tittel: "Hvorfor vi måler putting i fot",
    tekst: "Tallene sier mer om avstandskontroll enn antall putter gjør.",
    dato: "24. AUGUST 2026",
  },
];

const REDUSERT = "(prefers-reduced-motion: reduce)";

function abonnerBevegelse(varsle: () => void) {
  const sporsmal = window.matchMedia(REDUSERT);
  sporsmal.addEventListener("change", varsle);
  return () => sporsmal.removeEventListener("change", varsle);
}

export function ForsideDS() {
  const [menyApen, setMenyApen] = useState(false);
  const [bilde, setBilde] = useState(0);
  const rot = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLElement>(null);

  /* Bevegelse er valgfri og slås på først etter montering: serverens HTML er
     den rolige siden, og skrur leseren på «redusert bevegelse» underveis,
     faller siden tilbake til den med en gang. */
  const bevegelse = useSyncExternalStore(
    abonnerBevegelse,
    () => !window.matchMedia(REDUSERT).matches,
    () => false,
  );

  /* Avdekking — hvert `rv`-felt kommer opp når det er i bildet. */
  useEffect(() => {
    const node = rot.current;
    if (!bevegelse || !node) return;
    const felt = Array.from(node.querySelectorAll<HTMLElement>(`.${s.rv}`));
    const io = new IntersectionObserver(
      (poster) => {
        for (const post of poster) {
          if (!post.isIntersecting) continue;
          post.target.classList.add(s.in);
          io.unobserve(post.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of felt) io.observe(el);
    /* Sikkerhetsnett: rekker observatøren ikke å slå til, vises alt uansett. */
    const timer = window.setTimeout(() => {
      for (const el of felt) el.classList.add(s.in);
    }, 2200);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [bevegelse]);

  /* Fotobåndet: tre bilder krysses over mens det klebrige feltet rulles forbi. */
  useEffect(() => {
    const node = band.current;
    if (!bevegelse || !node) return;
    const oppdater = () => {
      const r = node.getBoundingClientRect();
      const h = r.height - window.innerHeight;
      if (h <= 0) return;
      const andel = Math.max(0, Math.min(0.999, -r.top / h));
      setBilde(Math.floor(andel * BAND_BILDER.length));
    };
    window.addEventListener("scroll", oppdater, { passive: true });
    window.addEventListener("resize", oppdater, { passive: true });
    oppdater();
    return () => {
      window.removeEventListener("scroll", oppdater);
      window.removeEventListener("resize", oppdater);
    };
  }, [bevegelse]);

  return (
    <div ref={rot} className={`${s.rot} ${bevegelse ? s.mo : ""}`}>
      <header className={`${s.hd} ${menyApen ? s.open : ""}`}>
        <div className={s.hdIn}>
          {/* Logofila bærer merkefargene selv — derfor <img>, ikke maskert ikon. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={s.hdLogo}
            src="/logos/logo-ak-golf-academy.svg"
            alt="AK Golf Academy"
          />
          <nav className={s.hdNav} id="hdnav" aria-label="Hovedmeny">
            {MENY.map((m, i) => (
              <a
                key={m.href}
                href={m.href}
                aria-current={i === 0 ? "page" : undefined}
                onClick={() => setMenyApen(false)}
              >
                {m.tekst}
              </a>
            ))}
          </nav>
          <button
            className={s.hdMenu}
            type="button"
            aria-expanded={menyApen}
            aria-controls="hdnav"
            onClick={() => setMenyApen((v) => !v)}
          >
            MENY
          </button>
          {/* Tegningen viser en NO/EN-velger. Den står ikke her: nettstedet
              finnes bare på norsk, og en død EN-lenke er verre enn ingen. */}
          <div className={s.hdR}>
            <Link className={`${s.btn} ${s.btnP} ${s.btnSm}`} href="/booking">
              Book time
            </Link>
          </div>
        </div>
      </header>

      <section className={s.hero}>
        <Image
          className={s.heroImg}
          src={`${FOTO}hero-bunker-shot.jpg`}
          alt="Spiller slår ballen ut av en bunker i morgensol"
          width={2400}
          height={1601}
          sizes="100vw"
          priority
        />
        <div className={s.heroPanel}>
          <div className={s.heroPaper}>
            <span className="aos-kicker aos-kicker--wide">Coaching siden 2018</span>
            <h1>Bedre golf, over tid.</h1>
            <p className={s.heroLead}>
              Coaching med Anders Kristiansen — på bane, i studio og i gruppe. Ingen
              hurtigkur, ingen mirakelgrep.
            </p>
            <div className={s.acts}>
              <Link className={`${s.btn} ${s.btnP} ${s.btnLg}`} href="/booking">
                Book en time
              </Link>
              <a className={`${s.btn} ${s.btnG} ${s.btnLg}`} href="#playerhq">
                Se Player HQ
              </a>
            </div>
            <span className={s.heroCredit}>ONSØY GK · FREDRIKSTAD · FOTO: AK GOLF</span>
          </div>
        </div>
      </section>

      <section className={`${s.sec} ${s.wrap}`}>
        <div className={`${s.doors} ${s.rv}`}>
          <a className={s.door} href="#coaching">
            <Image
              src={`${FOTO}AK-Golf-Academy-34.webp`}
              alt="Hånd som trekker en wedge ut av bagen"
              width={BREDDE}
              height={HOYDE}
              sizes="(max-width: 760px) 100vw, 600px"
            />
            <div className={s.doorB}>
              <span className={s.doorT}>
                Coaching<em>01</em>
              </span>
              <p className={s.doorD}>
                Enkelttime på bane eller i studio, gruppetrening, foreldresamtale og
                firmaturer. Dette er hovedgeskjeften.
              </p>
              <span className={s.doorF}>
                <b>Book time</b>
                <span>PÅ FORESPØRSEL</span>
              </span>
            </div>
          </a>
          <a className={s.door} href="#playerhq">
            <Image
              src={`${FOTO}AK-Golf-Academy-32.webp`}
              alt="Spillere trener på fairway"
              width={BREDDE}
              height={HOYDE}
              sizes="(max-width: 760px) 100vw, 600px"
            />
            <div className={s.doorB}>
              <span className={s.doorT}>
                Player HQ<em>02</em>
              </span>
              <p className={s.doorD}>
                Appen for deg som trener videre mellom timene. For satsende juniorer og
                voksne som vil bli bedre.
              </p>
              <span className={s.doorF}>
                <b>299 kr / mnd</b>
                <span>ABONNEMENT</span>
              </span>
            </div>
          </a>
        </div>
      </section>

      <section className={`${s.sec} ${s.secSand}`} id="coaching">
        <div className={s.wrap}>
          <div className={`${s.sh} ${s.rv}`}>
            <div className={s.shT}>
              <span className="aos-kicker">Coaching</span>
              <h2>Fem måter å jobbe sammen</h2>
              <p>
                Alt starter med én time. Hva som følger etter den, bestemmer vi når vi
                vet hva du trenger.
              </p>
            </div>
            <Link className={`${s.btn} ${s.btnG} ${s.btnSm}`} href="/booking">
              Book en time
            </Link>
          </div>
          <ul className={`${s.nl} ${s.rv}`}>
            {MAATER.map((m) => (
              <li key={m.nr}>
                <span className={s.nlI}>{m.nr}</span>
                <span className={s.nlN}>
                  {m.tittel}
                  <small>{m.under}</small>
                </span>
                <span className={s.nlV}>{m.hvor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.band} id="anders" ref={band}>
        <div className={s.bandSt}>
          <div className={s.bandF}>
            {BAND_BILDER.map((b, i) => (
              <Image
                key={b.fil}
                className={i === bilde ? s.on : undefined}
                src={`${FOTO}${b.fil}`}
                alt={b.alt}
                fill
                sizes="100vw"
              />
            ))}
          </div>
          <div className={s.bandTxt}>
            <div className={s.bandIn}>
              <div className={s.bandPaper}>
                <span className="aos-kicker aos-kicker--inverse aos-kicker--wide">
                  Om Anders
                </span>
                <blockquote>
                  Vi forteller deg ikke hva vi tror. Vi viser hva vi har sett, og så
                  bestemmer vi sammen.
                </blockquote>
                <span className={s.bandBy}>
                  ANDERS KRISTIANSEN · TRENER · SITAT TIL GODKJENNING
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${s.sec} ${s.wrap}`} id="playerhq">
        <div className={`${s.sh} ${s.rv}`}>
          <div className={s.shT}>
            <span className="aos-kicker">Player HQ · 299 kr/mnd</span>
            <h2>Appen mellom timene</h2>
            <p>
              Samme app for satsende juniorer og for voksne som vil bli bedre. Samme
              plan, ulik mengde.
            </p>
          </div>
          <Link className={`${s.btn} ${s.btnG} ${s.btnSm}`} href="/playerhq">
            Se appen
          </Link>
        </div>
        <div className={`${s.pg} ${s.rv}`}>
          {PLAYERHQ.map((p) => (
            <div key={p.tittel}>
              <span className={s.pgT}>{p.tittel}</span>
              <span className={s.pgD}>{p.tekst}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`${s.sec} ${s.secSand}`} id="akademiet">
        <div className={s.wrap}>
          <div className={`${s.split} ${s.rv}`}>
            <div>
              <Image
                src={`${FOTO}AK-Golf-Academy-38.webp`}
                alt="Hånd som setter ballen på peg, sett fra gresshøyde på green"
                width={BREDDE}
                height={HOYDE}
                sizes="(max-width: 900px) 100vw, 600px"
              />
              <span className={s.cap}>AKADEMIET · UKESØKT</span>
            </div>
            <div>
              <span className="aos-kicker">Akademiet</span>
              <h3>For dem som vil lenger</h3>
              <p>
                AK Golf Academy er det tetteste sporet: helårsplan, fast trener og
                Player HQ inkludert uten tillegg. Få plasser, opptak etter prøvetime.
              </p>
              <div className={s.acts}>
                <Link className={`${s.btn} ${s.btnG}`} href="/kontakt">
                  Spør om plass
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${s.sec} ${s.wrap}`} id="nyheter">
        <div className={`${s.sh} ${s.rv}`}>
          <div className={s.shT}>
            <span className="aos-kicker">Nyheter og turneringer</span>
            <h2>Fra banen</h2>
          </div>
          <Link className={`${s.btn} ${s.btnG} ${s.btnSm}`} href="/turneringer">
            Alle resultater
          </Link>
        </div>
        <div className={`${s.news} ${s.rv}`}>
          {NYHETER.map((n) => (
            <Link key={n.tittel} href="/blogg">
              <Image
                src={`${FOTO}${n.fil}`}
                alt={n.alt}
                width={BREDDE}
                height={HOYDE}
                sizes="(max-width: 860px) 100vw, 380px"
              />
              <span className="aos-kicker">{n.merke}</span>
              <h3>{n.tittel}</h3>
              <p>{n.tekst}</p>
              <span className={s.cap}>{n.dato}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={s.cta} id="kontakt">
        <div className={s.ctaIn}>
          <div>
            <span className="aos-kicker aos-kicker--inverse aos-kicker--wide">
              Ta kontakt
            </span>
            <h2>Én time forteller mer enn ti tips.</h2>
            <p>
              Skriv hva du spiller i dag og hva du vil bli bedre på. Jeg svarer innen to
              virkedager.
            </p>
          </div>
          <div className={s.acts}>
            <Link className={`${s.btn} ${s.btnP} ${s.btnLg}`} href="/booking">
              Book en time
            </Link>
            <Link className={`${s.btn} ${s.btnI} ${s.btnLg}`} href="/playerhq">
              Prøv Player HQ
            </Link>
          </div>
        </div>
      </section>

      <footer className={s.ft}>
        <div className={s.ftIn}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/logo-ak-golf-academy.svg" alt="AK Golf Academy" />
            <p>
              Coaching og veiledning til bedre golf. Onsøy GK, Fredrikstad — helårs,
              innendørs om vinteren.
            </p>
          </div>
          <div className={s.ftC}>
            <span className="aos-kicker">Coaching</span>
            <a href="#coaching">Enkelttime</a>
            <a href="#coaching">Gruppetrening</a>
            <a href="#coaching">Foreldresamtale</a>
            <a href="#coaching">Bedrift</a>
          </div>
          <div className={s.ftC}>
            <span className="aos-kicker">Apper</span>
            <Link href="/playerhq">Player HQ</Link>
            <Link href="/priser">Priser</Link>
            <Link href="/junior">Junior</Link>
          </div>
          <div className={s.ftC}>
            <span className="aos-kicker">Kontakt</span>
            <a href="mailto:post@akgolf.no">post@akgolf.no</a>
            <Link href="/anlegg">Anlegg</Link>
            <Link href="/om-oss">Om oss</Link>
          </div>
        </div>
        <div className={s.ftBar}>
          <span>AK GOLF · FREDRIKSTAD</span>
          <span>INSTAGRAM · LINKEDIN</span>
        </div>
      </footer>
    </div>
  );
}
