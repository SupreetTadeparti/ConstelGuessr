import logo from "../assets/logo.png";
import PredictionDisplay from "./PredictionDisplay";
import "./TitlePage.css";

function TitlePage({ setPage }) {
  return (
    <>
      <img className="logo" src={logo} alt="Logo" width={600} />
      <div className="btn start-btn" onClick={() => setPage("main")}>
        Start!
      </div>
      <PredictionDisplay page={"title"} />
    </>
  );
}

export default TitlePage;
