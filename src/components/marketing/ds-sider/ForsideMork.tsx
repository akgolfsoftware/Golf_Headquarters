"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import s from "./forside-mork.module.css";

/**
 * Forsiden — mørk, filmatisk. Anders' valg 21.09.2026.
 *
 * Tegning: `ui_kits/akgolf-web/hjem-scroll.html` i Claude Design-prosjektet
 * «AK Golf Design System» (87aa23fb). Scroll-motor, seks bilder på canvas,
 * kapittelskinne, bokstavsplitt, partikler, filmkorn og egen musepeker.
 *
 * VIKTIG FOR NESTE ØKT — dette er IKKE en feil:
 * Tegningen står utenfor designsystemets tokenlag og bruker effekter systemets
 * bevegelseslov ikke tillater. Designsystemets egen `readme.md` anbefaler den
 * lyse `hjem.html` i stedet. Anders er forelagt begge deler og har valgt denne.
 * Valget ble endelig 22.09.2026, og den lyse varianten er slettet.
 * Ikke «rett» denne tilbake til tokens uten ny beslutning fra Anders.
 *
 * Alt som beveger seg er imperativt og lever i én effekt: canvas tegnes 60
 * ganger i sekundet, og React skal ikke rendre siden på nytt underveis.
 * Komponenten har derfor ingen tilstand i det hele tatt.
 *
 * Uten JavaScript, og ved «redusert bevegelse», er siden en helt vanlig mørk
 * redaksjonell side: bilderammen står stille på første bilde, tekstfeltene
 * ligger etter hverandre, og alt innhold er synlig.
 *
 * Ett tillegg til tegningen: lenkene i dørene og knappene peker på ekte ruter
 * (`/booking`, `/playerhq`, `/priser`, `/kontakt`), ikke på id-er i siden.
 * Tegningens egne ankre virket uansett ikke: de peker på felt som er
 * `position: fixed` når bevegelsen er på. Bunnen har lenkene videre, fordi
 * flaten tegner sitt eget skall og ikke har noen topplinje.
 *
 * Mobil (Anders 22.09.2026): under 700 px er mekanikken en annen — fotoet
 * blir liggende klebrig bak, og kapitlene renner over det som vanlige
 * blokker. Se mobilblokken nederst i `forside-mork.module.css`.
 */

const FOTO = "/images/akgolf/";

/** Ett bilde per kapittel, i kapittelrekkefølge — hvert valgt for hva avsnittet sier. */
const SEKVENS = [
  "hero-bunker-shot.jpg", // Start — slaget som starter alt
  "AK-Golf-Academy-34.webp", // Metode — nærbilde: å se nøyaktig hva som skjer
  "AK-Golf-Academy-32.webp", // Coaching — trening på bane, to som jobber sammen
  "AK-Golf-Academy-38.webp", // Player HQ — spilleren alene mellom timene
  "AK-Golf-Academy-31.webp", // Akademiet — helårssporet, bane i høstlys
  "AK-Golf-Academy-35.webp", // Kontakt — ball på tee, invitasjonen
];

/** Kapitlenes midtpunkt i rullingen, og hvor lenge bildet står helt stille. */
const MIDT = [0.065, 0.215, 0.375, 0.535, 0.695, 0.875];
const HOLD = 0.042;

/** Bunnens lenker videre — forsiden har ingen topplinje å navigere fra. */
const VIDERE: Array<[string, string]> = [
  ["Book time", "/booking"],
  ["Player HQ", "/playerhq"],
  ["Priser", "/priser"],
  ["Turneringer", "/turneringer"],
  ["Kontakt", "/kontakt"],
];

const KAPITLER = ["Start", "Metode", "Coaching", "Player HQ", "Akademiet", "Kontakt"];

const MAATER = [
  { nr: "01", navn: "Enkelttime på bane", hvor: "FREDRIKSTAD" },
  { nr: "02", navn: "Enkelttime i studio", hvor: "INNENDØRS · HELÅR" },
  { nr: "03", navn: "Gruppetrening", hvor: "FAST GRUPPE" },
  { nr: "04", navn: "Foreldresamtale og veiledning", hvor: "FOR JUNIORFORELDRE" },
  { nr: "05", navn: "Bedrift og firmaturer", hvor: "PÅ FORESPØRSEL" },
];

const AKADEMIET = [
  { navn: "Helårsplan med fast trener", hvor: "JUNIOR OG VOKSEN" },
  { navn: "Player HQ inkludert", hvor: "UTEN TILLEGG" },
  { navn: "Opptak etter prøvetime", hvor: "LØPENDE" },
];

const PLAYERHQ = [
  { tittel: "I dag", tekst: "Dagens økt, klar når du våkner." },
  { tittel: "Plan", tekst: "Uken framover. Lagret er ikke delt." },
  { tittel: "Analyse", tekst: "Det vi har målt, ikke det vi tror." },
  { tittel: "Meg", tekst: "Din historikk, dine mål." },
];

/** Bildearkivet: fil og om ruta er dobbelt høy. */
const ARKIV: Array<[string, boolean]> = [
  ["AK-Golf-Academy-35.webp", false],
  ["AK-Golf-Academy-34.webp", true],
  ["AK-Golf-Academy-31.webp", false],
  ["AK-Golf-Academy-44.webp", false],
  ["AK-Golf-Academy-33.webp", true],
  ["AK-Golf-Academy-30.webp", false],
  ["AK-Golf-Academy-6.webp", false],
];

const KORN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">' +
  '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/></filter>' +
  '<rect width="256" height="256" filter="url(#n)"/></svg>';

export function ForsideMork() {
  const rot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rot.current;
    if (!node) return;

    /* Tar en hel selektor, ikke et klassenavn: `figure` og `.trk > i` er ikke
       klasser, og et innebygd punktum her ville stilltiende gitt tomt svar. */
    const finn = <T extends Element>(velger: string) => node.querySelector<T>(velger);
    const alle = <T extends Element>(velger: string) =>
      Array.from(node.querySelectorAll<T>(velger));

    const laster = finn<HTMLDivElement>(`.${s.load}`);
    const fyll = finn<HTMLElement>(`.${s.fill}`);
    const prosent = finn<HTMLElement>(`.${s.pct}`);
    const scene = finn<HTMLElement>(`.${s.stage}`);
    const klebrig = finn<HTMLElement>(`.${s.sticky}`);
    const lerret = finn<HTMLCanvasElement>(`.${s.cv}`);
    const partikler = finn<HTMLCanvasElement>(`.${s.parts}`);
    const korn = finn<HTMLElement>(`.${s.grain}`);
    const prikk = finn<HTMLElement>(`.${s.cd}`);
    const ring = finn<HTMLElement>(`.${s.cr}`);
    const felt = alle<HTMLElement>(`.${s.st}`);
    const kapitler = alle<HTMLElement>(`.${s.c}`);
    const spor = alle<HTMLElement>(`.${s.trk} > i`);
    const stripe = finn<HTMLElement>(`.${s.prog} > i`);
    const figurer = alle<HTMLElement>("figure");

    if (!scene || !klebrig || !lerret || !partikler) return;

    /* Eksplisitt ikke-tomme navn: TypeScript holder ikke på innsnevringen inne i
       funksjonene under, og `!` overalt ville skjult en ekte feil senere. */
    const rotEl: HTMLDivElement = node;
    const sceneEl: HTMLElement = scene;
    const klebrigEl: HTMLElement = klebrig;
    const lerretEl: HTMLCanvasElement = lerret;
    const partiklerEl: HTMLCanvasElement = partikler;

    const cx = lerret.getContext("2d");
    const px = partikler.getContext("2d");
    if (!cx || !px) return;
    const rammeCx: CanvasRenderingContext2D = cx;
    const partikkelCx: CanvasRenderingContext2D = px;

    const rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const opprydding: Array<() => void> = [];
    let levende = true;

    node.classList.add(s.laster);
    opprydding.push(() => node.classList.remove(s.laster));

    /* ---- filmkorn ---- */
    if (korn) korn.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(KORN)}")`;

    /* ---- musepeker ---- */
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    const paaPeker = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (prikk) prikk.style.transform = `translate(${mx}px,${my}px)`;
      if (ring) {
        const over = (e.target as Element | null)?.closest?.(
          `a,button,.${s.door},.${s.c}`,
        );
        ring.classList.toggle(s.hot, Boolean(over));
      }
    };
    window.addEventListener("pointermove", paaPeker, { passive: true });
    opprydding.push(() => window.removeEventListener("pointermove", paaPeker));

    /* Ringen henger etter prikken — den er det som gjør pekeren til en peker. */
    let ringId = 0;
    const foelgRing = () => {
      if (!levende) return;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring) ring.style.transform = `translate(${rx}px,${ry}px)`;
      ringId = requestAnimationFrame(foelgRing);
    };
    foelgRing();
    opprydding.push(() => cancelAnimationFrame(ringId));

    /* ---- bokstavsplitt på heroens overskrift ---- */
    const tittel = node.querySelector("h1");
    if (tittel) {
      const ord = (tittel.textContent ?? "").split(" ");
      tittel.textContent = "";
      ord.forEach((o, oi) => {
        const pakke = document.createElement("span");
        pakke.style.display = "inline-block";
        pakke.style.whiteSpace = "nowrap";
        o.split("").forEach((tegn, ti) => {
          const b = document.createElement("span");
          b.className = s.sp;
          b.textContent = tegn;
          b.style.transitionDelay = `${(oi * 4 + ti) * 26}ms`;
          pakke.appendChild(b);
        });
        tittel.appendChild(pakke);
        if (oi < ord.length - 1) tittel.appendChild(document.createTextNode(" "));
      });
    }

    /* ---- bilderammen ---- */
    const bilder: HTMLImageElement[] = [];
    let CW = 0;
    let CH = 0;
    let naa = 0;

    const vb = () => window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = () => window.innerHeight || document.documentElement.clientHeight || 0;

    function dekk(im: HTMLImageElement, skala: number): [number, number, number, number] {
      const ir = im.width / im.height;
      const cr = CW / CH;
      let w: number;
      let h: number;
      if (ir > cr) {
        h = CH * skala;
        w = h * ir;
      } else {
        w = CW * skala;
        h = w / ir;
      }
      return [(CW - w) / 2, (CH - h) / 2, w, h];
    }

    function mal(im: HTMLImageElement | undefined, alfa: number, kb: number) {
      if (!im || !im.complete || !CW) return;
      const b = dekk(im, 1.05 + kb * 0.05);
      rammeCx.globalAlpha = alfa;
      rammeCx.drawImage(im, b[0], b[1], b[2], b[3]);
      rammeCx.globalAlpha = 1;
    }

    function tegn(pos: number) {
      if (!CW || !CH) return;
      const n = SEKVENS.length - 1;
      let i = Math.floor(pos);
      const f = pos - i;
      i = Math.max(0, Math.min(n, i));
      naa = pos;
      rammeCx.fillStyle = "#0e0d0c";
      rammeCx.fillRect(0, 0, CW, CH);
      let a = bilder[i];
      if (!a || !a.complete) {
        for (let k = i; k >= 0; k--) {
          if (bilder[k]?.complete) {
            a = bilder[k];
            break;
          }
        }
      }
      mal(a, 1, 1 - f);
      if (f > 0.001 && i < n && bilder[i + 1]?.complete) mal(bilder[i + 1], f, 0);
    }

    function maalLerret(): boolean {
      const w = klebrigEl.clientWidth || vb();
      const h = klebrigEl.clientHeight || vh();
      if (!w || !h) return false;
      CW = w;
      CH = h;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      lerretEl.width = Math.round(w * d);
      lerretEl.height = Math.round(h * d);
      rammeCx.setTransform(d, 0, 0, d, 0, 0);
      tegn(naa);
      return true;
    }

    /* ---- partikler ---- */
    type Part = { x: number; y: number; r: number; a: number; vx: number; vy: number };
    let ps: Part[] = [];
    let PW = 0;
    let PH = 0;

    function maalPartikler(): boolean {
      PW = vb();
      PH = vh();
      if (!PW || !PH) return false;
      partiklerEl.width = PW;
      partiklerEl.height = PH;
      return true;
    }
    function lagPartikler() {
      ps = [];
      for (let i = 0; i < 40; i++) {
        ps.push({
          x: Math.random() * PW,
          y: Math.random() * PH,
          r: 0.3 + Math.random() * 1.5,
          a: 0.05 + Math.random() * 0.3,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
        });
      }
    }
    function tegnPartikler() {
      if (!levende) return;
      partikkelCx.clearRect(0, 0, partiklerEl.width, partiklerEl.height);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = PW;
        if (p.x > PW) p.x = 0;
        if (p.y < 0) p.y = PH;
        if (p.y > PH) p.y = 0;
        partikkelCx.globalAlpha = p.a;
        partikkelCx.fillStyle = "#faf8f3";
        partikkelCx.beginPath();
        partikkelCx.arc(p.x, p.y, p.r, 0, 6.2832);
        partikkelCx.fill();
      }
      partikkelCx.globalAlpha = 1;
      requestAnimationFrame(tegnPartikler);
    }

    /* ---- hvilket bilde hører til hvor i rullingen ---- */
    function bildePos(rap: number): number {
      const n = MIDT.length - 1;
      const raa = Math.max(0, Math.min(1, rap));
      if (raa <= MIDT[0] + HOLD) return 0;
      if (raa >= MIDT[n] - HOLD) return n;
      for (let i = 0; i < n; i++) {
        const a = MIDT[i] + HOLD;
        const b = MIDT[i + 1] - HOLD;
        if (raa < a) return i;
        if (raa <= b) return i + (raa - a) / (b - a);
      }
      return n;
    }

    /* Under 700 px er scenen innholdsstyrt, ikke 720vh. Da stemmer ikke
       MIDT-brøkene lenger, og bildet må lese seg selv ut av hvor panelene
       faktisk står. Samme brekkpunkt som CSS-modulens mobilblokk. */
    const mobilSpm = window.matchMedia("(max-width: 700px)");

    function flytPos(): number {
      const n = felt.length - 1;
      if (n < 1) return 0;
      const m = (vh() || 1) * 0.46;
      const sentre = felt.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      if (m <= sentre[0]) return 0;
      if (m >= sentre[n]) return n;
      for (let i = 0; i < n; i++) {
        if (m > sentre[i + 1]) continue;
        const spenn = sentre[i + 1] - sentre[i];
        const f = spenn > 0 ? (m - sentre[i]) / spenn : 0;
        /* Samme hold som på desktop: bildet står stille rundt hvert kapittel
           og skifter i overgangen mellom dem. */
        return i + Math.max(0, Math.min(1, (f - 0.28) / 0.44));
      }
      return n;
    }

    /** Hvilket bilde hører til der vi er nå — uansett hvilken mekanikk som gjelder. */
    const bildeNaa = () => (mobilSpm.matches ? flytPos() : bildePos(fremdrift()));

    const fremdrift = () => {
      const r = scene.getBoundingClientRect();
      return Math.max(0, Math.min(1, -r.top / (r.height - window.innerHeight)));
    };

    function settTilstand(raa: number) {
      for (const el of felt) {
        const at = Number(el.dataset.at);
        const to = Number(el.dataset.to);
        el.classList.toggle(s.on, raa >= at - 0.035 && raa <= to);
      }
      let aktiv = 0;
      for (let j = 0; j < MIDT.length; j++) if (raa >= MIDT[j] - 0.05) aktiv = j;
      kapitler.forEach((c, i) => c.classList.toggle(s.on, i === aktiv));
      if (stripe) stripe.style.width = `${Math.max(0, Math.min(1, raa)) * 100}%`;
      spor.forEach((t, i) => {
        const start = MIDT[i];
        const slutt = MIDT[i + 1] ?? 1;
        const f = Math.max(0, Math.min(1, (raa - start) / (slutt - start)));
        t.style.height = `${f * 100}%`;
      });
    }

    /* ---- rullesløyfen ---- */
    let maalF = 0;
    let naaF = 0;
    let sisteRaf = -1e9;
    let rafId = 0;

    function slag() {
      if (!levende) return;
      sisteRaf = Date.now();
      const raa = fremdrift();
      maalF = bildeNaa();
      naaF += (maalF - naaF) * (rolig ? 1 : 0.11);
      tegn(naaF);
      settTilstand(raa);
      rafId = requestAnimationFrame(slag);
    }

    const paaRull = () => {
      const raa = fremdrift();
      settTilstand(raa);
      /* requestAnimationFrame står stille i skjulte faner — siden skal likevel stemme */
      if (Date.now() - sisteRaf > 250) {
        naaF = bildeNaa();
        tegn(naaF);
      }
    };
    window.addEventListener("scroll", paaRull, { passive: true });
    opprydding.push(() => window.removeEventListener("scroll", paaRull));

    /* ---- kapittelskinne og lenker som ruller ---- */
    function rullTil(kapittel: number) {
      if (mobilSpm.matches) {
        /* Panelene ligger i samme rekkefølge som MIDT og SEKVENS. På mobil
           er de vanlige blokker, så de kan rulles til direkte. */
        felt[kapittel]?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const vil = MIDT[kapittel];
      const r = sceneEl.getBoundingClientRect();
      const topp = r.top + window.scrollY;
      window.scrollTo({
        top: topp + vil * (r.height - window.innerHeight),
        behavior: "smooth",
      });
    }
    kapitler.forEach((c, i) => {
      const klikk = () => rullTil(i);
      c.addEventListener("click", klikk);
      opprydding.push(() => c.removeEventListener("click", klikk));
    });

    /* ---- bildearkivet: avdekking og parallakse ---- */
    const io = new IntersectionObserver(
      (poster) => {
        for (const post of poster) {
          if (!post.isIntersecting) continue;
          post.target.classList.add(s.in);
          io.unobserve(post.target);
        }
      },
      { threshold: 0.15 },
    );
    for (const f of figurer) io.observe(f);
    opprydding.push(() => io.disconnect());

    const visArkiv = () => figurer.forEach((f) => f.classList.add(s.in));
    const arkivVakt = window.setTimeout(() => {
      if (!figurer.some((f) => f.classList.contains(s.in))) visArkiv();
    }, 1400);
    opprydding.push(() => window.clearTimeout(arkivVakt));

    let parId = 0;
    function parallakse() {
      if (!levende) return;
      const H = vh() || 1;
      for (const el of figurer) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H) continue;
        const c = (r.top + r.height / 2 - H / 2) / H;
        const im = el.querySelector("img");
        if (im) im.style.transform = `translateY(${Math.round(c * Number(el.dataset.parallax) * 10) / 10}px)`;
      }
      parId = requestAnimationFrame(parallakse);
    }

    /* ---- bevegelse er valgfri, og slås på først når en ramme faktisk er levert ---- */
    let bevegelsePaa = false;
    function slaaPaaBevegelse() {
      if (bevegelsePaa || rolig || !levende) return;
      bevegelsePaa = true;
      rotEl.classList.add(s.mo);
      if (!maalLerret()) proevIgjen();
      if (maalPartikler()) lagPartikler();
      settTilstand(fremdrift());
      slag();
      parallakse();
      tegnPartikler();
    }
    function proevIgjen() {
      let n = 0;
      const gaa = () => {
        if (!levende) return;
        if (maalLerret() && maalPartikler()) {
          lagPartikler();
          return;
        }
        if (++n < 30) window.setTimeout(gaa, 120);
      };
      gaa();
    }

    /* ---- laste bildene til rammen ---- */
    let lastet = 0;
    const settProsent = (v: number) => {
      if (fyll) fyll.style.width = `${v}%`;
      if (prosent) prosent.textContent = `${Math.round(v)} %`;
    };
    function klar() {
      if (!levende) return;
      laster?.classList.add(s.out);
      const skjul = window.setTimeout(() => {
        rotEl.classList.remove(s.laster);
      }, 700);
      opprydding.push(() => window.clearTimeout(skjul));
      if (!maalLerret()) proevIgjen();
      if (rolig) {
        tegn(0);
        visArkiv();
        return;
      }
      let fyrt = false;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          fyrt = true;
          slaaPaaBevegelse();
        }),
      );
      const vakt = window.setTimeout(() => {
        if (!fyrt) {
          proevIgjen();
          visArkiv();
        }
      }, 800);
      opprydding.push(() => window.clearTimeout(vakt));
    }

    SEKVENS.forEach((navn, i) => {
      const im = new window.Image();
      im.decoding = "async";
      im.onload = im.onerror = () => {
        lastet += 1;
        settProsent((lastet / SEKVENS.length) * 100);
        if (i === 0) {
          if (!CW) maalLerret();
          tegn(0);
        }
        if (lastet === SEKVENS.length) klar();
      };
      im.src = FOTO + navn;
      bilder[i] = im;
    });

    /* ---- måling ved endret vindu ---- */
    const paaStorrelse = () => {
      maalLerret();
      if (maalPartikler()) lagPartikler();
    };
    window.addEventListener("resize", paaStorrelse, { passive: true });
    opprydding.push(() => window.removeEventListener("resize", paaStorrelse));
    const ro = new ResizeObserver(paaStorrelse);
    ro.observe(klebrig);
    opprydding.push(() => ro.disconnect());
    if (!maalLerret()) proevIgjen();

    return () => {
      levende = false;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(parId);
      for (const rydd of opprydding) rydd();
    };
  }, []);

  return (
    <div ref={rot} className={s.rot}>
      <div className={s.cd} />
      <div className={s.cr} />
      <div className={s.grain} />
      <div className={s.vig} />
      <canvas className={s.parts} />

      <div className={s.load}>
        <span className={s.bm}>AK Golf</span>
        <span className={s.ln} />
        <div className={s.bar}>
          <i className={s.fill} />
        </div>
        <span className={s.pct}>0 %</span>
      </div>

      <div className={s.prog} aria-hidden="true">
        <i />
      </div>

      <nav className={s.chap} aria-label="Kapitler">
        {KAPITLER.map((navn, i) => (
          <div key={navn}>
            <div className={`${s.c} ${i === 0 ? s.on : ""}`}>
              <span className={s.lbl}>{navn}</span>
              <span className={s.dot} />
            </div>
            {i < KAPITLER.length - 1 ? (
              <div className={s.trk}>
                <i />
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <section className={s.stage}>
        <div className={s.sticky}>
          <canvas className={s.cv} />
          <div className={`${s.grad} ${s.gradL}`} />
          <div className={`${s.grad} ${s.gradB}`} />
        </div>

        <div className={`${s.st} ${s.hero}`} data-at="0" data-to="0.155">
          {/* Logofila bærer merkefargene selv — derfor <img>, ikke maskert ikon. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={s.heroLogo}
            src="/logos/logo-ak-golf-academy-negative.svg"
            alt="AK Golf"
          />
          <span className={s.k}>Fredrikstad · coaching siden 2018</span>
          <h1>Bedre golf, over tid.</h1>
          <p>
            Coaching med Anders Kristiansen — på bane, i studio og i gruppe. Ingen
            hurtigkur, ingen mirakelgrep.
          </p>
          <div className={s.doors}>
            <Link className={s.door} href="/booking">
              <span className={s.t}>
                Coaching<i>01</i>
              </span>
              <span className={s.d}>
                Enkelttime på bane eller i studio. Gruppetrening. Foreldresamtale.
              </span>
              <span className={s.p}>BOOK TIME</span>
            </Link>
            <Link className={s.door} href="/playerhq">
              <span className={s.t}>
                Player HQ<i>02</i>
              </span>
              <span className={s.d}>Appen for deg som trener videre mellom timene.</span>
              <span className={s.p}>299 KR / MND</span>
            </Link>
          </div>
        </div>

        <div className={s.st} data-at="0.215" data-to="0.30">
          <span className={s.qmark}>&ldquo;</span>
          <blockquote>
            Vi forteller deg ikke hva vi tror. Vi viser hva vi har sett, og så bestemmer vi
            sammen.
          </blockquote>
          <hr className={s.rule} />
          <span className={s.m}>ANDERS KRISTIANSEN · TRENER · SITAT TIL GODKJENNING</span>
        </div>

        <div className={s.st} id="coaching" data-at="0.375" data-to="0.465">
          <span className={`${s.k} ${s.kRust}`}>Coaching</span>
          <h2>Fem måter å jobbe sammen</h2>
          <p>
            Alt starter med en time. Hva som følger etter den, bestemmer vi når vi vet hva
            du trenger.
          </p>
          <ul className={s.feat}>
            {MAATER.map((m) => (
              <li key={m.nr}>
                <span className={s.i}>{m.nr}</span>
                <span className={s.n}>{m.navn}</span>
                <span className={s.v}>{m.hvor}</span>
              </li>
            ))}
          </ul>
          <div className={s.acts}>
            <Link className={`${s.btn} ${s.btnP}`} href="/booking">
              Book en time
            </Link>
            <Link className={s.m} style={{ alignSelf: "center" }} href="/priser">
              SE PRISER
            </Link>
          </div>
        </div>

        <div className={s.st} id="playerhq" data-at="0.535" data-to="0.625">
          <span className={`${s.k} ${s.kRust}`}>Player HQ · 299 kr/mnd</span>
          <h2>Appen mellom timene</h2>
          <p>
            For satsende juniorer og for voksne som vil bli bedre. Samme app, samme plan,
            ulik mengde.
          </p>
          <div className={s.gcells}>
            {PLAYERHQ.map((p) => (
              <div key={p.tittel} className={s.gcell}>
                <span className={s.t}>{p.tittel}</span>
                <span className={s.d}>{p.tekst}</span>
              </div>
            ))}
          </div>
          <div className={s.acts}>
            <Link className={`${s.btn} ${s.btnG}`} href="/playerhq">
              Se Player HQ
            </Link>
          </div>
        </div>

        <div className={s.st} data-at="0.695" data-to="0.785">
          <span className={s.k}>Akademiet</span>
          <h2>For dem som vil lenger</h2>
          <p>
            AK Golf Academy er det tetteste sporet: helårsplan, fast oppfølging og Player
            HQ inkludert. Få plasser, opptak etter prøvetime.
          </p>
          <ul className={s.feat}>
            {AKADEMIET.map((a) => (
              <li key={a.navn}>
                <span className={s.i}>→</span>
                <span className={s.n}>{a.navn}</span>
                <span className={s.v}>{a.hvor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${s.st} ${s.stC}`} id="kontakt" data-at="0.875" data-to="1.01">
          <span className={s.k}>Ta kontakt</span>
          <h2>Én time forteller mer enn ti tips.</h2>
          <p>Skriv hva du spiller i dag og hva du vil bli bedre på.</p>
          <div className={s.acts}>
            <Link className={`${s.btn} ${s.btnP}`} href="/booking">
              Book en time
            </Link>
            <Link className={`${s.btn} ${s.btnG}`} href="/kontakt">
              Skriv til meg
            </Link>
          </div>
          <p className={s.m} style={{ marginTop: 28 }}>
            FREDRIKSTAD · POST@AKGOLF.NO
          </p>
        </div>
      </section>

      <section className={s.gal}>
        <div className={s.galHd}>
          <span className={s.k}>Bildearkiv</span>
          <h2>Fra banen og studioet</h2>
        </div>
        <div className={s.grid}>
          {ARKIV.map(([fil, hoy], i) => (
            <figure
              key={fil}
              className={hoy ? s.tall : undefined}
              data-parallax={(i % 2 ? -1 : 1) * (10 + i * 3)}
            >
              <Image
                src={`${FOTO}${fil}`}
                alt="AK Golf — bane og studio"
                fill
                sizes="(max-width: 860px) 50vw, 33vw"
              />
            </figure>
          ))}
        </div>
      </section>

      <footer className={s.ft}>
        <div className={s.ftIn}>
          <span className={s.bm}>AK Golf</span>
          {/* Forsiden tegner sitt eget skall og har ingen topplinje. Uten disse
              lenkene er resten av nettstedet uten inngang herfra. */}
          <nav className={s.ftNav} aria-label="Sider">
            {VIDERE.map(([tekst, rute]) => (
              <Link key={rute} href={rute}>
                {tekst}
              </Link>
            ))}
          </nav>
          <span className={s.m}>AK GOLF · FREDRIKSTAD · ALLE BILDER ER AK GOLFS EGNE</span>
        </div>
      </footer>
    </div>
  );
}
