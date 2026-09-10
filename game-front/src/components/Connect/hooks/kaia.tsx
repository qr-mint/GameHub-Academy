
import { useEffect, useState } from 'react';
import DappPortalSDK, { WalletProvider } from '@linenext/dapp-portal-sdk';

import { create, confirm } from '@/api/payments';
import { generatePayload } from '@/api/wallet';
import { useWalletStore } from '@/store/wallet';

export const useLineKaia = () => {
	const { address, connect, access_token } = useWalletStore();

	const [ walletProvider, setWalletProvider ] = useState<WalletProvider | undefined>();

	useEffect(() => {
		const initSDK = async () => {
			try {
				const sdk = await DappPortalSDK.init({ clientId: '468c0fe5-3b6f-4a43-bb59-0df8ad150d85', chainId: '1001' });
				const provider = sdk.getWalletProvider();
				setWalletProvider(provider);
			} catch (err) {
				
			}
		};
		if (!walletProvider) {
			initSDK();
		}
	}, [walletProvider]);

	const handleConnect = async () => {
		try {
			const msg = await generatePayload();
			const [ account, signature ] = await walletProvider?.request({ method: 'kaia_connectAndSign', params: [msg] }) as string[];
			await connect('kaia', {
				message: msg,
				signature,
				address: account
			});
			return [ account, signature ];
		} catch (err) {
			console.log(err);
		}
	};
	

	const sendTransaction = async (body: any) => {
		const paymentData = await create({
			name: body.name,
			amount: parseFloat(body.amount),
			token: 'kaia',
			type: body.type,
			network: 'kaia',
			...(body.tournament_id ? { tournament_id: body.tournament_id } : {}),
			address_from: address,
			...(body.address_to ? { address_to: body.address_to } : {}),
			...(body.ticket_id ? { ticket_id: body.ticket_id } : {})
		}, access_token as string);
		const hash = await walletProvider?.request({ method: 'kaia_sendTransaction', params: paymentData.transactions });
		await confirm(paymentData.order_id, { hash }, access_token as string);
		return paymentData;
	};


	return {
		connected: walletProvider?.connected,
		disconnect: () => walletProvider?.disconnect(),
		connect: handleConnect,
		sendTransaction,
		access_token
	};
};
