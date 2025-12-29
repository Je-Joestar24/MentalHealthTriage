import React from 'react';
import { useParams } from 'react-router-dom';
import SelectPatients from '../../components/psychologist/triage/SelectPatients';
import StartTriage from '../../components/psychologist/triage/StartTriage';

export default function TriagePatient() {
  const { id, triageId } = useParams();

  // If patient ID is provided, show the triage form
  // Otherwise, show the patient selection list
  if (id) {
    return <StartTriage triageId={triageId} />;
  }

  return <SelectPatients />;
}
