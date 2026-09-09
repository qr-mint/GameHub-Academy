import { apiClient } from './request';

export const connect = async (chain: string, body: object, publicKey: string) => {
	const res = await apiClient.post(`/wallets/connect/${chain}`, body, {
		headers: {
			'x-public-key': publicKey
		}
	});
	return res.data.data;
};

export const generatePayload = async () => {
	const res = await apiClient.post('/wallets/generate_payload');
	return res.data.data;
};

export const getBalance = async (network: string, address: string) => {
	const res = await apiClient.get(`/wallets/balance/${network}/${address}`);
	return res.data.data;
};

export const getAddressByQRCode = async (key: string) => {
	const res = await apiClient.get(`/wallets/address-by-qr/${key}`);
	return res.data.data;
};

export const verifyAddress = async (network: string, address: string) => {
	const res = await apiClient.get(`/wallets/verify-address/${network}/${address}`);
	return res.data.ok;
};