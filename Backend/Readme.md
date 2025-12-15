# Backend

## Subscription Seat Upgrades
- Organizations can increase seats mid-cycle.
- Additional seats are prorated for the remainder of the current billing period; billing date stays the same.
- New seats are available immediately after payment is confirmed.
- API: `POST /api/subscription/organizations/:organizationId/upgrade-seats` with body `{ "additionalSeats": <number> }`.