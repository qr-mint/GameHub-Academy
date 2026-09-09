import { getTournament } from '@/api/game/tournaments';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getLeaderboardByTourname } from '@/api/game/leadboard';
import { useTranslation } from 'react-i18next';

export const MyTournamentUsers = () => {
	const { t } = useTranslation();
	const [ tournament, setTournament ] = useState<any>();
	const [ list, setList ] = useState<any[]>([]);
	const params = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const loadMyTournament = async () => {
			try {
				const data = await getTournament(params.id);
				setTournament(data);
				const list = await getLeaderboardByTourname(params.id as any, 'time');
				setList(list);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (!tournament) {
			loadMyTournament();
		}
	}, []);

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
			</div>
			{/* Players leaderboard */}
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<h3 className="text-white font-semibold mb-3">{t('tournaments.my.users.title')}</h3>

				<div className="flex items-center gap-2 text-white-300 text-xs font-semibold mb-2 px-2">
					<span className="w-8">#</span>
					<span className="flex-1">{t('tournaments.my.users.player')}</span>
					<span className="w-16 text-right">{t('tournaments.my.users.time')}</span>
					<span className="w-16 text-right">{t('tournaments.my.users.deaths')}</span>
				</div>

				<div className="space-y-1.5">
					{list?.map((player) => (
						<div
							key={player.rank}
							className={`flex items-center gap-2 rounded-lg px-2 py-2.5 ${
								player.rank <= 3 ? 'bg-white/5' : ''
							}`}
						>
							<span className={`w-8 text-center font-bold text-sm ${
								player.rank === 1 ? 'text-yellow-400' :
									player.rank === 2 ? 'text-gray-300' :
										player.rank === 3 ? 'text-orange-400' :
											'text-white-300'
							}`}>
								{player.rank}
							</span>
							<span className="flex-1 text-white font-medium text-sm truncate">{player.name}</span>
							<span className="w-16 text-right text-green-400 font-mono text-sm">{player.time}</span>
							<span className="w-16 text-right text-red-400 font-mono text-sm">{player.deaths}</span>
						</div>
					))}
				</div>

				{tournament.players_count > list?.length && (
					<p className="text-white-400 text-xs text-center mt-3">
						{t('tournaments.my.users.deaths', { count: tournament.players_count - list.length })}
					</p>
				)}
			</div>
		</div>
	);
};

