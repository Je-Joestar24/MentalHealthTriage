import React, { useMemo, useState } from 'react';
import { Box, Container, Typography, ToggleButtonGroup, ToggleButton, Chip, Button } from '@mui/material';
import { CheckCircleRounded } from '@mui/icons-material';
import '../../assets/styles/home/pricing.css';

const seatOptions = [
  { key: '1', label: '1 seat' },
  { key: '5', label: '5 seats' },
  { key: '10+', label: '10+ seats' },
];

const tiers = [
  {
    id: 'team',
    name: 'Team',
    desc: 'For small practices getting started',
    features: ['Core intake & triage', 'Secure records', 'Email notifications'],
    highlight: false,
  },
  {
    id: 'agency',
    name: 'Agency',
    desc: 'For growing organizations',
    features: ['Multi-tenant orgs & roles', 'Integrations', 'Advanced reporting'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'For large orgs and networks',
    features: ['SLA & priority support', 'Custom controls', 'SSO & audit trails'],
    highlight: false,
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState('monthly');
  const [seats, setSeats] = useState('1');

  const priceSuffix = useMemo(() => (billing === 'yearly' ? 'yr' : 'mo'), [billing]);

  return (
    <Box component="section" id="pricing" className="pricing-section" aria-label="Pricing Plans">
      <Container maxWidth="xl" className="pricing-container">
        <Box className="pricing-header">
          <Chip label="Choose your plan" size="small" color="primary" variant="outlined" />
          <Typography variant="h2" className="pricing-title">Simple, transparent pricing</Typography>
          <Typography variant="body1" color="text.secondary" className="pricing-subtitle" sx={{m:'auto'}}>Per seat, billed {billing}. Switch anytime.</Typography>

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
            <Box key={tier.id} className={`price-card ${tier.highlight ? 'is-highlight' : ''}`} role="listitem" tabIndex={0} aria-label={`${tier.name} plan`}>
              <div className="price-card-head">
                <Typography variant="h6" className="price-name">{tier.name}</Typography>
                <Typography variant="body2" className="price-desc">{tier.desc}</Typography>
              </div>

              <div className="price-amount" aria-label="Price placeholder">
                <span className="currency">$</span>
                <span className="value">--.--</span>
                <span className="per">/{priceSuffix}</span>
              </div>

              <ul className="price-features">
                {tier.features.map((f, i) => (
                  <li key={i} className="feat">
                    <CheckCircleRounded />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={tier.highlight ? 'contained' : 'outlined'} color="primary" fullWidth aria-label={`Get started with ${tier.name}`}>
                Get started
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}


