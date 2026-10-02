# Three Depths of Interaction

<img width="1200" height="675" alt="three-depths_16x9_signal" src="https://github.com/user-attachments/assets/c599a0f8-d685-4d6c-96cb-41b358a69c58" />

The source of an interactive article by Adi Dizdarevic, published in September 2026 at
**https://www.adidizdarevic.com/three-depths/**

The article proposes the Three-Depth Principle: intentional interaction stays
understandable across three steps, access to context, orientation within it, and clear
resolution. It argues for counting commitments rather than clicks, follows the three
depths as they recur through complex tasks, and asks what keeps a person oriented when
the interface itself changes. Two interactive studies let a reader feel the argument
before it is explained:

- **Study 01, Save for later.** One task, three structures, on three phones.
- **Study 02, Book a table.** Two booking interfaces drawn by the same generator. In one,
  the questions can reorder and appear all at once. In the other, rules keep the path in
  place, one question at a time and always in the same order, and only the surface
  changes.

This repository holds the article and its study instruments as they run, so you can see
how they work and check what the studies record. It contains no participant results or
analysis yet.

Corrections, counterexamples and examples of applying the principle are welcome in
[Issues](../../issues).

## What is here

```
site/                 the article
  index.html          the page, prose and figures included
  system.css          tokens, type, the reading column
  demos/              the two studies and the opening scene, each its own page
  fonts/              the typeface (see below)
  share.jpg, 404.html
research/             where study results go, and how they will be read
  worker.js           the endpoint that receives one row per finished study
  schema.sql          the table it writes to
  README.md           what is sent, what is never stored, the analysis plan
CITATION.cff          how to cite the article
```

## Run it

```sh
cd site
python3 -m http.server 8000
```

Then open http://localhost:8000/. There is no build step and nothing to install: plain
HTML, CSS and JavaScript. Run like this, the studies send nothing. They only post
results when the page is served under `/three-depths/`, the published path.

## The typeface

The live article is set in FT Polar Mono, which is licensed for adidizdarevic.com and is
not included here. This repository ships Red Hat Mono in its place, under the SIL Open
Font License 1.1.

<details>
<summary>Why Red Hat Mono, and the one line it changes</summary>

Red Hat Mono was chosen on its proportions rather than its looks: the cap height matches
and the x-height is within 3 percent, so the body size and line height the layout is
built on still hold. Only the width of a character changes, and the layout reads it from
one token, `--char` in `system.css`: 0.60 here, 0.64 on the live site. Both faces are
loaded under the neutral name "Article Mono", so apart from the two font files and that
token, the files in `site/` match the authored source of the live site.

</details>

## Research data

Each study posts one row when a reader finishes a version: counts, timings, the order the
versions were finished in, and a random id that links one reader's versions within a
browser tab. The study database never holds IP addresses, user agents, cookies or free
text; `worker.js` and `schema.sql` show how that is enforced. The hypotheses and
exclusion rules were written down before the first row arrived, and the two thresholds
they left open were fixed in a dated amendment before any results were examined. All of it is in [research/README.md](research/README.md).

Separately from the studies, the site's host adds Cloudflare Web Analytics to every page
it serves on the domain: cookieless page-view and performance counts. That script is
added in transit and is not part of this source.

## Cite

*Adi Dizdarevic, "Three Depths of Interaction" (2026),
https://www.adidizdarevic.com/three-depths/*

GitHub's "Cite this repository" link gives the same, from `CITATION.cff`.

## License

- **Code** (markup, styles, scripts and the Worker): MIT, see [LICENSE](LICENSE).
- **The article's text, figures and share image**: CC BY 4.0, see
  [LICENSE-CC-BY-4.0.txt](LICENSE-CC-BY-4.0.txt), including where the text sits inside
  an HTML file. Reuse and adapt them freely, with credit as above.
- **Red Hat Mono**: SIL Open Font License 1.1, see
  [site/fonts/OFL.txt](site/fonts/OFL.txt).
