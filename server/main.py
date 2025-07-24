import os
import json
import numpy as np
import pickle
import math
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS for cross-origin requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
# --- Configuration: These values MUST match what was used during model training ---
# You can get these from the output of your training script's first pass,
# or save them to a config file during training and load them here.
# For this example, we'll use placeholder values based on typical constellations.
# It's crucial that these match the 'max_stars' and 'max_connections'
# determined by your load_augmented_data function during training.
MAX_STARS_TRAINED = (
    9  # Example: Orion has 9 stars. Adjust based on your largest constellation.
)
MAX_CONNECTIONS_TRAINED = (
    8  # Example: Orion has 8 connections. Adjust based on your largest constellation.
)
# --- End Configuration ---

# Global variables to hold the loaded model and encoder
# These will be loaded once when the application starts
loaded_model = None
loaded_encoder = None


def load_model_and_encoder():
    """Loads the pre-trained model and label encoder into global variables."""
    global loaded_model, loaded_encoder
    try:
        model_path = "constellation_model4.pkl"
        encoder_path = "label_encoder4.pkl"

        if not os.path.exists(model_path):
            print(f"Error: Model file not found at {model_path}")
            return False
        if not os.path.exists(encoder_path):
            print(f"Error: Label encoder file not found at {encoder_path}")
            return False

        with open(model_path, "rb") as f:
            loaded_model = pickle.load(f)
        with open(encoder_path, "rb") as f:
            loaded_encoder = pickle.load(f)
        print("Model and Label Encoder loaded successfully.")
        return True
    except Exception as e:
        print(f"Failed to load model or encoder: {e}")
        loaded_model = None
        loaded_encoder = None
        return False


@app.route("/predict", methods=["POST"])
def predict_constellation():
    """
    Receives user-drawn constellation data, processes it, and returns a prediction.
    Expected JSON input format from frontend:
    {
        "stars": [
            {"id": 0, "x": 0.1, "y": 0.8},
            {"id": 1, "x": 0.2, "y": 0.7}
        ],
        "connections": [
            [0, 1]
        ]
    }
    """
    if loaded_model is None or loaded_encoder is None:
        return (
            jsonify(
                {"error": "Model or encoder not loaded. Please check backend setup."}
            ),
            500,
        )

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON input"}), 400

    user_stars = data.get("stars")
    user_connections = data.get("connections")

    if not isinstance(user_stars, list) or not user_stars:
        return (
            jsonify(
                {"error": "Missing or invalid 'stars' data (must be a non-empty list)"}
            ),
            400,
        )
    if not isinstance(
        user_connections, list
    ):  # Connections can be empty if user doesn't draw them
        user_connections = []

    # --- 1. Prepare Star Coordinates ---
    star_coords = []
    star_map = {star["id"]: (star["x"], star["y"]) for star in user_stars}
    for star in user_stars:
        star_coords.append(star["x"])
        star_coords.append(star["y"])

    # Pad star coordinates to match training input length
    if len(star_coords) > MAX_STARS_TRAINED * 2:
        return (
            jsonify(
                {"error": f"Too many stars drawn. Max allowed: {MAX_STARS_TRAINED}"}
            ),
            400,
        )
    padded_star_coords = star_coords + [0.0] * (
        MAX_STARS_TRAINED * 2 - len(star_coords)
    )

    # --- 2. Prepare Connection Lengths ---
    connection_lengths = []
    for conn_start_id, conn_end_id in user_connections:
        if conn_start_id in star_map and conn_end_id in star_map:
            x1, y1 = star_map[conn_start_id]
            x2, y2 = star_map[conn_end_id]
            distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            connection_lengths.append(distance)
        else:
            # If a connection refers to a star that wasn't provided, treat as 0 length
            # or you might want to return an error depending on strictness
            connection_lengths.append(0.0)

    # Pad connection lengths to match training input length
    if len(connection_lengths) > MAX_CONNECTIONS_TRAINED:
        return (
            jsonify(
                {
                    "error": f"Too many connections drawn. Max allowed: {MAX_CONNECTIONS_TRAINED}"
                }
            ),
            400,
        )
    padded_connection_lengths = connection_lengths + [0.0] * (
        MAX_CONNECTIONS_TRAINED - len(connection_lengths)
    )

    # --- 3. Combine All Features and Reshape ---
    combined_features = padded_star_coords + padded_connection_lengths
    # The model expects a 2D array, even for a single sample
    model_input = np.array(combined_features).reshape(1, -1)

    # --- 4. Make Prediction ---
    try:
        numerical_prediction = loaded_model.predict(model_input)[0]
        # --- 5. Decode Prediction ---
        predicted_constellation_name = loaded_encoder.inverse_transform(
            [numerical_prediction]
        )[0]
        return jsonify({"prediction": predicted_constellation_name}), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {e}"}), 500


if __name__ == "__main__":
    # Load model and encoder when the Flask app starts
    if load_model_and_encoder():
        print("Starting Flask app...")
        # Run the Flask app
        # In a production environment, you would use a WSGI server like Gunicorn or uWSGI
        app.run(debug=True, host="0.0.0.0", port=5000)
    else:
        print("Application could not start due to model/encoder loading errors.")
