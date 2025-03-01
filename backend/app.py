from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import traceback
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file and file.filename.endswith(".csv"):
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)

            # Read CSV and apply preprocessing
            df = pd.read_csv(filepath)

            # Convert columns to numeric, forcing errors to NaN
            df = df.apply(pd.to_numeric, errors='coerce')

            # Drop non-numeric columns
            df = df.dropna(axis=1, how='all')

            # Drop rows with missing values
            df_cleaned = df.dropna()
            
            # Normalize only numeric columns
            df_normalized = (df_cleaned - df_cleaned.min()) / (df_cleaned.max() - df_cleaned.min())
            df_final = df_normalized.fillna(0)  # Fill remaining NaNs with 0

            # Save processed file
            processed_filepath = os.path.join(UPLOAD_FOLDER, "processed_data.csv")
            df_final.to_csv(processed_filepath, index=False)

            # Visualization: Generate histogram for numerical columns
            numeric_cols = df_final.select_dtypes(include=["number"]).columns
            if len(numeric_cols) > 0:
                df_final[numeric_cols].hist(figsize=(10, 5))
                hist_path = os.path.join(UPLOAD_FOLDER, "histogram.png")
                plt.savefig(hist_path)
                plt.close()
            else:
                hist_path = None

            # Return processed data as JSON
            response = {
                "processed_data": df_final.to_dict(orient="records"),
                "download_link": "http://localhost:5000/download",
            }
            if hist_path:
                response["visualization_link"] = "http://localhost:5000/histogram"

            return jsonify(response)

        return jsonify({"error": "Invalid file type. Only CSV is allowed."}), 400

    except Exception as e:
        print("🔥 Backend Error:", str(e))
        print(traceback.format_exc())
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/download", methods=["GET"])
def download_file():
    processed_filepath = os.path.join(UPLOAD_FOLDER, "processed_data.csv")
    if os.path.exists(processed_filepath):
        return send_file(processed_filepath, as_attachment=True)
    return jsonify({"error": "File not found"}), 404

@app.route("/histogram", methods=["GET"])
def get_histogram():
    hist_path = os.path.join(UPLOAD_FOLDER, "histogram.png")
    if os.path.exists(hist_path):
        return send_file(hist_path, mimetype="image/png")
    return jsonify({"error": "Visualization not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)