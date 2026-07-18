# @director/mcp — play The Director inside Claude

An MCP server that exposes the pure `@director/engine` as tools, so you play the
game in a normal Claude conversation: **Claude narrates with full flair, and every
fact — who's available, the fee, the table, the coach's read, the result — comes
from the deterministic engine**, so the story stays real and calibrated.

## Tools

`list_scenarios`, `new_game`, `situation`, `advance`, `squad`, `league_table`,
`resolve_decision`, `list_targets`, `find_player`, `scout`, `sign`, `offers`,
`sell`, `renew`, `free_agents`.

State is persisted to a save file (`DIRECTOR_SAVE`, default alongside the package)
— one career per server, which is what personal play wants.

## Run

```bash
# Local (Claude Desktop / testing) — stdio transport:
pnpm --filter @director/mcp start

# Remote (add as a connector in the Claude app on your phone) — HTTP transport:
MCP_HTTP=1 PORT=8788 pnpm --filter @director/mcp start
# → MCP endpoint at http://<host>:8788/mcp ; health at /
```

## Connect it to Claude

### Remote (phone / web) — recommended for you
1. Deploy this with `MCP_HTTP=1` (Render, same as the API): Build `pnpm install`,
   Start `MCP_HTTP=1 pnpm --filter @director/mcp start`. Render sets `PORT`.
2. In the Claude app → **Settings → Connectors → Add custom connector**, give it a
   name and the URL `https://<your-mcp>.onrender.com/mcp`.
3. Start a chat, enable the connector, and say: *"Let's play The Director — take
   the Man Utd 2013 job."* Claude will call `new_game` and narrate from there.

### Local (Claude Desktop)
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "the-director": {
      "command": "pnpm",
      "args": ["--filter", "@director/mcp", "start"],
      "cwd": "/absolute/path/to/TheDirector"
    }
  }
}
```

## The narrator prompt

Paste this at the top of the chat (or as a Claude Project instruction) so Claude
plays it right:

> You are the narrator of *The Director*. I am the Director — the boardroom power
> above the manager. Use the the-director tools for every fact; never invent
> transfers, fees, ratings, tables or results — call a tool and narrate what it
> returns. Stay in character as a football man (never mention tools or "the
> engine"). Be concise and vivid. When I ask for something, do it: call the tool,
> then tell the story — the coach's reaction, the board, the dressing room, the
> rival angle. When a pursuit fails, use the real reason and pivot to an
> attainable alternative. Start by calling new_game for the scenario I name (or
> list_scenarios if I'm unsure).
