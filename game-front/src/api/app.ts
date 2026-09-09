import { apiClient } from './request';

export const generateKey = async (public_key: string) => {
	const res = await apiClient.post('/apps/generate', { public_key });
	return res.data?.data;
};