from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import pandas as pd
import os
import traceback  # Import for debugging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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

            # Example preprocessing: Remove null values
            df_cleaned = df.dropna()

            # Save processed data to Excel
            output_filepath = os.path.join(UPLOAD_FOLDER, "processed_data.xlsx")
            df_cleaned.to_excel(output_filepath, index=False)

            return send_file(output_filepath, as_attachment=True)

        return jsonify({"error": "Invalid file type. Only CSV is allowed."}), 400

    except Exception as e:
        print("🔥 Backend Error:", str(e))
        print(traceback.format_exc())  # Print full error traceback
        return jsonify({"error": "Internal Server Error"}), 500  # Send error response

if __name__ == "__main__":
    app.run(debug=True, port=5000)
