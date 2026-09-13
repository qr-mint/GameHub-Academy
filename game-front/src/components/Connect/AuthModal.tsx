import { useState, useContext } from 'react';
import {
	Sparkles,
	Wallet,
	X
} from 'lucide-react';

import { Modal } from '../modal';
import { useTranslation } from '../../../node_modules/react-i18next';
import { ConnectContext } from './provider';

import { networks } from './hooks/evm';

const chains = {
	ton: 'ton',
	btc: 'btc',
	ancient: 'ancient',
	kaia: 'kaia',
	stx: 'stx',
	core: 'core',
	flow: 'flow',
	mantra: 'mantra',
	gonka: 'gonka',
	sei: 'sei',
	duckchain: 'duckchain',
	bsc: 'bsc',
	solana: 'solana',
	casper: 'casper',
	botchain: 'botchain'
};

const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'testnet';

interface AuthModalProps {
	onClose: () => void;	
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
	const connectors = useContext(ConnectContext);
	const { t } = useTranslation();
	const [ selectedBlockchain, setSelectedBlockchain ] = useState<any>(null);

	const handleOpenLogin = async (chain: any) => {
		if (selectedBlockchain === chains.ton) {
			open();
		} if ([ chains.kaia, chains.ancient, chains.core, chains.flow, chains.sei, chains.bsc, chains.botchain ].includes(chain)) {
			await connectors.evm.open(networks[chain].code);
		}
		onClose();
		setSelectedBlockchain(chain);
	};

	return (
		<Modal onClose={onClose} isOpen={true}>
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white/20 rounded-2xl p-6">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
				>
					<X className="w-5 h-5 text-white" />
				</button>
				<div className="text-center mb-6">
					<div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-4 flex items-center justify-center">
						<Wallet className="w-8 h-8 text-white" />
					</div>
					<h2 className="text-2xl font-bold text-white">{t('walletConnect.title')}</h2>
					<p className="text-white-200 mt-1">{t('walletConnect.subtitle')}</p>
				</div>

				<div className="space-y-3 mb-6">
					<button
						onClick={() => handleOpenLogin('ton')}
						className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
							selectedBlockchain === 'ton'
								? 'bg-blue-500/20 border-blue-400'
								: 'bg-white/10 border-white/20 hover:bg-white/15'
						}`}
					>
						<div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
							<span className="text-2xl font-bold text-white">T</span>
						</div>
						<div className="flex-1 text-left">
							<p className="text-white font-bold">TON</p>
							<p className="text-white-200 text-sm">Telegram Open Network</p>
						</div>
						{selectedBlockchain === 'ton' && (
							<div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-white" />
							</div>
						)}
					</button>

					{/* <button
						onClick={() => handleSelectBlockchain('solana')}
						className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
							selectedBlockchain === 'solana'
								? 'bg-amber-500/20 border-amber-400'
								: 'bg-white/10 border-white/20 hover:bg-white/15'
						}`}
					>
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-green-400 flex items-center justify-center">
							<span className="text-2xl font-bold text-white">S</span>
						</div>
						<div className="flex-1 text-left">
							<p className="text-white font-bold">Solana</p>
							<p className="text-white-200 text-sm">Phantom, Solflare</p>
						</div>
						{selectedBlockchain === 'solana' && (
							<div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-white" />
							</div>
						)}
					</button> */}

					<button
						onClick={() => handleOpenLogin(chains.botchain)}
						className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
							selectedBlockchain === 'evm'
								? 'bg-orange-500/20 border-orange-400'
								: 'bg-white/10 border-white/20 hover:bg-white/15'
						}`}
					>
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
							<span className="text-2xl font-bold text-white">E</span>
						</div>
						<div className="flex-1 text-left">
							<p className="text-white font-bold">EVM</p>
							<p className="text-white-200 text-sm">BotChain</p>
						</div>
						{selectedBlockchain === 'evm' && (
							<div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-white" />
							</div>
						)}
					</button>

					{/* <button
						onClick={() => handleSelectBlockchain('evm')}
						className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
							selectedBlockchain === 'evm'
								? 'bg-orange-500/20 border-orange-400'
								: 'bg-white/10 border-white/20 hover:bg-white/15'
						}`}
					>
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
							<span className="text-2xl font-bold text-white">E</span>
						</div>
						<div className="flex-1 text-left">
							<p className="text-white font-bold">Cosmos</p>
							<p className="text-white-200 text-sm">Cosmos</p>
						</div>
						{selectedBlockchain === 'evm' && (
							<div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-white" />
							</div>
						)}
					</button> */}
				</div>

				{/* <button
					disabled={!selectedBlockchain || connectingWallet}
					className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-500/50 disabled:to-blue-600/50 text-white font-bold py-4 rounded-xl transition-all"
				>
					{connectingWallet ? t('walletConnect.connecting') : t('walletConnect.connect')}
				</button> */}
			</div>
		</Modal>
	);
};