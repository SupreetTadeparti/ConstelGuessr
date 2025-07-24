import { createSignal } from "solid-js";
import Background from "./components/Background";
import AudioPlayer from "./components/AudioPlayer";
import spaceBgMusic from "./assets/spacebg.mp3";
import TitlePage from "./components/TitlePage";
import MainPage from "./components/MainPage";
import "./App.css";

function App() {
  const [page, setPage] = createSignal("title");

  return (
    <div className="container">
      <AudioPlayer audioSrc={spaceBgMusic} />
      <div className={`background-image ${page() === "main" ? "active" : ""}`}>
        <Background />
      </div>
      {page() === "title" ? <TitlePage setPage={setPage} /> : <MainPage />}
    </div>
  );
}

export default App;
