export interface PaletteColor {
  name: string;
  hex: string;
}

export interface PersonAnalysis {
  identifier: string; // e.g., "Orang 1 (Kiri/Kaos Navy)" or "Kamu (Pemeran Utama)"
  outfitDetected: string;
  validation: string;
  humorTweak: string; // "Sentuhan Kilat 30 Detik"
  specialPraise: string;
}

export interface ScanResultData {
  detectedPeopleCount: number;
  shotType: 'half-body' | 'full-body' | string;
  relationType?: 'personal' | 'pasangan' | 'keluarga' | 'teman';
  relationTitle?: string;
  relationDescription?: string;
  duoVibeTitle?: string;
  duoVibeDescription?: string;
  overallVibe: string;
  vibeTag: string;
  palette: PaletteColor[];
  people: PersonAnalysis[];
  saeVerdict: string;
  quickTips: string[];
  timeContext?: string;
  stepOutAffirmation?: string;
  localTimeInfo?: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  formattedDate: string;
  imageUrl: string;
  data: ScanResultData;
  isFavorite?: boolean;
}
