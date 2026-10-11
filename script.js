/* === JUKEBOX.EXE (Spotify) === */
(function () {
    const PLAYLISTS = {
        '70s': 'https://open.spotify.com/playlist/5KmBulox9POMt9hOt3VV1x',
        '80s': 'https://open.spotify.com/playlist/37i9dQZF1DXb57FjYWz00c'
    };

    const vinyl     = document.getElementById('vinyl');
    const playBtn   = document.getElementById('dj-play');
    const rewindBtn = document.getElementById('dj-rewind');
    const nextBtn   = document.getElementById('dj-next');
    const listEl    = document.getElementById('tracklist');
    const eraBtns   = document.querySelectorAll('.era-btn');
    const host      = document.getElementById('yt-player');   // the <div> the player replaces
    if (!vinyl || !playBtn || !rewindBtn || !nextBtn || !host) return;

    let controller = null;
    let currentEra = '70s';
    let positionMs = 0;


    if (listEl) listEl.hidden = true;
    nextBtn.disabled = true;
    nextBtn.title = 'Use the skip buttons inside the player';

    // accept a full link or a spotify: URI
    function toUri(s) {
        const m = String(s).match(/playlist[\/:]([A-Za-z0-9]+)/);
        return m ? 'spotify:playlist:' + m[1] : null;
    }

    // Spotify calls this global once iframe API has loaded
    window.onSpotifyIframeApiReady = function (IFrameAPI) {
        const uri = toUri(PLAYLISTS[currentEra]);
        if (!uri) {
            console.warn('Jukebox: add your Spotify playlist links at the top of the script.');
            return;
        }

        IFrameAPI.createController(
            host,
            { uri: uri, width: '100%', height: '100%' },
            function (c) {
                controller = c;

                c.addListener('ready', function () {
                    playBtn.disabled = false;
                    rewindBtn.disabled = false;
                });

                c.addListener('playback_update', function (e) {
                    const d = e.data || {};
                    positionMs = d.position || 0;
                    const playing = !d.isPaused;
                    vinyl.classList.toggle('playing', playing);
                    playBtn.textContent = playing ? 'PAUSE' : 'PLAY';
                });
            }
        );
    };

    // Fun Stuff X button pauses music
    window.jukebox = {
        pause: function () { if (controller) controller.pause(); }
    };

    // ---------- controls ----------

    playBtn.addEventListener('click', function () {
        if (controller) controller.togglePlay();
    });

    rewindBtn.addEventListener('click', function () {
        if (controller) controller.seek(Math.max(0, positionMs / 1000 - 10));
    });

    eraBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!controller) return;
            const uri = toUri(PLAYLISTS[btn.dataset.era]);
            if (!uri) return;
            currentEra = btn.dataset.era;
            eraBtns.forEach(function (b) {
                b.setAttribute('aria-pressed', String(b === btn));
            });
            controller.loadUri(uri);
            vinyl.classList.remove('playing');
            playBtn.textContent = 'PLAY';
        });
    });

    // Load Spotify's API last
    const tag = document.createElement('script');
    tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
    tag.async = true;
    document.body.appendChild(tag);
})();