export interface DicomMetadata {
  patientName: string;
  patientId: string;
  studyDate: string;
  modality: string; // CT, MR, XR
  institutionName: string;
  manufacturer: string;
}

export interface Study {
  id: string; // Database ID
  file_url: string; // Storage URL
  file_name: string;
  size: number;
  metadata: DicomMetadata;
  created_at: string;
}

// Cornerstone specific types to avoid 'any'
export interface CornerstoneElement extends HTMLDivElement {
  // Cornerstone attaches data to the DOM element
  dataset?: any;
}
