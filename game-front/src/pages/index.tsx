import { useContext, useEffect, useState } from 'react';
import { Zap, Star, Users, Coins, UserPlus, Settings, Ticket, Home, Wallet, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import BigNumber from 'bignumber.js';

import { ReferralPage } from './referral';
import { LeaderboardPage } from './leadboard';
import { TournamentsPage } from './tournaments/tournaments';
import { AchievementsPage } from './achievements';
import { ConnectContext } from '../components/Connect/provider';
import { useAuthStore } from '../store/auth';
import { useGameStore } from '../store/game';
import { useWalletStore } from '../store/wallet';
import { SettingsModal } from '../components/SettingsModal';
import networks from '../components/Connect/hooks/config/network.json';

import { startBackgroundMusic } from '@/audio/backgroundMusic';
import { useSettingsStore } from '@/store/settings/settings';
import { useTicket } from '@/providers/tickets';
import { PaymentProccesing } from '@/components/PaymentProccesing';

export function GameMenu () {
	const { setConnectWallet } = useSettingsStore();
	const { openRefillTickets } = useTicket();
	const [order] = useState<any>({});
	const wallet = useWalletStore();
	const { user: commonUser } = useAuthStore();
	const { data, loadGameData } = useGameStore();
	const { t } = useTranslation();
	const connectors = useContext(ConnectContext);
	const navigate = useNavigate();
	const [ activeTab, setActiveTab ] = useState('home');
	const [ showSettings, setShowSettings ] = useState(false);
	const isTMA = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

	const load = async () => {
		try {
			await loadGameData();
		} catch (err) {
			toast.error((err as any).message);
		}
	};
	useEffect(() => {  
		load();
		const start = () => {
			startBackgroundMusic('assets/music/menu/manifest.json');
		};

		document.addEventListener('pointerdown', start, { once: true });

		return () => {
			document.removeEventListener('pointerdown', start);
		};
	}, []);
  
	if (!data || !commonUser) {
		return <></>;
	}

	const handlePlay = async () => {
		navigate('/game');
	};

	const renderWallet = () => {
		const network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(wallet.chain) ? 'evm' : wallet.chain;
		return !connectors[network]?.connected ? (
			<button 
				onClick={() => isTMA ? connectors.ton.connect() : setConnectWallet(true)}
				className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all hover:scale-105 active:scale-95"
			>
				<Wallet className="w-4 h-4 text-white" />
				<span className="text-white font-bold text-xs">{t('wallet')}</span>
			</button>
		) : (
			<div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
				<Coins className="w-4 h-4 text-yellow-300" />
				<span className="text-white font-bold text-xs">{new BigNumber(wallet.balance || 0).div(10 ** networks[wallet.chain].decimals).toFixed(2)} {wallet.chain}</span>
			</div>
		);
	};
  
	return (
		<div className="min-h-screen flex flex-col relative">
			{order.id && <PaymentProccesing t={t} />}
			<div className="fixed inset-0  from-amber-600 via-amber-700 to-amber-900">
				<div style={{ background: 'url(/assets/images/bg-menu.png) no-repeat', backgroundSize: '100% 100%' }} className="absolute inset-0">		
				</div>
			</div>

			<div className="relative flex-1 flex flex-col p-2 pb-24">
				<div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/20">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold">
								{commonUser.username.charAt(0)}
							</div>
							<div>
								<p className="text-white font-semibold text-xs">{commonUser.username}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{isTMA && (
								<button 
									onClick={() => openRefillTickets()}
									className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 hover:bg-white/30 transition-colors"
								>
									<Ticket className="w-4 h-4 text-blue-300" />
									<span className="text-white font-bold text-xs">{data?.tickets}</span>
								</button>
							)}
							{renderWallet()}
							<button 
								onClick={() => setShowSettings(true)}
								className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
							>
								<Settings className="w-4 h-4 text-white" />
							</button>
						</div>
					</div>
				</div>

				{activeTab === 'home' && (
					<div className="my-auto">
						<div className="flex-1 max-w-2xl mx-auto w-full items-center">
							<div className="grid grid-cols-1 gap-3">
								<div
									className="group relative overflow-hidden border-2 border-white/20 bg-white/15 backdrop-blur-md hover:bg-white/25 transition-all duration-300 cursor-pointer hover:scale-[1.02] rounded-xl"
									onClick={handlePlay}
								>
									<div className="absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-80 transition-opacity" />
                  
									<div className="relative p-4 flex items-center gap-4">
										<div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
											<Zap className="w-6 h-6 text-white" />
										</div>
                    
										<div className="flex-1">
											<h3 className="text-xl font-bold text-white mb-0.5">{t('home.quickPlay.title')}</h3>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'achievements' && <AchievementsPage t={t} />}
				{activeTab === 'invite' && <ReferralPage t={t} />}
				{activeTab === 'leaderboard' && <LeaderboardPage t={t} />}
				{activeTab === 'tournaments' && <TournamentsPage t={t} />}
			</div>

			<div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 safe-bottom">
				<div className="flex items-center justify-around px-2 py-3 max-w-2xl mx-auto">
					<button
						onClick={() => setActiveTab('home')}
						className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
							activeTab === 'home' 
								? 'bg-white/20 text-white' 
								: 'text-white-200 hover:text-white'
						}`}
					>
						<Home className="w-5 h-5" />
						<span className="text-xs font-medium">{t('tabbar.home')}</span>
					</button>

					<button
						onClick={() => setActiveTab('achievements')}
						className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
							activeTab === 'achievements' 
								? 'bg-white/20 text-white' 
								: 'text-white-200 hover:text-white'
						}`}
					>
						<Star className="w-5 h-5" />
						<span className="text-xs font-medium">{t('tabbar.achievements')}</span>
					</button>

					<button
						onClick={() => setActiveTab('invite')}
						className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
							activeTab === 'invite' 
								? 'bg-white/20 text-white' 
								: 'text-white-200 hover:text-white'
						}`}
					>
						<UserPlus className="w-5 h-5" />
						<span className="text-xs font-medium">{t('tabbar.frens')}</span>
					</button>

					<button
						onClick={() => setActiveTab('leaderboard')}
						className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
							activeTab === 'leaderboard' 
								? 'bg-white/20 text-white' 
								: 'text-white-200 hover:text-white'
						}`}
					>
						<Users className="w-5 h-5" />
						<span className="text-xs font-medium">{(t('tabbar.leaderboard'))}</span>
					</button>		
				</div>
			</div>
			<SettingsModal
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
			/>
		</div>
	);
}
