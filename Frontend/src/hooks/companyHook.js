import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCompanyDetails as fetchCompanyDetailsThunk,
  updateCompanyDetails as updateCompanyDetailsThunk,
  clearCompanyDetails,
  clearMessages
} from '../store/companySlice';
import { setLoading as setGlobalLoading, displayNotification } from '../store/uiSlice';

const useCompany = () => {
  const dispatch = useDispatch();
  const companyState = useSelector((state) => state.company);

  /**
   * Load company details
   */
  const loadCompanyDetails = useCallback(() => {
    dispatch(fetchCompanyDetailsThunk());
  }, [dispatch]);

  /**
   * Update company details
   * @param {Object} updateData - Update data
   * @param {string} updateData.name - Company name
   */
  const updateDetails = useCallback(
    async (updateData) => {
      if (!updateData || !updateData.name) {
        dispatch(displayNotification({ 
          message: 'Company name is required', 
          type: 'error' 
        }));
        return { success: false, error: 'Company name is required' };
      }

      dispatch(setGlobalLoading(true));
      try {
        const result = await dispatch(updateCompanyDetailsThunk(updateData));
        if (updateCompanyDetailsThunk.fulfilled.match(result)) {
          // Reload company details after successful update
          dispatch(fetchCompanyDetailsThunk());
        }
        return result;
      } finally {
        dispatch(setGlobalLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Clear company details
   */
  const clearDetails = useCallback(() => {
    dispatch(clearCompanyDetails());
  }, [dispatch]);

  /**
   * Clear all messages
   */
  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    // State
    companyDetails: companyState.companyDetails,
    loading: companyState.loading,
    error: companyState.error,
    success: companyState.success,
    
    // Computed values
    organization: companyState.companyDetails?.organization || null,
    admin: companyState.companyDetails?.admin || null,
    statistics: companyState.companyDetails?.statistics || null,
    psychologists: companyState.companyDetails?.psychologists || [],
    recentTriages: companyState.companyDetails?.recentTriages || [],
    
    // Actions
    loadCompanyDetails,
    updateDetails,
    clearDetails,
    clearAllMessages
  };
};

export default useCompany;

