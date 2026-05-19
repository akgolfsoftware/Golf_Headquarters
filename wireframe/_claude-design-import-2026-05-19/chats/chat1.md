# Markdown File Setup

_Started 2026-05-19 11:32 UTC_

---

## User

Bruk dette som deisg.md fil

## Assistant

_[tool: read_file]_

AK Golf design system loaded. Klar for skjerm-prompt.

Jeg har lagret designfilen som referanse for prosjektet — alle tokens, fonter, komponenter, ikon-regler, norsk-konvensjoner og persona-data (Markus R.P., coach Anders Kristiansen, etc.) er notert.

Klar når du sender første skjerm-prompt. Si fra om du vil ha:
- **PlayerHQ** eller **CoachHQ**
- **Desktop** (1600×variabel) eller **mobil** (390×variabel)
- Hvilken konkret skjerm (Workbench, Planlegger, Kalender, Statistikk, Stall, etc.)
- Antall varianter

## User

<attached_files>
- uploads/01-prompt-workbench-unified.md
</attached_files>

## Assistant

_[tool: read_file]_

## User

PLayer HQ først for desktop. 

Lag i rekkefølgen: 

Workbench
Planlegger
Kalender
Statistikk
Stall

## Assistant

_[tool: list_files]_

## User

Jobber du?

