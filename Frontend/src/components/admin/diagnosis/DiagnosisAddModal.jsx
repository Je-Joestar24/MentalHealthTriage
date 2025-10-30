import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, MenuItem, InputAdornment, Chip, Box, Divider } from '@mui/material';
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

export default function DiagnosisAddModal({ open, onClose, onCreated }) {
    const { createDiagnosis, loadDiagnoses, pagination, filters } = useDiagnosis();
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

    const suggestions = useMemo(() => DEFAULT_SUGGESTIONS, []);

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
            const payload = {
                name: form.name.trim(),
                system: form.system,
                code: form.code.trim() || undefined,
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

    const isValid = form.name.trim() && form.system;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add Diagnosis</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                            label="Name"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            select
                            label="System"
                            value={form.system}
                            onChange={(e) => handleChange('system', e.target.value)}
                            size="small"
                            sx={{ minWidth: 160 }}
                            fullWidth
                        >
                            {SYSTEM_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Code"
                            value={form.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            size="small"
                            fullWidth
                        />
                    </Stack>

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