import React, { useMemo, useState } from 'react';
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton, Chip, Button } from '@mui/material';
import { CheckCircleRounded } from '@mui/icons-material';
import '../../assets/styles/home/pricing.css';

const seatOptions = [
  { key: '4', label: '4 seats' },
  { key: '5', label: '5 seats' },
  { key: '6', label: '6 seats' },
  { key: '8', label: '8 seats' },
  { key: '10', label: '10 seats' },
  { key: '12', label: '12 seats' },
];

const tiers = [
  {
    id: 'individual',
    name: 'Individual',
    desc: 'For individual therapists and small practices',
    features: ['Core intake & triage', 'Secure records', 'Email notifications', 'Basic reporting'],
    highlight: false,
    basePrice: 60,
    isPerSeat: false, // Individual plan is not per-seat
  },
  {
    id: 'company',
    name: 'Company',
    desc: 'For organizations with multiple therapists',
    features: ['Multi-tenant orgs & roles', 'Integrations', 'Advanced reporting', 'Team management', 'Priority support'],
    highlight: true,
    basePrice: 50, // $50 per seat
    minSeats: 4, // Company starts at 4 seats
    isPerSeat: true, // Company plan is per-seat
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState('monthly');
  const [seats, setSeats] = useState('4');

  const priceSuffix = useMemo(() => (billing === 'yearly' ? 'yr' : 'mo'), [billing]);
  
  const getPrice = useMemo(() => {
    return (tier) => {
      const seatCountRaw = parseInt(seats) || 1;
      const seatCount = tier.id === 'company' && tier.minSeats ? Math.max(seatCountRaw, tier.minSeats) : seatCountRaw;
      const pricePerSeat = tier.basePrice;
      
      // Calculate total price
      if (tier.isPerSeat) {
        const monthlyTotal = pricePerSeat * seatCount;
        // For yearly billing, multiply by 12 months
        return billing === 'yearly' ? monthlyTotal * 12 : monthlyTotal;
      } else {
        // Individual plan is not per-seat, so just return the base price
        const monthlyPrice = tier.basePrice;
        // For yearly billing, multiply by 12 months
        return billing === 'yearly' ? monthlyPrice * 12 : monthlyPrice;
      }
    };
  }, [seats, billing]);

  const getPricePerSeat = useMemo(() => {
    return (tier) => {
      // Individual is not per-seat; for company simply return $50 (or annualized)
      const pricePerSeat = tier.basePrice;
      return billing === 'yearly' ? pricePerSeat * 12 : pricePerSeat;
    };
  }, [seats, billing]);

  return (
    <Box component="section" id="pricing" className="pricing-section" aria-label="Pricing Plans">
      <Container maxWidth="xl" className="pricing-container">
        <Box className="pricing-header">
          <Chip label="Choose your plan" size="small" color="primary" variant="outlined" />
          <Typography variant="h2" className="pricing-title">Simple, transparent pricing</Typography>
          <Typography variant="body1" color="text.secondary" className="pricing-subtitle" sx={{m:'auto'}}>
            Individual is $60/month. Company is $50 per seat with a 4-seat minimum. Billed {billing}. Switch anytime.
          </Typography>

          <Box className="pricing-controls" role="group" aria-label="Billing period and seats">
            <ToggleButtonGroup
              color="primary"
              value={billing}
              exclusive
              onChange={(e, v) => v && setBilling(v)}
              size="small"
              aria-label="Billing period"
            >
              <ToggleButton value="monthly" aria-label="Monthly billing">Monthly</ToggleButton>
              <ToggleButton value="yearly" aria-label="Yearly billing">Yearly</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              color="primary"
              value={seats}
              exclusive
              onChange={(e, v) => v && setSeats(v)}
              size="small"
              aria-label="Seat count"
            >
              {seatOptions.map(s => (
                <ToggleButton key={s.key} value={s.key} aria-label={s.label}>{s.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box className="pricing-grid" role="list">
          {tiers.map(tier => (
            <Box key={tier.id} className={`price-card ${tier.highlight ? 'is-highlight' : ''}`} sx={{display: 'flex', flexDirection: 'column'}} role="listitem" tabIndex={0} aria-label={`${tier.name} plan`}>
              <div className="price-card-head">
                <Typography variant="h6" className="price-name">{tier.name}</Typography>
                <Typography variant="body2" className="price-desc">{tier.desc}</Typography>
              </div>

              <div className="price-amount" aria-label={`Price: $${getPrice(tier)} per ${priceSuffix}`}>
                <span className="currency">$</span>
                <span className="value">{getPrice(tier)}</span>
                <span className="per">/{priceSuffix}</span>
                {tier.isPerSeat && (
                  <div className="per-seat-info">
                    <span className="per-seat-text">(${getPricePerSeat(tier)}/seat)</span>
                  </div>
                )}
              </div>

              <ul className="price-features">
                {tier.features.map((f, i) => (
                  <li key={i} className="feat">
                    <CheckCircleRounded />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={tier.highlight ? 'contained' : 'outlined'} color="primary" sx={{mt: 'auto'}} fullWidth aria-label={`Get started with ${tier.name}`}>
                Get started
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}


