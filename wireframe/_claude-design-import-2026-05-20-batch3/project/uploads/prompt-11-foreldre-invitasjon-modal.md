# Prompt 11 — Foreldre-invitasjon modal

## Hensikt

Når Markus (mindreårig) eller foresatte trykker "Inviter forelder" i `/portal/meg/foreldre`, åpnes modal for å sende invitasjon-lenke til e-post/telefon.

## Trigger

CTA "Inviter forelder" på foreldre-side.

## Layout

- Modal 520 × auto, cream, `rounded-2xl`, `p-10`.
- Hero: Inter Tight 24 px "Inviter en *forelder*".
- Beskrivelse: "Foresatte får tilgang til plan, økonomi og helse. Du kan trekke tilbake tilgangen når som helst."
- Skjema:
  - Navn-input
  - E-post-input (med "@" + Lucide Mail ikon)
  - Telefon (valgfritt)
  - Relasjon Select (Mor / Far / Steforelder / Verge / Annet)
  - Tilgangsnivå RadioGroup:
    - "Full tilgang" (default for <18)
    - "Kun økonomi" (faktura, abonnement)
    - "Kun kalender" (booking, plan)
- Forhåndsvisning av invitasjon-e-post nederst i muted card.
- Bunn:
  - Primær forest "Send invitasjon"
  - Outline "Avbryt"

## Komponenter

- `Dialog`, `Input`, `Select`, `RadioGroup`, `Button`
- Lucide: X, Mail, Phone, Users, Shield, Send

## Eksempel-data

```
Navn: Mette Røinås Pedersen
E-post: mette@example.no
Telefon: 911 12 345
Relasjon: Mor
Tilgang: Full tilgang
```

## Branding-krav

- Forest primær, lime accent på "Anbefalt"-badge på Full tilgang.
- Inter Tight italic for "forelder".
- Norsk bokmål.

## Tilstander

- **Pending**: spinner.
- **Suksess**: lukkes + toast "Invitasjon sendt til mette@example.no".
- **Allerede invitert**: vis pending-pill i listen.
