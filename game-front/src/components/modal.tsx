import { Portal } from './Portal';

export function Modal ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
	if (!isOpen) return null;

	return (
		<Portal>
			<div
				onPointerDown={(e) => {
					console.log('REACT TARGET:', e.target);
					e.stopPropagation();
				}}
				className="fixed inset-0 z-999 flex items-center justify-center p-4">
				<div 
					className="absolute inset-0 bg-black/60 backdrop-blur-sm"
					onClick={onClose}
				/>
				<div className="relative w-full max-w-md">
					{children}
				</div>
			</div>
		</Portal>
	);
}