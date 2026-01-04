import User from '../models/User.js';
import Patient from '../models/Patient.js';

/**
 * Get public statistics for the landing page
 * Returns counts of professionals and clients/patients
 */
export async function getPublicStats() {
  try {
    // Count active professionals (psychologists)
    // Only count active psychologists with active subscriptions or no subscription end date
    const professionalsCount = await User.countDocuments({
      role: 'psychologist',
      isActive: true,
      // Optionally filter by active subscription status
      // For now, just count all active psychologists
    });

    // Count active clients/patients (non-deleted)
    // Count all patients that are not deleted
    const clientsCount = await Patient.countDocuments({
      isDeleted: false,
    });

    return {
      professionals: professionalsCount,
      clients: clientsCount,
    };
  } catch (error) {
    console.error('Error fetching public stats:', error);
    throw new Error('Failed to fetch public statistics');
  }
}

