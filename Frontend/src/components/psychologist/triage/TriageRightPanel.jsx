import React from 'react';
import {
    Box,
    Stack,
    Typography,
    Card,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import useTriage from '../../../hooks/triageHook';

export default function TriageRightPanel() {
    const { matchedDiagnoses, matchCount, loading } = useTriage();

    if (loading) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress size={32} />
            </Box>
        );
    }

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
                    Diagnosis Options
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Ranked by symptom matches; filtered by duration & course.
                </Typography>
            </Box>

            {/* Diagnosis List */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: (theme) => theme.palette.divider,
                        borderRadius: '3px',
                        '&:hover': {
                            background: (theme) => theme.palette.text.secondary
                        }
                    }
                }}
            >
                {matchedDiagnoses.length === 0 ? (
                    <Box
                        sx={{
                            py: 6,
                            textAlign: 'center',
                            color: 'text.secondary'
                        }}
                    >
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            No diagnoses matched yet.
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            Enter symptoms to see matching diagnoses.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {matchedDiagnoses.map((diagnosis, index) => (
                            <Card
                                key={diagnosis._id || index}
                                component={motion.div}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)'
                                    },
                                    width: '100%'
                                }}
                            >
                                <Stack spacing={1.5}>
                                    {/* Header */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {diagnosis.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.7rem' }}
                                            >
                                                {diagnosis.system || 'DSM-5'} - {diagnosis.dsm5Code || diagnosis.code || 'N/A'}
                                                {diagnosis.icd10Code && ` / ${diagnosis.icd10Code}`}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${diagnosis.matchCount || 0} symptom${(diagnosis.matchCount || 0) !== 1 ? 's' : ''} matched`}
                                            size="small"
                                            color={diagnosis.matchCount > 0 ? 'primary' : 'default'}
                                            sx={{
                                                fontSize: '0.7rem',
                                                height: 22,
                                                ml: 1
                                            }}
                                        />
                                    </Stack>

                                    <Divider sx={{ my: 0.5 }} />

                                    {/* Symptoms */}
                                    {diagnosis.allSymptoms && diagnosis.allSymptoms.length > 0 && (
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}
                                            >
                                                Associated Symptoms:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {diagnosis.allSymptoms.map((symptom, idx) => {
                                                    // Normalize symptom display: convert spaces to underscores
                                                    const normalizedSymptom = String(symptom).replace(/\s+/g, '_');
                                                    // Check if matched (handle both space and underscore variations)
                                                    const isMatched = diagnosis.matchedSymptoms?.some(ms => {
                                                        const msNormalized = String(ms).replace(/\s+/g, '_');
                                                        const symptomNormalized = String(symptom).replace(/\s+/g, '_');
                                                        return msNormalized === symptomNormalized || 
                                                               msNormalized === normalizedSymptom ||
                                                               symptomNormalized === normalizedSymptom;
                                                    });
                                                    return (
                                                        <Chip
                                                            key={idx}
                                                            label={`#${normalizedSymptom}`}
                                                            size="small"
                                                            variant={isMatched ? 'filled' : 'outlined'}
                                                            color={isMatched ? 'primary' : 'default'}
                                                            sx={{
                                                                fontSize: '0.7rem',
                                                                height: 20,
                                                                '& .MuiChip-label': {
                                                                    px: 0.75
                                                                }
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Duration & Course */}
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {diagnosis.typicalDuration && (
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.7rem', display: 'block' }}
                                                >
                                                    Typical Duration:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                                >
                                                    {diagnosis.durationContext ||
                                                        `${diagnosis.typicalDuration.min || ''}${diagnosis.typicalDuration.unit || 'months'}`}
                                                </Typography>
                                            </Box>
                                        )}
                                        {diagnosis.course && (
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.7rem', display: 'block' }}
                                                >
                                                    Course:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                                >
                                                    {diagnosis.course}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>

                                    {/* Description */}
                                    {diagnosis.keySymptomsSummary && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.75rem', lineHeight: 1.5, mt: 0.5 }}
                                        >
                                            {diagnosis.keySymptomsSummary}
                                        </Typography>
                                    )}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Footer */}
            {
                matchedDiagnoses.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Showing {matchCount} diagnosis{matchCount !== 1 ? 'es' : ''}
                        </Typography>
                    </Box>
                )
            }
        </Box >
    );
}

