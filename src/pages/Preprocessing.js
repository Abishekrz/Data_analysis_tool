import React, { useState } from "react";
import axios from "axios";
import "./Preprocess.css";

const Preprocess = ({ rawData, onPreprocessedData }) => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePreprocess = async () => {
    if (!method) {
      alert("Please select a preprocessing method.");
      return;
    }
    if (!rawData) {
      alert("No file data found. Please upload a file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/preprocess", {
        data: rawData,
        method,
      });

      onPreprocessedData(response.data);
    } catch (error) {
      console.error("Preprocessing failed:", error);
      setError("Preprocessing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preprocess-container">
      <h2>Data Preprocessing</h2>
      <select onChange={(e) => setMethod(e.target.value)} value={method}>
        <option value="">Select Method</option>
        <option value="normalization">Normalization</option>
        <option value="sampling">Sampling</option>
        <option value="outlier-detection">Outlier Detection</option>
        <option value="pca">PCA (Principal Component Analysis)</option>
      </select>
      <button onClick={handlePreprocess} disabled={loading}>{loading ? "Processing..." : "Apply"}</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Preprocess;
