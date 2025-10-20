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

const useOrganization = () => {
  const dispatch = useDispatch();
  const organizationState = useSelector((state) => state.organization);

  const loadOrganizations = useCallback((params = {}) => {
    const qp = { page: 1, limit: 10, ...organizationState.filters, ...params };
    dispatch(fetchOrganizations(qp));
  }, [dispatch, organizationState.filters]);

  const loadOrganization = useCallback((id) => {
    dispatch(fetchOrganizationById(id));
  }, [dispatch]);

  const createOrganization = useCallback(async (payload) => {
    const result = await dispatch(createOrganizationThunk(payload));
    return result;
  }, [dispatch]);

  const updateOrganization = useCallback(async (id, updateData) => {
    const result = await dispatch(updateOrganizationThunk({ id, updateData }));
    return result;
  }, [dispatch]);

  const deleteOrganization = useCallback(async (id) => {
    const result = await dispatch(deleteOrganizationThunk(id));
    return result;
  }, [dispatch]);

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
      dispatch(fetchOrganizations({ page: 1, limit: 10, ...organizationState.filters }));
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
    updateOrganizationStatus,
    extendSubscription,
    loadOrganizationStats,
    checkExpiredSubscriptions,
    updateFilters,
    clearAllMessages
  };
};

export default useOrganization;


