import { onMount, createSignal, createEffect } from "solid-js";

function ConstellationCanvas({
  points,
  setPoints,
  connections,
  setConnections,
}) {
  let canvasRef;
  const [activeStar, setActiveStar] = createSignal(-1);

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
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = idx === activeStar() ? "#FFD700" : "white";
      ctx.shadowColor = idx === activeStar() ? "#FFD700" : "white";
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
      const dist = Math.hypot(px - x, py - y);
      if (dist <= 10) {
        setActiveStar(idx);
        found = true;
      }
    });

    if (found) {
      return; // Only set active, don't add a new star
    }

    // Add new star if not clicking on existing one
    if (points.length >= 9) return;

    const newPoints = [...points, [x, y]];
    setPoints(newPoints);
    // If there is an active star, add a connection from it to the new star
    if (activeStar() !== -1 && points.length > 0) {
      setConnections([...connections, [activeStar(), newPoints.length - 1]]);
    }
    setActiveStar(newPoints.length - 1); // new star is active
  }

  onMount(() => {
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
