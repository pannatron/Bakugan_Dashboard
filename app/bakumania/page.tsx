'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBakuganData } from '../hooks/useBakuganData';
import BakumaniaHeader from '../components/BakumaniaHeader';
import BakuganFilters from '../components/BakuganFilters';
import FilterModeSelector from '../components/FilterModeSelector';
import BakuganList from '../components/BakuganList';
import BakuganPagination from '../components/BakuganPagination';
import Link from 'next/link';

function BakumaniaContent() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<string[]>([]);
  
  const {
    filteredItems,
    loading,
    error,
    pagination,
    filters,
    nameSuggestions,
    showSuggestions,
    isTransitioning,
    priceHistories,
    setSelectedBakugan,
    updateFilter,
    resetFilters,
    updatePagination,
    setShowSuggestions,
    handleUpdatePrice,
    handleUpdateDetails,
    handleDeleteBakugan,
  } = useBakuganData();

  // Fetch portfolio items when session changes
  useEffect(() => {
    const fetchPortfolio = async () => {
      // Only fetch portfolio data if user is authenticated
      if (!session?.user) {
        setPortfolioItems([]);
        return;
      }
      
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const data = await response.json();
          // Extract bakugan IDs from portfolio items
          const bakuganIds = data.map((item: any) => item.bakugan?._id).filter(Boolean);
          setPortfolioItems(bakuganIds);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        // Set empty array on error
        setPortfolioItems([]);
      }
    };

    fetchPortfolio();
  }, [session]);

  // Handle adding a bakugan to favorites
  const handleAddToFavorite = async (bakuganId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bakuganId }),
      });

      if (response.ok) {
        // Add the bakugan to the local portfolio items state
        setPortfolioItems(prev => [...prev, bakuganId]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  // Handle removing a bakugan from favorites
  const handleRemoveFromFavorite = async (portfolioId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the bakugan from the local portfolio items state
        setPortfolioItems(prev => prev.filter(id => id !== portfolioId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  return (
    <main className="relative max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Section */}
      <BakumaniaHeader />
      
      {/* Filter Section */}
      <BakuganFilters 
        nameFilter={filters.nameFilter}
        sizeFilter={filters.sizeFilter}
        elementFilter={filters.elementFilter}
        specialPropertiesFilter={filters.specialPropertiesFilter}
        minPriceFilter={filters.minPriceFilter}
        maxPriceFilter={filters.maxPriceFilter}
        isFilterOpen={isFilterOpen}
        nameSuggestions={nameSuggestions}
        showSuggestions={showSuggestions}
        onNameFilterChange={(value) => updateFilter('nameFilter', value)}
        onSizeFilterChange={(value) => updateFilter('sizeFilter', value)}
        onElementFilterChange={(value) => updateFilter('elementFilter', value)}
        onSpecialPropertiesFilterChange={(value) => updateFilter('specialPropertiesFilter', value)}
        onMinPriceFilterChange={(value) => updateFilter('minPriceFilter', value)}
        onMaxPriceFilterChange={(value) => updateFilter('maxPriceFilter', value)}
        onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        onResetFilters={resetFilters}
        onSelectSuggestion={(name) => {
          updateFilter('nameFilter', name);
          setShowSuggestions(false);
        }}
        onFocusNameFilter={() => filters.nameFilter.length > 0 && setShowSuggestions(true)}
      />
      
      {/* Filter Mode Selector */}
      <FilterModeSelector 
        filterMode={filters.filterMode}
        onFilterModeChange={(mode) => updateFilter('filterMode', mode)}
      />
      
      {/* Bakugan List */}
      <BakuganList 
        filteredItems={filteredItems}
        loading={loading}
        isTransitioning={isTransitioning}
        error={error}
        priceHistories={priceHistories}
        pagination={pagination}
        isAdmin={!!user?.isAdmin}
        portfolioItems={portfolioItems}
        onUpdatePrice={handleUpdatePrice}
        onUpdateDetails={handleUpdateDetails}
        onDeleteBakugan={handleDeleteBakugan}
        onAddToFavorite={handleAddToFavorite}
        onRemoveFromFavorite={handleRemoveFromFavorite}
      />
      
      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <BakuganPagination 
          pagination={pagination}
          onPageChange={(page) => updatePagination(page)}
          onLimitChange={(limit) => updatePagination(1, limit)}
        />
      )}
    </main>
  );
}

// Login prompt component
function LoginPrompt() {
  return (
    <main className="relative max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Section */}
      <BakumaniaHeader />
      
      {/* Login Prompt */}
      <div className="bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-8 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-center">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">Login Required</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          To view the Bakugan gallery and track prices, please sign in to your account. 
          Create an account to start building your collection and tracking your favorite Bakugan.
        </p>
        <Link 
          href="/auth/signin"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-block"
        >
          Sign In to Continue
        </Link>
      </div>
    </main>
  );
}

// Loading component
function LoadingPrompt() {
  return (
    <main className="relative max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 xl:px-12">
      {/* Header Section */}
      <BakumaniaHeader />
      
      {/* Loading Prompt */}
      <div className="bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-8 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-center">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </main>
  );
}

// Export the component
export default function BakumaniaPage() {
  const { data: session, status } = useSession();
  
  // Show loading prompt during initial load
  if (status === 'loading') {
    return <LoadingPrompt />;
  }
  
  // Show login prompt if user is not authenticated
  if (!session) {
    return <LoginPrompt />;
  }
  
  // Only show content if user is authenticated
  return <BakumaniaContent />;
}
