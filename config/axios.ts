import { StorageKeys } from "@/constants/storage";
import { refreshAuthToken } from "@/utils/authUtils";
import axios, { AxiosInstance } from "axios";
import * as SecureStore from 'expo-secure-store';

// Main API instance (default port)
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  //  baseURL:"https://api.planbook.vn",
});

// Secondary API instance (different port)
const apiSecondary = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL_SECONDARY,
});

// Helper function to setup interceptors for both instances
const setupInterceptors = (axiosInstance: AxiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
   async function (config) {
      const token  = await SecureStore.getItemAsync(StorageKeys.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite retry loop

        try {
          const newToken = await refreshAuthToken();

          // Update both instances
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          // Redirect to login on refresh failure
          if (typeof window !== "undefined") {
             await SecureStore.deleteItemAsync(StorageKeys.TOKEN);
            // window.location.href = "/auth";
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

// Setup interceptors for all instances
setupInterceptors(api);
setupInterceptors(apiSecondary);

// Export all instances
export default api;
export { apiSecondary };
