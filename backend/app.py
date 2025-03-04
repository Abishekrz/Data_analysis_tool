from flask import Flask, request, jsonify
import os
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Use Agg backend (no GUI)
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
import traceback
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'csv'}
def allowed_file(filename):
    """Check if the uploaded file has a .csv extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# File Upload
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are allowed"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename})


# Visualization and Table Data Route
@app.route('/visualize', methods=['POST'])
def visualize():
    try:
        data = request.json
        filename = data.get("filename")
        operation = data.get("operation")

        if not filename or not operation:
            return jsonify({"status": "error", "error": "Filename or operation missing"}), 400

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        df = pd.read_csv(filepath)
        processed_df = df.copy()  # Copy original data before processing

        plt.figure(figsize=(6, 4))
        if operation == "sampling":
            sns.histplot(df.iloc[:, 0], bins=10, kde=True)
            plt.title("Sampling Distribution")

        elif operation == "normalization":
            num_cols = df.select_dtypes(include=["number"]).columns
            if num_cols.empty:
                return jsonify({"error": "No numeric columns for normalization"}), 400

            scaler = StandardScaler()
            normalized = scaler.fit_transform(df[num_cols])
            processed_df[num_cols] = normalized  # Update dataframe with normalized values
            sns.boxplot(data=pd.DataFrame(normalized, columns=num_cols))
            plt.title("Normalized Data")

        elif operation == "pca":
            num_cols = df.select_dtypes(include=["number"]).dropna(axis=1)
            if num_cols.empty:
                return jsonify({"error": "No numeric columns for PCA"}), 400

            pca = PCA(n_components=2)
            pca_result = pca.fit_transform(num_cols)
            processed_df = pd.DataFrame(pca_result, columns=["PC1", "PC2"])  # Convert PCA result to DataFrame
            plt.scatter(pca_result[:, 0], pca_result[:, 1])
            plt.title("PCA Visualization")

        # elif operation == "clustering":
        #     num_cols = df.select_dtypes(include=['number']).dropna()
        #     if num_cols.empty:
        #         return jsonify({"error": "No numeric columns for clustering"}), 400

        #     kmeans = KMeans(n_clusters=3, random_state=42)
        #     clusters = kmeans.fit_predict(num_cols)
        #     processed_df['Cluster'] = clusters  # Add clusters to DataFrame
        #     plt.scatter(num_cols.iloc[:, 0], num_cols.iloc[:, 1], c=clusters, cmap='viridis')
        #     plt.title("K-Means Clustering")
        elif operation == "clustering":
            num_cols = df.select_dtypes(include=['number']).dropna(axis=1)
            if num_cols.empty or num_cols.shape[1] < 2:
                return jsonify({"error": "Not enough numeric columns for clustering"}), 400

            print("Clustering on columns:", num_cols.columns.tolist())

            kmeans = KMeans(n_clusters=3, random_state=42)
            clusters = kmeans.fit_predict(num_cols)

            plt.scatter(num_cols.iloc[:, 0], num_cols.iloc[:, 1], c=clusters, cmap='viridis')
            plt.title("K-Means Clustering")


        else:
            return jsonify({"error": "Unsupported visualization type"}), 400

        # Convert plot to base64
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        img_base64 = base64.b64encode(img.getvalue()).decode()
        plt.close()

        # Convert table to HTML
        table_html = processed_df.to_html(classes="table table-bordered", index=False)

        return jsonify({
            "status": "success",
            "image": img_base64,
            "table": table_html
        })

    except Exception as e:
        return jsonify({"error": str(e), "status": "failure"}), 500
@app.route('/process', methods=['POST'])
def process_data():
    """Processes the uploaded CSV file based on the selected operation."""
    try:
        data = request.json
        filename = data.get("filename")
        operation = data.get("operation")

        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        if not allowed_file(filename):
            return jsonify({"error": "Invalid file format. Only CSV files are supported."}), 400

        print(f"Processing {operation} on {filename}")

        df = pd.read_csv(filepath)
        
        if df.empty:
            return jsonify({"error": "CSV file is empty"}), 400

        operation_mapping = {
            "sampling": perform_sampling,
            "normalization": perform_normalization,
            "pca": perform_pca,
            "clustering": perform_clustering,
            # "market_analysis": perform_market_analysis
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
    return df.sample(frac=0.1, random_state=42).head(10)


def perform_normalization(df):
    """Applies standard scaling normalization to numerical columns."""
    num_cols = df.select_dtypes(include=["number"]).columns
    if num_cols.empty:
        return None

    scaler = StandardScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df[num_cols]), columns=num_cols)
    return df_scaled.head(10)


def perform_clustering(df):
    df = df.select_dtypes(include=['number'])  # Keep only numeric columns
    df = df.apply(pd.to_numeric, errors='coerce')
    df = df.fillna(df.mean())
    df = df.copy()
    df = df.select_dtypes(include=['number']).fillna(df.mean())  # Replace NaNs with column means
    kmeans = KMeans(n_clusters=3, random_state=42)
    df["Cluster"] = kmeans.fit_predict(df)
    return df.head(10)


def perform_pca(df):
    df = df.copy()
    df = df.select_dtypes(include=['number']).dropna()  # Select only numeric columns and drop NaNs
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(df)
    return pd.DataFrame(pca_result, columns=["PC1", "PC2"]).head(10)


if __name__ == '__main__':
    app.run(debug=True)
