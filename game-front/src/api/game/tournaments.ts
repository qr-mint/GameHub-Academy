import { apiClient } from '../request';

export const getTournaments = async () => {
	const res = await apiClient.get('/game/tournaments');
	return res.data.data;
};

export const getMyTournaments = async () => {
	const res = await apiClient.get('/game/tournaments/my');
	return res.data.data;
};

export const getTournament = async (tournamentId: any) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}`);
	return res.data.data;
};

export const getMyTournament = async (tournamentId: any) => {
	const res = await apiClient.get(`/game/tournaments/my/${tournamentId}`);
	return res.data.data;
};

export const getTournamentBy = async (type: any) => {
	const res = await apiClient.get(`/game/tournaments/by?type=${type}`);
	return res.data.data;
};

export const createTournament = async (tournament: any, accessToken: string) => {
	const res = await apiClient.post('/game/tournaments', tournament, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data;
};

export const getParticipant = async (tournamentId: any) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/participant`);
	return res.data.data;
};

export const registerTournament = async (tournamentId: any, address: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/register?address=${address}`);
	return res.data;
};

export const getLevels = async (tournamentId: number) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/levels`);
	return res.data.data;
};

export const getParticipants = async (tournamentId: number) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/participants`);
	return res.data.data;
};

export const verifyNft = async (tournamentId: number, address: string) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/verify-nft?address=${address}`);
	return res.data.ok;
};

export const socialVerify = async (tournamentId: number) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/social-verify`);
	return res.data.ok;
};

export const publicTournament = async (tournamentId: number) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/public`);
	return res.data.data; 
};

export const giveAwayPrizes = async (tournamentId: number, accessToken: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/reward`, {}, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};

export const getResultLevel = async (tournamentId: number, levelId: number) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/result-level/${levelId}`);
	return res.data;
};

export const getAttempts = async (tournamentId: number) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/attempts`);
	return res.data;
};

export const swap = async (tournamentId: number, body: any, accessToken: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/swap`, body, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};

export const burnLp = async (tournamentId: number, body: any, accessToken: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/burn_lp`, body, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};

export const addLiquidity = async (tournamentId: number, orderId: number, accessToken: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/add-liquidity`, { order_id: orderId }, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};

export const refund = async (tournamentId: number, orderId: number, accessToken: string) => {
	const res = await apiClient.post(`/game/tournaments/${tournamentId}/refund`, { order_id: orderId }, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};

export const getDexPool = async (tournamentId: number, accessToken: string) => {
	const res = await apiClient.get(`/game/tournaments/${tournamentId}/pool`, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data; 
};