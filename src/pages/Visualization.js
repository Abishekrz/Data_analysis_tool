import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Visualization.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Visualization = () => {
    const data = {
        labels: ['Category 1', 'Category 2', 'Category 3'],
        datasets: [
            {
                label: 'Dataset Example',
                data: [10, 20, 30],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56'],
            },
        ],
    };

    return (
        <div className="visualization-container">
            <h2 className="visualization-title">Data Visualization</h2>
            <div className="chart-container">
                <Bar data={data} />
            </div>
        </div>
    );
};

export default Visualization;
