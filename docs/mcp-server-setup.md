# MCP-server: AK Golf HQ

AK Golf HQ eksponerer en Model Context Protocol-server på `/api/mcp/akgolf`. Den
lar eksterne MCP-klienter (Claude Desktop, Cline, Cursor) lese og foreslå
endringer i akgolf-data med samme tools som Caddie bruker internt.

- Transport: HTTP + JSON-RPC 2.0 (POST)
- Protokollversjon: `2024-11-05`
- Auth: `Authorization: Bearer <API_KEY>` (ADMIN-bruker kreves)
- Server-ID: `ak-golf-hq` v1.0.0

## 1. Generer en API-nøkkel

1. Logg inn som ADMIN på `https://hq.akgolf.no/admin/settings/api`.
2. Klikk **"Ny nøkkel"**, gi den et navn (eks. `claude-desktop-macbook`).
3. Kopier hele nøkkelen — den vises **kun én gang**. Format: `akg_<random>`.
4. Lagre den i en sikker passord-manager.

API-nøkkelen kobles til din egen brukerprofil. Hvis du tilbakekaller den
(`/admin/settings/api` → "Tilbakekall"), slutter den umiddelbart å virke.

## 2. Konfigurer Claude Desktop

Åpne `~/Library/Application Support/Claude/claude_desktop_config.json` og legg
til:

```json
{
  "mcpServers": {
    "ak-golf-hq": {
      "transport": {
        "type": "http",
        "url": "https://hq.akgolf.no/api/mcp/akgolf",
        "headers": {
          "Authorization": "Bearer akg_DIN_NOKKEL_HER"
        }
      }
    }
  }
}
```

Restart Claude Desktop. Du skal nå se `ak-golf-hq` blant tilgjengelige
MCP-servere i innstillinger.

## 3. Test med curl

```bash
# Initialize handshake
curl -X POST http://localhost:3000/api/mcp/akgolf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer akg_DIN_NOKKEL" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "curl-test", "version": "1.0" }
    }
  }'

# List tools
curl -X POST http://localhost:3000/api/mcp/akgolf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer akg_DIN_NOKKEL" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

# Call searchPlayers
curl -X POST http://localhost:3000/api/mcp/akgolf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer akg_DIN_NOKKEL" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{ "name":"searchPlayers", "arguments":{ "query":"Markus", "limit":5 } }
  }'
```

## 4. Tilgjengelige metoder

| Metode | Beskrivelse |
|---|---|
| `initialize` | Handshake, returnerer protokollversjon og capabilities. |
| `ping` | Tom respons, brukes for liveness-sjekk. |
| `tools/list` | Liste over alle tools med JSON Schema for input. |
| `tools/call` | Eksekver et tool. Read-tools returnerer data, write-tools returnerer forslag med `needsApproval: true`. |
| `notifications/initialized` | Bare ack, ingen body. |
| `prompts/list` / `resources/list` | Tom liste (vi tilbyr ikke prompts/resources). |

## 5. Tools

Se `src/lib/caddie/tools/read.ts` og `src/lib/caddie/tools/write.ts`. Read-tools
auto-eksekverer og returnerer Prisma-data. Write-tools (alle prefikset
`draft*`) returnerer et forslagsobjekt med `needsApproval: true` — MCP-klienten
må presentere dette for brukeren og selv kalle en separat utfør-endpoint hvis
brukeren godkjenner.

## 6. Feilkoder (JSON-RPC)

| Kode | Mening |
|---|---|
| `-32001` | Mangler `Authorization: Bearer`-header. |
| `-32002` | Ukjent eller tilbakekalt API-nøkkel. |
| `-32003` | API-nøkkelen tilhører ikke en ADMIN-bruker. |
| `-32004` | API-nøkkelen er utløpt. |
| `-32600` | Ugyldig JSON-RPC-request. |
| `-32601` | Ukjent metode eller ukjent tool-navn. |
| `-32602` | Ugyldige params (tool-argumenter feilet Zod-validering). |
| `-32700` | Body kunne ikke parses som JSON. |

## 7. Sikkerhet

- Nøkler hashes med SHA-256 før lagring; klartekst-nøkkelen finnes kun i din
  klient-konfigurasjon.
- Hver request logger `lastUsedAt` på nøkkelen.
- Tilbakekalling (`revokedAt`) er øyeblikkelig — ingen cache.
- Anbefal: bruk separate nøkler per maskin/klient, så du kan tilbakekalle
  enkeltvis.

## 8. SSE-streaming (planlagt)

Foreløpig er alle responser ferdige JSON-objekter. SSE-streaming for lange
listinger kommer i en senere fase.
