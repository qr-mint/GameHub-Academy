import { useEffect } from 'react';

import { getOrderPayment } from '../api/payments';

const POLLING_INTERVAL = 5000; // 5 секунд
const MAX_POLLING_ATTEMPTS = 12;

export const useOrderStatusPolling = (orderId: number, onSuccess: (order: any) => void, onError: (error: Error) => void) => {
	useEffect(() => {
		if (!orderId) return;

		let pollingAttempts = 0;
		let pollingTimeout: any;

		const checkOrderStatus = async () => {
			try {
				const order = await getOrderPayment(orderId);
				pollingAttempts++;

				if ([ 'confirmed' ].includes(order.status)) {
					onSuccess(order);
				} else if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
					onError(new Error('Order confirmation timed out'));
				} else if ([ 'failed' ].includes(order.status)) {
					onError(new Error('Order failed'));
				} else {
					pollingTimeout = setTimeout(checkOrderStatus, POLLING_INTERVAL);
				}
			} catch (error) {
				onError(error as Error);
			}
		};

		checkOrderStatus();

		return () => {
			if (pollingTimeout) clearTimeout(pollingTimeout);
		};
	}, [ orderId, onSuccess, onError ]);
};
