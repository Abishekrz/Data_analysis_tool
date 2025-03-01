import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processedData, setProcessedData] = useState([]);
    const [error, setError] = useState("");

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
        } else {
            alert("Please upload a valid CSV file.");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a CSV file first.");
            return;
        }

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData);

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setProcessedData(response.data);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Failed to process the file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <h2>Upload CSV File</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Processing..." : "Upload and Process"}
            </button>

            {error && <p className="error-message">{error}</p>}

            {/* Display Processed Data in a Table */}
            {processedData.length > 0 && (
                <div className="table-container">
                    <h3>Processed Data</h3>
                    <table>
                        <thead>
                            <tr>
                                {Object.keys(processedData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <td key={idx}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
