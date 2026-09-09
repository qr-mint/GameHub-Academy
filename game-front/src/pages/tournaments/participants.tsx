import { getLeaderboardByTourname } from '@/api/game/leadboard';
import { getTournament } from '@/api/game/tournaments';
import { useAuthStore } from '@/store/auth';
import { formatTime } from '@/utils/date';
import { ArrowLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


export const Participants = () => {
	const [ participants, setList ] = useState();
	const { user } = useAuthStore();
	const params = useParams();
	const [ tournament, setTournament ] = useState<any>();
	const navigate = useNavigate();
	const handleGoBack = () => {
		navigate(`/tournaments/${params.id}`);
	};

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

	return (
		<div className="flex flex-col gap-4 py-4">
			<div className="flex items-center gap-3">
				<button
					onClick={handleGoBack}
					className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
				>
					<ArrowLeftIcon className="w-5 h-5" />
				</button>
				<div>
					<h1 className="text-xl font-bold text-white">Leaderboard</h1>
					<p className="text-sm text-white/60">{tournament?.name}</p>
				</div>
			</div>
			{/* Full Leaderboard */}
			<div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
				<div className="flex flex-col gap-2">
					{participants?.map((participant: any) => {
						const isCurrentUser = participant.user.id === user.id;
						return (
							<div
								key={participant.id}
								className={`flex items-center gap-3 p-3 rounded-xl ${
									isCurrentUser
										? 'bg-amber-500/20 border border-amber-500/30'
										: 'bg-white/5'
								}`}
							>
								{/* <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      participant.rank === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                      participant.rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                      participant.rank === 3 ? 'bg-amber-600/30 text-amber-500' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {participant.rank}
                    </div> */}

								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
									{participant.user.username.charAt(0).toUpperCase()}
								</div>

								<span className={`flex-1 text-sm font-medium truncate ${
									isCurrentUser ? 'text-white-300' : 'text-white'
								}`}>
									{participant.user.username}
									{isCurrentUser && <span className="text-white-400 ml-1">(You)</span>}
								</span>

								<span className="text-sm font-bold text-amber-400">
									{formatTime(participant.best_time)}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};