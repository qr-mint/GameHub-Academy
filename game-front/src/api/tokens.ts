import { apiClient } from './request';

export const getTokens = async () => {
	const res = await apiClient.get('/tokens');
	return res.data.data;
};

