# Markstub

A single-file, no-backend tool that builds a *correct* USPTO trademark search — because
`tmsearch.uspto.gov`'s basic search box splits your phrase into separate words (an
"AND of terms" search), not an exact phrase. If you type "sunrise bakery," you get
every mark containing "technology" OR "humans," not your actual phrase.

Markstub doesn't touch USPTO's data directly — there's no free, CORS-enabled, full-text
trademark search API to call from a browser. Instead it does the part that's actually
missing: it builds the correct **Expert Mode field-tag query** for you, suggests a
starting Nice classification from a one-line description, generates the obvious
structural variants worth checking (reordered, hyphenated, singular/plural, "&" vs
"and"), flags same-sounding spelling variants and run-together compound words worth
checking too, and gives you a direct status-lookup link once you have a serial or
registration number.

## Why this exists

Novice founders don't need a trademark law lecture — they need an accurate answer to
"does something like this already exist, in my category, right now." This tool
narrows that down fast and gets you to USPTO's real system with the right query
already built, instead of guessing at syntax.

## Run it

It's one static HTML file with no build step and no server.

```
open index.html
```

or host it anywhere static files work (GitHub Pages, Netlify, S3, etc).

## How it works

- **Class suggestion** — a local keyword → Nice classification heuristic (`CLASS_MAP`
  in `index.html`). This is a *starting guess*, not authoritative — always confirm
  against the [USPTO ID Manual](https://idm-tmng.uspto.gov/).
- **Exact-phrase query** — builds `CM:"your phrase" AND IC:xxx AND LD:true` using
  USPTO's current field-tag syntax (confirmed against USPTO's own Expert Mode
  documentation — field tags are uppercase, colon-separated, terms lowercase). Once
  you're in Expert mode on tmsearch.uspto.gov, you also have to pick **"Field tag
  and search builder"** from the search-by dropdown specifically — other options
  (Wordmark, Owner, etc.) reject this syntax outright. No USPTO.gov login is
  required to search; logging in only adds an inline result-summary panel — without
  one, use the status-lookup box below (backed by TSDR) instead.
- **Structural variants** — permutations, hyphenation, joining, and pluralization,
  generated client-side. Not exhaustive, just the obvious near-misses a person would
  otherwise forget to check by hand.
- **Sound-alike variants** — a small, deliberately conservative homophone
  substitution table (`HOMOPHONE_GROUPS` in `index.html`, ~50 common pairs like
  made/maid, for/four/fore, to/too/two) generates spelling variants that sound
  identical but are spelled differently. This isn't cosmetic: on live USPTO data,
  `CM:"taylormaid" AND LD:true` returns 1 live mark vs. 11 for `CM:"taylor maid"`
  — a same-sounding, differently-spelled mark can carry a materially different
  result count. A real phonetic algorithm (Soundex/Metaphone) would catch more,
  but was deliberately left out of this table to avoid false positives — see
  Roadmap.
- **Compound-word detection** — if your input is one run-together word with no
  spaces, the tool either auto-generates the spaced version (when the input is
  camelCase, e.g. "TaylorMade" → "Taylor Made" as a ready-to-copy query) or, for
  lowercase run-together input, shows an advisory note to manually try the
  spaced-out version. Confirmed against real data: `CM:"taylormade" AND LD:true`
  returns 17 live marks vs. 51 for `CM:"taylor made"` — a 3x difference from
  spacing alone. True dictionary-based word segmentation (splitting
  "taylormade" into "taylor" + "made" automatically, with no camelCase hint) is a
  known limitation — see Roadmap.
- **Status lookup** — builds a direct link to `tsdr.uspto.gov` from a serial or
  registration number.

## What it isn't

Not legal advice, not a substitute for professional review before filing, and not a
live database — every actual search happens on USPTO's own site, in your browser,
using the query this tool built for you.

## A syntax trap to avoid

USPTO's field-tag docs show `IC:(025 a b 200)` as valid grouping syntax for
combining class codes with OR, and it's tempting to assume the same parenthesized
grouping works for combining multiple quoted phrases in a `CM:` (wordmark) search —
e.g. `CM:("foreman" "4 men" "for men")`, to check three variants in one query
instead of three separate searches.

**It does not work safely.** Verified against live results on tmsearch.uspto.gov:

- `CM:("foreman" "4 men" "for men")` returned **1,478** results.
- "foremen" alone (a related word, searched normally) returned only **142**.
- Inspecting the 1,478 result set directly showed it full of unrelated marks
  containing just *one* of the individual words — "i4men," "max 4 men,"
  "niagara 4," "made 4 men," "4 men for women," etc. — not marks matching any of
  the three full phrases.

Grouping quoted multi-word phrases inside `CM:(...)` silently degrades to
word-level OR across every word in every phrase (effectively
`foreman OR 4 OR men OR for OR men`), not phrase-level OR. The quotes lose their
exactness once grouped this way, and USPTO's docs don't call this out anywhere
obvious — the result looks like a normal count, but it's badly wrong, and it can
mislead you into thinking a name is more (or less) "in use" than it actually is.
The only confirmed-safe grouping syntax for combining terms inside `CM:` is
regex-inside-parens (`CM:(/.*hip.*/ /.*hop.*/)`), a completely different
mechanism that Markstub doesn't generate and shouldn't start generating for this
purpose.

**Each candidate phrase must be searched as its own separate `CM:"..."` query.**
This is why the tool renders one query box with its own Copy button per variant
instead of one combined query — that design should not change.

## Roadmap ideas (open to contributions)

- Expand `CLASS_MAP` coverage / pull from the real ID Manual data
- Expand `HOMOPHONE_GROUPS`, or replace it with a real phonetic algorithm
  (Soundex/Metaphone) for broader sound-alike coverage — current table is
  intentionally small to avoid false positives
- True compound-word segmentation for lowercase, non-camelCase single-word input
  (e.g. auto-splitting "taylormade" → "taylor made" without relying on
  capitalization) — needs a dictionary/word-list, which is a meaningfully bigger
  dependency than anything else in this tool, so it's deferred rather than done
  half-right
- Bulk USPTO data indexing (self-hosted) for anyone who wants real full-text search
  without going through the live site at all

## License

MIT — do whatever you want with it.
