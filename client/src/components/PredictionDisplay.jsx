import { Show } from "solid-js";
import alienImg from "../assets/alien.svg";
import "./PredictionDisplay.css";
import SpeechBubble from "./SpeechBubble";
import { createSignal, onCleanup } from "solid-js";

const idleGreetingDisplayTime = 7000;
const idleGreetingGapTime = 1000;

function PredictionDisplay(props) {
  const [showFallback, setShowFallback] = createSignal(true);
  const [fallbackText, setFallbackText] = createSignal("");

  // Possible greetings preceding prediction
  const greetings = [
    "I recognize this constellation!",
    "Ah, a familiar pattern in the stars!",
    "This constellation is known to me!",
    "I see a pattern in the stars!",
    "This constellation is intriguing!",
    "I have seen this constellation before!",
  ];

  // Possible greetings while waiting for user interaction
  const idleGreetings = [
    "I am just a humble AI, observing the stars.",
    "My thoughts drift among the constellations.",
    "I await your command, Earthling.",
    "I ponder the mysteries of the cosmos.",
    "I am here, ready to assist you with cosmic insights.",
    "Press the prediction button to reveal my wisdom.",
  ];

  function getRandomGreeting() {
    // 1% chance for special angry greeting
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

  /* Displays random intermittent greetings while waiting for user submission */

  // Set an interval to show fallback greetings with a delay
  let intervalId = setInterval(() => {
    setShowFallback(false);
    setTimeout(() => {
      setFallbackText(
        idleGreetings[Math.floor(Math.random() * idleGreetings.length)]
      );
      setShowFallback(true);
    }, idleGreetingGapTime); // 1 second gap
  }, idleGreetingDisplayTime + idleGreetingGapTime); // 7s show + 1s gap

  let fallbackContent = (
    <Show when={showFallback() && fallbackText().length > 0}>
      <SpeechBubble children={fallbackText()} />
    </Show>
  );

  onCleanup(() => clearInterval(intervalId));

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
