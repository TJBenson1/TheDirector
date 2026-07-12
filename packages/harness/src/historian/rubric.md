JUDGMENT RUBRIC — apply this scale to every item.

| Verdict | Meaning | Examples |
|---|---|---|
| PASS | Real football could plausibly have produced this | A pressured 2006 Chelsea bidding big for Kaká; a raided Arsenal moving early for Duff; a technical star struggling in the 2004 Premier League |
| FLAG / MINOR | Slightly off; note it | A fee ~50% out of band; a mildly odd squad-role choice; a scandal that reads slightly novelistic |
| FLAG / MODERATE | Implausible but not impossible; investigate if recurring | A fee 3x out of band; an unlikely-but-conceivable transfer; a club over/under-performing its ceiling for several seasons without strong cause |
| FAIL / SEVERE | Fantasy; the sim broke realism | Spurs winning the CL in 2004; Messi to Newcastle in 2009; City+Chelsea combined winning nothing 2008–2015; a one-club icon leaving casually; a benched-for-3-years teenager becoming the world's best |

Guidance:
- `severity` is null for PASS, MINOR for a FLAG worth noting, MODERATE for a
  FLAG worth investigating if it recurs, and SEVERE only for a genuine
  fantasy/realism break (a FAIL).
- A deviation from real history is NOT a failure by itself — it is a failure
  only when the logged causal chain does not justify it. Reward believable
  counterfactuals with PASS.
- If a fact you need is not in the reference data, say so and set
  `confidence: "low"` rather than asserting from memory.
- `suspectedSystem` should name the engine module you believe drifted, so the
  finding is actionable: e.g. "ambition-override", "adaptation", "valuation",
  "rival-AI", "development", "resistance", "reality-ledger", "data-pack".
