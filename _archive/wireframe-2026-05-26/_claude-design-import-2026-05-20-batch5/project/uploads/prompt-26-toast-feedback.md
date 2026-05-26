# Prompt 26 — Toast-feedback komponent (global)

## Hensikt

Konsekvent toast-system for alle suksess/feil/info-feedback på tvers av PlayerHQ. Auto-dismiss 4s, stackable, swipe-to-dismiss på mobil.

## Trigger

Programmatisk fra alle modaler, server actions, mutations.

## Layout

- Posisjon: bunn-høyre desktop (`fixed bottom-6 right-6`), bunn-sentrert mobil.
- Bredde: 380 px desktop, full bredde med margin på mobil.
- Stack: maks 3 toasts samtidig, eldre fader ut.
- Hver toast:
  - Card cream, `rounded-md`, `border border-border`, drop-shadow soft, `p-4`
  - Venstre: type-ikon i farget circle 32×32
    - Suksess: lime + Lucide Check
    - Feil: destructive + Lucide AlertCircle
    - Info: forest + Lucide Info
    - Varsling: gul + Lucide Bell
  - Midten: tittel Inter Tight 14 px semibold + body Inter 13 px muted
  - Høyre: X-knapp 16×16, valgfri "Angre"-knapp lime
- Progress-bar nederst: 4 px høy, lime, krymper fra 100→0 % over 4s
- Animasjon: slide-in fra høyre 240 ms, slide-out 180 ms

## Komponenter

- Sonner eller shadcn `Toaster` + `toast()`-helper
- Lucide: Check, AlertCircle, Info, Bell, X, Undo2

## Eksempel-data

```
Suksess: "12 varsler markert som lest" + Undo
Feil: "Kunne ikke lagre. Sjekk nett."
Info: "Coach Anders K leste meldingen din"
Varsling: "Booking om 1 time"
```

## Branding-krav

- Forest tekst, lime/destructive aksenter.
- Lucide stroke 1.75.
- Ingen emojier.
- Norsk bokmål.

## Tilstander

- **Vises**: slide-in + progress-countdown.
- **Hover**: pauses countdown.
- **Manuell dismiss**: X-klikk eller swipe.
- **Angre**: holder toast åpen til ekstra klikk.
