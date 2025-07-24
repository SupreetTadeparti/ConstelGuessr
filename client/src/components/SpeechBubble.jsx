import "./SpeechBubble.css";

function SpeechBubble({ children }) {
  return (
    <div className="speech-bubble">
      <div className="prediction">{children}</div>
    </div>
  );
}

export default SpeechBubble;
