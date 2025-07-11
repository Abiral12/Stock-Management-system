"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from '@/components/AdminHeader';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { getAuthToken } from '@/utils/auth';
import { TrendingUp, CalendarDays, CalendarRange, ArrowUp, ArrowDown, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalesTrend {
  _id: string;
  totalSold: number;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}

export default function SalesPage() {
  const [weekData, setWeekData] = useState<SalesTrend[]>([]);
  const [monthData, setMonthData] = useState<SalesTrend[]>([]);
  const [yearData, setYearData] = useState<SalesTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSalesTrends = useCallback(async (start: string, end: string, period: string) => {
    const token = getAuthToken();
    const params = { period, start, end };
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/trends`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params
      }
    );
    return response.data.trends;
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError("");
      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); 
        weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(today);
        weekEnd.setHours(23,59,59,999);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

        const [week, month, year] = await Promise.all([
          fetchSalesTrends(weekStart.toISOString(), weekEnd.toISOString(), 'daily'),
          fetchSalesTrends(monthStart.toISOString(), monthEnd.toISOString(), 'daily'),
          fetchSalesTrends(yearStart.toISOString(), yearEnd.toISOString(), 'monthly'),
        ]);
        setWeekData(week);
        setMonthData(month);
        setYearData(year);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch sales data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [fetchSalesTrends]);

  const cardStyles = [
    {
      border: "border-l-4 border-blue-500",
      icon: <TrendingUp className="h-7 w-7 text-blue-500" />,
      gradient: "from-blue-50 to-white",
      chartColor: "#3B82F6"
    },
    {
      border: "border-l-4 border-green-500",
      icon: <CalendarDays className="h-7 w-7 text-green-500" />,
      gradient: "from-green-50 to-white",
      chartColor: "#10B981"
    },
    {
      border: "border-l-4 border-amber-500",
      icon: <CalendarRange className="h-7 w-7 text-amber-500" />,
      gradient: "from-amber-50 to-white",
      chartColor: "#F59E42"
    }
  ];

  function getBarChartData(data: SalesTrend[], color: string) {
    return {
      labels: data.map(d => d._id),
      datasets: [
        {
          label: 'Sales',
          data: data.map(d => d.totalSales),
          backgroundColor: `${color}80`, // Add transparency
          borderColor: color,
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 20,
        }
      ],
    };
  }

  // Helper to calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader />
      <div className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Sales & Profit Dashboard
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Track your sales performance, analyze costs, and monitor profitability trends across different time periods
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-gray-500 text-sm">Last updated: </span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-center">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="animate-pulse">
                  <div className="h-7 w-7 bg-gray-200 rounded-full mb-4"></div>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-40 bg-gray-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* This Week */}
            <div className={`bg-gradient-to-b ${cardStyles[0].gradient} rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl`}>
              <div className="flex items-center mb-6">
                {cardStyles[0].icon}
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-gray-800">This Week</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {(() => {
                const totalSales = weekData.reduce((sum, d) => sum + (d.totalSales || 0), 0);
                const totalCost = weekData.reduce((sum, d) => sum + (d.totalCost || 0), 0);
                const grossProfit = weekData.reduce((sum, d) => sum + (d.grossProfit || 0), 0);
                const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
                const prevWeekSales = totalSales * 0.85; // Placeholder for demo
                const salesChange = calculateChange(totalSales, prevWeekSales);
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Sales</div>
                        <div className="text-xl font-bold text-gray-900 mb-1">RS {totalSales.toLocaleString()}</div>
                        <div className={`flex items-center text-sm ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {salesChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {Math.abs(salesChange).toFixed(1)}% from last week
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Profit Margin</div>
                        <div className="text-xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</div>
                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${profitMargin > 20 ? 'bg-green-500' : profitMargin > 10 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(profitMargin, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-700">Daily Performance</h3>
                        <span className="text-sm text-blue-600 font-medium">RS {grossProfit.toLocaleString()} Profit</span>
                      </div>
                      <div className="h-52">
                        <Bar
                          data={getBarChartData(weekData, cardStyles[0].chartColor)}
                          options={{
                            responsive: true,
                            plugins: { 
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: 'white',
                                titleColor: '#1F2937',
                                bodyColor: '#1F2937',
                                borderColor: '#E5E7EB',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 4,
                                usePointStyle: true,
                                callbacks: {
                                  label: (context) => `RS ${context.raw}`
                                }
                              }
                            },
                            scales: { 
                              y: { 
                                beginAtZero: true,
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                ticks: { 
                                  callback: (value) => `RS ${value}`,
                                  maxTicksLimit: 6
                                }
                              },
                              x: { 
                                grid: { display: false }
                              }
                            },
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* This Month */}
            <div className={`bg-gradient-to-b ${cardStyles[1].gradient} rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl`}>
              <div className="flex items-center mb-6">
                {cardStyles[1].icon}
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-gray-800">This Month</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {(() => {
                const totalSales = monthData.reduce((sum, d) => sum + (d.totalSales || 0), 0);
                const totalCost = monthData.reduce((sum, d) => sum + (d.totalCost || 0), 0);
                const grossProfit = monthData.reduce((sum, d) => sum + (d.grossProfit || 0), 0);
                const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
                const prevMonthSales = totalSales * 0.92; // Placeholder for demo
                const salesChange = calculateChange(totalSales, prevMonthSales);
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Sales</div>
                        <div className="text-xl font-bold text-gray-900 mb-1">RS {totalSales.toLocaleString()}</div>
                        <div className={`flex items-center text-sm ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {salesChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {Math.abs(salesChange).toFixed(1)}% from last month
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Profit Margin</div>
                        <div className="text-xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</div>
                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${profitMargin > 20 ? 'bg-green-500' : profitMargin > 10 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(profitMargin, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-700">Daily Trends</h3>
                        <span className="text-sm text-green-600 font-medium">RS {grossProfit.toLocaleString()} Profit</span>
                      </div>
                      <div className="h-52">
                        <Bar
                          data={getBarChartData(monthData, cardStyles[1].chartColor)}
                          options={{
                            responsive: true,
                            plugins: { 
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: 'white',
                                titleColor: '#1F2937',
                                bodyColor: '#1F2937',
                                borderColor: '#E5E7EB',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 4,
                                usePointStyle: true,
                                callbacks: {
                                  label: (context) => `RS ${context.raw}`
                                }
                              }
                            },
                            scales: { 
                              y: { 
                                beginAtZero: true,
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                ticks: { 
                                  callback: (value) => `RS ${value}`,
                                  maxTicksLimit: 6
                                }
                              },
                              x: { 
                                grid: { display: false }
                              }
                            },
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* This Year */}
            <div className={`bg-gradient-to-b ${cardStyles[2].gradient} rounded-2xl shadow-lg p-6 border border-gray-100 transition-all hover:shadow-xl`}>
              <div className="flex items-center mb-6">
                {cardStyles[2].icon}
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-gray-800">This Year</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date().getFullYear()} Performance
                  </p>
                </div>
              </div>
              
              {(() => {
                const totalSales = yearData.reduce((sum, d) => sum + (d.totalSales || 0), 0);
                const totalCost = yearData.reduce((sum, d) => sum + (d.totalCost || 0), 0);
                const grossProfit = yearData.reduce((sum, d) => sum + (d.grossProfit || 0), 0);
                const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
                const prevYearSales = totalSales * 0.88; // Placeholder for demo
                const salesChange = calculateChange(totalSales, prevYearSales);
                
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Sales</div>
                        <div className="text-xl font-bold text-gray-900 mb-1">RS {totalSales.toLocaleString()}</div>
                        <div className={`flex items-center text-sm ${salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {salesChange >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {Math.abs(salesChange).toFixed(1)}% from last year
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Profit Margin</div>
                        <div className="text-xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</div>
                        <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${profitMargin > 20 ? 'bg-green-500' : profitMargin > 10 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(profitMargin, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-700">Monthly Trends</h3>
                        <span className="text-sm text-amber-600 font-medium">RS {grossProfit.toLocaleString()} Profit</span>
                      </div>
                      <div className="h-52">
                        <Bar
                          data={getBarChartData(yearData, cardStyles[2].chartColor)}
                          options={{
                            responsive: true,
                            plugins: { 
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: 'white',
                                titleColor: '#1F2937',
                                bodyColor: '#1F2937',
                                borderColor: '#E5E7EB',
                                borderWidth: 1,
                                padding: 12,
                                boxPadding: 4,
                                usePointStyle: true,
                                callbacks: {
                                  label: (context) => `RS ${context.raw}`
                                }
                              }
                            },
                            scales: { 
                              y: { 
                                beginAtZero: true,
                                grid: { color: 'rgba(0,0,0,0.05)' },
                                ticks: { 
                                  callback: (value) => `RS ${value}`,
                                  maxTicksLimit: 6
                                }
                              },
                              x: { 
                                grid: { display: false }
                              }
                            },
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-900 mb-2">RS {(
                weekData.reduce((sum, d) => sum + (d.totalSales || 0), 0) +
                monthData.reduce((sum, d) => sum + (d.totalSales || 0), 0) +
                yearData.reduce((sum, d) => sum + (d.totalSales || 0), 0)
              ).toLocaleString()}</div>
              <div className="flex items-center text-sm text-blue-600">
                <ArrowUp size={14} />
                <span>12.5% from last period</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
              <div className="text-sm text-green-700 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-900 mb-2">RS {(
                weekData.reduce((sum, d) => sum + (d.grossProfit || 0), 0) +
                monthData.reduce((sum, d) => sum + (d.grossProfit || 0), 0) +
                yearData.reduce((sum, d) => sum + (d.grossProfit || 0), 0)
              ).toLocaleString()}</div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUp size={14} />
                <span>18.2% from last period</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Avg. Profit Margin</div>
              <div className="text-2xl font-bold text-amber-900 mb-2">
                {(
                  (weekData.reduce((sum, d) => sum + (d.profitMargin || 0), 0) / (weekData.length || 1) +
                  monthData.reduce((sum, d) => sum + (d.profitMargin || 0), 0) / (monthData.length || 1) +
                  yearData.reduce((sum, d) => sum + (d.profitMargin || 0), 0) / (yearData.length || 1)
                ) / 3).toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-amber-600">
                <ArrowUp size={14} />
                <span>3.4% improvement</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-5 border border-violet-200">
              <div className="text-sm text-violet-700 mb-1">Items Sold</div>
              <div className="text-2xl font-bold text-violet-900 mb-2">
                {(
                  weekData.reduce((sum, d) => sum + (d.totalSold || 0), 0) +
                  monthData.reduce((sum, d) => sum + (d.totalSold || 0), 0) +
                  yearData.reduce((sum, d) => sum + (d.totalSold || 0), 0)
                ).toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-violet-600">
                <ArrowUp size={14} />
                <span>7.8% from last period</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}