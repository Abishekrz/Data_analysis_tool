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
        <div style={styles.container}>
            <h2 style={styles.title}>Data Preprocessing Dashboard</h2>
            
            <div style={styles.uploadSection}>
                <input type="file" accept=".csv" onChange={handleFileChange} style={styles.fileInput} />
                <button onClick={handleUpload} disabled={loading} style={styles.button}>
                    {loading ? "Processing..." : "Upload & Process"}
                </button>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {processedData && processedData.processed_data && (
                <div style={styles.resultSection}>
                    <h3 style={styles.subtitle}>Processed Data Preview</h3>
                    <ProcessedDataTable data={processedData.processed_data.slice(0, 10)} />

                    <div style={styles.buttonGroup}>
                        <a href={processedData.download_link} download>
                            <button style={styles.button}>Download Processed CSV</button>
                        </a>
                        <a href={processedData.visualization_link} target="_blank" rel="noopener noreferrer">
                            <button style={styles.button}>View Histogram</button>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProcessedDataTable = ({ data }) => {
    if (!data || data.length === 0) {
        return <p style={styles.noData}>No processed data available.</p>;
    }

    const columns = Object.keys(data[0]);

    return (
        <div style={styles.tableContainer}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={styles.th}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} style={rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} style={styles.td}>{row[col]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Inline Styles
const styles = {
    container: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "auto",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    uploadSection: {
        marginBottom: "20px",
    },
    fileInput: {
        marginRight: "10px",
    },
    button: {
        backgroundColor: "#007BFF",
        color: "white",
        border: "none",
        padding: "10px 15px",
        cursor: "pointer",
        fontSize: "16px",
        borderRadius: "5px",
        transition: "0.3s",
    },
    buttonGroup: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
        gap: "10px",
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginTop: "10px",
    },
    resultSection: {
        marginTop: "30px",
        textAlign: "left",
    },
    subtitle: {
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    noData: {
        color: "gray",
        fontStyle: "italic",
    },
    tableContainer: {
        maxWidth: "100%",
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    },
    th: {
        backgroundColor: "#007BFF",
        color: "white",
        padding: "10px",
        borderBottom: "2px solid #ccc",
    },
    td: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
    },
    evenRow: {
        backgroundColor: "#f9f9f9",
    },
    oddRow: {
        backgroundColor: "#ffffff",
    },
};

export default PreprocessingDashboard;
