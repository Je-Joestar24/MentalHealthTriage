import Diagnosis from '../models/Diagnosis.js';
import mongoose from 'mongoose';
import Symptom from '../models/Symptoms.js';
import User from '../models/User.js';

// Utility: converts snake_case (or kebab-case) to pretty form (Depressed mood)
function toPrettySymptom(raw) {
  if (!raw) return '';
  // Remove # if present, split by underscores, capitalize first word
  let s = raw.trim().replace(/^#+/, '').replace(/[-_]+/g, ' ');
  s = s.replace(/\s+/g, ' ').toLowerCase();
  return s.replace(/^\w/, (c) => c.toUpperCase());
}

async function upsertSymptoms(symptoms) {
  if (!symptoms || !Array.isArray(symptoms)) return;
  const prettyList = symptoms.map(toPrettySymptom);
  const ops = prettyList.filter(Boolean).map((name) => ({ updateOne: { filter: { name }, update: { $setOnInsert: { name } }, upsert: true } }));
  if (ops.length) {
    try {
      await Symptom.bulkWrite(ops, { ordered: false });
    } catch (e) {/* ignore dupe errors */}
  }
}

export async function getAllDiagnoses(queryParams = {}, user = null) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    type,
    system
  } = queryParams;

  // Build filter object using composable $and clauses to support combining search + system
  const andClauses = [];
  
  // Apply user-based access control
  if (user) {
    // Super admin can see all diagnoses
    if (user.role === 'super_admin') {
      // No additional filter needed - show all
    } 
    // User with organization
    else if (user.organization) {
      const userId = user._id || user.id;
      const userOrgId = user.organization._id || user.organization;
      
      // Build the $or conditions
      const orConditions = [
        { type: 'global' }
      ];
      
      // For organization-type diagnoses:
      // - company_admin: check if createdBy matches their ID (only one company_admin per org)
      // - psychologist: check if createdBy (company_admin) belongs to the same organization
      if (user.role === 'company_admin') {
        // Company admin can see organization-type diagnoses they created
        orConditions.push({
          $and: [
            { type: 'organization' },
            { createdBy: userId }
          ]
        });
        
        // Get all psychologist IDs in the organization for personal diagnoses
        const psychologists = await User.find({
          organization: userOrgId,
          role: 'psychologist',
          isActive: true
        }).select('_id').lean();
        
        const psychologistIds = psychologists.map(p => p._id);
        
        // Add condition to see all personal diagnoses from organization psychologists
        orConditions.push({
          $and: [
            { type: 'personal' },
            { createdBy: { $in: psychologistIds } }
          ]
        });
      } else {
        // For psychologist: check if organization-type diagnosis was created by their org's company_admin
        const companyAdmin = await User.findOne({
          organization: userOrgId,
          role: 'company_admin',
          isActive: true
        }).select('_id').lean();
        
        if (companyAdmin) {
          orConditions.push({
            $and: [
              { type: 'organization' },
              { createdBy: companyAdmin._id }
            ]
          });
        }
        
        // Psychologist can only see their own personal diagnoses
        orConditions.push({
          $and: [
            { type: 'personal' },
            { createdBy: userId }
          ]
        });
      }
      
      andClauses.push({ $or: orConditions });
    }
    // Individual user (no organization): can see global and their personal diagnoses
    else {
      andClauses.push({
        $or: [
          { type: 'global' },
          {
            $and: [
              { type: 'personal' },
              { createdBy: user._id || user.id }
            ]
          }
        ]
      });
    }
  }
  
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    andClauses.push({
      $or: [
        { name: regex },
        { code: regex },
        { dsm5Code: regex },
        { icd10Code: regex }
      ]
    });
  }
  
  if (type) {
    andClauses.push({ type });
  }

  if (system) {
    const systemOr =
      system === 'DSM-5'
        ? { $or: [ { system: 'DSM-5' }, { dsm5Code: { $exists: true, $ne: '' } } ] }
        : { $or: [ { system: 'ICD-10' }, { icd10Code: { $exists: true, $ne: '' } } ] };
    andClauses.push(systemOr);
  }

  const filter = andClauses.length ? { $and: andClauses } : {};

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [diagnoses, total] = await Promise.all([
    Diagnosis.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('organization', 'name'),
    Diagnosis.countDocuments(filter)
  ]);

  return {
    diagnoses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  };
}

export async function getDiagnosisById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }
  
  const diagnosis = await Diagnosis.findById(id)
    .populate('createdBy', 'name email')
    .populate('organization', 'name');
    
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }
  
  return diagnosis;
}

export async function createDiagnosis(diagnosisData) {
  // Normalize dual codes - handle both camelCase and snake_case
  const dsm5Code = diagnosisData.dsm5Code || diagnosisData.dsm5_code || undefined;
  const icd10Code = diagnosisData.icd10Code || diagnosisData.icd10_code || undefined;
  
  // Set system and code based on provided codes (for backward compatibility)
  // If both codes are provided, prefer DSM-5 as primary system
  // If only one code is provided, use that system
  if (!diagnosisData.system || !diagnosisData.code) {
    if (dsm5Code && icd10Code) {
      diagnosisData.system = diagnosisData.system || 'DSM-5';
      diagnosisData.code = diagnosisData.code || dsm5Code;
    } else if (dsm5Code && !icd10Code) {
      diagnosisData.system = diagnosisData.system || 'DSM-5';
      diagnosisData.code = diagnosisData.code || dsm5Code;
    } else if (icd10Code && !dsm5Code) {
      diagnosisData.system = diagnosisData.system || 'ICD-10';
      diagnosisData.code = diagnosisData.code || icd10Code;
    }
  }
  
  // Ensure dual codes are set in the data
  if (dsm5Code) {
    diagnosisData.dsm5Code = dsm5Code;
  }
  if (icd10Code) {
    diagnosisData.icd10Code = icd10Code;
  }
  
  // Check for existing diagnosis with same name + codes
  // Check by name + DSM-5 code if provided
  // Check by name + ICD-10 code if provided
  // Also check legacy name + system + code combination
  const duplicateConditions = [];
  
  // Legacy check: name + system + code
  if (diagnosisData.name && diagnosisData.system && diagnosisData.code) {
    duplicateConditions.push({
      name: diagnosisData.name,
      system: diagnosisData.system,
      code: diagnosisData.code,
      organization: diagnosisData.organization || null
    });
  }
  
  // Check by DSM-5 code
  if (diagnosisData.name && dsm5Code) {
    duplicateConditions.push({
      name: diagnosisData.name,
      dsm5Code: dsm5Code,
      organization: diagnosisData.organization || null
    });
  }
  
  // Check by ICD-10 code
  if (diagnosisData.name && icd10Code) {
    duplicateConditions.push({
      name: diagnosisData.name,
      icd10Code: icd10Code,
      organization: diagnosisData.organization || null
    });
  }
  
  // Check for duplicates using $or
  if (duplicateConditions.length > 0) {
    const existing = await Diagnosis.findOne({
      $or: duplicateConditions
    });
    
    if (existing) {
      throw new Error('A diagnosis with this name and code(s) already exists');
    }
  }

  const diagnosis = new Diagnosis(diagnosisData);
  await diagnosis.save();
  await upsertSymptoms(diagnosisData.symptoms);
  return diagnosis;
}

export async function updateDiagnosis(id, updateData, user = null) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }

  // Check if diagnosis exists and user has permission to edit
  const diagnosis = await Diagnosis.findById(id);
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  // Permission check: user can edit if:
  // 1. Super admin can edit any
  // 2. User created the diagnosis (createdBy matches)
  // 3. Company admin can edit organization-type diagnoses from their organization
  if (user) {
    const userId = user._id || user.id;
    const userOrgId = user.organization?._id || user.organization;
    
    if (user.role !== 'super_admin') {
      const isCreator = diagnosis.createdBy.toString() === userId.toString();
      const isOrgAdminWithOrgDiagnosis = 
        user.role === 'company_admin' && 
        userOrgId &&
        diagnosis.type === 'organization' &&
        diagnosis.organization &&
        diagnosis.organization.toString() === userOrgId.toString();
      
      if (!isCreator && !isOrgAdminWithOrgDiagnosis) {
        throw new Error('You do not have permission to edit this diagnosis');
      }
    }
  }

  // Prevent updating immutable fields
  delete updateData.name;
  delete updateData.system;
  delete updateData.code;
  delete updateData.type;
  delete updateData.createdBy;
  delete updateData.organization; // Don't allow changing organization

  // Normalize potential CSV-style keys to new fields
  if (typeof updateData.dsm5_code === 'string' && !updateData.dsm5Code) {
    updateData.dsm5Code = updateData.dsm5_code;
    delete updateData.dsm5_code;
  }
  if (typeof updateData.icd10_code === 'string' && !updateData.icd10Code) {
    updateData.icd10Code = updateData.icd10_code;
    delete updateData.icd10_code;
  }

  const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  await upsertSymptoms(updateData.symptoms);
  
  return updatedDiagnosis;
}

export async function deleteDiagnosis(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid diagnosis ID');
  }

  const diagnosis = await Diagnosis.findByIdAndDelete(id);
  
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  return diagnosis;
}

// Helper to parse semicolon-separated strings into arrays
function parseSemicolonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value.split(';').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function bulkImportDiagnoses(diagnosesData, userId) {
  const diagnoses = diagnosesData.map(raw => {
    const data = { ...raw };
    // Map CSV-like keys to fields
    const mapped = {
      name: data.name || data.diagnosis || data.Diagnosis || data.title,
      section: data.section || data.Section,
      chapter: data.chapter || data.Chapter,
      fullCriteriaSummary: data.fullCriteriaSummary || data.full_criteria_summary || data.Full_criteria_summary,
      keySymptomsSummary: data.keySymptomsSummary || data.key_symptoms_summary || data.key_symptoms_sammary || data.Key_symptoms_summary,
      validatedScreenerParaphrased: data.validatedScreenerParaphrased || data.validated_screener_paraphrased || data.Validated_screener_paraphrased,
      exactScreenerItem: data.exactScreenerItem || data.exact_screener_item || data.Exact_screener_item,
      durationContext: data.durationContext || data.duration_context || data.Duration_context,
      severity: Array.isArray(data.severity || data.Severity) 
        ? (data.severity || data.Severity).filter(Boolean)
        : parseSemicolonArray(data.severity || data.Severity), // Parse semicolon-separated to array
      specifiers: Array.isArray(data.specifiers || data.Specifiers || data.specifier)
        ? (data.specifiers || data.Specifiers || data.specifier).filter(Boolean)
        : parseSemicolonArray(data.specifiers || data.Specifiers || data.specifier), // Parse semicolon-separated to array
      criteriaPage: data.criteriaPage ?? data.criteria_page ?? data.Criteria_page ?? data.printed_page_start ?? data.printedPageStart
        ? (() => {
            const pageValue = data.criteriaPage ?? data.criteria_page ?? data.Criteria_page ?? data.printed_page_start ?? data.printedPageStart;
            return typeof pageValue === 'string' 
              ? parseInt(pageValue, 10) 
              : pageValue;
          })()
        : undefined,
      // legacy single-system fields - derive from dual codes or default_system if present
      // Priority: explicit system > default_system (from section_title) > dsm5_code presence > default to DSM-5
      system: data.system || data.default_system || data.defaultSystem || 
        ((data.dsm5_code || data.dsm5Code || data.DSM5_code) ? 'DSM-5' : 
         ((data.icd10_code || data.icd10Code || data.ICD10_code) ? 'ICD-10' : 'DSM-5')),
      code: data.code || data.dsm5_code || data.dsm5Code || data.dsm5Code || data.DSM5_code || data.icd10_code || data.icd10Code || data.ICD10_code,
      // dual code support
      dsm5Code: data.dsm5Code || data.dsm5_code || data.DSM5_code || undefined,
      icd10Code: data.icd10Code || data.icd10_code || data.ICD10_code || undefined,
      course: data.course || data.Course || 'Either',
      typicalDuration: data.typicalDuration || data.typical_duration, // if CSV provides, otherwise leave undefined
    };

    // Symptoms normalization - handle both single symptom column and array
    let symptoms = [];
    if (Array.isArray(data.symptom)) {
      // Already an array (from frontend combination logic) - keep as is, just trim and filter
      symptoms = data.symptom.map(s => String(s).trim()).filter(Boolean);
    } else if (Array.isArray(data.symptoms)) {
      // Fallback to symptoms array if present
      symptoms = data.symptoms.map(s => String(s).trim()).filter(Boolean);
    } else if (data.symptom || data.Symptom) {
      // Single symptom column - convert to array
      const symptomValue = String(data.symptom || data.Symptom || '').trim();
      if (symptomValue) {
        // Keep in pretty format (frontend already normalized)
        symptoms = [symptomValue];
      }
    } else if (data.symptoms && typeof data.symptoms === 'string') {
      // Already a string - split by comma/semicolon
      symptoms = String(data.symptoms).split(/[,;]/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    return {
      ...mapped,
      createdBy: userId,
      symptoms,
      type: 'global', // Bulk imports default to global
      organization: null,
    };
  });

  await upsertSymptoms([].concat(...diagnoses.map(d => d.symptoms || [])));
  return await Diagnosis.insertMany(diagnoses, { ordered: false });
}

export async function getAllSymptoms() {
  // Returns array of symptom names, prettified (sorted alphabetically)
  const result = await Symptom.find({}, { name: 1, _id: 0 }).sort({ name: 1 });
  return result.map(r => r.name);
}

/**
 * Get all notes for a diagnosis with metadata and sorted by ownership/type
 */
export async function getDiagnosisNotes(diagnosisId, user) {
  if (!mongoose.Types.ObjectId.isValid(diagnosisId)) {
    throw new Error('Invalid diagnosis ID');
  }

  const diagnosis = await Diagnosis.findById(diagnosisId)
    .populate('createdBy', 'name email role organization')
    .populate('organization', 'name')
    .populate({
      path: 'diagnosisNotes.createdBy',
      select: 'name email role organization',
      populate: {
        path: 'organization',
        select: 'name _id'
      }
    });

  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  const userId = user._id || user.id;
  const userOrgId = user.organization?._id || user.organization;

  // Get all notes with metadata
  const notesWithMetadata = (diagnosis.diagnosisNotes || []).map(note => {
    const noteCreatorId = note.createdBy._id || note.createdBy;
    const noteCreator = typeof note.createdBy === 'object' ? note.createdBy : null;
    
    // Determine note ownership
    const isOwned = noteCreatorId.toString() === userId.toString();
    
    // Determine note type based on creator
    let noteType = 'individual';
    if (noteCreator) {
      if (noteCreator.role === 'super_admin') {
        noteType = 'global';
      } else if (noteCreator.organization) {
        noteType = 'organization';
      } else {
        noteType = 'individual';
      }
    }

    // Determine if note belongs to user's organization
    const belongsToUserOrg = noteCreator?.organization && 
      (noteCreator.organization._id || noteCreator.organization).toString() === userOrgId?.toString();

    return {
      _id: note._id,
      content: note.content,
      createdBy: {
        _id: noteCreatorId,
        name: noteCreator?.name || 'Unknown',
        email: noteCreator?.email || 'Unknown',
      },
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      metadata: {
        ownership: isOwned ? 'owned' : (belongsToUserOrg ? 'organization' : noteType),
        type: noteType,
        isOwned,
        belongsToUserOrg,
      },
    };
  });

  // Sort notes: owned first, then by type (global, organization, individual)
  notesWithMetadata.sort((a, b) => {
    // First sort by ownership (owned notes first)
    if (a.metadata.isOwned && !b.metadata.isOwned) return -1;
    if (!a.metadata.isOwned && b.metadata.isOwned) return 1;
    
    // Then sort by type: global, organization, individual
    const typeOrder = { global: 0, organization: 1, individual: 2 };
    const aOrder = typeOrder[a.metadata.type] ?? 3;
    const bOrder = typeOrder[b.metadata.type] ?? 3;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Finally sort by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return notesWithMetadata;
}

/**
 * Add a note to a diagnosis
 */
export async function addDiagnosisNote(diagnosisId, content, user) {
  if (!mongoose.Types.ObjectId.isValid(diagnosisId)) {
    throw new Error('Invalid diagnosis ID');
  }

  if (!content || !content.trim()) {
    throw new Error('Note content is required');
  }

  const diagnosis = await Diagnosis.findById(diagnosisId);
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  const userId = user._id || user.id;

  // Add the note
  diagnosis.diagnosisNotes.push({
    content: content.trim(),
    createdBy: userId,
  });

  await diagnosis.save();

  // Return the newly added note with populated creator
  await diagnosis.populate({
    path: 'diagnosisNotes.createdBy',
    select: 'name email role organization',
  });
  
  const newNote = diagnosis.diagnosisNotes[diagnosis.diagnosisNotes.length - 1];
  
  return {
    _id: newNote._id,
    content: newNote.content,
    createdBy: {
      _id: newNote.createdBy._id,
      name: newNote.createdBy.name,
      email: newNote.createdBy.email,
    },
    createdAt: newNote.createdAt,
    updatedAt: newNote.updatedAt,
  };
}

/**
 * Update a diagnosis note (only if user owns it)
 */
export async function updateDiagnosisNote(diagnosisId, noteId, content, user) {
  if (!mongoose.Types.ObjectId.isValid(diagnosisId) || !mongoose.Types.ObjectId.isValid(noteId)) {
    throw new Error('Invalid diagnosis or note ID');
  }

  if (!content || !content.trim()) {
    throw new Error('Note content is required');
  }

  const diagnosis = await Diagnosis.findById(diagnosisId);
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  const userId = user._id || user.id;
  const note = diagnosis.diagnosisNotes.id(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  // Check if user owns the note
  const noteCreatorId = note.createdBy.toString();
  if (noteCreatorId !== userId.toString()) {
    throw new Error('You do not have permission to edit this note');
  }

  // Update the note
  note.content = content.trim();
  await diagnosis.save();

  // Return updated note with populated creator
  await diagnosis.populate({
    path: 'diagnosisNotes.createdBy',
    select: 'name email role organization',
  });
  const updatedNote = diagnosis.diagnosisNotes.id(noteId);

  return {
    _id: updatedNote._id,
    content: updatedNote.content,
    createdBy: {
      _id: updatedNote.createdBy._id,
      name: updatedNote.createdBy.name,
      email: updatedNote.createdBy.email,
    },
    createdAt: updatedNote.createdAt,
    updatedAt: updatedNote.updatedAt,
  };
}

/**
 * Delete a diagnosis note (only if user owns it)
 */
export async function deleteDiagnosisNote(diagnosisId, noteId, user) {
  if (!mongoose.Types.ObjectId.isValid(diagnosisId) || !mongoose.Types.ObjectId.isValid(noteId)) {
    throw new Error('Invalid diagnosis or note ID');
  }

  const diagnosis = await Diagnosis.findById(diagnosisId);
  if (!diagnosis) {
    throw new Error('Diagnosis not found');
  }

  const userId = user._id || user.id;
  const note = diagnosis.diagnosisNotes.id(noteId);

  if (!note) {
    throw new Error('Note not found');
  }

  // Check if user owns the note
  const noteCreatorId = note.createdBy.toString();
  if (noteCreatorId !== userId.toString()) {
    throw new Error('You do not have permission to delete this note');
  }

  // Remove the note
  note.deleteOne();
  await diagnosis.save();

  return { success: true };
}

