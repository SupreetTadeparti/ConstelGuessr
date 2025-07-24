/*
  Sends an API request to predict the constellation based on given points and connections.
  Points should be in the format [[x1, y1], [x2, y2], ...]
  Connections should be in the format [[index1, index2], ...]
*/
async function predictConstellation(points, connections) {
  // Normalize points to a 0-1 range
  const minX = Math.min(...points.map((p) => p[0]));
  const minY = Math.min(...points.map((p) => p[1]));
  const maxX = Math.max(...points.map((p) => p[0]));
  const maxY = Math.max(...points.map((p) => p[1]));

  const width = maxX - minX;
  const height = maxY - minY;
  const scale = Math.max(width, height);

  // Centering offset to keep proportions and center in 0-1 box
  const offsetX = (scale - width) / 2;
  const offsetY = (scale - height) / 2;

  const normalizedPoints = points.map((p) => [
    (p[0] - minX + offsetX) / scale,
    (p[1] - minY + offsetY) / scale,
  ]);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stars: normalizedPoints.map((point, idx) => ({
          id: idx,
          x: point[0],
          y: point[1],
        })),
        connections: connections.map((conn) => [conn[0], conn[1]]),
      }),
    });
    const data = await response.json();
    console.log(data);
    return data.prediction || "Unknown";
  } catch (err) {
    console.log(err);
    return "Error contacting server";
  }
}

export { predictConstellation };
