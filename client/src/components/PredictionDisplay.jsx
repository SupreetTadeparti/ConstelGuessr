import { createEffect, createSignal, onCleanup } from "solid-js";
import { Show } from "solid-js";
import SpeechBubble from "./SpeechBubble";
import robotSmileImg from "../assets/robot_smile.png";
import robotTalkImg from "../assets/robot_talk.png";
import "./PredictionDisplay.css";

// Constants for idle greeting display timing
const idleGreetingDisplayTime = 6000;
const idleGreetingGapTime = 4000;

/* Greeting messages data */

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

function PredictionDisplay(props) {
  const [showFallback, setShowFallback] = createSignal(false);
  const [fallbackText, setFallbackText] = createSignal("");

  function getRandomGreeting(s) {
    // 1% chance for special angry greeting
    if (Math.random() < 0.01) {
      return "You dare show me this constellation? Prepare for cosmic destruction!";
    }
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /* Speech bubble contents */

  let titlePageContent = (
    <SpeechBubble
      children={
        <>
          Welcome to the ConstelGuessr!
          <br />
          Click the button below to start your journey.
        </>
      }
    />
  );

  let predictionContent;

  createEffect(() => {
    predictionContent = (
      <>
        Is that &nbsp;
        <strong>{props.prediction}</strong>?
        <br />
        {/* Hack to update greeting */}
        {getRandomGreeting(props.prediction)}
      </>
    );
  });

  /* Displays random intermittent greetings while waiting for user submission */

  let fallbackContent = (
    <Show when={showFallback() && fallbackText().length > 0}>
      <SpeechBubble children={fallbackText()} />
    </Show>
  );

  // Set an interval to show fallback greetings with a delay
  let intervalId = setInterval(() => {
    setShowFallback(false);
    setTimeout(() => {
      setFallbackText(
        idleGreetings[Math.floor(Math.random() * idleGreetings.length)]
      );
      setShowFallback(true);
    }, idleGreetingGapTime);
  }, idleGreetingDisplayTime + idleGreetingGapTime);

  onCleanup(() => clearInterval(intervalId));

  return (
    <div className="prediction-display">
      {/* Robot Image */}
      <img
        className="robot"
        src={
          // Check if robot is talking and display appropriate image
          props.page === "title" ||
          showFallback() ||
          props.prediction.length !== 0
            ? robotTalkImg
            : robotSmileImg
        }
        alt="robot"
      />
      <div className="speech-bubble-container">
        {/* Title Page Check */}
        <Show when={props.page !== "title"} fallback={titlePageContent}>
          {/* Prediction Display Check */}
          <Show when={props.prediction.length > 0} fallback={fallbackContent}>
            <SpeechBubble children={predictionContent} />
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default PredictionDisplay;
