import { createSignal, onMount, onCleanup } from "solid-js";
import "./AudioPlayer.css";
import playImg from "../assets/play.svg";
import pauseImg from "../assets/pause.svg";

function AudioPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = createSignal(true);
  const [volume, setVolume] = createSignal(1);
  let audioRef;

  onMount(() => {
    // Set initial state since autoplay may be disabled
    if (audioRef) {
      setIsPlaying(!audioRef.paused);
    }
  });

  // Play/pause effect
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

  // Auto play on mount
  onCleanup(() => {
    if (audioRef) audioRef.pause();
  });

  return (
    <div className="audio-controls">
      <audio
        ref={audioRef}
        src={audioSrc}
        loop={true}
        autoPlay={true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button className="audio-btn" onClick={togglePlay}>
        <img src={isPlaying() ? pauseImg : playImg} alt="toggle play" />
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
