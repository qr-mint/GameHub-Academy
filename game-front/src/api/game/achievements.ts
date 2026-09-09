import { apiClient } from '../request';

export const getAchievements = async () => {
	const res = await apiClient.get('/game/achievements');
	return res.data.data;
};