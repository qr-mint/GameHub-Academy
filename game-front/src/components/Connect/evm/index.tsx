import { useContext, useEffect } from 'react';

import { Modal } from '@/components/modal';
import { ConnectContext } from '../provider';
import { networks, chainIds } from '../hooks/evm';
import { Loading } from '@/components/Loading';
import { X } from 'lucide-react';

interface EvmModalProps {
	onClose: () => void;
}
export const EvmModal = ({ onClose }: EvmModalProps) => {
	const { evm } = useContext(ConnectContext);
	const isCorrect = evm.connected && chainIds[evm.chain?.id] === evm.network;
	useEffect(() => {
		if (isCorrect) {
			evm.signAndConnect()
				.then(() => {
					onClose();
				})
				.catch(() => {
					evm.disconnect();
				});
		}
	}, [ evm.chain?.id, evm.connected ]);

	const handleClose = () => {
		if (isCorrect) {
			onClose();
		}
	};

	const _render = () => {
		const chainId = networks[evm.network]?.code;
		if (evm.connected && chainId !== evm.chain?.id) {
			return (
				<div className="flex flex-col items-center">
					<button
						className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded-xl w-64 cursor-pointer"
						onClick={() => evm.switchChain(chainId)}
					>
            Switch on {evm.network.toUpperCase()}
					</button>
				</div>
			);
		} else if (evm.connected) {
			return (
				<div className="flex flex-col items-center">
					<Loading />
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center space-y-4">
				{evm.list
					.filter((connector: any) => connector.name !== 'Injected')
					.map((connector: any) => (
						<button
							key={connector.id}
							onClick={() => evm.connect({ connector })}
							disabled={connector.ready}
							className="btn flex text-center justify-center items-center appearance-none py-1 focus:outline-none cursor-pointer select-none overflow-hidden z-10 w-full relative uppercase duration-100 font-semibold px-2 rounded dark:text-white"
						>
							{connector.name}
						</button>
					))}
			</div>
		);
	};
  
	return (
		<Modal isOpen={true} onClose={handleClose}>
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white/20 rounded-2xl p-6">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center"
				>
					<X className="w-5 h-5 text-white" />
				</button>
				{_render()}
			</div>
		</Modal>
	);
};
