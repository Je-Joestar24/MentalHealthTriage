import asyncWrapper from '../middleware/async.wrapper.js';
import { upgradeOrganizationSeats } from '../services/subscription.service.js';

/**
 * POST /api/subscription/organizations/:organizationId/upgrade-seats
 * Body: { additionalSeats: number }
 */
export const upgradeSeats = asyncWrapper(async (req, res) => {
  const { organizationId } = req.params;
  const { additionalSeats } = req.body || {};

  if (additionalSeats === undefined || additionalSeats === null) {
    return res.status(400).json({
      success: false,
      error: 'additionalSeats is required',
    });
  }

  const result = await upgradeOrganizationSeats(organizationId, additionalSeats);

  return res.json({
    success: true,
    data: {
      organization: result.organization,
      subscription: result.subscription,
    },
    message: 'Seats upgraded successfully',
  });
});

