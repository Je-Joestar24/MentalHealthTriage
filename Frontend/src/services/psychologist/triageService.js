import api from '../../api/axios';

const BASE_URL = '/api/psychologist/triage';

/**
 * Match diagnoses based on symptoms and triage filters
 * @param {Array<string>} symptoms - Array of symptom strings
 * @param {string} system - Optional: 'DSM-5' or 'ICD-10'
 * @param {Object} queryParams - Optional: { page, limit, showAll }
 * @param {Object} triageFilters - Optional: { duration, durationUnit, course, severityLevel, preliminaryDiagnosis, notes }
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string, count?: number}>}
 */
export const matchDiagnoses = async (symptoms = [], system = null, queryParams = {}, triageFilters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add symptoms to query if provided
    if (symptoms && symptoms.length > 0) {
      symptoms.forEach(symptom => {
        params.append('symptoms', symptom);
      });
    }
    
    // Add system filter
    if (system) {
      params.append('system', system);
    }
    
    // Add pagination params
    if (queryParams.page) {
      params.append('page', queryParams.page);
    }
    if (queryParams.limit) {
      params.append('limit', queryParams.limit);
    }
    if (queryParams.showAll !== undefined) {
      params.append('showAll', queryParams.showAll);
    }
    
    // Add triage filter params
    if (triageFilters.duration !== undefined && triageFilters.duration !== null && triageFilters.duration !== '') {
      params.append('duration', triageFilters.duration);
    }
    if (triageFilters.durationUnit) {
      params.append('durationUnit', triageFilters.durationUnit);
    }
    if (triageFilters.course) {
      params.append('course', triageFilters.course);
    }
    if (triageFilters.severityLevel) {
      params.append('severityLevel', triageFilters.severityLevel);
    }
    if (triageFilters.preliminaryDiagnosis) {
      params.append('preliminaryDiagnosis', triageFilters.preliminaryDiagnosis);
    }
    if (triageFilters.notes) {
      params.append('notes', triageFilters.notes);
    }
    
    const queryString = params.toString();
    const url = `${BASE_URL}/match-diagnoses${queryString ? `?${queryString}` : ''}`;
    
    // Use POST method to send triage filters in body for better handling
    const body = {
      ...(symptoms && symptoms.length > 0 && { symptoms }),
      ...triageFilters
    };
    
    const response = await api.post(url, body);
    
    const { data } = response;
    return {
      success: data.success ?? true,
      data: data.data || [],
      pagination: data.pagination || null,
      count: data.count || 0,
      query: data.query || null
    };
  } catch (error) {
    // Handle error response - could be string or object
    let errorMessage = 'Failed to match diagnoses';
    if (error?.response?.data) {
      if (typeof error.response.data.error === 'string') {
        errorMessage = error.response.data.error;
      } else if (error.response.data.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};

/**
 * Get triage history for a patient
 * @param {string} patientId - Patient ID
 * @param {Object} queryParams - Query parameters
 * @param {number} queryParams.page - Page number (default: 1)
 * @param {number} queryParams.limit - Items per page (default: 10)
 * @param {string} queryParams.search - Search term
 * @param {string} queryParams.sortBy - Sort field: 'createdAt', 'updatedAt', 'severityLevel', 'preliminaryDiagnosis'
 * @param {string} queryParams.sortOrder - Sort order: 'asc' or 'desc'
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string, count?: number}>}
 */
export const getTriageHistory = async (patientId, queryParams = {}) => {
  try {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
    if (queryParams.sortOrder) params.append('sortOrder', queryParams.sortOrder);

    const queryString = params.toString();
    const url = `${BASE_URL}/patients/${patientId}/triage${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await api.get(url);
    return {
      success: data.success ?? true,
      data: data.data || [],
      pagination: data.pagination,
      count: data.count || 0
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch triage history';
    return { success: false, error: message };
  }
};

/**
 * Get a single triage record by ID
 * @param {string} patientId - Patient ID
 * @param {string} triageId - Triage ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getTriageById = async (patientId, triageId) => {
  try {
    const { data } = await api.get(`${BASE_URL}/patients/${patientId}/triage/${triageId}`);
    return {
      success: data.success ?? true,
      data: data.data
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to fetch triage record';
    return { success: false, error: message };
  }
};

/**
 * Create a new triage record for a patient
 * @param {string} patientId - Patient ID
 * @param {Object} triageData - Triage data
 * @param {Array<string>} triageData.symptoms - Array of symptoms
 * @param {string} triageData.severityLevel - Required: 'low', 'moderate', or 'high'
 * @param {number} triageData.duration - Optional: Duration value
 * @param {string} triageData.durationUnit - Optional: 'days', 'weeks', 'months', 'years'
 * @param {string} triageData.course - Optional: 'Continuous', 'Episodic', 'Either'
 * @param {string} triageData.preliminaryDiagnosis - Optional: Preliminary diagnosis
 * @param {string} triageData.notes - Optional: Additional notes
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const createTriage = async (patientId, triageData) => {
  try {
    const { data } = await api.post(`${BASE_URL}/patients/${patientId}/triage`, triageData);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Triage record created successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to create triage record';
    return { success: false, error: message };
  }
};

/**
 * Duplicate a triage record (create a copy with optional modifications)
 * The original triage remains unchanged - this creates a new record
 * @param {string} patientId - Patient ID
 * @param {string} triageId - Original triage ID to duplicate
 * @param {Object} triageData - Optional: Modified triage data (if not provided, creates exact copy)
 * @param {Array<string>} triageData.symptoms - Optional: Array of symptoms
 * @param {string} triageData.severityLevel - Optional: 'low', 'moderate', or 'high'
 * @param {number} triageData.duration - Optional: Duration value
 * @param {string} triageData.durationUnit - Optional: 'days', 'weeks', 'months', 'years'
 * @param {string} triageData.course - Optional: 'Continuous', 'Episodic', 'Either'
 * @param {string} triageData.preliminaryDiagnosis - Optional: Preliminary diagnosis
 * @param {string} triageData.notes - Optional: Additional notes
 * @returns {Promise<{success: boolean, data?: Object, error?: string, message?: string}>}
 */
export const duplicateTriage = async (patientId, triageId, triageData = {}) => {
  try {
    const { data } = await api.post(`${BASE_URL}/patients/${patientId}/triage/${triageId}/duplicate`, triageData);
    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message || 'Triage record duplicated successfully'
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to duplicate triage record';
    return { success: false, error: message };
  }
};

