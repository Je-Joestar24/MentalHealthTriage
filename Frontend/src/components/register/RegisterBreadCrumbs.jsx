import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

/**
 * Breadcrumb navigation for registration flow
 * Shows account type and current step
 */
const RegisterBreadCrumbs = ({ accountType, step, onNavigate }) => {
    const breadcrumbs = [];

    // Add account type if selected
    if (accountType) {
        breadcrumbs.push({
            label: accountType === 'individual' ? 'Individual' : 'Organization',
            id: 'accountType',
            active: step === 'select',
        });
    }

    // Add current step
    const stepLabels = {
        select: 'Select Account Type',
        email: 'Email Verification',
        details: 'Account Details',
        payment: 'Payment',
    };

    if (step !== 'select') {
        breadcrumbs.push({
            label: stepLabels[step] || step,
            id: step,
            active: true,
        });
    }

    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <Box
            component="nav"
            aria-label="Registration breadcrumbs"
            sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Breadcrumbs
                separator={<NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />}
                aria-label="Registration navigation"
            >
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <Box
                            key={crumb.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            {isLast ? (
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: 'primary.main',
                                    }}
                                >
                                    {crumb.label}
                                </Typography>
                            ) : (
                                <Link
                                    component="button"
                                    onClick={() => onNavigate && onNavigate(crumb.id)}
                                    sx={{
                                        fontSize: 13,
                                        color: 'text.secondary',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            color: 'primary.main',
                                            textDecoration: 'underline',
                                        },
                                        transition: 'color 0.2s ease',
                                    }}
                                    aria-label={`Navigate to ${crumb.label}`}
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </Box>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};

export default RegisterBreadCrumbs;

