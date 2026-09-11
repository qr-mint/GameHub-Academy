
import { useEffect, useState } from 'react';
import { Modal } from '../modal';
import { X, Crown, Clock, Gift, Star } from 'lucide-react';
import { getTournament } from '@/api/game/tournaments';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { EventBus } from '@/game/EventBus';
import { formatTime } from '@/utils/date';

interface ModalProps {
  onClose: () => void;
  data: any,
  onBackMenu: () => void;
  t: (key: string, options?: any) => string;
};

// const statusLabels: Record<string, string> = {
// 	pending: 'pending',
// 	claimed: 'claimed',
// 	delayed: 'delayed',
// };

export function TournamentWinModal ({ onClose, data, onBackMenu, t }: ModalProps) {
	const navigate = useNavigate();
	const [ tournament, setTournament ] = useState<any>();
	const [ result, setResult ] = useState<any>();

	useEffect(() => {
		const loadTournament = async () => {
			try {
				const tm = await getTournament(data.tournament_id);
				setTournament(tm);
				setResult({});
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadTournament();
	}, []);
	
	const handleNext = () => {
		navigate(`/game?tournament_id=${data.tournament_id}`);
		EventBus.emit('level:next');
		onClose();
	};

	const handleClose = () => {
		navigate('/');
		onClose();
	};

	const renderButton = () => {
		if (tournament?.levels.length === 1) {
			return (
				<button
					onClick={onBackMenu}
					className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-amber font-bold rounded-xl transition-colors text-sm tracking-wide active:scale-[0.98]"
				>
					{t('gameModal.tournamentWin.buttons.mainMenu')}
				</button>
			);
		} else {
			return (
				<div className="flex flex-col gap-2.5">
					{result?.next_level_id && (
						<button
							onClick={handleNext}
							className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-amber font-bold rounded-xl transition-colors text-sm tracking-wide active:scale-[0.98]"
						>
							{t('gameModal.win.buttons.nextLevel')}
						</button>
					)}
					<div className="grid grid-cols-1 gap-2.5">
						{/* <button
              onClick={handleRepeat}
              className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
            >
              {t('gameModal.win.buttons.replay')}
            </button> */}
						<button
							onClick={onBackMenu}
							className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
						>
							{t('gameModal.win.buttons.menu')}
						</button>
					</div>
				</div>
			);
		}
	};
	const renderTitle = () => {
		if (result?.rank === 1 && !result?.next_level_id) {
			return (
				<h2 className="text-2xl font-bold text-amber-900">{t('gameModal.tournamentWin.championTitle')}</h2>
			);
		} else {
			return (
				<h2 className="text-2xl font-bold text-amber-900">{t('gameModal.tournamentWin.nextTitle')}</h2>
			);
		}
	};
	return (
		<Modal isOpen={true} onClose={handleClose}>
			<div className="bg-white/95 backdrop-blur-xl border-2 border-amber-300 shadow-2xl rounded-2xl">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
								<Crown className="w-5 h-5 text-amber-700" />
							</div>
							<div>
								{renderTitle()}
								<span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
									<Star className="w-3 h-3" />
									{t('gameModal.tournamentWin.place', { place: result?.rank })}
								</span>
							</div>
						</div>
						<button
							onClick={onClose}
							className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-amber-700" />
						</button>
					</div>

					{/* Win message */}
					{/* <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
						<p className="text-sm text-green-700">{data.your_win_text}</p>
					</div> */}

					{/* Time stat */}
					<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3">
						<Clock className="w-4 h-4 text-amber-500" />
						<div>
							<p className="text-xs text-amber-400">{t('gameModal.tournamentWin.winningTime')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">{formatTime(data.current_time)}</p>
						</div>
					</div>
					{renderButton()}
				</div>
			</div>
		</Modal>
	);
}
