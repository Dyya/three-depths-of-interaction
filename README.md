# Three Depths of Interaction

The source of an interactive article by Adi Dizdarevic, published in September 2026 at
**https://www.adidizdarevic.com/three-depths/**

The article proposes the Three-Depth Principle: intentional interaction should stay
understandable across three steps, access to context, orientation within it, and clear
resolution, and those steps repeat through every level of a system. Two interactive
studies let a reader feel the argument before it is explained:

- **Study 01, Save for later.** One task, three structures, on three phones.
- **Study 02, Book a table.** Two booking interfaces drawn by the same generator, one
  with rules and one without.

This repository is the page as it runs, so you can see how it works and check what the
studies record.

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

The live article is set in FT Polar Mono, which is licensed for adidizdarevic.com and
is not included here. This repository ships Red Hat Mono in its place (SIL Open Font
License 1.1), chosen on its proportions rather than its looks: the cap height matches
and the x-height is within 3 percent, so the body size and line height the layout is
built on still hold. Only the width of a character changes, and the layout reads it
from one token, `--char` in `system.css`: 0.60 here, 0.64 on the live site.

Both faces are loaded under the neutral name "Article Mono". Apart from the two font
files and that one token, every file in `site/` is identical to what the live site
serves.

## Research data

Each study posts one row when a reader finishes a version: counts, timings, the order
the versions were finished in, and a random id that links one reader's versions
within a browser tab. Never stored, by construction: IP address, user agent, cookies,
or any free text. The hypotheses and exclusion rules were written down before the
first row arrived. All of it is in [research/README.md](research/README.md).

## License

- **Code** (markup, styles, scripts and the Worker): MIT, see [LICENSE](LICENSE).
- **The article's text, figures and share image**: CC BY 4.0, see
  [LICENSE-CC-BY-4.0.txt](LICENSE-CC-BY-4.0.txt), including where the text sits inside
  an HTML file. Reuse and adapt them freely, with credit:
  *Adi Dizdarevic, "Three Depths of Interaction" (2026),
  https://www.adidizdarevic.com/three-depths/*
- **Red Hat Mono**: SIL Open Font License 1.1, see
  [site/fonts/OFL.txt](site/fonts/OFL.txt).
