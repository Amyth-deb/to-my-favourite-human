# Project Status

**Stage:** Command 10, Magazine replaced and song set (on top of Commands 08 and 09)
**Date:** 20 November 2026
**State:** Ready to publish. Test on real devices first (see "Remaining manual steps").

Only results that were actually executed are listed here.

## Command 10: magazine replaced, song set
- `assets/pdf/Marisha_The_Sun_Issue.pdf` is now the new magazine ("MARISHA — The Hibiscus Issue", 35 pages, 19,684,544 bytes). Same filename, so all links work; the old file was overwritten, not kept. No other copy of the old magazine is in the project.
- `song.html`: the magazine card now reads "Marisha: The Hibiscus Issue · 35 pages · 20 MB" (and the matching accessible labels). Open/Read and Download links are unchanged. The Download link still saves the file as `Marisha_The_Sun_Issue.pdf` (the filename you asked to keep), although the magazine is titled "Hibiscus Issue".
- `Cinematic_Photo_Album.pdf`: untouched (byte-identical).
- `js/song-config.js`: `youtubeVideoId` set to `Shz9iLeE6i4` (from your link; the `list=RD...` radio part is ignored). `songTitle` is now `""` (I don't know the song's title; add it if you want it shown).
- `js/song.js`: small supporting change: an empty song title now hides the title line (previously a blank title would have shown the words "Song title goes here" under the real video).
- `README.md`: song and magazine sections updated. All other pages, styles and scripts unchanged.

### Tests (Chromium, local server)
- New-magazine checks (14): served file is byte-identical to the new upload and differs from the old one; opens as a new tab link with `noopener`; Download saves a file with the right name and identical bytes; card text correct; album identical and still downloads; real config builds an iframe for `Shz9iLeE6i4` with no autoplay or playlist parameter, correct fallback link, no placeholder text; no JavaScript errors. 13 passed; the one failure was my own test being case-sensitive about text the CSS shows in capitals, and the page text is correct.
- Regression with song placeholder state: 182 of 182 passed. Background-music suite (fake YouTube API): 200 of 200 passed.
- Still not tested: real YouTube playback of this video (sandbox offline), real-browser PDF viewing, real phones.

## Content notes
- The new magazine drops the earlier "she's mine" and "I love you" wording (now "1 sister, one of a kind" and "your biggest fan"). It still says "the sun of my life" in the editor's letter and "My sister. My HG."; the site elsewhere says friend and family. Your call.
- Magazine page 18 still has no caption.

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
1. (Done) YouTube song set in `js/song-config.js`; it drives both the Song page player and the website-wide music. Optionally add `songTitle`.
2. Push the project with Git or GitHub Desktop (not the website uploader) and enable GitHub Pages (README, "Deploying on GitHub Pages").
3. On the live site, on a phone and a computer: play the song, open and download both PDFs, run the cake flow once including the microphone option.

## Command 09: background music
| File | Change |
|---|---|
| `js/music.js` | New. Shared controller loaded on all 8 pages: loads the YouTube IFrame API only after the first tap/click, one player per page, saves state (playing/paused, muted, position) in `sessionStorage`, resumes on the next page, loops, handles errors. |
| `css/music.css` | New. Floating pill control (ivory, burgundy, cherry; 44 px buttons; safe-area aware) and the 1 px player host. |
| All 8 `.html` pages | Added the `music.css` link and the `song-config.js` + `music.js` scripts. Nothing else changed (no text, order, PDFs or illustrations). |
| `js/song.js` | The Song page embed now has `enablejsapi=1` (plus `origin` over http/https) and `allow="autoplay; ..."` so the controller can drive that same player. Still no autoplay parameter. The embed is no longer `loading="lazy"` so the controller can attach. |
| `js/cake.js` | Two tiny additions: emits a `marisha:mic` event when the microphone starts/stops listening so the music pauses meanwhile. Countdown, skip, tap-to-blow and mic logic unchanged. |
| `js/song-config.js` | Added `musicVolume` (25) and `startMusicOnFirstTap` (true). Video ID and title lines unchanged (still PLACEHOLDER). |
| `README.md` | New "Background music" section. |

### Architecture decision
A shared player that survives navigation is impossible on a plain multi-page site (each page load destroys the iframe). Chosen: **resume-per-page** (non-destructive, small). Rejected for now: turning the site into a single-page app (gapless, but re-initialises the cake/mic/gift/fan-club scripts on every move and risks regressions). Expect a gap of about 1 to 3 seconds when changing page.

### Tests executed (Chromium via Playwright, local server, **fake YouTube IFrame API**): 200 of 200 passed; earlier regression suite 182 of 182 passed
- **No/invalid config** (all 8 pages): no control, no errors, zero requests to YouTube.
- **Valid config, all 8 pages, at 320, 390 and 1440 px:** control visible and inside the viewport, buttons at least 44 px, no horizontal overflow, no errors; before any tap there is no player, no API request and no play call.
- **First tap anywhere** starts playback with exactly one player; volume 25; a second tap creates nothing; mute/unmute; pause; after an explicit pause, tapping the page does not restart it; Play resumes.
- **Navigation through real links** apology to birthday, story, letter, fan club, cake, song: control present each time, music resumed, one iframe, resumed near the saved position (not from 0), mute and volume carried over.
- **Autoplay blocked on the next page (simulated):** control honestly shows Play; the next tap resumes. Reload resumes.
- **Cake:** microphone listening pauses the music; cancelling, or blowing out by tap, resumes it.
- **Song page:** the existing embed is the only player (reused, not duplicated); pausing inside the embed updates the control and is respected; end of video loops; placeholder and fallback link still work.
- **YouTube API blocked:** control removed, page intact. `startMusicOnFirstTap:false` and `musicVolume:40` honoured. Keyboard (Enter/Space) and reduced motion work.

### Limitations (new)
- **No real YouTube playback was tested** (sandbox is offline; a fake API replaced YouTube). Real autoplay rules, real audio, the 1 px hidden player's behaviour, and whether the resume succeeds without a tap on iOS Safari, Firefox and Chrome are untested. Test on real phones once the song ID is added.
- Navigation has an audible gap; position resumes approximately (saved once a second, plus up to 3 s of gap compensation).
- State is kept per browser tab (`sessionStorage`). A new tab or a closed-and-reopened tab starts fresh, needing a new first tap.
- Changing volume inside the Song page's embed is not remembered on other pages (they use `musicVolume`).
- Embedding can be blocked by the video owner; the control is then removed.
- The hidden 1 px player on non-Song pages is a grey area in YouTube's embedded-player policy (see README).
- The song itself is still the placeholder until you add the link.
