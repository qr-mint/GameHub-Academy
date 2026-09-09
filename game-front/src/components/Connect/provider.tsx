import { createContext } from 'react';

import { useTon } from './hooks/ton';
import { useLineKaia } from './hooks/kaia';
import { useEvm } from './hooks/evm';
import { EvmModal } from './evm';


export interface ConnectInterface {
	allDisconnect: () => void;
	ton: any,
	kaia: any;
	evm: any;
}

export const ConnectContext = createContext<ConnectInterface>({} as ConnectInterface);

interface ConnectProviderProps {
	children: any;
}

export const ConnectProvider = ({ children }: ConnectProviderProps) => {
	const ton = useTon();
	const kaia = useLineKaia();
	const evm = useEvm();

	const allDisconnect = () => {
		if (ton.connected) {
			ton.disconnect();
		}
		if (kaia.connected) {
			kaia.disconnect();
		}
		if (evm.connected) {
			evm.disconnect();
		}
	};

	const value: ConnectInterface = {
		ton,
		kaia,
		evm,
		allDisconnect
	};
	return (
		<ConnectContext.Provider value={value}>
			<>
				{evm.modal && <EvmModal onClose={() => evm.close()} />}
				{children}
			</>
		</ConnectContext.Provider>
	);
};
