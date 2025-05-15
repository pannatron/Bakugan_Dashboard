'use client';

import { useMemo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PortfolioItem {
  portfolioId: string;
  addedAt: string;
  notes?: string;
  quantity: number;
  bakugan: any;
}

interface PortfolioAnalyticsProps {
  portfolioItems: PortfolioItem[];
}

const PortfolioAnalytics = ({ portfolioItems }: PortfolioAnalyticsProps) => {
  // Calculate star rating distribution
  const starRatingDistribution = useMemo(() => {
    const distribution = Array(10).fill(0); // 1-10 stars
    
    portfolioItems.forEach(item => {
      if (item.bakugan && typeof item.bakugan.difficultyOfObtaining === 'number') {
        const rating = Math.min(Math.max(Math.floor(item.bakugan.difficultyOfObtaining), 1), 10);
        distribution[rating - 1] += item.quantity || 1;
      }
    });
    
    return distribution;
  }, [portfolioItems]);
  
  // Calculate price range distribution
  const priceRangeDistribution = useMemo(() => {
    const ranges = {
      'Under ฿1,000': 0,
      '฿1,000 - ฿3,000': 0,
      '฿3,000 - ฿5,000': 0,
      '฿5,000 - ฿10,000': 0,
      '฿10,000 - ฿20,000': 0,
      'Over ฿20,000': 0,
    };
    
    portfolioItems.forEach(item => {
      if (item.bakugan && typeof item.bakugan.currentPrice === 'number') {
        const price = item.bakugan.currentPrice;
        const quantity = item.quantity || 1;
        
        if (price < 1000) {
          ranges['Under ฿1,000'] += quantity;
        } else if (price < 3000) {
          ranges['฿1,000 - ฿3,000'] += quantity;
        } else if (price < 5000) {
          ranges['฿3,000 - ฿5,000'] += quantity;
        } else if (price < 10000) {
          ranges['฿5,000 - ฿10,000'] += quantity;
        } else if (price < 20000) {
          ranges['฿10,000 - ฿20,000'] += quantity;
        } else {
          ranges['Over ฿20,000'] += quantity;
        }
      }
    });
    
    return ranges;
  }, [portfolioItems]);
  
  // Calculate element distribution
  const elementDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    portfolioItems.forEach(item => {
      if (item.bakugan && item.bakugan.element) {
        const element = item.bakugan.element;
        const quantity = item.quantity || 1;
        
        if (distribution[element]) {
          distribution[element] += quantity;
        } else {
          distribution[element] = quantity;
        }
      }
    });
    
    return distribution;
  }, [portfolioItems]);
  
  // Calculate series distribution
  const seriesDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    portfolioItems.forEach(item => {
      if (item.bakugan && item.bakugan.series) {
        const series = item.bakugan.series || 'Unknown';
        const quantity = item.quantity || 1;
        
        if (distribution[series]) {
          distribution[series] += quantity;
        } else {
          distribution[series] = quantity;
        }
      }
    });
    
    // Sort by count and take top 5
    const sortedEntries = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // If there are more than 5 series, add an "Others" category
    const otherCount = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(5)
      .reduce((sum, [_, count]) => sum + count, 0);
    
    const result: Record<string, number> = {};
    sortedEntries.forEach(([series, count]) => {
      result[series] = count;
    });
    
    if (otherCount > 0) {
      result['Others'] = otherCount;
    }
    
    return result;
  }, [portfolioItems]);
  
  // Modern gradient colors for charts
  const gradientColors = {
    blues: ['rgba(56, 189, 248, 0.9)', 'rgba(59, 130, 246, 0.9)', 'rgba(79, 70, 229, 0.9)'],
    purples: ['rgba(168, 85, 247, 0.9)', 'rgba(139, 92, 246, 0.9)', 'rgba(124, 58, 237, 0.9)'],
    pinks: ['rgba(236, 72, 153, 0.9)', 'rgba(219, 39, 119, 0.9)', 'rgba(190, 24, 93, 0.9)'],
    oranges: ['rgba(249, 115, 22, 0.9)', 'rgba(234, 88, 12, 0.9)', 'rgba(194, 65, 12, 0.9)'],
    greens: ['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)', 'rgba(4, 120, 87, 0.9)'],
    reds: ['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)', 'rgba(185, 28, 28, 0.9)'],
    yellows: ['rgba(251, 191, 36, 0.9)', 'rgba(245, 158, 11, 0.9)', 'rgba(217, 119, 6, 0.9)'],
    teals: ['rgba(20, 184, 166, 0.9)', 'rgba(13, 148, 136, 0.9)', 'rgba(15, 118, 110, 0.9)'],
    cyans: ['rgba(6, 182, 212, 0.9)', 'rgba(8, 145, 178, 0.9)', 'rgba(14, 116, 144, 0.9)'],
    indigos: ['rgba(99, 102, 241, 0.9)', 'rgba(79, 70, 229, 0.9)', 'rgba(67, 56, 202, 0.9)'],
  };
  
  // Create a vibrant color palette for charts
  const createGradientPalette = (count: number) => {
    const allColors = [
      ...gradientColors.blues,
      ...gradientColors.purples,
      ...gradientColors.pinks,
      ...gradientColors.oranges,
      ...gradientColors.greens,
      ...gradientColors.reds,
      ...gradientColors.yellows,
      ...gradientColors.teals,
      ...gradientColors.cyans,
      ...gradientColors.indigos,
    ];
    
    // Ensure we have enough colors by repeating the palette if needed
    const extendedColors = [...allColors];
    while (extendedColors.length < count) {
      extendedColors.push(...allColors);
    }
    
    return extendedColors.slice(0, count);
  };
  
  // Star rating chart data with modern colors
  const starRatingData = {
    labels: Array.from({ length: 10 }, (_, i) => `${i + 1} Star${i === 0 ? '' : 's'}`),
    datasets: [
      {
        label: 'Bakugan Count',
        data: starRatingDistribution,
        backgroundColor: [
          'rgba(56, 189, 248, 0.8)', // 1 star
          'rgba(59, 130, 246, 0.8)', // 2 stars
          'rgba(99, 102, 241, 0.8)', // 3 stars
          'rgba(139, 92, 246, 0.8)',  // 4 stars
          'rgba(168, 85, 247, 0.8)',  // 5 stars
          'rgba(217, 70, 239, 0.8)',  // 6 stars
          'rgba(236, 72, 153, 0.8)',  // 7 stars
          'rgba(244, 63, 94, 0.8)',   // 8 stars
          'rgba(248, 113, 113, 0.8)', // 9 stars
          'rgba(251, 146, 60, 0.8)',  // 10 stars
        ],
        borderColor: [
          'rgba(56, 189, 248, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(217, 70, 239, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(251, 146, 60, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
        hoverBorderWidth: 3,
      },
    ],
  };
  
  // Price range chart data with modern colors
  const priceRangeLabels = Object.keys(priceRangeDistribution);
  const priceRangeValues = Object.values(priceRangeDistribution);
  const priceRangeColors = createGradientPalette(priceRangeLabels.length);
  
  const priceRangeData = {
    labels: priceRangeLabels,
    datasets: [
      {
        label: 'Bakugan Count',
        data: priceRangeValues,
        backgroundColor: priceRangeColors,
        borderColor: priceRangeColors.map(color => color.replace('0.9', '1')),
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 3,
      },
    ],
  };
  
  // Element distribution chart data with modern colors
  const elementLabels = Object.keys(elementDistribution);
  const elementValues = Object.values(elementDistribution);
  
  // Custom colors for specific elements
  const elementColorMap: Record<string, string> = {
    'Pyrus': 'rgba(244, 63, 94, 0.9)',    // Red
    'Aquos': 'rgba(56, 189, 248, 0.9)',   // Blue
    'Haos': 'rgba(251, 191, 36, 0.9)',    // Yellow
    'Ventus': 'rgba(16, 185, 129, 0.9)',  // Green
    'Darkus': 'rgba(168, 85, 247, 0.9)',  // Purple
    'Subterra': 'rgba(249, 115, 22, 0.9)', // Orange
  };
  
  // Generate colors for elements, using the map for known elements
  const elementColors = elementLabels.map(element => 
    elementColorMap[element] || createGradientPalette(1)[0]
  );
  
  const elementData = {
    labels: elementLabels,
    datasets: [
      {
        label: 'Bakugan Count',
        data: elementValues,
        backgroundColor: elementColors,
        borderColor: elementColors.map(color => color.replace('0.9', '1')),
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 3,
      },
    ],
  };
  
  // Series distribution chart data with modern colors
  const seriesLabels = Object.keys(seriesDistribution);
  const seriesValues = Object.values(seriesDistribution);
  const seriesColors = createGradientPalette(seriesLabels.length);
  
  const seriesData = {
    labels: seriesLabels,
    datasets: [
      {
        label: 'Bakugan Count',
        data: seriesValues,
        backgroundColor: seriesColors,
        borderColor: seriesColors.map(color => color.replace('0.9', '1')),
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 3,
      },
    ],
  };
  
  // Enhanced chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '35%', // Donut style
    radius: '90%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: 'bold' as const
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(99, 102, 241, 0.6)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Horizontal bar chart
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'Inter', sans-serif",
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: "'Inter', sans-serif",
          },
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(99, 102, 241, 0.6)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 20,
        bottom: 10
      }
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Portfolio Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Star Rating Distribution */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white">Star Rating Distribution</h3>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/30 pointer-events-none rounded-lg"></div>
            <Bar data={starRatingData} options={barOptions} />
          </div>
        </div>
        
        {/* Price Range Distribution */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white">Price Range Distribution</h3>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/30 pointer-events-none rounded-lg"></div>
            <Pie data={priceRangeData} options={pieOptions} />
          </div>
        </div>
        
        {/* Element Distribution */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-green-500/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 bg-gradient-to-b from-green-400 to-teal-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white">Element Distribution</h3>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/30 pointer-events-none rounded-lg"></div>
            <Pie data={elementData} options={pieOptions} />
          </div>
        </div>
        
        {/* Series Distribution */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-full"></div>
            <h3 className="text-lg font-bold text-white">Top Series</h3>
          </div>
          <div className="h-64 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/30 pointer-events-none rounded-lg"></div>
            <Pie data={seriesData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;
