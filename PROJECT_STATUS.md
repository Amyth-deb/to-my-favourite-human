# Project Status

**Stage:** Command 08, Final personal touch & launch preparation
**Date:** 20 November 2026
**State:** Ready to publish once the YouTube link is added (see "Remaining manual steps").

Only results that were actually executed are listed here.

## Flow
`index.html` → `apology.html` → `birthday.html` → `story.html` → `letter.html` → `fanclub.html` → `cake.html` → `song.html` (page 08 of 8, the last page)

## Completed in this stage
| Area | Change |
|---|---|
| `song.html` | Voice note section removed. Added "Two keepsakes" (magazine + photo album) and the written moment "Things I Can’t Put Into Words" (exact approved text). Tab title changed from "A Song And A Voice" to "A Song For You". |
| `song.html` closing | Now just the hibiscus and "Happy birthday, Marisha." The old line "No matter where life takes us, you’ll always be family." was removed from the closing because it is now the last sentence of the written moment (it would have appeared twice). |
| `js/song-config.js` | Song settings kept. Placeholder lines are now clearly marked `PLACEHOLDER`, with instructions. Accepts a full link, a short link, or the 11-character ID. |
| `js/song.js` | Voice note player code removed. When no valid video is configured, the placeholder title ("Song title goes here") is now hidden so it can never be seen by mistake. A console note explains the placeholder. |
| `css/song.css` | Voice note styles removed; keepsake card and written-moment styles added (existing ivory, cream, cherry and burgundy tokens only; no new colours, libraries or animations). |
| `assets/pdf/` | New. One copy each of the two PDFs, byte-identical to the originals. |
| `assets/audio/` | Removed (it only held `.gitkeep` for the voice note). |
| `README.md`, `PROJECT_STATUS.md` | Rewritten for YouTube setup, PDFs and GitHub Pages deployment. |
| Unchanged | `index`, `apology`, `birthday`, `story`, `letter`, `fanclub`, `cake` pages, `style.css`, `pages.css`, `cake.css`, `main.js`, `gift.js`, `fanclub.js`, `cake.js`, `hibiscus.svg`. |

## Finding: the PDFs were not linked before this stage
Before this stage no page referenced either PDF and the ZIP did not contain them, so there was nothing to "verify". They are now integrated on page 08 as described above. Nothing was recreated or re-exported.

## Tests executed (Chromium via Playwright, local HTTP server): 159 of 159 passed
- **Links and assets:** every local `href`/`src` in all 8 pages resolves to an existing file; no 404 responses; no JavaScript errors on any page.
- **Layout:** no horizontal overflow on any of the 8 pages at 320, 390 and 1440 px wide.
- **Written moment:** title and all three paragraphs match the approved text exactly. No voice-note text, no `<audio>` element.
- **PDFs:** both files are served (HTTP 200), begin with the `%PDF-` header and are byte-identical (SHA-256) to the uploaded originals. Each Read/Open link has `target="_blank"` and `rel="noopener"`; clicking it opens a new tab and requests the right file. Each Download link triggers a real download with the correct filename. Tap targets are at least 44 px.
- **YouTube:** placeholder state shows no iframe and no YouTube request. With a test ID injected through a network override: a bare ID, a `watch?v=` link and a `youtu.be` link all produce a `youtube-nocookie.com` iframe with no autoplay parameter, a 16:9 frame that fits a 390 px screen, and a working fallback link. An invalid value and a syntactically broken config file both fall back to the placeholder with the rest of the page intact.
- **Cake:** start, countdown, skip, tap to blow and the final button to `song.html` all work; the countdown also finishes by itself (fake clock).
- **Microphone:** a denied permission gives the friendly message and tapping still works; a granted (simulated) stream is listened to, and its tracks are stopped on cancel and when the candles are blown out by tap.
- **Also checked:** no-JavaScript view of `song.html` (written moment and both PDF links visible); reduced-motion (closing visible immediately). Screenshots of the song page at 390 px reviewed.

## Known limitations
- **No real YouTube video was loaded** (the sandbox is offline). The test verified the iframe the page builds, not that YouTube plays your chosen song. Check after adding the link, online.
- **Real PDF rendering in a browser was not tested.** Headless Chromium downloads PDFs rather than displaying them, so "opens in a new tab" was verified at link/request level. Test both buttons on a real phone and computer after deploying.
- **Mobile PDF behaviour varies:** many Android browsers download instead of displaying; the page explains this.
- **The album is 74 MB.** GitHub's website upload limit is 25 MB per file, so the site must be pushed with Git or GitHub Desktop (see README). It will also be slow on mobile data.
- **The album cover says 329 photographs** (86 pages), not 400+. Left untouched, as instructed.
- **The microphone was tested with a simulated stream**, not a real breath on a real phone.
- Chromium only. Safari, Firefox and real phones are untested. Google Fonts could not load offline, so fonts were checked only as fallbacks; look at typography online.
- Without JavaScript the song shows the placeholder (the ID is read by script).
- The title uses a curly apostrophe ("Can’t") to match the rest of the site’s typography.

## Content flag for you (not changed)
The magazine PDF is warmer and more personal than the website’s careful tone: "My sister. My HG.", "The sun of my life.", "1 sun — and she’s mine", "I love you, Marisha." The site elsewhere says friend and family, and the new written moment says you’re glad your paths crossed. "She’s mine" and "sun of my life" could be read as romantic or possessive. I did not alter or recreate the PDF as instructed. Consider whether the magazine matches how you want this gift to be read, and if not, regenerate it and overwrite `assets/pdf/Marisha_The_Sun_Issue.pdf`. Also minor: magazine page 18 has no caption, and the page number on page 22 is partly cut off.

## Remaining manual steps
1. **Add the YouTube link** in `js/song-config.js` (replace both PLACEHOLDER lines).
2. Push the project with Git or GitHub Desktop (not the website uploader) and enable GitHub Pages (README, "Deploying on GitHub Pages").
3. On the live site, on a phone and a computer: play the song, open and download both PDFs, run the cake flow once including the microphone option.
