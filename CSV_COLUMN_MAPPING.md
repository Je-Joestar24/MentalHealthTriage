# CSV Column Mapping - New DSM-5 Format (23 columns)

## Column Analysis & Mapping

### ✅ USEFUL COLUMNS (Will be imported)

1. **section** → `section` field
   - Maps directly to Diagnosis.section

2. **chapter** → `chapter` field  
   - Maps directly to Diagnosis.chapter

3. **disorder_name** → `name` field (REQUIRED)
   - Primary identifier for grouping rows
   - Maps to Diagnosis.name

4. **content_type** → Used for filtering rows
   - Only import rows with: `DisorderHeading`, `CriterionItem`, `Severity`, `Specifier`, `Code`
   - Ignore: `SectionHeading`, `SectionTopic`, `ChapterHeading`, `SubheadingText`

5. **criteria_item_text** → `fullCriteriaSummary` or `keySymptomsSummary`
   - Used when content_type is `CriterionItem`
   - Can be aggregated for full criteria summary

6. **severity_level** → `severity` field
   - Used when content_type is `Severity`
   - Can be aggregated into array if multiple severity levels

7. **specifier_text** → `specifiers` field
   - Used when content_type is `Specifier`
   - Can be aggregated into array if multiple specifiers

8. **code_system** → Determines which code field to use
   - Values: "DSM-5", "ICD-10", "ICD-9-CM", "ICD-10-CM"
   - Used to route code_value to correct field

9. **code_value** → `dsm5Code` or `icd10Code`
   - Combined with code_system to determine destination
   - If code_system contains "DSM" → dsm5Code
   - If code_system contains "ICD-10" → icd10Code

10. **ai_summary_short** → `fullCriteriaSummary` or `keySymptomsSummary`
    - AI-generated summary, useful when criteria_item_text is missing
    - Can be used as fallback or combined

11. **ai_keywords** → `symptoms` array
    - Comma-separated keywords
    - Processed and normalized to symptom format

12. **printed_page_start** → `criteriaPage` field
    - Maps to Diagnosis.criteriaPage (number)

### ❌ NOT USEFUL COLUMNS (Will be ignored)

- **row_id**: Internal Excel tracking, not needed
- **section_title**: Redundant with section
- **subheading**: Organizational, not needed for diagnosis data
- **criteria_set**: Organizational (A, B, C), not needed
- **criteria_item_no**: Organizational numbering, not needed
- **criteria_variant**: Edge case handling, not needed
- **code_label**: Descriptive label, not needed
- **printed_page_end**: Only start page needed
- **pdf_page_start/end**: PDF-specific, not needed
- **order_in_disorder**: Organizational ordering, not needed

## Import Strategy

### Row Filtering
- Only process rows where `content_type` is one of:
  - `DisorderHeading` (main disorder entry)
  - `CriterionItem` (diagnostic criteria)
  - `Severity` (severity levels)
  - `Specifier` (specifiers)
  - `Code` (coding information)

### Data Aggregation
Rows are grouped by `disorder_name` and data is aggregated:
- **From DisorderHeading rows**: section, chapter, disorder_name
- **From CriterionItem rows**: criteria_item_text → fullCriteriaSummary/keySymptomsSummary
- **From Severity rows**: severity_level → severity (array)
- **From Specifier rows**: specifier_text → specifiers (array)
- **From Code rows**: code_system + code_value → dsm5Code or icd10Code
- **From any row**: ai_summary_short, ai_keywords, printed_page_start

### Combination Logic
Similar to existing logic:
- If `disorder_name`, `dsm5_code`, `icd10_code`, and aggregated `key_symptoms_summary` are identical → combine into one diagnosis
- Merge all symptoms from `ai_keywords` across rows
- Merge all severity levels into array
- Merge all specifiers into array
