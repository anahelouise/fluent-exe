export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AudioVisualizerData {
  volume: number; // 0.0 to 1.0
}

export enum Topic {
  FREE_TALK = 'Free Talk',
  BUSINESS = 'Business English',
  TRAVEL = 'Travel & Directions',
  RESTAURANT = 'Ordering Food',
  JOB_INTERVIEW = 'Job Interview',
}

export interface PronunciationFeedback {
  score: number; // 0-100
  words: string[];
  phonemes: string[];
  feedback: string;
}