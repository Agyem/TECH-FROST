export interface TranslationResult {
  originalTranscription: string;
  englishTranslation: string;
  detectedLanguage: string;
}

export enum AppMode {
  LIVE = 'LIVE',
  UPLOAD = 'UPLOAD',
  TEXT = 'TEXT',
}

export interface AudioState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
}