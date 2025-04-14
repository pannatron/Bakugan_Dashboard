'use client';

import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useBakuganData } from '../hooks/useBakuganData';
import BakumaniaHeader from '../components/BakumaniaHeader';
import BakuganFilters from '../components/BakuganFilters';
import FilterModeSelector from '../components/FilterModeSelector';
import BakuganList from '../components/BakuganList';
import BakuganPagination from '../components/BakuganPagination';
import Link from 'next/link';

function BakumaniaContent() {
  const { user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  
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
        onUpdatePrice={handleUpdatePrice}
        onUpdateDetails={handleUpdateDetails}
        onDeleteBakugan={handleDeleteBakugan}
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

// Export the component
export default function BakumaniaPage() {
  return <BakumaniaContent />;
}
