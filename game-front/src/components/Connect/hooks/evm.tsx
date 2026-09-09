import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain, useWalletClient } from 'wagmi';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

import { create, confirm } from '@/api/payments';
import { walletConnect } from '@/api/game';
import { coreDao, flow, ancient, sei, kaia, bsc, botChain } from './config/config';
import { generatePayload } from '@/api/wallet';
import { useWalletStore } from '@/store/wallet';
import { useSettingsStore } from '@/store/settings/settings';

export const chainIds = {
	[kaia.id]: 'kaia',
	[ancient.id]: 'ancient',
	[coreDao.id]: 'core',
	[flow.id]: 'flow',
	[sei.id]: 'sei',
	// [sei.id]: 'duckchain',
	[bsc.id]: 'bsc',
	[botChain.id]: 'botchain',
};

export const networks = {
	kaia: {
		decimals: 18,
		code: kaia.id,
		coinSymbol: 'KAIA'
	},
	ancient: {
		decimals: 18,
		code: ancient.id,
		coinSymbol: 'A8'
	},
	botchain: {
		decimals: 18,
		code: botChain.id,
		coinSymbol: 'bot'
	},
	core: {
		decimals: 18,
		code: coreDao.id,
		coinSymbol: 'tCore'
	},
	flow: {
		decimals: 18,
		code: flow.id,
		coinSymbol: 'flow'
	},
	sei: {
		decimals: 18,
		code: sei.id,
		coinSymbol: 'sei'
	},
	duckchain: {
		decimals: 18,
		code: sei.id,
		coinSymbol: 'duckchain'
	},
	bsc: {
		decimals: 18,
		code: bsc.id,
		coinSymbol: 'bsc'
	},
};

export const useEvm = () => {
	const { connect: qrMintConnect, disconnect: walletDisconnect } = useWalletStore();
	const [ accessToken, setAccessToken ] = useState<string>();
	const { data: client } = useWalletClient();
	const { connectors, connect } = useConnect();
	const [ evmModal, setEvmModal ] = useState(false);
	const { switchChain } = useSwitchChain();
	const { disconnect } = useDisconnect();
	const [ network, setNetwork ] = useState<any>();
	const { address, isConnected, chain } = useAccount();
	const { signMessageAsync } = useSignMessage();

	// useEffect(() => {
	// 	if (!accessToken && isConnected) {
	// 		disconnect();
	// 	}
	// }, [accessToken, isConnected]);

	useEffect(() => {
		if (isConnected && !network) {
			const net = chainIds[chain?.id as number];
			if (net) {
				setNetwork(net as any);
			}
		}
	}, [isConnected]);

	const handleSwitch = async (chainId: any) => {
		switchChain({ chainId });
	};

	const open = (chainId: any) => {
		const net = chainIds[chainId];
		if (!net) {
			throw new Error('Unknown network');
		}
		setNetwork(net as any);
		setEvmModal(true);
	};

	const handleSignAndConnect = async () => {
		try {
			const message = await generatePayload(); 
			const signature = await signMessageAsync({ message });
			const accessToken = await qrMintConnect(network as any, {
				message,
				signature,
				address
			});
			setAccessToken(accessToken);
			walletConnect(accessToken);
		} catch (err) {
			toast.error((err as any).message || 'Something went wrong');
		}
	};

	const handleSendTransaction = async (body: any) => {

		const paymentData = await create({
			name: body.name,
			amount: parseFloat(body.amount),
			token: body.token,
			type: body.type,
			network,
			address_from: address,
			...(body.tournament_id ? { tournament_id: body.tournament_id } : {}),
			...(body.address_to ? { address_to: body.address_to } : {}),
			...(body.ticket_id ? { ticket_id: body.ticket_id } : {})
		}, accessToken as string);

		const hash = await client?.sendTransaction(paymentData.data.transactions[0]);
		await confirm(paymentData.data.order_id, { hash }, accessToken as string);

		return paymentData;
	};

	const handleDisconnect = async () => {
		disconnect();
		setAccessToken('');
		await walletDisconnect();
	};

	return {
		access_token: accessToken,
		evmModal,
		address,
		connected: isConnected,
		chain,
		network,
		signAndConnect: handleSignAndConnect,
		connect,
		disconnect: handleDisconnect,
		open,
		close: () => setEvmModal(false),
		modal: evmModal,
		list: connectors,
		switchChain: handleSwitch,
		sendTransaction: handleSendTransaction,
	};
};
