import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  upgradeSeats as upgradeSeatsThunk,
  clearError,
  clearMessage,
  clearLastUpgrade,
  clearAll,
} from '../store/subscriptionSlice';
import { setLoading, displayNotification } from '../store/uiSlice';

const useSubscription = () => {
  const dispatch = useDispatch();
  const subscriptionState = useSelector((state) => state.subscription);

  /**
   * Upgrade organization seats
   * @param {string} organizationId - Organization ID
   * @param {number} additionalSeats - Number of additional seats to add
   * @returns {Promise<{success: boolean, payload?: any, error?: string}>}
   */
  const upgradeSeats = useCallback(async (organizationId, additionalSeats) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(upgradeSeatsThunk({ organizationId, additionalSeats }));
      if (upgradeSeatsThunk.fulfilled.match(result)) {
        dispatch(
          displayNotification({
            message: 'Seats upgraded successfully. Your subscription has been updated.',
            type: 'success',
          })
        );
        return { success: true, payload: result.payload };
      } else {
        const errorMessage =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to upgrade seats';
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Clear subscription error
   */
  const clearSubscriptionError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Clear subscription message
   */
  const clearSubscriptionMessage = useCallback(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  /**
   * Clear last upgrade data
   */
  const clearSubscriptionLastUpgrade = useCallback(() => {
    dispatch(clearLastUpgrade());
  }, [dispatch]);

  /**
   * Clear all subscription state (error, message, lastUpgrade)
   */
  const clearSubscriptionAll = useCallback(() => {
    dispatch(clearAll());
  }, [dispatch]);

  return {
    // State
    loading: subscriptionState.loading,
    error: subscriptionState.error,
    message: subscriptionState.message,
    lastUpgrade: subscriptionState.lastUpgrade,

    // Actions
    upgradeSeats,
    clearError: clearSubscriptionError,
    clearMessage: clearSubscriptionMessage,
    clearLastUpgrade: clearSubscriptionLastUpgrade,
    clearAll: clearSubscriptionAll,
  };
};

export default useSubscription;

