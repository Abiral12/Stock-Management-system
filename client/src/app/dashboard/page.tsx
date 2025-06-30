// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, ShoppingBag, BarChart, Search, Plus, Scan, Filter } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import DataTable from '@/components/DataTable';
import StockInForm from '@/components/StockInForm';
import SellModal from '@/components/SellModal';
import ReportsChart from '@/components/ReportsCharts';
import StatCard from '@/components/StatCard';
import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showStockIn, setShowStockIn] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState([
    { title: 'Total Stock', value: '0', change: '+0%', icon: Package, color: 'bg-blue-500' },
    { title: 'Today\'s Sales', value: '$0', change: '+0%', icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Low Stock Items', value: '0', change: '+0%', icon: BarChart, color: 'bg-amber-500' },
    { title: 'New Arrivals', value: '0', change: '+0%', icon: Bell, color: 'bg-purple-500' },
  ]);

  // Fetch products from backend
  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    const token = getAuthToken();
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setInventory(response.data.products);
        updateStats(response.data.products);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats based on inventory data
  const updateStats = (products: any[]) => {
    const totalStock = products.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = products.filter(item => item.quantity < 10).length;
    
    setStats([
      { 
        title: 'Total Stock', 
        value: totalStock.toLocaleString(), 
        change: '+0%', 
        icon: Package, 
        color: 'bg-blue-500' 
      },
      { 
        title: 'Today\'s Sales', 
        value: '$0', 
        change: '+0%', 
        icon: ShoppingBag, 
        color: 'bg-green-500' 
      },
      { 
        title: 'Low Stock Items', 
        value: lowStockItems.toString(), 
        change: '+0%', 
        icon: BarChart, 
        color: 'bg-amber-500' 
      },
      { 
        title: 'New Arrivals', 
        value: '0', 
        change: '+0%', 
        icon: Bell, 
        color: 'bg-purple-500' 
      },
    ]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle barcode scanning
  const handleScan = (sku: string) => {
    const product = inventory.find(item => item.sku === sku);
    if (product) {
      setScannedProduct(product);
      setShowSellModal(true);
    }
  };

  // Add new product to inventory
  const handleAddProduct = (newProduct: any) => {
    setInventory(prev => [newProduct, ...prev]);
    setShowStockIn(false);
    fetchProducts(); // Refresh data to get accurate stats
  };

  // Edit product
  const handleEdit = async (product: any) => {
    const token = getAuthToken();
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products//edit/:id`,
        product,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setInventory(prev => 
          prev.map(p => p._id === product._id ? response.data.product : p)
        );
      }
    } catch (err: any) {
      console.error('Update failed:', err.response?.data?.message);
    }
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    const token = getAuthToken();
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/edit/:id`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setInventory(prev => prev.filter(p => p._id !== productId));
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data?.message);
    }
  };

  // Sell a product
  const handleSell = (sku: string, quantity: number) => {
    setInventory(inventory.map(item => 
      item.sku === sku ? {...item, quantity: item.quantity - quantity} : item
    ));
    setShowSellModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="pt-20 px-6 pb-12 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-500 mt-2">Track, manage, and analyze your inventory</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
          {['overview', 'reports', 'sacks'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 font-medium relative ${activeTab === tab ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
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
        
        {/* Main Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Inventory Overview</h2>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50">
                    <Filter className="h-5 w-5 mr-1 text-gray-600" />
                    Filters
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Loading inventory...</p>
                </div>
              ) : (
                <DataTable 
                  data={inventory} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Reports</h2>
              <ReportsChart />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fast-Moving Products</h3>
                {/* Fast moving products list */}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Report</h3>
                {/* Low stock list */}
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'sacks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sack Management</h2>
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
          product={scannedProduct}
          onClose={() => setShowSellModal(false)}
          onSell={handleSell}
          onScan={handleScan}
        />
      )}
    </div>
  );
}