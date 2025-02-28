import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import Preprocess from "./components/Preprocess";
import Visualization from "./pages/Visualization";
import "./App.css";

const App = () => {
  const [rawData, setRawData] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  return (
    <div className="app-container">
      <h1>Data Preprocessing Dashboard</h1>
      <FileUpload onDataProcessed={setRawData} />
      {rawData && <Preprocess rawData={rawData} onPreprocessedData={setProcessedData} />}
      {processedData && <Visualization processedData={processedData} />}
    </div>
  );
};

export default App;
