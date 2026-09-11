import { Clock, X, Swords, Hash, Timer, AlertTriangle } from 'lucide-react';

import { Modal } from '../modal';
import { toast } from 'react-toastify';
import { useContext, useEffect, useState } from 'react';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { useNavigate } from 'react-router-dom';
import { ConnectContext } from '@/components/Connect/provider';
import { getParticipant } from '@/api/game/tournaments';
import { EventBus } from '@/game/EventBus';
import { formatTime } from '@/utils/date';
interface ModalProps {
  onClose: () => void;
  data: any,
  onBackMenu: () => void;
  t: (key: string) => string;
};

export const TournamentLoseModal = ({ onClose, data, onBackMenu, t }: ModalProps) => {
	const [ result, setResult ] = useState<any>();
	const [ participantAllow, setParticipantAllow ] = useState<boolean | null>(null);
	const navigate = useNavigate();
	const [ order, setOrder ] = useState<any>({});
	const connectors = useContext(ConnectContext);

	useEffect(() => {
		const loadTournament = async () => {
			try {
				const [ resultData, participantData ] = await Promise.all([
					{},
					getParticipant(data.tournament_id)
				]);
				setResult(resultData.data);
				setParticipantAllow(participantData.allow);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadTournament();
	}, []);

	const handleClose = () => {
		console.log(result.tournament);
		if (result.tournament.entry_mode === 'per_attempt') {
			navigate('/');
		} else {
			onClose();
		}
	};

	const handleOrderConfirmed = async () => {
		try {
			// Refresh participant allow status after payment
			const participantData = await getParticipant(data.tournament_id);
			setParticipantAllow(participantData.allow);
      
			setOrder({});
			if (participantData.allow) {
				EventBus.emit('level:replay');
				onClose();
			}
		} catch (err) {
			toast.error((err as any).message);
		}
	};
  
	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
	};
  
	useOrderStatusPolling(order.id,
		handleOrderConfirmed,
		handleOrderError,
	);

  
	const handlePlayAgain = async () => {
		const tournameId = data.tournament_id;
		if (result.tournament.entry_mode === 'per_attempt' && !participantAllow) {
			if (!connectors.ton.connected) {
				await connectors.ton.connect();
				return;
			}
			try {
				console.log(data, 'data');
				const paymentResponse = await connectors.ton.sendTransaction({
					token: data.tournament.token,
					type: 'join_jackpot',
					network: 'ton',
					tournament_id: data.tournament_id,
				});
          
				setOrder({
					id: paymentResponse.gameTransaction.id,
					tournament_id: tournameId,
				});
			} catch (err) {
				toast.error((err as any).message);
			}
		} else {
			EventBus.emit('level:replay');
			onClose();
		}
	};

	const renderResult = () => {
		if (!result) {
			return <></>;
		} else if (result.tournament.type === 'leaderboard') {
			return (
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
					<Timer className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
					<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.tournamentLose.best')}</p>
					<p className="text-sm font-bold text-amber-900 font-mono">{result.better_result ? formatTime(result.better_result.time) : '-'}</p>
				</div>
			);
		} else if (result.tournament.type === 'survival') {
			return (
				<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
					<Timer className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
					<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.tournamentLose.best')}</p>
					<p className="text-sm font-bold text-amber-900 font-mono">{result.better_result ? result.better_result.scores : '-'}</p>
				</div>
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
								<Swords className="w-5 h-5 text-amber-700" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-amber-900">{t('gameModal.tournamentLose.title')}</h2>
								<span className="text-xs text-amber-400">{t('gameModal.tournamentLose.subtitle')}</span>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
							aria-label="Close"
						>
							<X className="w-5 h-5 text-amber-700" />
						</button>
					</div>

					{/* Message */}
					{/* <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-red-700">{data.your_lost_text}</p>
          </div> */}

					{/* Stats */}
					<div className="grid grid-cols-3 gap-3 mb-5">
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
							<Clock className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
							<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.tournamentLose.yourTime')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">{formatTime(data.current_time)}</p>
						</div>
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
							<Hash className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
							<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.tournamentLose.position')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">#{result?.rank}</p>
						</div>
						{renderResult()}
					</div>

					{/* Payment Required Warning for per_attempt mode */}
					{result?.tournament?.entry_mode === 'per_attempt' && !participantAllow && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-semibold text-yellow-800">{t('gameModal.tournamentLose.paymentRequired.title')}</p>
									<p className="text-xs text-yellow-700 mt-1">
										{t('gameModal.tournamentLose.paymentRequired.info')}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Actions */}
					{!!order.id && (
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-center gap-3">
							<div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
							<div>
								<p className="text-sm font-medium text-amber-900">{t('gameModal.tournamentLose.paymentProcessing')}</p>
								<p className="text-xs text-amber-400">{t('gameModal.tournamentLose.paymentWait')}</p>
							</div>
						</div>
					)}
					<div className="flex flex-col gap-2.5">
						<button
							disabled={!!order.id}
							onClick={handlePlayAgain}
							className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-amber font-bold rounded-xl transition-colors text-sm tracking-wide active:scale-[0.98]"
						>
							{t('gameModal.tournamentLose.playAgain')}
						</button>
						<button
							disabled={!!order.id}
							onClick={onBackMenu}
							className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
						>
							{t('gameModal.tournamentLose.mainMenu')}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
