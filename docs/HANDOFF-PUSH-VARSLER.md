# Handoff — Web Push-varsler (2026-07-18)

> Lest av en **ny lokal session**. Denne fila er selvstendig: du har ikke konteksten fra
> forrige økt. Les alt før du gjør noe. Skrevet på slutten av en remote-økt der push-varsler
> ble merget til main og VAPID-oppsettet ble avklart.

## TL;DR — hvor vi står

- **Push-varsler er ferdig kodet og merget til main** (PR #76, commit `8806414`
  «fyr web push når in-app-varsel opprettes»). Auto-deployet til prod via Vercels
  git-integrasjon.
- **VAPID-nøklene lå ALLEREDE i Vercel Production i 66 dager** (+ Preview 57 dager).
  Feature-en var «parkert» med nøkler klare; i dag ble send-koden koblet på.
- **Det eneste som gjenstår: teste push live** (krever ekte nettleser på prod-domenet —
  Anders' enhet, ikke en headless boks).
- **To oppryddinger gjenstår** (se under): fjern én feilaktig dev-env-variabel + slett to
  lokale hemmelighetsfiler.

## VIKTIG KORREKSJON — ikke sett nye VAPID-nøkler

Tidligere i økta genererte jeg et **nytt** VAPID-par fordi det ikke fantes noen `.env`-fil
lokalt. **Det var feil premiss** — `vercel env ls` viste at nøklene har ligget i Production
siden 66 dager tilbake:

```
VAPID_SUBJECT                 Production   66d ago
VAPID_PRIVATE_KEY             Production   66d ago
NEXT_PUBLIC_VAPID_PUBLIC_KEY  Production   66d ago
```

Production er et gyldig, sammenhengende par. **Rør ALDRI de tre Production-variablene** — å
bytte dem ut ville invalidere alle eksisterende push-abonnement. Det nye paret jeg genererte
er **ubrukt og skal forkastes.**

## Oppryddinger som gjenstår (gjør disse først)

### 1. Fjern feilaktig dev-variabel i Vercel
Under feilsøkingen la vi ved uhell inn en **ny** offentlig nøkkel i **Development** (matcher
ikke privatnøkkelen). Fjern den så dev ikke har et ødelagt par:

```bash
vercel env rm NEXT_PUBLIC_VAPID_PUBLIC_KEY development
```
Bekreft med `y`. **Production forblir urørt.** Verifiser etterpå med `vercel env ls` at
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` kun står i Production + Preview (de gamle, 57–66d), ikke lenger
i Development.

### 2. Slett lokale hemmelighetsfiler
Under økta ble disse laget på Anders' Mac og inneholder en **ubrukt** privatnøkkel + ekte
prod-hemmeligheter hentet med `vercel env pull`:

```bash
rm ~/.env.local          # pullet dev-env + ubrukt VAPID-privatnøkkel
rm ~/vapid-keys.env      # det ubrukte nye VAPID-paret (hvis lastet ned dit)
```
(Sjekk hvor `vapid-keys.env` faktisk ble lagret — den ble sendt som nedlastbar fil.)

## Gjenstående oppgave: test push live

Krever Anders' faktiske nettleser (ekte web-push går via nettleserens pushtjeneste til hans
enhet — kan ikke gjøres headless):

1. Åpne **akgolf-hq.vercel.app**, logg inn → **Innstillinger → Varsler** → skru **på** push,
   godkjenn nettleser-popupen.
   - Krever HTTPS (✓ på prod). På **iOS må appen legges til på hjem-skjermen** først, ellers
     finnes ikke Push API.
2. Utløs et in-app-varsel (push fyrer automatisk når et `Notification`-rad opprettes — se
   commit `8806414` / `src/lib/notifications.ts`). F.eks. en handling som varsler brukeren.
3. Systemvarselet skal dukke opp; klikk åpner riktig skjerm (`notificationclick` i `sw.ts`).

### Slik verifiserer du at det virker
- **Vercel → deployment → Runtime Logs.** Uten nøkler/abonnement logger `sendPush`
  `"[push] VAPID-keys mangler"`. Med gyldig oppsett + aktivt abonnement forsvinner den linja
  og `sendPush` returnerer `{ ok, sent > 0, failed }`.
- Ingen `sent`? Sjekk at et `PushSubscription`-rad faktisk ble lagret (toggle → POST
  `/api/push/subscribe`).

## Kodekart (hvor ting bor)

| Fil | Rolle |
|---|---|
| `src/lib/push/vapid.ts` | Leser `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_SUBJECT`. `getServerVapidConfig()` returnerer `null` hvis nøkler mangler → push blir trygg no-op. |
| `src/lib/push/send.ts` | `sendPush(userId, payload)` — henter subs, `webpush.sendNotification`, sletter 404/410-endepunkter. Best-effort, kaster aldri. |
| `src/components/portal/push-toggle.tsx` | Klient-logikk: `aktiverPush` / `deaktiverPush` / `detectPushStatus`. Bruker kun public key. |
| `src/components/portal/v2/InnstillingerVarslerV2.tsx` | v2-presentasjonslaget for toggelen. |
| `src/app/sw.ts` | Service worker (Serwist). `push`- og `notificationclick`-handlere. Bygges til `/sw.js` **etter** `next build` (configurator-modus). |
| `src/app/api/push/subscribe/route.ts` · `.../unsubscribe/route.ts` | Lagrer/sletter `PushSubscription`. |
| `src/lib/notifications.ts` | Oppretter in-app-varsel + kaller `sendPush` (koblingen fra PR #76). |

## Feller (gotchas) å huske

- **ALDRI `vercel deploy --prod` manuelt** (prosjektregel). Prod deployer via Vercels
  git-integrasjon på push til main. For å plukke opp env-endringer: **Vercel-dashboard →
  Deployments → siste → ⋯ → Redeploy** (ikke nødvendig her — nøklene lå der fra før).
- **Main er portet** (Anders' «ja» før merge). Dette er allerede merget, så ikke rør.
- **`vercel env add`**: sensitive variabler kan IKKE ligge i Development. Svar `n` på
  «sensitive» for å få en variabel i alle tre miljøene. I miljø-multiselect: **mellomrom**
  for å huke av hvert miljø, deretter Enter (bare Enter velger kun det markerte).
- **Serwist/Turbopack**: `sw.js` genereres kun av `serwist build serwist.config.mjs` som
  kjører ETTER `next build` (se `package.json`). Uten det finnes ikke `/sw.js` i prod.
- **iOS**: Push API finnes bare når PWA-en er lagt til på hjem-skjermen.

## Git-state

- Branch i remote-økta: `claude/push-varsler` (arbeidet er merget til main via PR #76).
- Denne handoff-fila (`docs/HANDOFF-PUSH-VARSLER.md`) er en ren dokument-endring. Per
  git-reglene kan doc-endringer Anders har bedt om gå rett til main — men bekreft med Anders
  om den skal committes/hvor.

## Neste steg for den nye sessionen

1. Kjør de to oppryddingene over (fjern dev-variabel, slett lokale filer).
2. Be Anders skru på push i appen og utløse et varsel.
3. Les Vercel runtime-logs og bekreft `sendPush sent > 0` — eller diagnostiser.
4. Meld tilbake til Anders når push er verifisert live.
