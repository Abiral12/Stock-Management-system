'use client';

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

type Trend = {
  _id: string;
  totalSold: number;
  totalSales: number;
};

type ReportsChartProps = {
  fetchSalesTrends: (period?: string, start?: string, end?: string) => Promise<Trend[]>;
};

const ReportsChart: React.FC<ReportsChartProps> = ({ fetchSalesTrends }) => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); 
    fetchSalesTrends("daily", start.toISOString(), end.toISOString())
      .then(setTrends)
      .finally(() => setLoading(false));
  }, [fetchSalesTrends]);

  if (loading) return <div>Loading sales trends...</div>;
  console.log("Sales trends data:", trends);

  return (
    <div style={{ height: 400 }}>
      <Line
        data={{
          labels: trends.map(t => t._id),
          datasets: [
            {
              label: "Units Sold",
              data: trends.map(t => t.totalSold),
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Revenue",
              data: trends.map(t => t.totalSales),
              borderColor: "#10B981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              tension: 0.3,
              fill: true,
            }
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }}
      />
    </div>
  );
};

export default ReportsChart;