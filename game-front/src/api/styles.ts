import { apiClient } from './request';

export const getStyles = async () => {
	const res = await apiClient.get('/game/styles');
	return res.data.data;
};


export const getStyleActive = async () => {
	const res = await apiClient.get('/game/styles/active');
	return res.data.data;
};

export const addStyle = async (body: any) => {
	const res = await apiClient.post('/game/styles', body);
	return res.data.data;
};

export const selectStyle = async (id: any) => {
	const res = await apiClient.post(`/game/styles/${id}/select`);
	return res.data.data;
};