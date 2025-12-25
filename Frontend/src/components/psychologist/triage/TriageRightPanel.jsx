import React, { useCallback, useState, useEffect } from 'react';
import {
    Box,
    Stack,
    Typography,
    Card,
    Chip,
    Divider,
    CircularProgress,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import { motion } from 'framer-motion';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import useTriage from '../../../hooks/triageHook';
import useDiagnosis from '../../../hooks/diagnosisHook';
import DiagnosisNotesList from '../../admin/diagnosis/DiagnosisNotesList';
import DiagnosisAddNoteModal from '../../admin/diagnosis/DiagnosisAddNoteModal';

const LIMIT_OPTIONS = [2, 5, 10, 20, 50];

export default function TriageRightPanel() {
    const { matchedDiagnoses, matchCount, matchPagination, matchQuery, loading, matchDiagnoses: matchDiagnosesAction } = useTriage();
    const {
        notes,
        notesLoading,
        notesError,
        handleAddNote,
        handleViewNotes,
        handleCreateNote,
        handleEditNote,
        handleDeleteNote,
        handleCloseAddNote,
        handleCloseViewNotes,
        openAddNote,
        openViewNotes,
        selectedDiagnosis
    } = useDiagnosis();
    const [limit, setLimit] = useState(2);

    // Sync limit with pagination when it changes
    useEffect(() => {
        if (matchPagination?.itemsPerPage) {
            setLimit(matchPagination.itemsPerPage);
        }
    }, [matchPagination?.itemsPerPage]);

    const handlePageChange = useCallback((event, page) => {
        if (!matchPagination) return;
        
        // Get current system filter, symptoms, and triage filters from matchQuery
        const system = matchQuery?.system || null;
        const symptoms = matchQuery?.symptoms || [];
        const showAll = matchQuery?.showAll || (symptoms.length === 0);
        const triageFilters = matchQuery?.filters || {};
        
        matchDiagnosesAction(symptoms, system, {
            page,
            limit: limit,
            showAll
        }, triageFilters);
    }, [matchPagination, matchQuery, matchDiagnosesAction, limit]);

    const handleLimitChange = useCallback((event) => {
        const newLimit = event.target.value;
        setLimit(newLimit);
        
        // Get current system filter, symptoms, and triage filters from matchQuery
        const system = matchQuery?.system || null;
        const symptoms = matchQuery?.symptoms || [];
        const showAll = matchQuery?.showAll || (symptoms.length === 0);
        const triageFilters = matchQuery?.filters || {};
        
        // Reset to page 1 when limit changes
        matchDiagnosesAction(symptoms, system, {
            page: 1,
            limit: newLimit,
            showAll
        }, triageFilters);
    }, [matchQuery, matchDiagnosesAction]);

    if (loading && matchedDiagnoses.length === 0) {
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
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minWidth: 0
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
                    Diagnosis Options
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Ranked by symptom and filter matches. Shows diagnoses matching symptoms OR filters.
                </Typography>
            </Box>

            {/* Diagnosis List */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    pr: 1,
                    width: '100%',
                    minWidth: 0,
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
                            Enter symptoms or set filters (duration, course, severity) to see matching diagnoses.
                        </Typography>
                    </Box>
                ) : (
                    <Stack 
                        spacing={2}
                        sx={{
                            width: '100%',
                            minWidth: 0
                        }}
                    >
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
                                    width: '100%',
                                    minWidth: { xs: '100%', md: '300px' },
                                    maxWidth: { xs: '100%', md: '100%' }
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
                                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                            {diagnosis.matchCount > 0 && (
                                                <Chip
                                                    label={`${diagnosis.matchCount} symptom${diagnosis.matchCount !== 1 ? 's' : ''}`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        height: 22,
                                                        ml: 1
                                                    }}
                                                />
                                            )}
                                            {diagnosis.filterMatchCount > 0 && (
                                                <Chip
                                                    label={`${diagnosis.filterMatchCount}/${diagnosis.totalFilters} filters`}
                                                    size="small"
                                                    color="success"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        height: 22,
                                                        ml: diagnosis.matchCount > 0 ? 0.5 : 1
                                                    }}
                                                />
                                            )}
                                            {diagnosis.matchCount === 0 && diagnosis.filterMatchCount === 0 && (
                                                <Chip
                                                    label="No matches"
                                                    size="small"
                                                    color="default"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        height: 22,
                                                        ml: 1
                                                    }}
                                                />
                                            )}
                                            <Tooltip title="View notes" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleViewNotes(diagnosis);
                                                    }}
                                                    sx={{
                                                        color: 'primary.main',
                                                        ml: 0.5,
                                                        '&:hover': {
                                                            backgroundColor: 'primary.light',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <NotesOutlinedIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Add note" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleAddNote(diagnosis);
                                                    }}
                                                    sx={{
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.light',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <NoteAddOutlinedIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
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

                                    {/* Filter Match Indicators */}
                                    {diagnosis.filterMatches && Object.keys(diagnosis.filterMatches).length > 0 && (
                                        <Box sx={{ mb: 1 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}
                                            >
                                                Filter Matches:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {diagnosis.filterMatches.duration !== undefined && (
                                                    <Chip
                                                        label={`Duration ${diagnosis.filterMatches.duration ? '✓' : '✗'}`}
                                                        size="small"
                                                        color={diagnosis.filterMatches.duration ? 'success' : 'default'}
                                                        variant={diagnosis.filterMatches.duration ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': {
                                                                px: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {diagnosis.filterMatches.course !== undefined && (
                                                    <Chip
                                                        label={`Course ${diagnosis.filterMatches.course ? '✓' : '✗'}`}
                                                        size="small"
                                                        color={diagnosis.filterMatches.course ? 'success' : 'default'}
                                                        variant={diagnosis.filterMatches.course ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': {
                                                                px: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {diagnosis.filterMatches.severity !== undefined && (
                                                    <Chip
                                                        label={`Severity ${diagnosis.filterMatches.severity ? '✓' : '✗'}`}
                                                        size="small"
                                                        color={diagnosis.filterMatches.severity ? 'success' : 'default'}
                                                        variant={diagnosis.filterMatches.severity ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': {
                                                                px: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {diagnosis.filterMatches.preliminaryDiagnosis !== undefined && (
                                                    <Chip
                                                        label={`Prelim. Dx ${diagnosis.filterMatches.preliminaryDiagnosis ? '✓' : '✗'}`}
                                                        size="small"
                                                        color={diagnosis.filterMatches.preliminaryDiagnosis ? 'success' : 'default'}
                                                        variant={diagnosis.filterMatches.preliminaryDiagnosis ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': {
                                                                px: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {diagnosis.filterMatches.notes !== undefined && (
                                                    <Chip
                                                        label={`Notes ${diagnosis.filterMatches.notes ? '✓' : '✗'}`}
                                                        size="small"
                                                        color={diagnosis.filterMatches.notes ? 'success' : 'default'}
                                                        variant={diagnosis.filterMatches.notes ? 'filled' : 'outlined'}
                                                        sx={{
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                            '& .MuiChip-label': {
                                                                px: 0.5
                                                            }
                                                        }}
                                                    />
                                                )}
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
                                        {diagnosis.severity && (
                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.7rem', display: 'block' }}
                                                >
                                                    Severity:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                                >
                                                    {Array.isArray(diagnosis.severity) 
                                                        ? diagnosis.severity.join(', ') 
                                                        : diagnosis.severity}
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

            {/* Footer with Pagination */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {matchPagination ? (
                            <>Showing {((matchPagination.currentPage - 1) * matchPagination.itemsPerPage) + 1} - {Math.min(matchPagination.currentPage * matchPagination.itemsPerPage, matchPagination.totalItems)} of {matchPagination.totalItems} diagnoses</>
                        ) : (
                            <>Showing {matchCount} diagnosis{matchCount !== 1 ? 'es' : ''}</>
                        )}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        {/* Limit Selector */}
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                            <InputLabel sx={{ fontSize: '0.7rem' }}>Limit</InputLabel>
                            <Select
                                value={limit}
                                label="Limit"
                                onChange={handleLimitChange}
                                disabled={loading}
                                sx={{
                                    fontSize: '0.7rem',
                                    height: 28,
                                    '& .MuiSelect-select': {
                                        py: 0.5,
                                        fontSize: '0.7rem'
                                    }
                                }}
                            >
                                {LIMIT_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option} sx={{ fontSize: '0.7rem', py: 0.5 }}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* Pagination Controls */}
                        {matchPagination && matchPagination.totalPages > 1 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Button
                                    size="small"
                                    onClick={() => handlePageChange(null, matchPagination.currentPage - 1)}
                                    disabled={!matchPagination.hasPrevPage || loading}
                                    startIcon={<KeyboardArrowLeftIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        fontSize: '0.7rem',
                                        px: 1,
                                        py: 0.5,
                                        minHeight: 28,
                                        textTransform: 'none'
                                    }}
                                >
                                    Prev
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', px: 1 }}>
                                    Page {matchPagination.currentPage} of {matchPagination.totalPages}
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => handlePageChange(null, matchPagination.currentPage + 1)}
                                    disabled={!matchPagination.hasNextPage || loading}
                                    endIcon={<KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        fontSize: '0.7rem',
                                        px: 1,
                                        py: 0.5,
                                        minHeight: 28,
                                        textTransform: 'none'
                                    }}
                                >
                                    Next
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Box>

            {/* Notes Modals */}
            <DiagnosisAddNoteModal
                open={openAddNote}
                onClose={handleCloseAddNote}
                onAdd={handleCreateNote}
                loading={notesLoading}
            />

            <Dialog
                open={openViewNotes}
                onClose={handleCloseViewNotes}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    },
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {selectedDiagnosis?.name || 'Diagnosis'} - Notes
                        </Typography>
                        <IconButton
                            onClick={handleCloseViewNotes}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                            aria-label="Close"
                        >
                            <CloseOutlinedIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {selectedDiagnosis && (
                        <DiagnosisNotesList
                            diagnosisId={selectedDiagnosis._id}
                            notes={notes}
                            loading={notesLoading}
                            error={notesError}
                            onEditNote={handleEditNote}
                            onDeleteNote={handleDeleteNote}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box >
    );
}

