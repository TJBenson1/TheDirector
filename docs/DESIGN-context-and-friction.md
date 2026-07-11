# DESIGN — Context & friction (binding)

> **Status: binding architecture.** Outcomes must depend on context, and plans
> must be allowed to fail. Frictionless success independent of minutes, fit,
> form and market is a **bug**. Applied 2026-07 during M5→M6.

## 1. Dynamic valuation (no static values, ever)

A player's market value and the fee you can realistically command are a
**computed live function** of: actual recent output (goals, assists,
appearances — realistic per-position numbers), minutes played, injury record,
current form, age/trajectory, contract length remaining, and buyer demand.

- Selling off a low-minutes or injury-hit season incurs a real discount.
- Building value requires giving the player a platform (the Pirès case is the
  **rule**, not the exception).
- Contract situation swings it hard — 12 months left sells for a fraction of
  four years.
- The engine must **never** quote a fee independent of the player's actual season.

## 2. Forced-rival-sale scenarios (second-order consequences)

Sometimes the only realistic buyer — given wages, resistance, market demand — is
a **direct rival.** Selling abroad is NOT always available; it depends on genuine
foreign demand for that profile at that price. Selling to a rival:

- strengthens them in the table;
- risks the player featuring against you;
- hits fan trust (§10) and seeds media memory (§10).

A real dilemma: take the money and arm them, or hold a sulking asset and watch
his value rot.

## 3. Adaptation engine (sits atop §5 development)

**Every incoming transfer rolls a hidden, probabilistic adaptation outcome.**

- **Inputs:** league-style fit (§4), age, personality (adaptability /
  professionalism / temperament), cultural distance (language, climate, first
  move abroad), role clarity / manager trust (§8), destination-vs-origin tempo.
- **Outcomes:** seamless / slow-burn (struggles a season, then blooms) /
  partial / **outright failure** (the Verón, Shevchenko-at-Chelsea archetype — a
  genuinely elite player who fails in that specific context).
- **Hidden and probabilistic:** strong fit lowers failure odds, never to zero.
  "Great player, logical signing" can still flop.
- **Buying early trades a lower fee for higher adaptation variance** — a
  gamble, not a cheat.

**Calibration (harness, early):** no player type is a guaranteed success.
Technical-league→physical-league moves, teenage moves from South America, and
first-time-abroad moves carry materially higher failure/slow-burn rates. A
Monte-Carlo assertion tracks *what fraction of on-paper-logical signings
underperform their first season* — so it can't silently revert to "too kind."

## 4. League playing-style model

Each league has a style profile — physicality, tempo, technical/positional
emphasis (2000s Premier League = high physicality/pace/directness; La Liga /
Serie A = more technical/positional/slower). Player fit is computed from
origin-league style, personal attributes, and destination-league style. Feeds
adaptation (§3) and ongoing performance: a technically gifted, low-pace player
may underperform his ability rating in a physical league regardless of adaptation.

## 5. Every window pause = a full world briefing

The check-in surfaces, computed live:

- **Squad review:** each player's *actual* goals/assists/appearances this
  period (realistic per-position), happiness, live market value, contract.
- **League tables for all four playable-league nations** (England, Spain, Italy,
  Germany).
- **World news:** rival transfer moves, clubs in financial trouble, managerial
  changes, fire-sale opportunities, and players causing noise (agitation, media,
  agent briefings) across the whole simulated world — not just the user's club.

## Milestone mapping

| Principle | Lands |
|---|---|
| §1 Dynamic valuation | **M6** — needs per-player season stats (added M6) |
| §2 Forced-rival-sale | M6 willingness maths → M8 rival AI + §10 memory |
| §3 Adaptation engine | **M6** (mechanism + harness target) |
| §4 League-style model | **M6** (profiles for all 4 nations; only England simulated until multi-league) |
| §5 World briefing | M7/API — season-stats foundation laid M6; full 4-league sim + assembly later |

**Guiding principle: outcomes depend on context, and best-laid plans are allowed
to fail.**
