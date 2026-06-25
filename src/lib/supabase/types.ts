export interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  language: string;
  mode: string;
  level: string;
  voice_type: string;
  user_name: string | null;
  device_info: Record<string, unknown>;
  duration_seconds: number | null;
  status: string;
  browser_fingerprint: string | null;
}

export interface Transcript {
  id: string;
  session_id: string;
  role: "user" | "tutor";
  content: string;
  created_at: string;
  sequence_number: number;
}

export interface SessionScore {
  id: string;
  session_id: string;
  fluency: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
  overall: number;
  feedback_text: string | null;
  strengths: string[];
  improvements: string[];
  suggested_next: string | null;
}

export interface AudioRecording {
  id: string;
  session_id: string;
  storage_path: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      sessions: { Row: Session };
      transcripts: { Row: Transcript };
      session_scores: { Row: SessionScore };
      audio_recordings: { Row: AudioRecording };
    };
  };
}
