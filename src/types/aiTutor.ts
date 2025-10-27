// AI Tutor Types

export interface PedagogySource {
  module: string;
  subject: string;
  file_name: string;
  relevance: number;
}

export interface StartSessionRequest {
  topic_name: string;
  subject: string;
  grade: string;
  state?: string;
  board?: string;
}

export interface StartSessionResponse {
  session_id: number;
  initial_message: string;
  syllabus_fetched: boolean;
  pedagogy_sources: PedagogySource[];
  model_used: string;
  created_at: string;
}

export interface ChatRequest {
  session_id: number;
  message: string;
}

export interface ChatResponse {
  session_id: number;
  response: string;
  additional_sources: PedagogySource[];
  model_used: string;
  timestamp: string;
}

export interface SessionHistory {
  session_id: number;
  topic_name: string;
  subject: string;
  grade: string;
  status: string;
  created_at: string;
  last_activity: string;
  message_count: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  model?: string;
  metadata?: any;
  timestamp: string;
}

export interface SessionMessages {
  session_id: number;
  messages: Message[];
}
