import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  createDynamicQueryHook,
  createMutationHook,
  createQueryHook,
} from "@/hooks/react-query";

// Hook để lấy danh sách các phiên chấm điểm (GET)
export const useGetGradingSessions = createDynamicQueryHook(
  "gradingSessions",
  API_ENDPOINTS.GRADING_SESSIONS
);

// Hook để tạo một phiên chấm điểm mới (POST)
export const useCreateGradingSession = createMutationHook(
  "createGradingSession",
  API_ENDPOINTS.GRADING_SESSIONS
);

// Hook để lấy danh sách OMR templates (GET)
export const useGetOMRTemplates = createQueryHook(
  "omrTemplates",
  API_ENDPOINTS.OMR_TEMPLATES
);
