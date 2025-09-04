// constants/apiEndpoints.ts
import { ServicePaths } from "./services";

const buildEndpoint = (service: string, path: string) =>
  `/${service}/api${path}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/login"),
    REGISTER: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/register"),
    LOGIN_GOOGLE: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/login-google"),
    REFRESH_TOKEN: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/refresh"),
  },

  ACADEMIC_YEARS: buildEndpoint(ServicePaths.WORKSPACE, "/academic-years"),

  BOOK_TYPES: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/book-types"),

  WALLET: buildEndpoint(ServicePaths.IDENTITY_SERVICE, "/wallets"),
  WALLET_TRANSACTIONS: buildEndpoint(
    ServicePaths.IDENTITY_SERVICE,
    "/wallets/transactions"
  ),
  TOOL_LOG: buildEndpoint(ServicePaths.TOOL_LOG, "/tool-logs"),
  ACADEMIC_RESOURSE_INTERNAL: buildEndpoint(
    ServicePaths.ACADEMIC_RESOURCE,
    "/academic-resources/internal"
  ),
  GRADING_SESSIONS: buildEndpoint(
    ServicePaths.GRADING_SERVICE,
    "/grading-sessions"
  ),
  OMR_TEMPLATES: buildEndpoint(ServicePaths.GRADING_SERVICE, "/omr-templates"),
  ANSWER_SHEET_KEYS: buildEndpoint(
    ServicePaths.GRADING_SERVICE,
    "/answer-sheet-keys"
  ),
  SECTION_CONFIGS: buildEndpoint(
    ServicePaths.GRADING_SERVICE,
    "/section-configs"
  ),
  STUDENT_SUBMISSIONS: buildEndpoint(
    ServicePaths.GRADING_SERVICE,
    "/student-submissions"
  ),
  // Thêm các endpoint khác ở đây
  // PRODUCTS: {
  //   GET_ALL: '/product-service/api/products',
  //   GET_BY_ID: (id: string) => `/product-service/api/products/${id}`,
  // }
  ORDERS: buildEndpoint(ServicePaths.SUBSCRIPTION, "/orders"),
};
