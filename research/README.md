# Research data

The two studies in the article record how readers move through them. This folder holds
the code that receives those records, the table they are written to, and the plan for
reading them, written down before the first record arrived. Collection began on
2026-09-24, when the article was published. No results or analysis are published yet.

The live endpoint, `https://www.adidizdarevic.com/three-depths/api/run`, runs
`worker.js` exactly as it is here. The same Worker also serves the article itself,
proxying `/three-depths/` to the static site.

## What is sent

A study posts one row when a reader finishes one of its versions, and only then: an
abandoned version sends nothing. It posts only when the page is served under
`/three-depths/`, so local copies and previews send nothing.

Every row holds:

| Field | What it is |
|---|---|
| `run` | a random id, one per browser tab (kept in sessionStorage), so the versions of a study, and the two studies, can be linked within one visit |
| `study`, `version` | Study 1: `A`, `B`, `C`. Study 2: `generated`, `generated-rules` |
| `seq` | the order in which this version was finished, 1 to n |
| `build` | the study's build tag, so later changes can be told apart |
| `embed` | inside the article, or the study opened on its own |
| `pointer` | coarse (touch) or fine (mouse) |
| `vw` | viewport width, rounded to 100 |
| `is_repeat` | this browser had already sent the same study from another tab or an earlier visit (a flag in localStorage) |
| `metrics` | JSON, whitelisted keys only, below |

**Study 1 metrics:** commitments, blind commitments, backtracks, seconds, confidence
(1 to 5), recall (one of the fixed options, or null), and the path as a list of step
tags.

**Study 2 metrics:** seconds, commitments, corrections, regenerations, mean recovery and
the list of recoveries (time from a redraw to the next press), reorient and the list of
reorients (time from the reader's return to a redrawn panel to their next press; null on
touch, where a return cannot be seen), whether the booking matched the intent, and
`surfaces`: the layout of each press as a nine-character code, question order, then the
component each question was shown as, then the button style. `dts:DRB:p` is day, time,
size; a date strip, radios, buttons; pills. Components: B buttons, D date strip, R
radios, P people, M menu (drawn only without the rules). Styles: c chip, p pill, s
segmented.

## What the study database never holds

No IP address, no user agent, no cookies, no free text: the table has no column for any
of them, and the Worker drops any key it does not expect before the insert and refuses
bodies over 4 KB. It refuses a post whose `Origin` or `Sec-Fetch-Site` header names
another site, and it allows one address sixty posts a minute. The address is the rate
limiter's key and nothing else: it is never written to the table.

This covers the study database, which is what `worker.js` and `schema.sql` can show. The
site's host, Cloudflare, processes each request, the address included, in order to serve
it, as any host does, and the domain runs Cloudflare Web Analytics, which counts page
views without cookies. Neither writes to this table.

## The plan, written before the first row

**Exclusion rules**, applied at analysis, not at collection:

- Rows never arrive for unfinished versions (a study posts on completion only).
- Drop runs under a floor time per version. *Fixed in the 2026-09-29 amendment below.*
- Drop `is_repeat = 1`.
- Drop a study whose versions are not all present for the run.
- Drop paths that contain sequences impossible for the version. *Fixed in the 2026-09-29
  amendment below.*
- Record the order (`seq`) as a factor.

**Hypotheses:**

- Study 1: blind commitments per run are lower in B (Legible) than in A (Compressed)
  and C (Fragmented), and confidence is higher in B.
- Study 2 (restated on 2026-09-24 for the two generated panels, before the first row):
  corrections, the time to act again after a redraw (`reorient`) and total time are
  lower in B (Staged, `generated-rules`) than in A (Exposed, `generated`).

The first question the data answers is whether a blind commitment appears in other
people's paths where the rubric expects it.

## Amendments

Any change to the plan is recorded here with its date, and fixed before any outcome data
are examined.

### 2026-09-29: the floor time and the impossible paths

Both were left open in the plan. They are written from the studies' code, after three rows
had arrived (one reader's run of Study 1) and before any row's measures were looked at.
Rows that fail a rule are dropped before the analysis, and the analysis will report how
many were dropped, and by which rule.

**Floor time.** A version is dropped when its `seconds` are under 0.3 s for every press
after the first: `seconds < 0.3 × (commitments − 1)`. Both clocks start at the first press
and stop at the press that finishes, so the shortest honest paths set the minimums:
Study 1 A and B take 2 presses (0.3 s), Study 1 C takes 5 (1.2 s), and Study 2 takes 4,
three answers and Confirm (0.9 s). The floor removes what no person could do, since
reacting to something that has just appeared takes about a quarter of a second before any
movement starts. It does not remove fast readers: in Study 1, acting without knowing is
what is being measured.

**Impossible paths, Study 1.** A path is dropped if it breaks any of these, each read from
what the version's controls can log:

- It begins with `access`: on the article, the only control opens the menu.
- `res` appears once, last. A path of 60 tags was cut short by the Worker and is checked
  only up to its end.
- Every `access` is directly followed by the version's reveal, `partial` in A and C and
  `orient` in B. `access` itself may follow any tag, because tapping outside a sheet closes
  it without logging one.
- A logs only `access`, `partial`, `blind`, `miss`, `back` and `res`. The tag before `res`
  is `blind` (the bookmark icon), and every `miss` directly follows a `blind`.
- B logs only `access`, `orient`, `miss`, `back` and `res`, and ends `orient`, `res`.
- C ends `partial`, `orient`, `res` (Reading List, then Confirm), has `orient` nowhere
  else, and has at least two `blind` (More and Organize), each directly followed by
  `partial`.
- The measures agree with the path. `blind` equals the number of `blind` tags (0 in B).
  `backtracks` is at least the number of `back` tags. `commitments` equals the committing
  tags: in A, `access` plus `blind`; in B, `access` plus `miss` plus 1; in C, `access` plus
  `blind` plus `miss` plus the Reading List selections (a `partial` that does not directly
  follow `access` or `blind`) plus 1. `confidence` is a whole number from 1 to 5. `recall`
  is one of the four options in A, and null in B and C, which do not ask it.

**Impossible rows, Study 2.** Study 2 records no path, so the same rule checks what its
measures allow:

- `commitments` is at least 4: Confirm appears only once all three questions are answered.
- `corrections` is at most `commitments − 4`.
- `surfaces` has at most one code per press. Each code is the question order (d, t and s
  in some order), then the component for day, time and size (day B, D or M; time B, R or
  M; size B, P or M), then the style (c, p or s).
- In `generated-rules`, every code begins `dts` and contains no `M`: the rules fix the
  order and never draw a menu.
- `recoveries` has at most one entry per regeneration, and `reorients` at most one per
  recovery. `recovery` and `reorient` are the means of their lists, within 0.1 s, or null
  when the list is empty.
- `matchedIntent` is present, true or false.

## Build history

- `2026-09-09`: first builds of both studies, before publication.
- `2026-09-24`: Study 2 became two generated panels (Exposed and Staged) and gained
  `reorient` and `surfaces`; Study 1's sample article changed its two city names.
  Nothing Study 1 measures changed. The article went live the same day, so every row
  carries this tag or a later one.

## Running your own

`schema.sql` creates the table in a Cloudflare D1 database, and
`wrangler.example.toml` shows the bindings `worker.js` expects: the database as
`TDP_DB` and a rate limit as `TDP_LIMIT`. The allowed origins and the upstream site are
constants at the top of `worker.js`.
