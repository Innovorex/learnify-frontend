// Teaching Material Types

export interface TeachingMaterial {
  id: number;
  teacher_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_path: string;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  topics?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_text?: string;
  text_length?: number;
  chunk_count: number;
  chroma_collection_name?: string;
  extraction_metadata?: Record<string, any>;
  processing_error?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface MaterialUploadRequest {
  file: File;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  topics?: string; // Comma-separated
}

export interface MaterialUploadResponse {
  material_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  status: string;
  message: string;
}

export interface MaterialListResponse {
  materials: TeachingMaterial[];
  total: number;
  page: number;
  page_size: number;
}

export interface MaterialUpdateRequest {
  title?: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  topics?: string[];
}

export interface FileProcessingStatus {
  material_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
}

export interface MaterialFilters {
  page?: number;
  page_size?: number;
  subject?: string;
  grade_level?: string;
  status?: string;
}
