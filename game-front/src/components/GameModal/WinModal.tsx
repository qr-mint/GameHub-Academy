import { useEffect, useState } from 'react';
import { Clock, Skull, Star, Trophy, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Modal } from '../modal';
import { EventBus } from '@/game/EventBus';
import { formatTime } from '@/utils/date';

interface ModalProps {
  onClose: () => void;
  data: any,
  onBackMenu: () => void;
  t: (key: string) => string;
};

export const WinModal = ({ onClose, data, onBackMenu, t }: ModalProps) => {
	const [ stats, setStats ] = useState<any>();
	const navigate = useNavigate();

	useEffect(() => {
		const loadStats = async () => {
			try { 
				setStats({});
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (!stats) {
			loadStats();
		}
	}, []);

	const handleNext = () => {
		navigate('/game');
		EventBus.emit('level:next');
		onClose();
	};

	const handleRepeat = () => {
		EventBus.emit('level:replay');
		onClose();
	};

	const handleClose = () => {
		navigate('/');
		onClose();
	};

	return (
		<Modal isOpen={true} onClose={handleClose}>
			<div className="bg-white/95 backdrop-blur-xl border-2 border-amber-300 shadow-2xl rounded-2xl">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
								<Trophy className="w-5 h-5 text-amber-700" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-amber-900">{t('gameModal.win.title')}</h2>
								{data.is_new_record && (
									<span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
										<Star className="w-3 h-3" />
										{t('gameModal.win.record')}
									</span>
								)}
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

					{/* Stats grid */}
					<div className="grid grid-cols-3 gap-3 mb-5">
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
							<Clock className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
							<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.win.time')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">{formatTime(data.current_time)}</p>
						</div>
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
							<Zap className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
							<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.win.best')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">{formatTime(stats?.best_time)}</p>
						</div>
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
							<Skull className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
							<p className="text-xs text-amber-400 mb-0.5">{t('gameModal.win.deaths')}</p>
							<p className="text-sm font-bold text-amber-900 font-mono">{data.deaths}</p>
						</div>
					</div>

					{/* Reward */}
					{data.reward && (
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-center gap-3">
							<div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
								<Star className="w-4 h-4 text-amber-600" />
							</div>
							<div>
								<p className="text-xs text-amber-500">{t('gameModal.win.reward')}</p>
								<p className="text-sm font-semibold text-amber-700">{data.reward}</p>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col gap-2.5">
						<button
							onClick={handleNext}
							className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-amber font-bold rounded-xl transition-colors text-sm tracking-wide active:scale-[0.98]"
						>
							{t('gameModal.win.buttons.nextLevel')}
						</button>
						<div className="grid grid-cols-2 gap-2.5">
							<button
								onClick={handleRepeat}
								className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
							>
								{t('gameModal.win.buttons.replay')}
							</button>
							<button
								onClick={onBackMenu}
								className="py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
							>
								{t('gameModal.win.buttons.menu')}
							</button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};
