import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIndividuals,
  createIndividual as createIndividualThunk,
  extendSubscriptionMonths as extendSubscriptionMonthsThunk,
  updateIndividual as updateIndividualThunk,
  updateIndividualStatus as updateIndividualStatusThunk,
  setFilters,
  clearMessages
} from '../store/individualSlice';
import { setLoading, displayNotification } from '../store/uiSlice';

const useIndividual = () => {
  const dispatch = useDispatch();
  const individualState = useSelector((state) => state.individual);

  const loadIndividuals = useCallback((params = {}) => {
    const qp = { page: 1, limit: 5, ...individualState.filters, ...params };
    dispatch(fetchIndividuals(qp));
  }, [dispatch, individualState.filters]);

  const createIndividual = useCallback(async (payload) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(createIndividualThunk(payload));
      if (createIndividualThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Individual account created successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to create individual account');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const extendSubscriptionMonths = useCallback(async (id, months) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(extendSubscriptionMonthsThunk({ id, months }));
      if (extendSubscriptionMonthsThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: `Subscription extended by ${months} month(s) successfully`, type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to extend subscription');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateIndividual = useCallback(async (id, updateData) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(updateIndividualThunk({ id, updateData }));
      if (updateIndividualThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Individual account updated successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to update individual account');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateIndividualStatus = useCallback(async (id, isActive) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(updateIndividualStatusThunk({ id, isActive }));
      if (updateIndividualStatusThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ 
          message: `Individual account ${isActive ? 'activated' : 'deactivated'} successfully`, 
          type: 'success' 
        }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to update individual status');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const pagination = individualState.pagination;

  const rows = useMemo(() => individualState.individuals || [], [individualState.individuals]);

  useEffect(() => {
    // Initial load
    if (!rows.length) {
      dispatch(fetchIndividuals({ page: 1, limit: 5, ...individualState.filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    ...individualState,
    rows,
    pagination,

    // actions
    loadIndividuals,
    createIndividual,
    extendSubscriptionMonths,
    updateIndividual,
    updateIndividualStatus,
    updateFilters,
    clearAllMessages
  };
};

export default useIndividual;

