# SYNC.md — Multi-device workflow

Denne fila finnes for å unngå kaos når jeg jobber fra både Mac Mini og MacBook Air.
Les den **hver gang** du bytter maskin. Hopper du over et steg, sporer ting av.

---

## Maskin-rollene

- **Mac Mini = primær.** Hovedstasjonen. Det meste av arbeidet skjer her.
- **MacBook Air = sekundær.** Reise, café, sofaen.

**Den ene regelen som ikke kan brytes:**
Jobb aldri parallelt på begge maskinene. Push før du forlater én, pull før du
starter på den andre. Hvis du ved et uhell jobber på begge, blir det
merge-konflikter — og du kommer aldri til å huske hvilken side var "riktig".

---

## Før du forlater Mac Mini

```bash
cd ~/akgolf-hq
git status                    # Skal være "nothing to commit, working tree clean"
git push                      # Selv om du ikke har commits — bekrefter sync
```

Hvis `git status` viser endringer:
- Commit dem først (`git add . && git commit -m "..."`)
- Eller stash dem (`git stash`) hvis de ikke er klare
- Push uansett før du går

---

## Når du starter på MacBook Air

### Første gang noensinne (engangs-oppsett)

Følg disse stegene én gang. Etter dette går du rett til "Hver gang"-seksjonen.

1. **Installer 1Password**
   - Last ned fra https://1password.com/downloads/mac/
   - Logg inn med Master Password + Secret Key (fra Emergency Kit)
   - Verifiser at du ser `akgolf-hq .env.local`-noten

2. **Installer Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. **Installer Node.js og gh CLI**
   ```bash
   brew install node gh
   ```

4. **Logg inn på GitHub via gh CLI**
   ```bash
   gh auth login
   ```
   Velg: GitHub.com → SSH → Yes (generate SSH key) → Login with browser

5. **Klone repoet**
   ```bash
   cd ~
   gh repo clone akgolfgroup-netizen/akgolf-hq
   cd akgolf-hq
   ```

6. **Hent .env.local fra 1Password**
   - Åpne 1Password → `akgolf-hq .env.local`
   - Kopier hele Notes-feltet
   - I terminalen:
     ```bash
     cd ~/akgolf-hq
     touch .env.local
     open -e .env.local
     ```
   - Lim inn (Cmd+V), lagre (Cmd+S), lukk
   - Verifiser med `grep -c "^[A-Z_]*=" .env.local` → skal returnere `5`

7. **Installer dependencies**
   ```bash
   npm install
   ```

8. **Verifiser at alt funker**
   ```bash
   npm run dev
   ```
   Åpne http://localhost:3000 — skal vise placeholder-siden.

### Hver gang etter første oppsett

```bash
cd ~/akgolf-hq
git pull                      # Hent endringer fra Mac Mini
npm install                   # Sync dependencies hvis package.json er endret
npm run dev                   # Verifiser at alt fungerer
```

Hvis `git pull` feiler med konflikt: stopp og fix lokalt før du gjør noe annet.

---

## Før du forlater MacBook Air

Identisk med "Før du forlater Mac Mini":

```bash
cd ~/akgolf-hq
git status
git push
```

---

## Når du starter på Mac Mini igjen

```bash
cd ~/akgolf-hq
git pull
npm install                   # Hvis MacBook Air installerte nye pakker
```

---

## Når .env.local endres

Hvis du legger til eller endrer en environment-variabel på én maskin:

1. Oppdater `.env.local` lokalt
2. Restart `npm run dev` for å laste inn ny verdi
3. **Oppdater 1Password** umiddelbart:
   - Åpne `akgolf-hq .env.local`-noten
   - Erstatt Notes-feltet med nytt innhold
   - Oppdater `Last updated`-feltet til dagens dato
4. På den andre maskinen, neste gang du starter:
   - Hent oppdatert versjon fra 1Password
   - Erstatt `.env.local` lokalt

`.env.local` er i `.gitignore` og synker IKKE via Git. 1Password er eneste source of truth.

---

## Når Claude Code-config endres

(Kommer i egen fase. `~/.claude/`-mappen versjoneres i eget privat repo —
`claude-config` — som klones på begge maskiner.)

---

## Hva som ALDRI synkes via chat / Slack / e-post

- `.env.local`-innhold
- Supabase service_role keys
- Database-passord
- GitHub recovery codes
- 1Password Secret Key eller Master Password
- API-nøkler av noe slag

Disse går kun via 1Password. Hvis noe må deles utenfor 1Password (sjelden tilfelle),
bruk 1Password sin "Share"-funksjon med utløpsdato.

---

## Hvis noe har blitt eksponert i chat / logg

Anta at det er kompromittert. Roter umiddelbart:

- **Supabase keys:** Project Settings → API → Reset
- **Database-passord:** Project Settings → Database → Reset password
- **GitHub recovery codes:** Settings → Security → Generate new recovery codes
- **GitHub token:** `gh auth refresh` eller regenerer på github.com/settings/tokens

Etter rotering: oppdater `.env.local` og 1Password.

---

## Endringslogg

- 2026-05-05: Initial setup. Mac Mini primær, MacBook Air sekundær. 1Password + gh CLI.
