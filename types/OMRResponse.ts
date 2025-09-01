export interface OMRResponse {
  success: boolean;
  score?: number;
  total_questions?: number;
  correct_answers?: number;
  student_answers?: string[];
  correct_answers_key?: string[];
  processing_time?: number;
  message?: string;
  error?: string;
}