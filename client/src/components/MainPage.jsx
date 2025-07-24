import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import PredictionDisplay from "./PredictionDisplay";
import ConstellationCanvas from "./ConstellationCanvas";
import { predictConstellation } from "../utils/api";
import "./MainPage.css";

/*
 ------------------------
 MAIN PAGE
 ------------------------

 Page immitation for DRAWING CONSTELLATIONS and PREDICTING them
 This is the main page of the application
*/
function MainPage() {
  const [points, setPoints] = createStore([]);
  const [connections, setConnections] = createStore([]);
  const [activeStar, setActiveStar] = createSignal(-1);
  const [prediction, setPrediction] = createSignal("");

  // Sends API request to predict the constellation
  async function handlePredict() {
    const result = await predictConstellation(points, connections);
    setPrediction(result);
  }

  // Resets state
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
