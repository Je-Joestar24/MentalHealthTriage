import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Diagnosis from '../models/Diagnosis.js';
import Triage from '../models/Triage.js';

/**
 * Get company details for the logged-in company admin
 * Includes organization info, statistics, and related data
 */
export async function getCompanyDetails(companyAdminId) {
  // Find the organization where this user is the admin
  const organization = await Organization.findOne({ admin: companyAdminId })
    .populate('admin', 'name email role')
    .populate('psychologists', 'name email role specialization experience isActive')
    .lean();

  if (!organization) {
    throw new Error('Organization not found or you are not the admin of any organization');
  }

  // Get all patient IDs for this organization
  const organizationPatients = await Patient.find({ organization: organization._id })
    .select('_id')
    .lean();
  const patientIds = organizationPatients.map(p => p._id);

  // Get statistics
  const [
    psychologistsCount,
    activePsychologistsCount,
    patientsCount,
    activePatientsCount,
    organizationDiagnosesCount,
    totalTriagesCount,
    recentTriages
  ] = await Promise.all([
    // Total psychologists
    User.countDocuments({ organization: organization._id, role: 'psychologist' }),
    // Active psychologists
    User.countDocuments({ organization: organization._id, role: 'psychologist', isActive: true }),
    // Total patients
    Patient.countDocuments({ organization: organization._id }),
    // Active patients (not deleted)
    Patient.countDocuments({ organization: organization._id, isDeleted: false }),
    // Organization diagnoses
    Diagnosis.countDocuments({ type: 'organization', organization: organization._id }),
    // Total triages (only if there are patients)
    patientIds.length > 0 
      ? Triage.countDocuments({ patient: { $in: patientIds } })
      : Promise.resolve(0),
    // Recent triages (last 10, only if there are patients)
    patientIds.length > 0
      ? Triage.find({ patient: { $in: patientIds } })
          .populate('patient', 'name')
          .populate('psychologist', 'name')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      : Promise.resolve([])
  ]);

  // Calculate effective status
  const isExpired = organization.subscriptionEndDate && new Date() > new Date(organization.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : (organization.subscription_status === 'active' && organization.is_paid ? 'active' : organization.subscription_status);

  // Calculate days remaining
  const now = new Date();
  const endDate = organization.subscriptionEndDate;
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, diffDays);

  return {
    organization: {
      _id: organization._id,
      name: organization.name,
      psychologistSeats: organization.psychologistSeats,
      seats_limit: organization.seats_limit,
      subscription_status: organization.subscription_status,
      is_paid: organization.is_paid,
      subscriptionStartDate: organization.subscriptionStartDate,
      subscriptionEndDate: organization.subscriptionEndDate,
      stripe_customer_id: organization.stripe_customer_id,
      stripe_subscription_id: organization.stripe_subscription_id,
      // Cancellation fields
      cancel_at_period_end: organization.cancel_at_period_end || false,
      cancellationRequestedAt: organization.cancellationRequestedAt || null,
      cancellationReason: organization.cancellationReason || '',
      effectiveStatus,
      isSubscriptionExpired: isExpired,
      daysRemaining,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    },
    admin: organization.admin,
    statistics: {
      psychologists: {
        total: psychologistsCount,
        active: activePsychologistsCount,
        seats: {
          total: organization.psychologistSeats,
          taken: psychologistsCount,
          available: Math.max(0, organization.psychologistSeats - psychologistsCount)
        }
      },
      patients: {
        total: patientsCount,
        active: activePatientsCount
      },
      diagnoses: {
        organization: organizationDiagnosesCount
      },
      triages: {
        total: totalTriagesCount
      }
    },
    psychologists: organization.psychologists || [],
    recentTriages: recentTriages || []
  };
}

/**
 * Update company details (only updatable fields)
 * Company admin can only update: name
 * psychologistSeats cannot be updated by company admin
 */
export async function updateCompanyDetails(companyAdminId, updateData) {
  // Find the organization where this user is the admin
  const organization = await Organization.findOne({ admin: companyAdminId });

  if (!organization) {
    throw new Error('Organization not found or you are not the admin of any organization');
  }

  // Only allow updating the name field
  // Ignore any attempts to update psychologistSeats or other fields
  if (updateData.name === undefined || updateData.name === null) {
    throw new Error('Name field is required for update');
  }

  const trimmedName = String(updateData.name).trim();
  if (!trimmedName) {
    throw new Error('Organization name cannot be empty');
  }

  // Update only the name field
  organization.name = trimmedName;
  await organization.save();

  // Return updated organization with populated fields
  const updated = await Organization.findById(organization._id)
    .populate('admin', 'name email role')
    .lean();

  // Calculate effective status
  const isExpired = updated.subscriptionEndDate && new Date() > new Date(updated.subscriptionEndDate);
  const effectiveStatus = isExpired ? 'expired' : (updated.subscription_status === 'active' && updated.is_paid ? 'active' : updated.subscription_status);

  return {
    ...updated,
    effectiveStatus,
    isSubscriptionExpired: isExpired
  };
}

