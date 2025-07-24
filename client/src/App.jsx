import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";
import Background from "./components/Background";
import PredictionDisplay from "./components/PredictionDisplay";
import ConstellationCanvas from "./components/ConstellationCanvas";
import { predictConstellation } from "./utils/api";
import "./App.css";

function App() {
  const [points, setPoints] = createStore([]);
  const [connections, setConnections] = createStore([]);
  const [prediction, setPrediction] = createSignal("");

  async function handlePredict() {
    const result = await predictConstellation(points, connections);
    setPrediction(result);
  }

  function handleClear() {
    setPoints([]);
    setConnections([]);
    setPrediction("");
  }

  return (
    <div className="container">
      <div className="background-image">
        <Background />
      </div>
      <div className="heading">Draw Constellation:</div>
      <ConstellationCanvas
        points={points}
        setPoints={setPoints}
        connections={connections}
        setConnections={setConnections}
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
    </div>
  );
}

export default App;
