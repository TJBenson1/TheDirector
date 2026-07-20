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
      'Vladimir Jugović — summer-1995 arrival from Sampdoria, first rotation option in the midfield three (he’d score the winning penalty in the 1996 European Cup final).',
      'Attilio Lombardo & Michele Padovano — summer signings adding width and forward depth.',
      'Gianluca Vialli — the captain leading the line, though quietly in his final Juve season before a free move to Chelsea in 1996.',
    ],
    briefing: `Reigning Serie A and Coppa Italia champions, Lippi begins the defence by taking a scalpel to his own title-winners: Roberto Baggio, the biggest name in Italian football, is judged surplus to requirements and sold to Milan, the whole project reshaped around the 20-year-old Alessandro Del Piero who inherits his No.10. A Sampdoria-flavoured rebuild lands Vierchowod, Jugović and Lombardo, and Pessotto is prised from rivals Torino. Vialli captains a fearsome front three, but it is an open secret this is his last dance in Turin — his contract expires in 1996 and Chelsea await. The mood is unmistakably European: this side would go on to win the 1996 Champions League.`,
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
      'Franco Baresi — the 35-year-old captain and libero, the emblem of an ageing dynasty in its final title season.',
      'Mauro Tassotti & Filippo Galli — the veteran squad men holding the fort as the great side runs down.',
    ],
    briefing: `This is the last stand of the great Milan machine: an ageing spine of Baresi (35), Costacurta, Maldini, Albertini, Boban and Savićević, refuelled by the glamour summer arrivals of George Weah from PSG and Roberto Baggio from Juventus. Marco van Basten had formally retired that August, closing one chapter, and Capello — bound for Real Madrid at season’s end — would squeeze one final Scudetto from the group, wrapping it up as early as April. Two of the world’s finest attackers, an immovable rearguard, and the distinct sense of an era drawing to a close.`,
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
      'Les Ferdinand — the £6m summer talisman from QPR who’d plunder 25 league goals.',
      'David Ginola — the £2.5m flair merchant signed from PSG, box-office on the left.',
      'Philippe Albert — the cultured Belgian centre-back, but recovering from a cruciate injury at kickoff, so Howey deputises.',
      'Faustino Asprilla — NOT here yet: the mercurial Colombian arrives in February 1996, mid-season, and is often blamed for unbalancing the side.',
      'David Batty — NOT here yet either: he signs from Blackburn in March 1996.',
    ],
    briefing: `Keegan’s Newcastle set out to entertain and nothing else — an unapologetic, front-foot 4-4-2 with two genuine wingers feeding Ferdinand and Beardsley — and roughly £16m of summer spending on Ferdinand, Ginola and Barton makes them the neutrals’ team. They explode from the blocks and lead the league almost from August, building a commanding cushion of ten-plus points by the new year. The cavalier philosophy that thrills is the same one that leaves them exposed: the lead would famously evaporate in the spring as Manchester United reeled them in, and Keegan’s "I would love it" meltdown still lies months ahead.`,
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
      'Robbie Fowler — begins on the bench but within weeks displaces the ageing Rush, ending the season England’s second-top scorer.',
      'Ian Rush — the club legend in his final Anfield campaign, first-choice at kickoff before losing his place.',
      'Steve McManaman — the creative heartbeat, the division’s leading assist-maker.',
      'Jason McAteer — NOT here yet: the £4.5m right wing-back only signs in September 1995.',
    ],
    briefing: `Roy Evans’ Liverpool open as many pundits’ title favourites, having smashed the English transfer record for Stan Collymore to add to a gifted young core of Fowler, McManaman and Redknapp. Evans plays a patient, passing 3-5-2 that makes them arguably the most watchable side in England — but the flair rarely converts into silverware, and a growing playboy image would harden into the derisive "Spice Boys" tag (the white Armani cup-final suits still nine months away). Brilliant going forward, brittle when it matters: that gap between beauty and end product is the whole story.`,
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
      'Massimo Taibi — NOT here yet: signed in September 1999, his error-strewn cameo (the Southampton howler) becomes autumn infamy.',
      'Mikaël Silvestre — arrives 10 September 1999 from Inter, soon a first-choice defender.',
      'Ole Gunnar Solskjær & Teddy Sheringham — the lethal attacking depth behind Yorke and Cole.',
    ],
    briefing: `United begin life as champions of Europe, the world and England, fresh from the historic 1998–99 Treble — and immediately confront the one hole Ferguson can’t easily fill: Peter Schmeichel has retired, and neither Mark Bosnich nor the September signing Massimo Taibi convinces between the posts. As holders they controversially withdraw from the FA Cup to fly to Brazil for the inaugural Club World Championship, where they flop out in the group stage. The goalkeeping saga rumbles all season, yet the league machine barely notices, romping to the title with a club-record 97 goals.`,
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
    briefing: `Florentino Pérez has just won the presidency (July 2000) on one audacious promise — to prise Luís Figo out of Barcelona — and he keeps it days later with a world-record fee that Catalans brand the ultimate betrayal, lighting the fuse on the Galácticos. In the same window he engineers Fernando Redondo’s sale to Milan against the player’s will, handing the pivot to new signing Makélélé. Holding the spectacle together is the understated, moustachioed del Bosque, the quiet dressing-room man who’d already won the 2000 Champions League and would deliver La Liga. Zidane, Ronaldo and Beckham are still one, two and three summers away.`,
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
      'Gigi Simoni — the coach himself is fragile: fresh from winning the 1998 UEFA Cup, yet sacked by 30 November.',
    ],
    briefing: `This is Moratti’s blank-cheque Inter at its most dazzling and most volatile: Ronaldo, freshly crowned the world’s best and most expensive player, is the jewel of an expensively assembled galaxy. On top of Zamorano and Djorkaeff, Moratti has just added Roberto Baggio from Bologna, creating a glittering but hopelessly unbalanced forward glut — and enormous pressure to finally end a Scudetto drought stretching to 1989. Gigi Simoni starts as the man who won the UEFA Cup in May, but his seat is already hot; a stuttering start sees him gone by late November, opening a revolving door of coaches. The talent is overwhelming; the coherence is not.`,
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
      'Matthias Sammer — the reigning Ballon d’Or holder, but knee surgery in August 1997 all but ends his career; he’d retire by February.',
      'Karl-Heinz Riedle — GONE: sold to Liverpool that summer, leaving a hole up front.',
      'Paul Lambert — still here at kickoff, but the Scottish midfielder leaves for Celtic in November 1997.',
      'Lars Ricken — the young matchwinner of the 1997 final, now rotation in attack.',
      'Michael Zorc — the veteran captain marshalling a side in transition.',
    ],
    briefing: `Dortmund open as reigning champions of Europe — but under new management and with the winning core already fraying. Title-winner Ottmar Hitzfeld has moved upstairs to a director’s role, and the Italian Nevio Scala inherits the dugout; meanwhile Karl-Heinz Riedle has gone to Liverpool, and the great sweeper Matthias Sammer, the Ballon d’Or holder, undergoes knee surgery in August and never truly plays again. Scala’s side would still beat Cruzeiro to lift the Intercontinental Cup in Tokyo and reach the Champions League semi-final, but a domestic slump to 10th would ultimately cost him his job. Kings of Europe, quietly being dismantled.`,
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
    briefing: `At the literal kickoff Arsenal have no permanent manager: Bruce Rioch was sacked a week before the season, caretakers Stewart Houston and Pat Rice hold the fort, and it is not until 1 October that an unknown Frenchman from Japanese football is unveiled to "Arsène Who?" headlines. He inherits a hardened veteran spine — Seaman, the Adams back four, Wright — and stuns them with stretching, science and near-teetotal discipline, quietly rebuilding an ageing defence from within. The one signing already bearing his fingerprints, Patrick Vieira, arrived in the summer on his recommendation. The revolution starts not with a splash but with a diet sheet.`,
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
      'Gianfranco Zola — NOT here yet: the little Sardinian magician only arrives in November 1996, then wins Footballer of the Year.',
      'Kevin Hitchcock — the deputy keeper who becomes the de facto No.1 once Kharine is injured.',
      'Mark Hughes — the streetwise British anchor amid the continental cast.',
    ],
    briefing: `With Glenn Hoddle gone to manage England, Chelsea hand the reins to their charismatic, dreadlocked Dutch playmaker Ruud Gullit as player-manager, and he uses his continental black book to lure a cosmopolitan cast — Vialli, Leboeuf and Di Matteo that summer, Zola to follow in November. This is the pre-Abramovich gamble: no oligarch billions, just Ken Bates’s ambition and Gullit’s promise of "sexy football" transforming a mid-table London club into the Premier League’s glamour side. It pays off fast — his fluid 3-5-2 would deliver the 1997 FA Cup, Chelsea’s first major trophy in 26 years.`,
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
    briefing: `Ottmar Hitzfeld arrives in the summer of 1998 after a year’s sabbatical, restoring calm to a formidable German-led spine of Kahn, Babbel, Effenberg, Scholl and the veteran Matthäus. Domestically it is a procession — the title won by fifteen points — but this campaign would be forever known as "The Treble Denied": Bayern lead the 1999 Champions League final at Camp Nou through Basler’s free-kick, only for Sheringham and Solskjær to strike in stoppage time, and weeks later they lose the DFB-Pokal final on penalties too. A crown won, two cups agonisingly surrendered in the cruellest of springs.`,
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
    briefing: `Glenn Hoddle, a White Hart Lane legend as a player, returns as coach preaching cultured, possession football — and then has the ground cut from under him in July when captain Sol Campbell, who’d publicly sworn he’d never do it, walks out on a free to Arsenal. Hoddle answers by bringing club icon Teddy Sheringham home from Manchester United and rebuilding the defence around emerging homegrown centre-half Ledley King. Ambitions are honest — mid-table with a cup run — and the season delivers a League Cup final (lost to Blackburn) and ninth place, all of it played under the long shadow of the ultimate betrayal.`,
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
      'Michael Owen — about to be crowned the 2001 Ballon d’Or winner, the jewel of the treble side.',
      'John Arne Riise — the first summer signing, a £4m thunderbolt from Monaco, quickly nailing down left-back.',
      'Robbie Fowler — the cult hero now out of favour behind Owen and Heskey; he’d be sold to Leeds that November.',
      'Sander Westerveld — the incumbent keeper, but a costly error against Bolton (27 Aug) ends his Anfield career within weeks.',
      'Jerzy Dudek & Chris Kirkland — NOT here yet: both signed at the end of August to solve the goalkeeping crisis.',
    ],
    briefing: `Liverpool begin basking in the afterglow of an unprecedented cup treble — FA Cup, League Cup and UEFA Cup — and Houllier’s methodical, defensively rigorous project looks ready for the final step: a genuine tilt at the title, powered by 2001 Ballon d’Or winner Michael Owen. Houllier reinforces cautiously, adding Riise and, by late August, two new goalkeepers. Two storm clouds gather: Westerveld’s costly error will upend the goalkeeping department, and Houllier himself will collapse with a heart condition against Leeds in October. They’d push Arsenal all the way, finishing a club-best runners-up on 80 points.`,
  },

  'chelsea-2003': {
    coach: 'Claudio Ranieri',
    formation: '4-4-2 (rotational — "The Tinkerman")',
    firstEleven: [
      'GK Carlo Cudicini', 'RB Mario Melchiot', 'CB John Terry', 'CB William Gallas',
      'LB Wayne Bridge', 'RM Damien Duff', 'CM Claude Makélélé', 'CM Frank Lampard',
      'LM Joe Cole', 'ST Hernán Crespo', 'ST Eidur Gudjohnsen',
    ],
    fringe: [
      'Claude Makélélé — the £16m capture from Real Madrid, the pivot who’d define the era.',
      'Juan Sebastián Verón & Adrian Mutu — the marquee summer gambles (~£15m each) that would both flop.',
      'Claudio Ranieri — managing as a dead man walking, widely tipped for the sack whatever the results.',
      'Jimmy Floyd Hasselbaink — the incumbent striker now jostling with the new arrivals.',
      'Petr Čech, Didier Drogba & Arjen Robben — NOT here yet: all arrive with Mourinho in 2004.',
    ],
    briefing: `Roman Abramovich completes his takeover in July 2003 and turns an already good Chelsea into a billionaire’s plaything overnight, funding a £100m-plus spree — Makélélé, Crespo, Duff, Joe Cole, Bridge, Verón, Mutu, Geremi. Overnight the expectation flips from a top-four scrap to the title itself. Claudio Ranieri, the affable "Tinkerman", inherits the riches but manages knowing he is being auditioned to be replaced. He’d deliver a club-record second place and a Champions League semi-final — and still be sacked in May 2004 to make way for José Mourinho.`,
  },

  'barcelona-2003': {
    coach: 'Frank Rijkaard',
    formation: '4-3-3',
    firstEleven: [
      'GK Víctor Valdés', 'RB Michael Reiziger', 'CB Carles Puyol', 'CB Rafael Márquez',
      'LB Giovanni van Bronckhorst', 'CM Xavi Hernández', 'CM Phillip Cocu', 'CM Gerard López',
      'RW Javier Saviola', 'CF Patrick Kluivert', 'LW Ronaldinho',
    ],
    fringe: [
      'Ronaldinho — the marquee summer signing and emblem of the new era, landed after the club publicly missed out on David Beckham; the joy-bringer of the rebuild.',
      'Lionel Messi — a 16-year-old in La Masia, NOT yet a first-team player; his competitive debut is still over a year away (October 2004).',
      'Luis Enrique, Phillip Cocu & Patrick Kluivert — the veteran core being gradually phased out.',
      'Andrés Iniesta — a fringe teenager, only occasional first-team minutes.',
      'Edgar Davids — NOT here yet: the loan arrival in January 2004 that would spark the second-half turnaround.',
    ],
    briefing: `Summer 2003 is the dawn of the Laporta revolution: Joan Laporta wins the presidency vowing to end years of decline, appoints Frank Rijkaard, and — after very publicly failing to land David Beckham — lands Ronaldinho instead, whose flair comes to symbolise Barcelona’s reawakening. It is a shaky start: the side flirts with the drop and Rijkaard is nearly sacked in early 2004 before a stunning turnaround drives them to runners-up. This is the golden generation taking shape around Xavi, Puyol and Valdés — one season before Eto’o, Deco and a teenage Messi complete the transformation.`,
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
      'David Beckham — THE subplot: frozen out by Capello in January 2007 and told he’d never play again after agreeing an LA Galaxy move, then dramatically reintegrated to become pivotal in the title run-in.',
      'Fabio Cannavaro — the summer arrival from a relegated Juventus who’d win the 2006 Ballon d’Or as reigning World Cup-winning captain.',
      'Ruud van Nistelrooy — the marquee signing from Manchester United who top-scored with 25 league goals.',
      'Ronaldo — the Brazilian, frozen out by Capello for indiscipline and sold to Milan in January 2007.',
      'Antonio Cassano — the wayward Italian marginalised and largely frozen out.',
    ],
    briefing: `Appointed months after Florentino Pérez’s resignation, Capello is brought back to bury the galáctico circus and impose defensive rigour — an unglamorous, pragmatic 4-4-2 built on van Nistelrooy’s goals and Cannavaro’s steel rather than showmanship. His abrasive discipline defines the year: Ronaldo frozen out and sold, Cassano marginalised, and Beckham publicly told he was finished before an extraordinary reintegration. That grinding, joyless run would snatch Real’s 30th title on the final day — after which the board sacked Capello anyway. Zidane has retired, Figo is long gone; this is the morning after the party.`,
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
      'The 49-game unbeaten run — carried in from last season, about to end in the bad-tempered "Battle of the Buffet" at Old Trafford that October.',
    ],
    briefing: `Arsenal begin as the untouchable "Invincibles", having gone the entire previous league season unbeaten, and they carry that aura into a run that would stretch to a record 49 games without defeat. Wenger’s side plays arguably the most beautiful football in the club’s history — Henry’s brilliance, Bergkamp’s craft, the Vieira–Gilberto engine — but the dominant off-field story is captain Vieira’s flirtation with Real Madrid before he chooses to stay. The invincibility ends dramatically on 24 October at Old Trafford, a fractious 2–0 defeat remembered for the pizza that flew in the tunnel afterwards.`,
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
    briefing: `Moratti’s endless spending has made Inter perennial big-name buyers yet perennial bridesmaids, the Scudetto drought stretching back to 1989 and curdling into a psychological weight that undoes better sides. New coach Roberto Mancini, arriving from Lazio, inherits that burden and builds around the great hope: Adriano, a physically overwhelming striker at the absolute zenith of his powers. Backed by the free signing Cambiasso and loanee Verón, Mancini’s side would win the Coppa Italia but finish only third — the title still out of reach until Calciopoli handed it over in 2006.`,
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
      'Andriy Shevchenko — GONE: sold to Chelsea that summer, and the void up front is the very reason the Christmas Tree exists.',
      'Kaká — the peak-form talisman who’d win the 2007 Ballon d’Or on the back of this campaign.',
      'Paolo Maldini (38) & Alessandro Costacurta (40) — the ageing aristocrats in their European swansong.',
      'Alberto Gilardino — the rotation striker sharing the lone-forward duties with Inzaghi.',
      'Ronaldo — NOT here yet: the Brazilian arrives in January 2007 as extra firepower.',
    ],
    briefing: `Milan open as an ageing European aristocracy under Ancelotti, spearheaded by a peak-form Kaká and anchored by a veteran spine — Maldini at 38, the 40-year-old Costacurta — chasing redemption for the traumatic Istanbul collapse of 2005. The Calciopoli scandal casts a heavy shadow: they begin the league with an eight-point deduction and must enter the Champions League through a late-August qualifier against Red Star Belgrade. Shevchenko’s summer sale to Chelsea gutted the attack and pushed Ancelotti to crystallise his 4-3-2-1, with Inzaghi alone up top fed by Kaká and Seedorf. This last dance would end in glory: a 2–1 revenge over Liverpool in Athens for a seventh European Cup.`,
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
      'Diego Costa — exploding into one of Europe’s most feared strikers (27 league goals) before his summer-2014 move to Chelsea.',
      'Thibaut Courtois — the Belgian keeper on a multi-year loan from Chelsea, anchoring a miserly defence.',
      'The wage bill — a fraction of Barça’s and Real’s, yet about to win the lot.',
    ],
    briefing: `Atlético open having just cashed in their star — Falcao sold to Monaco — a departure most expected to unravel Simeone’s side. Instead they got stronger: David Villa arrived cheaply, Diego Costa erupted into a monster, and Courtois anchored a defence built on Godín and Miranda. Simeone forged a siege-mentality machine, a disciplined low block with relentless pressing and lethal counters, running on a wage bill dwarfed by the giants. Against every expectation they’d seize La Liga on the final day at the Camp Nou and reach the Champions League final — breaking the Barça–Real duopoly that had swallowed Spanish football.`,
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
      'The goalkeeping split — Claudio Bravo takes the league goal, Marc-André ter Stegen the cups and Champions League (he’d start the final); there is no single No.1.',
      'Xavi Hernández — the club captain in a reduced, farewell role, his midfield place ceded to the new arrival Rakitić.',
      'Ivan Rakitić — the summer signing from Sevilla, immediately first-choice on the right of the three.',
      'The transfer ban — a looming FIFA sanction that would bar Barça from registering new signings across both 2015 windows.',
    ],
    briefing: `Newly appointed Luis Enrique is handed a rebuilt front line and assembles, in his 4-3-3, arguably the greatest attacking trident ever seen — Messi, Suárez and Neymar, the "MSN". But the full trio can’t start together until Suárez serves out his four-month World Cup biting ban, debuting at the Bernabéu in late October, after which the attack becomes unstoppable. Luis Enrique’s early tenure is tense — a reported rift with Messi and a poor January loss at Real Sociedad put his job in doubt — before the team surges. They’d sweep La Liga, the Copa del Rey and the Champions League for a historic second continental treble, with a farewell-season Xavi passing the torch.`,
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
      'The loyal icons who stayed — Buffon, Del Piero, Nedvěd, Trezeguet and Camoranesi all refused to abandon the fallen giant in the second tier.',
      'Giorgio Chiellini — the rising defender anchoring the rebuild.',
      'Fabio Cannavaro & Emerson — GONE to Real Madrid.',
      'Zlatan Ibrahimović & Patrick Vieira — GONE to Inter.',
      'Gianluca Zambrotta & Lilian Thuram — GONE to Barcelona.',
    ],
    briefing: `The 2006 Calciopoli scandal strips Juventus of two Scudetti and forces them into Serie B for the first time in their history, starting the campaign with a points deduction. A mass exodus follows — Cannavaro and Emerson to Real, Ibrahimović and Vieira to Inter, Zambrotta and Thuram to Barcelona — yet a core of icons refuses to jump ship: Buffon, Del Piero, Nedvěd, Trezeguet and Camoranesi all stay to drag the club back up. Under new coach Didier Deschamps they’d canter to the Serie B title with the division’s meanest defence, turning humiliation into a romance of loyalty and rebirth.`,
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
      'Gareth Bale — GONE, and his exit funds everything: sold to Real Madrid for a world-record ~£85m in September 2013.',
      'The "Magnificent Seven" — Soldado, Lamela, Eriksen, Paulinho, Capoue, Chadli and Chiricheș, ~£100m of Bale money spread across seven arrivals.',
      'Erik Lamela — the £30m club-record buy billed as Bale’s replacement, but injury and adaptation wreck his debut season.',
      'Michael Dawson — the club captain still partnering Vertonghen as Kaboul returns from injury.',
      'André Villas-Boas — under immense pressure, and sacked by December after heavy home defeats.',
    ],
    briefing: `Tottenham cash in their one world-class talent — Bale to Real Madrid for a world record — and reinvest the fortune across seven new faces, the so-called Magnificent Seven. It is the classic gamble: can squad depth and a structured high-line 4-2-3-1 replace a single match-winning genius? The pressure on AVB is immense, tasked with integrating seven players at once while the board expects a top-four leap and no Bale to rescue flat afternoons. The experiment unravels fast — 6–0 at City, 5–0 at home to Liverpool — and Villas-Boas is gone by mid-December.`,
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
      'Luca Toni — frozen out by van Gaal and shipped to Roma on loan in January 2010; David Alaba, 17, debuts that February.',
    ],
    briefing: `The abrasive Dutch disciplinarian Louis van Gaal arrives to replace Klinsmann and immediately resets Bayern around youth — handing regular starts to academy gems Müller and Badstuber, blooding a teenage David Alaba, and converting Schweinsteiger into a world-class midfielder. The €24m capture of Robben from Real Madrid transforms the attack, while the record buy Mario Gómez struggles to fit and Luca Toni is frozen out entirely. Van Gaal would become the first Dutchman to win the Bundesliga, complete a domestic double, and drive Bayern all the way to the 2010 Champions League final — where Mourinho’s Inter awaited. Neuer and Götze are still years away.`,
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
      'Mario Götze — still here at kickoff, but Bayern would trigger his €37m release clause in April 2013, announced days before the Champions League final.',
      'Robert Lewandowski — still here too, but bound for Bayern on a free in 2014; the crown jewels are being picked off one by one.',
      'Sebastian Kehl — the veteran captain, experienced cover in the double pivot.',
    ],
    briefing: `Klopp’s Dortmund enter as back-to-back Bundesliga champions, a thrilling, young, homegrown side playing ferocious Gegenpressing on a fraction of Bayern’s budget — Hummels, Gündoğan, Götze, Reus and Lewandowski among the most exciting names in Europe, with hometown returnee Reus embodying the romance. But the existential threat is Bayern’s chequebook, poised to prise the crown jewels away: Götze would agree a move to Munich in April 2013, days before the final, with Lewandowski to follow. The season peaks at the all-German 2013 final — a 2–1 defeat to Bayern at Wembley — the wall holding, for now.`,
  },

  'man-city-2008': {
    coach: 'Mark Hughes',
    formation: '4-4-2 (often 4-4-1-1, Robinho tucked behind Jô)',
    firstEleven: [
      'GK Joe Hart', 'RB Micah Richards', 'CB Richard Dunne', 'CB Tal Ben Haim',
      'LB Javier Garrido', 'RM Shaun Wright-Phillips', 'CM Vincent Kompany', 'CM Stephen Ireland',
      'LM Elano', 'ST Robinho', 'ST Jô',
    ],
    fringe: [
      'Robinho — the deadline-day £32.5m British-record hijack from under Chelsea’s nose on 1 September 2008, the glittering statement of the new age.',
      'The Abu Dhabi United Group — the takeover completed that very deadline day, making City the richest club on earth overnight.',
      'Vincent Kompany — the quiet summer arrival from Hamburg, played mostly in defensive midfield in year one, not yet the centre-back colossus.',
      'Jô — the £19m pre-takeover striker signing who never delivered.',
      'Tévez, Adebayor & Kolo Touré — NOT here yet: the big-money reshaping waits until summer 2009 (with Given and Bridge arriving in January).',
    ],
    briefing: `Mark Hughes was hired in June 2008 to rebuild a mid-table, cash-strapped side under Thaksin Shinawatra’s crumbling ownership — and then, on 1 September, the Abu Dhabi United Group completed a takeover that made Manchester City the richest club on the planet overnight. Minutes before the window shut, the new owners announced themselves by hijacking Real Madrid’s Robinho from under Chelsea’s nose for a British record. Overnight the club went from also-rans to a place with no spending ceiling, Robinho the emblem of it all, while Hughes was left to fuse a chaotic inherited squad with sudden limitless ambition. Year one yielded only 10th place — the revolution had money, not yet a team.`,
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
      'Javier Mascherano — GONE: the captain-grade midfielder agitates his way out to Barcelona for ~£17m on 30 August 2010.',
      'Fernando Torres — the nominal first-choice striker, deeply unsettled; he’d force a British-record £50m move to Chelsea in January.',
      'Steven Gerrard — the loyal talisman anchoring the side through the storm.',
      'Joe Cole — the high-profile free signing from Chelsea, sent off on debut, who never settled.',
      'Luis Suárez & Andy Carroll — NOT here yet: the January 2011 deadline-day arrivals after Torres’s exit.',
    ],
    briefing: `Liverpool begin as a fallen giant in financial freefall: Tom Hicks and George Gillett’s debt-laden ownership has pushed one of England’s great institutions to the brink of administration, the club effectively for sale and unable to compete. Rafael Benítez has gone to Inter, and the cautious Roy Hodgson has been appointed — a safe pair of hands whose modest signings and compact 4-4-2 prove a jarring mismatch for Anfield’s expectation and turmoil. The overriding fight is to hold the squad together while the boardroom burns: Mascherano is already agitating out, Torres is eyeing the exit, and only Gerrard’s loyalty holds firm. Relief comes in October with the NESV/FSG takeover — but results collapse, and Hodgson is sacked in January for the returning Kenny Dalglish.`,
  },

  'man-utd-2013': {
    coach: 'David Moyes',
    formation: '4-2-3-1 / 4-4-2',
    firstEleven: [
      'GK David de Gea', 'RB Rafael', 'CB Rio Ferdinand', 'CB Nemanja Vidić',
      'LB Patrice Evra', 'RM Antonio Valencia', 'CM Michael Carrick', 'CM Marouane Fellaini',
      'LM Shinji Kagawa', 'ST Wayne Rooney', 'ST Robin van Persie',
    ],
    fringe: [
      'Marouane Fellaini — the window’s ONLY signing, a chaotic £27.5m deadline-day scramble from Moyes’s old club Everton after his cheaper release clause had lapsed.',
      'Wayne Rooney — future in genuine doubt: a transfer request revealed, two Chelsea bids rejected, angered at being framed as van Persie’s back-up — but he stays.',
      'Robin van Persie — last season’s 26-goal title-winner, whose form and fitness fade badly under Moyes.',
      'Rio Ferdinand, Nemanja Vidić & Patrice Evra — the ageing champions’ spine, all visibly past their peak.',
      'Adnan Januzaj — the 18-year-old academy gem about to force his way in and become the season’s one bright spark, still on a short deal United must race to tie down.',
      'Wilfried Zaha — the £15m January arrival from Crystal Palace, integrated for the new season but frozen out by Moyes and loaned back out by January.',
      'Fàbregas, Herrera & Baines — the summer targets chased and MISSED, the failures that defined a shambolic window; Juan Mata doesn’t arrive until January 2014.',
    ],
    briefing: `Sir Alex Ferguson retired in May 2013 having just won a 20th league title, hand-picking fellow Scot David Moyes as his successor — an almost impossible act to follow. Moyes inherits the champions but an ageing spine and a shambolic window that, after chasing and failing on Fàbregas, Herrera and Baines, lands only Marouane Fellaini in a frantic deadline-day scramble. Wayne Rooney’s future hangs in the balance amid a transfer request and Chelsea interest before he stays, while van Persie’s title-winning form fades. A 4–1 opening win at Swansea flatters the reality: the Ferguson aura evaporates fast, and Moyes would be sacked by April with United out of the top four.`,
  },
};
