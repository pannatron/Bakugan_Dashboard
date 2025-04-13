'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from './AuthProvider';

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

interface PricePoint {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

interface BakuganCardProps {
  id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  priceHistory: PricePoint[];
  onUpdatePrice: (id: string, price: number, notes: string, referenceUri: string, date: string) => void;
  onUpdateDetails?: (
    id: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    referenceUri: string
  ) => void;
}

const BakuganCard = ({
  id,
  names,
  size,
  element,
  specialProperties,
  imageUrl,
  currentPrice,
  referenceUri,
  priceHistory,
  onUpdatePrice,
  onUpdateDetails,
}: BakuganCardProps) => {
  const { user } = useAuth();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(true); // Always show price history by default
  const [timePeriod, setTimePeriod] = useState('all'); // Default to showing all price history
  const [newPrice, setNewPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [newReferenceUri, setNewReferenceUri] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]); // Add date state with current date as default
  const [isChartLoading, setIsChartLoading] = useState(true); // Add loading state for chart
  
  // Edit form states
  const [editNames, setEditNames] = useState<string[]>([...names]);
  const [editSize, setEditSize] = useState(size);
  const [editElement, setEditElement] = useState(element);
  const [editSpecialProperties, setEditSpecialProperties] = useState(specialProperties);
  const [editImageUrl, setEditImageUrl] = useState(imageUrl);
  const [editReferenceUri, setEditReferenceUri] = useState(referenceUri);

  const handleAddName = () => {
    setEditNames([...editNames, '']);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...editNames];
    newNames[index] = value;
    setEditNames(newNames);
  };

  const handleRemoveName = (index: number) => {
    if (editNames.length > 1) {
      const newNames = [...editNames];
      newNames.splice(index, 1);
      setEditNames(newNames);
    }
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(newPrice);
    if (!isNaN(priceValue) && priceValue > 0) {
      onUpdatePrice(id, priceValue, notes, newReferenceUri, updateDate);
      setNewPrice('');
      setNotes('');
      setNewReferenceUri('');
      setShowUpdateForm(false);
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateDetails) {
      const filteredNames = editNames.filter(name => name.trim() !== '');
      if (filteredNames.length > 0) {
        onUpdateDetails(
          id,
          filteredNames,
          editSize,
          editElement,
          editSpecialProperties,
          editImageUrl,
          editReferenceUri
        );
        setShowEditForm(false);
      }
    }
  };

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

  // Calculate price trends based on filtered data
  // Since our data is now in reverse chronological order (newest first),
  // we need to calculate the trend differently
  const calculatePriceTrend = () => {
    if (filteredPriceHistory.length < 2) return { trend: 'stable', percentage: 0 };
    
    // The newest price is the first item in the array
    const newestPrice = filteredPriceHistory[0].price;
    // The oldest price is the last item in the array
    const oldestPrice = filteredPriceHistory[filteredPriceHistory.length - 1].price;
    
    const priceDiff = newestPrice - oldestPrice;
    const percentageChange = (priceDiff / oldestPrice) * 100;
    
    let trend = 'stable';
    if (percentageChange > 1) trend = 'up';
    if (percentageChange < -1) trend = 'down';
    
    return {
      trend,
      percentage: Math.abs(percentageChange).toFixed(1)
    };
  };
  
  const priceTrend = calculatePriceTrend();

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

  // Set chart as loaded when price history data is available or confirmed empty
  useEffect(() => {
    // Always start with loading state true
    setIsChartLoading(true);
    
    if (priceHistory) {
      // Short timeout to ensure smooth transition and complete loading
      const timer = setTimeout(() => {
        setIsChartLoading(false);
      }, 800); // Increased timeout to ensure data is fully loaded
      return () => clearTimeout(timer);
    }
  }, [priceHistory]);

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-premium hover:-translate-y-1 card-shimmer animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image and Info */}
        <div className="md:w-1/3">
          <div className="relative w-full h-48 md:h-64 mb-4 overflow-hidden rounded-xl">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={names && names.length > 0 ? names[0] : 'Bakugan'}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-blue-600/20">
                <span className="text-blue-300">{names && names.length > 0 ? names[0].charAt(0) : 'B'}</span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600 animate-gradient-x mb-2 uppercase">
            {names && names.length > 0 ? names[0] : 'Unknown Bakugan'}
          </h2>
          
          {names && names.length > 1 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Also known as:</p>
              <div className="flex flex-wrap gap-1">
                {names.slice(1).map((altName, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300"
                  >
                    {altName}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gray-800/50 text-center">
              <p className="text-xs text-gray-400">Size</p>
              <p className="text-sm text-blue-300 font-medium uppercase">{size}</p>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/50 text-center">
              <p className="text-xs text-gray-400">Element</p>
              <p className="text-sm text-blue-300 font-medium uppercase">{element}</p>
            </div>
          </div>
          
          {specialProperties && (
            <div className="p-2 rounded-lg bg-purple-900/20 border border-purple-800/30 mb-4">
              <p className="text-xs text-gray-400">Special Properties</p>
              <p className="text-sm text-purple-300">{specialProperties}</p>
            </div>
          )}
          
          <div className="p-3 rounded-xl bg-gradient-to-r from-green-600/30 to-green-400/30 hover:from-green-600/40 hover:to-green-400/40 mb-4">
            <div className="font-bold flex items-center justify-between text-green-300">
              <span className="flex items-center gap-2">
                Current Price
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div className="relative">
                <div className={`w-20 h-6 bg-gradient-to-r from-green-600/20 to-green-400/20 animate-pulse rounded-lg ${!isChartLoading ? 'hidden' : ''}`}></div>
                <span className={`text-lg ${isChartLoading ? 'invisible absolute' : ''}`}>฿{priceHistory.length > 0 ? priceHistory[0].price.toLocaleString() : currentPrice.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Price trend indicator */}
            {priceHistory.length > 1 && !isChartLoading && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">Price Trend:</span>
                <span className={`text-xs font-medium flex items-center gap-1 ${
                  priceTrend.trend === 'up' 
                    ? 'text-green-400' 
                    : priceTrend.trend === 'down' 
                      ? 'text-red-400' 
                      : 'text-gray-400'
                }`}>
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
                    ? `${priceTrend.percentage}%` 
                    : 'Stable'
                  }
                </span>
              </div>
            )}
            
            {!isChartLoading && (priceHistory.length > 0 ? priceHistory[0].referenceUri : referenceUri) && (
              <div className="mt-2 text-xs text-gray-400">
                <a 
                  href={priceHistory.length > 0 ? priceHistory[0].referenceUri || referenceUri : referenceUri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Reference
                </a>
              </div>
            )}
          </div>
          
          {/* Admin buttons */}
          {user?.isAdmin && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setShowUpdateForm(!showUpdateForm);
                  setShowEditForm(false);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {showUpdateForm ? 'Cancel' : 'Update Price'}
              </button>
              
              {onUpdateDetails && (
                <button
                  onClick={() => {
                    setShowEditForm(!showEditForm);
                    setShowUpdateForm(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  {showEditForm ? 'Cancel' : 'Edit Details'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chart, Update Form, and Edit Form */}
        <div className="md:w-2/3">
          {/* Price History Chart - Moved to top position */}
          {!showUpdateForm && !showEditForm && (
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
            </>
          )}
          
          {showUpdateForm && user?.isAdmin ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 animate-fade-in">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">Update Price</h3>
              <form onSubmit={handlePriceSubmit} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                    New Price (฿)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Enter new price"
                  />
                </div>
                
                {/* Date Field */}
                <div>
                  <label htmlFor="updateDate" className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="updateDate"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="referenceUri" className="block text-sm font-medium text-gray-300 mb-1">
                    Reference URI (optional)
                  </label>
                  <input
                    type="text"
                    id="referenceUri"
                    value={newReferenceUri}
                    onChange={(e) => setNewReferenceUri(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Enter reference URI for price"
                  />
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Add notes about this price update"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Save Price Update
                </button>
              </form>
            </div>
          ) : showEditForm && user?.isAdmin && onUpdateDetails ? (
            <div className="bg-gradient-to-b from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 animate-fade-in">
              <h3 className="text-lg font-semibold text-purple-300 mb-4">Edit Bakugan Details</h3>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                {/* Names */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-300">
                      Names
                    </label>
                    <button
                      type="button"
                      onClick={handleAddName}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      + Add another name
                    </button>
                  </div>
                  
                  {editNames.map((name, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        required={index === 0}
                        className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                        placeholder={index === 0 ? "Primary name (required)" : `Alternative name ${index + 1}`}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveName(index)}
                          className="p-2 text-gray-400 hover:text-red-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Size */}
                <div>
                  <label htmlFor="editSize" className="block text-sm font-medium text-gray-300 mb-1">
                    Size
                  </label>
                  <select
                    id="editSize"
                    value={editSize}
                    onChange={(e) => setEditSize(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="B3">B3</option>
                  </select>
                </div>

                {/* Element */}
                <div>
                  <label htmlFor="editElement" className="block text-sm font-medium text-gray-300 mb-1">
                    Element
                  </label>
                  <input
                    type="text"
                    id="editElement"
                    value={editElement}
                    onChange={(e) => setEditElement(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Enter Bakugan element"
                  />
                </div>

                {/* Special Properties */}
                <div>
                  <label htmlFor="editSpecialProperties" className="block text-sm font-medium text-gray-300 mb-1">
                    Special Properties (optional)
                  </label>
                  <input
                    type="text"
                    id="editSpecialProperties"
                    value={editSpecialProperties}
                    onChange={(e) => setEditSpecialProperties(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Transparent, pearl color, prototype, etc."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="editImageUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    id="editImageUrl"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Enter image URL"
                  />
                </div>

                {/* Reference URI */}
                <div>
                  <label htmlFor="editReferenceUri" className="block text-sm font-medium text-gray-300 mb-1">
                    Reference URI (optional)
                  </label>
                  <input
                    type="text"
                    id="editReferenceUri"
                    value={editReferenceUri}
                    onChange={(e) => setEditReferenceUri(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    placeholder="Enter reference URI"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            <></>
          )}

          {/* Price History Table - With scrollbar */}
          {!showUpdateForm && !showEditForm && showPriceHistory && priceHistory.length > 0 && !isChartLoading && (
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
        </div>
      </div>
    </div>
  );
};

export default BakuganCard;
