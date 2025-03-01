from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def preprocess_data(df):
    """Applies basic preprocessing (drop null values, normalize numeric columns)."""
    
    df_cleaned = df.dropna()

    # Normalize numeric columns
    numeric_cols = df_cleaned.select_dtypes(include=["number"]).columns
    if not numeric_cols.empty:
        df_cleaned[numeric_cols] = (df_cleaned[numeric_cols] - df_cleaned[numeric_cols].min()) / (
            df_cleaned[numeric_cols].max() - df_cleaned[numeric_cols].min()
        )

    return df_cleaned

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file and file.filename.endswith(".csv"):
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)

            # Read CSV and apply preprocessing
            df = pd.read_csv(filepath)
            df_cleaned = preprocess_data(df)

            # Convert processed data to JSON and return
            return jsonify(df_cleaned.to_dict(orient="records"))

        return jsonify({"error": "Invalid file format. Please upload a CSV file."}), 400

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
