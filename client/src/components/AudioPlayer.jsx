import { createSignal, onMount, onCleanup } from "solid-js";
import "./AudioPlayer.css";
import playImg from "../assets/play.svg";
import pauseImg from "../assets/pause.svg";
import nextImg from "../assets/next.svg";
import bgMusic1 from "../assets/bgmusic1.mp3";
import bgMusic2 from "../assets/bgmusic2.mp3";
import bgMusic3 from "../assets/bgmusic3.mp3";
import bgMusic4 from "../assets/bgmusic4.mp3";

// Fisher-Yates shuffle
function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function AudioPlayer() {
  const [isPlaying, setIsPlaying] = createSignal(true);
  const [volume, setVolume] = createSignal(1);
  const [trackIndex, setTrackIndex] = createSignal(0);
  let audioRef;

  // Derived state for current audio source
  const currAudioSrc = () => shuffledList()[trackIndex()];
 
  // Shuffles the background music list
  const bgMusicList = [bgMusic1, bgMusic2, bgMusic3, bgMusic4];
  const [shuffledList] = createSignal(shuffle(bgMusicList));

  onMount(() => {
    // Set initial state since autoplay may be disabled (and mutes volume)
    if (audioRef) {
      setIsPlaying(!audioRef.paused);
    }
  });

  function togglePlay() {
    if (isPlaying()) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.play();
      setIsPlaying(true);
    }
  }

  function handleVolume(e) {
    const v = e.target.value;
    setVolume(v);
    audioRef.volume = v;
  }

  function nextTrack() {
    let next = (trackIndex() + 1) % shuffledList().length;
    setTrackIndex(next);

    // Change src and play
    audioRef.src = shuffledList()[next];
    audioRef.currentTime = 0;
    audioRef.play();
    
    setIsPlaying(true);
  }

  onCleanup(() => {
    if (audioRef) audioRef.pause();
  });

  return (
    <div className="audio-controls">
      <audio
        ref={audioRef}
        src={currAudioSrc()}
        loop={true}
        autoPlay={true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button className="audio-btn" onClick={togglePlay}>
        <img src={isPlaying() ? pauseImg : playImg} alt="toggle play" />
      </button>
      <button className="audio-btn" onClick={nextTrack}>
        <img src={nextImg} alt="next track" />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume()}
        onInput={handleVolume}
        className="audio-slider"
      />
    </div>
  );
}

export default AudioPlayer;
