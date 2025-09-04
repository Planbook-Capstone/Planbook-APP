import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  createDynamicQueryHook,
  createMutationHook,
  createQueryWithPathParamHook,
} from "@/hooks/react-query";

// Hook để tạo student submission mới (POST)
export const useCreateStudentSubmission = createMutationHook(
  "studentSubmissions",
  API_ENDPOINTS.STUDENT_SUBMISSIONS
);

export const useGetStudentSubmissionId = createDynamicQueryHook(
  "studentSubmissions",
  API_ENDPOINTS.STUDENT_SUBMISSIONS
);

export const useGetStudentSubmissionBySubmissonId =
  createQueryWithPathParamHook(
    "studentSubmissionsByGradingSession",
    API_ENDPOINTS.STUDENT_SUBMISSIONS
  );
