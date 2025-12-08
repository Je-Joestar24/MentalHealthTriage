import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import useUser from '../../hooks/userHook';
import RegisterLeftPanel from '../../components/register/RegisterLeftPanel';
import RegisterEmailVerify from '../../components/register/RegisterEmailVerify';
import RegisterIndividual from '../../components/register/RegisterIndividual';
import RegisterCompany from '../../components/register/RegisterCompany';
import RegisterStripePayment from '../../components/register/RegisterStripePayment';
import RegisterBreadCrumbs from '../../components/register/RegisterBreadCrumbs';

/**
 * High-level registration flow:
 * 1) Select account type (individual / organization)
 * 2) Verify email
 * 3) Enter details
 * 4) Stripe payment
 */
const RegisterPage = () => {
    const { registration } = useUser();

    const [accountType, setAccountType] = useState(null); // 'individual' | 'organization'
    const [step, setStep] = useState('select'); // 'select' | 'email' | 'details' | 'payment'
    const [email, setEmail] = useState('');
    const [emailStatus, setEmailStatus] = useState(null); // backend status string
    const [orgSeats, setOrgSeats] = useState(4);

    const handleSelectType = (type) => {
        setAccountType(type);
        setStep('email');
        setEmail('');
        setEmailStatus(null);
    };

    const steps = [
        { id: 'select', label: 'Account type' },
        { id: 'email', label: 'Email' },
        { id: 'details', label: 'Details' },
        { id: 'payment', label: 'Payment' },
    ];

    const handleEmailResult = ({ email: checkedEmail, status }) => {
        setEmail(checkedEmail);
        setEmailStatus(status);

        if (status === 'exists_paid') {
            // Stay on this step; RegisterEmailVerify shows login hint
            return;
        }

        setStep('details');
    };

    const handleDetailsNext = (resultWithSeats) => {
        if (accountType === 'organization' && resultWithSeats?.seats) {
            setOrgSeats(resultWithSeats.seats);
        }
        setStep('payment');
    };

    const handleBackFromPayment = () => {
        setStep('details');
    };

    const handleBreadcrumbNavigate = (targetId) => {
        if (targetId === 'accountType') {
            setAccountType(null);
            setStep('select');
            setEmail('');
            setEmailStatus(null);
        } else if (targetId === 'email') {
            setStep('email');
        } else if (targetId === 'details') {
            setStep('details');
        }
    };

    const renderStepContent = () => {
        if (!accountType || step === 'select') {
            return (
                <Box
                    component="section"
                    aria-label="Choose account type"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        animation: 'fadeInUp 320ms ease-out',
                        width: '100%',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Choose how you want to get started
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                            You can sign up as an individual psychologist or create an organization
                            workspace for your team.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        <Card
                            role="button"
                            aria-label="Register as individual psychologist"
                            onClick={() => handleSelectType('individual')}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                                background:
                                    'linear-gradient(135deg, rgba(59,130,246,0.03), rgba(15,23,42,0.01))',
                                transition:
                                    'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.02)',
                                    boxShadow: 8,
                                    borderColor: 'primary.light',
                                },
                            }}
                        >
                            <CardContent sx={{ py: 2.5, px: 3 }}>
                                <Chip
                                    label="Psychologist"
                                    color="primary"
                                    size="small"
                                    sx={{ mb: 1.5, fontWeight: 600 }}
                                />
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                    Individual account
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                                    Perfect for solo practitioners who want a focused triage workspace.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            role="button"
                            aria-label="Register as organization"
                            onClick={() => handleSelectType('organization')}
                            sx={{
                                cursor: 'pointer',
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: 'none',
                                background:
                                    'linear-gradient(135deg, rgba(236,72,153,0.03), rgba(15,23,42,0.01))',
                                transition:
                                    'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px) scale(1.02)',
                                    boxShadow: 8,
                                    borderColor: 'secondary.light',
                                },
                            }}
                        >
                            <CardContent sx={{ py: 2.5, px: 3 }}>
                                <Chip
                                    label="Organization"
                                    color="secondary"
                                    size="small"
                                    sx={{ mb: 1.5, fontWeight: 600 }}
                                />
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                    Team workspace
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                                    Onboard multiple psychologists under one organization administrator.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            );
        }

        if (step === 'email') {
            return (
                <RegisterEmailVerify
                    accountType={accountType}
                    onResult={handleEmailResult}
                />
            );
        }

        if (step === 'details') {
            if (accountType === 'organization') {
                return (
                    <RegisterCompany
                        email={email}
                        onNext={handleDetailsNext}
                        existingStatus={emailStatus}
                    />
                );
            }
            return (
                <RegisterIndividual
                    email={email}
                    onNext={handleDetailsNext}
                    existingStatus={emailStatus}
                />
            );
        }

        if (step === 'payment') {
            return (
                <RegisterStripePayment
                    accountType={accountType}
                    seats={accountType === 'organization' ? orgSeats : 1}
                    onBack={handleBackFromPayment}
                />
            );
        }

        return null;
    };

    return (
        <Box
            component="main"
            role="main"
            aria-label="Registration page"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                py: { xs: 4, md: 6 },
                px: { xs: 2, md: 4 },
            }}
        >
            <Box
                sx={{
                    maxWidth: 1720,
                    width: '100%',
                    minHeight: { md: 600 },
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    boxShadow:
                        '0 22px 45px rgba(15, 23, 42, 0.16), 0 10px 18px rgba(15, 23, 42, 0.06)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(12px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                    animation: 'fadeInUp 360ms ease-out',
                }}
            >
                <Box
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        width: '100%',
                        minHeight: '100%',
                        alignItems: 'center',
                    }}
                >
                    <RegisterLeftPanel />
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        minHeight: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: { xs: 3, md: 5 },
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: { md: 600 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        {/* Header Section */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                mb: 1,
                            }}
                        >
                            <Typography
                                component="h1"
                                variant="h5"
                                sx={{ fontWeight: 700, mb: 1 }}
                            >
                                Get started
                            </Typography>
                            <Typography
                                component="p"
                                variant="body2"
                                sx={{ color: 'text.secondary', maxWidth: 480 }}
                            >
                                Complete a few quick steps to set up your account.
                            </Typography>
                        </Box>

                        {/* Breadcrumbs */}
                        {(accountType || step !== 'select') && (
                            <RegisterBreadCrumbs
                                accountType={accountType}
                                step={step}
                                onNavigate={handleBreadcrumbNavigate}
                            />
                        )}

                        {/* Progress Steps */}
                        <Box
                            component="nav"
                            aria-label="Registration progress"
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: 1,
                                mb: 1,
                            }}
                        >
                            {steps.map((item, index) => {
                                const isActive = step === item.id;
                                const isCompleted =
                                    steps.findIndex((s) => s.id === step) > index;
                                return (
                                    <Box
                                        key={item.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            px: 1.5,
                                            py: 0.75,
                                            borderRadius: 999,
                                            border: '1px solid',
                                            borderColor: isActive
                                                ? 'primary.main'
                                                : isCompleted
                                                ? 'success.light'
                                                : 'divider',
                                            backgroundColor: isActive
                                                ? 'primary.main'
                                                : 'background.default',
                                            color: isActive ? 'primary.contrastText' : 'text.secondary',
                                            transition:
                                                'background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.15s ease',
                                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            aria-hidden="true"
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                borderColor: isActive
                                                    ? 'primary.contrastText'
                                                    : isCompleted
                                                    ? 'success.main'
                                                    : 'divider',
                                                backgroundColor: isCompleted
                                                    ? 'success.main'
                                                    : 'transparent',
                                                transition: 'all 0.18s ease',
                                            }}
                                        />
                                        <Typography
                                            component="span"
                                            sx={{ fontSize: 12, fontWeight: isActive ? 600 : 500 }}
                                        >
                                            {item.label}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Main Content */}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                width: '100%',
                            }}
                        >
                            {renderStepContent()}
                        </Box>

                        {/* Login Link - Below Content */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 2,
                            }}
                        >
                            <Button
                                href="/auth/login"
                                color="primary"
                                variant="text"
                                aria-label="Go to login page"
                                sx={{
                                    fontSize: 14,
                                    textTransform: 'none',
                                }}
                            >
                                Already have an account? Sign in
                            </Button>
                        </Box>

                        {registration?.step === 'payment' && (
                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 2,
                                    color: 'text.secondary',
                                    textAlign: 'center',
                                }}
                            >
                                You will be redirected to Stripe to securely complete your payment.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default RegisterPage;


