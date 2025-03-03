from flask import Flask, request, jsonify
import os
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles file uploads."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename})


@app.route('/process', methods=['POST'])
def process_data():
    """Processes the uploaded file based on the selected operation."""
    try:
        data = request.json
        filename = data.get("filename")
        operation = data.get("operation")

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        print(f"Processing {operation} on {filename}")

        df = pd.read_csv(filepath)

        operation_mapping = {
            "sampling": perform_sampling,
            "normalization": perform_normalization,
            "pca": perform_pca,
            "clustering": perform_clustering,
            "market_analysis": perform_market_analysis
        }

        if operation not in operation_mapping:
            return jsonify({"error": "Invalid operation"}), 400

        result_df = operation_mapping[operation](df)
        if result_df is None:
            return jsonify({"error": "File cannot be processed"}), 400

        # Convert DataFrame to HTML table
        table_html = result_df.to_html(classes="table table-striped", index=False)

        return jsonify({"message": f"{operation.capitalize()} completed", "table": table_html, "status": "success"})

    except Exception as e:
        error_message = traceback.format_exc()
        print(f"Error processing {operation}: {error_message}")
        return jsonify({"error": "File cannot be processed", "status": "failure"}), 500


def perform_sampling(df):
    """Returns a random sample of 10% of the data."""
    return df.sample(frac=0.1, random_state=42)


def perform_normalization(df):
    """Applies standard scaling normalization to numerical columns."""
    num_cols = df.select_dtypes(include=["number"]).columns
    if num_cols.empty:
        return None

    scaler = StandardScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df[num_cols]), columns=num_cols)
    return df_scaled


def perform_clustering(df):
    df = df.select_dtypes(include=['number'])  # Keep only numeric columns
    df = df.apply(pd.to_numeric, errors='coerce')
    df = df.fillna(df.mean())
    # print(df.isnull().sum())
    # return df
    df = df.copy()
    df = df.select_dtypes(include=['number']).fillna(df.mean())  # Replace NaNs with column means
    kmeans = KMeans(n_clusters=3, random_state=42)
    df["Cluster"] = kmeans.fit_predict(df)
    return df


def perform_pca(df):
    df = df.copy()
    df = df.select_dtypes(include=['number']).dropna()  # Select only numeric columns and drop NaNs
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(df)
    return pd.DataFrame(pca_result, columns=["PC1", "PC2"])



def perform_market_analysis(df):
    df = df.copy()
    df.iloc[:, 1] = pd.to_numeric(df.iloc[:, 1], errors='coerce')  # Convert column to numeric
    df["Trend"] = df.iloc[:, 1] * 1.1  # Dummy trend calculation
    return df



if __name__ == '__main__':
    app.run(debug=True)
