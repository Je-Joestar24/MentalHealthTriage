import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrganizations,
  fetchOrganizationById,
  createOrganization as createOrganizationThunk,
  updateOrganization as updateOrganizationThunk,
  deleteOrganization as deleteOrganizationThunk,
  updateOrganizationStatus as updateOrganizationStatusThunk,
  extendSubscription as extendSubscriptionThunk,
  getOrganizationStats as getOrganizationStatsThunk,
  checkExpiredSubscriptions as checkExpiredSubscriptionsThunk,
  setFilters,
  clearMessages
} from '../store/organizationSlice';
import { setLoading, displayNotification, showGlobalDialog } from '../store/uiSlice';

const useOrganization = () => {
  const dispatch = useDispatch();
  const organizationState = useSelector((state) => state.organization);

  const loadOrganizations = useCallback((params = {}) => {
    const qp = { page: 1, limit: 5, ...organizationState.filters, ...params };
    dispatch(fetchOrganizations(qp));
  }, [dispatch, organizationState.filters]);

  const loadOrganization = useCallback((id) => {
    dispatch(fetchOrganizationById(id));
  }, [dispatch]);

  const createOrganization = useCallback(async (payload) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(createOrganizationThunk(payload));
      if (createOrganizationThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Organization created successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to create organization');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateOrganization = useCallback(async (id, updateData) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(updateOrganizationThunk({ id, updateData }));
      if (updateOrganizationThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Organization updated successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to update organization');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteOrganization = useCallback(async (id) => {
    dispatch(setLoading(true));
    try {
      const result = await dispatch(deleteOrganizationThunk(id));
      if (deleteOrganizationThunk.fulfilled.match(result)) {
        dispatch(displayNotification({ message: 'Organization deleted successfully', type: 'success' }));
      } else {
        const errorMessage = typeof result.payload === 'string' ? result.payload : 
                           (result.payload?.message || 'Failed to delete organization');
        dispatch(displayNotification({ message: errorMessage, type: 'error' }));
      }
      return result;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const confirmDeleteOrganization = useCallback((organization, onConfirm) => {
    dispatch(showGlobalDialog({
      type: 'danger',
      title: 'Delete Organization',
      message: `Are you sure you want to delete "${organization.name}"? This action cannot be undone and will remove all associated data.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteOrganization(organization._id);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        // Optional: handle cancel action
      }
    }));
  }, [dispatch, deleteOrganization]);

  const updateOrganizationStatus = useCallback(async (id, subscriptionStatus, subscriptionEndDate) => {
    const result = await dispatch(updateOrganizationStatusThunk({ id, subscriptionStatus, subscriptionEndDate }));
    return result;
  }, [dispatch]);

  const extendSubscription = useCallback(async (id, subscriptionEndDate) => {
    const result = await dispatch(extendSubscriptionThunk({ id, subscriptionEndDate }));
    return result;
  }, [dispatch]);

  const loadOrganizationStats = useCallback((id) => {
    dispatch(getOrganizationStatsThunk(id));
  }, [dispatch]);

  const checkExpiredSubscriptions = useCallback(() => {
    dispatch(checkExpiredSubscriptionsThunk());
  }, [dispatch]);

  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const pagination = organizationState.pagination;

  const rows = useMemo(() => organizationState.organizations || [], [organizationState.organizations]);

  useEffect(() => {
    // Initial load
    if (!rows.length) {
      dispatch(fetchOrganizations({ page: 1, limit: 5, ...organizationState.filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    ...organizationState,
    rows,
    pagination,

    // actions
    loadOrganizations,
    loadOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    confirmDeleteOrganization,
    updateOrganizationStatus,
    extendSubscription,
    loadOrganizationStats,
    checkExpiredSubscriptions,
    updateFilters,
    clearAllMessages
  };
};

export default useOrganization;


