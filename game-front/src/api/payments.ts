import { apiClient } from './request';

interface PaymentBody {
  amount?: number,
  name?: string,
  token?: string,
  address_from?: string,
  network: 'ton' | 'solana' | 'bsc' | 'kaia' | 'botchain' | 'coredao',
  type: 'join_jackpot' | 'buy_ticket' | 'mint_nft' | 'create_tournament',
  tourname_id?: number,
  ticket_id?: number
}

export const create = async (body: PaymentBody, accessToken: string) => {
	const res = await apiClient.post('/game/payments', body, {
		headers: {
			'Content-Type': 'application/json',
			'access-token': accessToken
		}
	});
	return res.data?.data;
};

export const confirm = async (id: any, body: any, accessToken: string) => {
	const res = await apiClient.post(`/payments/qrmint/confirm/${id}`, body, {
		headers: {
			'Authorization': `Bearer ${accessToken}`
		}
	});
	return res.data?.data;
};

export const orders = async () => {
	const res = await apiClient.get('/payments/qrmint/orders');
	return res.data?.data;
};

export const getOrder = async (orderId: number) => {
	const res = await apiClient.get(`/payments/order/${orderId}`);
	return res.data?.data;
};

export const getTickets = async () => {
	const res = await apiClient.get(`/game/payments/tickets`);
	return res.data?.data;
};

export const getOrderPayment = async (paymentId: number) => {
	const res = await apiClient.get(`/game/payments/${paymentId}`);
	return res.data?.data;
}