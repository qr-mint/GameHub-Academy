import { apiClient } from './request';

export const getPoolPair = async (network: string, dex: string) => {
	const res = await apiClient.get(`/pools/dex/pairs?network=${network}&dex=${dex}`);
	return res.data?.data;
};

export const getPool = async (network: string, address: string) => {
	const res = await apiClient.get(`/pools/dex/${network}/${address}`);
	return res.data?.data;
};