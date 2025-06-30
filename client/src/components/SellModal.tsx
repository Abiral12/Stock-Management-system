// components/SellModal.tsx
'use client';

import { motion } from 'framer-motion';
import { X, Scan, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const SellModal = ({ product, onClose, onSell, onScan }: any) => {
  const [scannedSKU, setScannedSKU] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(product ? 1 : 0); // 0: scan, 1: product details

  const handleScanSubmit = (e: any) => {
    e.preventDefault();
    onScan(scannedSKU);
  };

  const handleSellSubmit = (e: any) => {
    e.preventDefault();
    onSell(product.sku, quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="border-b border-gray-200 p-6 flex items-center">
          {step === 1 && (
            <button onClick={() => setStep(0)} className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {step === 0 ? 'Scan Product' : 'Sell Product'}
          </h2>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {step === 0 ? (
            <form onSubmit={handleScanSubmit}>
              <div className="mb-6">
                <div className="relative">
                  <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={scannedSKU}
                    onChange={(e) => setScannedSKU(e.target.value)}
                    placeholder="Scan barcode or enter SKU"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    autoFocus
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Use a barcode scanner or enter SKU manually
                </p>
              </div>
              
              <button 
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Find Product
              </button>
            </form>
          ) : (
            <form onSubmit={handleSellSubmit}>
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gray-100 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{product.category} - {product.style}</h3>
                <p className="text-gray-500">SKU: {product.sku}</p>
                <div className="mt-2 flex space-x-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    Size: {product.size}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    Price: ${product.price}
                  </span>
                </div>
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.quantity > 10 ? 'bg-green-100 text-green-800' : 
                    product.quantity > 5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    Stock: {product.quantity} {product.quantity > 10 ? '(Good)' : product.quantity > 5 ? '(Low)' : '(Very Low)'}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Sell
                </label>
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-l-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2 border-t border-b border-gray-300 text-center"
                    min="1"
                    max={product.quantity}
                  />
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">${product.price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Complete Sale
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SellModal;