import { apiClient } from '../request';

export const getLeaderboardByLevels = async (level_id: number, by: 'time' | 'death') => {
  const res = await apiClient.get(`/game/leadboard/level?level_id=${level_id}&by=${by}`);
  return res.data.data;
};

export const getLeaderboardByCompany = async (company_id: number, by: 'time' | 'death') => {
  const res = await apiClient.get(`/game/leadboard/company?company_id=${company_id}&by=${by}`);
  return res.data.data;
};

export const getLeaderboardByTourname = async (tournament_id: number, by: 'time' | 'death') => {
  const res = await apiClient.get(`/game/leadboard/tournament?tournament_id=${tournament_id}&by=${by}`);
  return res.data.data;
};

export const getLeaderboardByReferrals = async () => {
  const res = await apiClient.get('/game/leadboard/referrals');
  return res.data.data;
};