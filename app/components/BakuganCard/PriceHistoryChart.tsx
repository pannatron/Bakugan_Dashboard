'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useState } from 'react';
import { PricePoint, PriceTrend } from './types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  isChartLoading: boolean;
  priceTrend: PriceTrend;
}

const PriceHistoryChart = ({
  priceHistory,
  isChartLoading,
  priceTrend,
}: PriceHistoryChartProps) => {
  const [timePeriod, setTimePeriod] = useState('all'); // Default to showing all price history
  const [showPriceHistory, setShowPriceHistory] = useState(true); // Always show price history by default

  // Filter price history based on selected time period
  const getFilteredPriceHistory = () => {
    if (timePeriod === 'all' || priceHistory.length <= 1) {
      return priceHistory;
    }
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timePeriod) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return priceHistory;
    }
    
    const cutoffTime = cutoffDate.getTime();
    
    // Filter price history to only include points after the cutoff date
    const filtered = priceHistory.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate.getTime() >= cutoffTime;
    });
    
    // If no data points in the selected period, return at least the most recent point
    if (filtered.length === 0 && priceHistory.length > 0) {
      const sortedHistory = [...priceHistory].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return [sortedHistory[0]];
    }
    
    return filtered;
  };
  
  const filteredPriceHistory = getFilteredPriceHistory();

  // Function to handle chart point clicks
  const handleChartClick = (event: any, elements: any) => {
    if (elements && elements.length > 0) {
      const clickedIndex = elements[0].index;
      // We need to reverse the index since our chart data is reversed from the original priceHistory
      const actualIndex = filteredPriceHistory.length - 1 - clickedIndex;
      const referenceUri = filteredPriceHistory[actualIndex]?.referenceUri;
      
      if (referenceUri) {
        window.open(referenceUri, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Reverse the order of the data points to match the table (newest first)
  // This ensures the chart shows the same order as the table (3020, 3000, 2600)
  const chartData = {
    labels: [...filteredPriceHistory].reverse().map((point) => {
      if (typeof point.timestamp === 'string' && point.timestamp.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // If it's a date string in YYYY-MM-DD format, display it directly
        return point.timestamp;
      } else {
        // Otherwise, format it as a localized date
        const date = new Date(point.timestamp);
        return date.toLocaleDateString('th-TH', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit'
        });
      }
    }),
    datasets: [
      {
        label: 'Price History',
        data: [...filteredPriceHistory].reverse().map((point) => point.price),
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value: number) => `฿${value.toLocaleString()}`,
        },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Price: ฿${context.raw.toLocaleString()}`,
          afterLabel: (context: any) => {
            const dataIndex = context.dataIndex;
            const notes = priceHistory[dataIndex]?.notes;
            const referenceUri = filteredPriceHistory[filteredPriceHistory.length - 1 - dataIndex]?.referenceUri;
            
            let tooltipText = '';
            if (notes && notes !== 'Price updated via Add form') {
              tooltipText += `Notes: ${notes}`;
            }
            
            if (referenceUri) {
              if (tooltipText) tooltipText += '\n';
              tooltipText += 'Click to open reference link';
            }
            
            return tooltipText;
          },
        },
      },
    },
    onClick: handleChartClick,
    // Add cursor style to indicate clickable points
    onHover: (event: any, elements: any) => {
      const chartCanvas = event.chart.canvas;
      chartCanvas.style.cursor = elements && elements.length > 0 ? 'pointer' : 'default';
    },
  };

  return (
    <>
      {/* Price History Chart */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50 mb-6 transition-all duration-500">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-300">Price History</h3>
            {priceHistory.length > 1 && !isChartLoading && (
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                priceTrend.trend === 'up' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : priceTrend.trend === 'down' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
              }`}>
                <span className="flex items-center gap-1">
                  {priceTrend.trend === 'up' && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                  {priceTrend.trend === 'down' && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  {priceTrend.trend === 'stable' && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                    </svg>
                  )}
                  {priceTrend.trend !== 'stable' 
                    ? `${priceTrend.percentage}% ${priceTrend.trend === 'up' ? 'Increase' : 'Decrease'}` 
                    : 'Stable Price'
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Time period selector */}
          {priceHistory.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimePeriod('24h')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === '24h' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                24H
              </button>
              <button
                onClick={() => setTimePeriod('7d')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === '7d' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimePeriod('1m')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === '1m' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                1M
              </button>
              <button
                onClick={() => setTimePeriod('3m')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === '3m' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                3M
              </button>
              <button
                onClick={() => setTimePeriod('1y')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === '1y' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                1Y
              </button>
              <button
                onClick={() => setTimePeriod('all')}
                className={`px-2 py-1 text-xs rounded-md ${
                  timePeriod === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ALL
              </button>
            </div>
          )}
        </div>
        
        <div className="h-72 relative">
          {isChartLoading ? (
            // Skeleton loading for chart
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 bg-gradient-to-r from-gray-800/30 to-gray-700/20 animate-pulse rounded-lg"></div>
                <div className="h-8 mt-2 bg-gradient-to-r from-gray-800/30 to-gray-700/20 animate-pulse rounded-lg"></div>
              </div>
            </div>
          ) : priceHistory.length > 0 ? (
            <>
              <div className="absolute -top-6 right-0 text-xs text-gray-400 p-1 bg-gray-900/50 rounded">
                {filteredPriceHistory.some(point => point.referenceUri) && 
                  "Click points for links"}
              </div>
              <Line data={chartData} options={chartOptions as any} />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">No price history available</p>
            </div>
          )}
        </div>
        
        {!isChartLoading && filteredPriceHistory.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-gray-800/50">
              <p className="text-gray-400">Lowest</p>
              <p className="text-blue-300 font-medium">
                ฿{Math.min(...filteredPriceHistory.map(p => p.price)).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50">
              <p className="text-gray-400">Average</p>
              <p className="text-blue-300 font-medium">
                ฿{(filteredPriceHistory.reduce((sum, p) => sum + p.price, 0) / filteredPriceHistory.length).toLocaleString(undefined, {maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50">
              <p className="text-gray-400">Highest</p>
              <p className="text-blue-300 font-medium">
                ฿{Math.max(...filteredPriceHistory.map(p => p.price)).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Toggle Button for Price History Table */}
      {priceHistory.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowPriceHistory(!showPriceHistory)}
            className="px-3 py-1 rounded-lg bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            {showPriceHistory ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Hide Details
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Show Details
              </>
            )}
          </button>
        </div>
      )}

      {/* Price History Table - With scrollbar */}
      {showPriceHistory && priceHistory.length > 0 && !isChartLoading && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-800/50">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800/50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <table className="min-w-full divide-y divide-gray-800">
              <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                {/* Price history is already sorted by the API (newest first) */}
                {priceHistory.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {typeof point.timestamp === 'string' && point.timestamp.match(/^\d{4}-\d{2}-\d{2}$/)
                        ? point.timestamp // Display the date string directly if it's in YYYY-MM-DD format
                        : new Date(point.timestamp).toLocaleDateString('th-TH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-300 font-medium text-left">
                      ฿{point.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-left">
                      {point.referenceUri ? (
                        <a 
                          href={point.referenceUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-blue-400 hover:underline">View Reference</span>
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default PriceHistoryChart;
