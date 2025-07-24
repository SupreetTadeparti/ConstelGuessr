import { onMount, createEffect } from "solid-js";
import "./ConstellationCanvas.css";

const starRadius = 8;
const maxStars = 11; // Appropriate for ML model input size

/*
  Interface to draw constellations:
  
  
  HOW TO USE:
  - Click to add a star.
  - Click on an existing star to make it active.
*/
function ConstellationCanvas({
  points,
  setPoints,
  connections,
  setConnections,
  activeStar,
  setActiveStar,
}) {
  let canvasRef;

  function redrawCanvas() {
    const ctx = canvasRef.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Draw all connections as white lines
    connections.forEach(([fromIdx, toIdx]) => {
      if (points[fromIdx] && points[toIdx]) {
        const [fromX, fromY] = points[fromIdx];
        const [toX, toY] = points[toIdx];
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw stars
    points.forEach(([x, y], idx) => {
      ctx.beginPath();
      ctx.arc(x, y, starRadius, 0, 2 * Math.PI);

      // Set color based on whether the star is active. Active stars are set to secondary color
      ctx.fillStyle = idx === activeStar() ? "#12f3fd" : "white";
      ctx.shadowColor = idx === activeStar() ? "#12f3fd" : "white";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function handleCanvasClick(e) {
    const rect = canvasRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a star
    let found = false;
    points.forEach(([px, py], idx) => {
      // Compute euclidean distance from click to star
      // If distance is less than or equal to starRadius + 5 (for padding) pixels, consider it a click on the star
      const dist = Math.hypot(px - x, py - y);
      if (dist <= starRadius + 5) {
        // If shift + click, draw line instead of selecting
        if (e.shiftKey) {
          if (activeStar() !== -1) {
            setConnections([...connections, [activeStar(), idx]]);
          }
        }

        setActiveStar(idx);
        found = true;
      }
    });

    // Exit if we found an existing star
    if (found) return;

    // Add new star if not clicking on existing one
    if (points.length >= maxStars) return;

    const newPoints = [...points, [x, y]];
    setPoints(newPoints);

    // If there is an active star, add a connection from it to the new star
    if (activeStar() !== -1 && points.length > 0) {
      setConnections([...connections, [activeStar(), newPoints.length - 1]]);
    }

    setActiveStar(newPoints.length - 1); // new star is active
  }

  onMount(() => {
    // Set canvas size to match size set in CSS, allowing for responsive design
    const canvas = canvasRef;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redrawCanvas();
  });

  createEffect(() => {
    redrawCanvas();
  });

  return (
    <div className="canvas-container">
      <div className="canvas-outline"></div>
      <canvas
        className="drawing-canvas"
        ref={canvasRef}
        onClick={handleCanvasClick}
      ></canvas>
    </div>
  );
}

export default ConstellationCanvas;
