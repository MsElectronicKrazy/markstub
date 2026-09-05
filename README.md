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
"and"), and gives you a direct status-lookup link once you have a serial or
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
  documentation — field tags are uppercase, colon-separated, terms lowercase).
- **Variants** — permutations, hyphenation, pluralization, and common substitutions
  generated client-side. Not exhaustive, just the obvious near-misses a person would
  otherwise forget to check by hand.
- **Status lookup** — builds a direct link to `tsdr.uspto.gov` from a serial or
  registration number.

## What it isn't

Not legal advice, not a substitute for professional review before filing, and not a
live database — every actual search happens on USPTO's own site, in your browser,
using the query this tool built for you.

## Known issues

- `renderVariants()` inserts the user's phrase into the DOM via `innerHTML` instead of
  `textContent` — a phrase containing HTML/script tags can execute in the page. Needs
  a fix before this is exposed to untrusted input.
- The `tsdr.uspto.gov` deep-link format (`caseType=SERIAL_NO` / `REGISTRATION_NO`) is
  unverified against the live site; a real TSDR example uses `caseType=DEFAULT` plus a
  separate `caseSearchType` parameter. Confirm the actual URL shape before relying on
  the "Check status" button.

## Roadmap ideas (open to contributions)

- Expand `CLASS_MAP` coverage / pull from the real ID Manual data
- Optional local phonetic-similarity pass (Soundex/Metaphone) as an extra "also check" layer
- Bulk USPTO data indexing (self-hosted) for anyone who wants real full-text search
  without going through the live site at all

## License

MIT — do whatever you want with it.
