import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  upgradeSeats as upgradeSeatsThunk,
  scheduleOrgCancellation as scheduleOrgCancellationThunk,
  undoOrgCancellation as undoOrgCancellationThunk,
  scheduleUserCancel as scheduleUserCancelThunk,
  undoUserCancel as undoUserCancelThunk,
  clearError,
  clearMessage,
  clearLastUpgrade,
  clearAll,
  clearCancellationError,
  clearCancellationMessage,
  clearCancellationAll,
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

  /**
   * Schedule organization subscription cancellation at period end
   * @param {string} organizationId - Organization ID
   * @param {string} reason - Optional cancellation reason
   * @returns {Promise<{success: boolean, payload?: any, error?: string}>}
   */
  const scheduleOrgCancellation = useCallback(async (organizationId, reason = '') => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(scheduleOrgCancellationThunk({ organizationId, reason }));
      if (scheduleOrgCancellationThunk.fulfilled.match(result)) {
        dispatch(
          displayNotification({
            message: 'Cancellation scheduled successfully. Your subscription will remain active until the end of the current billing period.',
            type: 'success',
          })
        );
        return { success: true, payload: result.payload };
      } else {
        const errorMessage =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to schedule cancellation';
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
   * Undo scheduled organization subscription cancellation
   * @param {string} organizationId - Organization ID
   * @returns {Promise<{success: boolean, payload?: any, error?: string}>}
   */
  const undoOrgCancellation = useCallback(async (organizationId) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(undoOrgCancellationThunk({ organizationId }));
      if (undoOrgCancellationThunk.fulfilled.match(result)) {
        dispatch(
          displayNotification({
            message: 'Cancellation undone successfully. Your subscription will continue after the current billing period.',
            type: 'success',
          })
        );
        return { success: true, payload: result.payload };
      } else {
        const errorMessage =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to undo cancellation';
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
   * Schedule individual user subscription cancellation at period end
   * @param {string} userId - User ID
   * @param {string} reason - Optional cancellation reason
   * @returns {Promise<{success: boolean, payload?: any, error?: string}>}
   */
  const scheduleUserCancel = useCallback(async (userId, reason = '') => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(scheduleUserCancelThunk({ userId, reason }));
      if (scheduleUserCancelThunk.fulfilled.match(result)) {
        dispatch(
          displayNotification({
            message: 'Cancellation scheduled successfully. Your subscription will remain active until the end of the current billing period.',
            type: 'success',
          })
        );
        return { success: true, payload: result.payload };
      } else {
        const errorMessage =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to schedule cancellation';
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
   * Undo scheduled individual user subscription cancellation
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, payload?: any, error?: string}>}
   */
  const undoUserCancel = useCallback(async (userId) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(undoUserCancelThunk({ userId }));
      if (undoUserCancelThunk.fulfilled.match(result)) {
        dispatch(
          displayNotification({
            message: 'Cancellation undone successfully. Your subscription will continue after the current billing period.',
            type: 'success',
          })
        );
        return { success: true, payload: result.payload };
      } else {
        const errorMessage =
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message || 'Failed to undo cancellation';
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
   * Clear cancellation error
   */
  const clearCancellationErrorHandler = useCallback(() => {
    dispatch(clearCancellationError());
  }, [dispatch]);

  /**
   * Clear cancellation message
   */
  const clearCancellationMessageHandler = useCallback(() => {
    dispatch(clearCancellationMessage());
  }, [dispatch]);

  /**
   * Clear all cancellation state
   */
  const clearCancellationAllHandler = useCallback(() => {
    dispatch(clearCancellationAll());
  }, [dispatch]);

  return {
    // State
    loading: subscriptionState.loading,
    error: subscriptionState.error,
    message: subscriptionState.message,
    lastUpgrade: subscriptionState.lastUpgrade,
    cancellationLoading: subscriptionState.cancellationLoading,
    cancellationError: subscriptionState.cancellationError,
    cancellationMessage: subscriptionState.cancellationMessage,

    // Actions
    upgradeSeats,
    scheduleOrgCancellation,
    undoOrgCancellation,
    scheduleUserCancel,
    undoUserCancel,
    clearError: clearSubscriptionError,
    clearMessage: clearSubscriptionMessage,
    clearLastUpgrade: clearSubscriptionLastUpgrade,
    clearAll: clearSubscriptionAll,
    clearCancellationError: clearCancellationErrorHandler,
    clearCancellationMessage: clearCancellationMessageHandler,
    clearCancellationAll: clearCancellationAllHandler,
  };
};

export default useSubscription;

