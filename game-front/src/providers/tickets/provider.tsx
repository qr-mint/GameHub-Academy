import { createContext, useContext, useState } from 'react';
import type { FunctionComponent } from 'react';
import { toast } from 'react-toastify';

import type { ITicket, TicketProviderProps } from './types';
import { RefillTicketsModal } from '@/components/RefillTicketsModal';
import { ConnectContext } from '@/components/Connect/provider';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/store/game';
import { PaymentProccesing } from '@/components/PaymentProccesing';
import { ShowPromiseResult } from '@adsgram/common/dist/types/adsgram';
import { useAdsgram } from '@adsgram/react';

const blockId = import.meta.env.VITE_BLOCK_ID;

export const TicketContext = createContext<ITicket>({} as ITicket);
export const TicketProvider: FunctionComponent<TicketProviderProps> = ({
	children,
}) => {
	const adsgram = useAdsgram({ blockId });
	
	const { data, loadGameData } = useGameStore();
	const [ showRefillModal, setShowRefillModal ] = useState(false);
	const { t } = useTranslation();
	const connectors = useContext(ConnectContext);
	const [ order, setOrder ] = useState<any>({});

	const handleOrderConfirmed = async () => {
		try {
			setOrder({});
			await loadGameData();
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

	const handleBuyTickets = async (ticket: any) => {
		if (!connectors.ton.connected) {
			await connectors.ton.connect();
			return;
		}
		try {
			const data = await connectors.ton.sendTransaction({
				token: 'ton',
				type: 'buy_ticket',
				network: 'ton',
				address_from: connectors.ton.address,
				ticket_id: ticket.id
			});
			
			setOrder({
				game_order_id: data.gameTransaction.id,
				order_id: data.data.order_id,
				type: 'buy_ticket'
			});
		} catch (err) {
			toast.error((err as any).message);
		}
	};
	const handleWatchAd = () => {
		adsgram.show()
			.then((result: ShowPromiseResult) => {
				console.log(result);
			}).catch((result: ShowPromiseResult) => {
				console.log(result);
			});
	};
	
	const openRefillTickets = () => {
		setShowRefillModal(true);
	};

	return (
		<TicketContext.Provider value={{ showRefillModal, openRefillTickets }}>
			{children}
			<RefillTicketsModal
				t={t}
				isOpen={showRefillModal} 
				onClose={() => setShowRefillModal(false)}
				onWatchAd={handleWatchAd}
				onBuyTickets={handleBuyTickets}
				currentTickets={data?.tickets}
			/>
			{order.game_order_id && <PaymentProccesing t={t} />}
		</TicketContext.Provider>
	);
};
