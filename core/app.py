from flask import Flask, request, jsonify
from keras.models import load_model
import numpy as np
import tensorflow as tf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model
model_path = "C:/Users/ccoff/OneDrive/Chases Stuff/Core/AiMl/AIEngineering/core/engineering_model.keras"
model = load_model(model_path)

# API endpoint for text prediction
@app.route("/predict_eng", methods=["POST"])
def predict_eng():
    data = request.get_json()

    # Extract numeric inputs (must be 11 values)
    numeric_features = np.array([[
        data["MovingParts"],
        data["ForceTorque"],
        data["WeightConstraints"],
        data["ElectronicsComplexity"],
        data["PowerConsumption"],
        data["SoftwareComplexity"],
        data["MaterialDifficulty"],
        data["ChemicalFluids"],
        data["StructuralLoad"],
        data["Aerodynamics"],
        data["EnvironmentalConstraints"]
    ]], dtype=np.float32)

    # Combine text exactly like training
    text = (
        data["ProjectName"] + " " +
        data["PrimaryTechnology"] + " " +
        data["ProjectDescription"]
    )

    text_tensor = tf.convert_to_tensor([[text]])

    # Run prediction
    primary_pred, contrib_pred, complexity_pred = model.predict(
        {
            "numeric_input": numeric_features,
            "string_input": text_tensor
        }
    )

    # Convert outputs to JSON
    response = {
        "primary_field_probs": primary_pred[0].tolist(),
        "contributions": contrib_pred[0].tolist(),
        "complexity": float(complexity_pred[0][0])
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
