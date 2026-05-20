# CoachHQ — Ny spiller-flyt (wizard)

**Trigger:** "Ny spiller" på stall-liste eller `/admin/elever/ny`.

## Kontekst
Anders oppretter ny spiller. Tre steg: grunninfo, team & abonnement, invitasjon.

## Formål
- Opprett bruker i Supabase + Prisma User
- Send invitasjons-e-post automatisk
- Tildel team og start-plan

## Layout — 3-step wizard

**Progress-bar topp:** Steg 1 av 3 · Grunninfo

### Steg 1 — Grunninfo
- Fornavn + Etternavn
- E-post (validering: må være unik)
- Telefon (norsk format)
- Fødselsdato (validering: junior if <18)
- Hcp (tall input)
- Hjemmeklubb (dropdown med søk: GFGK, Bossum, etc.)

### Steg 2 — Team & abonnement
- Team-velger: AK Academy / WANG / Begge (lime kort som radio)
- Tier: GRATIS / PRO — viser månedlig pris i mono
- Start-dato (date picker, default i dag)
- Coach (default: Anders, men dropdown)
- Foreldre (hvis junior): "Legg til foresatt" → mini-form med navn + e-post

### Steg 3 — Invitasjon
- Velg-melding-mal dropdown: "Velkommen AK Academy" | "WANG-velkomst" | "Egendefinert"
- Preview av invitasjons-e-post (les-modus)
- Toggle "Send invitasjon nå"
- Bunn-info: "Markus får e-post med magisk lenke for å sette passord"

**Footer:**
- "Tilbake" outline (skjult på steg 1)
- "Neste" forest (steg 1-2) / "Opprett og send invitasjon" på steg 3
- "Lagre kladd" venstre link

## Bekreftelse
Etter opprett: full-screen success med lime CircleCheck, "Spiller opprettet. Invitasjon sendt til markus@..." + "Gå til profil" / "Opprett enda en"

## Branding
Cream wizard-bg, hvit panel, forest CTA, lime success.
