// utils/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '@/constants/storage';

export const saveTokens = async (token: string, refreshToken: string) => {
  await SecureStore.setItemAsync(StorageKeys.TOKEN, token);
  await SecureStore.setItemAsync(StorageKeys.REFRESH_TOKEN, refreshToken);
};

export const getTokens = async () => {
  const token = await SecureStore.getItemAsync(StorageKeys.TOKEN);
  const refreshToken = await SecureStore.getItemAsync(StorageKeys.REFRESH_TOKEN);
  return { token, refreshToken };
};

export const removeTokens = async () => {
  await SecureStore.deleteItemAsync(StorageKeys.TOKEN);
  await SecureStore.deleteItemAsync(StorageKeys.REFRESH_TOKEN);
};