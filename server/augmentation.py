import json
import random
import copy
import os
import math
import numpy as np  # Import numpy for more efficient array operations if needed, though math module is sufficient here


def augment_star_pattern(
    stars, jitter_amount=0.05, scale_range=(0.7, 1.3), rotation_degrees_range=(-30, 30)
):
    """
    Augments a single constellation's star pattern by applying scaling, rotation, and jitter.

    Args:
        stars (list): A list of dictionaries, each representing a star with 'id', 'x', 'y'.
        jitter_amount (float): The maximum random shift (in normalized units) for each star's x and y.
                                Increased from 0.02 to 0.05 for more variation.
        scale_range (tuple): A tuple (min_scale, max_scale) for random scaling.
                             Widened from (0.9, 1.1) to (0.7, 1.3) for more size variation.
        rotation_degrees_range (tuple): A tuple (min_degrees, max_degrees) for random rotation.
                                        New parameter to introduce rotational variance.

    Returns:
        list: A new list of dictionaries with augmented star coordinates.
    """
    if not stars:
        return []

    # Calculate the centroid (mean x, mean y) of the constellation
    xs = [star["x"] for star in stars]
    ys = [star["y"] for star in stars]

    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)

    # Randomly select scale, jitter, and rotation values
    scale = random.uniform(*scale_range)
    rotation_degrees = random.uniform(*rotation_degrees_range)
    rotation_radians = math.radians(rotation_degrees)

    cos_theta = math.cos(rotation_radians)
    sin_theta = math.sin(rotation_radians)

    augmented_stars = []

    for star in stars:
        # Translate star to origin (relative to centroid)
        translated_x = star["x"] - mean_x
        translated_y = star["y"] - mean_y

        # Apply scaling
        scaled_x = translated_x * scale
        scaled_y = translated_y * scale

        # Apply rotation
        rotated_x = scaled_x * cos_theta - scaled_y * sin_theta
        rotated_y = scaled_x * sin_theta + scaled_y * cos_theta

        # Translate star back from origin and add jitter
        final_x = rotated_x + mean_x + random.uniform(-jitter_amount, jitter_amount)
        final_y = rotated_y + mean_y + random.uniform(-jitter_amount, jitter_amount)

        # Clamp coordinates to stay within [0, 1] bounds
        final_x = min(max(final_x, 0), 1)
        final_y = min(max(final_y, 0), 1)

        augmented_stars.append({"id": star["id"], "x": final_x, "y": final_y})

    return augmented_stars


def augment_and_save(
    data, augmentations_per_constellation=500, output_dir="augmented_data"
):
    """
    Generates augmented constellation data and saves it to JSON files in the format 
    constellation_name.json in the specified output directory.

    Args:
        data (list): The original constellation dataset.
        augmentations_per_constellation (int): Number of augmented samples to generate per constellation.
        output_dir (str): The directory to save the augmented JSON files.
    """

    # Create output directory if it does not exist already
    os.makedirs(output_dir, exist_ok=True)
    print(f"Saving augmented data to: {output_dir}")

    # Each constellation has a name and two lists of pairs of floats: stars and connections.
    for constellation in data:
        augmentations = []

        print(
            f"Generating {augmentations_per_constellation} augmentations for {constellation['name']}..."
        )

        for i in range(augmentations_per_constellation):
            # Call the augmented_star_pattern with new, more aggressive parameters
            # You can adjust these values based on how much variability you expect in user drawings
            new_stars = augment_star_pattern(
                constellation["stars"],
                jitter_amount=0.08,  # Increased jitter (e.g., 8% of canvas size)
                scale_range=(
                    0.6,
                    1.4,
                ),  # Wider scale range (e.g., 60% to 140% of original size)
                rotation_degrees_range=(-90, 90),  # Rotate up to +/- 90 degrees
            )
            augmentations.append(
                {
                    "name": f"{constellation['name']}_aug{i+1}",
                    "stars": new_stars,
                    "connections": copy.deepcopy(
                        constellation["connections"]
                    ),  # Connections remain the same
                }
            )

        # Save all augmentations for the current constellation in one file
        filename = os.path.join(output_dir, f"{constellation['name']}.json")

        with open(filename, "w") as f:
            json.dump(augmentations, f, indent=2)

        print(f"Saved {augmentations_per_constellation} augmentations to {filename}")


if __name__ == "__main__":
    # Load original dataset from file
    original_data_file = "constellations.json"

    try:
        with open(original_data_file, "r") as f:
            original_data = json.load(f)
        print(f"Loaded original data from {original_data_file}")
    except FileNotFoundError:
        print(
            f"Error: {original_data_file} not found. Please ensure your original constellation data is in this file."
        )
        original_data = []  # Set to empty to prevent further errors

    # Generate and save augmented data if original data is loaded
    if original_data:
        augment_and_save(original_data, augmentations_per_constellation=500)
        
        print("\nAugmentation complete. You can now run your training script.")
    else:
        print("Skipping augmentation as original data could not be loaded.")
