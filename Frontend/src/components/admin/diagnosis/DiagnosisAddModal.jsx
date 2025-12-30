import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, MenuItem, InputAdornment, Chip, Box, Divider, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import useDiagnosis from '../../../hooks/diagnosisHook';
import useUser from '../../../hooks/userHook';

const SYSTEM_OPTIONS = ['DSM-5', 'ICD-10'];
const COURSE_OPTIONS = ['Continuous', 'Episodic', 'Either'];
const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];

const DEFAULT_FORM = {
    name: '',
    system: 'DSM-5',
    code: '',
    dsm5Code: '',
    icd10Code: '',
    symptoms: [],
    course: 'Either',
    typicalDuration: { min: 0, unit: 'weeks', max:0 },
    fullCriteriaSummary: '',
    keySymptomsSummary: '',
    severity: '',
    specifiers: ''
};

const DEFAULT_SUGGESTIONS = [
    'depressed_mood',
    'loss_of_interest',
    'insomnia',
    'fatigue',
    'anxiety',
    'panic_attacks',
    'difficulty_concentrating',
    'irritability',
    'appetite_changes'
];

const prettyToSnake = (pretty = '') => String(pretty).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');

export default function DiagnosisAddModal({ open, onClose, onCreated }) {
    const { createDiagnosis, loadDiagnoses, pagination, filters, loadSymptoms, symptoms: suggestionList } = useDiagnosis();
    const { user } = useUser();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    // Autocomplete input state to allow adding with space/enter when prefixed with '#'
    const [symptomInput, setSymptomInput] = useState('');

    useEffect(() => {
        if (!open) {
            setForm(DEFAULT_FORM);
            setSymptomInput('');
        }
    }, [open]);

    useEffect(() => {
        if (open && (!suggestionList || suggestionList.length === 0)) {
            loadSymptoms();
        }
    }, [open]);

    // suggestions for autocomplete:
    const suggestions = useMemo(() => {
        // combine backend suggestions (prettified) and fallback DEFAULT_SUGGESTIONS
        const backend = (suggestionList || []).map(prettyToSnake);
        const fallback = DEFAULT_SUGGESTIONS.map(prettyToSnake);
        // Remove duplicates
        return Array.from(new Set([...backend, ...fallback]));
    }, [suggestionList]);

    const handleChange = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleDurationChange = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, typicalDuration: { ...prev.typicalDuration, [key]: value } }));
    }, []);

    const normalizeSymptomToken = (raw) => {
        if (!raw) return '';
        const trimmed = String(raw).trim();
        const noHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
        // convert spaces and hyphens to underscores, lowercase
        return noHash.replace(/\s+/g, '_').replace(/-+/g, '_').toLowerCase();
    };

    const displayChipLabel = (token) => `#${token}`;

    const addSymptomFromInput = useCallback(() => {
        const token = normalizeSymptomToken(symptomInput);
        if (!token) return;
        setForm((prev) => {
            if (prev.symptoms.includes(token)) return prev;
            return { ...prev, symptoms: [...prev.symptoms, token] };
        });
        setSymptomInput('');
    }, [symptomInput]);

    const handleSymptomKeyDown = (e) => {
        // Add on Enter or Space if input starts with '#'
        if ((e.key === 'Enter' || e.key === ' ') && symptomInput.trim().startsWith('#')) {
            e.preventDefault();
            addSymptomFromInput();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const role = user?.role;
            const roleToType = role === 'super_admin' ? 'global' : role === 'company_admin' ? 'organization' : 'personal';
            
            // Determine system and code based on provided codes
            const dsm5Code = form.dsm5Code.trim() || undefined;
            const icd10Code = form.icd10Code.trim() || undefined;
            
            // Set system based on which codes are provided (prefer DSM-5 if both, otherwise use the one provided)
            let system = 'DSM-5'; // default
            let code = dsm5Code || icd10Code || undefined;
            
            if (dsm5Code && icd10Code) {
                system = 'DSM-5'; // Default to DSM-5 when both are present
                code = dsm5Code; // Use DSM-5 as primary code for backward compatibility
            } else if (icd10Code && !dsm5Code) {
                system = 'ICD-10';
                code = icd10Code;
            } else if (dsm5Code && !icd10Code) {
                system = 'DSM-5';
                code = dsm5Code;
            }
            
            const payload = {
                name: form.name.trim(),
                system: system,
                code: code,
                dsm5Code: dsm5Code,
                icd10Code: icd10Code,
                type: roleToType,
                symptoms: (form.symptoms || []).filter(Boolean),
                course: form.course,
                typicalDuration: {
                    min: form.typicalDuration.min === '' ? null : Number(form.typicalDuration.min),
                    unit: form.typicalDuration.unit,
                    max: form.typicalDuration.max === '' ? null : Number(form.typicalDuration.max)
                },
                fullCriteriaSummary: form.fullCriteriaSummary.trim() || undefined,
                keySymptomsSummary: form.keySymptomsSummary.trim() || undefined,
                severity: form.severity.trim() || undefined,
                specifiers: form.specifiers.trim() || undefined
            };

            await createDiagnosis(payload);
            await loadDiagnoses({ page: pagination?.page || 1, limit: pagination?.limit || 10, ...filters });
            onCreated?.();
            onClose?.();
        } finally {
            setSubmitting(false);
        }
    };

    // At least one code (DSM-5 or ICD-10) should be provided
    const isValid = form.name.trim() && (form.dsm5Code.trim() || form.icd10Code.trim());

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add Diagnosis</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        size="small"
                        fullWidth
                        required
                    />
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                            label="DSM-5 Code"
                            value={form.dsm5Code}
                            onChange={(e) => handleChange('dsm5Code', e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="e.g., 300.4"
                            helperText="DSM-5 diagnostic code"
                        />
                        <TextField
                            label="ICD-10 Code"
                            value={form.icd10Code}
                            onChange={(e) => handleChange('icd10Code', e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="e.g., F34.1"
                            helperText="ICD-10 diagnostic code"
                        />
                    </Stack>
                    
                    <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'info.light', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'info.main'
                    }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'info.dark' }}>
                            <strong>Note:</strong> At least one code (DSM-5 or ICD-10) is recommended. Both codes can be provided for dual coding standard.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                            select
                            label="Course"
                            value={form.course}
                            onChange={(e) => handleChange('course', e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                            fullWidth
                        >
                            {COURSE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </TextField>

                        <Stack direction={{ xs: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                            <TextField
                                label="Duration min"
                                type="number"
                                inputProps={{ min: 0 }}
                                value={form.typicalDuration.min}
                                onChange={(e) => handleDurationChange('min', e.target.value)}
                                size="small"
                                sx={{ flex: '1 1 0' }}
                                InputProps={{ endAdornment: <InputAdornment position="end">{form.typicalDuration.unit}</InputAdornment> }}
                            />
                            <TextField
                                select
                                label="Unit"
                                value={form.typicalDuration.unit}
                                onChange={(e) => handleDurationChange('unit', e.target.value)}
                                size="small"
                                sx={{ minWidth: 180, flex: '0 0 180px' }}
                            >
                                {DURATION_UNITS.map((u) => (
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Duration max"
                                type="number"
                                inputProps={{ min: 0 }}
                                value={form.typicalDuration.max}
                                onChange={(e) => handleDurationChange('max', e.target.value)}
                                size="small"
                                sx={{ flex: '1 1 0' }}
                                InputProps={{ endAdornment: <InputAdornment position="end">{form.typicalDuration.unit}</InputAdornment> }}
                            />
                        </Stack>
                    </Stack>

                    <Box>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={suggestions}
                            value={form.symptoms}
                            onChange={(e, newValue) => {
                                // Map any free solo entries through normalizer
                                const normalized = Array.from(new Set(newValue.map(normalizeSymptomToken).filter(Boolean)));
                                handleChange('symptoms', normalized);
                            }}
                            inputValue={symptomInput}
                            onInputChange={(e, value) => setSymptomInput(value)}
                            filterOptions={(options, params) => {
                                const raw = params.inputValue || '';
                                const key = normalizeSymptomToken(raw);
                                if (!key) return options;
                                return options.filter((opt) => opt.includes(key));
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={`opt-${option}`}>#{option}</li>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip variant="outlined" label={displayChipLabel(option)} {...getTagProps({ index })} key={`${option}-${index}`} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Symptoms (type #tag, press Space/Enter)"
                                    size="small"
                                    onKeyDown={handleSymptomKeyDown}
                                    placeholder="#depressed_mood"
                                    helperText="Use #hashtags; suggestions available; duplicates ignored"
                                />
                            )}
                        />
                    </Box>

                    <Divider />

                    <TextField
                        label="Key symptoms summary"
                        value={form.keySymptomsSummary}
                        onChange={(e) => handleChange('keySymptomsSummary', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                    />
                    <TextField
                        label="Full criteria summary"
                        value={form.fullCriteriaSummary}
                        onChange={(e) => handleChange('fullCriteriaSummary', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                            label="Severity"
                            value={form.severity}
                            onChange={(e) => handleChange('severity', e.target.value)}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Specifiers"
                            value={form.specifiers}
                            onChange={(e) => handleChange('specifiers', e.target.value)}
                            size="small"
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} size="small">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting || !isValid} size="small">
                    {submitting ? 'Creating…' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}