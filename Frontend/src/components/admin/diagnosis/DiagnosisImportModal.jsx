import React, { useCallback, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
  LinearProgress,
  Chip,
  TextField,
  MenuItem
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import useDiagnosis from '../../../hooks/diagnosisHook';
import { parseExcelFile } from '../../../utils/csvParser';

export default function DiagnosisImportModal({ open, onClose, onImported }) {
  const { bulkImportDiagnoses, loadDiagnoses, pagination, filters } = useDiagnosis();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setPreview(null);
    setParsedData(null);
    setSheetNames([]);
    setSelectedSheet(null);

    try {
      // Parse file to get sheet names (for Excel) or data (for CSV)
      const result = await parseExcelFile(selectedFile);
      
      // For Excel files, we need to show sheet selection
      if (result.sheets && result.sheets.length > 1) {
        setSheetNames(result.sheets);
        setSelectedSheet(result.selectedSheet);
        // Parse default sheet (first one)
        const defaultResult = await parseExcelFile(selectedFile, result.selectedSheet);
        setParsedData(defaultResult.data);
        setPreview({
          totalRows: defaultResult.data.length,
          sampleRows: defaultResult.data.slice(0, 3),
          headers: defaultResult.data.length > 0 ? Object.keys(defaultResult.data[0]) : []
        });
      } else {
        // CSV or single-sheet Excel
        setParsedData(result.data);
        setSheetNames(result.sheets || ['CSV']);
        setSelectedSheet(result.selectedSheet || 'CSV');
        
        setPreview({
          totalRows: result.data.length,
          sampleRows: result.data.slice(0, 3),
          headers: result.data.length > 0 ? Object.keys(result.data[0]) : []
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to parse file');
      setFile(null);
    }
  }, []);

  const handleSheetChange = useCallback(async (sheetName) => {
    if (!file || !sheetName) return;

    setProcessing(true);
    setError(null);
    try {
      const result = await parseExcelFile(file, sheetName);
      setSelectedSheet(sheetName);
      setParsedData(result.data);
      
      setPreview({
        totalRows: result.data.length,
        sampleRows: result.data.slice(0, 3),
        headers: result.data.length > 0 ? Object.keys(result.data[0]) : []
      });
    } catch (err) {
      setError(err.message || 'Failed to parse sheet');
    } finally {
      setProcessing(false);
    }
  }, [file]);

  // Helper to normalize symptoms: handle / as " or ", process parentheses with /, keep pretty format
  const normalizeSymptomForStorage = useCallback((symptom) => {
    if (!symptom || !String(symptom).trim()) return '';
    let normalized = String(symptom).trim();
    
    // Process parentheses: (verbal/behavioral) -> (verbal or behavioral) then remove parentheses
    normalized = normalized.replace(/\(([^)]*\/[^)]*)\)/g, (match, content) => {
      const processed = content.replace(/\//g, ' or ').trim();
      return processed;
    });
    
    // Remove any remaining parentheses
    normalized = normalized.replace(/[()]/g, '');
    
    // Replace / with " or " (keep as pretty format with spaces)
    normalized = normalized.replace(/\//g, ' or ');
    
    // Normalize whitespace (multiple spaces to single space)
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    // Keep as pretty format (space-separated)
    return normalized;
  }, []);

  // Helper function to combine duplicate diagnoses (same diagnosis, dsm5_code, icd10_code, key_symptoms_summary)
  const combineDuplicateDiagnoses = useCallback((data) => {
    const groups = new Map();
    
    // First pass: transform and group by key fields
    data.forEach((row) => {
      const transformed = {
        Section: row.section || row.Section || '',
        Chapter: row.chapter || row.Chapter || '',
        Diagnosis: row.diagnosis || row.Diagnosis || '',
        dsm5_code: row.dsm5_code || row.DSM5_code || row.dsm5Code || '',
        icd10_code: row.icd10_code || row.ICD10_code || row.icd10Code || '',
        full_criteria_summary: row.full_criteria_summary || row.Full_criteria_summary || '',
        key_symptoms_summary: row.key_symptoms_summary || row.Key_symptoms_summary || row.key_symptoms_sammary || '',
        symptom: row.symptom || row.Symptom || '',
        validated_screener_paraphrased: row.validated_screener_paraphrased || row.Validated_screener_paraphrased || '',
        exact_screener_item: row.exact_screener_item || row.Exact_screener_item || '',
        severity: row.severity || row.Severity || '',
        Specifiers: row.specifiers || row.Specifiers || row.specifier || '',
        criteria_page: row.criteria_page || row.Criteria_page || ''
      };

      // Create a unique key from diagnosis, dsm5_code, icd10_code, and key_symptoms_summary
      const key = `${transformed.Diagnosis}|${transformed.dsm5_code}|${transformed.icd10_code}|${transformed.key_symptoms_summary}`;
      
      if (!groups.has(key)) {
        // First occurrence - store the row with symptom as array
        const normalizedSymptom = normalizeSymptomForStorage(transformed.symptom);
        groups.set(key, {
          ...transformed,
          symptom: normalizedSymptom ? [normalizedSymptom] : []
        });
      } else {
        // Duplicate found - add symptom to existing array if not empty and not already present
        const existing = groups.get(key);
        const normalizedSymptom = normalizeSymptomForStorage(transformed.symptom);
        if (normalizedSymptom && !existing.symptom.includes(normalizedSymptom)) {
          existing.symptom.push(normalizedSymptom);
        }
      }
    });

    // Return combined data with symptoms in pretty format (array)
    return Array.from(groups.values()).map((item) => ({
      ...item,
      symptom: item.symptom.filter(Boolean) // Remove any empty strings
    }));
  }, [normalizeSymptomForStorage]);

  const handleImport = useCallback(async () => {
    if (!file || !parsedData || parsedData.length === 0) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the already parsed data (from selected sheet)
      const data = parsedData;
      
      // Transform CSV data to match backend expectations
      const transformedData = data.map((row) => {
        // Map column names (case-insensitive, handle variations)
        return {
          Section: row.section || row.Section || '',
          Chapter: row.chapter || row.Chapter || '',
          Diagnosis: row.diagnosis || row.Diagnosis || '',
          dsm5_code: row.dsm5_code || row.DSM5_code || row.dsm5Code || '',
          icd10_code: row.icd10_code || row.ICD10_code || row.icd10Code || '',
          full_criteria_summary: row.full_criteria_summary || row.Full_criteria_summary || '',
          key_symptoms_summary: row.key_symptoms_summary || row.Key_symptoms_summary || row.key_symptoms_sammary || '',
          symptom: row.symptom || row.Symptom || '',
          validated_screener_paraphrased: row.validated_screener_paraphrased || row.Validated_screener_paraphrased || '',
          exact_screener_item: row.exact_screener_item || row.Exact_screener_item || '',
          severity: row.severity || row.Severity || '',
          Specifiers: row.specifiers || row.Specifiers || row.specifier || '',
          criteria_page: row.criteria_page || row.Criteria_page || ''
        };
      });

      // Combine duplicate diagnoses (same diagnosis + codes + key_symptoms_summary) into single entries with combined symptoms
      const combinedData = combineDuplicateDiagnoses(transformedData);

      // Send combined data to backend
      const result = await bulkImportDiagnoses({ diagnoses: combinedData });
      
      if (result?.meta?.requestStatus === 'fulfilled') {
        const importedCount = Array.isArray(result.payload) ? result.payload.length : combinedData.length;
        setSuccess(`Successfully imported ${importedCount} diagnoses`);
        await loadDiagnoses({ page: pagination?.page || 1, limit: pagination?.limit || 10, ...filters });
        setTimeout(() => {
          onImported?.();
          onClose?.();
          // Reset form state
          setFile(null);
          setPreview(null);
          setError(null);
          setSuccess(null);
          setSheetNames([]);
          setSelectedSheet(null);
          setParsedData(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1500);
      } else {
        const errorMsg = typeof result?.payload === 'string' 
          ? result.payload 
          : (result?.payload?.message || result?.payload?.error || 'Import failed');
        throw new Error(errorMsg);
      }
    } catch (err) {
      setError(err.message || 'Failed to import diagnoses');
    } finally {
      setProcessing(false);
    }
  }, [file, parsedData, combineDuplicateDiagnoses, bulkImportDiagnoses, loadDiagnoses, pagination, filters, onImported, onClose]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setSuccess(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    if (!processing) {
      handleReset();
      onClose?.();
    }
  }, [processing, handleReset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Import Diagnoses from CSV/Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {success && (
            <Alert severity="success">{success}</Alert>
          )}

          {processing && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Processing import...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.default',
              cursor: file ? 'default' : 'pointer',
              transition: 'all 0.2s',
              '&:hover': !file && {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={processing}
            />
            {!file ? (
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="h6">Select CSV or Excel file</Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: .csv, .xlsx
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2} alignItems="center">
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="h6">{file.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Stack>
            )}
          </Box>

          {sheetNames.length > 1 && (
            <TextField
              select
              label="Select Sheet"
              value={selectedSheet || ''}
              onChange={(e) => handleSheetChange(e.target.value)}
              size="small"
              fullWidth
              disabled={processing}
              helperText={`${sheetNames.length} sheets found in Excel file`}
            >
              {sheetNames.map((sheet) => (
                <MenuItem key={sheet} value={sheet}>
                  {sheet}
                </MenuItem>
              ))}
            </TextField>
          )}

          {preview && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Preview ({preview.totalRows} rows detected{selectedSheet && sheetNames.length > 1 ? ` from sheet "${selectedSheet}"` : ''})
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {preview.headers.map((h, idx) => (
                      <Chip key={idx} size="small" label={h} variant="outlined" />
                    ))}
                  </Stack>
                  {preview.sampleRows.map((row, idx) => (
                    <Box key={idx} sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      Row {idx + 1}: {JSON.stringify(row, null, 0).substring(0, 100)}...
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Expected columns:</strong> Section, Chapter, Diagnosis, dsm5_code, icd10_code, 
              full_criteria_summary, key_symptoms_summary, symptom, validated_screener_paraphrased, 
              exact_screener_item, severity, Specifiers, criteria_page
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="small" disabled={processing}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || !parsedData || parsedData.length === 0 || processing}
          size="small"
        >
          {processing ? 'Importing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

