import api from '../../api/axios';

const BASE_URL = '/api/psychologist/patients';

export const getPatients = async (params = {}) => {
  try {
    const { data } = await api.get(BASE_URL, { params });
    return {
      success: data.success ?? true,
      data: data.data,
      pagination: data.pagination
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch patients';
    return { success: false, error: message };
  }
};

export const getPatientById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/${id}`);
    return {
      success: data.success ?? true,
      data: data.data
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch patient';
    return { success: false, error: message };
  }
};

export const createPatient = async (payload) => {
  try {
    const { data } = await api.post(BASE_URL, payload);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Patient created successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to create patient';
    return { success: false, error: message };
  }
};

export const updatePatient = async (id, payload) => {
  try {
    const { data } = await api.put(`${BASE_URL}/${id}`, payload);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Patient updated successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to update patient';
    return { success: false, error: message };
  }
};

export const softDeletePatient = async (id) => {
  try {
    const { data } = await api.delete(`${BASE_URL}/${id}`);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Patient deleted successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to delete patient';
    return { success: false, error: message };
  }
};

export const restorePatient = async (id) => {
  try {
    const { data } = await api.patch(`${BASE_URL}/${id}/restore`);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Patient restored successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to restore patient';
    return { success: false, error: message };
  }
};

export const reassignPsychologist = async (patientId, psychologistId) => {
  try {
    const { data } = await api.patch(`/api/patients/${patientId}/reassign`, { psychologistId });
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Psychologist reassigned successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to reassign psychologist';
    return { success: false, error: message };
  }
};


