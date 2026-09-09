import { apiClient } from './request';

export const getTransactions = async () => {
	const res = await apiClient.get('/api/v3/transactions');
	return res.data.data;
};