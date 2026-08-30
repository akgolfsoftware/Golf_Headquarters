/* AK Golf HQ — MARKEDSSIDE: Om oss (/om-oss).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) — hero, bilde, kort-rutenett, sitat, faktalinjer
   og sentrert avslutning. Skallet er PkShell (variant «side»).

   Fasitens `.bilde` er en plassholder for foto; her står de ekte bildene
   (next/image) i samme ramme — ingen mørk gradient over, flaten er lys.
   COPY: uendret fra forrige versjon. */

import Image from "next/image";
import Link from "next/link";
import { PkShell } from "./kit/PkShell";

const MANIFEST: { nr: string; t: string; d: string }[] = [
  {
    nr: "01",
    t: "Tydelig, ikke magisk",
    d: "Du skal alltid vite hva vi jobber med, hvorfor vi jobber med det, og hvordan du ser at det virker.",
  },
  {
    nr: "02",
    t: "Balansert, ikke tilfeldig",
    d: "AK Golf-pyramiden fordeler treningstiden riktig mellom fysikk, teknikk, slag, spill og turneringserfaring.",
  },
  {
    nr: "03",
    t: "Målbar, ikke synsing",
    d: "PlayerHQ holder plan, runder og statistikk samlet på ett sted. Fremgangen er synlig, ikke noe du må tro på.",
  },
];

const SELSKAP: { l: string; v: string }[] = [
  { l: "Org.nummer", v: "927 248 581" },
  { l: "Adresse", v: "AK Golf Group AS, Fredrikstad, Norge" },
  { l: "E-post", v: "post@akgolf.no" },
];

export function MarkedOmOssV2() {
  return (
    <PkShell variant="side" aktiv="/om-oss" dataSlug="marketing-om-oss">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Om oss · AK Golf Academy</span>
          <h1 className="pk-hero">Personlig coaching, bygd på data.</h1>
          <p className="pk-ing">
            AK Golf Academy drives av Anders Kristiansen: golfcoach, gründer og CEO i AK Golf Group
            AS. Tett personlig oppfølging, målbar fremgang.
          </p>
          <div className="pk-knapperad">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book første time
            </Link>
            <Link className="pk-btn" href="/coaching">
              Møt coachene
            </Link>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <div className="pk-foto pk-foto-bred">
            <Image
              src="/images/akademy/coach-observerer.jpg"
              alt="Coach observerer spiller på range"
              fill
              sizes="(max-width: 860px) 100vw, 1120px"
              priority
            />
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Manifest · det vi tror på</span>
          <h2 className="pk-sekt">Tre ting vi aldri går på akkord med.</h2>
          <div className="pk-rutenett">
            {MANIFEST.map((m) => (
              <div className="pk-mkort" key={m.nr}>
                <span className="pk-eyebrow">{m.nr}</span>
                <h3 className="pk-und">{m.t}</h3>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Historien</span>
          <h2 className="pk-sekt">Coaching som kan måles.</h2>
          <div className="pk-prosa">
            <p>
              Anders har brukt mer enn et tiår på spillere på alle nivåer, fra klubbamatører til
              konkurranseutøvere. Underveis vokste det frem en praksis der personlig oppfølging og
              målbare resultater ikke er motsetninger, men to sider av samme metode.
            </p>
            <blockquote className="pk-sitat">
              «Coaching skal ikke være magi. Det skal være tydelig: hva vi jobber med, hvorfor vi
              jobber med det, og hvordan du ser at det virker. Det er det Academy er bygget rundt.»
            </blockquote>
            <p>
              Kjernen er AK Golf-pyramiden, et balansert system som sørger for at treningstiden
              fordeles riktig mellom fysikk, teknikk, slag, spill og turneringserfaring. Til daglig
              støttes coachingen av PlayerHQ, spillerportalen som holder plan, runder og statistikk
              samlet på ett sted.
            </p>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Selskapet · AK Golf Group AS</span>
          <div className="pk-fakta-liste">
            {SELSKAP.map((r) => (
              <div className="pk-linje" key={r.l}>
                <span>{r.l}</span>
                <span className="pk-v">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">AK Golf Academy · Fredrikstad</span>
          <h2 className="pk-sekt">Klar for første time?</h2>
          <p className="pk-ing">
            Start med en enkelt time, så ser vi sammen hva som er riktig vei videre for spillet
            ditt.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book første time
            </Link>
            <Link className="pk-btn" href="/kontakt">
              Ta kontakt
            </Link>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
