# To My Favourite Human

A personal birthday website for Marisha (21 November 2026). Plain HTML, CSS, vanilla JavaScript and SVG. No build step, no dependencies, ready for GitHub Pages.

## Run locally

From the project folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly in a browser also works.

## Directory structure

```
to-my-favourite-human/
├── index.html                      Page 01: gift opening
├── apology.html                    Page 02: the apology
├── birthday.html                   Page 03: welcome
├── story.html                      Page 04: the friendship story
├── letter.html                     Page 05: the letter
├── fanclub.html                    Page 06: the Marisha Fan Club
├── cake.html                       Page 07: the birthday cake
├── song.html                       Page 08: the song, two keepsakes, a written moment
├── css/
│   ├── style.css                   Design tokens, base styles, shared button
│   ├── pages.css                   Page-specific styles
│   ├── cake.css                    Cake page styles
│   ├── music.css                   Floating music control
│   └── song.css                    Song page styles
├── js/
│   ├── main.js                     Shared behaviour
│   ├── gift.js                     Gift-opening interaction
│   ├── fanclub.js                  Fan club "apply" reveal
│   ├── cake.js                     Countdown, tap to blow, optional microphone
│   ├── song-config.js              YOUR SETTINGS for the song (edit this one)
│   ├── song.js                     YouTube embed on the Song page (no need to edit)
│   └── music.js                    Website-wide background music + floating control (no need to edit)
├── assets/
│   ├── pdf/
│   │   ├── Marisha_The_Sun_Issue.pdf   Magazine, The Hibiscus Issue (35 pages, about 20 MB)
│   │   └── Cinematic_Photo_Album.pdf   Photo album (86 pages, about 74 MB)
│   ├── illustrations/
│   │   └── hibiscus.svg            Recurring line-art hibiscus (also the favicon)
│   ├── fonts/                      Reserved for self-hosted fonts (empty)
│   └── images/                     Reserved (empty)
├── README.md
└── PROJECT_STATUS.md               Work log, QA results and remaining steps
```

## Notes

- Fonts (Cormorant Garamond, Hanken Grotesk) load from Google Fonts, with serif and sans-serif fallbacks.
- Flow: index → apology → birthday → story → letter → fanclub → cake → song. The cake page's final button links to `song.html`. The song page is the last page, so its indicator reads 8 / 8.
- Cake page microphone option: optional, started only by a button click. Audio is analysed in memory and never recorded, stored or sent. It needs HTTPS or localhost (GitHub Pages is HTTPS). Tap to blow always works without it.
- Deploying: push the folder contents to a GitHub repository and enable GitHub Pages for the main branch.

## The song (YouTube)

The song is already set in `js/song-config.js` (`youtubeVideoId: "Shz9iLeE6i4"`, from `https://www.youtube.com/watch?v=Shz9iLeE6i4`). To change it, replace that value with a full link, a `youtu.be` link or the 11-character ID (keep the quotation marks and comma). `songTitle` is optional: type a title to show it under the player, or leave `""` to show none.

The video never autoplays, uses youtube-nocookie.com, resizes to the screen width (16:9), and an "Open the song on YouTube" link appears under it. If the ID is emptied or invalid, the page shows a calm placeholder instead and the music control is hidden.

Notes:
- The video must allow embedding. If YouTube shows an "unavailable" message in the player, choose another upload; the link under the player still works.
- YouTube embeds do not work when a page is opened as a file (`file://`). Use `python3 -m http.server 8000` locally, or GitHub Pages.
- Only the video ID is used from the link you were given; the playlist/radio part (`list=...`) is ignored.

## Background music (the same YouTube song, on every page)

The song set in `js/song-config.js` is also the website's background music. Nothing extra to configure: the one link in `js/song-config.js` drives both the Song page player and the music control use it.

- A small floating control (bottom right) has **Play/Pause** and **Mute/Unmute**. Default volume is 25%.
- Music starts only after the visitor's **first tap or click** on any page (browsers forbid sound before that). If she pauses it, it stays paused on every page until she presses Play.
- Optional settings in `js/song-config.js`: `musicVolume` (0 to 100, default 25) and `startMusicOnFirstTap` (`false` = start only when she presses Play on the control).
- If `youtubeVideoId` is empty or invalid, or YouTube cannot be loaded, the control is not shown and nothing is requested.
- On the Song page the visible embedded player is the one player (no second copy), and the control controls it.
- The cake page's microphone option pauses the music while it listens (so the music isn't mistaken for a blow), then resumes it.

**Honest limitation: navigation is not seamless.** This is a plain multi-page site, so every link loads a new page and the browser destroys the player. The controller saves the position (per browser tab) and starts a fresh player on the next page, which gives a gap of roughly 1 to 3 seconds and a restart a couple of seconds after the saved position. Whether the resume starts by itself depends on the browser's autoplay rules; if it is blocked, the control shows Play and her next tap resumes it. Truly gapless music would need the whole site rebuilt as a single-page app (page content swapped in place); that was deliberately not done, to avoid risking the finished pages.

**YouTube policy note.** On pages other than the Song page the player is a 1-pixel, non-interactive embedded player (audio plays, video is not seen). YouTube's embedded-player policies expect players to be visible, so this is a grey area; it is the usual way to do background music but is your call. The music is streamed from YouTube; no audio is downloaded or stored.

## The magazine and photo album (PDFs)

Both live in `assets/pdf/` and are linked from page 08 ("Two keepsakes"):

| File | What it is | Size |
|---|---|---|
| `assets/pdf/Marisha_The_Sun_Issue.pdf` | The magazine (The Hibiscus Issue), 35 pages | 19.7 MB |
| `assets/pdf/Cinematic_Photo_Album.pdf` | The photo album, 86 pages | 74.2 MB |

They are the original files, byte for byte (not compressed or re-exported). Each has a **Read/Open** button (opens in a new tab) and a **Download PDF** link. Filenames are case-sensitive on GitHub Pages: keep them exactly as above. To replace a PDF, overwrite the file keeping the same name.

Phones: iOS Safari opens PDFs in a viewer; many Android browsers download them instead. The page says so. The album is large, so it is best opened on Wi-Fi.

## Deploying on GitHub Pages

**Important: the album is 74 MB.** GitHub's website upload ("Add file → Upload files") refuses files over 25 MB, so use Git from a terminal or GitHub Desktop (single files up to 100 MB are allowed; GitHub only shows a size warning above 50 MB).

1. Create a new repository on GitHub (for example `to-my-favourite-human`). Public is simplest for GitHub Pages on a free account.
2. Unzip the project. In a terminal, inside the unzipped `to-my-favourite-human` folder:
   ```
   git init
   git add .
   git commit -m "Birthday website for Marisha"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/to-my-favourite-human.git
   git push -u origin main
   ```
   (GitHub Desktop works too: add the folder as a repository and publish it.)
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.**
4. After a minute or two the site is at `https://YOUR-USERNAME.github.io/to-my-favourite-human/`. Open `index.html`'s address (the root address) first; that starts the flow.
5. Open the live site on a phone and a computer. Add the YouTube link first (see above), push again, and test the song, both PDFs and the cake.

All paths are relative, so the site works from a project sub-folder like the address above. To update later: edit, then `git add .`, `git commit -m "Update"`, `git push`. GitHub Pages can take a minute to refresh; a hard reload clears the old copy.
