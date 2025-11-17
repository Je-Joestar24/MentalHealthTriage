import api from '../../api/axios';

const BASE_URL = '/api/psychologist/triage';

/**
 * Match diagnoses based on symptoms
 * @param {Array<string>} symptoms - Array of symptom strings
 * @param {string} system - Optional: 'DSM-5' or 'ICD-10'
 * @returns {Promise<{success: boolean, data?: Array, error?: string, count?: number}>}
 */
export const matchDiagnoses = async (symptoms = [], system = null) => {
  try {
    // Use POST method with body for better handling of array data
    const { data } = await api.post(`${BASE_URL}/match-diagnoses`, {
      symptoms,
      ...(system && { system })
    });
    return {
      success: data.success ?? true,
      data: data.data || [],
      count: data.count || 0,
      query: data.query
    };
  } catch (error) {
    const message = error?.response?.data?.error || error.message || 'Failed to match diagnoses';
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
    const { data } = await api.post(`/api/psychologist/patients/${patientId}/triage`, triageData);
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

