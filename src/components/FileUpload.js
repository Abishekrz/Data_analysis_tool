import React, { useState } from "react";
import axios from "axios";

const PreprocessingDashboard = () => {
    const [file, setFile] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            setProcessedData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "An error occurred while processing the file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Data Preprocessing Dashboard</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Processing..." : "Upload and Process"}
            </button>
            
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            {processedData && (
                <div>
                    <h3>Processed Data Preview</h3>
                    <pre>{JSON.stringify(processedData.processed_data.slice(0, 5), null, 2)}</pre>
                    <a href={processedData.download_link} download>
                        <button>Download Processed CSV</button>
                    </a>
                    <a href={processedData.visualization_link} target="_blank" rel="noopener noreferrer">
                        <button>View Histogram</button>
                    </a>
                </div>
            )}
        </div>
    );
};

export default PreprocessingDashboard;
