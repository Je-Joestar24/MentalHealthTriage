import { useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { setLoading, displayNotification } from '../store/uiSlice';

const usePsychologistDashboard = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [loading, setLoadingState] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoadingState(true);
    setError(null);
    dispatch(setLoading(true));
    
    try {
      const { data } = await api.get('/api/psychologist/dashboard/stats');
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to fetch dashboard statistics';
      setError(errorMessage);
      dispatch(displayNotification({ message: errorMessage, type: 'error' }));
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};

export default usePsychologistDashboard;

