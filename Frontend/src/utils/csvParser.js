/**
 * CSV/Excel parser for diagnosis bulk import
 * Handles CSV files and Excel (.xlsx, .xls) files with headers and converts to JSON
 */

import * as XLSX from 'xlsx';

export function parseCSV(csvText, skipHeader = true) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);
  
  // Skip header if requested
  const dataRows = skipHeader ? lines.slice(1) : lines;

  // Parse data rows
  const rows = dataRows
    .map((line, index) => {
      const values = parseCSVLine(line);
      if (values.length === 0 || values.every(v => !v.trim())) return null; // Skip empty rows
      
      const row = {};
      headers.forEach((header, idx) => {
        const key = header.trim().toLowerCase().replace(/\s+/g, '_');
        row[key] = values[idx]?.trim() || '';
      });
      return row;
    })
    .filter(Boolean);

  return rows;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current);
  return values;
}

/**
 * Parse Excel file and return sheet information + data
 * @param {File} file - Excel or CSV file
 * @param {string} sheetName - Optional: specific sheet name to parse (for Excel files)
 * @returns {Promise<{sheets: string[], data: any[], selectedSheet?: string}>} Sheet names and parsed data
 */
export function parseExcelFile(file, sheetName = null) {
  return new Promise((resolve, reject) => {
    // Handle CSV files
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const data = parseCSV(csvText, true);
          resolve({ sheets: ['CSV'], data, selectedSheet: 'CSV' });
        } catch (error) {
          reject(new Error('Failed to parse CSV: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } 
    // Handle Excel files (.xlsx, .xls)
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get all sheet names
          const sheetNames = workbook.SheetNames;
          
          if (sheetNames.length === 0) {
            reject(new Error('Excel file contains no sheets'));
            return;
          }

          // If sheetName specified, parse that sheet; otherwise parse first sheet
          const targetSheet = sheetName || sheetNames[0];
          
          if (!workbook.Sheets[targetSheet]) {
            reject(new Error(`Sheet "${targetSheet}" not found in Excel file`));
            return;
          }

          // Convert sheet to JSON (first row as headers)
          const worksheet = workbook.Sheets[targetSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Use first row as headers
            defval: '', // Default value for empty cells
            raw: false // Convert numbers/dates to strings
          });

          if (jsonData.length === 0) {
            reject(new Error(`Sheet "${targetSheet}" is empty`));
            return;
          }

          // First row is headers
          const headers = jsonData[0].map(h => String(h || '').trim());
          const dataRows = jsonData.slice(1);

          // Convert to array of objects
          const rows = dataRows
            .map((row) => {
              // Skip empty rows
              if (!row || row.length === 0 || row.every(cell => !String(cell || '').trim())) {
                return null;
              }
              
              const obj = {};
              headers.forEach((header, idx) => {
                const key = String(header || '').trim().toLowerCase().replace(/\s+/g, '_');
                const value = row[idx];
                obj[key] = value !== undefined && value !== null ? String(value).trim() : '';
              });
              return obj;
            })
            .filter(Boolean);

          resolve({
            sheets: sheetNames,
            data: rows,
            selectedSheet: targetSheet
          });
        } catch (error) {
          reject(new Error('Failed to parse Excel file: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type. Please use CSV (.csv) or Excel (.xlsx, .xls) files.'));
    }
  });
}

