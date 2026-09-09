import { getMyTournaments, getTournaments } from '@/api/game/tournaments';
import { Crown, Plus, Sparkles, Trophy, Users, Zap, } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { getNFTsByNetwork } from '@/api/game/partners';

enum tabs {
  all = 'all',
  my = 'my'
}

const TIMES = 1000 * 3600 * 24;

function IconPreview ({ icon, size = 'w-6 h-6' }: { icon: string; size?: string }) {
	switch (icon) {
	case 'trophy': return <Trophy className={size} />;
	case 'zap': return <Zap className={size} />;
	case 'crown': return <Crown className={size} />;
	case 'star': return <Sparkles className={size} />;
	case 'sparkles': return <Sparkles className={size} />;
	case 'shield': return <Trophy className={size} />;
	default: return icon;
	}
}

export function TournamentsPage ({ t }: { t: (any: string, options?: any) => string }) {
	// const {} = useTimer();
	const [ myTournaments, setMyTournaments ] = useState([]);
	const [ tab, setTab ] = useState(tabs.all);
	const [ tournaments, setTournaments ] = useState([]);
	const [ nfts, setNFTs ] = useState<any>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const loadTournaments = async () => {
			try {
				const nfts = await getNFTsByNetwork();
				setNFTs(nfts);
				if (tab === tabs.all) {
					const data = await getTournaments();
					setTournaments(data);
				} else if (tab === tabs.my) {
					const myDate = await getMyTournaments();
					setMyTournaments(myDate);
				}
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadTournaments();
	}, [tab]);

	const onCreateTournament = () => {
		navigate('/tournaments/create');
	};

	const selectMyTournament = (tournament: any) => {
		navigate(`/tournaments/my/${tournament.id}`);
	};

	const hasNFT = nfts.length > 0;

	return (
		<div className="flex-1 max-w-2xl mx-auto w-full">
			<div className="flex items-center gap-3 mb-6">
				<div>
					<h1 className="text-3xl md:text-4xl font-bold text-white">{t('tournaments.title')}</h1>
				</div>
				{hasNFT && (
					<button
						onClick={onCreateTournament}
						className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 text-sm"
					>
						<Plus className="w-4 h-4" />
						{t('tournaments.buttonCreate')}
					</button>
				)}
			</div>
			{/* Tabs */}
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => setTab(tabs.all)}
					className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm ${
						tab === 'all'
							? 'bg-amber-600 text-white shadow-lg'
							: 'bg-white/10 text-white-200 hover:bg-white/20'
					}`}
				>
					{t('tournaments.allTournaments')}
				</button>
				{hasNFT && (
					<button
						onClick={() => setTab(tabs.my)}
						className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm ${
							tab === 'my'
								? 'bg-amber-600 text-white shadow-lg'
								: 'bg-white/10 text-white-200 hover:bg-white/20'
						}`}
					>
						{t('tournaments.myTournaments')}
					</button>
				)}
			</div>
			{tab === tabs.all && (
				<div className="space-y-3">
					{tournaments.map((tournament: any) => (
						<div
							key={tournament.id}
							className="group relative overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-[1.02] rounded-xl"
							onClick={() => navigate(`/tournaments/${tournament.id}`)}
						>
							<div className={`absolute inset-0 bg-gradient-to-br ${tournament.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
            
							<div className="relative p-4">
								<div className="flex items-start gap-3 mb-3">
									<div className="text-3xl">{<IconPreview icon={tournament.icon} />}</div>
									<div className="flex-1">
										<h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
										<p className="text-white-100 text-sm leading-relaxed">{tournament.description}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2 mb-3">
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
										<p className="text-white-200 text-xs mb-0.5">{t('tournaments.prize')}</p>
										<p className="text-white font-bold text-sm">{JSON.stringify(tournament.prize)}</p>
									</div>
									<div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
										<p className="text-white-200 text-xs mb-0.5">{t('tournaments.entryAmount')}</p>
										<p className="text-yellow-300 font-bold text-sm">{tournament.entry_fee}</p>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-1 text-white-200">
										<Users className="w-4 h-4" />
										<span>{t('tournaments.players_count', { amount: tournament.players_count })}</span>
									</div>
									<div className="text-white font-semibold">
                  ⏱ {tournament.status === 'ongoing' ? tournament.end_at : tournament.start_at}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			{tab === tabs.my && (
				<div className="space-y-3">
					{myTournaments.length === 0 ? (
						<div className="text-center py-12">
							<Trophy className="w-12 h-12 text-white-400 mx-auto mb-3 opacity-50" />
							<p className="text-white-200 text-lg font-semibold">{t('tournaments.empty.subtitle1')}</p>
							<p className="text-white-300 text-sm mt-1">{t('tournaments.empty.subtitle2')}</p>
						</div>
					) : (
						myTournaments.map((tournament: any) => {
							const time = tournament.status === 'ongoing'
								? new Date(tournament.start_at).getTime() - Date.now()
								: new Date(tournament.end_at).getTime() - Date.now();
							const day = Math.floor(time / TIMES);
							const hours = Math.floor((time % TIMES) / 3600000);
							const minutes = Math.floor(((time % TIMES) % 3600000) / 60000);
							let timeLeft;
							if (day > 0) {
								timeLeft = `${day}d ${hours}h`;
							} else if (day === 0) {
								timeLeft = `${hours}h ${minutes}m`;
							} else {
								timeLeft = tournament.status;
							}
							return (
								<div
									key={tournament.id}
									onClick={() => selectMyTournament(tournament)}
									className="group relative overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02] rounded-xl"
								>
									<div className={`absolute inset-0 bg-gradient-to-br ${tournament.gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
									<div className="relative p-4">
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-lg font-bold text-white">{tournament.name}</h3>
											<span
												className={`px-2 py-1 rounded-lg text-xs font-bold ${
													tournament.status === 'ongoing'
														? 'bg-green-500/20 text-green-300 border border-green-400/30'
														: 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
												}`}
											>
												{tournament.status}
											</span>
										</div>

										<div className="grid grid-cols-3 gap-2 mb-2">
											<div className="bg-white/10 rounded-lg p-2 text-center">
												<p className="text-white-200 text-xs">{t('tournaments.pool')}</p>
												<p className="text-yellow-300 font-bold text-sm">{tournament.pool} {tournament.token}</p>
											</div>
											<div className="bg-white/10 rounded-lg p-2 text-center">
												<p className="text-white-200 text-xs">{t('tournaments.players')}</p>
												<p className="text-white font-bold text-sm">{tournament.players_count}/{tournament.player_limit}</p>
											</div>
											<div className="bg-white/10 rounded-lg p-2 text-center">
												<p className="text-white-200 text-xs">{t('tournaments.time')}</p>
												<p className="text-white font-bold text-sm">{timeLeft}</p>
											</div>
										</div>

										{/* {tournament.nftPrizes > 0 && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span className="text-yellow-300 text-xs font-semibold">{tournament.nftPrizes} NFT в призах</span>
                      </div>
                    )} */}
									</div>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}