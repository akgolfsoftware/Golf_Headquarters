# Supabase-auth-e-poster — AK Golf-design (norsk)

Disse tre filene erstatter Supabases standard engelske e-postmaler. De kan
IKKE settes fra kode/repo — Supabase auth-maler bor i prosjektets dashbord,
ikke i miljøvariabler eller SQL. Anders må lime dem inn manuelt (én gang).

## Hvor du limer dem inn

1. Logg inn på [supabase.com/dashboard](https://supabase.com/dashboard) → velg AK Golf HQ-prosjektet.
2. Gå til **Authentication** (venstre meny) → **Emails** → **Templates**.
3. Du ser en liste med maler til venstre: *Confirm signup*, *Invite user*,
   *Magic Link*, *Change Email Address*, *Reset Password*, *Reauthentication*.
4. For hver av de tre malene under: klikk på malen → bytt til **Source**-/
   **HTML-visning** (ikonet ved siden av "Message body", ofte kalt `</>`)
   → merk alt → lim inn hele innholdet fra riktig fil → **Save**.

| Supabase-mal (i dashbordet) | Fil i denne mappen |
|---|---|
| **Confirm signup** | `bekreft-epost.html` |
| **Reset Password** | `tilbakestill-passord.html` |
| **Change Email Address** | `endre-epost.html` |

Rør ikke *Invite user*, *Magic Link* eller *Reauthentication* — de er ikke i
bruk i AK Golf HQ per nå (ingen magic-link-innlogging, ingen invitasjon via
Supabase sitt eget system).

## Emne-felt (Subject)

Supabase har et eget "Subject heading"-felt over selve HTML-en. Sett disse
(kopier nøyaktig):

| Mal | Subject |
|---|---|
| Confirm signup | `Bekreft e-postadressen din — AK Golf` |
| Reset Password | `Tilbakestill passordet ditt — AK Golf` |
| Change Email Address | `Bekreft ny e-postadresse — AK Golf` |

## Variabler brukt i malene

Disse er Supabase sine innebygde variabler (ikke rør syntaksen — de fylles
inn automatisk når e-posten sendes):

- `{{ .ConfirmationURL }}` — lenken brukeren klikker på.
- `{{ .Email }}` / `{{ .NewEmail }}` — kun i endre-epost-malen: gammel og ny
  adresse, så brukeren ser hva som faktisk endres.

## Design

Samme visuelle ramme som resten av AK Golfs transaksjons-e-poster
(`emailLayout()` i `src/lib/email/templates/shared.ts`): hvit kort-boks på
krem bakgrunn, forest-grønn knapp med lime-tekst, AK Golf Academy-footer med
adresse og kontakt-e-post. Fordi Supabase sine maler ikke kan importere kode
fra repoet, er HTML-en i disse tre filene en frittstående kopi av samme
ramme — hvis fargene/adressen i `emailLayout()` endres senere, må disse tre
filene oppdateres manuelt og limes inn på nytt.

## Test

Etter innliming: bruk "Send test email" (hvis Supabase-planen støtter det)
eller trigger flyten reelt (registrer en testbruker / be om passord-reset)
og sjekk at e-posten kommer fram med riktig design og at lenken fungerer.
