"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Printer } from "lucide-react";

// const statusStyles: any = {
//   new: 'bg-blue-100 text-blue-800',
//   discounted: 'bg-purple-100 text-purple-800',
//   low: 'bg-amber-100 text-amber-800',
//   rejected: 'bg-red-100 text-red-800',
//   regular: 'bg-gray-100 text-gray-800',
// };

// const statusLabels: any = {
//   new: 'New Arrival',
//   discounted: 'Discounted',
//   low: 'Low Stock',
//   rejected: 'Rejected',
//   regular: 'Regular',
// };

interface DataTableProps {
  data: any[];
  onEdit: (product: string) => void;
  onDelete: (productId: string) => void;
}

export default function DataTable({ data, onEdit, onDelete }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Product
            </th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Style
            </th> */}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Size
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Quantity
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Color
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th> */}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item: any, index: number) => (
            <motion.tr
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-md w-10 h-10 flex items-center justify-center mr-3">
                    <span className="text-xs font-bold text-gray-500">
                      {item.category.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.category}
                    </div>
                    <div className="text-sm text-gray-500">{item.sku}</div>
                  </div>
                </div>
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.style}
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-md">
                  {item.size}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`text-sm font-medium ${
                    item.quantity < 10 ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {item.quantity}
                </div>
                {item.quantity < 20 && (
                  <div className="text-xs text-red-500">Low stock!</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.color}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                RS {item.sellingPrice}
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                    title="Print"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}
