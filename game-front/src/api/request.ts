import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { useWalletStore } from '@/store/wallet';

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	timeout: 30000,
});

interface IHeader {
	'Authorization': string,
}
apiClient.interceptors.request.use((config: any) => {
	const { access_token } = useAuthStore.getState();
	if (access_token) {
		config.headers['Authorization'] = `Bearer ${access_token}`;
	}
	return config;
});


apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		console.log(error);
		const originalRequest = error.config;
		if (!error) return;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const { refreshToken, logout, access_token } = useAuthStore.getState();
			try {
				await refreshToken();
	
				if (access_token) {
					const headers: IHeader = {
						Authorization: `Bearer ${access_token}`,
					};
					originalRequest.headers = headers;
				}
				return apiClient(originalRequest);
			} catch (err) {
				const { disconnect } = useWalletStore.getState();
				disconnect();
				logout();
				return Promise.resolve(err);
			}
		} else if (error.response.status === 406) {
			const { disconnect } = useWalletStore.getState();
			const { logout } = useAuthStore.getState();
			await logout();
			await disconnect();
			return Promise.resolve(error);
		} else {
			return Promise.reject(error);
		}
	},
);
