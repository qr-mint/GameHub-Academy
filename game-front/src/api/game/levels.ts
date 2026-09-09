import { apiClient } from '../request';

export const getLevels = async (type?: string) => {
	const res = await apiClient.get('/game/levels', {
		params: { type }
	});
	return res.data.data;
};

export const getMyLevels = async (type?: string) => {
	const res = await apiClient.get('/game/levels/my', {
		params: { type }
	});
	return res.data.data;
};

export const getLevel = async (levelId: any) => {
	const res = await apiClient.get(`/game/levels/${levelId}`);
	return res.data.data;
};

export const startLevel = async (levelId: any, start_at: any) => {
	const res = await apiClient.post(`/game/levels/${levelId}/start`, { start_at });
	return res.data.data;
};

interface FinishParams {
  time: any;
  success: boolean;
  scores?: number; 
  tournament_id?: number;
  deaths?: number
}

export const finishLevel = async (levelId: any, body: FinishParams) => {
	const res = await apiClient.post(`/game/levels/${levelId}/finish`, body);
	return res.data.data;
};

export const getCompanies = async () => {
	const res = await apiClient.get('/game/levels/companies');
	return res.data.data;
};

export const getLevelsByCompanyId = async (levelId: number) => {
	const res = await apiClient.get(`/game/levels/companies/${levelId}/levels`);
	return res.data.data;
};

export const getLevelStats = async (levelId: number) => {
	const res = await apiClient.get(`/game/levels/${levelId}/stats`);
	return res.data.data;
};

export const updateLevel = async (levelId: number, data: any) => {
	const res = await apiClient.put(`/game/levels/${levelId}`, data);
	return res.data;
};

export const createLevel = async (data: any) => {
	const res = await apiClient.post('/game/levels', data);
	return res.data;
};

export const calculatePath = async (levelId: number) => {
	const res = await apiClient.post(`/game/levels/${levelId}/calculate-path`, null, {
		timeout: 300_000,
	});
	return res.data;
};