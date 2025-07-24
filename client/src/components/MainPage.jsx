import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import PredictionDisplay from "./PredictionDisplay";
import ConstellationCanvas from "./ConstellationCanvas";
import { predictConstellation } from "../utils/api";
import "./MainPage.css";

function MainPage() {
  const [points, setPoints] = createStore([]);
  const [connections, setConnections] = createStore([]);
  const [activeStar, setActiveStar] = createSignal(-1);
  const [prediction, setPrediction] = createSignal("");

  async function handlePredict() {
    const result = await predictConstellation(points, connections);
    setPrediction(result);
  }

  function handleClear() {
    setPoints([]);
    setConnections([]);
    setPrediction("");
    setActiveStar(-1);
  }

  return (
    <>
      <div className="heading">Draw Constellation:</div>
      <ConstellationCanvas
        points={points}
        setPoints={setPoints}
        connections={connections}
        setConnections={setConnections}
        activeStar={activeStar}
        setActiveStar={setActiveStar}
      />
      <div className="btns-container">
        <button className="btn clear-btn" onClick={handleClear}>
          Clear
        </button>
        <button className="btn submit-btn" onClick={handlePredict}>
          Predict
        </button>
      </div>
      <PredictionDisplay prediction={prediction()} />
    </>
  );
}

export default MainPage;
