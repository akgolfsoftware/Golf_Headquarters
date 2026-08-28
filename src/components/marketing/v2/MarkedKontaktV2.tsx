"use client";

/* AK Golf HQ — MARKEDSSIDE: Kontakt (/kontakt).
   Paper-port W5: fasit designsystem/paper/fase2/marketing/marketing-side.html
   §forside (skallvariant 1) + feltmønsteret fra fase2/auth/auth-flyt.html
   (`.felt` → `.pk-felt`). Skallet er PkShell (variant «side»).

   Skjemaet bruker SAMME server-action (sendKontaktMelding) og SAMME feltnavn
   (navn/epost/telefon/tema/melding) som før. Forenkling: feltene er nå native
   input/select/textarea med `name` direkte, så de fem skjulte speil-feltene
   (som fantes fordi v2-primitivene manglet `name`) er borte. Feil vises under
   skjemaet, aldri bare i en toast — fasitkravet fra auth-flyt.
   COPY: uendret fra forrige versjon. */

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { PkShell } from "./paper/PkShell";
import { sendKontaktMelding, type KontaktFormState } from "@/app/(marketing)/kontakt/actions";

const TEMA_ALTERNATIV = ["Coaching", "Booking", "Annet"];
const KONTAKT_INITIAL: KontaktFormState = { status: "idle" };

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
  {
    q: "Hvor raskt får jeg svar?",
    a: "Vi svarer på alle henvendelser innen 1 virkedag. Coaching-forespørsler prioriteres.",
  },
  {
    q: "Trenger jeg medlemskap for å booke?",
    a: "Nei. Du kan booke enkelttimer eller en gratis kartleggings-økt uten medlemskap. Abonnement gir bedre pris per time.",
  },
  {
    q: "Hvor holder dere til?",
    a: "Innendørs på Mulligan Indoor Golf i Fredrikstad og Sarpsborg, og utendørs på Gamle Fredrikstad Golfklubb fra mai til oktober.",
  },
  {
    q: "Tar dere bedriftsevent?",
    a: "Ja. Send oss en melding med dato og antall deltakere, så lager vi et tilpasset opplegg.",
  },
];

const ANLEGG: { place: string; address: string; note: string }[] = [
  {
    place: "Mulligan Indoor Golf Fredrikstad",
    address: "Produksjonsveien 21, 1618 Fredrikstad",
    note: "Innendørs · 4× TrackMan 4 · åpent 07–00",
  },
  {
    place: "Mulligan Indoor Golf Sarpsborg",
    address: "Bjørnstadveien 12, 1712 Sarpsborg",
    note: "Innendørs · 2× TrackMan iO · åpent 07–00",
  },
  {
    place: "Gamle Fredrikstad Golfklubb",
    address: "Torsnesveien 16, 1630 Gamle Fredrikstad",
    note: "Utendørs · mai–oktober · 18 hull",
  },
];

function SendKnapp() {
  const { pending } = useFormStatus();
  return (
    <button className="pk-btn pk-btn-ink pk-btn-full" type="submit" disabled={pending}>
      {pending ? "Sender …" : "Send melding"}
    </button>
  );
}

function KontaktSkjema() {
  const [state, formAction] = useActionState(sendKontaktMelding, KONTAKT_INITIAL);

  return (
    <form action={formAction}>
      <label className="pk-felt">
        <span>Navn</span>
        <input name="navn" autoComplete="name" placeholder="Ditt navn" required />
      </label>
      <div className="pk-feltpar">
        <label className="pk-felt">
          <span>E-post</span>
          <input
            name="epost"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="din@epost.no"
            required
          />
        </label>
        <label className="pk-felt">
          <span>Telefon (valgfritt)</span>
          <input name="telefon" type="tel" autoComplete="tel" placeholder="+47" />
        </label>
      </div>
      <label className="pk-felt">
        <span>Tema</span>
        <select name="tema" defaultValue={TEMA_ALTERNATIV[0]}>
          {TEMA_ALTERNATIV.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="pk-felt">
        <span>Melding</span>
        <textarea name="melding" rows={5} placeholder="Skriv noen ord …" required />
      </label>

      {state.status === "ok" && (
        <p className="pk-kvittering" role="status">
          {state.melding}
        </p>
      )}
      {state.status === "feil" && (
        <p className="pk-feilmelding" role="alert">
          {state.melding}
        </p>
      )}

      <SendKnapp />
    </form>
  );
}

export function MarkedKontaktV2() {
  return (
    <PkShell variant="side" dataSlug="marketing-kontakt">
      <div className="pk-sek">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Kontakt</span>
          <h1 className="pk-hero">Vi vil gjerne høre fra deg.</h1>
          <p className="pk-ing">
            Spørsmål om coaching, junior-program eller bedriftsevent? Skriv noen ord under, eller
            ring oss direkte. Vi svarer innen 1 virkedag.
          </p>
        </div>
      </div>

      <div className="pk-sek pk-sek-notop">
        <div className="pk-wrap pk-todelt pk-todelt-skjema">
          <div className="pk-kort pk-kort-pad">
            <span className="pk-eyebrow">Skjema · svar innen 1 virkedag</span>
            <h2 className="pk-und">Send oss en melding</h2>
            <p className="pk-notis">
              Vi leser hver melding personlig. Ingen automat-svar, ingen ventelister.
            </p>
            <KontaktSkjema />
          </div>

          <div>
            <div className="pk-kort pk-kort-pad">
              <h3 className="pk-und">Foretrekker du å ringe?</h3>
              <p className="pk-notis">
                Ring eller send en SMS. Du kan også booke direkte på akgolf.no.
              </p>
              <div className="pk-fakta-liste">
                <div className="pk-linje">
                  <span>Anders Kristiansen</span>
                  <a className="pk-v" href="tel:+4748216540">
                    +47 482 16 540
                  </a>
                </div>
                <div className="pk-linje">
                  <span>E-post</span>
                  <a className="pk-v" href="mailto:post@akgolf.no">
                    post@akgolf.no
                  </a>
                </div>
              </div>
            </div>

            <div className="pk-kort pk-kort-tint pk-kort-pad pk-knapp-topp">
              <span className="pk-eyebrow">Tips</span>
              <h3 className="pk-und">Vil du heller bare booke en prøve-time?</h3>
              <Link className="pk-btn pk-btn-sm" href="/booking">
                Book direkte
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-todelt">
          <div>
            <span className="pk-eyebrow">Åpningstider</span>
            <h2 className="pk-sekt">Når kan du komme?</h2>
            <p className="pk-ing">
              Mulligan Indoor Golf er åpent 07–00 alle dager i Fredrikstad og Sarpsborg.
              Coaching-timer må bookes innenfor coachenes arbeidstid.
            </p>
          </div>
          <div className="pk-fakta-liste">
            {HOURS.map((h) => (
              <div className="pk-linje" key={h.day}>
                <span>{h.day}</span>
                <span className="num">Coaching {h.coaching}</span>
                <span className="pk-v">Mulligan {h.mulligan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap">
          <span className="pk-eyebrow">Anlegg · Øst</span>
          <h2 className="pk-sekt">Finn frem.</h2>
          <p className="pk-ing">
            Vi holder til på tre anlegg: Mulligan Indoor Golf i Fredrikstad og Sarpsborg for
            innendørs trening hele året, og Gamle Fredrikstad Golfklubb for utendørs sesong.
          </p>
          <div className="pk-rutenett">
            {ANLEGG.map((a) => (
              <div className="pk-mkort" key={a.place}>
                <span className="pk-eyebrow">{a.note}</span>
                <h3 className="pk-und">{a.place}</h3>
                <p>{a.address}</p>
                <a
                  className="pk-btn pk-btn-sm pk-knapp-topp"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vis i kart
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal">
          <span className="pk-eyebrow">Ofte stilt</span>
          <h2 className="pk-sekt">Korte svar på vanlige spørsmål.</h2>
          {KONTAKT_FAQ.map((f) => (
            <details className="pk-qa" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="pk-sek pk-sek-tett">
        <div className="pk-wrap pk-wrap-smal pk-midtstilt">
          <span className="pk-eyebrow">Klar når du er</span>
          <h2 className="pk-sekt">Heller bare komme i gang?</h2>
          <p className="pk-ing">
            Du trenger ikke vente på svar. Book en økt direkte, eller send oss en e-post om du vil
            ta det skriftlig først.
          </p>
          <div className="pk-knapperad pk-knapperad-midt">
            <Link className="pk-btn pk-btn-ink" href="/booking">
              Book en økt
            </Link>
            <a className="pk-btn" href="mailto:post@akgolf.no">
              Send oss en e-post
            </a>
          </div>
        </div>
      </div>
    </PkShell>
  );
}
