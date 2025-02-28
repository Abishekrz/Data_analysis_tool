import React, { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                responseType: "blob",
            });

            // Create a URL for downloading the processed Excel file
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "processed_data.xlsx";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to process the file.");
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
        </div>
    );
};

export default FileUpload;
