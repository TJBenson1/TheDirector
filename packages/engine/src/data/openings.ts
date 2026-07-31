/**
 * Curated, historically-accurate opening briefings — one per scenario (§ narration).
 *
 * WHY THIS EXISTS: the narration layer used to derive the "manager's best XI" from
 * raw squad ability, which produced formulaic, sometimes WRONG openings — it would
 * seat Roberto Baggio in Marcello Lippi's 1995 Juventus XI when the defining story
 * of that summer was Lippi freezing Baggio out and selling him to Milan. These
 * briefings replace that derivation with real history: the actual head coach, the
 * shape he actually used, his genuine first-choice XI, the men on the fringe (the
 * frozen-out, the sold, the wantaway, the wonderkid), and 2–4 sentences of authored
 * context unique to that exact summer. Every entry is researched from public records
 * (Wikipedia season pages, contemporary reports). No two read alike.
 *
 * `firstEleven` entries are "POSITION Name" display strings (GK/RB/CB/LB/DM/CM/RM/
 * LM/AM/RW/LW/ST/CF — a readable superset of the engine Position type), rendered by
 * the narration layer rather than parsed by the engine.
 */

import type { ScenarioOpening } from '../scenarios.js';

export const SCENARIO_OPENINGS: Record<string, ScenarioOpening> = {
  'juventus-1995': {
    coach: 'Marcello Lippi',
    formation: '4-3-3',
    firstEleven: [
      'GK Angelo Peruzzi', 'RB Moreno Torricelli', 'CB Ciro Ferrara', 'CB Pietro Vierchowod',
      'LB Gianluca Pessotto', 'CM Didier Deschamps', 'CM Paulo Sousa', 'CM Antonio Conte',
      'AM Alessandro Del Piero', 'ST Gianluca Vialli', 'ST Fabrizio Ravanelli',
    ],
    fringe: [
      'Roberto Baggio — OUT of Lippi’s plans: the Divine Ponytail was deemed surplus with Del Piero anointed as his heir, and sold to arch-rivals AC Milan in July 1995 for around 18 billion lire (~£6.8m).',
      'Alessandro Del Piero — the 20-year-old inheriting Baggio’s No.10 and the whole creative burden with it.',
      'Vladimir Jugović — summer-1995 arrival from Sampdoria, first rotation option in the midfield three.',
      'Attilio Lombardo & Michele Padovano — summer signings adding width and forward depth.',
      'Gianluca Vialli — the captain leading the line, though quietly in his final Juve season before a free move to Chelsea in 1996.',
    ],
    briefing: `Reigning Serie A and Coppa Italia champions, Lippi wants to open the title defence by taking a scalpel to his own winners: he has decided Roberto Baggio, the biggest name in Italian football, is surplus to requirements, and a sale to arch-rivals Milan is on the table — the whole project to be reshaped around the 20-year-old Alessandro Del Piero, ready to inherit the No.10. A Sampdoria-flavoured rebuild has already brought in Vierchowod, Jugović and Lombardo, with Pessotto prised from rivals Torino. Vialli captains a fearsome front three, but it is an open secret this is his last dance in Turin — his contract expires in 1996 and Chelsea await. The mood is unmistakably European: a squad built to conquer the continent, if you can keep it together — and whether to sanction the Baggio sale is the first call on your desk.`,
  },

  'milan-1995': {
    coach: 'Fabio Capello',
    formation: '4-4-2 (a square 4-2-2-2: two holders, two trequartisti)',
    firstEleven: [
      'GK Sebastiano Rossi', 'RB Christian Panucci', 'CB Alessandro Costacurta', 'CB Franco Baresi',
      'LB Paolo Maldini', 'DM Marcel Desailly', 'CM Demetrio Albertini', 'AM Dejan Savićević',
      'AM Zvonimir Boban', 'ST George Weah', 'ST Roberto Baggio',
    ],
    fringe: [
      'George Weah — the marquee capture from Paris Saint-Germain who’d be crowned 1995 Ballon d’Or winner that winter.',
      'Roberto Baggio — signed from arch-rivals Juventus the same summer, a second superstar to squeeze into an already crowded creative pool.',
      'Marco Simone — the incumbent forward now rotating behind the glamour arrivals.',
      'Franco Baresi — the 35-year-old captain and libero, the emblem of an ageing dynasty nearing the end of its run.',
      'Mauro Tassotti & Filippo Galli — the veteran squad men holding the fort as the great side runs down.',
    ],
    briefing: `This is the last stand of the great Milan machine: an ageing spine of Baresi (35), Costacurta, Maldini, Albertini, Boban and Savićević, and on the table the glamour deals to refuel it — George Weah from PSG and Roberto Baggio from Juventus. Marco van Basten has just formally retired, closing one chapter, and Capello — already being courted by Real Madrid — drives a group that senses its window closing. Two of the world’s finest attackers are there to be signed, behind an immovable rearguard and the distinct sense of an era drawing to a close: land them, and is there one more title in the old machine?`,
  },

  'newcastle-1995': {
    coach: 'Kevin Keegan',
    formation: 'Attacking 4-4-2 with two orthodox wingers',
    firstEleven: [
      'GK Pavel Srníček', 'RB Warren Barton', 'CB Darren Peacock', 'CB Steve Howey',
      'LB John Beresford', 'RM Keith Gillespie', 'CM Robert Lee', 'CM Lee Clark',
      'LM David Ginola', 'ST Peter Beardsley', 'ST Les Ferdinand',
    ],
    fringe: [
      'Les Ferdinand — the £6m summer talisman from QPR, the focal point up front.',
      'David Ginola — the £2.5m flair merchant signed from PSG, box-office on the left.',
      'Philippe Albert — the cultured Belgian centre-back, but recovering from a cruciate injury at kickoff, so Howey deputises.',
      'Faustino Asprilla — NOT here yet: the mercurial Colombian arrives in February 1996, mid-season, and is often blamed for unbalancing the side.',
      'David Batty — NOT here yet either: he signs from Blackburn in March 1996.',
    ],
    briefing: `Keegan’s Newcastle set out to entertain and nothing else — an unapologetic, front-foot 4-4-2 with two genuine wingers feeding Ferdinand and Beardsley — and roughly £16m of summer spending on Ferdinand, Ginola and Barton makes them the neutrals’ team. They are built to explode from the blocks and thrill the neutrals — but the cavalier philosophy that dazzles is the same one that leaves them exposed at the back. Can a side this open hold its nerve, and a lead, over a full title race?`,
  },

  'liverpool-1995': {
    coach: 'Roy Evans',
    formation: '3-5-2 with attacking wing-backs',
    firstEleven: [
      'GK David James', 'CB Rob Jones', 'CB Mark Wright', 'CB Phil Babb',
      'LWB Steve Harkness', 'RM Steve McManaman', 'CM Jamie Redknapp', 'CM John Barnes',
      'LM Dominic Matteo', 'ST Ian Rush', 'ST Stan Collymore',
    ],
    fringe: [
      'Stan Collymore — the £8.5m British-record signing from Nottingham Forest, scorer on his debut.',
      'Robbie Fowler — the prolific young striker pushing hard behind the ageing Rush for a starting place.',
      'Ian Rush — the club legend in what looks like his final Anfield campaign, first-choice at kickoff but under pressure.',
      'Steve McManaman — the creative heartbeat, one of the division’s finest providers.',
      'Jason McAteer — NOT here yet: the £4.5m right wing-back only signs in September 1995.',
    ],
    briefing: `Roy Evans’ Liverpool open as many pundits’ title favourites, poised to smash the English transfer record for Stan Collymore to add to a gifted young core of Fowler, McManaman and Redknapp. Evans plays a patient, passing 3-5-2 that makes them arguably the most watchable side in England — but the flair has a habit of not converting into silverware, and a playboy image is already gathering around the young core. Brilliant going forward, brittle when it matters: whether that talent finally delivers a trophy is the whole question.`,
  },

  'man-utd-1999': {
    coach: 'Sir Alex Ferguson',
    formation: '4-4-2',
    firstEleven: [
      'GK Mark Bosnich', 'RB Gary Neville', 'CB Jaap Stam', 'CB Ronny Johnsen',
      'LB Denis Irwin', 'RM David Beckham', 'CM Roy Keane', 'CM Paul Scholes',
      'LM Ryan Giggs', 'ST Dwight Yorke', 'ST Andy Cole',
    ],
    fringe: [
      'Peter Schmeichel — GONE: the great Dane left after the Treble, and the goalkeeping void is the season’s defining problem.',
      'Mark Bosnich — the free-transfer replacement who never convinced as the No.1.',
      'Massimo Taibi — NOT here yet: an Italian keeper signed in September 1999 as one answer to the Schmeichel void, though far from a sure thing.',
      'Mikaël Silvestre — arrives 10 September 1999 from Inter, soon a first-choice defender.',
      'Ole Gunnar Solskjær & Teddy Sheringham — the lethal attacking depth behind Yorke and Cole.',
    ],
    briefing: `United begin life as champions of Europe, the world and England, fresh from the historic 1998–99 Treble — and immediately confront the one hole Ferguson can’t easily fill: Peter Schmeichel has retired, and neither Mark Bosnich nor the September signing Massimo Taibi convinces between the posts. As holders they have controversially agreed to withdraw from the FA Cup to fly to Brazil for the inaugural Club World Championship — a distraction the purists resent. The goalkeeping question is the one crack in the machine: whether it undoes the champions, or they simply overwhelm the league regardless, is the season's open thread.`,
  },

  'real-madrid-2000': {
    coach: 'Vicente del Bosque',
    formation: '4-4-2',
    firstEleven: [
      'GK Iker Casillas', 'RB Míchel Salgado', 'CB Fernando Hierro', 'CB Aitor Karanka',
      'LB Roberto Carlos', 'RM Luís Figo', 'CM Claude Makélélé', 'CM Iván Helguera',
      'LM Steve McManaman', 'ST Raúl', 'ST Fernando Morientes',
    ],
    fringe: [
      'Luís Figo — the world-record £37m Galáctico prised from Barcelona on 24 July 2000, the transfer that delivered Pérez’s election promise and launched the era.',
      'Fernando Redondo — sold to Milan against his own wishes, sparking fan protests outside the Bernabéu ("Redondo is Madrid").',
      'Claude Makélélé — the summer arrival installed as the new anchor in Redondo’s place.',
      'Fernando Morientes — the incumbent striker beside Raúl, about to be slowly marginalised by the Galáctico policy.',
      'Nicolas Anelka — GONE: the troubled Frenchman was sold back to PSG that summer.',
    ],
    briefing: `Florentino Pérez has just won the presidency (July 2000) on one audacious promise — to prise Luís Figo out of Barcelona — and the world-record deal the Catalans will brand the ultimate betrayal is on the table, the fuse ready to be lit on the Galácticos. In the same window he wants Fernando Redondo moved on to Milan against the player’s will and Makélélé brought in to take the pivot — both live on your desk. Holding the spectacle together is the understated, moustachioed del Bosque, the quiet dressing-room man fresh from winning the 2000 Champions League. In reality the Galácticos arrived one a summer — Zidane, Ronaldo and Beckham still to come — but that sequence is yours to accelerate, redirect or resist, starting with the calls this summer.`,
  },

  'inter-1998': {
    coach: 'Gigi Simoni',
    formation: '4-3-1-2',
    firstEleven: [
      'GK Gianluca Pagliuca', 'RB Javier Zanetti', 'CB Giuseppe Bergomi', 'CB Francesco Colonnese',
      'LB Taribo West', 'CM Diego Simeone', 'CM Aron Winter', 'CM Benoît Cauet',
      'AM Roberto Baggio', 'ST Ronaldo', 'ST Iván Zamorano',
    ],
    fringe: [
      'Ronaldo — Il Fenomeno, the reigning best player on the planet and the world’s most expensive footballer, at his terrifying absolute peak.',
      'Roberto Baggio — the marquee summer arrival from Bologna, an extra No.10 crowding an already overloaded attack.',
      'Youri Djorkaeff — a France World Cup winner squeezed out by the forward logjam.',
      'Iván Zamorano — the incumbent striker forced to cede the No.9 to Ronaldo (he’d later wear the famous "1+8").',
      'Gigi Simoni — the coach himself is fragile: fresh from winning the 1998 UEFA Cup, yet already under pressure at an impatient club where a slow start could prove fatal.',
    ],
    briefing: `This is Moratti’s blank-cheque Inter at its most dazzling and most volatile: Ronaldo, freshly crowned the world’s best and most expensive player, is the jewel of an expensively assembled galaxy. On top of Zamorano and Djorkaeff, Moratti has a deal on the table for Roberto Baggio from Bologna — a signing that would complete a glittering but hopelessly unbalanced forward glut, under enormous pressure to finally end a Scudetto drought stretching to 1989. Gigi Simoni starts as the man who won the UEFA Cup in May, but at a club this impatient his seat is already warm — a slow start would put him under real threat. The talent is overwhelming; the coherence is not.`,
  },

  'dortmund-1997': {
    coach: 'Nevio Scala',
    formation: '3-5-2',
    firstEleven: [
      'GK Stefan Klos', 'CB Jürgen Kohler', 'CB Wolfgang Feiersinger', 'CB Júlio César',
      'RWB Stefan Reuter', 'LWB Jörg Heinrich', 'CM Paulo Sousa', 'CM Steffen Freund',
      'AM Andreas Möller', 'ST Heiko Herrlich', 'ST Stéphane Chapuisat',
    ],
    fringe: [
      'Matthias Sammer — the reigning Ballon d’Or holder, but facing knee surgery in August 1997 that puts his whole career in jeopardy.',
      'Karl-Heinz Riedle — GONE: sold to Liverpool that summer, leaving a hole up front.',
      'Paul Lambert — the Scottish midfielder here at kickoff, though Celtic are circling for a return home.',
      'Lars Ricken — the young matchwinner of the 1997 final, now rotation in attack.',
      'Michael Zorc — the veteran captain marshalling a side in transition.',
    ],
    briefing: `Dortmund open as reigning champions of Europe — but under new management and with the winning core already fraying. Title-winner Ottmar Hitzfeld has moved upstairs to a director’s role, and the Italian Nevio Scala inherits the dugout; meanwhile Liverpool are circling Karl-Heinz Riedle, a sale that would leave a hole up front, and the great sweeper Matthias Sammer, the Ballon d’Or holder, faces knee surgery in August that threatens his career. Kings of Europe with a title to defend at home and a continent to conquer again — but a winning core that is quietly beginning to fray.`,
  },

  'arsenal-1996': {
    coach: 'Arsène Wenger',
    formation: '4-4-2 (flat back four, flat midfield)',
    firstEleven: [
      'GK David Seaman', 'RB Lee Dixon', 'CB Tony Adams', 'CB Steve Bould',
      'LB Nigel Winterburn', 'RM Ray Parlour', 'CM Patrick Vieira', 'CM David Platt',
      'LM Paul Merson', 'ST Dennis Bergkamp', 'ST Ian Wright',
    ],
    fringe: [
      'Patrick Vieira — signed from Milan in the summer on the incoming Wenger’s advice; his first, defining influence, the lone foreign outfielder in that debut side.',
      'The famous back four — Dixon, Adams, Bould, Winterburn — the ageing English rearguard Wenger would revitalise with diet and sports science.',
      'Tony Adams — the captain who publicly confessed his alcoholism in 1996, sober from that August.',
      'Dennis Bergkamp — the 1995 club-record signing now, under Wenger, about to fully blossom.',
      'Nicolas Anelka — NOT here yet: Wenger’s raid on PSG lands in February 1997.',
    ],
    briefing: `At the literal kickoff Arsenal have no permanent manager: Bruce Rioch was sacked a week before the season, caretakers Stewart Houston and Pat Rice hold the fort, and it is not until 1 October that an unknown Frenchman from Japanese football is unveiled to "Arsène Who?" headlines. He inherits a hardened veteran spine — Seaman, the Adams back four, Wright — and stuns them with stretching, science and near-teetotal discipline, quietly rebuilding an ageing defence from within. The one deal already bearing his fingerprints — Patrick Vieira, on his recommendation — sits on the table waiting to be done. The revolution starts not with a splash but with a diet sheet.`,
  },

  'chelsea-1996': {
    coach: 'Ruud Gullit (player-manager)',
    formation: '3-5-2 (continental sweeper system)',
    firstEleven: [
      'GK Dmitri Kharine', 'CB Steve Clarke', 'CB Frank Leboeuf', 'CB Michael Duberry',
      'RWB Dan Petrescu', 'CM Roberto Di Matteo', 'CM Dennis Wise', 'AM Ruud Gullit',
      'LWB Scott Minto', 'ST Mark Hughes', 'ST Gianluca Vialli',
    ],
    fringe: [
      'Gianluca Vialli — the marquee free transfer from Juventus, a reigning European Cup-winning captain (though often rotated by Gullit).',
      'Frank Leboeuf & Roberto Di Matteo — the glamorous summer imports who set the cosmopolitan tone.',
      'Gianfranco Zola — NOT here yet: the little Sardinian magician only arrives in November 1996, a mid-season coup in the making.',
      'Kevin Hitchcock — the deputy keeper who becomes the de facto No.1 once Kharine is injured.',
      'Mark Hughes — the streetwise British anchor amid the continental cast.',
    ],
    briefing: `With Glenn Hoddle gone to manage England, Chelsea hand the reins to their charismatic, dreadlocked Dutch playmaker Ruud Gullit as player-manager, and he is reaching into his continental black book to build a cosmopolitan cast — Leboeuf already in, deals on the table for Vialli and Di Matteo, and Zola to follow in November. This is the pre-Abramovich gamble: no oligarch billions, just Ken Bates’s ambition and Gullit’s promise of "sexy football" to transform a mid-table London club into the Premier League’s glamour side. Chelsea have not won a major trophy in 26 years — can the cosmopolitan cast and the fluid 3-5-2 finally end that wait?`,
  },

  'bayern-1998': {
    coach: 'Ottmar Hitzfeld',
    formation: '4-4-2 (libero-flexible on the big European nights)',
    firstEleven: [
      'GK Oliver Kahn', 'RB Markus Babbel', 'CB Samuel Kuffour', 'CB Thomas Linke',
      'LB Bixente Lizarazu', 'CM Stefan Effenberg', 'CM Jens Jeremies', 'RM Mario Basler',
      'LM Mehmet Scholl', 'ST Carsten Jancker', 'ST Giovane Élber',
    ],
    fringe: [
      'Stefan Effenberg — the swaggering summer signing from Gladbach, the on-field general of the new midfield.',
      'Jens Jeremies — the other summer arrival, the ball-winner beside Effenberg.',
      'Lothar Matthäus — the 37-year-old veteran libero, still a big-match starter.',
      'Dietmar Hamann — GONE: sold to Newcastle that summer, the fee helping fund the rebuild.',
      'Giovane Élber — the Brazilian striker (a 1997 arrival, not new) leading the line.',
    ],
    briefing: `Ottmar Hitzfeld arrives in the summer of 1998 after a year’s sabbatical, restoring calm to a formidable German-led spine of Kahn, Babbel, Scholl and the veteran Matthäus — with the swaggering Effenberg the summer deal on the table to complete the midfield. They are overwhelming favourites to stroll the Bundesliga, and Hitzfeld's expertise on the big European nights makes them genuine contenders for the Champions League. A formidable German-led machine at the peak of its powers, chasing a domestic crown and a first European Cup in a generation — how far it goes is now on you.`,
  },

  'spurs-2001': {
    coach: 'Glenn Hoddle',
    formation: '4-4-2',
    firstEleven: [
      'GK Neil Sullivan', 'RB Stephen Carr', 'CB Chris Perry', 'CB Ledley King',
      'LB Mauricio Taricco', 'RM Darren Anderton', 'CM Steffen Freund', 'CM Gustavo Poyet',
      'LM Christian Ziege', 'ST Teddy Sheringham', 'ST Les Ferdinand',
    ],
    fringe: [
      'Sol Campbell — GONE, and this is the whole story: the club captain walked out on a FREE transfer to arch-rivals Arsenal on 3 July 2001, branded "Judas" by fans who’d been promised he’d never join them.',
      'Teddy Sheringham — brought home from Manchester United to lead the line, the senior figurehead up front.',
      'Ledley King — the young centre-half cast as Campbell’s heir at the back.',
      'Sergei Rebrov — the £11m club-record signing frozen out by Hoddle in favour of Sheringham; the expensive misfit.',
      'Christian Ziege — the summer signing from Liverpool, a goal threat down the left.',
    ],
    briefing: `Glenn Hoddle, a White Hart Lane legend as a player, returns as coach preaching cultured, possession football — and then has the ground cut from under him in July when captain Sol Campbell, who’d publicly sworn he’d never do it, walks out on a free to Arsenal. Hoddle’s answer is on the table — bringing club icon Teddy Sheringham home from Manchester United and a left-sided threat in Christian Ziege — while he rebuilds the defence around emerging homegrown centre-half Ledley King. Ambitions are honest — steady the ship, climb the table, chase a cup run — but it all plays out under the long shadow of the ultimate betrayal, and it's on you to prove Spurs can be more than mid-table.`,
  },

  'liverpool-2001': {
    coach: 'Gérard Houllier',
    formation: '4-4-2 (structured, counter-attacking)',
    firstEleven: [
      'GK Sander Westerveld', 'RB Markus Babbel', 'CB Stéphane Henchoz', 'CB Sami Hyypiä',
      'LB John Arne Riise', 'RM Steven Gerrard', 'CM Dietmar Hamann', 'CM Gary McAllister',
      'LM Danny Murphy', 'ST Michael Owen', 'ST Emile Heskey',
    ],
    fringe: [
      'Michael Owen — the jewel of the treble side, the league’s most feared finisher and right at the peak of his powers.',
      'John Arne Riise — the £4m left-sided thunderbolt from Monaco Houllier is chasing; the deal is there to complete this summer.',
      'Robbie Fowler — the cult hero now out of favour behind Owen and Heskey, and increasingly linked with a move away.',
      'Sander Westerveld — the incumbent keeper, but shaky enough that his place looks vulnerable — the reason Houllier wants a new No.1.',
      'Jerzy Dudek & Chris Kirkland — NOT here yet: the two goalkeepers Houllier is chasing to end the crisis, from Feyenoord and Coventry.',
    ],
    briefing: `Liverpool are basking in the afterglow of an unprecedented cup treble — FA Cup, League Cup and UEFA Cup — and Houllier’s methodical, defensively rigorous project looks ready for its final step: a genuine tilt at the title. Michael Owen is at the peak of his powers, the treble momentum is real, and this is the best chance in a decade to turn the cups into a league challenge. But nothing is settled: the goalkeeping department is unsettled and Houllier wants it fixed, the squad needs shrewd reinforcement while the money lasts, and the manager is driving himself at a punishing pace. Back the right calls this summer and the title is there — can you deliver the one trophy that matters?`,
  },

  'chelsea-2003': {
    coach: 'Claudio Ranieri',
    formation: '4-4-2 (rotational — "The Tinkerman")',
    firstEleven: [
      'GK Carlo Cudicini', 'RB Mario Melchiot', 'CB John Terry', 'CB William Gallas',
      'LB Wayne Bridge', 'RM Damien Duff', 'CM Claude Makélélé', 'CM Frank Lampard',
      'LM Joe Cole', 'ST Hernán Crespo', 'ST Eiður Guðjohnsen',
    ],
    fringe: [
      'Claude Makélélé — the £16m capture from Real Madrid, the pivot who’d define the era.',
      'Claudio Ranieri — managing as a dead man walking, widely tipped for the sack whatever the results.',
      'Jimmy Floyd Hasselbaink — the incumbent striker now jostling with the new arrivals.',
      'Petr Čech, Didier Drogba & Arjen Robben — NOT here yet: all arrive with Mourinho in 2004.',
    ],
    briefing: `Roman Abramovich completes his takeover in July 2003 and turns an already good Chelsea into a billionaire’s plaything overnight, the war chest open for a £100m-plus spree — the targets lined up and the deals on your desk: Makélélé, Crespo, Duff, Joe Cole, Bridge, Verón, Mutu, Geremi. Overnight the expectation flips from a top-four scrap to the title itself. Claudio Ranieri, the affable "Tinkerman", inherits the riches but manages knowing he is being auditioned — every result weighed against a suspicion he will be replaced whatever he achieves. The money is there and the expectation is the title; whether that buys silverware, or just pressure, is the season's question.`,
  },

  'barcelona-2003': {
    coach: 'Frank Rijkaard',
    formation: '4-3-3',
    firstEleven: [
      'GK Víctor Valdés', 'RB Michael Reiziger', 'CB Carles Puyol', 'CB Rafael Márquez',
      'LB Giovanni van Bronckhorst', 'CM Xavi', 'CM Phillip Cocu', 'CM Gerard López',
      'RW Javier Saviola', 'CF Patrick Kluivert', 'LW Ronaldinho',
    ],
    fringe: [
      'Ronaldinho — the marquee summer signing and emblem of the new era, landed after the club publicly missed out on David Beckham; the joy-bringer of the rebuild.',
      'Lionel Messi — a 16-year-old in La Masia, NOT yet a first-team player; his competitive debut is still over a year away (October 2004).',
      'Luis Enrique, Phillip Cocu & Patrick Kluivert — the veteran core being gradually phased out.',
      'Andrés Iniesta — a fringe teenager, only occasional first-team minutes.',
      'Edgar Davids — NOT here yet: a possible January 2004 loan arrival to add midfield bite if the season needs a jolt.',
    ],
    briefing: `Summer 2003 is the dawn of the Laporta revolution: Joan Laporta wins the presidency vowing to end years of decline, appoints Frank Rijkaard, and — after very publicly failing to land David Beckham — has turned to Ronaldinho instead, the deal on the table whose flair could come to symbolise Barcelona’s reawakening. It is a shaky, pressured start, with the coach's job far from secure and the demand for an immediate return to the summit. This is the golden generation taking shape around Xavi, Puyol and Valdés — with a teenage Messi in La Masia and the whole rebuild still to prove itself.`,
  },

  'real-madrid-2006': {
    coach: 'Fabio Capello',
    formation: '4-4-2 (pragmatic, defence-first)',
    firstEleven: [
      'GK Iker Casillas', 'RB Sergio Ramos', 'CB Fabio Cannavaro', 'CB Iván Helguera',
      'LB Roberto Carlos', 'RM David Beckham', 'CM Emerson', 'CM Mahamadou Diarra',
      'LM Guti', 'ST Raúl', 'ST Ruud van Nistelrooy',
    ],
    fringe: [
      'David Beckham — THE subplot: his relationship with Capello is combustible, and an LA Galaxy move looms — will he be frozen out, or fight his way back into the side?',
      'Fabio Cannavaro — the summer arrival from a relegated Juventus, reigning World Cup-winning captain and the new steel at the back.',
      'Ruud van Nistelrooy — the marquee signing from Manchester United, brought in to be the goalscorer the rebuild is built around.',
      'Ronaldo — the Brazilian, already at odds with Capello over fitness and discipline; his place is far from secure.',
      'Antonio Cassano — the wayward Italian marginalised and largely frozen out.',
    ],
    briefing: `Appointed months after Florentino Pérez’s resignation, Capello is brought back to bury the galáctico circus and impose defensive rigour — an unglamorous, pragmatic 4-4-2 he wants built on van Nistelrooy’s goals and Cannavaro’s steel rather than showmanship, both deals on the table this summer. His abrasive discipline sets the tone: Ronaldo's future in doubt, Cassano marginalised, and a dressing room bracing for a colder, harder regime. Zidane has retired, Figo is long gone; this is the morning after the party, and the mandate is to win Spain back without the showmen — an unglamorous rebuild you must make work.`,
  },

  'arsenal-2004': {
    coach: 'Arsène Wenger',
    formation: '4-4-2 (fluid)',
    firstEleven: [
      'GK Jens Lehmann', 'RB Lauren', 'CB Kolo Touré', 'CB Sol Campbell',
      'LB Ashley Cole', 'RM Fredrik Ljungberg', 'CM Patrick Vieira', 'CM Gilberto Silva',
      'LM Robert Pirès', 'ST Dennis Bergkamp', 'ST Thierry Henry',
    ],
    fringe: [
      'Patrick Vieira — the captain whose future is in open doubt: Real Madrid court him all summer before he commits to stay in mid-August.',
      'Cesc Fàbregas — a 17-year-old about to force his way into central midfield, helped by a Gilberto injury.',
      'José Antonio Reyes — the January 2004 signing now rotating heavily into the front line.',
      'Robin van Persie — the summer arrival from Feyenoord, a promising squad option.',
      'The 49-game unbeaten run — carried in from last season, a record streak the whole league is desperate to end.',
    ],
    briefing: `Arsenal begin as the untouchable "Invincibles", having gone the entire previous league season unbeaten, and they carry a record unbeaten run into the new campaign. Wenger’s side plays arguably the most beautiful football in the club’s history — Henry’s brilliance, Bergkamp’s craft, the Vieira–Gilberto engine — but the dominant off-field story is captain Vieira’s flirtation with Real Madrid before he commits to stay. How long the invincibility can last, and whether the dynasty holds off Chelsea's billions, is the whole story ahead.`,
  },

  'inter-2004': {
    coach: 'Roberto Mancini',
    formation: '4-3-1-2 (midfield diamond)',
    firstEleven: [
      'GK Francesco Toldo', 'RB Javier Zanetti', 'CB Iván Córdoba', 'CB Marco Materazzi',
      'LB Siniša Mihajlović', 'DM Esteban Cambiasso', 'CM Dejan Stanković', 'CM Nicolás Burdisso',
      'AM Juan Sebastián Verón', 'ST Adriano', 'ST Christian Vieri',
    ],
    fringe: [
      'Adriano — "L’Imperatore" at his terrifying physical peak, the great hope before injury and tragedy unravelled him.',
      'Esteban Cambiasso — the shrewd free signing after his Real Madrid contract expired, instantly the midfield anchor.',
      'Juan Sebastián Verón — on loan from Chelsea, where the new boss Mourinho had frozen him out.',
      'Christian Vieri — "Bobo" in his final full Inter season alongside Adriano.',
      'Fabio Cannavaro — GONE: he left for Juventus that very summer, so he is not part of this side.',
    ],
    briefing: `Moratti’s endless spending has made Inter perennial big-name buyers yet perennial bridesmaids, the Scudetto drought stretching back to 1989 and curdling into a psychological weight that undoes better sides. New coach Roberto Mancini, arriving from Lazio, inherits that burden and builds around the great hope: Adriano, a physically overwhelming striker at the absolute zenith of his powers. With the free signing of Cambiasso on the table to add to loanee Verón, this is a side being assembled to finally end the wait — the question is whether Mancini can carry the weight of nearly two decades and land the Scudetto on merit.`,
  },

  'milan-2007': {
    coach: 'Carlo Ancelotti',
    formation: '4-3-2-1 (the "Christmas Tree")',
    firstEleven: [
      'GK Dida', 'RB Cafu', 'CB Alessandro Nesta', 'CB Paolo Maldini',
      'LB Marek Jankulovski', 'DM Gennaro Gattuso', 'CM Andrea Pirlo', 'CM Massimo Ambrosini',
      'AM Kaká', 'AM Clarence Seedorf', 'ST Filippo Inzaghi',
    ],
    fringe: [
      'Kaká — the reigning Ballon d’Or and the world’s best, the creative heart the whole Christmas Tree is built to serve.',
      'Paolo Maldini (39) & Cafu (37) — the ageing aristocrats of the back line, magnificent but a season from the fall; Costacurta has just retired.',
      'Ronaldo — here, but a fitness gamble: the once-unstoppable Brazilian carries the weight and the fragile knees that will end his Milan story by winter.',
      'Alberto Gilardino — the rotation striker sharing the lone-forward duties with the veteran Inzaghi.',
      'Massimo Ambrosini — the legs Ancelotti leans on to shield an ageing midfield across a relentless four-competition year, with a deal for Emerson on the table to add more.',
    ],
    briefing: `Milan open as the reigning champions of Europe — Athens, May 2007, and the ghost of Istanbul finally laid to rest against Liverpool — with Kaká crowned the world’s best. But this is an aristocracy in its last golden light: Maldini is 39, Cafu 37, Costacurta has retired, and the spine that conquered the continent is a year older and a yard slower. Ancelotti’s Christmas Tree still bends the game around Kaká and Seedorf, Inzaghi and Gilardino sharing the lone-striker duty and a fragile Ronaldo a gamble for extra firepower. As champions of Europe there are trophies on every front — the Super Cup and the Club World Cup that the crown brings, the Scudetto, and a defence of the European Cup itself — but the fixtures are relentless and the decline is coming. Can you win one more before the fall, or begin the rebuild while the great side still has enough left?`,
  },

  'atletico-2013': {
    coach: 'Diego Simeone',
    formation: '4-4-2 (compact low block, lethal counter — "Cholismo")',
    firstEleven: [
      'GK Thibaut Courtois', 'RB Juanfran', 'CB Diego Godín', 'CB Miranda',
      'LB Filipe Luís', 'RM Koke', 'CM Gabi', 'CM Tiago',
      'LM Arda Turan', 'ST Diego Costa', 'ST David Villa',
    ],
    fringe: [
      'Radamel Falcao — GONE: the talismanic striker sold to Monaco for a club-record ~€60m, the loss everyone assumed would sink the project.',
      'David Villa — the veteran arrival from Barcelona (~€5m), the cut-price answer to Falcao’s departure.',
      'Diego Costa — erupting into one of Europe’s most feared strikers, the spearhead of the counter-attack (and already coveted by the giants).',
      'Thibaut Courtois — the Belgian keeper on a multi-year loan from Chelsea, anchoring a miserly defence.',
      'The wage bill — a fraction of Barça’s and Real’s, the underdog economics behind everything Simeone builds.',
    ],
    briefing: `Atlético open having just cashed in their star — Falcao sold to Monaco — a departure most expected to unravel Simeone’s side. Instead they got stronger: David Villa arrived cheaply, Diego Costa erupted into a monster, and Courtois anchored a defence built on Godín and Miranda. Simeone has forged a siege-mentality machine, a disciplined low block with relentless pressing and lethal counters, running on a wage bill dwarfed by the giants. Nobody expects them to sustain it — but if any side can break the Barça–Real duopoly that has swallowed Spanish football, it is this one, and it's on you to prove the doubters wrong.`,
  },

  'barcelona-2014': {
    coach: 'Luis Enrique',
    formation: '4-3-3',
    firstEleven: [
      'GK Claudio Bravo', 'RB Dani Alves', 'CB Gerard Piqué', 'CB Javier Mascherano',
      'LB Jordi Alba', 'CM Sergio Busquets', 'CM Ivan Rakitić', 'CM Andrés Iniesta',
      'RW Lionel Messi', 'ST Luis Suárez', 'LW Neymar',
    ],
    fringe: [
      'Luis Suárez — signed for ~€81m but banned: serving a four-month suspension for the World Cup bite, he can’t debut until the El Clásico of 25 October 2014, so the early XI runs without him.',
      'The goalkeeping split — Claudio Bravo for the league, Marc-André ter Stegen for the cups and Champions League; there is no single No.1, a rotation to manage.',
      'Xavi Hernández — the club captain in a reduced, farewell role, his midfield place ceded to the new arrival Rakitić.',
      'Ivan Rakitić — the summer signing from Sevilla, immediately first-choice on the right of the three.',
      'The transfer ban — a looming FIFA sanction that would bar Barça from registering new signings across both 2015 windows.',
    ],
    briefing: `Newly appointed Luis Enrique wants to complete, in his 4-3-3, arguably the greatest attacking trident ever seen — Messi, Suárez and Neymar, the "MSN" — but the Suárez deal is still on the table, funded by cashing in Alexis Sánchez and Cesc Fàbregas. Even once he signs, the full trio can’t start together until Suárez serves out his four-month World Cup biting ban, debuting at the Bernabéu in late October, after which the attack becomes unstoppable. Luis Enrique’s early tenure is tense — a reported rift with Messi and doubts over whether the new-look side will click put his job under early scrutiny. But with MSN about to come online and a farewell-season Xavi passing the torch, this is a squad with the ceiling to win everything — if you don't squander the greatest attack you'll ever have.`,
  },

  'juventus-2006': {
    coach: 'Didier Deschamps',
    formation: '4-4-2 (Serie B)',
    firstEleven: [
      'GK Gianluigi Buffon', 'RB Jonathan Zebina', 'CB Nicola Legrottaglie', 'CB Giorgio Chiellini',
      'LB Federico Balzaretti', 'RM Mauro Camoranesi', 'CM Cristiano Zanetti', 'CM Matteo Paro',
      'LM Pavel Nedvěd', 'ST Alessandro Del Piero', 'ST David Trezeguet',
    ],
    fringe: [
      'The loyal icons weighing whether to stay — Buffon, Del Piero, Nedvěd, Trezeguet and Camoranesi, each with a reason to abandon the fallen giant and, so far, a reason to stay.',
      'Giorgio Chiellini — the rising defender the rebuild would be anchored on.',
      'Emerson — GONE to Real Madrid in the Calciopoli fallout.',
      'Gianluca Zambrotta & Lilian Thuram — GONE to Barcelona.',
    ],
    briefing: `The 2006 Calciopoli scandal strips Juventus of two Scudetti and forces them into Serie B for the first time in their history, starting the campaign with a points deduction. The vultures are circling the wreckage — Real Madrid want Cannavaro, Inter are in for Ibrahimović and Vieira — while Emerson has already followed the path to Madrid and Zambrotta and Thuram have gone to Barcelona. Yet a core of icons is refusing to jump ship: Buffon, Del Piero, Nedvěd, Trezeguet and Camoranesi may all stay to try to drag the club back up — and holding onto them, or sanctioning the sales, is the fight on your desk. Under new coach Didier Deschamps the task is stark — win Serie B at the first attempt, return to the top flight, and turn humiliation into a romance of loyalty and rebirth.`,
  },

  'spurs-2013': {
    coach: 'André Villas-Boas',
    formation: '4-2-3-1 (high line, aggressive press)',
    firstEleven: [
      'GK Hugo Lloris', 'RB Kyle Walker', 'CB Younès Kaboul', 'CB Jan Vertonghen',
      'LB Danny Rose', 'CM Paulinho', 'CM Sandro', 'RW Aaron Lennon',
      'AM Christian Eriksen', 'LW Nacer Chadli', 'ST Roberto Soldado',
    ],
    fringe: [
      'Gareth Bale — Real Madrid have a world-record ~£85m bid in for him, a deadline-day exit that would fund everything; whether to cash in or hold firm is the summer’s defining call.',
      'The "Magnificent Seven" — Soldado, Lamela, Eriksen, Paulinho, Capoue, Chadli and Chiricheș, ~£100m of Bale money spread across seven arrivals.',
      'Erik Lamela — the £30m club-record buy billed as Bale’s replacement, with all the adaptation risk that price and billing carry.',
      'Michael Dawson — the club captain still partnering Vertonghen as Kaboul returns from injury.',
      'André Villas-Boas — under immense pressure from day one, his job riding on making the seven-signing gamble work fast.',
    ],
    briefing: `Real Madrid have a world-record bid on the table for Tottenham’s one world-class talent, Gareth Bale — and the plan is to cash in and reinvest the fortune across seven new faces, the so-called Magnificent Seven. It is the classic gamble: can squad depth and a structured high-line 4-2-3-1 replace a single match-winning genius? The pressure on AVB is immense, tasked with integrating seven players at once while the board expects a top-four leap and no Bale to rescue flat afternoons. Can squad depth replace a single genius, or does bolting on seven new faces at once simply break the team's spine? That gamble is now yours to run.`,
  },

  'bayern-2009': {
    coach: 'Louis van Gaal',
    formation: '4-2-3-1',
    firstEleven: [
      'GK Hans-Jörg Butt', 'RB Philipp Lahm', 'CB Daniel Van Buyten', 'CB Martín Demichelis',
      'LB Holger Badstuber', 'DM Mark van Bommel', 'CM Bastian Schweinsteiger', 'RW Arjen Robben',
      'AM Thomas Müller', 'LW Franck Ribéry', 'ST Ivica Olić',
    ],
    fringe: [
      'Thomas Müller & Holger Badstuber — the academy graduates van Gaal promotes to regular starters.',
      'Bastian Schweinsteiger — converted by van Gaal from a wide player into a world-class central midfielder.',
      'Arjen Robben — the €24m marquee arrival from Real Madrid who transforms the attack.',
      'Mario Gómez — the club-record €30m signing who can’t fit the system, largely benched behind Olić.',
      'Luca Toni — the veteran striker who doesn’t fit van Gaal’s system, his future in Munich already in doubt; teenage prospect David Alaba waits in the wings.',
    ],
    briefing: `The abrasive Dutch disciplinarian Louis van Gaal arrives to replace Klinsmann and immediately resets Bayern around youth — handing regular starts to academy gems Müller and Badstuber, blooding a teenage David Alaba, and converting Schweinsteiger into a world-class midfielder. The €24m deal for Robben from Real Madrid — on the table — is meant to transform the attack, while the club-record move for Mario Gómez would bring a striker who must prove he fits the system. This is the reset that lays a dynasty's foundations — the mandate is to fend off Klopp's emerging Dortmund at home and finish the job in Europe. Neuer and Götze are still years away.`,
  },

  'dortmund-2012': {
    coach: 'Jürgen Klopp',
    formation: '4-2-3-1 (Gegenpressing)',
    firstEleven: [
      'GK Roman Weidenfeller', 'RB Łukasz Piszczek', 'CB Mats Hummels', 'CB Neven Subotić',
      'LB Marcel Schmelzer', 'DM Sven Bender', 'DM İlkay Gündoğan', 'RW Jakub Błaszczykowski',
      'AM Mario Götze', 'LW Marco Reus', 'ST Robert Lewandowski',
    ],
    fringe: [
      'Marco Reus — the headline summer signing (~€17m), the local boy coming home to a hero’s welcome.',
      'Shinji Kagawa — GONE: sold to Manchester United that summer.',
      'Mario Götze — the jewel of the academy, and exactly the sort of talent Bayern’s release-clause chequebook is built to prise away.',
      'Robert Lewandowski — the world-class spearhead, coveted across Europe and a constant flight risk; holding onto the crown jewels is the fight.',
      'Sebastian Kehl — the veteran captain, experienced cover in the double pivot.',
    ],
    briefing: `Klopp’s Dortmund enter as back-to-back Bundesliga champions, a thrilling, young, homegrown side playing ferocious Gegenpressing on a fraction of Bayern’s budget — Hummels, Gündoğan, Götze and Lewandowski among the most exciting names in Europe, with a deal on the table to bring hometown boy Marco Reus home embodying the romance. But the existential threat is Bayern’s chequebook, poised to prise the crown jewels away — Götze and Lewandowski are exactly the kind of talent Munich covets, and holding this golden generation together is the fight that defines the era. Can the wall hold, and can a Wembley run be turned into a European Cup?`,
  },

  'man-city-2008': {
    coach: 'Mark Hughes',
    formation: '4-4-2 (Robinho off the front)',
    firstEleven: [
      'GK Shay Given', 'RB Micah Richards', 'CB Vincent Kompany', 'CB Richard Dunne',
      'LB Wayne Bridge', 'RM Shaun Wright-Phillips', 'CM Nigel de Jong', 'CM Stephen Ireland',
      'LM Craig Bellamy', 'ST Robinho', 'ST Benjani',
    ],
    fringe: [
      'Robinho — a year on from the deadline-day British record, the emblem of the takeover but yet to justify the fee; still the marquee man until the spree arrives.',
      'Vincent Kompany — a year into his City career, moving from defensive midfield toward the centre-back role that will define him.',
      'Shay Given, Wayne Bridge & Nigel de Jong — the January 2009 arrivals who steadied a chaotic first year of ownership.',
      'Stephen Ireland — the inherited midfielder coming off his best-ever season, the heartbeat of the pre-spree side.',
    ],
    briefing: `The Abu Dhabi United Group's takeover — completed on deadline day 2008, with Robinho hijacked from under Chelsea's nose to announce it — made Manchester City the richest club on the planet, but the money landed too late to touch that summer's window, and a chaotic first season under Mark Hughes brought only 10th. Now, July 2009, comes the first window with the war chest truly open: the owners are ready to spend whatever it takes to gatecrash the top four, and the targets are already circling — Carlos Tévez off United, Emmanuel Adebayor and Kolo Touré from Arsenal, Gareth Barry from Villa, Joleon Lescott from Everton. The revolution finally has the money AND the window; turning the billions into titles without wasting years is the whole challenge.`,
  },

  'liverpool-2010': {
    coach: 'Roy Hodgson',
    formation: '4-4-2 (compact, cautious)',
    firstEleven: [
      'GK Pepe Reina', 'RB Glen Johnson', 'CB Martin Škrtel', 'CB Daniel Agger',
      'LB Paul Konchesky', 'RM Dirk Kuyt', 'CM Lucas Leiva', 'CM Christian Poulsen',
      'AM Steven Gerrard', 'ST Fernando Torres', 'ST David Ngog',
    ],
    fringe: [
      'Javier Mascherano — the captain-grade midfielder agitating for a move to Barcelona; a ~£17m exit is brewing, and whether to hold him or cash in is a live call.',
      'Fernando Torres — the nominal first-choice striker, but deeply unsettled and a real flight risk with the club in turmoil.',
      'Steven Gerrard — the loyal talisman anchoring the side through the storm.',
      'Joe Cole — the high-profile free signing from Chelsea, sent off on debut, who never settled.',
      'Luis Suárez & Andy Carroll — NOT here yet: the January 2011 deadline-day arrivals after Torres’s exit.',
    ],
    briefing: `Liverpool begin as a fallen giant in financial freefall: Tom Hicks and George Gillett’s debt-laden ownership has pushed one of England’s great institutions to the brink of administration, the club effectively for sale and unable to compete. Rafael Benítez has gone to Inter, and the cautious Roy Hodgson has been appointed — a safe pair of hands whose modest signings and compact 4-4-2 prove a jarring mismatch for Anfield’s expectation and turmoil. The overriding fight is to hold the squad together while the boardroom burns: Mascherano is already agitating out, Torres is eyeing the exit, and only Gerrard’s loyalty holds firm. A takeover may yet steady the finances — but the immediate task is to arrest the slide, keep the stars, and prove Anfield can climb back toward the summit.`,
  },

  'man-utd-2013': {
    coach: 'David Moyes',
    formation: '4-2-3-1 / 4-4-2',
    firstEleven: [
      'GK David de Gea', 'RB Rafael da Silva', 'CB Rio Ferdinand', 'CB Nemanja Vidić',
      'LB Patrice Evra', 'RM Antonio Valencia', 'CM Michael Carrick', 'CM Marouane Fellaini',
      'LM Shinji Kagawa', 'ST Wayne Rooney', 'ST Robin van Persie',
    ],
    fringe: [
      'Marouane Fellaini — the window’s ONLY signing, a chaotic £27.5m deadline-day scramble from Moyes’s old club Everton after his cheaper release clause had lapsed.',
      'Wayne Rooney — future in genuine doubt: a transfer request revealed, two Chelsea bids rejected, angered at being framed as van Persie’s back-up — but he stays.',
      'Robin van Persie — last season’s 26-goal title-winner, whose form and fitness fade badly under Moyes.',
      'Rio Ferdinand, Nemanja Vidić & Patrice Evra — the ageing champions’ spine, all visibly past their peak.',
      'Adnan Januzaj — the 18-year-old academy gem knocking on the first-team door, still on a short deal United must race to tie down.',
      'Wilfried Zaha — the £15m arrival from Crystal Palace, a winger with plenty to prove and an uncertain place in the manager’s plans.',
      'Fàbregas, Herrera & Baines — the summer targets chased and MISSED, the failures that defined a shambolic window; Juan Mata doesn’t arrive until January 2014.',
    ],
    briefing: `Sir Alex Ferguson retired in May 2013 having just won a 20th league title, hand-picking fellow Scot David Moyes as his successor — an almost impossible act to follow. Moyes inherits the champions but an ageing spine and a window already threatening to turn shambolic — the top targets are Fàbregas, Herrera and Baines, but the deals are proving hard to land and the fear is it ends in a frantic deadline-day scramble for a lesser name like Marouane Fellaini. Wayne Rooney’s future hangs in the balance amid a transfer request and Chelsea interest, while questions gather over whether van Persie can repeat his title-winning form. Following Ferguson is an almost impossible act — the mandate is to defend the title and prove the dynasty outlives its architect, and it starts the moment you take the chair.`,
  },
};
