import { notFound } from 'next/navigation';
import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

interface Product {
  _id: string;
  sku: string;
  category: string;
  subcategory: string;
  size?: string;
  color?: string;
  quantity: number;
  sellingPrice: number;
  qrCode: string;
}

export default async function ProductPage({ params }: { params: { sku: string } }) {
  const token = getAuthToken();
  if (!token) notFound();

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/sku/${params.sku}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const product: Product = response.data.product;
    
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <img 
                src={product.qrCode} 
                alt={`QR Code for ${product.sku}`}
                className="w-full h-auto border border-gray-200 rounded-lg"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                Scan this QR code to view product details
              </p>
            </div>
            
            <div className="md:w-2/3">
              <h1 className="text-2xl font-bold text-gray-900">
                {product.category} - {product.subcategory}
              </h1>
              <p className="text-gray-600 mt-2">SKU: {product.sku}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">₹{product.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className={`font-medium ${
                    product.quantity > 10 ? 'text-green-600' : 
                    product.quantity > 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.quantity} units
                  </p>
                </div>
                {product.size && (
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium">{product.size}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{product.color}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                  View in Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}