# Handover — metaneoacademy.com

Internal notes. Excluded from the GitHub Pages deploy (see `.github/workflows/static.yml`),
so this file is **not** served at metaneoacademy.com. Keep it that way.

Branch: `claude/tender-davinci-9kCQN` · 11 commits ahead of `c31340f` · 25 files changed.
Last verified: all 10 pages at 375 / 768 / 1440 px and at device pixel ratio 1 and 2.

---

## Part 1 — Casey's list

Things only Casey can do. Roughly in order of how much they cost if left.

### 1. The free guide advertises a product that does not exist — LIVE NOW

Page 22 of `social-media-monetisation-2026.pdf`, the final page, item 4 under
**"4 · THE FULL SYSTEM"**, sitting directly above the buy button:

> **The Social Media Funnel Playbook**
> The step-by-step guide to building your landing pages, your offer and the automated
> emails that turn leads into sales.

It is the only title in the PDF that is not a Meta Neo product. Every person who downloads
the guide reads about it and cannot buy it.

Three ways out: build it, cut item 4, or rename it to something that exists. All three need
the source file the PDF was designed in — the text cannot be edited cleanly in the PDF
itself without covering the original type and redrawing it in the embedded font.

### 2. Re-upload the three bookmarked ebooks to Whop

Delivered in chat as `The Algorithm Decoded.pdf`, `The Social Media Game Strategy.pdf`,
`The Content Engine Playbook.pdf`. Same pages, same text, same printed page numbers, 0.2–0.6%
larger. They add a clickable contents page and a bookmark sidebar.

**These three must never be committed to this repo.** It deploys publicly, so committing
them would hand out £19.99 products free. Only the free guide belongs here.

### 3. "PDF + ePub": resolved

Casey confirmed the books are delivered as PDFs only. "+ ePub" has been removed from
`book.html`, `book-game-strategy.html` and `book-content-engine.html`, so the three book pages
now agree with `index.html:684` and `:791` ("They are PDFs").

If an ePub edition is ever added on Whop, change the format line on all three book pages and
both `index.html` lines together.

### 4. The Pilates studio results — permission and evidence

`The Algorithm Decoded` p4 is a real client, anonymised to "Ella":

| Figure | Value |
|---|---|
| Followers | 935 → 3,362 (**3.6×**) |
| Best reel vs first | 445 → 5,617 views (**12×**) |
| Plus | "Verified badge along the way" |

Attributed to Casey's intervention ("we helped them"), evidenced as "real screenshots"
(not reproduced), with **no** "results not typical" caveat anywhere in the book.

**None of this is on the site, and that is the right call.** Before any of it goes public —
site, ads, or social — you need the studio's written permission and the screenshots on file.
The verified badge I would never repeat: platform verification is not in your gift, so
presenting it as an outcome of the method is an implied guarantee.

### 5. Standing items from before this session

- **Business service address.** `policies.html` has no geographic address (confirmed: a regex
  sweep of every page finds none). A trading address is expected for a UK consumer-facing
  seller. £30–60/year for a service address — do not use the home address.
- **Whop success redirect** → should pass an order reference so `order-confirmation.html`
  can attribute purchases.
- **Mailchimp** → still needs paying for before the list goes live.
- **`hello@metaneoacademy.com`** → mailbox not live, but the address is published in
  `policies.html` and in the Organization schema.
- **Whop checkout consent** → confirm it captures consent to immediate supply, which is what
  makes the no-refund position stand up under the CCR 2013.
- **Email retention period** → `policies.html` needs a definite figure.

---

## Part 2 — What was done, and what it fixed

### Defects found and fixed

**Fabricated quotations — three of them.** Each was in quote marks with a
`— FROM [BOOK]` attribution, and none appeared in the book.

| Where | What it claimed | Reality |
|---|---|---|
| `ebooks.html`, `book.html` | *"The algorithm is not your enemy. It is a machine with a single job…"* | "enemy", "single job", "most likely to watch" appear nowhere in 22 pages |
| `ebooks.html`, `book-game-strategy.html` | *"Social media is one giant game. The secret to winning it is…"* | two real sentences from p3 fused into one invented one |

Both replaced with verbatim lines from the books. **This is the failure mode to watch on this
site**: plausible-sounding copy in quote marks that nobody checked against the source.

**Factual claims that were wrong:**

- *"Each guide is four chapters"* (4 places, incl. FAQ schema) → they are 16, 12 and 11 sections.
- *"The 7 People in the Game"* then listed **six**. The missing player is *you*.
- *"Learn which to focus on, and exactly when to switch"* → the book's rule is one game per
  account, two accounts if you want both. There is no switching trigger in 21 pages.
- *"The only four things that make the app show your post"* → p18 files the 4 Horsemen as half
  the cake, not all of it.
- *"What Doesn't Matter"* is not a chapter. It is *The Cake and the Icing*, and it does not
  mention caption **length** — it says rewording a caption will not save a weak video.
- Game Strategy entries **07 and 08 were inverted** against the printed contents.
- *"a hair salon, a Pilates studio, a bookkeeper and an online coach"* credited to the three
  paid guides — the online coach (Sam) is only in the **free** guide.
- *"One video to £480/month worked example"* as a chapter name. The book introduces Priya in a
  box headed "OUR EXAMPLE ALL THE WAY THROUGH" and opens the section *"These are example
  numbers… Your numbers will be different."* None of that context survives on a sales page.
  Renamed to the book's own heading, *"One video, all the way to money"*.

**Layout and code:**

- **No mobile menu existed.** `signal.css` carried a `.burger` rule explicitly set to
  `display:none`, and no page had the markup, so the nav links wrapped into the hero. Built an
  off-canvas panel in `signal.js` from each page's own `.nav-links` — one implementation, all
  10 pages, no duplicated markup.
- **Cover frames gapped.** `max-height` + `object-fit:contain` left the bordered box a
  different shape from the artwork, up to 32.6% off at 768px. thank-you.html was worse: the
  thumbnails were squeezed to 16px wide and cropped to a sliver.
- **Retina covers were soft.** srcsets offered nothing above 320w. The source files were
  already the right size on disk — nothing needed re-exporting, the markup was just not
  offering them.
- **Horizontal scroll on every page** from the closed menu (fixed-position, translated
  off-canvas; `body{overflow-x:hidden}` cannot clip a fixed element). Also a pre-existing 8px
  overflow on the three book pages from a cover glow with a 5% bleed against a 28px gutter.
- **`thank-you.html` threw a TypeError on every load** — a listener bound to
  `getElementById('skipBtn')`, an id that exists nowhere.
- **`thank-you.html` said "Your guide is on its way"** directly above two live download
  buttons, contradicting three other lines on the same page.
- **Steps 02 and 03 were the same instruction.** Merged, and the freed step now carries a
  tie-break rule — see "known inconsistency" below.

### Things built

- **`404.html`** — GitHub Pages serves it for any unknown path; previously showed GitHub's
  default with no way back. noindex, not in sitemap.
- **`prices.json` + `sync-prices.js`** — every price on the site (~80 strings, including
  JSON-LD offers and two analytics value maps) now derives from one file. The deploy workflow
  runs the sync, so editing `prices.json` alone is enough. Round-tripping £44.99 → £39.99 →
  £44.99 returns every file byte-identical.
- **Navigable PDFs** — clickable contents page and bookmark outline in all four books.
  Verified every destination against the page number printed beside it.
- **Free guide cover regenerated** from the current PDF's page 1 (the site still had the old
  lightbulb artwork), plus the OG share card.

### Checked and deliberately left alone

- The watches / listens / reads wording **is** the book's own — p7 diagram, restated p6 and p22.
- "roughly 200" is hedged in the book every time ("about", "~", *"a rough guide, not exact
  rules"*). Do not tighten it to a bare 200.
- The fisherman quote is word for word.
- The p19 "maths of leaving your 9-5" (£4,000/month, 40 buyers) is echoed **nowhere** on the
  site. Keep it that way, including in ad copy.
- `policies.html` already carries an earnings disclaimer.
- The `ebooks.html` chapter lists are Casey's shortened marketing labels, not the books'
  printed names. That is intentional and fine.

---

## Part 3 — What a new session needs to know

**Repo.** Static site, GitHub Pages, deploys from `main` via `.github/workflows/static.yml`,
which uploads the whole repo. Anything committed is public.

**Prices.** Never hand-edit a price. Edit `prices.json`, run `node sync-prices.js`, commit.
`node sync-prices.js --check` fails if anything drifted.

**Design system.** `signal.css`. Amber is reserved for purchase actions only — cyan is
informational. Archivo + JetBrains Mono.

**Recurring bug class.** CSS using `img:nth-child()` while the markup wraps images in
`<picture>` — the `<source>` becomes the first child and the selector silently targets the
wrong element. This has broken the covers three separate times. Put layout rules on the
`picture`, not the `img`.

**Measuring covers.** `getBoundingClientRect()` on a rotated element returns the *rotated*
bounding box and will look stretched when nothing is wrong. Use `offsetWidth`/`offsetHeight`.
True ratios: the three Series covers are 0.6264, the free guide cover is 0.7072.

**House style.** No em-dashes as a stylistic tic. No aphoristic one-line filler. British
spelling. No invented product content, statistics or testimonials — if it is in quote marks,
it must be verbatim from the source.

**Known inconsistency between the two free PDFs.** The guide picks your gap by *most empty
boxes* (p20); the 3 Gap Diagnostic picks the *lowest-numbered gap* (p5). Those can send the
same person to different £19.99 books. `thank-you.html` step 03 now states a precedence rule.
Fixing it properly means editing one of the PDFs.

**Verification harness** (scratchpad, recreate as needed): Playwright scripts measuring cover
box ratios, retina sharpness, dead links, horizontal overflow, console errors, and GA4 / Meta
Pixel firing on signup and checkout. Serve the repo with `python3 -m http.server 8099`.
