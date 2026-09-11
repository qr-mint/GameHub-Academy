import { AlertTriangleIcon, ArrowLeftIcon, Calendar1Icon, Check, CheckCircleIcon, ChevronDownIcon, ClockIcon, Copy, ExternalLink, ExternalLinkIcon, FileTextIcon, GamepadIcon, GiftIcon, HeartIcon, LoaderIcon, LockIcon, Play, PlayIcon, SendIcon, Share2, Shield, SkullIcon, SparkleIcon, Sparkles, StarIcon, TargetIcon, TicketIcon, TrendingUp, Trophy, TrophyIcon, UserPlusIcon, UsersIcon, XCircleIcon } from 'lucide-react';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
	getTournament,
	getParticipant,
	registerTournament,
	verifyNft,
	socialVerify,
} from '@/api/game/tournaments';

import { ConnectContext } from '@/components/Connect/provider';
import { PaymentProccesing } from '@/components/PaymentProccesing';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { getAttempts } from '@/api/game/tournaments';

import { formatTime } from '../../utils/date';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { DexSection } from '@/components/DexSection';
import { useSettingsStore } from '@/store/settings/settings';

enum schdeule {
  daily = 'daily',
  weekly = 'weekly',
  special = 'special',
  season = 'season'
}

enum statuses {
  completed = 'completed',
  ongoing = 'ongoing',
  upcoming = 'upcoming'
}

enum types {
  survival = 'survival',
  single_attempt = 'single_attempt',
  leaderboard = 'leaderboard',
  race = 'race'
}

interface Prize {
  nft: any,
  network: string,
  percent: number,
  amount: number,
  place_from: number,
  place_to: number,
}

interface Level {
  level_id: number,
  order: number
}

interface User {
  id: number,
  username: string,
}

interface Participant {
  id: number;
  best_time: string;
  deaths: number;
  status: string;
  completed: boolean;
  user: User;
  allow?: boolean;
}

interface Taks {
  id: number,
  url: string,
  action: string,
  social: string,
  username: string,
}

interface Tournament {
  id: number;
  name: string;
  type: types;
  schedule: schdeule;
  status: statuses;
  entry_amount: number;
  entry_tickets: number;
  description: string;
  start_at: string;
  end_at: string;
  players_count: number;
  collection_address: string;
  icon: string;
  color: string;
  network: string;
  currency_token: string;
  address: string;
  token: string;
  entry_balance: number;
	prize_balance: number;
	prize_token: number;
  player_limit: number;
  winners_count: number;
  prizes: Prize[];
  participants: Participant[];
  tasks: Taks[];
  entry_mode: string;
	dex_id: string;
}

interface attempts {
  id: number;
  user_id: number;
  time: number;
  deaths: number;
  scores: number;
  success: boolean;
  ticket_cost: number;
  tournament_id: number;
  company_id: number;
  update_at: string;
  created_at: string;
}


// =====================
// CONFIGS
// =====================

const typeConfig: Record<types, { icon: React.FC<{ className?: string }>; label: string; color: string }> = {
	leaderboard: { icon: TrophyIcon, label: 'Leaderboard', color: 'text-yellow-400' },
	single_attempt: { icon: TargetIcon, label: 'Single Attempt', color: 'text-red-400' },
	survival: { icon: HeartIcon, label: 'Survival', color: 'text-pink-400' },
	race: { icon: TargetIcon, label: 'Race', color: 'text-pink-400' },
};

const scheduleConfig: Record<schdeule, { label: string; bgColor: string; textColor: string }> = {
	daily: { label: 'Daily', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
	weekly: { label: 'Weekly', bgColor: 'bg-amber-500/20', textColor: 'text-white-400' },
	special: { label: 'Special Event', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' },
	season: { label: 'Season', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' },
};

function getSocialIcon (type: string) {
	switch (type) {
	case 'telegram': return 'TG';
	case 'twitter': return 'X';
	case 'discord': return 'DC';
	default: return '?';
	}
}

function getSocialColor (type: string) {
	switch (type) {
	case 'telegram': return 'bg-blue-500';
	case 'twitter': return 'bg-black';
	case 'discord': return 'bg-indigo-500';
	default: return 'bg-gray-500';
	}
}

export function Tournament () {
	const { setConnectWallet } = useSettingsStore();
	const [ inviteCopied, setInviteCopied ] = useState(false);
	const connectors = useContext(ConnectContext);
	const { t } = useTranslation();
	const navigate = useNavigate();
	const params = useParams();
	const [ socialsOk, setSocialsOk ] = useState(false);
	const [ hasRequiredNft, setHasRequiredNft ] = useState(false);
	const [ order, setOrder ] = useState<any>();
	const [ participant, setParticipant ] = useState<Participant>();
	const [ tournament, setTournament ] = useState<Tournament>();
	const [ isVerifying, setIsVerifying ] = useState(false);
	const [ isNFTVerifying, setNFTIsVerifying ] = useState(false);
	const [ isPaying, setIsPaying ] = useState(false);
	const [ isRegistering, setIsRegistering ] = useState(false);
	const [ isDescriptionExpanded, setIsDescriptionExpanded ] = useState(false);
	const [ timeLeft, setTimeLeft ] = useState('');
	const [ participants, setParticipants ] = useState();
	const [ attempts, setAttempts ] = useState<attempts[]>([]);
	const isTMA = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

	useEffect(() => {
		const loadMyTournament = async () => {
			try {
				const data = await getTournament(params.id);
				setTournament(data);
				if (!data.collection_address) {
					setHasRequiredNft(true);
				}
				const participantResponse = await getParticipant(params.id);
				setParticipant(participantResponse);
				const list = await getLeaderboardByTourname(params.id as any, 'time');
				setParticipants(list);
				const attempData = await getAttempts(params.id as any);
				setAttempts(attempData.data);
				await handleVerifySocials();
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (!tournament) {
			loadMyTournament();
		}
	}, []);

	// Timer effect
	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			let targetTime: Date;

			if (tournament?.status === 'upcoming') {
				targetTime = new Date(tournament.start_at);
			} else if (tournament?.status === 'ongoing' && tournament.end_at) {
				targetTime = new Date(tournament.end_at);
			} else {
				return '';
			}

			const diff = targetTime.getTime() - now.getTime();
			if (diff <= 0) return '00:00:00';

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			if (days > 0) {
				return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			}
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		};

		setTimeLeft(calculateTimeLeft());
		const interval = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearInterval(interval);
	}, [tournament]);

	const handleOrderConfirmed = async () => {
		try {
			setOrder({});
			toast.success('Payid successfully');
			const stats = await getParticipant(params.id);
			setParticipant(stats);
			if (tournament?.status === statuses.ongoing) {
				handlePlay();
			}
		} catch (err) {
			toast.error((err as any).message);
		}
	};
  
	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
	};
  
	useOrderStatusPolling(order?.id,
		handleOrderConfirmed,
		handleOrderError,
	);

	const handlePayFee = async () => {
		setIsPaying(true);
		try {
			const network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(tournament?.network) ? 'evm' : tournament?.network;
			const connector = connectors[network];
			if (!connector.connected || !connector.access_token) {
				if (isTMA) {
					await connectors.ton.open();
				} else {
					setConnectWallet(true);
				}
				return;
			}
			const data = await connector.sendTransaction({
				token: tournament?.token,
				type: 'join_jackpot',
				network,
				tournament_id: tournament.id
			});
      
			setOrder({
				id: data.gameTransaction.id,
				tournament_id: tournament.id,
				type: 'join_jackpot'
			});

		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setIsPaying(false);
		}
	};

	const handleRegister = async () => {
		setIsRegistering(true);
		try {
			const network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(tournament?.network) ? 'evm' : tournament?.network;
			const connector = connectors[network];
			if (!connector.connected || !connector.access_token) {
				if (isTMA) {
					await connectors.ton.open();
				} else {
					setConnectWallet(true);
				}
				return;
			}
			const registered = await registerTournament(params.id as any, connector.address);
			if (!registered.ok) {
				toast.error(registered.error);
				return;
			}
			const data = await getTournament(params.id);
			setTournament(data);
			const stats = await getParticipant(params.id);
			setParticipant(stats);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setIsRegistering(false);
		}
	};

	const handleVerifyNft = async () => {
		setNFTIsVerifying(true);
		try {
			const network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(tournament?.network) ? 'evm' : tournament?.network;
			const connector = connectors[network];
			if (!connector.connected || !connector.access_token) {
				if (isTMA) {
					await connectors.ton.open();
				} else {
					setConnectWallet(true);
				}
				return;
			}
			const checked = await verifyNft(params.id as any, connector.address);
			setHasRequiredNft(checked);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setNFTIsVerifying(true);
		}
	};

	const handleVerifySocials = async () => {
		setIsVerifying(true);
		try {
			const ok = await socialVerify(params.id as any);
			setSocialsOk(ok);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setIsVerifying(false);
		}
	};

	const handlePlay = () => {
		if (tournament?.levels.length === 1) {
			navigate(`/game?tourname_id=${params.id}`);
		} else {
			navigate(`/tournaments/${tournament?.id}`);
		}
	};

	const handleGoBack = () => {
		navigate('/');
	};

	const handlePayAndPlay = async () => {
		if (tournament?.entry_amount > 0) {
			await handlePayFee();
		}
	};


	if (!tournament) {
		return <></>;
	}

	const typeInfo = typeConfig[tournament.type];
	const scheduleInfo = scheduleConfig[tournament.schedule];
	const TypeIcon = typeInfo.icon;
	const isRegistered = !!participant;
	const hasSocials = tournament.tasks.length > 0;
	const hasMoneyPrize = tournament?.prize_balance > 0;
	const hasNFTs = tournament.prizes.some((prize) => prize.nft !== null);

	const canRegister = !socialsOk || !hasRequiredNft;

	const maxDescriptionLength = 150;
	const isLongDescription = tournament.description.length > maxDescriptionLength;
	const displayDescription = isDescriptionExpanded || !isLongDescription
		? tournament.description
		: tournament.description.slice(0, maxDescriptionLength) + '...';

	// Status config
	const statusConfig = {
		upcoming: { icon: ClockIcon, label: 'Starts in', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' },
		ongoing: { icon: PlayIcon, label: 'Ends in', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', textColor: 'text-green-400' },
		completed: { icon: CheckCircleIcon, label: 'Tournament ended', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30', textColor: 'text-gray-400' },
	};
	const currentStatusConfig = statusConfig[tournament.status];
	const StatusIcon = currentStatusConfig.icon;

	// Game state checks
	const tournamentLink = `https://game.qr-mint.net/tournaments/${tournament.id}`;
	const handleCopyInvite = async () => {
		try {
			await copyToClipboard(tournamentLink);
			setInviteCopied(true);
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const renderRegister = () => {
		const hasEntryFee = (tournament.entry_amount && tournament.entry_amount > 0 || tournament.entry_tickets && tournament.entry_tickets > 0);
		if (hasEntryFee) {
			return (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
					<div className="flex items-center gap-3 mb-3">
						<Shield className="w-5 h-5 text-white-300" />
						<div>
							<p className="text-white font-semibold text-sm">{t('tournaments.view.entry.title')}</p>
							<p className="text-white-300 text-xs">{t('tournaments.view.entry.subtitle')}</p>
						</div>
					</div>
					<div className="flex flex-col gap-3 pt-3 border-t border-white/10">
						<div className="flex items-center justify-between">
							<span className="text-sm text-white/70">{t('tournaments.view.entry.entryFeeLabel')}</span>
							<span className="text-sm font-medium text-amber-400">
								{tournament?.entry_amount > 0 ? `${tournament?.entry_amount} ${tournament?.token.toUpperCase()}` : t('tournaments.view.entry.ticketAmount', { amount: tournament?.entry_tickets })}
							</span>
						</div>  
						<button
							onClick={tournament?.entry_amount > 0 ? handlePayFee : handleRegister}
							disabled={isPaying || isRegistering || canRegister}
							className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors text-white font-medium"
						>
							{isPaying ? (
								<>
									<LoaderIcon className="w-4 h-4" />
									{t('tournaments.view.proccesing')}
								</>
							) : (
								t('tournaments.view.entry.payButton')
							)}
						</button>          
					</div>
				</div>
			); 
		}
		return (

			<button
				onClick={handleRegister}
				disabled={isRegistering || canRegister}
				className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-4"
			>
				{isRegistering ? (
					<>
						<LoaderIcon className="w-4 h-4" />
						{t('tournaments.view.registering')}
					</>
				) : (
					<>
						<UserPlusIcon className="w-4 h-4" />
						{t('tournaments.view.register')}
					</>
				)}
			</button>

		);
	};

	return (
		<div className="flex flex-col gap-4 py-4">
			{order?.id && <PaymentProccesing t={t} />}
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<button
						onClick={handleGoBack}
						className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
					>
						<ArrowLeftIcon className="w-5 h-5 text-white" />
					</button>
					<div className="flex-1 min-w-0">
						<h1 className="text-xl font-bold text-white truncate">{tournament?.name}</h1>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
						<TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
						<span className="text-sm text-white/90">{typeInfo.label}</span>
					</div>

					<div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${scheduleInfo.bgColor}`}>
						{tournament?.schedule === 'special' && <SparkleIcon className="w-4 h-4 text-amber-400" />}
						{tournament?.schedule === 'season' && <StarIcon className="w-4 h-4 text-emerald-400" />}
						{tournament?.schedule === 'daily' && <Calendar1Icon className="w-4 h-4 text-blue-400" />}
						{tournament?.schedule === 'weekly' && <Calendar1Icon className="w-4 h-4 text-white-400" />}
						<span className={`text-sm ${scheduleInfo.textColor}`}>{scheduleInfo.label}</span>
					</div>

					<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
						<UsersIcon className="w-4 h-4 text-white/70" />
						<span className="text-sm text-white/90">
							{tournament?.players_count}
							{tournament?.player_limit && `/${tournament?.player_limit}`}
						</span>
					</div>

              
					<a
						href="/"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
					>
						<ExternalLinkIcon className="w-4 h-4 text-white/70" />
						<span className="text-sm text-white/90">{t('tournaments.view.rules')}</span>
					</a>
				</div>
			</div>

			{/* ===== STATUS & TIMER ===== */}
			<div className={`rounded-2xl ${currentStatusConfig.bgColor} border ${currentStatusConfig.borderColor} p-4`}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<StatusIcon className={`w-5 h-5 ${currentStatusConfig.textColor}`} />
						<span className={`font-medium ${currentStatusConfig.textColor}`}>{currentStatusConfig.label}</span>
					</div>
					{tournament?.status !== statuses.completed && timeLeft && (
						<div className="font-mono text-xl font-bold text-white">{timeLeft}</div>
					)}
				</div>
			</div>

			{/* ===== TYPE-SPECIFIC WARNINGS ===== */}
			{tournament?.type === types.single_attempt && isRegistered && (
				<div className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4">
					<div className="flex items-start gap-3">
						<AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
						<div>
							<h3 className="font-semibold text-red-400">{t('tournaments.view.singleAttempt.title')}</h3>
							<p className="text-sm text-white/70 mt-1">
								{t('tournaments.view.singleAttempt.info')}
							</p>
						</div>
					</div>
				</div>
			)}

			{tournament?.type === types.single_attempt && participant?.status === 'lose' && (
				<div className="rounded-2xl bg-red-500/20 border border-red-500/30 p-4">
					<div className="flex items-start gap-3">
						<SkullIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
						<div>
							<h3 className="font-semibold text-red-400">{t('tournaments.view.singleAttempt.eliminated')}</h3>
							<p className="text-sm text-white/70 mt-1">
								{t('tournaments.view.singleAttempt.description')}
							</p>
						</div>
					</div>
				</div>
			)}

			{tournament?.type === types.survival && isRegistered && (
				<div className="rounded-2xl bg-pink-500/20 border border-pink-500/30 p-4">
					<div className="flex items-start gap-3">
						<HeartIcon className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
						<div>
							<h3 className="font-semibold text-pink-400">{t('tournaments.view.survival.title')}</h3>
							<p className="text-sm text-white/70 mt-1">
								{t('tournaments.view.survival.subtitle')}
							</p>
							{participant?.best_time && (
								<p className="text-sm text-pink-400 mt-2">
									{t('tournaments.view.survival.time')}: {formatTime(participant?.best_time)}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{(hasMoneyPrize) && (
				<div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
					<div className="flex items-center gap-2 mb-4">
						<GiftIcon className="w-5 h-5 text-amber-400" />
						<h2 className="text-lg font-semibold text-white">{t('tournaments.view.prizePool')}</h2>
					</div>

					<div className="flex flex-col gap-4">
						{hasMoneyPrize && (
							<div className="flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
								<span className="text-3xl font-bold text-amber-400">
									{tournament?.prize_balance} {tournament?.prize_token.toUpperCase()}
								</span>
							</div>
						)}
						<div className="flex items-center gap-1.5 text-white-200 text-sm">
							<Trophy className="w-4 h-4 text-yellow-400" />
							<span>{t('tournaments.view.topPlayersReceivePrizes', { count: tournament.prizes.length })}</span>
						</div>
					</div>
				</div>
			)}

			{tournament.dex_id && <DexSection t={t} tournament={tournament} />}

			{hasNFTs && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
					<div className="flex items-center gap-2 mb-3">
						<Sparkles className="w-4 h-4 text-yellow-400" />
						<p className="text-white font-semibold text-sm">{t('tournaments.view.nftPrizes')}</p>
					</div>
					<div className="flex gap-3 overflow-x-auto pb-2">
						{tournament?.prizes?.filter((pr) => pr.nft && Object.keys(pr.nft).length > 0).map((prize, index) => (
							<div key={index} className="flex-shrink-0 w-24">
								<div className="w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-yellow-400/30 mb-1.5">
									<img src={prize.nft.image} alt={prize.nft.name} className="w-full h-full object-cover" />
								</div>
								<p className="text-white text-xs font-medium text-center truncate">{prize.nft.name}</p>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
				<div className="flex items-center gap-2 mb-3">
					<FileTextIcon className="w-5 h-5 text-white/70" />
					<h2 className="text-lg font-semibold text-white">{t('tournaments.view.description.label')}</h2>
				</div>

				<p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{displayDescription}</p>

				{isLongDescription && (
					<button
						onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
						className="flex items-center gap-1 mt-3 text-sm text-white-400 hover:text-white-300 transition-colors"
					>
						{isDescriptionExpanded ? (
							<>
								<ChevronDownIcon className="w-4 h-4" />
								{t('tournaments.view.description.showLess')}
							</>
						) : (
							<>
								<ChevronDownIcon className="w-4 h-4" />
								{t('tournaments.view.description.showMore')}
							</>
						)}
					</button>
				)}
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
				<div className="flex items-center gap-2 mb-2">
					<Share2 className="w-4 h-4 text-white-300" />
					<p className="text-white font-semibold text-sm">{t('tournaments.view.inviter.title')}</p>
				</div>
				<p className="text-white-300 text-xs mb-3">
					{t('tournaments.view.inviter.subtitle')}
				</p>
				<div className="flex items-center gap-2">
					<div className="flex-1 bg-white/5 rounded-lg px-3 py-2.5 border border-white/10 overflow-hidden">
						<p className="text-white-200 text-xs font-mono truncate">{tournamentLink}</p>
					</div>
					<button
						onClick={handleCopyInvite}
						className={`flex-shrink-0 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
							inviteCopied
								? 'bg-green-500/20 text-green-300'
								: 'bg-amber-600 hover:bg-amber-700 text-white'
						}`}
					>
						{inviteCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
						{inviteCopied ? t('tournaments.view.inviter.copied') : t('tournaments.view.inviter.copy')}
					</button>
				</div>
			</div>

			{tournament?.type === types.leaderboard && (
				<div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<TrophyIcon className="w-5 h-5 text-yellow-400" />
							<h2 className="text-lg font-semibold text-white">{t('tournaments.view.leaderboardLabel')}</h2>
						</div>
						<button
							onClick={() => navigate(`/tournaments/${tournament.id}/participants`)}
							className="text-sm text-white-400 hover:text-white-300 transition-colors"
						>
							{t('tournaments.view.viewAll')}
						</button>
					</div>

					<div className="flex flex-col gap-2">
						{participants?.slice(0, 3).map((participant: any) => {
							const isCurrentUser = participant.id === participant?.id;
							return (
								<div
									key={participant.id}
									className={`flex items-center gap-3 p-3 rounded-xl ${
										isCurrentUser ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'
									}`}
								>
									{/* <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      entry.rank === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                      entry.rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                      entry.rank === 3 ? 'bg-amber-600/30 text-amber-500' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {entry.rank}
                    </div> */}
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
										{participant.user.username.charAt(0).toUpperCase()}
									</div>
									<span className={`flex-1 text-sm font-medium truncate ${isCurrentUser ? 'text-white-300' : 'text-white'}`}>
										{participant.user.username}
										{isCurrentUser && <span className="text-white-400 ml-1">(You)</span>}
									</span>
									<span className="text-sm font-bold text-amber-400">{formatTime(participant.best_time)}</span>
								</div>
							);
						})}

						{participants?.find((participant, index) => participant.id === participant?.id && (index + 1) > 3) && (
							<>
								<div className="flex items-center justify-center py-1">
									<span className="text-white/30 text-xs">...</span>
								</div>
								{(() => {
									const currentUser = participants?.find(participant => participant.id === participant?.id)!;
									return (
										<div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
											{/* <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-white/10 text-white/60">
                            {currentUser}
                          </div> */}
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
												{currentUser.user.username.charAt(0).toUpperCase()}
											</div>
											<span className="flex-1 text-sm font-medium truncate text-white-300">
												{currentUser.user.username}
												<span className="text-white-400 ml-1">(You)</span>
											</span>
											{/* <span className="text-sm font-bold text-amber-400">{currentUser.score.toLocaleString()}</span> */}
										</div>
									);
								})()}
							</>
						)}
					</div>

					<button
						onClick={() => navigate(`/tournaments/${tournament.id}/participants`)}
						className="w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/70 text-sm font-medium"
					>
						{t('tournaments.view.leaderboardLink')}
					</button>
				</div>
			)}

			{hasSocials && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
					<div className="flex items-center justify-between mb-3">
						<p className="text-white font-semibold text-sm">{t('tournaments.view.participationConditions')}</p>
					</div>

					<div className="space-y-2 mb-3">
						{tournament.tasks.map((task, i) => (
							<a
								key={i}
								href={task.url}
								target="_blank"
								rel="noopener noreferrer"
								className={'flex items-center gap-3 p-3 rounded-lg transition-all "bg-white/5 hover:bg-white/10 border border-white/10"'}
							>
								<div className={`w-8 h-8 rounded-lg ${getSocialColor(task.social)} flex items-center justify-center text-white text-xs font-bold`}>
									{getSocialIcon(task.social)}
								</div>
								<div className="flex-1">
									<p className="text-white text-sm font-medium">{t('tournaments.view.subscribedTo', { username: task.username })}</p>
									<p className="text-white-300 text-xs">{task.social === 'telegram' ? t('tournaments.view.telegramChannel') : task.social === 'twitter' ? 'Twitter' : 'Discord'}</p>
								</div>
								<ExternalLinkIcon className="w-4 h-4 text-white-300" />
							</a>
						))}
					</div>

					<button
						onClick={handleVerifySocials}
						disabled={isVerifying || socialsOk}
						className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
							socialsOk
								? 'bg-green-500/20 text-green-300 cursor-default'
								: 'bg-amber-600 hover:bg-amber-700 text-white'
						}`}
					>
						{isVerifying ? t('tournaments.view.checking') : socialsOk ? t('tournaments.view.allTasksCompleted') : t('tournaments.view.checkTasks')}
					</button>
				</div>
			)}

			{tournament.collection_address && (
				<div className={`backdrop-blur-md rounded-xl border p-4 mb-4 ${
					hasRequiredNft 
						? 'bg-green-500/10 border-green-400/30' 
						: 'bg-white/10 border-white/20'
				}`}>
					<div className="flex items-start gap-3 mb-3">
						<div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
							hasRequiredNft ? 'bg-green-500/20' : 'bg-amber-500/20'
						}`}>
							<Shield className={`w-5 h-5 ${hasRequiredNft ? 'text-green-400' : 'text-white-300'}`} />
						</div>
						<div className="flex-1">
							<p className="text-white font-semibold text-sm">{t('tournaments.view.nftRequired')}</p>
							<p className="text-white-300 text-xs mt-0.5">
								{t('tournaments.view.nftRequiredInfo')}
							</p>
						</div>
						{hasRequiredNft && (
							<div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
								<Check className="w-4 h-4 text-white" />
							</div>
						)}
					</div>

					<div className="bg-white/5 rounded-lg p-3 mb-3">
						<p className="text-white-300 text-xs mb-1">{t('tournaments.view.collection')}</p>
						<p className="text-white font-semibold text-sm">{tournament.collection.metadata.name}</p>
						<p className="text-white-400 font-mono text-xs mt-1 truncate">{tournament?.collection_address}</p>
					</div>

					{!hasRequiredNft ? (
						<>
							<div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3 mb-3">
								<p className="text-yellow-300 text-xs leading-relaxed">
									{t('tournaments.view.collectionInfo')}
								</p>
							</div>
							<button
								onClick={handleVerifyNft}
								disabled={isNFTVerifying}
								className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white font-semibold py-3 rounded-xl transition-all"
							>
								{isNFTVerifying ? t('tournaments.view.checkingWallet') : t('tournaments.view.checkNFT')}
							</button>
						</>
					) : (
						<div className="flex items-center gap-2 text-green-400 text-sm">
							<Check className="w-4 h-4" />
							<span>{t('tournaments.view.nftNotFound')}</span>
						</div>
					)}
				</div>
			)}

			{/* ===== ENTRY REQUIREMENTS ===== */}
			{tournament?.status !== statuses.completed && !isRegistered && (
				renderRegister()
			)}

			{/* ===== PLAY SECTION (after registration) ===== */}
			{isRegistered && tournament?.status === statuses.ongoing && (
				<div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
					<div className="flex items-center gap-2 mb-4">
						<GamepadIcon className="w-5 h-5 text-green-400" />
						<h2 className="text-lg font-semibold text-white">{t('tournaments.view.play')}</h2>
					</div>

					{/* Leaderboard type - Show levels progress and play button */}
          
					<div className="flex flex-col gap-4">
						{tournament?.entry_mode === 'per_attempt' && (
							<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 my-4">
								<div className="flex items-center justify-between mb-2">
									<p className="text-white font-semibold text-sm">{t('tournaments.view.perAttempt.title')}</p>
									<span className="px-2 py-1 rounded-lg text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
										{t('tournaments.view.perAttempt.text')}
									</span>
								</div>
								<p className="text-white-300 text-xs mb-2">
									{t('tournaments.view.perAttempt.info')}
								</p>
							</div>
						)}
      
						{tournament?.entry_mode === 'per_attempt' && !participant?.allow ? (
							<button
								onClick={handlePayAndPlay}
								disabled={isPaying || isRegistering || canRegister}
								className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-yellow-500/50 disabled:to-orange-500/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
							>
								<Play className="w-5 h-5" />
								{t('tournaments.view.playAgain')} ({tournament.entry_amount || tournament.entry_tickets})
							</button>
						) : (
							<button
								onClick={handlePlay}
								className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all text-white font-semibold"
							>
								<PlayIcon className="w-5 h-5" />
								{t('tournaments.view.play')}
							</button>
						)}
					</div>
          
				</div>
			)}

			{/* ===== REGISTERED STATUS (for upcoming) ===== */}
			{isRegistered && tournament?.status === statuses.upcoming && (
				<div className="rounded-2xl bg-green-500/20 border border-green-500/30 p-4">
					<div className="flex items-center justify-center gap-2 text-green-400">
						<CheckCircleIcon className="w-5 h-5" />
						<span className="font-medium">{t('tournaments.view.notRegistered')}</span>
					</div>
					<p className="text-sm text-white/60 text-center mt-2">
						{t('tournaments.view.comeBack')}
					</p>
				</div>
			)}
		</div>
	);
}
