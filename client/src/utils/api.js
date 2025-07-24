async function predictConstellation(points, connections) {
  /*
    Expected JSON input format:
    {
        "stars": [
            {"id": 0, "x": 0.1, "y": 0.8},
            {"id": 1, "x": 0.2, "y": 0.7}
        ],
        "connections": [
            [0, 1]
        ]
    }  
*/

  // Normalize points to a 0-1 range
  const minX = Math.min(...points.map((p) => p[0]));
  const minY = Math.min(...points.map((p) => p[1]));
  const maxX = Math.max(...points.map((p) => p[0]));
  const maxY = Math.max(...points.map((p) => p[1]));
  const normalizedPoints = points.map((p) => [
    (p[0] - minX) / (maxX - minX),
    (p[1] - minY) / (maxY - minY),
  ]);

  console.log(
    normalizedPoints.map((point, idx) => ({
      id: idx,
      x: point[1],
      y: point[0],
    })),
    connections.map((conn) => [conn[0], conn[1]])
  );

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
    console.log(data)
    return data.prediction || "Unknown";
  } catch (err) {
    console.log(err);
    return "Error contacting server";
  }
}

export { predictConstellation };
