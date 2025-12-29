import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Stack,
    Typography,
    Chip,
    Divider,
    Card,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import useTriage from '../../../hooks/triageHook';

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const SeverityChip = ({ severity }) => {
    const colorMap = {
        low: 'success',
        moderate: 'warning',
        high: 'error'
    };
    const color = colorMap[severity] || 'default';
    const label = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '—';
    return <Chip label={label} size="small" color={color} variant="filled" />;
};

export default function HistoryViewRecordModal({ open, onClose, triageId, patientId, onEdit }) {
    const {
        selectedTriage,
        getTriageById,
        matchDiagnoses,
        matchedDiagnoses,
        loading,
        clearSelected,
        clearMatched
    } = useTriage();
    const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);

    useEffect(() => {
        if (open && triageId && patientId) {
            getTriageById(patientId, triageId);
        }
        return () => {
            if (!open) {
                clearSelected();
                clearMatched();
            }
        };
    }, [open, triageId, patientId, getTriageById, clearSelected, clearMatched]);

    // Fetch matched diagnoses when triage data is loaded
    useEffect(() => {
        if (open && selectedTriage && selectedTriage._id) {
            setLoadingDiagnoses(true);
            const triageFilters = {};

            if (selectedTriage.duration && selectedTriage.durationUnit) {
                triageFilters.duration = selectedTriage.duration;
                triageFilters.durationUnit = selectedTriage.durationUnit;
            }
            if (selectedTriage.course) {
                triageFilters.course = selectedTriage.course;
            }
            if (selectedTriage.severityLevel) {
                triageFilters.severityLevel = selectedTriage.severityLevel;
            }
            if (selectedTriage.preliminaryDiagnosis) {
                triageFilters.preliminaryDiagnosis = selectedTriage.preliminaryDiagnosis;
            }
            if (selectedTriage.notes) {
                triageFilters.notes = selectedTriage.notes;
            }

            matchDiagnoses(
                selectedTriage.symptoms || [],
                null, // system filter - show both
                { page: 1, limit: 10 }, // Show top 10 matches
                triageFilters
            ).finally(() => {
                setLoadingDiagnoses(false);
            });
        }
    }, [open, selectedTriage?._id, matchDiagnoses]);

    const handleEdit = () => {
        if (onEdit && triageId && patientId) {
            onEdit(patientId, triageId);
        }
        onClose();
    };

    const handleClose = () => {
        clearSelected();
        onClose();
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
            }}
            aria-labelledby="view-triage-title"
        >
            <DialogTitle id="view-triage-title" sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            Triage Record Details
                        </Typography>
                    </Stack>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                        aria-label="Close"
                    >
                        <CloseOutlinedIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : selectedTriage ? (
                    <Stack spacing={2.5}>
                        {/* Header Info */}
                        <Card
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.default'
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <CalendarTodayOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                        Created
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        {formatDate(selectedTriage.createdAt)}
                                    </Typography>
                                </Box>
                                {selectedTriage.updatedAt && selectedTriage.updatedAt !== selectedTriage.createdAt && (
                                    <>
                                        <Divider orientation="vertical" flexItem />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                                Last Updated
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                {formatDate(selectedTriage.updatedAt)}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </Card>

                        {/* Psychologist Info */}
                        {selectedTriage.psychologist && (
                            <Card
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.default'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <PersonOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                                            Recorded By
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                            {selectedTriage.psychologist.name || 'N/A'}
                                        </Typography>
                                        {selectedTriage.psychologist.email && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                {selectedTriage.psychologist.email}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Card>
                        )}
                        <Grid container spacing={2}>
                            <Grid item xs={4} sx={{marginRight: 'auto'}}>
                                {/* Severity Level */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
                                        Severity Level
                                    </Typography>
                                    <SeverityChip severity={selectedTriage.severityLevel} />
                                </Box>
                                {/* Symptoms */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
                                        Symptoms
                                    </Typography>
                                    {selectedTriage.symptoms && selectedTriage.symptoms.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            {selectedTriage.symptoms.map((symptom, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={`#${symptom}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        height: 24,
                                                        '& .MuiChip-label': { px: 0.75 }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            No symptoms recorded
                                        </Typography>
                                    )}
                                </Box>
                                {/* Duration & Course */}
                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    {selectedTriage.duration && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                                                Duration
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                {selectedTriage.duration} {selectedTriage.durationUnit || 'months'}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedTriage.course && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                                                Course
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                                {selectedTriage.course}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                                {/* Preliminary Diagnosis */}
                                {selectedTriage.preliminaryDiagnosis && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
                                            Preliminary Diagnosis
                                        </Typography>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                                {selectedTriage.preliminaryDiagnosis}
                                            </Typography>
                                        </Card>
                                    </Box>
                                )}
                                {/* Notes */}
                                {selectedTriage.notes && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
                                            Notes
                                        </Typography>
                                        <Card
                                            elevation={0}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                {selectedTriage.notes}
                                            </Typography>
                                        </Card>
                                    </Box>
                                )}

                                {/* Empty State for Notes */}
                                {!selectedTriage.notes && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
                                            Notes
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            No notes recorded
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                            {/* Matched Diagnoses */}
                            <Grid item xs={8}  sx={{width: '100%',maxWidth: '650px'}}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <PsychologyOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                        Matched Diagnoses
                                    </Typography>
                                </Stack>
                                {loadingDiagnoses ? (
                                    <Box sx={{ py: 2 }}>
                                        <LinearProgress sx={{ borderRadius: 1 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1, display: 'block', textAlign: 'center' }}>
                                            Matching diagnoses...
                                        </Typography>
                                    </Box>
                                ) : matchedDiagnoses && matchedDiagnoses.length > 0 ? (
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper',
                                            maxHeight: 300,
                                            overflow: 'auto'
                                        }}
                                    >
                                        <List dense sx={{ py: 0.5 }}>
                                            {matchedDiagnoses.slice(0, 10).map((diagnosis, idx) => (
                                                <React.Fragment key={diagnosis._id || idx}>
                                                    <ListItem
                                                        component={motion.div}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                        sx={{
                                                            py: 1.25,
                                                            px: 1.5,
                                                            borderRadius: 1,
                                                            mb: 0.5,
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                                transform: 'translateX(4px)',
                                                                transition: 'all 0.2s ease'
                                                            }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontSize: '0.875rem',
                                                                            fontWeight: 500,
                                                                            flex: 1,
                                                                            minWidth: 0,
                                                                            color: 'text.primary'
                                                                        }}
                                                                        noWrap
                                                                    >
                                                                        {diagnosis.name || 'Unnamed Diagnosis'}
                                                                    </Typography>
                                                                    {diagnosis.code && (
                                                                        <Chip
                                                                            label={diagnosis.code}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{
                                                                                fontSize: '0.65rem',
                                                                                height: 22,
                                                                                fontWeight: 500,
                                                                                '& .MuiChip-label': { px: 0.75 }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {diagnosis.matchPercentage !== undefined && (
                                                                        <Chip
                                                                            label={`${Math.round(diagnosis.matchPercentage)}%`}
                                                                            size="small"
                                                                            color={diagnosis.matchPercentage >= 70 ? 'success' : diagnosis.matchPercentage >= 40 ? 'warning' : 'default'}
                                                                            variant={diagnosis.matchPercentage >= 70 ? 'filled' : 'outlined'}
                                                                            sx={{
                                                                                fontSize: '0.65rem',
                                                                                height: 22,
                                                                                fontWeight: 600,
                                                                                '& .MuiChip-label': { px: 0.75 }
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Stack>
                                                            }
                                                            secondary={
                                                                <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                                                                    {diagnosis.system && (
                                                                        <Chip
                                                                            label={diagnosis.system}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{
                                                                                fontSize: '0.65rem',
                                                                                height: 18,
                                                                                '& .MuiChip-label': { px: 0.5 }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {diagnosis.matchCount > 0 && (
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                            {diagnosis.matchCount} symptom{diagnosis.matchCount !== 1 ? 's' : ''}
                                                                        </Typography>
                                                                    )}
                                                                    {diagnosis.filterMatchCount > 0 && (
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                            {diagnosis.filterMatchCount} filter{diagnosis.filterMatchCount !== 1 ? 's' : ''}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {idx < matchedDiagnoses.slice(0, 10).length - 1 && (
                                                        <Divider component="li" sx={{ mx: 1.5 }} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                        {matchedDiagnoses.length > 10 && (
                                            <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                    Showing top 10 of {matchedDiagnoses.length} matches
                                                </Typography>
                                            </Box>
                                        )}
                                    </Card>
                                ) : (
                                    <Card
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            No matching diagnoses found
                                        </Typography>
                                    </Card>
                                )}
                            </Grid>
                        </Grid>


                    </Stack>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Unable to load triage record
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none' }}>
                    Close
                </Button>
                {selectedTriage && (
                    <Button
                        onClick={handleEdit}
                        variant="contained"
                        startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                        sx={{ textTransform: 'none' }}
                    >
                        Edit / Duplicate
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

