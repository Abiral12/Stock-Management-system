'use client';

import ReportsChart from '@/components/ReportsCharts';
import SalesComparison from '@/components/salesComparison';
import { motion } from 'framer-motion';

interface ReportsPanelProps {
  fetchSalesTrends: (period?: string, start?: string, end?: string) => Promise<any>;
  fetchSalesComparison: (period1Start: string, period1End: string, period2Start: string, period2End: string) => Promise<any>;
  isMobile?: boolean;
}

export default function ReportsPanel({ 
  fetchSalesTrends, 
  fetchSalesComparison,
  isMobile = false 
}: ReportsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`bg-white rounded-xl shadow-sm ${isMobile ? 'p-4' : 'p-6'}`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-4`}>
          Sales Reports
        </h2>
        
        <div className={isMobile ? "space-y-4" : "space-y-6"}>
          <ReportsChart 
            fetchSalesTrends={fetchSalesTrends} 
            chartHeight={isMobile ? 250 : 350}
          />
          <SalesComparison 
            fetchSalesComparison={fetchSalesComparison} 
            chartHeight={isMobile ? 250 : 350}
          />
        </div>
      </div>
    </motion.div>
  );
}