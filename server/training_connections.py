import os
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import math


def load_augmented_data(data_folder="augmented_data"):
    """
    Loads and preprocesses augmented constellation data from JSON files in the format
    constellation_name.json in the data_folder

    Each JSON contains constellations with stars and connections. The function:
    - Scans all files to find max number of stars and connections
    - Pads all input data to consistent size
    - Extracts features: flattened coordinates + connection distances
    - Returns feature matrix and label array
    """

    all_features = []  # List to store feature vectors for all constellations
    all_labels = []  # List to store labels (constellation names)
    max_stars = 0  # Tracks the maximum number of stars in any constellation
    max_connections = 0  # Tracks the maximum number of connections in any constellation

    # First pass: Determine max number of stars and connections across all files
    print(f"Scanning '{data_folder}' to determine max stars and connections...")

    for filename in os.listdir(data_folder):
        if filename.endswith(".json"):
            filepath = os.path.join(data_folder, filename)

            # Try opening json file
            try:
                with open(filepath, "r") as f:
                    constellations_data = json.load(f)
                    # Keep up dating max values as we iterate through the constellations
                    for constellation in constellations_data:
                        if "stars" in constellation:
                            max_stars = max(max_stars, len(constellation["stars"]))
                        if "connections" in constellation:
                            max_connections = max(
                                max_connections, len(constellation["connections"])
                            )
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON from {filename}. Skipping.")
            except Exception as e:
                print(f"An error occurred while reading {filename}: {e}. Skipping.")

    # These values are accordingly updated on the frontend to prevent user from creating too many stars
    print(
        f"Maximum stars found: {max_stars}. Star coordinates will be padded to {max_stars * 2} features."
    )
    print(
        f"Maximum connections found: {max_connections}. Connection lengths will be padded to {max_connections} features."
    )

    # Second pass: Load data and construct feature vectors
    print(f"Loading data from '{data_folder}' and preparing features...")
    for filename in os.listdir(data_folder):
        if filename.endswith(".json"):
            filepath = os.path.join(data_folder, filename)
            try:
                with open(filepath, "r") as f:
                    constellations_data = json.load(f)

                    # Extract base constellation name from filename
                    base_constellation_name = filename.replace(".json", "").split(
                        "_aug"
                    )[0]

                    for constellation in constellations_data:
                        # Ensure required fields exist
                        if "stars" in constellation and "name" in constellation:
                            star_coords = []  # List to store x, y coordinates of stars

                            # Map star IDs to coordinates for easy lookup
                            star_map = {
                                star["id"]: (star["x"], star["y"])
                                for star in constellation["stars"]
                            }

                            for star in constellation["stars"]:
                                star_coords.append(star["x"])
                                star_coords.append(star["y"])

                            # Pad star coordinates to fixed length
                            padded_star_coords = star_coords + [0.0] * (
                                max_stars * 2 - len(star_coords)
                            )

                            connection_lengths = (
                                []
                            )  # List to store connection distances

                            if "connections" in constellation:
                                for conn_start_id, conn_end_id in constellation[
                                    "connections"
                                ]:
                                    if (
                                        conn_start_id in star_map
                                        and conn_end_id in star_map
                                    ):
                                        x1, y1 = star_map[conn_start_id]
                                        x2, y2 = star_map[conn_end_id]

                                        # Calculate Euclidean distance between connected stars
                                        distance = math.sqrt(
                                            (x2 - x1) ** 2 + (y2 - y1) ** 2
                                        )
                                        connection_lengths.append(distance)
                                    else:
                                        print(
                                            f"Warning: Connection refers to non-existent star ID in {constellation['name']}."
                                        )
                                        connection_lengths.append(0.0)

                            # Pad connection lengths to fixed length
                            padded_connection_lengths = connection_lengths + [0.0] * (
                                max_connections - len(connection_lengths)
                            )

                            # Combine star coordinates and connection lengths into one feature vector
                            combined_features = (
                                padded_star_coords + padded_connection_lengths
                            )

                            all_features.append(combined_features)
                            all_labels.append(base_constellation_name)
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON from {filename}. Skipping.")
            except Exception as e:
                print(f"An error occurred while reading {filename}: {e}. Skipping.")

    # Convert lists to numpy arrays for model training
    return np.array(all_features), np.array(all_labels)


def train_constellation_model(
    features,
    labels,
    model_save_path="constellation_model.pkl",
    encoder_save_path="label_encoder.pkl",
):
    """
    Trains a Random Forest model on constellation features and labels.

    The input data consists of extracted features (e.g., star coordinates, connection lengths)
    from augmented samples of real constellations. Labels are the constellation names.

    A LabelEncoder is used to convert string-based constellation names into numeric labels required
    by scikit-learn classifiers. The encoder is also saved so that the model’s predictions
    can later be decoded back to human-readable constellation names.

    A Random Forest Classifier is chosen for this task because:
        - It handles high-dimensional and potentially noisy data well (e.g., imprecise user drawings).
        - It is robust to overfitting, especially with many trees and varied input features.
        - It requires little preprocessing and handles mixed or correlated features effectively.
        - It provides good baseline performance with minimal hyperparameter tuning.

    Saves the trained model and label encoder to disk.
    Prints training statistics and accuracy.

    Args:
        features (np.ndarray): Feature matrix for training.
        labels (np.ndarray): Array of constellation names.
        model_save_path (str): Path to save the trained model.
        encoder_save_path (str): Path to save the label encoder.

    Returns:
        model: Trained RandomForestClassifier.
        label_encoder: Fitted LabelEncoder.
        X_test: Test features.
        y_test: True test labels.
        y_pred: Predicted test labels.
    """

    # Encode string labels as integers
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        encoded_labels,
        test_size=0.2,
        random_state=42,
        stratify=encoded_labels,
    )

    print(f"\nTraining data shape: {X_train.shape}")
    print(f"Testing data shape: {X_test.shape}")
    print(f"Number of unique constellations: {len(label_encoder.classes_)}")

    # Initialize and train Random Forest classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    print("\nTraining RandomForestClassifier...")

    model.fit(X_train, y_train)
    print("Training complete.")

    # Predict on test set
    y_pred = model.predict(X_test)

    # Calculate and print accuracy and classification report
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy:.4f}")

    report = classification_report(y_test, y_pred, target_names=label_encoder.classes_)
    print("\nClassification Report:\n", report)

    # Save trained model and label encoder to disk
    try:
        with open(model_save_path, "wb") as f:
            pickle.dump(model, f)
        print(f"\nModel saved successfully to {model_save_path}")
        with open(encoder_save_path, "wb") as f:
            pickle.dump(label_encoder, f)
        print(f"Label Encoder saved successfully to {encoder_save_path}")
    except Exception as e:
        print(f"Error saving model or encoder: {e}")

    return model, label_encoder, X_test, y_test, y_pred


if __name__ == "__main__":

    # Main entry point for training the constellation classifier
    data_folder = "augmented_data"  # Folder containing JSON data files

    if not os.path.exists(data_folder):
        print(
            f"Data folder '{data_folder}' does not exist. Please add JSON data and rerun."
        )
    else:
        # Load features and labels from data
        features, labels = load_augmented_data(data_folder)
        if features.size > 0:
            # Train model if data is available
            trained_model, encoder, X_test, y_test, y_pred = train_constellation_model(
                features, labels
            )
        else:
            print("No valid data found in the folder. Please check your JSON files.")
