import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";  // Import CSS file

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [operation, setOperation] = useState("sampling");
  const [tableHtml, setTableHtml] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setFilename(response.data.filename);
      setError(""); // Clear errors
      alert("File uploaded successfully!");
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Failed to upload file.");
    }
  };

  const handleProcess = async () => {
    if (!filename) {
      setError("Please upload a file first.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/process", {
        filename: filename,
        operation: operation,
      });

      if (response.data.status === "success") {
        setTableHtml(response.data.table);
        setError(""); // Clear errors
      } else {
        setError(response.data.error || "Processing failed.");
      }
    } catch (err) {
      console.error("Processing Error:", err);
      setError("Error processing file. File might be incompatible.");
    }
  };

  return (
    <div className="container">
      <h2>Upload & Process Data</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} className="upload-btn">Upload</button>

      <br />
      <label>Select Operation:</label>
      <select value={operation} onChange={(e) => setOperation(e.target.value)}>
        <option value="sampling">Sampling</option>
        <option value="normalization">Normalization</option>
        <option value="pca">PCA</option>
        <option value="clustering">Clustering</option>
        <option value="market_analysis">Market Analysis</option>
      </select>

      <button onClick={handleProcess} className="process-btn">Process</button>

      {error && <p className="error">{error}</p>}

      {/* Display the processed table */}
      {tableHtml && (
        <div
          dangerouslySetInnerHTML={{ __html: tableHtml }}
          className="data-table"
        />
      )}
    </div>
  );
};

export default FileUpload;
