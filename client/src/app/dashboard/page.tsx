// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Package,
  ShoppingBag,
  BarChart,
  Search,
  Plus,
  Scan,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import DataTable from "@/components/DataTable";
import StockInForm from "@/components/StockInForm";
import SellModal from "@/components/SellModal";
import ReportsChart from "@/components/ReportsCharts";
import StatCard from "@/components/StatCard";
import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import toast from "react-hot-toast";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";
// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showStockIn, setShowStockIn] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortFilter, setSortFilter] = useState<string>("default");
  const [stats, setStats] = useState([
    {
      title: "Total Stock",
      value: "0",
      change: "+0%",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Today's Sales",
      value: "$0",
      change: "+0%",
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    {
      title: "Low Stock Items",
      value: "0",
      change: "+0%",
      icon: BarChart,
      color: "bg-amber-500",
    },
    {
      title: "New Arrivals",
      value: "0",
      change: "+0%",
      icon: Bell,
      color: "bg-purple-500",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  // const [categoryFilter, setCategoryFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
    }
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    setIsLoading(true);
    setError("");
    const token = getAuthToken();
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/filter`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            sortBy: sortFilter !== "default" ? sortFilter : undefined,
          },
        }
      );

      if (response.data.success) {
        setInventory(response.data.products);
        updateStats(response.data.products);
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch products";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  // Update stats based on inventory data
  // Update stats based on inventory data
  const updateStats = (products: any[]) => {
    const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = products.filter((item) => item.quantity < 10).length;
    const newArrivals = products.filter(
      (item) =>
        new Date(item.createdAt) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    setStats([
      {
        title: "Total Stock",
        value: totalStock.toLocaleString(),
        change: "+0%",
        icon: Package,
        color: "bg-blue-500",
      },
      {
        title: "Today's Sales",
        value: "$0", // You might want to calculate actual sales here
        change: "+0%",
        icon: ShoppingBag,
        color: "bg-green-500",
      },
      {
        title: "Low Stock Items",
        value: lowStockItems.toString(),
        change: "+0%",
        icon: BarChart,
        color: "bg-amber-500",
      },
      // {
      //   title: "New Arrivals",
      //   value: newArrivals.toString(),
      //   change: "+0%",
      //   icon: Bell,
      //   color: "bg-purple-500",
      // },
    ]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle barcode scanning
  const handleScan = (sku: string) => {
    console.log("Scanned SKU:", sku);
    const product = inventory.find((item) => item.sku === sku);
    if (product) {
      setScannedProduct(product);
      setShowSellModal(true);
    } else {
      toast.error("Product not found!");
    }
  };

  // Add new product to inventory
  const handleAddProduct = (newProduct: any) => {
    if (!newProduct.createdAt) {
      newProduct.createdAt = new Date().toISOString();
    }
    setInventory(prev => [newProduct, ...prev]);
    setShowStockIn(false);
    fetchProducts();
  };

  // Edit product
  const handleEdit = async (product: any) => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/edit/${product._id}`,
        product,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setInventory((prev) =>
          prev.map((p) => (p._id === product._id ? response.data.product : p))
        );
        toast.success("Product updated successfully!");
        return response.data.product; // Return the updated product
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to update product";
      toast.error(errorMsg);
      throw err; // Re-throw the error to handle in DataTable
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    const token = getAuthToken();

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/delete/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInventory((prev) => prev.filter((p) => p._id !== productId));
      // Add success notification
      toast.success("Product deleted successfully!");
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data?.message);
      // Add error notification
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  // Sell a product
  const handleSell = async (sku: string, quantity: number) => {
    const token = getAuthToken();
    const product = inventory.find((item) => item.sku === sku);
    if (!product) {
      toast.error("Product not found!");
      return;
    }
    if (product.quantity < quantity) {
      toast.error("Not enough stock available!");
      return;
    }
    try {
      setIsLoading(true);
      // Calculate new quantity and new soldCount
      const newQuantity = product.quantity - quantity;
      const newSoldCount = (product.soldCount || 0) + quantity;
      // Prepare updated product data
      const updatedProduct = { ...product, quantity: newQuantity, soldCount: newSoldCount };
      // Make PUT request to update product quantity and soldCount in backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/edit/${product._id}`,
        updatedProduct,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setInventory((prev) =>
          prev.map((item) =>
            item._id === product._id ? { ...item, quantity: newQuantity, soldCount: newSoldCount } : item
          )
        );
        toast.success("Product sold successfully!");
        setShowSellModal(false);
      } else {
        throw new Error(response.data.message || "Failed to update product");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as any)?.response?.data?.message || "Failed to update product";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate search function
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/search`,
        {
          params: { query },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInventory(response.data.products);
      updateStats(response.data.products);
    } catch (error) {
      toast.error("Failed to search products");
    } finally {
      setIsSearching(false);
    }
  };

  // Separate filter function
  // const handleFilter = async (filters: {
  //   category?: string;
  //   sortBy?: string;
  // }) => {
  //   setIsSearching(true);
  //   try {
  //     const token = getAuthToken();
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/filter`,
  //       {
  //         params: filters,
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setInventory(response.data.products);
  //     updateStats(response.data.products);
  //   } catch (error) {
  //     toast.error("Failed to filter products");
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  // Handle search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery);
    } else {
      // If search query is empty, reset to default view
      fetchProducts();
    }
  }, [debouncedSearchQuery]);

  const getStockTrendData = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });

    const stockAddedData = last7Days.map(date => {
      return inventory.reduce((sum, product) => {
        if (!product.createdAt) return sum;
        const created = new Date(product.createdAt);
        if (isNaN(created.getTime())) return sum;
        const productDate = created.toISOString().split('T')[0];
        return productDate === date ? sum + product.quantity : sum;
      }, 0);
    });

    return stockAddedData;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="pt-20 px-6 pb-12 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Stock Management
            </h1>
            <p className="text-gray-500 mt-2">
              Track, manage, and analyze your inventory
            </p>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowSellModal(true)}
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Scan className="h-5 w-5 mr-2" />
              Sell Product
            </button>
            <button
              onClick={() => setShowStockIn(true)}
              className="flex items-center border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Stock
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {["overview", "inventory", "reports", "sacks"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 font-medium relative ${
                activeTab === tab
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-black"
                  layoutId="tabIndicator"
                />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Dashboard Overview
              </h2>



              {/* first Row - Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Inventory Distribution Pie Chart */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Inventory Distribution
                  </h3>
                  <div className="h-64">
                    <Pie
                      data={{
                        labels: ["Clothing", "Accessories"],
                        datasets: [
                          {
                            data: [
                              inventory.filter((i) => i.category === "clothing")
                                .length,
                              inventory.filter(
                                (i) => i.category === "accessories"
                              ).length,
                            ],
                            backgroundColor: ["#3B82F6", "#8B5CF6"],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Top Selling Products Bar Chart */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Top Selling Products
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: inventory
                          .slice() // copy array
                          .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
                          .slice(0, 5)
                          .map((i) => i.subcategory),
                        datasets: [
                          {
                            label: "Units Sold",
                            data: inventory
                              .slice()
                              .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
                              .slice(0, 5)
                              .map((i) => i.soldCount || 0),
                            backgroundColor: "#10B981",
                            borderRadius: 6,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* second Row - Additional Charts */}
                    
            <div className="grid grid-cols-1 gap-6">
              {/* Stock Trend Line Chart */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-medium text-gray-700 mb-4">
                  Stock Trend (Last 7 Days)
                </h3>
                <div className="h-64">
                  <Line
                    data={{
                      labels: [
                        "Day 1",
                        "Day 2",
                        "Day 3",
                        "Day 4",
                        "Day 5",
                        "Day 6",
                        "Today",
                      ],
                      datasets: [
                        {
                          label: "Stock Added",
                          data: getStockTrendData(),
                          borderColor: "#3B82F6",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          tension: 0.3,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

              {/* Quick Stats Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800">
                    Highest Value Item
                  </h4>
                  <p className="text-lg font-semibold mt-1">
                    {inventory.length > 0
                      ? inventory.reduce((prev, current) =>
                          prev.sellingPrice > current.sellingPrice
                            ? prev
                            : current
                        ).subcategory
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="text-sm font-medium text-green-800">
                    Most Stocked Item
                  </h4>
                  <p className="text-lg font-semibold mt-1">
                    {inventory.length > 0
                      ? inventory.reduce((prev, current) =>
                          prev.quantity > current.quantity ? prev : current
                        ).subcategory
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="text-sm font-medium text-amber-800">
                    Lowest Stock Item
                  </h4>
                  <p className="text-lg font-semibold mt-1">
                    {inventory.length > 0
                      ? inventory.reduce((prev, current) =>
                          prev.quantity < current.quantity ? prev : current
                        ).subcategory
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Inventory Management
                </h2>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {isLoading || isSearching ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isSearching
                      ? "Applying filters..."
                      : "Loading inventory..."}
                  </div>
                </div>
              ) : (
                <DataTable
                  key={inventory.length}
                  data={inventory}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sales Reports
              </h2>
              <ReportsChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fast-Moving Products
                </h3>
                {/* Fast moving products list */}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Low Stock Report
                </h3>
                {/* Low stock list */}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "sacks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Sack Management
              </h2>
              {/* Sack management UI */}
            </div>
          </motion.div>
        )}
      </div>

      {/* Stock In Modal */}
      {showStockIn && (
        <StockInForm
          onClose={() => setShowStockIn(false)}
          onAddProduct={handleAddProduct}
        />
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <SellModal
  inventory={inventory}
  onClose={() => setShowSellModal(false)}
  onSell={handleSell}
/>
      )}
    </div>
  );
}
