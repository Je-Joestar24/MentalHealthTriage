import api from '../../api/axios';

export const updateProfile = async (payload) => {
  try {
    const { data } = await api.put('/api/auth/profile', payload);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Profile updated successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to update profile';
    return { success: false, error: message };
  }
};

