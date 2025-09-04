import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { createMutationHook } from "@/hooks/react-query";

// Hook để tạo student submission mới (POST)
export const useCreateStudentSubmission = createMutationHook(
  "studentSubmissions",
  API_ENDPOINTS.STUDENT_SUBMISSIONS
);
