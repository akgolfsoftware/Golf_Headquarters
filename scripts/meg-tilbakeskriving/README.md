# Meg Tilbakeskrivings-pipeline

Kjører automatisk kl. 21:30 og henter alle Meg-logger du har logget via Telegram. Claude destillerer dem og skriver til:

- **Dagsnotat** → `~/ak-brain/YYYY-MM-DD.md` under seksjonen «## Fra Meg»
- **Varige mønstre** → `~/Developer/ak-second-brain/meg-monstre/` — én fil per mønster, git-committet automatisk
- **Kjøre-rapport** → `~/ak-brain/Arbeidslogg/meg-tilbakeskriving-YYYY-MM-DD.md`

---

## Steg 1 — Migrasjon (kun én gang)

1. Gå til [Supabase-dashbordet](https://supabase.com) → velg Meg-prosjektet ditt
2. Klikk **SQL Editor** i venstremenyen
3. Lim inn innholdet fra `migration.sql` (samme mappe som denne filen)
4. Klikk **Run**

Dette legger til en kolonne som holder styr på hvilke logger som er prosessert.

---

## Steg 2 — Sjekk env-variabler

Åpne `.env.local` i prosjektroten og sjekk at disse finnes:

```
MEG_SUPABASE_URL=...
MEG_SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
```

De to første er allerede satt for Meg-boten. Valgfritt — settes automatisk til fornuftige standardverdier:

```
AK_BRAIN_PATH=/Users/anderskristiansen/ak-brain
AK_SECOND_BRAIN_PATH=/Users/anderskristiansen/Developer/ak-second-brain
```

---

## Steg 3 — Test manuelt

Fra prosjektmappen:

```bash
npm run meg:tilbakeskriv
```

Du ser logg i terminalen. En rapport dukker opp i `~/ak-brain/Arbeidslogg/`.

---

## Steg 4 — Installer LaunchAgent (daglig kjøring kl. 21:30)

```bash
cp scripts/meg-tilbakeskriving/launchagent/no.akgolf.meg-tilbakeskriving.plist \
   ~/Library/LaunchAgents/

launchctl load ~/Library/LaunchAgents/no.akgolf.meg-tilbakeskriving.plist
```

Sjekk at den er lastet:

```bash
launchctl list | grep meg-tilbakeskriving
```

Kjør manuelt nå (som om klokken er 21:30):

```bash
launchctl start no.akgolf.meg-tilbakeskriving
```

---

## Avinstaller

```bash
launchctl unload ~/Library/LaunchAgents/no.akgolf.meg-tilbakeskriving.plist
rm ~/Library/LaunchAgents/no.akgolf.meg-tilbakeskriving.plist
```

---

## Loggfil

```bash
tail -50 scripts/meg-tilbakeskriving.log
```

---

## Nytt 2026-07-19 — inbox-sortering + «Venter på deg» (Agentic OS Steg 4)

Pipelinen gjør nå to ting til, i denne rekkefølgen:

1. **Inbox-sortering (steg 0):** tømmer `~/ak-brain/inbox/*.md`. Hver note
   klassifiseres til ett av fem domener (Mulligan / WANG / GFGK / Admin /
   Software) — lokalt via Ollama (`MEG_OLLAMA_URL`, `MEG_OLLAMA_MODEL`,
   default `qwen2.5:7b`), med Claude som fallback. Sikre treff flyttes til
   `<Domene>/Innkommende/` og lenkes opp i `MOC-<Domene>.md` under
   «## Innkommende». Usikre noter BLIR LIGGENDE i inbox (vi gjetter aldri)
   og rapporteres.
2. **«Venter på deg» (siste steg):** skriver/erstatter en seksjon i dagens
   notat med MAKS 3 konkrete aksjonspunkter, basert på dagens destillat +
   uavklarte inbox-noter. Seksjonen er alltid fersk (erstattes per kjøring).

Begge stegene er defensive: mangler inbox-mappen, Ollama eller API-nøkkel,
hopper de over med en logglinje — tilbakeskrivingen stopper aldri.

Valgfrie env-variabler:

```
MEG_OLLAMA_URL=http://localhost:11434
MEG_OLLAMA_MODEL=qwen2.5:7b
MEG_MODEL_RASK=claude-haiku-4-5-20251001   # Claude-fallback for klassifisering
```
