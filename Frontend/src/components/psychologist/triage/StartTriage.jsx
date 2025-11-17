import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box, Stack, Typography, Card, Divider, Button, Avatar, Collapse, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import usePatients from '../../../hooks/patientHook';
import useTriage from '../../../hooks/triageHook';
import TriageLeftPanel from './TriageLeftPanel';
import TriageRightPanel from './TriageRightPanel';

export default function StartTriage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentPatient, loadPatientById, loading } = usePatients();
    const { createTriage, clearMatched, clearAllMessages } = useTriage();
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (id) {
            loadPatientById(id);
        }
        return () => {
            clearMatched();
            clearAllMessages();
        };
    }, [id, loadPatientById, clearMatched, clearAllMessages]);

    const handleBack = () => {
        navigate('/psychologist/triage');
    };

    const toggleDetails = () => {
        setShowDetails((prev) => !prev);
    };

    const handleSaveTriage = useCallback(
        async (triageData) => {
            if (!id) return;
            const result = await createTriage(id, triageData);
            if (result?.meta?.requestStatus === 'fulfilled') {
                // Optionally navigate or show success message
                // navigate('/psychologist/triage');
            }
        },
        [id, createTriage]
    );

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography>Loading patient details...</Typography>
            </Container>
        );
    }

    if (!currentPatient) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Card elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Patient not found
                    </Typography>
                    <Button onClick={handleBack} sx={{ mt: 2 }}>
                        Back to Patient List
                    </Button>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={3}>

                {/* Patient Details Card */}
                <Card
                    elevation={0}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    }}
                >
                    <Stack spacing={1.5}>
                        {/* Header Section */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                            >
                                {currentPatient.name?.charAt(0).toUpperCase() || 'P'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        fontWeight: 600, 
                                        fontSize: '1.2rem',
                                        lineHeight: 1.3,
                                        mb: 0.25
                                    }}
                                    noWrap
                                >
                                    {currentPatient.name}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: '.7rem',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    ID: {currentPatient._id?.slice(-8)}
                                </Typography>
                            </Box>
                            <Button
                                onClick={handleBack}
                                variant="outlined"
                                size="small"
                                startIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                    fontSize: '0.75rem',
                                    px: 1.5,
                                    py: 0.5,
                                    minWidth: 'auto',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Change
                            </Button>
                        </Stack>

                        {/* Details Section - Collapsible */}
                        <Collapse in={showDetails} timeout={300}>
                            <Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Stack spacing={1.25}>
                                    {/* Age & Gender */}
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PersonOutlineIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography 
                                                variant="caption" 
                                                color="text.secondary" 
                                                sx={{ 
                                                    fontSize: '0.625rem',
                                                    display: 'block',
                                                    lineHeight: 1.2,
                                                    mb: 0.25
                                                }}
                                            >
                                                Age & Gender
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {currentPatient.age} years old • {currentPatient.gender || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Email */}
                                    {currentPatient.contactInfo?.email && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmailOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        fontSize: '0.625rem',
                                                        display: 'block',
                                                        lineHeight: 1.2,
                                                        mb: 0.25
                                                    }}
                                                >
                                                    Email
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        lineHeight: 1.3,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {currentPatient.contactInfo.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}

                                    {/* Phone */}
                                    {currentPatient.contactInfo?.phone && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        fontSize: '0.625rem',
                                                        display: 'block',
                                                        lineHeight: 1.2,
                                                        mb: 0.25
                                                    }}
                                                >
                                                    Phone
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {currentPatient.contactInfo.phone}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}

                                    {/* Registered Date */}
                                    {currentPatient.createdAt && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        fontSize: '0.625rem',
                                                        display: 'block',
                                                        lineHeight: 1.2,
                                                        mb: 0.25
                                                    }}
                                                >
                                                    Registered
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {new Date(currentPatient.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Stack>
                            </Box>
                        </Collapse>

                        {/* Toggle Details Button */}
                        <Button
                            onClick={toggleDetails}
                            variant="text"
                            size="small"
                            endIcon={showDetails ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                fontSize: '0.75rem',
                                textTransform: 'none',
                                color: 'text.secondary',
                                justifyContent: 'flex-start',
                                px: 0,
                                py: 0.5,
                                minWidth: 'auto',
                                '&:hover': {
                                    bgcolor: 'transparent',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            {showDetails ? 'Hide details' : 'More details'}
                        </Button>
                    </Stack>
                </Card>

                {/* Triage Form - Two Panel Layout */}
                <Card
                    elevation={0}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        minHeight: 600
                    }}
                >
                    <Grid container spacing={2.5} sx={{ height: '100%' }}>
                        {/* Left Panel - Form */}
                        <Grid item xs={12} md={5}>
                            <TriageLeftPanel patientId={id} onSave={handleSaveTriage} />
                        </Grid>

                        {/* Divider */}
                        <Grid item xs={12} md={0.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Divider orientation="vertical" sx={{ height: '100%', mx: 'auto' }} />
                        </Grid>

                        {/* Right Panel - Diagnosis List */}
                        <Grid item xs={12} md={6.5}>
                            <TriageRightPanel />
                        </Grid>
                    </Grid>
                </Card>
            </Stack>
        </Container>
    );
}
