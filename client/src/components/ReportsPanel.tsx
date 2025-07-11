'use client';

import ReportsChart from '@/components/ReportsCharts';
import SalesComparison from '@/components/salesComparison';
import { motion } from 'framer-motion';

interface ReportsPanelProps {
  fetchSalesTrends: (period?: string, start?: string, end?: string) => Promise<any>;
  fetchSalesComparison: (period1Start: string, period1End: string, period2Start: string, period2End: string) => Promise<any>;
}

export default function ReportsPanel({ fetchSalesTrends, fetchSalesComparison }: ReportsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Sales Reports
        </h2>
        <ReportsChart fetchSalesTrends={fetchSalesTrends} />
        <SalesComparison fetchSalesComparison={fetchSalesComparison} />
      </div>


    </motion.div>
  );
} 