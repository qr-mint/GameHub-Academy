import { Clock, Ticket, X, AlertTriangle } from 'lucide-react';

import { Modal } from '../modal';
import { useTicket } from '@/providers/tickets';

interface ModalProps {
  onClose: () => void;
  data: any,
  onBackMenu: () => void;
  t: (key: string, options?: any) => string;
};

export const NoTicketsModal = ({ onClose, data, onBackMenu, t }: ModalProps) => {
	const { openRefillTickets } = useTicket();
  
	return (
		<Modal isOpen={true} onClose={onClose}>
			<div className="bg-white/95 backdrop-blur-xl border-2 border-amber-300 shadow-2xl rounded-2xl">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
								<Ticket className="w-5 h-5 text-amber-700" />
							</div>
							<div>
								<h2 className="text-2xl font-bold text-amber-900">{t('gameModal.noTickets.title')}</h2>
								<span className="text-xs text-amber-400">{t('gameModal.noTickets.subtitle')}</span>
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

					{/* Alert card */}
					<div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
							<div>
								<p className="text-sm text-amber-800 mb-1" dangerouslySetInnerHTML={{ __html: t('gameModal.noTickets.ticketsCount', { tickets_count: 0 }) }}>
                  
								</p>
								<p className="text-xs text-amber-400">
									{t('gameModal.noTickets.advice')}
								</p>
							</div>
						</div>
					</div>

					{/* Timer */}
					{data.next_free_ticket && (
						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-center gap-3">
							<Clock className="w-4 h-4 text-amber-500" />
							<div>
								<p className="text-xs text-amber-400">{t('gameModal.noTickets.nextTicket')}</p>
								<p className="text-sm font-bold text-amber-900 font-mono">{data.next_free_ticket}</p>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col gap-2.5">
						<button
							onClick={openRefillTickets}
							className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-amber font-bold rounded-xl transition-colors text-sm tracking-wide active:scale-[0.98]"
						>
							{t('gameModal.noTickets.buyTickets')}
						</button>
						<button
							onClick={onBackMenu}
							className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-xl transition-colors text-sm active:scale-[0.98]"
						>
							{t('gameModal.noTickets.mainMenu')}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};