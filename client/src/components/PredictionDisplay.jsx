import { Show } from "solid-js";
import alienImg from "../assets/alien.svg";
import "./PredictionDisplay.css";
import SpeechBubble from "./SpeechBubble";
import { createSignal, onCleanup } from "solid-js";

function PredictionDisplay(props) {
  const greetings = [
    "Greetings, Earthling!",
    "Hello, human!",
    "Salutations!",
    "Ahoy there!",
    "Welcome to the cosmos!",
    "Intergalactic greetings!",
    "Hey, Earth dweller!",
    "Cosmic salutations!",
  ];

  const idleGreetings = [
    "I am just a humble AI, observing the stars.",
    "My thoughts drift among the constellations.",
    "I await your command, Earthling.",
    "I ponder the mysteries of the cosmos.",
    "I am here, ready to assist you with cosmic insights.",
    "Press the prediction button to reveal my wisdom.",
  ];

  function getRandomGreeting() {
    // 2% chance for special angry greeting
    if (Math.random() < 0.01) {
      return "You dare show me this constellation? Prepare for cosmic destruction!";
    }
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  let speechBubbleContent = (
    <>
      {getRandomGreeting()}
      <br />
      Is that &nbsp;
      <strong>{props.prediction}</strong>?
    </>
  );

  // setInterval to update the greeting every 5 seconds

  let fallbackContent = "";

  // There should be one second between each greeting change
  const [showFallback, setShowFallback] = createSignal(true);
  const [fallbackText, setFallbackText] = createSignal(
    idleGreetings[Math.floor(Math.random() * idleGreetings.length)]
  );

  let intervalId = setInterval(() => {
    setShowFallback(false);
    setTimeout(() => {
      setFallbackText(
        idleGreetings[Math.floor(Math.random() * idleGreetings.length)]
      );
      setShowFallback(true);
    }, 1000); // 1 second gap
  }, 8000); // 7s show + 1s gap

  onCleanup(() => clearInterval(intervalId));

  fallbackContent = (
    <Show when={showFallback()}>
      <SpeechBubble children={fallbackText()} />
    </Show>
  );

  return (
    <div className="prediction-display">
      <img className="alien" src={alienImg} alt="alien" />
      <div className="speech-bubble-container">
        <Show when={props.prediction.length > 0} fallback={fallbackContent}>
          <SpeechBubble children={speechBubbleContent} />
        </Show>
      </div>
    </div>
  );
}

export default PredictionDisplay;
