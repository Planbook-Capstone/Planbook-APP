import api from "@/config/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { getTokens, saveTokens } from '@/utils/tokenStorage'; // 1. Import getTokens từ file storage


export const refreshAuthToken = async () => {
  const { refreshToken } = await getTokens();

  console.log(refreshToken, "refreshToken");
  
  if (refreshToken) {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshToken,
    });

    const newAccessToken = response.data.data.token;
    await saveTokens(newAccessToken, refreshToken); 

    return newAccessToken;
  }
  throw new Error("Refresh token not available");
};
