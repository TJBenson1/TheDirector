/**
 * The Director — MCP server.
 *
 * Exposes the @director/engine as tools so you play The Director INSIDE Claude:
 * Claude narrates with full flair while every fact (who's available, the fee, the
 * table, the coach's read, the result) comes from the deterministic engine, so
 * the story stays real and calibrated.
 *
 * Transports: stdio by default (Claude Desktop / local testing); Streamable HTTP
 * when MCP_HTTP=1 (a remote connector you add in the Claude app on your phone).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'node:http';
import { z } from 'zod';
import * as game from './game.js';

const server = new McpServer({ name: 'the-director', version: '1.0.0' });

const ok = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

server.tool('list_scenarios', 'List the playable starting points (club + season + mandate).', {}, async () => ok(game.listScenarios()));

server.tool(
  'new_game',
  'Start a new career at a scenario. Returns the opening situation to narrate.',
  { scenarioId: z.string().describe('scenario id from list_scenarios'), seed: z.string().optional() },
  async ({ scenarioId, seed }) => ok(game.newGame(scenarioId, seed)),
);

server.tool('situation', 'The current story: club, board mood, coach, squad tensions, open decisions. Call before narrating a question.', {}, async () => ok(game.situation()));

server.tool('advance', 'Move time forward one step (a window phase or a month). Returns what happened + any new decisions.', {}, async () => ok(game.advance()));

server.tool('squad', 'Your full squad — real players only, with age, ability, morale, contract, wages.', {}, async () => ok(game.squad()));

server.tool('league_table', 'The current league table (your row flagged).', {}, async () => ok(game.table()));

server.tool(
  'resolve_decision',
  'Answer an open decision by its id and a choice id (from situation/advance).',
  { decisionId: z.string(), choiceId: z.string() },
  async ({ decisionId, choiceId }) => ok(game.resolveDecision(decisionId, choiceId)),
);

server.tool(
  'list_targets',
  'Realistic, scouted transfer targets for a position (fogged ability ranges, asking price, willingness, the coach\'s read). Natural-position matches first.',
  { position: z.enum(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']), maxPriceM: z.number().optional().describe('cap in £m') },
  async ({ position, maxPriceM }) => ok(game.listTargets(position, maxPriceM !== undefined ? maxPriceM * 1_000_000 : undefined)),
);

server.tool(
  'find_player',
  'Look up a specific/dream target by name (even one the shortlist hides). Returns terms, willingness and the coach\'s read.',
  { name: z.string() },
  async ({ name }) => ok(game.findPlayer(name)),
);

server.tool('scout', 'A sharper (still fogged) scouting report on a player id.', { playerId: z.string() }, async ({ playerId }) => ok(game.scout(playerId)));

server.tool(
  'sign',
  'Sign a player to your club (optionally at a fee in £m). May be refused — surface the reason.',
  { playerId: z.string(), feeM: z.number().optional() },
  async ({ playerId, feeM }) => ok(game.sign(playerId, feeM)),
);

server.tool('offers', 'Who would buy one of your players, and for how much.', { playerId: z.string() }, async ({ playerId }) => ok(game.offers(playerId)));

server.tool(
  'sell',
  'Accept an offer — sell your player to a club for a fee.',
  { playerId: z.string(), toClub: z.string().describe('buyer club id from offers'), fee: z.number().describe('fee in pounds') },
  async ({ playerId, toClub, fee }) => ok(game.sell(playerId, toClub, fee)),
);

server.tool('renew', 'Extend one of your players\' contracts by 1–5 years.', { playerId: z.string(), years: z.number() }, async ({ playerId, years }) => ok(game.renew(playerId, years)));

server.tool(
  'free_agents',
  'Players out of contract next summer (Bosman pre-contract targets), optionally by position.',
  { position: z.enum(['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST']).optional() },
  async ({ position }) => ok(game.freeAgents(position)),
);

async function main() {
  if (process.env.MCP_HTTP === '1') {
    const port = Number(process.env.PORT ?? 8788);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); // stateless, single-user
    await server.connect(transport);
    createServer((req, res) => {
      // Streamable HTTP endpoint lives at /mcp; everything else is a health probe.
      if (req.url?.startsWith('/mcp')) {
        transport.handleRequest(req, res).catch((e) => {
          res.writeHead(500).end(String(e));
        });
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true, name: 'the-director-mcp' }));
      }
    }).listen(port, () => console.error(`The Director MCP (HTTP) on :${port} at /mcp`));
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('The Director MCP (stdio) ready.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
