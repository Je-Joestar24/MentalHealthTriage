import api from '../../api/axios';

const BASE_URL = '/api/psychologist/triage';

/**
 * Match diagnoses based on symptoms
 * @param {Array<string>} symptoms - Array of symptom strings
 * @param {string} system - Optional: 'DSM-5' or 'ICD-10'
 * @param {Object} queryParams - Optional: { page, limit, showAll }
 * @returns {Promise<{success: boolean, data?: Array, pagination?: Object, error?: string, count?: number}>}
 */
export const matchDiagnoses = async (symptoms = [], system = null, queryParams = {}) => {
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
    
    const queryString = params.toString();
    const url = `${BASE_URL}/match-diagnoses${queryString ? `?${queryString}` : ''}`;
    
    // Use GET method for query params, or POST if symptoms are in body
    let response;
    if (symptoms && symptoms.length > 0 && !queryString.includes('symptoms=')) {
      // POST with body if symptoms array is large
      response = await api.post(url, { symptoms });
    } else {
      // GET with query params
      response = await api.get(url);
    }
    
    const { data } = response;
    return {
      success: data.success ?? true,
      data: data.data || [],
      pagination: data.pagination || null,
      count: data.count || 0,
      query: data.query
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to match diagnoses';
    return { success: false, error: message };
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

