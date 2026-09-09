import { useEffect, useRef } from 'react';
import {
	useIsConnectionRestored,
	useTonConnectModal,
	useTonConnectUI,
	useTonWallet,
} from '@tonconnect/ui-react';

import { generatePayload } from '@/api/wallet';
import { create, confirm as paymentConfirm } from '@/api/payments';
import { useWalletStore } from '@/store/wallet';
import { toast } from 'react-toastify';
import { walletConnect } from '@/api/game';

const payloadTTLMS = 1000 * 60 * 20;

export function useTon () {
	const { open } = useTonConnectModal();
	const { address, connect, access_token, disconnect } = useWalletStore();
	const isConnectionRestored = useIsConnectionRestored();
	const wallet = useTonWallet();
	const [tonConnectUI] = useTonConnectUI();
	const interval = useRef(null);

	useEffect(() => {
		if (!isConnectionRestored || address && access_token) {
			return;
		} else if (!isConnectionRestored || address && !access_token) {
			disconnect();
		}

		clearInterval(interval.current as any);
		if (!wallet) {
			const refreshPayload = async () => {
				tonConnectUI.setConnectRequestParameters({ state: 'loading' });
				try {
					const value = await generatePayload();
					if (!value) {
						tonConnectUI.setConnectRequestParameters(null);
					} else {
						tonConnectUI.setConnectRequestParameters({
							state: 'ready',
							value: { tonProof: value },
						});
					}
				} catch (err) {
					toast.error((err as any).message);
				}
			};

			refreshPayload();
			setInterval(refreshPayload, payloadTTLMS);
			return;
		}

		const handleConnect = async () => {
			try {
				const access_token = await connect('ton', wallet);
				await walletConnect(access_token);
			} catch (err) {
				await disconnect();
			}
		};

		if (
			wallet.connectItems?.tonProof &&
			!('error' in wallet.connectItems.tonProof)
		) {
			handleConnect();
		} else {
			disconnect().catch(console.warn);
		}
	}, [ wallet, isConnectionRestored, connect, tonConnectUI ]);

	const sendTransaction = async (body: any) => {
		const paymentData = await create({
			name: body.name,
			amount: parseFloat(body.amount),
			token: 'ton',
			type: body.type,
			network: 'ton',
			address_from: address,
			...(body.tournament_id ? { tournament_id: body.tournament_id } : {}),
			...(body.address_to ? { address_to: body.address_to } : {}),
			...(body.ticket_id ? { ticket_id: body.ticket_id } : {})
		}, access_token as string);
		const tonConnectResponse = await tonConnectUI.sendTransaction({
			messages: paymentData.data.transactions.map((tx: any) => {
				return {
					address: tx.to,
					amount: tx.value.toString(),
					...(tx.payload ? { payload: tx.payload } : {})
				};
			}),
			validUntil: Date.now() + 10 * 60 * 1000,
		});
		await paymentConfirm(paymentData.data.order_id, tonConnectResponse, access_token as string);
		return paymentData;
	};
	
	return {
		address,
		connect: open,
		sendTransaction,
		disconnect: tonConnectUI?.disconnect,
		connected: tonConnectUI?.connected,
		access_token
	};
}
