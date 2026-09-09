import { ArrowLeft, Coins, Play, Sparkles, Trophy, Users, Wallet, Zap } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import * as date from '@/utils/date';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { ConnectContext } from '@/components/Connect/provider';
import { DexSection } from '@/components/DexSection';
import { getMyTournament, giveAwayPrizes, publicTournament } from '@/api/game/tournaments';
import { useSettingsStore } from '@/store/settings/settings';

enum tournamentStatuses {
  created = 'created',
  upcoming = 'upcoming',
  completed = 'completed'
}

export const MyTournament = () => {
	const { setConnectWallet } = useSettingsStore();
	const connectors = useContext(ConnectContext);
	const { t } = useTranslation();
	const [ tournament, setTournament ] = useState<any>();
	// const [ list, setList ] = useState<any[]>([]);
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const loadMyTournament = async () => {
			try {
				const data = await getMyTournament(params.id);
				setTournament(data);
				// const list = await getLeaderboardByTourname(params.id as any, 'time');
				// setList(list);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (!tournament) {
			loadMyTournament();
		}
	}, []);

	const handleCopyContract = async () => {
		try {
			await copyToClipboard(tournament.address);
			toast.success('Copied was successfully');
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const handlePublic = async () => {
		try {
			await publicTournament(params.id as any);
			toast.success('The tournament has been published');
			const data = await getMyTournament(params.id);
			setTournament(data);
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const handleGiveAwayPrizes = async () => {
		try {
			let network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(tournament?.network) ? 'evm' : tournament?.network;
			const connector = connectors[network];
			if (!connector.connected) {
				setConnectWallet(true);
			}
			await giveAwayPrizes(params.id as any, connector.access_token);
			toast.success('Prizes are distributed to participants');
			const data = await getMyTournament(params.id);
			setTournament(data);
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	if (!tournament) {
		return <></>;
	}
  
	return (
		<div className="flex-1 max-w-2xl mx-auto w-full pb-24">
			<div className="flex items-center gap-3 mb-6">
				<button
					onClick={() => navigate('/')}
					className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
				>
					<ArrowLeft className="w-5 h-5 text-white" />
				</button>
				{tournament.start_at && (
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
						<p className="text-white-200 text-sm">
							{date.onlyDate(tournament.start_at)} - {date.onlyDate(tournament.end_at)} | {tournament.status}
						</p>
					</div>
				)}
			</div>

			{/* Pool card */}
			
		
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
				<div className="flex items-center gap-2 mb-3">
					<Coins className="w-4 h-4 text-yellow-300" />
					<p className="text-white font-semibold text-sm">{t('tournaments.my.balance')}</p>
				</div>
				<div className="space-y-2">
					{Object.keys(tournament.accounts).map((key) => (
						<div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5">
							<div className="flex items-center gap-2">
								<span className="text-white-200 text-sm">{t(`tournaments.my.${tournament.accounts[key].is}`)}</span>
								<span className="px-2 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 text-xs font-bold">
									{key}
								</span>
							</div>
							<span className="text-white font-bold text-sm">
								{tournament.accounts[key].balance} {key}
							</span>
						</div>
					))}
				</div>
			</div>
		

			{/* Smart Contract Address */}
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
				<div className="flex items-center justify-between mb-2">
					<p className="text-white font-semibold text-sm">{t('tournaments.my.smartContact')}</p>
					<span className="text-white-300 text-xs">{t('tournaments.my.prizeReplenishment')}</span>
				</div>
				<div
					onClick={handleCopyContract}
					className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-all group"
				>
					<Wallet className="w-4 h-4 text-white-300 flex-shrink-0" />
					<span className="text-white-200 font-mono text-xs truncate flex-1">{tournament.address}</span>
					<span className="text-white-400 text-xs font-semibold flex-shrink-0 group-hover:text-white transition-colors">
						{/* {copiedContract ? "Скопировано!" : "Копировать"} */}
					</span>
				</div>
				<p className="text-white-400 text-xs mt-2">{t('tournaments.my.prizeInfo', { coin: tournament.prize_token.toUpperCase() })}</p>
			</div>

			{/* Stats grid */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<button onClick={() => navigate(`/tournaments/${tournament.id}/participants`)} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 text-center hover:bg-white/15 transition-all">
					<Users className="w-5 h-5 text-white-300 mx-auto mb-1" />
					<p className="text-xl font-bold text-white">{tournament.players_count}/{tournament.player_limit}</p>
					<p className="text-white-300 text-xs">{t('tournaments.my.players')}</p>
				</button>
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 text-center">
					<Trophy className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
					<p className="text-xl font-bold text-white">{tournament.winners_count}</p>
					<p className="text-white-300 text-xs">{t('tournaments.my.winners')}</p>
				</div>
			</div>
			{tournament.dex_id && <DexSection t={t} manage={true} tournament={tournament} />}
			{/* Action buttons based on status */}
			<div className="space-y-3">
				{tournament.status === tournamentStatuses.created && (
					<button
						onClick={handlePublic}
						className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
					>
						<Play className="w-5 h-5" />
						{t('tournaments.my.public')}
					</button>
				)}

				{tournament.status === tournamentStatuses.upcoming && (
					<button
						onClick={handlePublic}
						className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
					>
						<Zap className="w-5 h-5" />
						{t('tournaments.my.play')}
					</button>
				)}

				{tournament.status === tournamentStatuses.completed && (
					<>
						<button
							onClick={handleGiveAwayPrizes}
							className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
						>
							<Coins className="w-5 h-5" />
							{t('tournaments.my.giveAwayPrize', { coin: tournament.prize_token.toUpperCase() })}
						</button>
						<div className="bg-yellow-400/10 backdrop-blur-md rounded-xl border border-yellow-400/30 p-4">
							<div className="flex items-start gap-3">
								<Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-white font-semibold text-sm">{t('tournaments.my.nftPrizeTitle')}</p>
									<p className="text-white-300 text-xs mt-1">{t('tournaments.my.nftPrizeSubtitle', { coin: tournament.prize_token })}</p>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
