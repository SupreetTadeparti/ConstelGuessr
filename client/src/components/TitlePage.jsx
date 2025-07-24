import logo from "../assets/logo.png";
import PredictionDisplay from "./PredictionDisplay";
import "./TitlePage.css";

function TitlePage({ setPage }) {
  return (
    <>
      <img className="logo" src={logo} alt="Logo" width={450} />
      {/* Go to main page on button click */}
      <div className="btn start-btn" onClick={() => setPage("main")}>
        Start!
      </div>
      <PredictionDisplay page={"title"} />
    </>
  );
}

export default TitlePage;
