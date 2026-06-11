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
