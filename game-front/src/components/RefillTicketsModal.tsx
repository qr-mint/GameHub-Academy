import { useEffect, useState } from 'react';
import { Ticket, X, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTickets } from '@/api/payments';
import { Modal } from './modal';

export function RefillTicketsModal ({ 
	isOpen, 
	onClose, 
	onWatchAd, 
	onBuyTickets,
	currentTickets,
	t
}: {
  isOpen: boolean
  onClose: () => void
  onWatchAd: () => void
  onBuyTickets: (amount: number) => void
  currentTickets: number,
  t: (key: string, options?: any) => string
}) {
	const [ tickets, setTickets ] = useState();
	useEffect(() => {
		const loadTickets = async () => {
			try {
				const tickets = await getTickets();
				setTickets(tickets);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadTickets();
	}, []);
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white/20 text-white rounded-2xl">
				<div className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-bold text-white">
							{currentTickets === 0 ? t('refillTickets.noMoreTicketes') : t('refillTickets.topUpTickets')}
						</h2>
						<button
							onClick={onClose}
							className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
						>
							<X className="w-5 h-5 text-white" />
						</button>
					</div>
          
					<div className="flex flex-col gap-4">
						{currentTickets === 0 && (
							<p className="text-center text-white-100 text-balance">
								{t('refillTickets.warning')}
							</p>
						)}
            
						<div className="flex items-center justify-center gap-2 py-4">
							<Ticket className="w-12 h-12 text-blue-300" />
							<span className="text-4xl font-bold">{currentTickets}</span>
						</div>

						<div className="space-y-3">
							<button
								onClick={onWatchAd}
								className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
							>
								<Play className="w-5 h-5" />
								<div className="text-left">
									<div className="text-lg">{t('refillTickets.watchAds')}</div>
									<div className="text-sm opacity-90">{t('refillTickets.freeTicktes', { amount: 3 })}</div>
								</div>
							</button>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-white/20"></div>
								</div>
								<div className="relative flex justify-center text-xs">
									<span className="bg-amber-700 px-2 text-white-200">{t('or')}</span>
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-center text-white-200 text-sm font-semibold">{t('refillTickets.buyTicketes')}</p>
								{tickets?.map((ticket) => (
									<button
										key={ticket.id}
										onClick={() => onBuyTickets(ticket)}
										className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<Ticket className="w-5 h-5 text-blue-300" />
											<span>{t('refillTickets.tickets', { quantity: ticket.tickets })}</span>
										</div>
										<span className="text-yellow-300">{ticket.price} TON</span>
									</button>
								))}

							</div>
						</div>

						<button
							onClick={onClose}
							className="mt-2 text-white hover:bg-white/10 py-2 rounded-lg transition-colors"
						>
							{t('refillTickets.cancel')}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
}