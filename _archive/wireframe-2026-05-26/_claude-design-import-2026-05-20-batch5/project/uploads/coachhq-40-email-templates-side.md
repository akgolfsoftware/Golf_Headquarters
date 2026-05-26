# CoachHQ — E-postmaler (side)

**Rute:** `/admin/email-templates`.

## Kontekst
AK Golf sender mange e-poster: velkomst, faktura, påminnelser, ukentlig oppsummering. Anders vedlikeholder maler.

## Formål
- Liste alle maler
- Redigere mal-tekst (variabel-støtte)
- Forhåndsvise + send test

## Layout

**Header:**
- "E-postmaler" Inter Tight 700 32px
- "14 maler · 3 inaktive" mono
- "Ny mal" forest fill

**Mal-liste (2-kolonne grid):**
Hver mal-kort:
- Ikon (Lucide Mail eller spesifikk per type)
- Tittel "Velkomst — Ny PRO-spiller"
- Type-pille (TRANSAKSJONELL / MARKEDSFØRING / VARSEL)
- Sist endret mono
- Brukt antall ganger: "Sendt 234 ganger"
- Hover: "Rediger" / "Forhåndsvis" / "Send test"

**Editor (drawer/modal når klikk "Rediger"):**
- Topp: Mal-tittel + emne-input
- To-pane: WYSIWYG-editor venstre, live preview høyre
- Variable-pills som dras inn: `{{spiller.fornavn}}`, `{{coach.fornavn}}`, `{{neste_okt}}`, etc.
- Footer: "Lagre", "Send test til meg", "Avbryt"

**Filter:**
Type-chips: Alle | Transaksjonell | Markedsføring | Varsel
Status: Aktiv | Inaktiv

## Branding
Cream bg, hvite mal-kort, lime variabel-pills, forest CTA.
