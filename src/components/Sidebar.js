import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
      <ul>
        <li className="mb-2"><Link to="/">Home</Link></li>
        <li className="mb-2"><Link to="/preprocessing">Preprocessing</Link></li>
        <li className="mb-2"><Link to="/visualization">Visualization</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
