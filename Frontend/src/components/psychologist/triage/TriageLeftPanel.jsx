import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { motion } from 'framer-motion';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';
import useTriage from '../../../hooks/triageHook';
import useDiagnosis from '../../../hooks/diagnosisHook';

const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];
const COURSE_TYPES = ['Continuous', 'Episodic', 'Either'];
const SEVERITY_LEVELS = ['low', 'moderate', 'high'];

const normalizeSymptomToken = (raw) => {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  const noHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  return noHash.replace(/\s+/g, '_').replace(/-+/g, '_').toLowerCase();
};

const displayChipLabel = (token) => `#${token}`;

const prettyToSnake = (pretty = '') => String(pretty).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');

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

export default function TriageLeftPanel({ patientId, onSave, initialData = null, isEditMode = false, saving = false }) {
  const { matchDiagnoses, loading, matchPagination } = useTriage();
  const { loadSymptoms, symptoms: suggestionList } = useDiagnosis();
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('months');
  const [course, setCourse] = useState(null);
  const [severityLevel, setSeverityLevel] = useState('');
  const [systemFilters, setSystemFilters] = useState({ dsm5: true, icd10: true });
  const [notes, setNotes] = useState('');
  const [diagnosisLimit, setDiagnosisLimit] = useState(2);

  // Pre-populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (initialData) {
      setSymptoms(initialData.symptoms || []);
      setDuration(initialData.duration ? String(initialData.duration) : '');
      setDurationUnit(initialData.durationUnit || 'months');
      setCourse(initialData.course || null);
      setSeverityLevel(initialData.severityLevel || '');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  // Sync limit with pagination when it changes
  useEffect(() => {
    if (matchPagination?.itemsPerPage) {
      setDiagnosisLimit(matchPagination.itemsPerPage);
    }
  }, [matchPagination?.itemsPerPage]);

  // Load symptoms on mount
  useEffect(() => {
    if (!suggestionList || suggestionList.length === 0) {
      loadSymptoms();
    }
  }, [loadSymptoms, suggestionList]);

  // Prepare suggestions for autocomplete
  const suggestions = useMemo(() => {
    const backend = (suggestionList || []).map(prettyToSnake);
    const fallback = DEFAULT_SUGGESTIONS.map(prettyToSnake);
    return Array.from(new Set([...backend, ...fallback]));
  }, [suggestionList]);

  // Auto-match diagnoses when symptoms, system filters, or triage fields change
  // Preloads diagnoses on mount (show all with limit 2) and matches when symptoms are entered
  useEffect(() => {
    const system = systemFilters.dsm5 && systemFilters.icd10 
      ? null 
      : systemFilters.dsm5 
      ? 'DSM-5' 
      : 'ICD-10';
    
    // Build triage filters from current form state
    const triageFilters = {};
    if (duration && duration.trim() !== '') {
      triageFilters.duration = parseFloat(duration);
      triageFilters.durationUnit = durationUnit;
    }
    if (course) {
      triageFilters.course = course;
    }
    if (severityLevel) {
      triageFilters.severityLevel = severityLevel;
    }
    // Note: preliminaryDiagnosis and notes are not in this form, but can be added if needed
    
    if (symptoms.length > 0 || Object.keys(triageFilters).length > 0) {
      // Match with symptoms and/or filters (use diagnosisLimit)
      matchDiagnoses(symptoms, system, { page: 1, limit: diagnosisLimit }, triageFilters);
    } else {
      // Show all if no symptoms or filters (use diagnosisLimit)
      matchDiagnoses([], system, { page: 1, limit: diagnosisLimit, showAll: true }, {});
    }
  }, [symptoms, systemFilters.dsm5, systemFilters.icd10, diagnosisLimit, duration, durationUnit, course, severityLevel, matchDiagnoses]);

  const handleSymptomsChange = useCallback((e, newValue) => {
    // Normalize all symptoms (convert spaces to underscores, lowercase)
    const normalized = Array.from(new Set(newValue.map(normalizeSymptomToken).filter(Boolean)));
    setSymptoms(normalized);
  }, []);

  const handleSystemFilterChange = (system) => {
    setSystemFilters((prev) => {
      const newFilters = { ...prev, [system]: !prev[system] };
      // Ensure at least one is checked
      if (!newFilters.dsm5 && !newFilters.icd10) {
        newFilters[system] = true;
      }
      return newFilters;
    });
  };

  const handleClear = () => {
    setSymptoms([]);
    setSymptomInput('');
    setDuration('');
    setDurationUnit('months');
    setCourse(null);
    setSeverityLevel('');
    setNotes('');
  };

  const handleSaveClick = () => {
    if (!severityLevel || saving) {
      return;
    }
    const triageData = {
      symptoms,
      severityLevel,
      ...(duration && { duration: Number(duration) }),
      durationUnit,
      ...(course && { course }),
      ...(notes && { notes })
    };
    onSave?.(triageData, handleClear);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack spacing={2.5} sx={{ flex: 1 }}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
            {isEditMode ? 'Edit Triage Record' : 'Client Input'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {isEditMode 
              ? 'Modify the triage details below. Saving will create a new copy (original unchanged).'
              : `Enter symptoms, duration, and course. Saving to: ${patientId?.slice(-8) || 'N/A'}`}
          </Typography>
        </Box>

        {/* Diagnosis Results Limit Selector */}
{/*         <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
            Results per page:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {[2, 5, 10, 20, 50].map((option) => (
              <Button
                key={option}
                variant={diagnosisLimit === option ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setDiagnosisLimit(option)}
                sx={{
                  fontSize: '0.7rem',
                  px: 1,
                  py: 0.25,
                  minHeight: 24,
                  minWidth: 40,
                  textTransform: 'none'
                }}
              >
                {option}
              </Button>
            ))}
          </Stack>
        </Box> */}

        {/* Symptoms */}
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
            Symptoms
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={suggestions}
            value={symptoms}
            onChange={handleSymptomsChange}
            inputValue={symptomInput}
            onInputChange={(e, value) => setSymptomInput(value)}
            disabled={saving}
            filterOptions={(options, params) => {
              const raw = params.inputValue || '';
              const key = normalizeSymptomToken(raw);
              if (!key) return options;
              // Filter options that include the search key (handles both underscore and space variations)
              return options.filter((opt) => {
                const optNormalized = normalizeSymptomToken(opt);
                const optWithSpaces = optNormalized.replace(/_/g, ' ');
                const optWithUnderscores = optNormalized.replace(/\s+/g, '_');
                return optNormalized.includes(key) || 
                       optWithSpaces.includes(key) || 
                       optWithUnderscores.includes(key) ||
                       key.includes(optNormalized) ||
                       key.includes(optWithSpaces) ||
                       key.includes(optWithUnderscores);
              });
            }}
            renderOption={(props, option) => (
              <li {...props} key={`opt-${option}`}>#{option}</li>
            )}
            renderTags={() => null}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Type symptom and press Enter"
                sx={{
                  '& .MuiInputBase-input': { 
                    fontSize: '0.875rem', 
                    py: 0.75
                  },
                  '& .MuiInputLabel-root': { fontSize: '0.875rem' }
                }}
                helperText="Use hashtags like #depressed_mood, #panic_attacks. Suggestions available."
              />
            )}
            sx={{
              width: '100%',
              '& .MuiAutocomplete-inputRoot': {
                '& .MuiAutocomplete-input': {
                  minWidth: '120px !important'
                }
              }
            }}
          />
          {/* Selected Symptoms List Below Input */}
          {symptoms.length > 0 && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                maxWidth: '400px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75
              }}
            >
              {symptoms.map((symptom) => (
                <Chip
                  key={symptom}
                  label={displayChipLabel(symptom)}
                  size="small"
                  onDelete={() => {
                    setSymptoms((prev) => prev.filter((s) => s !== symptom));
                  }}
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiChip-deleteIcon': { fontSize: 14 }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Duration */}
        <Stack direction="row" spacing={1.5}>
          <TextField
            label="Duration Value"
            type="number"
            size="small"
            placeholder="e.g., 2"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={saving}
            sx={{ 
              flex: 1,
              '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.75 },
              '& .MuiInputLabel-root': { fontSize: '0.875rem' }
            }}
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Unit"
            size="small"
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value)}
            disabled={saving}
            sx={{ 
              minWidth: 120,
              '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.75 },
              '& .MuiInputLabel-root': { fontSize: '0.875rem' }
            }}
          >
            {DURATION_UNITS.map((unit) => (
              <MenuItem key={unit} value={unit} sx={{ fontSize: '0.875rem', py: 0.5 }}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Course */}
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
            Course
          </Typography>
          <Stack direction="row" spacing={1}>
            {COURSE_TYPES.map((type) => (
              <Button
                key={type}
                variant={course === type ? 'contained' : 'outlined'}
                disabled={saving}
                size="small"
                onClick={() => setCourse(course === type ? null : type)}
                sx={{
                  flex: 1,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1,
                  minHeight: 32,
                  textTransform: 'none'
                }}
              >
                {type}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Severity Level */}
        <TextField
          select
          label="Severity Level"
          size="small"
          value={severityLevel}
          onChange={(e) => setSeverityLevel(e.target.value)}
          required
          fullWidth
          disabled={saving}
          sx={{
            '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.75 },
            '& .MuiInputLabel-root': { fontSize: '0.875rem' }
          }}
        >
          {SEVERITY_LEVELS.map((level) => (
            <MenuItem key={level} value={level} sx={{ fontSize: '0.875rem', py: 0.5 }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </MenuItem>
          ))}
        </TextField>

        {/* Filter by System */}
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1 }}>
            Filter by System
          </Typography>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemFilters.dsm5}
                  onChange={() => handleSystemFilterChange('dsm5')}
                  size="small"
                  disabled={saving}
                />
              }
              label="DSM-5"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={systemFilters.icd10}
                  onChange={() => handleSystemFilterChange('icd10')}
                  size="small"
                  disabled={saving}
                />
              }
              label="ICD-10"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
          </Stack>
        </Box>

        {/* Notes */}
        <TextField
          label="Notes (Optional)"
          size="small"
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          disabled={saving}
          placeholder="Additional notes or observations..."
          sx={{
            '& .MuiInputBase-input': { fontSize: '0.875rem' },
            '& .MuiInputLabel-root': { fontSize: '0.875rem' }
          }}
        />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
            onClick={handleClear}
            disabled={saving}
            sx={{ 
              flex: 1, 
              fontSize: '0.75rem',
              px: 1,
              py: 0.5,
              minHeight: 32
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={
              saving ? (
                <CircularProgress size={14} sx={{ color: 'inherit' }} />
              ) : (
                <SaveIcon sx={{ fontSize: 14 }} />
              )
            }
            onClick={handleSaveClick}
            disabled={!severityLevel || symptoms.length === 0 || loading || saving}
            sx={{ 
              flex: 2, 
              fontSize: '0.75rem',
              px: 1,
              py: 0.5,
              minHeight: 32,
              position: 'relative'
            }}
          >
            {saving 
              ? (isEditMode ? 'Saving Copy...' : 'Saving...')
              : (isEditMode ? 'Save as Copy' : 'Save to Patient')
            }
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

