import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPsychologists as fetchPsychologistsThunk,
  setFilters,
  resetFilters,
  setPage,
  setSearch,
  setActiveFilter,
  setOrganizationFilter,
  setSort,
  clearError,
  clearPsychologists
} from '../store/psychologistsSlice';

/**
 * Custom hook for managing psychologists list
 * @returns {Object} Psychologists state and actions
 */
const usePsychologists = () => {
  const dispatch = useDispatch();
  const psychologistsState = useSelector((state) => state.psychologists);

  /**
   * Fetch psychologists with current filters
   * @param {Object} params - Optional override params
   */
  const loadPsychologists = useCallback(
    (params = {}) => {
      dispatch(fetchPsychologistsThunk(params));
    },
    [dispatch]
  );

  /**
   * Update filters and fetch psychologists
   * @param {Object} newFilters - Filter values to update
   */
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
      // Automatically fetch after updating filters
      dispatch(fetchPsychologistsThunk(newFilters));
    },
    [dispatch]
  );

  /**
   * Set search term and fetch
   * @param {string} searchTerm - Search term
   */
  const search = useCallback(
    (searchTerm) => {
      dispatch(setSearch(searchTerm));
      dispatch(fetchPsychologistsThunk({ search: searchTerm, page: 1 }));
    },
    [dispatch]
  );

  /**
   * Set active status filter and fetch
   * @param {string} isActive - 'true', 'false', or ''
   */
  const filterByActive = useCallback(
    (isActive) => {
      dispatch(setActiveFilter(isActive));
      dispatch(fetchPsychologistsThunk({ isActive, page: 1 }));
    },
    [dispatch]
  );

  /**
   * Set organization filter and fetch
   * @param {string} organizationId - Organization ID or ''
   */
  const filterByOrganization = useCallback(
    (organizationId) => {
      dispatch(setOrganizationFilter(organizationId));
      dispatch(fetchPsychologistsThunk({ organization: organizationId, page: 1 }));
    },
    [dispatch]
  );

  /**
   * Set sort and fetch
   * @param {string} sortBy - Sort field
   * @param {string} sortOrder - 'asc' or 'desc'
   */
  const sort = useCallback(
    (sortBy, sortOrder = 'desc') => {
      dispatch(setSort({ sortBy, sortOrder }));
      dispatch(fetchPsychologistsThunk({ sortBy, sortOrder }));
    },
    [dispatch]
  );

  /**
   * Go to specific page
   * @param {number} page - Page number
   */
  const goToPage = useCallback(
    (page) => {
      dispatch(setPage(page));
      dispatch(fetchPsychologistsThunk({ page }));
    },
    [dispatch]
  );

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    const currentPage = psychologistsState.pagination.currentPage;
    const totalPages = psychologistsState.pagination.totalPages;
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [psychologistsState.pagination, goToPage]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    const currentPage = psychologistsState.pagination.currentPage;
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [psychologistsState.pagination, goToPage]);

  /**
   * Reset all filters to initial state
   */
  const reset = useCallback(() => {
    dispatch(resetFilters());
    dispatch(fetchPsychologistsThunk({
      search: '',
      isActive: '',
      organization: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    }));
  }, [dispatch]);

  /**
   * Clear error message
   */
  const clear = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear psychologists list
   */
  const clearList = useCallback(() => {
    dispatch(clearPsychologists());
  }, [dispatch]);

  return {
    // State
    psychologists: psychologistsState.list,
    pagination: psychologistsState.pagination,
    filters: psychologistsState.filters,
    loading: psychologistsState.loading,
    error: psychologistsState.error,

    // Computed values
    hasNextPage: psychologistsState.pagination.hasNextPage,
    hasPrevPage: psychologistsState.pagination.hasPrevPage,
    currentPage: psychologistsState.pagination.currentPage,
    totalPages: psychologistsState.pagination.totalPages,
    totalItems: psychologistsState.pagination.totalItems,
    itemsPerPage: psychologistsState.pagination.itemsPerPage,
    isEmpty: psychologistsState.list.length === 0,

    // Actions
    loadPsychologists,
    updateFilters,
    search,
    filterByActive,
    filterByOrganization,
    sort,
    goToPage,
    nextPage,
    prevPage,
    reset,
    clear,
    clearList
  };
};

export default usePsychologists;

