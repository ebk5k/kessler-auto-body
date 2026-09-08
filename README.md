# Kessler Auto Body

A collision-repair shop site built as a study of the Avéon interior-design Framer template (aveon.framer.website), re-cast for an auto body shop: sand page, espresso sections, copper statement blocks, Geist display type over Inter, bracketed labels, rule-and-arrow links, a live date/time nav, and the same section anatomy — reel hero, drag-to-explore grid, numbered services, owner's note with scroll word-fill, work cards, glass stats, client-story strip, timeline process, grouped FAQ, journal, copper CTA, giant-wordmark footer.

No framework, no build step. Serve with `npx -y http-server . -p 4380` (or `.claude/launch.json`).

## Layout

```
index.html          every section (content lives inline)
css/style.css       tokens, surfaces (.dark/.light/.copper), components, responsive, reduced motion
js/app.js           clock, menu, reveals, counters, quote word-fill, drag grid, FAQ, story strip, letter roll
assets/             web JPGs (-lg full, -sm phone) + hero.mp4 (1168x768, 8s, muted loop) + favicon.svg
assets/src/         generation originals + batch log (gitignored)
tools/media-batch.sh  the sequential imagegen (stills) -> grokgen (hero video) batch
tools/optimize.py     PNG originals -> progressive JPGs, mp4 re-encode
tools/verify.mjs      Playwright: scroll screenshots at 1440 + 390, console/404/overflow checks, menu + FAQ
```

## Images

imagegen (gpt-image-2, ChatGPT lane), one warm editorial style prompt across all ten stills: hero booth, four portrait service shots, story, two finished cars, paint-mixing still life, wide shop. grokgen image-to-video animates the exact hero still for the reel. Read back and verified before shipping.

The business, people, numbers, and reviews are fictional placeholders for a demo.
