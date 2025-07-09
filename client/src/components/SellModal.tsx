// components/SellModal.tsx
'use client';

import { motion } from 'framer-motion';
import { X, Scan, ArrowLeft, CameraOff, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  category: string;
  subcategory: string;
  style: string;
  sku: string;
  size: string;
  price: number;
  sellingPrice: number;
  color: string;
  quantity: number;
}

interface SellModalProps {
  inventory: Product[];
  onClose: () => void;
  onSell: (sku: string, quantity: number) => void;
}

const SellModal = ({ inventory, onClose, onSell }: SellModalProps) => {
  const [scannedSKU, setScannedSKU] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(0); // 0: scan, 1: product details
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Initialize and clean up scanner
  useEffect(() => {
    if (isScannerActive && scannerContainerRef.current) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
      scannerRef.current
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            setScannedSKU(decodedText);
            setIsScannerActive(false);
            // Automatically try to find product
            handleFindProduct(decodedText);
          },
          (errorMessage) => {
            console.log('Scan error:', errorMessage);
          }
        )
        .catch((err) => {
          console.error('Camera error:', err);
          setIsScannerActive(false);
        });
    }
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerActive]);

  const handleFindProduct = (sku: string) => {
    setError('');
    const product = inventory.find((item) => item.sku === sku);
    if (product) {
      setFoundProduct(product);
      setStep(1);
      setQuantity(1);
    } else {
      setFoundProduct(null);
      setError('Product not found!');
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFindProduct(scannedSKU);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (foundProduct) {
      onSell(foundProduct.sku, quantity);
      setStep(0);
      setScannedSKU('');
      setFoundProduct(null);
      setQuantity(1);
    }
  };

  // Reset modal state when closed
  useEffect(() => {
    if (step === 0) {
      setScannedSKU('');
      setFoundProduct(null);
      setError('');
      setQuantity(1);
    }
  }, [step]);

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
            {step === 0 ? 'Scan or Enter SKU' : 'Sell Product'}
          </h2>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {step === 0 ? (
            <form onSubmit={handleScanSubmit}>
              {isScannerActive ? (
                <div className="mb-6 relative">
                  <div
                    id="scanner-container"
                    ref={scannerContainerRef}
                    className="h-64 w-full bg-black rounded-lg overflow-hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-blue-400 border-dashed rounded-lg w-48 h-48" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerActive(false)}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
                  >
                    <CameraOff size={20} />
                  </button>
                </div>
              ) : (
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
                  <button
                    type="button"
                    onClick={() => setIsScannerActive(true)}
                    className="w-full mt-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Use a barcode scanner or enter SKU manually
                  </p>
                </div>
              )}
              {error && (
                <div className="flex items-center text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
                  <AlertCircle className="mr-2" size={18} />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                disabled={!scannedSKU}
              >
                Find Product
              </button>
            </form>
          ) : foundProduct ? (
            <form onSubmit={handleSellSubmit}>
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gray-100 border rounded-xl w-full p-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="text-gray-900">{foundProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Subcategory:</span>
                      <span className="text-gray-900">{foundProduct.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Size:</span>
                      <span className="text-gray-900">{foundProduct.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Color:</span>
                      <span className="text-gray-900">{foundProduct.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Selling Price:</span>
                      <span className="text-gray-900">RS {foundProduct.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Stock Quantity:</span>
                      <span className={`font-semibold ${foundProduct.quantity > 10 ? 'text-green-700' : foundProduct.quantity > 5 ? 'text-yellow-700' : 'text-red-700'}`}>{foundProduct.quantity}</span>
                    </div>
                  </div>
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
                    onChange={(e) => setQuantity(Math.max(1, Math.min(foundProduct.quantity, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-2 border-t border-b border-gray-300 text-center"
                    min="1"
                    max={foundProduct.quantity}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(foundProduct.quantity, quantity + 1))}
                    className="px-4 py-2 border border-gray-300 rounded-r-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">RS {foundProduct.sellingPrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>RS {(foundProduct.sellingPrice * quantity).toFixed(2)}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Complete Sale
              </button>
            </form>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default SellModal;