import { createSignal, onMount } from "solid-js";
import Background from "./components/Background";
import AudioPlayer from "./components/AudioPlayer";
import TitlePage from "./components/TitlePage";
import MainPage from "./components/MainPage";
import "./App.css";

/*
 ------------------------
 APPLICATION
 ------------------------

 Highest-level component that manages the application state and renders the appropriate page
 Contains the AUDIO PLAYER and BACKGROUND
  Responsible for PAGE ROUTING (Immitation)
 */
function App() {
  const [page, setPage] = createSignal("title");

  return (
    <div className="container">
      <AudioPlayer />
      <div className={`background-image ${page() === "main" ? "active" : ""}`}>
        <Background />
      </div>
      {page() === "title" ? <TitlePage setPage={setPage} /> : <MainPage />}
    </div>
  );
}

export default App;
