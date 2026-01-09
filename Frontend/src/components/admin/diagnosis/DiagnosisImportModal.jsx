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

  // Helper to extract symptoms from ai_keywords (comma-separated)
  const extractSymptomsFromKeywords = useCallback((keywords) => {
    if (!keywords || !String(keywords).trim()) return [];
    const keywordList = String(keywords).split(',').map(k => k.trim()).filter(Boolean);
    return keywordList.map(k => normalizeSymptomForStorage(k)).filter(Boolean);
  }, [normalizeSymptomForStorage]);

  // Transform new 23-column format to our internal format
  const transformNewFormatRow = useCallback((row) => {
    // Get content_type (case-insensitive)
    const contentType = (row.content_type || row.contentType || row['content_type'] || '').trim();
    
    // Filter: only process relevant content types
    const validContentTypes = ['DisorderHeading', 'CriterionItem', 'Severity', 'Specifier', 'Code'];
    if (contentType && !validContentTypes.includes(contentType)) {
      return null; // Skip this row
    }

    // Map new column names (case-insensitive)
    const disorderName = row.disorder_name || row.disorderName || row['disorder_name'] || '';
    const section = row.section || row.Section || '';
    const sectionTitle = row.section_title || row.sectionTitle || row['section_title'] || '';
    const chapter = row.chapter || row.Chapter || '';
    const codeSystem = (row.code_system || row.codeSystem || row['code_system'] || '').trim();
    const codeValue = (row.code_value || row.codeValue || row['code_value'] || '').trim();
    const criteriaItemText = row.criteria_item_text || row.criteriaItemText || row['criteria_item_text'] || '';
    const severityLevel = row.severity_level || row.severityLevel || row['severity_level'] || '';
    const specifierText = row.specifier_text || row.specifierText || row['specifier_text'] || '';
    const aiSummary = row.ai_summary_short || row.aiSummaryShort || row['ai_summary_short'] || '';
    const aiKeywords = row.ai_keywords || row.aiKeywords || row['ai_keywords'] || '';
    const printedPageStart = row.printed_page_start || row.printedPageStart || row['printed_page_start'] || '';

    // Determine DSM-5 and ICD-10 codes from code_system + code_value
    let dsm5Code = '';
    let icd10Code = '';
    if (codeSystem && codeValue) {
      const systemLower = codeSystem.toLowerCase();
      if (systemLower.includes('dsm') || systemLower === 'dsm-5') {
        dsm5Code = codeValue;
      } else if (systemLower.includes('icd-10') || systemLower === 'icd-10-cm') {
        icd10Code = codeValue;
      }
    }

    // Determine default system from section_title: if it contains "DSM-5" (or variations), use DSM-5, otherwise default to DSM-5
    // Handles: "DSM-5 Basics", "DSM-5", "DSM5", "DSM 5", etc.
    // Default is DSM-5 unless explicitly ICD-10
    const sectionTitleLower = (sectionTitle || '').toLowerCase().trim();
    const isDSM5 = sectionTitleLower.includes('dsm-5') || 
                   sectionTitleLower.includes('dsm5') || 
                   sectionTitleLower.includes('dsm 5') ||
                   (sectionTitleLower.includes('dsm') && sectionTitleLower.match(/\bdsm\s*[-\s]?5\b/));
    const isICD10 = sectionTitleLower.includes('icd-10') || sectionTitleLower.includes('icd10') || sectionTitleLower.includes('icd 10');
    // Default to DSM-5 unless explicitly ICD-10
    const defaultSystem = isICD10 ? 'ICD-10' : 'DSM-5';

    // Build aggregated data based on content_type
    return {
      disorder_name: disorderName,
      section,
      section_title: sectionTitle,
      chapter,
      dsm5_code: dsm5Code,
      icd10_code: icd10Code,
      default_system: defaultSystem, // Store for later use in grouping
      // Aggregate criteria text
      criteria_item_text: criteriaItemText,
      // Aggregate severity
      severity_level: severityLevel,
      // Aggregate specifiers
      specifier_text: specifierText,
      // AI fields
      ai_summary_short: aiSummary,
      ai_keywords: aiKeywords,
      // Page reference
      printed_page_start: printedPageStart,
      // Content type for aggregation logic
      content_type: contentType
    };
  }, []);

  // Helper function to combine duplicate diagnoses (supports both old and new formats)
  const combineDuplicateDiagnoses = useCallback((data) => {
    // Check if this is the new 23-column format (has disorder_name or content_type)
    const isNewFormat = data.length > 0 && (
      data[0].disorder_name || data[0].disorderName || data[0]['disorder_name'] ||
      data[0].content_type || data[0].contentType || data[0]['content_type']
    );

    if (isNewFormat) {
      // NEW FORMAT: Group by disorder_name and aggregate data from different row types
      const groups = new Map();
      
      // First pass: transform and filter rows
      const transformedRows = data
        .map(row => transformNewFormatRow(row))
        .filter(row => row !== null && row.disorder_name); // Only rows with disorder_name
      
      // Second pass: group by disorder_name, dsm5_code, icd10_code
      transformedRows.forEach((row) => {
        const key = `${row.disorder_name}|${row.dsm5_code}|${row.icd10_code}`;
        
        if (!groups.has(key)) {
          // First occurrence - initialize group
          const symptoms = extractSymptomsFromKeywords(row.ai_keywords);
          // Use default_system from row (detected from section_title), fallback to ICD-10
          const systemToUse = row.default_system || 'ICD-10';
          groups.set(key, {
            Section: row.section,
            Chapter: row.chapter,
            Diagnosis: row.disorder_name,
            dsm5_code: row.dsm5_code,
            icd10_code: row.icd10_code,
            default_system: systemToUse || 'DSM-5', // Store default system from section_title (defaults to DSM-5)
            full_criteria_summary: row.criteria_item_text || row.ai_summary_short || '',
            key_symptoms_summary: row.ai_summary_short || row.criteria_item_text || '',
            symptom: symptoms,
            severity: row.severity_level ? [row.severity_level] : [],
            Specifiers: row.specifier_text ? [row.specifier_text] : [],
            criteria_page: row.printed_page_start || ''
          });
        } else {
          // Aggregate data from different row types
          const existing = groups.get(key);
          
          // Aggregate criteria text (from CriterionItem rows)
          if (row.criteria_item_text && !existing.full_criteria_summary.includes(row.criteria_item_text)) {
            existing.full_criteria_summary = existing.full_criteria_summary
              ? `${existing.full_criteria_summary}\n${row.criteria_item_text}`
              : row.criteria_item_text;
          }
          
          // Aggregate AI summary (fallback or additional context)
          if (row.ai_summary_short && !existing.key_symptoms_summary.includes(row.ai_summary_short)) {
            if (!existing.key_symptoms_summary) {
              existing.key_symptoms_summary = row.ai_summary_short;
            }
          }
          
          // Aggregate severity levels (from Severity rows)
          if (row.severity_level && !existing.severity.includes(row.severity_level)) {
            existing.severity.push(row.severity_level);
          }
          
          // Aggregate specifiers (from Specifier rows)
          if (row.specifier_text && !existing.Specifiers.includes(row.specifier_text)) {
            existing.Specifiers.push(row.specifier_text);
          }
          
          // Aggregate symptoms from ai_keywords
          const newSymptoms = extractSymptomsFromKeywords(row.ai_keywords);
          newSymptoms.forEach(symptom => {
            if (symptom && !existing.symptom.includes(symptom)) {
              existing.symptom.push(symptom);
            }
          });
          
          // Use first valid page reference
          if (!existing.criteria_page && row.printed_page_start) {
            existing.criteria_page = row.printed_page_start;
          }
          
          // Preserve DSM-5 as default (unless explicitly ICD-10)
          // If any row is ICD-10, only set to ICD-10 if not already DSM-5
          if (row.default_system === 'ICD-10' && existing.default_system !== 'DSM-5') {
            existing.default_system = 'ICD-10';
          } else if (row.default_system === 'DSM-5') {
            existing.default_system = 'DSM-5';
          }
          // Otherwise keep existing (which defaults to DSM-5)
        }
      });

      // Return combined data
      return Array.from(groups.values()).map((item) => ({
        ...item,
        symptom: item.symptom.filter(Boolean),
        severity: item.severity.filter(Boolean),
        Specifiers: item.Specifiers.filter(Boolean)
      }));
    } else {
      // OLD FORMAT: Original logic for backward compatibility
      const groups = new Map();
      
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

        const key = `${transformed.Diagnosis}|${transformed.dsm5_code}|${transformed.icd10_code}|${transformed.key_symptoms_summary}`;
        
        if (!groups.has(key)) {
          const normalizedSymptom = normalizeSymptomForStorage(transformed.symptom);
          groups.set(key, {
            ...transformed,
            symptom: normalizedSymptom ? [normalizedSymptom] : []
          });
        } else {
          const existing = groups.get(key);
          const normalizedSymptom = normalizeSymptomForStorage(transformed.symptom);
          if (normalizedSymptom && !existing.symptom.includes(normalizedSymptom)) {
            existing.symptom.push(normalizedSymptom);
          }
        }
      });

      return Array.from(groups.values()).map((item) => ({
        ...item,
        symptom: item.symptom.filter(Boolean)
      }));
    }
  }, [transformNewFormatRow, extractSymptomsFromKeywords, normalizeSymptomForStorage]);

  // Helper to clean/optimize payload by removing empty fields
  const optimizePayload = useCallback((data) => {
    return data.map(item => {
      const cleaned = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        // Keep non-empty values (including empty arrays for symptoms/severity/specifiers)
        if (value !== null && value !== undefined && value !== '') {
          // Keep arrays even if empty (they might be needed)
          if (Array.isArray(value)) {
            cleaned[key] = value;
          } else {
            cleaned[key] = value;
          }
        }
      });
      return cleaned;
    });
  }, []);

  const handleImport = useCallback(async () => {
    if (!file || !parsedData || parsedData.length === 0) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the already parsed data (from selected sheet)
      // combineDuplicateDiagnoses now handles both old and new formats
      const combinedData = combineDuplicateDiagnoses(parsedData);
      
      // Optimize payload by removing empty fields to reduce size
      const optimizedData = optimizePayload(combinedData);

      // For very large imports (1000+ items), process in chunks
      const CHUNK_SIZE = 1000;
      const totalItems = optimizedData.length;
      
      if (totalItems > CHUNK_SIZE) {
        // Process in chunks for better reliability
        let totalImported = 0;
        const chunks = [];
        for (let i = 0; i < optimizedData.length; i += CHUNK_SIZE) {
          chunks.push(optimizedData.slice(i, i + CHUNK_SIZE));
        }
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const result = await bulkImportDiagnoses({ diagnoses: chunk });
          
          if (result?.meta?.requestStatus === 'fulfilled') {
            const importedCount = Array.isArray(result.payload) ? result.payload.length : chunk.length;
            totalImported += importedCount;
            setSuccess(`Importing... ${totalImported}/${totalItems} diagnoses processed`);
          } else {
            const errorMsg = typeof result?.payload === 'string' 
              ? result.payload 
              : (result?.payload?.message || result?.payload?.error || `Failed to import chunk ${i + 1}/${chunks.length}`);
            setError(errorMsg);
            setProcessing(false);
            return;
          }
        }
        
        setSuccess(`Successfully imported ${totalImported} diagnoses`);
      } else {
        // Single request for smaller imports
        const result = await bulkImportDiagnoses({ diagnoses: optimizedData });
        
        if (result?.meta?.requestStatus === 'fulfilled') {
          const importedCount = Array.isArray(result.payload) ? result.payload.length : optimizedData.length;
          setSuccess(`Successfully imported ${importedCount} diagnoses`);
        } else {
          const errorMsg = typeof result?.payload === 'string' 
            ? result.payload 
            : (result?.payload?.message || result?.payload?.error || 'Import failed');
          throw new Error(errorMsg);
        }
      }
      
      // Reload diagnoses list
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
    } catch (err) {
      setError(err.message || 'Failed to import diagnoses');
    } finally {
      setProcessing(false);
    }
  }, [file, parsedData, combineDuplicateDiagnoses, optimizePayload, bulkImportDiagnoses, loadDiagnoses, pagination, filters, onImported, onClose]);

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

