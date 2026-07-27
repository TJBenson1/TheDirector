/**
 * Era import-culture (§ market realism). The transfer market was not always the
 * borderless place it is now: in the 1990s and early 2000s an English club drew
 * overwhelmingly on the British Isles plus a few trusted pipelines (France,
 * Scandinavia, the Low Countries); a young Spanish or Brazilian technician was a
 * rare and exotic import. That opened up as the game globalised through the 2000s.
 *
 * `eraImportAffinity` scores how era-appropriate it is for a club in a given
 * league to sign a player of a given nationality in a given year (0..1). It is
 * consulted where the world makes a DISCRETIONARY choice about who to sign — the
 * rival counter-punch/fallback and the "who's realistically available" market
 * shortlist — so those reads feel true to their era. The real transfer ledger is
 * history and already era-accurate, so it is never touched by this.
 */

/** League nationality, prefix-matched off the league id (eng-2001, esp-2014, …). */
export function leagueCountry(leagueId: string | null | undefined): string | null {
  if (!leagueId) return null;
  if (leagueId.startsWith('eng')) return 'England';
  if (leagueId.startsWith('esp') || leagueId.includes('la-liga')) return 'Spain';
  if (leagueId.startsWith('ita') || leagueId.includes('serie-a')) return 'Italy';
  if (leagueId.startsWith('ger') || leagueId.includes('bundesliga')) return 'Germany';
  if (leagueId.startsWith('fra')) return 'France';
  return null;
}

/** Nationalities a league drew on comfortably even in the pre-globalised game — its
 *  traditional import pipelines. Everyone else is a "distant" market that only
 *  opens up as the sport globalises. */
const IMPORT_PARTNERS: Record<string, string[]> = {
  England: ['Ireland', 'Scotland', 'Wales', 'Northern Ireland', 'France', 'Netherlands', 'Norway', 'Sweden', 'Denmark', 'Australia', 'United States', 'Iceland', 'Finland'],
  Spain: ['Argentina', 'Brazil', 'Uruguay', 'Portugal', 'France', 'Netherlands', 'Mexico', 'Chile', 'Colombia'],
  Italy: ['Argentina', 'Brazil', 'Uruguay', 'France', 'Netherlands', 'Germany', 'Denmark', 'Croatia', 'Serbia'],
  Germany: ['Austria', 'Switzerland', 'Poland', 'Czechia', 'Turkey', 'Brazil', 'Serbia', 'Croatia', 'Denmark'],
  France: ['Senegal', 'Ivory Coast', 'Mali', 'Cameroon', 'Algeria', 'Morocco', 'Argentina', 'Brazil', 'Belgium'],
};

/**
 * How era-appropriate it is for a club in `leagueId` to sign a player of a given
 * nationality in `year` (0..1). A native is always a 1; a traditional-pipeline
 * import starts high; a distant market starts low and opens up as the game
 * globalises (~1995 → 2010). This is why a young Spanish midfielder joining an
 * English club reads as odd in 2001 but ordinary by 2014. An unmodelled league
 * (or unknown nationality) returns 1 — no constraint.
 */
export function eraImportAffinity(leagueId: string | null | undefined, year: number, nationality: string): number {
  const country = leagueCountry(leagueId);
  if (!country) return 1; // unmodelled league — no cultural constraint
  if (nationality === country) return 1;
  const open = Math.max(0, Math.min(1, (year - 1995) / 15)); // 0 in 1995 → 1 by 2010
  const base = (IMPORT_PARTNERS[country] ?? []).includes(nationality) ? 0.7 : 0.3;
  return base + (1 - base) * open;
}
