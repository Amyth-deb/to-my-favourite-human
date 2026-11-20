/*
  SONG PAGE SETTINGS  (the only file you need to edit for the song)

  The song is set below. If youtubeVideoId is ever emptied, the page shows
  "The song will appear here." and makes no request to YouTube.

  1. youtubeVideoId   <-- the YouTube link or ID of the song
     Either of these works:
       a full link:   "https://www.youtube.com/watch?v=AbCdEfGhIjK"
       a short link:  "https://youtu.be/AbCdEfGhIjK"
       the ID alone:  "AbCdEfGhIjK"      (the 11 characters after "v=" or after the last "/")
     Leave it as "" to keep showing the placeholder.

  2. songTitle
     Optional. The title shown under the player. Leave as "" to show no title line.

  Keep the quotation marks and the comma at the end of the first line.
  3. Background music (the same song plays across the whole site)
     musicVolume            0 to 100. Default 25 (quiet).
     startMusicOnFirstTap   true  = the music starts when the visitor first taps or clicks anything.
                            false = it starts only when she presses Play on the small music control.
     If youtubeVideoId is empty or invalid, the music control is not shown at all.
     Music never starts before a tap or click.
*/
window.SONG_CONFIG = {
  youtubeVideoId: "Shz9iLeE6i4",           // from https://www.youtube.com/watch?v=Shz9iLeE6i4
  songTitle: "",                           // optional: type the song title here to show it under the player
  musicVolume: 25,
  startMusicOnFirstTap: true
};
