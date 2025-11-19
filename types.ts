export interface TattooDesign {
  id: string;
  name: string;
  description: string; // For UI
  promptDetail: string; // For AI
  imageSrc: string; // URL/Path to the image
  style: string;
}

export enum AppStep {
  SELECTION = 'SELECTION',
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  GALLERY = 'GALLERY',
  ERROR = 'ERROR'
}

export interface SavedTattoo {
  id: string;
  date: number;
  image: string;
  designName: string;
}

export interface AppState {
  step: AppStep;
  selectedTattooId: string | null;
  userImage: string | null; // Base64 original
  previewImage: string | null; // Base64 composited for AI
  resultImage: string | null; // Base64 final
  error: string | null;
  selectedColor: string; // Track selected color for AI prompt
}