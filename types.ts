
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  RADIOLOGY = 'RADIOLOGY',
  DOCUMENTS = 'DOCUMENTS',
  DERMVUE = 'DERMVUE',
  SETTINGS = 'SETTINGS'
}

export interface RadiologyStudy {
  id: string;
  patientId: string;
  modality: 'XR' | 'CT' | 'MRI';
  bodyPart: string;
  date: string;
  imageUrl: string;
  report?: string;
  laymanReport?: string;
  tags?: string[];
}

export interface ClinicalDoc {
  id: string;
  type: 'Lab' | 'Imaging' | 'Clinic Note' | 'Discharge' | 'Pathology';
  date: string;
  title: string;
  content: string;
  summary?: string;
}

export interface DermCase {
  id: string;
  date: string;
  imageUrl: string;
  symptoms: string[];
  duration: string;
  assessment?: string;
  riskTier?: 'Low' | 'Moderate' | 'Concerning';
  nextSteps?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
}
