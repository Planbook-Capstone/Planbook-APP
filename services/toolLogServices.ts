import { createDynamicQueryHook } from "@/hooks/react-query";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

// Service with pagination params
export const useToolLogsWithParamsService = createDynamicQueryHook(
  "tool-logs-paginated",
  API_ENDPOINTS.TOOL_LOG
);
