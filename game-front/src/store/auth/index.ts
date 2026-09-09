import { create } from 'zustand';
import { VERSION } from '@/store/config';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState, AuthStore } from './types';
import { auth, authWeb, logout, refreshToken } from '../../api/auth';
import { getUser } from '../../api/users';
import { generateKey } from '../../api/app';

const initialState: AuthState = {
	access_token: null,
	user: null,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			...initialState,
			auth: async () => {
				const key = await generateKey(import.meta.env.VITE_PUBLIC_KEY);
				const access_token = await auth(key);
				set({ access_token });
			},
			authWeb: async (data: any) => {
				const key = await generateKey(import.meta.env.VITE_PUBLIC_KEY);
				const access_token = await authWeb(data, key);
				set({ access_token });
			},
			refreshToken: async () => {
				const access_token = await refreshToken();
				set({ access_token });
			},
			logout: async () => {
				await logout();
				set({ access_token: null, user: null });
			},
			getMe: async () => {
				const user = await getUser();
				set({ user: user?.data });
			},
		}),
		{
			name: 'auth',
			version: VERSION,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				access_token: state.access_token,
				user: state.user,
			}),
		}
	)
);
