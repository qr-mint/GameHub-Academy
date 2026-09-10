import { apiClient } from '../request';

export const getNFTsByNetwork = async () => {
	const res = await apiClient.get('/game/partners/nfts');
	return res.data.data;
};

interface PartnerMint {
  order_id: number,
  address: string,
  network: string
}

export const partnerMint = async (body: PartnerMint, accessToken: string) => {
	if (!accessToken) {
		throw new Error('Access token is not set');
	}
	const res = await apiClient.post('/game/partners/mint', body, {
		headers: {
			'access-token': accessToken
		}
	});
	return res.data.data;
};

export const getPartners = async () => {
	const res = await apiClient.get('/game/partners');
	return res.data.data;
};