import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Button, MenuItem, InputAdornment, Chip, Box, Divider } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import useDiagnosis from '../../../hooks/diagnosisHook';

const SYSTEM_OPTIONS = ['DSM-5', 'ICD-10'];
const COURSE_OPTIONS = ['Continuous', 'Episodic', 'Either'];
const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];

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

export default function DiagnosisEditModal({ open, onClose, data, onUpdated }) {
  const { updateDiagnosis, loadSymptoms, symptoms: suggestionList } = useDiagnosis();
  const [form, setForm] = useState({
    name: '',
    system: 'DSM-5',
    code: '',
    dsm5Code: '',
    icd10Code: '',
    symptoms: [],
    course: 'Either',
    typicalDuration: { min: 0, unit: 'weeks', max: 0 },
    fullCriteriaSummary: '',
    keySymptomsSummary: '',
    severity: '',
    specifiers: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const suggestions = useMemo(() => {
    const backend = (suggestionList || []).map(prettyToSnake);
    const fallback = DEFAULT_SUGGESTIONS.map(prettyToSnake);
    return Array.from(new Set([...backend, ...fallback]));
  }, [suggestionList]);

  const hasDualCodes = useMemo(
    () => Boolean(data?.dsm5Code || data?.icd10Code),
    [data]
  );
  const [showDualCodes, setShowDualCodes] = useState(hasDualCodes);

  // Helper to normalize severity/specifiers (array -> string for display, or keep string)
  const normalizeFieldForDisplay = (value) => {
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    return value || '';
  };

  useEffect(() => {
    if (open && data) {
      setForm({
        name: data.name || '',
        system: data.system || 'DSM-5',
        code: data.code || '',
        dsm5Code: data.dsm5Code || '',
        icd10Code: data.icd10Code || '',
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        course: data.course || 'Either',
        typicalDuration: {
          min: data?.typicalDuration?.min ?? 0,
          unit: data?.typicalDuration?.unit || 'weeks',
          max: data?.typicalDuration?.max ?? 0,
        },
        fullCriteriaSummary: data.fullCriteriaSummary || '',
        keySymptomsSummary: data.keySymptomsSummary || '',
        severity: normalizeFieldForDisplay(data.severity),
        specifiers: normalizeFieldForDisplay(data.specifiers)
      });
      setShowDualCodes(Boolean(data?.dsm5Code || data?.icd10Code));
      setSymptomInput('');
    }
    if (!open) {
      setSymptomInput('');
    }
  }, [open, data]);

  useEffect(() => {
    if (open && (!suggestionList || suggestionList.length === 0)) {
      loadSymptoms();
    }
  }, [open ]);

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
    if ((e.key === 'Enter' || e.key === ' ') && symptomInput.trim().startsWith('#')) {
      e.preventDefault();
      addSymptomFromInput();
    }
  };

  const handleSubmit = async () => {
    if (!data?._id) return;
    setSubmitting(true);
    try {
      // Helper to parse semicolon-separated string into array, or keep as string if preferred
      const parseFieldForBackend = (value) => {
        if (!value || !value.trim()) return undefined;
        // If user entered semicolon-separated values, parse to array for consistency
        // Otherwise keep as string for backward compatibility
        if (value.includes(';')) {
          return value.split(';').map(s => s.trim()).filter(Boolean);
        }
        return value.trim();
      };

      const payload = {
        // name/system/code/type are immutable in backend update service
        symptoms: (form.symptoms || []).filter(Boolean),
        course: form.course,
        typicalDuration: {
          min: form.typicalDuration.min === '' ? null : Number(form.typicalDuration.min),
          unit: form.typicalDuration.unit,
          max: form.typicalDuration.max === '' ? null : Number(form.typicalDuration.max)
        },
        fullCriteriaSummary: form.fullCriteriaSummary?.trim() || undefined,
        keySymptomsSummary: form.keySymptomsSummary?.trim() || undefined,
        severity: parseFieldForBackend(form.severity),
        specifiers: parseFieldForBackend(form.specifiers),
      };

      if (showDualCodes) {
        payload.dsm5Code = form.dsm5Code?.trim() || undefined;
        payload.icd10Code = form.icd10Code?.trim() || undefined;
      }

      const result = await updateDiagnosis(data._id, payload);
      if (result?.meta?.requestStatus === 'fulfilled') {
        onUpdated?.();
        onClose?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = Boolean(data?._id);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Diagnosis</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Name"
              value={form.name}
              size="small"
              fullWidth
              disabled
            />

            {showDualCodes ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                <TextField
                  label="DSM-5 code"
                  value={form.dsm5Code}
                  onChange={(e) => handleChange('dsm5Code', e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="ICD-10 code"
                  value={form.icd10Code}
                  onChange={(e) => handleChange('icd10Code', e.target.value)}
                  size="small"
                  fullWidth
                />
              </Stack>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                <TextField
                  select
                  label="System"
                  value={form.system}
                  size="small"
                  sx={{ minWidth: 160 }}
                  fullWidth
                  disabled
                >
                  {SYSTEM_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Code"
                  value={form.code}
                  size="small"
                  fullWidth
                  disabled
                />
              </Stack>
            )}
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
                const normalized = Array.from(new Set(newValue.map((v) => normalizeSymptomToken(v)).filter(Boolean)));
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
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
