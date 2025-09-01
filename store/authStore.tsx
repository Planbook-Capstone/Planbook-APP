// store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { StorageKeys } from '@/constants/storage';
import { AuthDataPayload, User } from '@/types/user';

// Định nghĩa interface cho State
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  actions: {
    setAuth: (data: AuthDataPayload) => void; // <-- Cập nhật kiểu ở đây
    logout: () => void;
    hydrate: () => Promise<void>;
  };
}



// Custom storage object dùng SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      actions: {
        setAuth: (data: AuthDataPayload) => {
  
         const { token, refreshToken, ...userObject } = data;

          // Lưu các phần đã được tách vào đúng vị trí trong state
          set({
            user: userObject, // userObject giờ chỉ chứa thông tin user
            token: token,     // token được lưu riêng
            refreshToken: refreshToken, // refreshToken được lưu riêng
            isAuthenticated: true,
          });
        },
        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },
        // Action để load lại state từ SecureStore khi app khởi động
        hydrate: async () => {
          const state = get();
          // Logic này giúp đồng bộ state từ storage vào memory khi cần
          // Bạn có thể gọi nó ở file layout gốc
        },
      },
    }),
    {
      name: StorageKeys.AUTH_STORAGE,
      storage: createJSONStorage(() => secureStorage),
      // Chỉ lưu những field này vào storage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Legacy AppProvider for backward compatibility (can be removed if not needed)
export function AppProvider({ children }: { children: any }) {
 return <>{children}</>
}

// Export các actions để dễ sử dụng
export const useAuthActions = () => useAuthStore((state) => state.actions);