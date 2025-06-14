// ChartPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useParams } from "react-router-dom";

const ChartPage = () => {
  const { symbol } = useParams();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await axios.get(
          `https://financialmodelingprep.com/api/v3/historical-chart/5min/${symbol}?apikey=demo`
        );
        setChartData(res.data);
      } catch (err) {
        console.error("Error fetching chart data", err);
      }
    };

    fetchChartData();
  }, [symbol]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{symbol} Detailed Chart</h1>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Loading chart data...</p>
      )}
      {/* Add more info/stats as needed */}
    </div>
  );
};

export default ChartPage;
