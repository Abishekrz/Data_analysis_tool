import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

export default function PreprocessingDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [operation, setOperation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState("");
  const [image, setImage] = useState("");

  // Handle File Selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Only CSV files are allowed!");
      setSelectedFile(null);
    }
  };

  // Upload File
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setFilename(response.data.filename);
      setLoading(false);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setLoading(false);
    }
  };

  // Process Data
  const handleProcess = async () => {
    if (!filename || !operation) {
      setError("Select a processing operation first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/process", { filename, operation });
      setTableData(response.data.table);
      setLoading(false);
    } catch (err) {
      setError("Processing failed. Please check your file and operation.");
      setLoading(false);
    }
  };

  // Visualize Data
  const handleVisualize = async () => {
    if (!filename || !operation) {
      setError("Select an operation for visualization.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/visualize", { filename, operation });
      if (response.data.status === "success") {
        setImage(`data:image/png;base64,${response.data.image}`);
      } else {
        setError("Visualization failed. Try a different operation.");
      }
      setLoading(false);
    } catch (err) {
      setError("Visualization error. Check the console for details.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* <h2>Data Preprocessing Dashboard</h2> */}

      {/* File Upload */}
      <div className="file-upload">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>Upload CSV</button>
      </div>

      {/* Operation Selection */}
      <div className="operations">
        <label>Select an Operation:</label>
        <select onChange={(e) => setOperation(e.target.value)} value={operation}>
          <option value="">--Select--</option>
          <option value="sampling">Sampling</option>
          <option value="normalization">Normalization</option>
          <option value="pca">PCA</option>
          <option value="clustering">Clustering</option>
        </select>
        <button onClick={handleProcess} disabled={loading || !filename}>Process</button>
        <button onClick={handleVisualize} disabled={loading || !filename}>Visualize</button>
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Processed Table */}
      {tableData && (
        <div className="table-container">
          <h3>Processed Data</h3>
          <div dangerouslySetInnerHTML={{ __html: tableData }} />
        </div>
      )}

      {/* Visualization Output */}
      {image && (
        <div className="image-container">
          <h3>Visualization</h3>
          <img src={image} alt="Visualization" />
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}
