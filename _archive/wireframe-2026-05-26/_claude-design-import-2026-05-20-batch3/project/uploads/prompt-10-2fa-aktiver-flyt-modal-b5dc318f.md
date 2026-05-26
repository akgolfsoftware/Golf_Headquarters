# Prompt 10 — 2FA aktiveringsflyt (multistep modal)

## Hensikt

Når Markus klikker "Aktiver 2-faktor" i `/portal/meg/sikkerhet`, kjøres en 3-stegs modal: velg metode → verifiser → lagre backup-koder.

## Trigger

Klikk "Aktiver 2-faktor autentisering" knapp.

## Layout (3 steg, samme modal)

- Modal 560 × auto, cream, `rounded-2xl`, `p-10`, sticky bunn.
- Header: eyebrow "PLAYERHQ · SIKKERHET · 2FA", progress-pills 1/2/3 (lime når aktiv).

### Steg 1 — Velg metode

- Tittel: "Hvordan vil du *bekrefte*?"
- 3 store cards (vertikal stack):
  - Authenticator-app (Google/Authy) — Lucide Smartphone
  - SMS — Lucide MessageSquare
  - Sikkerhetsnøkkel (YubiKey) — Lucide Key
- Hver card: tittel, beskrivelse, "Anbefalt"-badge på Authenticator.
- CTA "Fortsett" disabled til valg er gjort.

### Steg 2 — Verifiser

- Hvis Authenticator: QR-kode 240×240 + manuell secret-streng JetBrains Mono
- Input 6 sifre: 6 separate boxes, auto-tab
- "Send kode på nytt"-lenke under (SMS-modus)

### Steg 3 — Backup-koder

- 10 koder vist i 2-kol grid JetBrains Mono 16 px
- CTA "Last ned som .txt" og "Kopier alle"
- Sjekkboks: "Jeg har lagret kodene på et trygt sted"
- Primær forest "Fullfør" (disabled til checkbox)

## Komponenter

- `Dialog`, `RadioGroup`, `Input` (OTP), `Button`, `Checkbox`
- Lucide: Smartphone, MessageSquare, Key, QrCode, Copy, Download, Check, X

## Eksempel-data

```
Markus, Authenticator valgt
Secret: 7XQK J8DL M3PR N2VC
Backup-koder: 10 × 8-tegns alfanumerisk
```

## Branding-krav

- Lime aksent på "Anbefalt"-badge og aktiv progress.
- JetBrains Mono for koder/secret.
- Norsk bokmål.

## Tilstander

- **Verifisering feilet**: rødt undertekst "Feil kode, prøv igjen".
- **Suksess**: confetti soft + lukkes + toast "2FA aktivert".
