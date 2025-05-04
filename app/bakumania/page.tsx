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
  const [favoriteItems, setFavoriteItems] = useState<{ id: string; bakuganId: string }[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<{ id: string; bakuganId: string; quantity?: number }[]>([]);
  
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
    regularItemsLoading,
    setSelectedBakugan,
    updateFilter,
    resetFilters,
    updatePagination,
    setShowSuggestions,
    handleUpdatePrice,
    handleUpdateDetails,
    handleDeleteBakugan,
  } = useBakuganData();

  // Fetch favorites and portfolio items when session changes
  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch data if user is authenticated
      if (!session?.user) {
        setFavoriteItems([]);
        setPortfolioItems([]);
        return;
      }
      
      try {
        // Fetch favorites
        const favoritesResponse = await fetch('/api/favorites');
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          // Extract favorite items with IDs
          const favorites = favoritesData.map((item: any) => ({
            id: item.favoriteId,
            bakuganId: item.bakugan?._id
          })).filter((item: any) => item.bakuganId);
          setFavoriteItems(favorites);
        }
        
        // Fetch portfolio
        const portfolioResponse = await fetch('/api/portfolio');
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          // Extract portfolio items with IDs and quantities
          const portfolio = portfolioData.map((item: any) => ({
            id: item.portfolioId,
            bakuganId: item.bakugan?._id,
            quantity: item.quantity || 1
          })).filter((item: any) => item.bakuganId);
          setPortfolioItems(portfolio);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set empty arrays on error
        setFavoriteItems([]);
        setPortfolioItems([]);
      }
    };

    fetchUserData();
  }, [session]);

  // Handle adding a bakugan to favorites
  const handleAddToFavorite = async (bakuganId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bakuganId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the bakugan to the local favorites items state
        setFavoriteItems(prev => [...prev, { 
          id: data.favoriteItem.id, 
          bakuganId 
        }]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  // Handle removing a bakugan from favorites
  const handleRemoveFromFavorite = async (favoriteId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the bakugan from the local favorites items state
        setFavoriteItems(prev => prev.filter(item => item.id !== favoriteId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  // Handle adding a bakugan to portfolio
  const handleAddToPortfolio = async (bakuganId: string, quantity: number = 1) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bakuganId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the bakugan to the local portfolio items state
        setPortfolioItems(prev => [...prev, { 
          id: data.portfolioItem.id, 
          bakuganId,
          quantity
        }]);
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error);
    }
  };

  // Handle removing a bakugan from portfolio
  const handleRemoveFromPortfolio = async (portfolioId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the bakugan from the local portfolio items state
        setPortfolioItems(prev => prev.filter(item => item.id !== portfolioId));
      }
    } catch (error) {
      console.error('Error removing from portfolio:', error);
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
        favoriteItems={favoriteItems}
        portfolioItems={portfolioItems}
        activeTab="main"
        regularItemsLoading={regularItemsLoading}
        onUpdatePrice={handleUpdatePrice}
        onUpdateDetails={handleUpdateDetails}
        onDeleteBakugan={handleDeleteBakugan}
        onAddToFavorite={handleAddToFavorite}
        onRemoveFromFavorite={handleRemoveFromFavorite}
        onAddToPortfolio={handleAddToPortfolio}
        onRemoveFromPortfolio={handleRemoveFromPortfolio}
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
