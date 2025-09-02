import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  createDynamicQueryHook,
  createMutationHook,
  updateMutationHook,
} from "@/hooks/react-query";

// Hook để lấy danh sách answer sheet keys theo grading session ID (GET)
export const useGetAnswerSheetKeys = createDynamicQueryHook(
  "answerSheetKeys",
  API_ENDPOINTS.ANSWER_SHEET_KEYS
);

// Hook để tạo answer sheet key mới (POST)
export const useCreateAnswerSheetKey = createMutationHook(
  "answerSheetKeys",
  API_ENDPOINTS.ANSWER_SHEET_KEYS
);

// Hook để update answer sheet key (PUT)
export const useUpdateAnswerSheetKey = updateMutationHook(
  "answerSheetKeys",
  API_ENDPOINTS.ANSWER_SHEET_KEYS
);
